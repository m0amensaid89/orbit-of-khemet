export const metadata = { title: 'Privacy Policy | Orbit of Khemet' }

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#d0c5af', fontFamily: 'Roboto, sans-serif' }}>

      <div style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '60px 40px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.5)', marginBottom: '12px' }}>LEGAL</div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '32px', color: '#D4AF37', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          PRIVACY POLICY
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(208,197,175,0.5)', margin: 0 }}>Last updated: April 13, 2026</p>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 40px' }}>

        <Section title="1. INTRODUCTION">
          Khemet.AI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates Orbit of Khemet at orbit.khemet.ai. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our Platform. By using the Platform, you consent to the practices described in this Policy.
        </Section>

        <Section title="2. INFORMATION WE COLLECT">
          Account Information: When you register, we collect your email address and authentication credentials via Google or GitHub OAuth. We do not store passwords directly.

          Usage Data: We collect information about how you interact with the Platform including messages sent, features used, agents accessed, and Grid Energy consumed. This is used to provide the service and track credit usage.

          Payment Information: Payment details are processed and stored by Paddle, our payment processor. We do not receive or store your full payment card details.

          Chat History: Conversations with AI agents are stored in our secure database to provide chat history functionality. You can delete conversations at any time.
        </Section>

        <Section title="3. HOW WE USE YOUR INFORMATION">
          We use your information to: provide and maintain the Platform, process your payments and manage subscriptions, track and display your Grid Energy balance, save and retrieve your chat history, improve Platform performance and reliability, send transactional emails about your account, and detect and prevent fraudulent or abusive activity. We do not use your conversations to train AI models.
        </Section>

        <Section title="4. DATA SHARING WITH THIRD PARTIES">
          We do not sell your personal data to third parties. We share data only as necessary to operate the Platform:

          AI Processing Providers: Your prompts are sent to third-party AI providers to generate responses. These include OpenRouter, Perplexity AI, OpenAI (DALL-E 3), xAI, and fal.ai. Each provider processes your data according to their own privacy policies.

          Infrastructure: We use Supabase for database hosting and Vercel for platform deployment. Both operate secure, GDPR-compliant infrastructure.

          Payment Processing: Subscription payments are processed by Paddle. Your payment data is governed by Paddle&apos;s Privacy Policy.
        </Section>

        <Section title="5. AI MODEL PROCESSING">
          When you submit a prompt on the Platform, your message is transmitted to one or more AI model providers to generate a response. These providers may log requests for safety, abuse prevention, and service improvement purposes according to their own terms. We recommend reviewing the privacy policies of: OpenRouter (openrouter.ai), Perplexity AI (perplexity.ai), OpenAI (openai.com), xAI (x.ai), and fal.ai (fal.ai).
        </Section>

        <Section title="6. DATA RETENTION">
          Account data is retained for the duration of your account. Chat history is retained until you delete it or close your account. Payment records are retained as required by law and by Paddle&apos;s policies. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law.
        </Section>

        <Section title="7. YOUR RIGHTS">
          Depending on your location, you may have the following rights regarding your personal data: Right to access the data we hold about you. Right to correct inaccurate data. Right to delete your data (&quot;right to be forgotten&quot;). Right to portability of your data. Right to object to certain processing. To exercise any of these rights, contact us at Moamen@khemet.ai. We will respond within 30 days.
        </Section>

        <Section title="8. GDPR COMPLIANCE">
          For users in the European Economic Area (EEA), we process your data under the following legal bases: Contract performance — to provide the service you subscribed to. Legitimate interests — to prevent fraud and improve the Platform. Consent — where you have explicitly agreed to specific processing. You have the right to lodge a complaint with your local data protection authority.
        </Section>

        <Section title="9. COOKIES">
          We use session cookies solely to maintain your authenticated session. We do not use tracking, advertising, or analytics cookies. You can disable cookies in your browser settings, but this may affect Platform functionality.
        </Section>

        <Section title="10. SECURITY">
          We implement industry-standard security measures to protect your data including encrypted data transmission (HTTPS), secure database hosting via Supabase, authentication via established OAuth providers, and row-level security policies on all database tables. No method of transmission or storage is 100% secure. If you become aware of any security issue, please contact Moamen@khemet.ai.
        </Section>

        <Section title="11. CHILDREN'S PRIVACY">
          The Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13 without parental consent, we will delete that data immediately.
        </Section>

        <Section title="12. CHANGES TO THIS POLICY">
          We may update this Privacy Policy from time to time. We will notify you of material changes via email or prominent notice on the Platform. Your continued use of the Platform after notice of changes constitutes acceptance of the updated Policy.
        </Section>

        <Section title="13. CONTACT">
          For privacy-related questions or to exercise your rights: Moamen@khemet.ai
        </Section>

      </div>

      <LegalFooter active="privacy" />
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