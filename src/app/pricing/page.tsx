// src/app/pricing/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Tier {
  id: string;
  name: string;
  price: { usd: number; egp: number };
  credits: number;
  dailyReset?: boolean;
  description: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: 'free_scout',
    name: 'FREE SCOUT',
    price: { usd: 0, egp: 0 },
    credits: 100,
    dailyReset: true,
    description: 'Try the empire. No credit card needed.',
    features: ['100 Grid Energy / day', 'Resets daily at midnight UTC', 'All 7 Heroes + 85 Agents', 'Free AI models only'],
  },
  {
    id: 'personal_basic',
    name: 'PERSONAL BASIC',
    price: { usd: 9, egp: 450 },
    credits: 7000,
    description: 'For individuals exploring the empire',
    features: [
      '7,000 Grid Energy / month',
      'All 7 Heroes + 85 Agents',
      'Text, strategy, research, code',
      'Image + video generation',
      'Website + app generation',
      'Arabic output — native RTL',
      'Export: PDF, Word, Excel, PowerPoint',
    ],
  },
  {
    id: 'personal_explorer',
    name: 'PERSONAL EXPLORER',
    price: { usd: 15, egp: 750 },
    credits: 11200,
    description: 'For power users building daily',
    features: [
      '11,200 Grid Energy / month',
      'All 7 Heroes + 85 Agents',
      'Text, strategy, research, code',
      'Image + video generation',
      'Website + app generation',
      'Arabic output — native RTL',
      'Export: PDF, Word, Excel, PowerPoint',
    ],
  },
  {
    id: 'personal_starter',
    name: 'PERSONAL STARTER',
    price: { usd: 29, egp: 1450 },
    credits: 22400,
    description: 'For creators and professionals',
    features: [
      '22,400 Grid Energy / month',
      'All 7 Heroes + 85 Agents',
      'Text, strategy, research, code',
      'Image + video generation',
      'Website + app generation',
      'Arabic output — native RTL',
      'Export: PDF, Word, Excel, PowerPoint',
    ],
  },
  {
    id: 'business_pro',
    name: 'BUSINESS PRO',
    price: { usd: 49, egp: 2450 },
    credits: 38500,
    description: 'For teams and agencies',
    features: [
      '38,500 Grid Energy / month',
      'All 7 Heroes + 85 Agents',
      'Text, strategy, research, code',
      'Image + video generation',
      'Website + app generation',
      'Arabic output — native RTL',
      'Export: PDF, Word, Excel, PowerPoint',
      'Priority routing + support',
    ],
  },
  {
    id: 'business_standard',
    name: 'BUSINESS STANDARD',
    price: { usd: 149, egp: 7450 },
    credits: 420000,
    description: 'For growing enterprises',
    features: [
      '420,000 Grid Energy / month',
      'All 7 Heroes + 85 Agents',
      'Text, strategy, research, code',
      'Image + video generation',
      'Website + app generation',
      'Arabic output — native RTL',
      'Export: PDF, Word, Excel, PowerPoint',
      'Priority routing + dedicated support',
      'Fair Use Policy applies above 40% monthly utilization',
    ],
  },
  {
    id: 'business_enterprise',
    name: 'BUSINESS ENTERPRISE',
    price: { usd: 299, egp: 14950 },
    credits: 840000,
    description: 'For large organizations',
    features: [
      '840,000 Grid Energy / month',
      'All 7 Heroes + 85 Agents',
      'Text, strategy, research, code',
      'Image + video generation',
      'Website + app generation',
      'Arabic output — native RTL',
      'Export: PDF, Word, Excel, PowerPoint',
      'Custom integrations + white-glove support',
      'Fair Use Policy applies above 40% monthly utilization',
    ],
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

      {/* Grid Energy Explanation */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 60px auto',
        border: '1px solid #D4AF37',
        background: 'rgba(10,10,10,0.8)',
        padding: '32px',
        borderRadius: '8px',
      }}>
        <h2 style={{
          fontFamily: 'Cinzel Decorative, serif',
          color: '#D4AF37',
          fontSize: '20px',
          marginBottom: '16px',
          letterSpacing: '0.1em',
        }}>
          WHAT IS GRID ENERGY?
        </h2>
        <p style={{
          color: '#d0c5af',
          fontSize: '14px',
          fontFamily: 'Roboto, sans-serif',
          marginBottom: '24px',
          lineHeight: '1.6',
        }}>
          Grid Energy is your allocation for all AI tasks. Every message, image, or document costs a small amount depending on the AI model used.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          fontFamily: 'Roboto, sans-serif',
          fontSize: '13px',
          color: '#fff',
        }}>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', marginRight: '8px', fontFamily: 'Orbitron, sans-serif' }}>✦</span> Text message (standard): ~2 Grid Energy
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', marginRight: '8px', fontFamily: 'Orbitron, sans-serif' }}>✦</span> Text message (Claude/GPT-4): ~5-6 Grid Energy
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', marginRight: '8px', fontFamily: 'Orbitron, sans-serif' }}>✦</span> Image generation: ~200 Grid Energy per image
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', marginRight: '8px', fontFamily: 'Orbitron, sans-serif' }}>✦</span> Video generation: 300-1,000 Grid Energy per video
            </li>
          </ul>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', marginRight: '8px', fontFamily: 'Orbitron, sans-serif' }}>✦</span> Website or app generation: ~40 Grid Energy
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', marginRight: '8px', fontFamily: 'Orbitron, sans-serif' }}>✦</span> Document export: ~10 Grid Energy
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', marginRight: '8px', fontFamily: 'Orbitron, sans-serif' }}>✦</span> Arabic translation: Included in message cost
            </li>
          </ul>
        </div>
      </div>

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
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {tier.id === 'free_scout' ? (
                <>
                  <span style={{ fontSize: '36px', color: '#fff', fontWeight: 700 }}>FREE</span>
                  <span style={{
                    background: 'rgba(212,175,55,0.1)',
                    color: '#D4AF37',
                    border: '1px solid rgba(212,175,55,0.5)',
                    padding: '4px 8px',
                    fontSize: '10px',
                    borderRadius: '4px',
                    letterSpacing: '0.05em',
                  }}>RESETS DAILY</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '36px', color: '#fff', fontWeight: 700 }}>
                    ${tier.price.usd}
                  </span>
                  <span style={{ color: '#d0c5af', fontSize: '12px' }}>/month</span>
                </>
              )}
            </div>

            {/* Credits */}
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: '#06B6D4',
              marginBottom: '16px',
            }}>
              ⚡ {tier.credits.toLocaleString()} {tier.id === 'free_scout' ? '/ day' : 'GRID ENERGY'}
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
              onClick={() => {
                if (tier.id === 'free_scout') {
                  router.push('/auth');
                } else {
                  handleSubscribe(tier.id);
                }
              }}
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
              {loading === tier.id ? 'LOADING...' : tier.id === 'free_scout' ? 'START FREE' : 'ACTIVATE TIER'}
            </button>
          </div>
        ))}
      </div>

      {/* Fair Use Policy */}
      <div style={{
        maxWidth: '600px',
        margin: '48px auto 0',
        padding: '16px',
        border: '1px solid rgba(212,175,55,0.3)',
        background: 'rgba(10,10,10,0.6)',
        borderRadius: '6px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          color: '#D4AF37',
          fontSize: '11px',
          letterSpacing: '0.1em',
          marginBottom: '8px',
        }}>
          FAIR USE POLICY
        </div>
        <p style={{
          fontFamily: 'Roboto, sans-serif',
          color: 'rgba(208,197,175,0.6)',
          fontSize: '11px',
          lineHeight: '1.6',
          margin: 0,
        }}>
          Business Standard and Enterprise plans include a Fair Use Policy. Accounts consistently using more than 40% of their monthly Grid Energy allocation with high-cost generation tasks (video, image) may be contacted to discuss a custom arrangement. This policy ensures platform quality for all users.
        </p>
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
