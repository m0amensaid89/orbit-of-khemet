const fs = require('fs');

let code = fs.readFileSync('src/app/chat/[hero]/chat-client.tsx', 'utf8');

code = code.replace(/<ReactMarkdown remarkPlugins={\[remarkGfm\]} className="[^"]+">\{output\.content\}<\/ReactMarkdown>/g, '<div className="prose prose-invert max-w-none text-sm prose-headings:font-[\'Cinzel_Decorative\'] prose-headings:text-[#D4AF37] prose-a:text-[#06b6d4]"><ReactMarkdown remarkPlugins={[remarkGfm]}>{output.content}</ReactMarkdown></div>');

code = code.replace(/<ReactMarkdown remarkPlugins={\[remarkGfm\]} className="[^"]+">\{cleanContent\}<\/ReactMarkdown>/g, '<div className="prose prose-invert max-w-none text-sm prose-headings:font-[\'Cinzel_Decorative\'] prose-headings:text-[#D4AF37] prose-a:text-[#06b6d4]"><ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanContent}</ReactMarkdown></div>');

fs.writeFileSync('src/app/chat/[hero]/chat-client.tsx', code);
