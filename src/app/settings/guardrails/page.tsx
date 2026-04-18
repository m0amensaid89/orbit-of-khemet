"use client";

import { useState, useEffect } from "react";

interface Guardrails {
  language: string;
  tone: string;
  responseLength: string;
  outputLanguage: string;
  avoidTopics: string;
  enforceFormat: string;
  customInstruction: string;
}

const DEFAULT: Guardrails = {
  language: 'en',
  tone: 'professional',
  responseLength: 'balanced',
  outputLanguage: 'same',
  avoidTopics: '',
  enforceFormat: 'none',
  customInstruction: '',
};

const STORAGE_KEY = 'orbit_guardrails';

const accent = '#D4AF37';
const labelStyle = { fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.4)', textTransform: 'uppercase' as const };
const inputStyle = { width: '100%', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.15)', color: '#d0c5af', fontFamily: 'Roboto, sans-serif', fontSize: '13px', padding: '10px 14px', borderRadius: '4px', outline: 'none' };
const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none' as const };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '28px' }}>
    <div style={{ ...labelStyle, marginBottom: '14px', borderBottom: '1px solid rgba(212,175,55,0.08)', paddingBottom: '8px' }}>{title}</div>
    {children}
  </div>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ fontSize: '12px', color: 'rgba(208,197,175,0.6)', marginBottom: '6px', fontFamily: 'Roboto, sans-serif' }}>{label}</div>
    {children}
    {hint && <div style={{ fontSize: '11px', color: 'rgba(208,197,175,0.3)', marginTop: '5px', fontFamily: 'Roboto, sans-serif' }}>{hint}</div>}
  </div>
);

export default function GuardrailsPage() {
  const [g, setG] = useState<Guardrails>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      setG({ ...DEFAULT, ...stored });
    } catch {}
  }, []);

  const update = (key: keyof Guardrails, val: string) => setG(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(g));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setG(DEFAULT);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: '40px 32px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ ...labelStyle, marginBottom: '12px' }}>SETTINGS</div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '26px', color: accent, marginBottom: '8px', fontWeight: 400 }}>
          AGENT GUARDRAILS
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(208,197,175,0.4)', lineHeight: '1.6' }}>
          These preferences are injected into every agent session as a behavior layer. Agents adapt to your settings without losing their core expertise.
        </p>
      </div>

      {/* COMMUNICATION */}
      <Section title="Communication">
        <Field label="Platform language" hint="Used for navigation and system messages">
          <select value={g.language} onChange={e => update('language', e.target.value)} style={selectStyle}>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </Field>
        <Field label="Agent response language" hint="Language agents write their outputs in">
          <select value={g.outputLanguage} onChange={e => update('outputLanguage', e.target.value)} style={selectStyle}>
            <option value="same">Same as my message (auto-detect)</option>
            <option value="en">Always English</option>
            <option value="ar">Always Arabic</option>
            <option value="fr">Always French</option>
          </select>
        </Field>
      </Section>

      {/* TONE + LENGTH */}
      <Section title="Tone and Style">
        <Field label="Default tone">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
            {['professional', 'direct', 'friendly', 'academic', 'executive', 'casual'].map(t => (
              <button key={t} onClick={() => update('tone', t)}
                style={{ padding: '9px', border: `1px solid ${g.tone === t ? accent : 'rgba(212,175,55,0.15)'}`, background: g.tone === t ? 'rgba(212,175,55,0.1)' : 'transparent', color: g.tone === t ? accent : 'rgba(208,197,175,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.08em', cursor: 'pointer', borderRadius: '4px', textTransform: 'uppercase' }}>
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Response length">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
            {[
              { val: 'concise', label: 'CONCISE', hint: '<200 words' },
              { val: 'balanced', label: 'BALANCED', hint: 'Default' },
              { val: 'comprehensive', label: 'DEEP', hint: 'Full detail' },
            ].map(({ val, label, hint }) => (
              <button key={val} onClick={() => update('responseLength', val)}
                style={{ padding: '9px 6px', border: `1px solid ${g.responseLength === val ? accent : 'rgba(212,175,55,0.15)'}`, background: g.responseLength === val ? 'rgba(212,175,55,0.1)' : 'transparent', color: g.responseLength === val ? accent : 'rgba(208,197,175,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.08em', cursor: 'pointer', borderRadius: '4px' }}>
                <div>{label}</div>
                <div style={{ fontSize: '8px', color: 'rgba(208,197,175,0.4)', marginTop: '3px', fontFamily: 'Roboto, sans-serif' }}>{hint}</div>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Enforce output format" hint="Agents will prefer this structure when applicable">
          <select value={g.enforceFormat} onChange={e => update('enforceFormat', e.target.value)} style={selectStyle}>
            <option value="none">No preference (agent decides)</option>
            <option value="bullets">Bullet points</option>
            <option value="numbered">Numbered lists</option>
            <option value="prose">Prose paragraphs</option>
            <option value="markdown">Structured markdown with headers</option>
          </select>
        </Field>
      </Section>

      {/* CONTENT CONTROLS */}
      <Section title="Content Controls">
        <Field label="Topics to avoid" hint="Comma-separated. Agents will redirect if these topics arise.">
          <input type="text" value={g.avoidTopics} onChange={e => update('avoidTopics', e.target.value)}
            placeholder="e.g. politics, competitor names, pricing discussions"
            style={inputStyle} />
        </Field>
        <Field label="Custom instruction" hint="Added to every agent session. Max 300 characters.">
          <textarea rows={3} value={g.customInstruction} onChange={e => update('customInstruction', e.target.value.slice(0, 300))}
            placeholder="e.g. Always provide examples from the MENA region. Use Egyptian market context where relevant."
            style={{ ...inputStyle, resize: 'vertical', display: 'block' }} />
          <div style={{ fontSize: '10px', color: 'rgba(208,197,175,0.3)', marginTop: '4px', textAlign: 'right' }}>
            {g.customInstruction.length}/300
          </div>
        </Field>
      </Section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid rgba(212,175,55,0.08)' }}>
        <button onClick={handleSave}
          style={{ flex: 1, padding: '13px', background: saved ? 'rgba(100,220,100,0.15)' : accent, color: saved ? 'rgba(100,220,100,0.9)' : '#0A0A0A', border: saved ? '1px solid rgba(100,220,100,0.3)' : 'none', fontFamily: 'Orbitron, monospace', fontSize: '11px', letterSpacing: '0.14em', cursor: 'pointer', borderRadius: '4px', transition: 'all 0.2s' }}>
          {saved ? 'GUARDRAILS SAVED' : 'SAVE GUARDRAILS'}
        </button>
        <button onClick={handleReset}
          style={{ padding: '13px 20px', background: 'transparent', border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(208,197,175,0.4)', fontFamily: 'Orbitron, monospace', fontSize: '10px', letterSpacing: '0.1em', cursor: 'pointer', borderRadius: '4px' }}>
          RESET
        </button>
      </div>
    </div>
  );
}
