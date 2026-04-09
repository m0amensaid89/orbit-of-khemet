const fs = require('fs');

let code = fs.readFileSync('src/app/chat/[hero]/chat-client.tsx', 'utf8');

// 1. Add imports
code = code.replace(/import Image from "next\/image";/, 'import Image from "next/image";\nimport ReactMarkdown from "react-markdown";\nimport remarkGfm from "remark-gfm";');

// 2. Fix the render block
code = code.replace(/case 'text': return output\.content;/, "case 'text': return <ReactMarkdown remarkPlugins={[remarkGfm]} className=\"prose prose-invert max-w-none text-sm prose-headings:font-['Cinzel_Decorative'] prose-headings:text-[#D4AF37] prose-a:text-[#06b6d4]\">{output.content}</ReactMarkdown>;");

// 3. Fix the default cleanContent fallback (if any)
code = code.replace(/return cleanContent;/, "return <ReactMarkdown remarkPlugins={[remarkGfm]} className=\"prose prose-invert max-w-none text-sm prose-headings:font-['Cinzel_Decorative'] prose-headings:text-[#D4AF37] prose-a:text-[#06b6d4]\">{cleanContent}</ReactMarkdown>;");


fs.writeFileSync('src/app/chat/[hero]/chat-client.tsx', code);
