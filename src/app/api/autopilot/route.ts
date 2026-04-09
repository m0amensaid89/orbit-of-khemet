export const runtime = 'edge';
export const maxDuration = 60;

import { NextRequest } from 'next/server';
import { classifyIntent } from '@/lib/autopilot/classifier';
import { executeTask } from '@/lib/autopilot/router';
import { transformOutput } from '@/lib/autopilot/transformer';

export async function POST(req: NextRequest) {
  console.log('[AUTOPILOT] Request received:', { method: req.method, timestamp: new Date().toISOString() });

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const encoder = new TextEncoder();
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error('[AUTOPILOT] Failed to parse request body', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { messages, agentId, heroId } = body;
  console.log('[AUTOPILOT] messages type:', typeof messages, 'isArray:', Array.isArray(messages), 'value:', JSON.stringify(messages));
  const lastMessage = messages?.[messages.length - 1]?.content || '';

  const stream = new ReadableStream({
    async start(controller) {
      // Step 1: Classification
      let classification;
      try {
        classification = await classifyIntent(lastMessage, { agentId: agentId || '', agentRole: heroId || '' });
        console.log('[AUTOPILOT] Classification result:', JSON.stringify(classification));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'classification', data: classification })}\n\n`));
      } catch (err) {
        console.error('[AUTOPILOT] Classification error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', step: 'classifier', message: msg })}\n\n`));
        controller.close();
        return;
      }

      // Handle Image generation synchronously (no streaming)
      if (classification.route === 'dalle_api') {
        try {
          const executionResult = await executeTask(classification, lastMessage);
          console.log('[AUTOPILOT] Router result type:', executionResult?.output_format);
          const rendered_output = transformOutput(executionResult);

          // Image does not stream tokens, but we stream the final payload to keep UI consistent
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'final_render', rendered_output })}\n\n`));
          controller.close();
          return;
        } catch (err) {
          console.error('[AUTOPILOT] Router error (DALL-E):', err);
          const msg = err instanceof Error ? err.message : String(err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', step: 'router', message: msg })}\n\n`));
          controller.close();
          return;
        }
      }

      // Step 2: Execution (Streaming)
      let fullContent = '';
      try {
        const modelId = classification.model_id;
        let systemPrompt = '';
        switch (classification.task_type) {
          case 'website': systemPrompt = "You are an expert front-end developer. Output ONLY a complete self-contained HTML file with embedded CSS and JS. No markdown, no explanation, no code fences. Start directly with <!DOCTYPE html>."; break;
          case 'document': systemPrompt = "You are an expert business writer. Structure output with H2 headers, paragraphs, and bullet points. Use bold for key terms. No em-dashes. Output clean Markdown."; break;
          case 'code': systemPrompt = "You are an expert software engineer. Output ONLY the code. Use inline comments for non-obvious logic. No preamble, no explanation outside comments."; break;
          case 'text':
          default: systemPrompt = "You are a helpful expert assistant. Answer clearly and concisely."; break;
        }

        async function fetchStream(modelToUse: string, isRetry = false): Promise<void> {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://orbit.khemet.ai',
                'X-Title': 'Orbit of Khemet',
              },
              body: JSON.stringify({
                model: modelToUse,
                messages: [
                  { role: 'system', content: systemPrompt },
                  ...(Array.isArray(messages) ? messages : []).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
                ],
                stream: true,
              }),
            });

            if (!response.ok) {
                if (!isRetry) {
                  console.log(`[AUTOPILOT] Model ${modelToUse} failed, falling back to openai/gpt-4o`);
                  return fetchStream('openai/gpt-4o', true);
                } else {
                  const errText = await response.text();
                  throw new Error(`OpenRouter API error: ${response.status} — ${errText}`);
                }
            }

            console.log('[ROUTER] Response status:', response.status);
            console.log('[ROUTER] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body from OpenRouter');

            const decoder = new TextDecoder();
            let chunkCount = 0;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              if (chunkCount < 3) {
                console.log(`[ROUTER] Raw chunk ${chunkCount}:`, JSON.stringify(chunk));
              }
              chunkCount++;

              const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

              for (const line of lines) {
                const jsonStr = line.replace('data: ', '').trim();
                if (jsonStr === '[DONE]') break;

                try {
                  const parsed = JSON.parse(jsonStr);
                  if (!parsed?.choices || !Array.isArray(parsed.choices)) {
                    continue; // Skip malformed chunks or unexpected structures
                  }

                  const delta = parsed?.choices?.[0]?.delta?.content;
                  if (delta) {
                      fullContent += delta;
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text_delta', content: delta })}\n\n`));
                  }
                } catch {
                  // skip malformed chunks
                }
              }
            }
            console.log('[ROUTER] Total chunks received:', chunkCount);
            console.log('[ROUTER] Final content length:', fullContent.length);
        }

        await fetchStream(modelId);
        console.log('[AUTOPILOT] Router result type:', classification.output_format);

      } catch (err) {
        console.error('[AUTOPILOT] Router error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', step: 'router', message: msg })}\n\n`));
        controller.close();
        return;
      }

      // Step 3: Transform
      try {
        const rendered = transformOutput({ output_format: classification.output_format, content: fullContent });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'final_render', rendered_output: rendered })}\n\n`));
        controller.close();
      } catch (err) {
        console.error('[AUTOPILOT] Transformer error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', step: 'transformer', message: msg })}\n\n`));
        controller.close();
        return;
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
