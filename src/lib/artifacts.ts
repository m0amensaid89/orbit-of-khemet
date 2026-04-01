export type ArtifactType = 'html' | 'react' | 'csv' | 'json' | 'markdown' | 'code' | null;

export interface Artifact {
  type: ArtifactType;
  content: string;
  language?: string;
  title?: string;
}

export function detectArtifact(content: string): Artifact | null {
  // Match fenced code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const matches = [...content.matchAll(codeBlockRegex)];

  if (matches.length === 0) return null;

  // Find the largest/most significant code block
  const best = matches.reduce((a, b) =>
    (b[2]?.length || 0) > (a[2]?.length || 0) ? b : a
  );

  const lang = best[1]?.toLowerCase() || '';
  const code = best[2]?.trim() || '';

  if (!code || code.length < 50) return null;

  if (lang === 'html' || code.includes('<!DOCTYPE') || code.includes('<html')) {
    return { type: 'html', content: code, language: 'html', title: 'HTML App' };
  }
  if (lang === 'jsx' || lang === 'tsx' || lang === 'react') {
    return { type: 'react', content: code, language: lang, title: 'React Component' };
  }
  if (lang === 'csv') {
    return { type: 'csv', content: code, language: 'csv', title: 'Spreadsheet Data' };
  }
  if (lang === 'json') {
    return { type: 'json', content: code, language: 'json', title: 'JSON Data' };
  }
  if (lang === 'markdown' || lang === 'md') {
    return { type: 'markdown', content: code, language: 'markdown', title: 'Document' };
  }
  if (code.length > 200) {
    return { type: 'code', content: code, language: lang || 'text', title: 'Code' };
  }

  return null;
}

export function extractTitle(content: string, artifact: Artifact): string {
  // Try to extract a title from the message content
  const lines = content.split('\n').slice(0, 5);
  for (const line of lines) {
    const cleaned = line.replace(/[#*`]/g, '').trim();
    if (cleaned.length > 5 && cleaned.length < 60 && !cleaned.includes('{')) {
      return cleaned;
    }
  }
  return artifact.title || 'Artifact';
}
