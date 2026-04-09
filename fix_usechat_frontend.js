const fs = require('fs');

let code = fs.readFileSync('src/app/chat/[hero]/chat-client.tsx', 'utf8');

// 1. Remove useChat import
code = code.replace(/import { useChat, Message } from "@ai-sdk\/react";/, '');
code = code.replace(/type CustomMessage = Message & { rendered_output\?: RenderedOutput };/, 'type CustomMessage = { id: string; role: "user" | "assistant"; content: string; rendered_output?: RenderedOutput; loadingTaskType?: string; };');

// 2. Find the useChat block and replace it
const useChatRegex = /const { messages: rawMessages, input, handleInputChange, handleSubmit, setMessages, isLoading, append } = useChat\(\{[\s\S]*?\}\);/;
const messagesMappingRegex = /const messages = rawMessages as CustomMessage\[\];/;

const replacementCode = `
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    const messageId = Date.now().toString();
    const assistantMessageId = "asst-" + messageId;

    setMessages(prev => [...prev, { id: messageId, role: 'user', content: userMessage }]);

    try {
      // Add empty assistant message placeholder
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', loadingTaskType: 'processing' }]);

      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          agentId: agentParam,
          heroId: heroParam,
          threadId: threadId,
        })
      });

      if (res.status === 402 || res.status === 403) {
         setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: "⚡ GRID ENERGY DEPLETED. Upgrade your plan." } : m));
         setIsLoading(false);
         return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = "";
      let renderedOutput: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr === '[DONE]') continue;

            const parsed = JSON.parse(jsonStr);

            if (parsed.type === 'classification') {
               setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, loadingTaskType: parsed.data.task_type } : m));
            } else if (parsed.type === 'text_delta') {
               fullContent += parsed.content;
               setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: fullContent } : m));
            } else if (parsed.type === 'final_render') {
               renderedOutput = parsed.rendered_output;
               setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, rendered_output: renderedOutput, content: fullContent || " " } : m));
            } else if (parsed.type === 'error') {
               throw new Error(parsed.message);
            }
          } catch (e) {
            // skip malformed
          }
        }
      }

      trackMessage(); // Deduct energy
    } catch (err) {
       setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: \`Connection interrupted. [\${err instanceof Error ? err.message : 'Unknown error'}] Please try again.\` } : m));
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, loadingTaskType: undefined } : m)); // clear loading
    }
  };
`;

code = code.replace(useChatRegex, replacementCode);
code = code.replace(messagesMappingRegex, '');

// 3. Fix the rendering loop parsing
const renderRegex = /\/\/ Parse out stream fragments[\s\S]*?const artifact = detectArtifact\(m\.content\);/m;

const newRenderCode = `
                          // AutoPilot Output Rendering (Final Render)
                          if (m.role === 'assistant' && m.rendered_output) {
                             const output = m.rendered_output;
                             switch (output.type) {
                               case 'html': return <HTMLPreviewCard html={output.html} />;
                               case 'document': return <DocumentViewCard markdown={output.markdown} />;
                               case 'code': return <CodeBlockCard code={output.code} language={output.language} />;
                               case 'image': return <ImageCard url={output.url} onRegenerate={() => {}} />;
                               case 'text': return output.content;
                             }
                          }

                          // AutoPilot Loading State
                          if (m.role === 'assistant' && m.loadingTaskType) {
                              // If there is streaming text coming in alongside loading state, render it
                              if (m.content) {
                                 return cleanContent;
                              }

                              if (m.loadingTaskType === 'image') {
                                 return <ImageCard isLoading={true} />;
                              }
                              return (
                                <div className="flex items-center gap-2 text-[#D4AF37] italic text-xs animate-pulse">
                                    <span>Initializing {m.loadingTaskType} builder...</span>
                                </div>
                              );
                          }

                          const artifact = detectArtifact(m.content);
`;

code = code.replace(renderRegex, newRenderCode);

// There's a remaining "AutoPilot Output Rendering" block from a previous regex apply
code = code.replace(/\/\/ AutoPilot Output Rendering[\s\S]*?\/\/ Support raw image text urls during stream before final render/m, '// Support raw image text urls during stream before final render');


fs.writeFileSync('src/app/chat/[hero]/chat-client.tsx', code);
