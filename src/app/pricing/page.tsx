// src/app/pricing/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIERS = [
  {
    id: 'personal_basic',
    name: 'PERSONAL BASIC',
    price: { usd: 9, egp: 450 },
    credits: 7000,
    description: 'For individuals exploring the empire',
    features: ['7,000 Grid Energy/month', 'All 85 agents', 'Text, code, research', 'Standard routing'],
  },
  {
    id: 'personal_explorer',
    name: 'PERSONAL EXPLORER',
    price: { usd: 15, egp: 750 },
    credits: 11200,
    description: 'For power users building daily',
    features: ['11,200 Grid Energy/month', 'All 85 agents', 'Image generation included', 'Priority routing'],
  },
  {
    id: 'personal_starter',
    name: 'PERSONAL STARTER',
    price: { usd: 29, egp: 1450 },
    credits: 22400,
    description: 'For creators and professionals',
    features: ['22,400 Grid Energy/month', 'All 85 agents', 'Video generation included', 'Smart routing'],
  },
  {
    id: 'business_pro',
    name: 'BUSINESS PRO',
    price: { usd: 49, egp: 2450 },
    credits: 38500,
    description: 'For teams and agencies',
    features: ['38,500 Grid Energy/month', 'All 85 agents', 'Full video + image suite', 'Priority support'],
  },
  {
    id: 'business_standard',
    name: 'BUSINESS STANDARD',
    price: { usd: 149, egp: 7450 },
    credits: 420000,
    description: 'For growing enterprises',
    features: ['420,000 Grid Energy/month', 'All 85 agents', 'Unlimited video generation', 'Dedicated routing'],
  },
  {
    id: 'business_enterprise',
    name: 'BUSINESS ENTERPRISE',
    price: { usd: 299, egp: 14950 },
    credits: 840000,
    description: 'For large organizations',
    features: ['840,000 Grid Energy/month', 'All 85 agents', 'Custom integrations', 'White-glove support'],
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (tierId: string) => {
    setLoading(tierId)
    try {
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      })
      const data = await res.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (res.status === 401) {
        router.push('/login')
      }
    } catch (err) {
      console.error('Subscribe error:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      padding: '60px 24px',
      fontFamily: 'monospace',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '32px',
          color: '#D4AF37',
          letterSpacing: '0.12em',
          marginBottom: '12px',
        }}>
          CHOOSE YOUR EMPIRE TIER
        </h1>
        <p style={{ color: '#d0c5af', fontSize: '14px', letterSpacing: '0.06em' }}>
          Every AI. One Platform. One Price.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {TIERS.map((tier) => (
          <div key={tier.id} style={{
            border: '1px solid rgba(212,175,55,0.2)',
            background: 'rgba(212,175,55,0.03)',
            padding: '28px',
            position: 'relative',
          }}>
            {/* Tier name */}
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.14em',
              color: '#D4AF37',
              marginBottom: '8px',
            }}>{tier.name}</div>

            {/* Price */}
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '36px', color: '#fff', fontWeight: 700 }}>
                ${tier.price.usd}
              </span>
              <span style={{ color: '#d0c5af', fontSize: '12px' }}>/month</span>
            </div>

            {/* Credits */}
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: '#06B6D4',
              marginBottom: '16px',
            }}>
              ⚡ {tier.credits.toLocaleString()} GRID ENERGY
            </div>

            {/* Description */}
            <p style={{
              color: 'rgba(208,197,175,0.7)',
              fontSize: '12px',
              marginBottom: '20px',
              lineHeight: '1.5',
            }}>{tier.description}</p>

            {/* Features */}
            <div style={{ marginBottom: '28px' }}>
              {tier.features.map((f, i) => (
                <div key={i} style={{
                  fontSize: '11px',
                  color: '#d0c5af',
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  letterSpacing: '0.04em',
                }}>
                  ✦ {f}
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => handleSubscribe(tier.id)}
              disabled={loading === tier.id}
              style={{
                width: '100%',
                padding: '12px',
                background: loading === tier.id
                  ? 'rgba(212,175,55,0.1)'
                  : 'transparent',
                border: '1px solid #D4AF37',
                color: '#D4AF37',
                fontSize: '11px',
                letterSpacing: '0.12em',
                cursor: loading === tier.id ? 'not-allowed' : 'pointer',
                fontFamily: 'monospace',
                transition: 'all 0.2s',
              }}
            >
              {loading === tier.id ? 'LOADING...' : 'ACTIVATE TIER'}
            </button>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{
        textAlign: 'center',
        color: 'rgba(208,197,175,0.4)',
        fontSize: '11px',
        marginTop: '48px',
        letterSpacing: '0.06em',
      }}>
        Powered by Paddle. Secure checkout. Cancel anytime.
      </p>
    </div>
  )
}
