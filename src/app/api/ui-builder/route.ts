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

const UI_SYSTEM_PROMPT = `You are an elite UI engineer. Build complete, stunning, production-ready HTML files.

MANDATORY RULES:
1. Output ONE complete HTML file — all CSS and JS inline, starting with <!DOCTYPE html>
2. Use CSS custom properties for all colors/spacing
3. Include smooth scroll, hover transitions, fade-in animations
4. Mobile-first responsive (CSS Grid + Flexbox)
5. Multiple sections: navigation, hero, features/content, CTA, footer
6. Use real, relevant placeholder content (not Lorem Ipsum)
7. Add interactive elements: tabs, accordions, modals, tooltips where appropriate
8. Professional micro-interactions on all buttons and links
9. Output ONLY the HTML — no markdown, no explanations, no code fences
10. Make it deployable and immediately usable`;

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { description, style, complexity, components } = await req.json();
    if (!description) return Response.json({ error: 'Missing description' }, { status: 400 });

    const styleGuide = style === 'dark'
      ? 'Use dark theme with deep blacks, gold accents, and neon glows.'
      : style === 'minimal'
      ? 'Use clean minimal design with white space, subtle shadows, and muted colors.'
      : style === 'corporate'
      ? 'Use professional corporate design with blues, clean typography, and structured layouts.'
      : style === 'creative'
      ? 'Use bold creative design with vibrant colors, large typography, and dynamic layouts.'
      : 'Use modern design with excellent UX and visual hierarchy.';

    const complexityGuide = complexity === 'simple'
      ? 'Keep it simple: one page, essential features only.'
      : complexity === 'advanced'
      ? 'Make it feature-rich with multiple sections, animations, and interactive elements.'
      : 'Balance simplicity and features: clean but functional.';

    const componentGuide = components?.length
      ? `Include these specific components: ${components.join(', ')}.`
      : '';

    const prompt = `Create a complete HTML UI for: ${description}
Style: ${styleGuide}
Complexity: ${complexityGuide}
${componentGuide}
Output ONLY the complete HTML file starting with <!DOCTYPE html>. No explanations.`;

    const { text } = await generateText({
      model: openrouter('anthropic/claude-sonnet-4-5'),
      system: UI_SYSTEM_PROMPT,
      prompt,
      maxTokens: 8000,
    });

    // Clean up any accidental markdown wrapping
    const html = text
      .replace(/^```html\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    return Response.json({ html, description });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
