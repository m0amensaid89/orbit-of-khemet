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
            content: `You are an intent classification engine for an AI platform. Read the user message and return ONLY a JSON object. No explanation. No markdown. No preamble. Just JSON.

Rules:
- Webpage / landing page / website / UI / dashboard / HTML component → task_type: "website", output_format: "html_preview"
- Marketing plan / business plan / strategy / report / proposal / guide / playbook / email sequence / SOP → task_type: "document", output_format: "document_view"
- Code / script / function / automation / debug / refactor → task_type: "code", output_format: "code_block"
- Image / logo / banner / poster / graphic / illustration → task_type: "image", output_format: "image_card"
- Anything else → task_type: "text", output_format: "text_message"

Return this exact structure:
{
  "task_type": "website" | "document" | "code" | "image" | "text",
  "output_format": "html_preview" | "document_view" | "code_block" | "image_card" | "text_message",
  "model_id": string,
  "route": "openrouter" | "dalle_api",
  "credit_cost": number,
  "complexity": "low" | "medium" | "high"
}

Model selection:
- website → model_id: "anthropic/claude-sonnet-4-6", credit_cost: 40
- document → model_id: "anthropic/claude-sonnet-4-6", credit_cost: 25
- code → model_id: "qwen/qwen3-coder-480b-a35b:free", credit_cost: 15
- image → model_id: "dall-e-3", route: "dalle_api", credit_cost: 60
- text → model_id: "deepseek/deepseek-v3", credit_cost: 8`,
          },
          {
            role: 'user',
            content: `User message: ${message}\n\nAgent Context: ${JSON.stringify(agentContext)}`,
          },
        ],
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
