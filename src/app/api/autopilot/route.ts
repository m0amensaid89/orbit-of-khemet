import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://orbit-of-khemet.vercel.app',
    'X-Title': 'Orbit of Khemet -- Empire Engine',
  },
});

async function planSteps(goal: string): Promise<string[]> {
  const { text } = await generateText({
    model: openrouter('google/gemini-2.5-flash'),
    prompt: `You are a task planner. Break this goal into 3-5 concrete, actionable steps that can each be completed by an AI agent in sequence.

Goal: ${goal}

Return ONLY a JSON array of step strings. Example: ["Research the topic", "Write an outline", "Draft the content"]
Return nothing else: just the JSON array.`,
    maxTokens: 500,
  });

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const steps = JSON.parse(cleaned);
    if (Array.isArray(steps)) return steps.slice(0, 5);
  } catch {}

  return [
    'Analyze the goal and gather context',
    'Research and plan the approach',
    'Execute the primary task',
    'Review and refine the output',
    'Deliver the final result',
  ];
}

function selectStepModel(step: string): string {
  const lower = step.toLowerCase();
  if (['code','implement','build','script','debug','function'].some(s => lower.includes(s)))
    return 'anthropic/claude-sonnet-4-5'; // coding
  if (['research','analyze','strategy','data','assess','evaluate'].some(s => lower.includes(s)))
    return 'openai/gpt-4o:online'; // analysis + web
  if (['write','draft','content','copy','blog','email','headline'].some(s => lower.includes(s)))
    return 'google/gemini-2.5-flash'; // creative
  if (['plan','design','architect','structure','outline','organize'].some(s => lower.includes(s)))
    return 'xiaomi/mimo-v2-flash'; // reasoning/planning
  return 'openai/gpt-4o'; // general
}

async function executeStep(
  step: string,
  goal: string,
  previousResults: string[],
  heroSystemPrompt: string
): Promise<string> {
  const context = previousResults.length > 0
    ? `\n\nPrevious steps completed:\n${previousResults.map((r, i) => `Step ${i + 1}: ${r.slice(0, 300)}...`).join('\n')}`
    : '';

  const { text } = await generateText({
    model: openrouter(selectStepModel(step)),
    system: heroSystemPrompt,
    prompt: `Overall goal: ${goal}${context}\n\nCurrent task: ${step}\n\nComplete this specific task thoroughly. Be concrete and actionable.`,
    maxTokens: 2000,
  });

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { goal } = await req.json();
    if (!goal) return Response.json({ error: 'Missing goal' }, { status: 400 });

    const heroSystemPrompt = `You are an elite AI agent operating within the Orbit of Khemet Empire Engine. You execute tasks with precision, delivering high-quality, actionable results. Be thorough, specific, and professional.`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send planning phase
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'planning', message: 'Analyzing goal and planning steps...' })}\n\n`
          ));

          const steps = await planSteps(goal);

          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'steps', steps })}\n\n`
          ));

          const results: string[] = [];

          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'step_start', stepIndex: i, step })}\n\n`
            ));

            const result = await executeStep(step, goal, results, heroSystemPrompt);
            results.push(result);

            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'step_complete', stepIndex: i, step, result, model: selectStepModel(step) })}\n\n`
            ));
          }

          // Final synthesis
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'synthesizing', message: 'Synthesizing final deliverable...' })}\n\n`
          ));

          const { text: finalResult } = await generateText({
            model: openrouter('anthropic/claude-sonnet-4-5'),
            system: heroSystemPrompt,
            prompt: `Goal: ${goal}\n\nCompleted steps and results:\n${results.map((r, i) => `STEP ${i + 1}: ${steps[i]}\n${r}`).join('\n\n---\n\n')}\n\nSynthesize all the above into a single comprehensive, well-structured final deliverable. This should be the complete answer to the original goal.`,
            maxTokens: 4000,
          });

          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'complete', result: finalResult })}\n\n`
          ));

          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' })}\n\n`
          ));
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}