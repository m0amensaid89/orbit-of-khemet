export const metadata = { title: 'Refund Policy | Orbit of Khemet' }

export default function RefundPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#d0c5af', fontFamily: 'Roboto, sans-serif' }}>

      <div style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '60px 40px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.5)', marginBottom: '12px' }}>LEGAL</div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '32px', color: '#D4AF37', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          REFUND POLICY
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(208,197,175,0.5)', margin: 0 }}>Last updated: April 13, 2026</p>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 40px' }}>

        <Section title="1. OVERVIEW">
          At Khemet.AI, we want you to be satisfied with your subscription to Orbit of Khemet. This Refund Policy explains when and how refunds are issued. All payments are processed through Paddle, our authorized payment processor. By purchasing a subscription, you agree to the terms of this Refund Policy.
        </Section>

        <Section title="2. SUBSCRIPTION FEES">
          Subscription fees are charged in advance on a monthly basis. All fees are non-refundable except as expressly stated in this Policy. This includes situations where you do not use the Platform during a billing period or do not use all of your Grid Energy credits.
        </Section>

        <Section title="3. GRID ENERGY (CREDITS)">
          Grid Energy credits are consumed upon request submission. Credits deducted for completed or attempted AI operations — including text, code, research, image generation, and video generation — are non-refundable. This applies even if the output is unsatisfactory, as the underlying third-party AI providers charge us for each request regardless of output quality.

          Video and image generation credits are non-refundable once the generation request is submitted to our AI providers, even if the generation takes longer than expected or the result does not meet your expectations.
        </Section>

        <Section title="4. FIRST PURCHASE — 7-DAY WINDOW">
          If you are a new subscriber and the Platform is materially non-functional due to a technical fault on our side, you may request a full refund within 7 days of your first purchase. "Materially non-functional" means the core platform features are inaccessible due to an outage or error attributable to Khemet.AI — not third-party AI provider outages. Refunds under this clause are issued at our sole discretion after investigation.
        </Section>

        <Section title="5. SERVICE DISRUPTIONS">
          If the Platform is unavailable for more than 24 consecutive hours due to a fault on our side, we may issue a prorated credit to your account for the affected period. This credit is applied to your next billing cycle and is not paid out as a cash refund. Third-party AI provider outages (OpenRouter, Perplexity, OpenAI, xAI, fal.ai) are outside our control and do not qualify for refunds or credits.
        </Section>

        <Section title="6. CANCELLATIONS">
          You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period. You retain access to the Platform and your remaining Grid Energy credits until the end of the paid period. No refund is issued for the unused portion of a billing period upon cancellation.
        </Section>

        <Section title="7. HOW TO REQUEST A REFUND">
          To request a refund under the eligible conditions above: email refunds@khemet.ai with your account email and reason for the refund request. We will review and respond within 5 business days. Approved refunds are processed through Paddle and typically appear on your statement within 5 to 10 business days, depending on your bank or card issuer.
        </Section>

        <Section title="8. MANDATORY LOCAL LAWS">
          Nothing in this Refund Policy overrides mandatory consumer protection laws applicable in your jurisdiction. If you are located in the European Union or other regions with statutory refund rights, those rights apply in addition to this Policy.
        </Section>

        <Section title="9. CHANGES TO THIS POLICY">
          We may update this Refund Policy from time to time. Updated policies will be posted on this page with a revised date. Your continued use of the Platform after changes are posted constitutes acceptance of the updated Policy.
        </Section>

        <Section title="10. CONTACT">
          For refund requests or questions: refunds@khemet.ai
        </Section>

      </div>

      <LegalFooter active="refund" />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.14em', color: '#D4AF37', marginBottom: '12px', borderBottom: '1px solid rgba(212,175,55,0.15)', paddingBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'rgba(208,197,175,0.85)', margin: 0, whiteSpace: 'pre-line' }}>
        {children}
      </p>
    </div>
  )
}

function LegalFooter({ active }: { active: 'terms' | 'privacy' | 'refund' }) {
  const links = [
    { href: '/terms', label: 'Terms of Service', key: 'terms' },
    { href: '/privacy', label: 'Privacy Policy', key: 'privacy' },
    { href: '/refund-policy', label: 'Refund Policy', key: 'refund' },
  ]
  return (
    <div style={{ borderTop: '1px solid rgba(212,175,55,0.1)', padding: '32px 40px', display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
      {links.map(link => (
        <a key={link.href} href={link.href} style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em', color: active === link.key ? '#D4AF37' : 'rgba(208,197,175,0.4)', textDecoration: 'none' }}>
          {link.label}
        </a>
      ))}
    </div>
  )
}