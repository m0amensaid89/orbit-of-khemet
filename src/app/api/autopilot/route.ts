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

type OutputType = 'word' | 'pdf' | 'powerpoint' | 'excel' | 'website' | 'image' | 'video' | 'text';

function detectOutputType(goal: string): OutputType {
  const lower = goal.toLowerCase();
  if (['website', 'web page', 'landing page', 'html', 'web app'].some(s => lower.includes(s))) return 'website';
  if (['presentation', 'powerpoint', 'pptx', 'slides', 'deck'].some(s => lower.includes(s))) return 'powerpoint';
  if (['excel', 'spreadsheet', 'xlsx', 'table', 'sheet', 'csv'].some(s => lower.includes(s))) return 'excel';
  if (['pdf', 'report', 'document', 'formal report'].some(s => lower.includes(s))) return 'pdf';
  if (['word', 'docx', '.doc', 'word document'].some(s => lower.includes(s))) return 'word';
  if (['image', 'poster', 'banner', 'logo', 'illustration', 'infographic', 'visual'].some(s => lower.includes(s))) return 'image';
  if (['video', 'animation', 'reel', 'clip'].some(s => lower.includes(s))) return 'video';
  return 'text'; // default — rich markdown
}

function buildSynthesisPrompt(goal: string, steps: string[], results: string[], outputType: OutputType): string {
  const context = results.map((r, i) => `STEP ${i + 1}: ${steps[i]}\n${r}`).join('\n\n---\n\n');
  const base = `Goal: ${goal}\n\nCompleted steps:\n${context}\n\n`;

  switch (outputType) {
    case 'website':
      return base + `Synthesize all research and content above into ONE complete, production-ready HTML file.
Requirements:
- Start with <!DOCTYPE html> — all CSS and JS inline
- Modern dark or light design with smooth animations
- Fully responsive mobile-first
- Multiple sections: nav, hero, features/content, CTA, footer
- Real content based on the goal (not Lorem Ipsum)
- Output ONLY the raw HTML — no markdown, no explanation, no code fences`;

    case 'powerpoint':
      return base + `Create a complete PowerPoint presentation script.
Format as structured markdown with clear slide boundaries:
## SLIDE 1: [TITLE]
**Speaker notes:** ...
Content: ...

## SLIDE 2: [SECTION]
...
Include 8-12 slides. Make it professional and presentation-ready.`;

    case 'excel':
      return base + `Create a complete spreadsheet as a CSV with headers and realistic data rows.
Format: pure CSV starting on line 1 (no explanation, no markdown).
Include relevant formulas as text in a separate "Formulas" section after the CSV.`;

    case 'pdf':
    case 'word':
      return base + `Write a complete, professional ${outputType === 'pdf' ? 'PDF report' : 'Word document'}.
Use proper markdown structure: # H1, ## H2, ### H3, **bold**, bullet points.
Include: Executive Summary, all major sections, Conclusion, and Recommendations.
Be thorough — this should be a complete, ready-to-use document.`;

    case 'image':
      return base + `Write a detailed, professional image generation prompt that captures everything from the research above.
Format:
PROMPT: [single detailed image prompt — 2-3 sentences describing style, content, composition, lighting]
STYLE: [e.g., photorealistic, flat illustration, 3D render]
DIMENSIONS: [e.g., 1920x1080 landscape]
Then add: CONTENT BRIEF — explain what the image should communicate (2-3 sentences).`;

    case 'video':
      return base + `Write a complete video script and storyboard.
Include: Scene-by-scene breakdown, voiceover script, visual descriptions, music/SFX notes.
Format each scene as:
SCENE [N]: [TITLE]
Duration: [X seconds]
Visual: [description]
Voiceover: [script]
`;

    default: // text
      return base + `Synthesize all the above into a single comprehensive, well-structured final deliverable.
Use clear markdown formatting with headers, bullet points, and sections.
This should be the complete, actionable answer to the original goal.`;
  }
}

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

    // Detect what the user wants to produce
    const outputType = detectOutputType(goal);

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
            `data: ${JSON.stringify({ type: 'steps', steps, outputType })}\n\n`
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
              `data: ${JSON.stringify({ type: 'step_complete', stepIndex: i, step, result })}\n\n`
            ));
          }

          // Final synthesis
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'synthesizing', message: 'Synthesizing final deliverable...' })}\n\n`
          ));

          const { text: finalResult } = await generateText({
            model: openrouter('anthropic/claude-sonnet-4-5'),
            system: heroSystemPrompt,
            prompt: buildSynthesisPrompt(goal, steps, results, outputType),
            maxTokens: outputType === 'website' ? 12000 : 4000,
          });

          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'complete', result: finalResult, outputType })}\n\n`
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