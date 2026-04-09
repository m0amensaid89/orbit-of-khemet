const fs = require('fs');

let code = fs.readFileSync('src/app/chat/[hero]/chat-client.tsx', 'utf8');

// The regex replacement for the render block in step 1 failed or was incomplete. Let's do it precisely.
const renderStart = `// AutoPilot Output Rendering`;
const renderEnd = `const artifact = detectArtifact(m.content);`;

const startIndex = code.indexOf(renderStart);
const endIndex = code.indexOf(renderEnd) + renderEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
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
   code = code.substring(0, startIndex) + newRenderCode + code.substring(endIndex);
}

fs.writeFileSync('src/app/chat/[hero]/chat-client.tsx', code);
