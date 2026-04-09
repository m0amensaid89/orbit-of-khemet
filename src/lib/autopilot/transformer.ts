export type RenderedOutput =
  | { type: 'html'; content: string }
  | { type: 'document'; markdown: string }
  | { type: 'code'; code: string; language: string }
  | { type: 'image'; url: string }
  | { type: 'text'; content: string };

export function transformOutput(result: { output_format: string; content: string }): RenderedOutput {
  const { output_format, content } = result;

  switch (output_format) {
    case 'html_preview': {
      let htmlContent = content;
      // Strip markdown code fences if AI ignored prompt constraints
      if (htmlContent.startsWith('```')) {
         const firstLineEnd = htmlContent.indexOf('\n');
         if (firstLineEnd !== -1) {
            htmlContent = htmlContent.substring(firstLineEnd + 1);
            if (htmlContent.endsWith('```')) {
               htmlContent = htmlContent.substring(0, htmlContent.length - 3);
            } else if (htmlContent.endsWith('```\n')) {
               htmlContent = htmlContent.substring(0, htmlContent.length - 4);
            }
         }
      }
      return { type: 'html', content: htmlContent.trim() };
    }
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
    case 'image_card':
      return { type: 'image', url: content };
    case 'text_message':
    default:
      return { type: 'text', content };
  }
}
