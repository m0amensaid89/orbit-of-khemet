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
  const msg = message.toLowerCase();

  // WEBSITE detection
  const websiteKeywords = [
    'landing page', 'webpage', 'web page', 'website', 'homepage',
    'home page', 'html', 'frontend', 'front-end', 'build me a page',
    'create a page', 'design a page', 'make a page', 'ui component',
    'dashboard', 'portfolio site', 'storefront'
  ];
  if (websiteKeywords.some(k => msg.includes(k))) {
    return {
      task_type: 'website',
      output_format: 'html_preview',
      model_id: 'anthropic/claude-sonnet-4-6',
      route: 'openrouter',
      credit_cost: 40,
      complexity: 'high',
    };
  }

  // IMAGE detection
  const imageKeywords = [
    'generate image', 'create image', 'design image', 'draw', 'illustrate',
    'generate a logo', 'create a logo', 'design a logo', 'make a logo',
    'banner', 'poster', 'thumbnail', 'generate a graphic', 'create a graphic',
    'create a visual', 'generate a visual', 'create an illustration'
  ];
  if (imageKeywords.some(k => msg.includes(k))) {
    return {
      task_type: 'image',
      output_format: 'image_card',
      model_id: 'dall-e-3',
      route: 'dalle_api',
      credit_cost: 60,
      complexity: 'high',
    };
  }

  // CODE detection
  const codeKeywords = [
    'write code', 'write a script', 'write a function', 'write a class',
    'create a function', 'build a script', 'python', 'javascript',
    'typescript', 'sql query', 'debug this', 'refactor', 'fix this code',
    'write me a function', 'write me a script', 'write me a class',
    'write me code', 'create me a function', 'build me a function'
  ];
  if (codeKeywords.some(k => msg.includes(k))) {
    return {
      task_type: 'code',
      output_format: 'code_block',
      model_id: 'qwen/qwen3-coder-480b-a35b:free',
      route: 'openrouter',
      credit_cost: 15,
      complexity: 'medium',
    };
  }

  // DOCUMENT detection
  const documentKeywords = [
    'marketing plan', 'business plan', 'strategy', 'strategic plan',
    'full report', 'detailed report', 'proposal', 'playbook', 'roadmap',
    'content plan', 'content strategy', 'email sequence', 'write me a full',
    'write me a detailed', 'write me a comprehensive', 'case study',
    'go to market', 'go-to-market', 'brand guidelines', 'sop', 'framework'
  ];
  if (documentKeywords.some(k => msg.includes(k))) {
    return {
      task_type: 'document',
      output_format: 'document_view',
      model_id: 'anthropic/claude-sonnet-4-6',
      route: 'openrouter',
      credit_cost: 25,
      complexity: 'medium',
    };
  }

  // DEFAULT — text
  return {
    task_type: 'text',
    output_format: 'text_message',
    model_id: 'anthropic/claude-sonnet-4-6',
    route: 'openrouter',
    credit_cost: 8,
    complexity: 'low',
  };
}
