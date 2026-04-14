'use client'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.5)', marginBottom: '12px' }}>
          KHEMET.AI
        </div>
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '28px',
          color: '#D4AF37',
          letterSpacing: '0.1em',
          margin: '0 0 8px',
        }}>
          ORBIT OF KHEMET
        </h1>
        <p style={{ color: 'rgba(208,197,175,0.4)', fontSize: '11px', letterSpacing: '0.08em', margin: 0 }}>
          BUILD YOUR AI EMPIRE
        </p>
      </div>

      {/* Login buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
        <button
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid rgba(212,175,55,0.4)',
            color: '#D4AF37',
            fontSize: '11px',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            fontFamily: 'monospace',
            transition: 'all 0.2s',
          }}
        >
          CONTINUE WITH GOOGLE
        </button>

        <button
          onClick={signInWithGitHub}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(208,197,175,0.6)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            fontFamily: 'monospace',
            transition: 'all 0.2s',
          }}
        >
          CONTINUE WITH GITHUB
        </button>
      </div>

      {/* Legal links */}
      <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
        {['/terms', '/privacy'].map(href => (
          <a key={href} href={href} style={{
            fontSize: '9px',
            letterSpacing: '0.1em',
            color: 'rgba(208,197,175,0.3)',
            textDecoration: 'none',
          }}>
            {href.replace('/', '').toUpperCase()}
          </a>
        ))}
      </div>
    </div>
  )
}
