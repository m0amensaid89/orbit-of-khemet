export const metadata = { title: 'Terms of Service | Orbit of Khemet' }

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#d0c5af', fontFamily: 'Roboto, sans-serif' }}>

      {/* Hero */}
      <div style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '60px 40px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.5)', marginBottom: '12px' }}>
          LEGAL
        </div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '32px', color: '#D4AF37', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          TERMS OF SERVICE
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(208,197,175,0.5)', margin: 0 }}>
          Last updated: April 13, 2026
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 40px' }}>

        <Section title="1. ACCEPTANCE OF TERMS">
          By accessing or using Orbit of Khemet (&quot;the Platform&quot;), operated by Khemet.AI, you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. These Terms apply to all users including free and paid subscribers.
        </Section>

        <Section title="2. DESCRIPTION OF SERVICE">
          Orbit of Khemet is an AI-powered platform providing access to multiple large language models, image generation, video generation, research tools, and AI agent capabilities. The Platform routes requests to third-party AI providers including OpenRouter, Perplexity, OpenAI, xAI, and fal.ai. We do not operate or own these underlying AI models.
        </Section>

        <Section title="3. ELIGIBILITY">
          You must be at least 13 years of age to use the Platform. If you are under 18, you must have parental or legal guardian consent. By creating an account, you represent that you meet these requirements.
        </Section>

        <Section title="4. USER ACCOUNTS">
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these Terms.
        </Section>

        <Section title="5. GRID ENERGY (CREDITS)">
          Access to Platform features is governed by a credit system called Grid Energy. Credits are allocated per subscription tier and reset monthly. Credits are consumed upon request submission, not upon satisfactory completion. Unused credits do not carry over between billing periods unless otherwise stated.
        </Section>

        <Section title="6. ACCEPTABLE USE">
          You agree not to use the Platform to: generate illegal content, harass or harm others, violate intellectual property rights, attempt to reverse engineer the Platform, use automated scripts to abuse the service, impersonate other persons or entities, or violate any applicable laws or regulations. We reserve the right to terminate accounts that violate this policy without notice.
        </Section>

        <Section title="7. AI-GENERATED CONTENT">
          The Platform uses AI models that may produce inaccurate, incomplete, or unexpected outputs. AI-generated content reflects the capabilities and limitations of the underlying models. You are solely responsible for verifying the accuracy of any AI-generated output before relying on it for any purpose. Khemet.AI does not warrant the accuracy, completeness, or fitness for purpose of any AI-generated content.
        </Section>

        <Section title="8. INTELLECTUAL PROPERTY">
          You retain ownership of all content you submit to the Platform (&quot;Input&quot;) and all AI-generated outputs you produce using the Platform (&quot;Output&quot;), subject to applicable copyright law. Purely AI-generated content may not qualify for copyright protection in all jurisdictions — consult local legal counsel. Khemet.AI retains all rights to the Platform itself, including its design, architecture, agent configurations, and brand identity. You may not reproduce, copy, or create derivative works of the Platform without written consent.
        </Section>

        <Section title="9. DATA AND PRIVACY">
          Your use of the Platform is also governed by our Privacy Policy, which is incorporated herein by reference. We do not sell your personal data to third parties. We do not use your conversations to train AI models. Your data is stored securely via Supabase on infrastructure compliant with industry security standards.
        </Section>

        <Section title="10. THIRD-PARTY AI PROVIDERS">
          The Platform routes requests to third-party AI providers. By using the Platform, you acknowledge that your prompts and inputs are processed by these providers according to their own terms and policies. Khemet.AI is not responsible for the data handling practices of third-party providers. Third-party providers include but are not limited to: OpenRouter, Perplexity AI, OpenAI, xAI, and fal.ai.
        </Section>

        <Section title="11. PAYMENTS AND SUBSCRIPTIONS">
          Paid subscriptions are processed through Paddle, our authorized payment processor. Subscription fees are charged in advance on a monthly basis. By subscribing, you authorize recurring charges to your payment method. All payments are subject to our Refund Policy. We reserve the right to change pricing with 30 days&apos; notice. Continued use after a price change constitutes acceptance.
        </Section>

        <Section title="12. LIMITATION OF LIABILITY">
          To the maximum extent permitted by applicable law, Khemet.AI and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability to you for any claims arising from these Terms shall not exceed the amount you paid us in the 12 months preceding the claim. This limitation applies regardless of the legal theory under which such damages are sought.
        </Section>

        <Section title="13. DISCLAIMER OF WARRANTIES">
          The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not guarantee uninterrupted access, error-free operation, or that the Platform will meet your specific requirements. AI model availability is subject to third-party provider uptime and policies.
        </Section>

        <Section title="14. TERMINATION">
          We may suspend or terminate your access to the Platform at any time, with or without notice, for violation of these Terms, inactivity, or any other reason at our discretion. Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination shall continue to apply.
        </Section>

        <Section title="15. CHANGES TO TERMS">
          We may update these Terms at any time. We will notify users of material changes via email or prominent notice on the Platform. Your continued use of the Platform following notice of changes constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Platform.
        </Section>

        <Section title="16. GOVERNING LAW">
          These Terms are governed by and construed in accordance with the laws of the Arab Republic of Egypt, without regard to its conflict of law provisions. For users in the European Union, mandatory consumer protection laws of your country of residence also apply. Any disputes shall be resolved through binding arbitration, except where prohibited by local law.
        </Section>

        <Section title="17. CONTACT">
          For questions about these Terms, contact us at: legal@khemet.ai
        </Section>

      </div>

      <LegalFooter active="terms" />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.14em', color: '#D4AF37', marginBottom: '12px', borderBottom: '1px solid rgba(212,175,55,0.15)', paddingBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'rgba(208,197,175,0.85)', margin: 0 }}>
        {children}
      </p>
    </div>
  )
}

function LegalFooter({ active }: { active: 'terms' | 'privacy' | 'refund' }) {
  const links = [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/refund-policy', label: 'Refund Policy' },
  ]
  return (
    <div style={{ borderTop: '1px solid rgba(212,175,55,0.1)', padding: '32px 40px', display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
      {links.map(link => (
        <a key={link.href} href={link.href} style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em', color: active === link.href.replace('/', '') ? '#D4AF37' : 'rgba(208,197,175,0.4)', textDecoration: 'none' }}>
          {link.label}
        </a>
      ))}
    </div>
  )
}