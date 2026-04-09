const fs = require('fs');

let code = fs.readFileSync('src/app/chat/[hero]/chat-client.tsx', 'utf8');

code = code.replace(/setMessages\(prev => prev.map\(m => m.id === assistantMessageId \? { ...m, rendered_output: renderedOutput, content: fullContent \|\| " " } : m\)\);/, 'setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, rendered_output: renderedOutput || undefined, content: fullContent || " " } : m));');

fs.writeFileSync('src/app/chat/[hero]/chat-client.tsx', code);
