"use client"
export default function OfflinePage() {
  return (
    <main style={{
      minHeight: '100vh', background: '#0A0A0A', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Orbitron, monospace', color: '#D4AF37', textAlign: 'center', padding: '32px',
    }}>
      <img src="/khemet-logo.png" alt="Orbit" style={{ width: 64, height: 64, marginBottom: 24, opacity: 0.7 }} />
      <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
        color: 'rgba(212,175,55,0.5)', marginBottom: 8 }}>
        ORBIT OF KHEMET
      </p>
      <h1 style={{ fontSize: '20px', letterSpacing: '2px', marginBottom: 16, fontWeight: 'bold' }}>
        YOU ARE OFFLINE
      </h1>
      <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px',
        color: 'rgba(208,197,175,0.6)', maxWidth: 320, lineHeight: 1.6 }}>
        The Empire requires a connection. Reconnect and your session will resume exactly where you left off.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 32, fontFamily: 'Orbitron, monospace', fontSize: '9px',
          letterSpacing: '2px', textTransform: 'uppercase',
          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)',
          color: '#D4AF37', padding: '10px 20px', borderRadius: 2, cursor: 'pointer',
        }}
      >
        RECONNECT
      </button>
    </main>
  )
}
