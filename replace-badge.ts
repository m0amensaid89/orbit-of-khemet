import fs from 'fs';

const p = 'src/app/chat/[hero]/chat-client.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  `{m.role === 'assistant' && (m as Message & { creditsUsed?: number, platformLabel?: string, creditsRemaining?: number }).creditsUsed !== undefined && (m as Message & { creditsUsed?: number, platformLabel?: string, creditsRemaining?: number }).creditsUsed! > 0 && (
  <div className="text-empire-xs" style={{ opacity: 0.45, fontFamily: 'monospace', marginTop: '4px', paddingLeft: '4px', display: 'flex', gap: '12px' }}>
    <span style={{ color: accentColor }}>{(m as Message & { creditsUsed?: number, platformLabel?: string, creditsRemaining?: number }).platformLabel}</span>
    <span>·</span>
    <span>{(m as Message & { creditsUsed?: number, platformLabel?: string, creditsRemaining?: number }).creditsUsed} credits deployed</span>
    <span>·</span>
    <span>{(m as Message & { creditsUsed?: number, platformLabel?: string, creditsRemaining?: number }).creditsRemaining?.toLocaleString()} remaining</span>
  </div>
)}`,
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
)}`
);

fs.writeFileSync(p, c);
