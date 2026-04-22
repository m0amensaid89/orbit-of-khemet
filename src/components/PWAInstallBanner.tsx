"use client"
import { usePWAInstall } from '@/hooks/usePWAInstall'

export function PWAInstallBanner() {
  const { canInstall, install, dismiss } = usePWAInstall()

  if (!canInstall) return null

  return (
    <div
      style={{
        position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, background: '#131313',
        border: '1px solid rgba(212,175,55,0.4)',
        borderRadius: '4px', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 0 20px rgba(212,175,55,0.15)',
        maxWidth: '340px', width: 'calc(100vw - 32px)',
      }}
    >
      <img src="/khemet-logo.png" alt="Orbit" style={{ width: 32, height: 32, borderRadius: 4 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '2px',
          textTransform: 'uppercase', color: '#D4AF37', marginBottom: 2 }}>
          INSTALL ORBIT
        </p>
        <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', color: 'rgba(208,197,175,0.7)' }}>
          Add to home screen for the full experience
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button
          onClick={install}
          style={{ fontFamily: 'Orbitron, monospace', fontSize: '8px', letterSpacing: '2px',
            textTransform: 'uppercase', background: 'rgba(212,175,55,0.15)',
            border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37',
            padding: '4px 10px', borderRadius: 2, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          INSTALL
        </button>
        <button
          onClick={dismiss}
          style={{ fontFamily: 'Orbitron, monospace', fontSize: '7px', letterSpacing: '1px',
            textTransform: 'uppercase', background: 'transparent', border: 'none',
            color: 'rgba(208,197,175,0.4)', cursor: 'pointer' }}
        >
          NOT NOW
        </button>
      </div>
    </div>
  )
}
