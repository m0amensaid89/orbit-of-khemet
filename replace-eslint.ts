import fs from 'fs';

const p = 'src/app/chat/[hero]/chat-client.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  `                            <RichOutput
                              content={finalContent}
                              requestType={(m as any).requestType}
                              platformLabel={(m as any).platformLabel}
                              creditsUsed={(m as any).creditsUsed}
                              creditsRemaining={(m as any).creditsRemaining}
                              accentColor={accentColor}
                            />`,
  `                            <RichOutput
                              content={finalContent}
                              requestType={(m as Message & { requestType?: string }).requestType}
                              platformLabel={(m as Message & { platformLabel?: string }).platformLabel}
                              creditsUsed={(m as Message & { creditsUsed?: number }).creditsUsed}
                              creditsRemaining={(m as Message & { creditsRemaining?: number }).creditsRemaining}
                              accentColor={accentColor}
                            />`
);

c = c.replace(
  `{m.role === 'assistant' && (m as any).platformLabel && (
  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center', opacity: 0.45, fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
    <span style={{ color: accentColor }}>{(m as any).platformLabel}</span>
    {(m as any).creditsUsed > 0 && (
      <>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span>{(m as any).creditsUsed} credits</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span>{(m as any).creditsRemaining?.toLocaleString()} remaining</span>
      </>
    )}
  </div>
)}`,
  `{m.role === 'assistant' && (m as Message & { platformLabel?: string }).platformLabel && (
  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center', opacity: 0.45, fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
    <span style={{ color: accentColor }}>{(m as Message & { platformLabel?: string }).platformLabel}</span>
    {((m as Message & { creditsUsed?: number }).creditsUsed || 0) > 0 && (
      <>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span>{(m as Message & { creditsUsed?: number }).creditsUsed} credits</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span>{(m as Message & { creditsRemaining?: number }).creditsRemaining?.toLocaleString()} remaining</span>
      </>
    )}
  </div>
)}`
);

fs.writeFileSync(p, c);
