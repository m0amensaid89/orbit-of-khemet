export interface ClassificationResult {
  task_type: 'website' | 'document' | 'code' | 'image' | 'text';
  output_format: 'html_preview' | 'document_view' | 'code_block' | 'image_card' | 'text_message';
  model_id: string;
  route: 'openrouter' | 'dalle_api';
  credit_cost: number;
  complexity: 'low' | 'medium' | 'high';
}

export async function classifyIntent(
  message: string,
  agentContext: { agentId: string; agentRole: string }
): Promise<ClassificationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const defaultResult: ClassificationResult = {
    task_type: 'text',
    output_format: 'text_message',
    model_id: 'deepseek/deepseek-v3',
    route: 'openrouter',
    credit_cost: 8,
    complexity: 'low',
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3',
        messages: [
          {
            role: 'system',
            content: `You are a strict intent classification engine. Your ONLY job is to read the user message and return a JSON object. Nothing else. No explanation. No markdown. No preamble. Just raw JSON.

CLASSIFICATION RULES — apply in this exact order:

Rule 1 — WEBSITE: If the message contains ANY of these words or phrases → classify as website:
"landing page", "webpage", "web page", "website", "site", "homepage", "home page", "HTML", "frontend", "front-end", "UI", "interface", "dashboard", "portfolio", "build me a page", "create a page", "design a page", "make a page"
→ task_type: "website", output_format: "html_preview", model_id: "anthropic/claude-sonnet-4-6", route: "openrouter", credit_cost: 40, complexity: "high"

Rule 2 — IMAGE: If the message contains ANY of these → classify as image:
"generate image", "create image", "design image", "draw", "illustrate", "logo", "banner", "poster", "thumbnail", "graphic", "visual", "picture", "photo"
→ task_type: "image", output_format: "image_card", model_id: "dall-e-3", route: "dalle_api", credit_cost: 60, complexity: "high"

Rule 3 — CODE: If the message contains ANY of these → classify as code:
"write code", "write a script", "write a function", "write a class", "build a script", "create a function", "Python", "JavaScript", "TypeScript", "SQL", "debug", "refactor", "fix this code", "programming"
→ task_type: "code", output_format: "code_block", model_id: "qwen/qwen3-coder-480b-a35b:free", route: "openrouter", credit_cost: 15, complexity: "medium"

Rule 4 — DOCUMENT: If the message contains ANY of these → classify as document:
"marketing plan", "business plan", "strategy", "report", "proposal", "playbook", "guide", "framework", "roadmap", "content plan", "email sequence", "SOP", "case study", "write me a full", "write me a detailed", "write me a comprehensive"
→ task_type: "document", output_format: "document_view", model_id: "anthropic/claude-sonnet-4-6", route: "openrouter", credit_cost: 25, complexity: "medium"

Rule 5 — TEXT: Everything else
→ task_type: "text", output_format: "text_message", model_id: "anthropic/claude-sonnet-4-6", route: "openrouter", credit_cost: 8, complexity: "low"

Return this exact JSON structure and nothing else:
{
  "task_type": "website" | "document" | "code" | "image" | "text",
  "output_format": "html_preview" | "document_view" | "code_block" | "image_card" | "text_message",
  "model_id": string,
  "route": "openrouter" | "dalle_api",
  "credit_cost": number,
  "complexity": "low" | "medium" | "high"
}`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        stream: false,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return defaultResult;
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Handle potential markdown wrapping
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const parsed = JSON.parse(content);
    return parsed as ClassificationResult;
  } catch (error) {
    console.error('Classification error:', error);
    return defaultResult;
  } finally {
    clearTimeout(timeoutId);
  }
}
