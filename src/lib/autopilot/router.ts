import { ClassificationResult } from './classifier';

export async function executeTask(
  classification: ClassificationResult,
  userMessage: string
): Promise<{ output_format: string; content: string; metadata: object }> {

  if (classification.route === 'openrouter') {
    return await executeOpenRouterTask(classification, userMessage);
  } else if (classification.route === 'dalle_api') {
    return await executeDalleTask(userMessage);
  }

  // Fallback for unexpected route
  return {
    output_format: 'text_message',
    content: 'Error: Unknown route specified.',
    metadata: { error: 'Unknown route' },
  };
}

async function executeOpenRouterTask(
  classification: ClassificationResult,
  userMessage: string,
  isRetry: boolean = false
): Promise<{ output_format: string; content: string; metadata: object }> {

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

  const modelId = isRetry ? 'openai/gpt-4o' : classification.model_id;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} — ${errText}`);
    }

    const data = await response.json();

    if (!data?.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('[ROUTER] Unexpected OpenRouter response structure:', JSON.stringify(data));
      throw new Error('OpenRouter returned unexpected response structure');
    }

    return {
      output_format: classification.output_format,
      content: data.choices[0].message.content,
      metadata: { model_used: modelId, is_retry: isRetry }
    };
  } catch (error) {
    console.error(`Execution failed for model ${modelId}:`, error);

    // Explicit manual fallback for OpenRouter tasks if not already retrying
    if (!isRetry) {
      console.log(`Initiating fallback to openai/gpt-4o for task type: ${classification.task_type}`);
      return await executeOpenRouterTask(classification, userMessage, true);
    }

    return {
      output_format: 'text_message',
      content: `Error executing task: ${error instanceof Error ? error.message : String(error)}`,
      metadata: { error: String(error), model_failed: modelId }
    };
  }
}

async function executeDalleTask(
  userMessage: string
): Promise<{ output_format: string; content: string; metadata: object }> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: userMessage,
        n: 1,
        size: "1024x1024"
      })
    });

    if (!response.ok) {
       const errData = await response.json().catch(() => ({}));
       throw new Error(`DALL-E API error: ${response.status} ${response.statusText} - ${JSON.stringify(errData)}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    return {
      output_format: 'image_card',
      content: imageUrl,
      metadata: { model_used: "dall-e-3" }
    };
  } catch (error) {
     console.error("DALL-E execution failed:", error);
     return {
      output_format: 'text_message',
      content: `Failed to generate image: ${error instanceof Error ? error.message : String(error)}`,
      metadata: { error: String(error), model_failed: "dall-e-3" }
    };
  }
}
