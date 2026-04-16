export type RenderedOutput =
  | { type: 'html'; html: string }
  | { type: 'document'; markdown: string }
  | { type: 'code'; code: string; language: string }
  | { type: 'image'; urls: string[] }
  | { type: 'text'; content: string };

export function transformOutput(result: { output_format: string; content: string }): RenderedOutput {
  const { output_format, content } = result;

  switch (output_format) {
    case 'html_preview':
      return { type: 'html', html: content };
    case 'document_view':
      return { type: 'document', markdown: content };
    case 'code_block': {
      let code = content;
      let language = 'typescript'; // default fallback

      // Try to extract language from markdown code fences if present
      if (code.startsWith('\`\`\`')) {
        const firstLineEnd = code.indexOf('\n');
        if (firstLineEnd !== -1) {
          const firstLine = code.substring(0, firstLineEnd);
          const maybeLang = firstLine.replace(/\`/g, '').trim();
          if (maybeLang) {
            language = maybeLang;
          }
          code = code.substring(firstLineEnd + 1);
          if (code.endsWith('\`\`\`')) {
            code = code.substring(0, code.length - 3);
          } else if (code.endsWith('\`\`\`\n')) {
             code = code.substring(0, code.length - 4);
          }
        }
      }

      return { type: 'code', code: code.trim(), language };
    }
    case 'image_card': {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return { type: 'image', urls: parsed };
        }
      } catch (e) {
        // Fallback to single string or regex parsing if it's markdown
      }

      const imgMatches = Array.from(content.matchAll(/!\[.*?\]\((https?:\/\/[^)]+|data:image\/[^)]+)\)/g));
      if (imgMatches.length > 0) {
        return { type: 'image', urls: imgMatches.map(m => m[1]) };
      }

      return { type: 'image', urls: [content] };
    }
    case 'text_message':
    default:
      return { type: 'text', content };
  }
}
