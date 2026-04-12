import { NextRequest } from 'next/server';
import { classifyIntent } from '@/lib/autopilot/classifier';
import { executeTask } from '@/lib/autopilot/router';
import { transformOutput } from '@/lib/autopilot/transformer';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, agentId, heroId } = body;
    const lastMessage = messages[messages.length - 1]?.content || '';

    // 1. Phase 1: Classification
    const classification = await classifyIntent(lastMessage, { agentId: agentId || '', agentRole: heroId || '' });

    // Handle Image generation synchronously (no streaming)
    if (classification.route === 'dalle_api') {
       const executionResult = await executeTask(classification, lastMessage);
       const rendered_output = transformOutput(executionResult);

       const supabase = await createClient();
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
         const supabaseAdmin = createSupabaseClient(
           process.env.NEXT_PUBLIC_SUPABASE_URL!,
           process.env.SUPABASE_SERVICE_ROLE_KEY!
         );
         const { data: profile } = await supabaseAdmin
           .from('profiles')
           .select('credits')
           .eq('id', user.id)
           .single();
         if (profile) {
           await supabaseAdmin
             .from('profiles')
             .update({ credits: Math.max(0, profile.credits - 26) })
             .eq('id', user.id);
         }
       }

       return new Response(JSON.stringify({ classification, rendered_output }), {
         headers: { 'Content-Type': 'application/json' }
       });
    }

    // 2. Phase 2: Streaming execution
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Immediately send classification to client
          const classificationEvent = `data: ${JSON.stringify({ type: 'classification', data: classification })}\n\n`;
          controller.enqueue(encoder.encode(classificationEvent));

          // Set up model based on fallback logic if needed
          const modelId = classification.model_id;
          let systemPrompt = '';
          switch (classification.task_type) {
            case 'website':
              systemPrompt = "You are an expert front-end developer. Output ONLY a complete self-contained HTML file with embedded CSS and JS. No markdown, no explanation, no code fences. Start directly with <!DOCTYPE html>.";
              break;
            case 'document':
              systemPrompt = "You are an expert business writer. Structure output with H2 headers, paragraphs, and bullet points. Use bold for key terms. No em-dashes. Output clean Markdown.";
              break;
            case 'code':
              systemPrompt = "You are an expert software engineer. Output ONLY the code. Use inline comments for non-obvious logic. No preamble, no explanation outside comments.";
              break;
            case 'text':
            default:
              systemPrompt = "You are a helpful expert assistant. Answer clearly and concisely.";
              break;
          }

          async function fetchStream(modelToUse: string, isRetry = false): Promise<void> {
             const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: modelToUse,
                  stream: true,
                  messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
                  ]
                })
              });

              if (!response.ok) {
                 if (!isRetry) {
                   console.log(`Model ${modelToUse} failed, falling back to openai/gpt-4o`);
                   return fetchStream('openai/gpt-4o', true);
                 } else {
                   throw new Error(`OpenRouter Streaming API error: ${response.status}`);
                 }
              }

              if (!response.body) throw new Error("No response body");

              const reader = response.body.getReader();
              const decoder = new TextDecoder();

              let fullContent = '';

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                  if (line.includes('[DONE]')) continue;
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      const delta = data.choices[0]?.delta?.content || '';
                      if (delta) {
                         fullContent += delta;
                         // Stream the text delta to client
                         controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text_delta', content: delta })}\n\n`));
                      }
                    } catch (e) {
                      // ignore parse errors on partial chunks
                    }
                  }
                }
              }

              // Finalize full content for any post-processing if needed
              const finalRendered = transformOutput({ output_format: classification.output_format, content: fullContent });
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'final_render', rendered_output: finalRendered })}\n\n`));
          }

          await fetchStream(modelId);

          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const supabaseAdmin = createSupabaseClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('credits')
              .eq('id', user.id)
              .single();
            if (profile) {
              await supabaseAdmin
                .from('profiles')
                .update({ credits: Math.max(0, profile.credits - 26) })
                .eq('id', user.id);
            }
          }

        } catch (error) {
           console.error('Streaming execution error:', error);
           controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(error) })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AutoPilot API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
