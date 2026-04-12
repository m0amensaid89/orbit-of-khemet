import fs from 'fs';

const p = 'src/app/chat/[hero]/chat-client.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  `import { ExportToolbar } from '@/components/ExportToolbar';`,
  `import { ExportToolbar } from '@/components/ExportToolbar';\nimport RichOutput from '@/components/chat/RichOutput';`
);

c = c.replace(
  `                          return artifact ? stripCodeBlocks(cleanContent) : cleanContent;
                        })()}`,
  `                          const finalContent = artifact ? stripCodeBlocks(cleanContent) : cleanContent;
                          return (
                            <RichOutput
                              content={finalContent}
                              requestType={(m as any).requestType}
                              platformLabel={(m as any).platformLabel}
                              creditsUsed={(m as any).creditsUsed}
                              creditsRemaining={(m as any).creditsRemaining}
                              accentColor={accentColor}
                            />
                          );
                        })()}`
);

fs.writeFileSync(p, c);
