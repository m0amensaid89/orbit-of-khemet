'use client'
import { useState } from 'react'

interface QuickActionsProps {
  type: 'text' | 'code' | 'research' | 'video'
  content: string
  accentColor: string
  onCopy?: () => void
  copied?: boolean
}

function QuickActions({ type, content, accentColor, onCopy, copied }: QuickActionsProps) {
  const actions: Record<string, { label: string; prompt: string }[]> = {
    text: [
      { label: 'MAKE SHORTER', prompt: 'Make this shorter and more concise: ' },
      { label: 'EXPAND', prompt: 'Expand on this with more detail: ' },
      { label: 'TRANSLATE AR', prompt: 'Translate this to Arabic: ' },
    ],
    code: [
      { label: 'EXPLAIN', prompt: 'Explain this code step by step: ' },
      { label: 'DEBUG', prompt: 'Find any bugs in this code: ' },
      { label: 'OPTIMIZE', prompt: 'Optimize this code for performance: ' },
    ],
    research: [
      { label: 'DIG DEEPER', prompt: 'Go deeper on this topic with more detail: ' },
      { label: 'SUMMARIZE', prompt: 'Summarize this research in 3 bullet points: ' },
    ],
    video: [],
  }

  const currentActions = actions[type] || []
  if (currentActions.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
      {onCopy && (
        <button onClick={onCopy} style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.08em', color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', padding: '3px 8px', cursor: 'pointer' }}>
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      )}
      {currentActions.map(action => (
        <button key={action.label}
          onClick={() => {
            const input = document.querySelector('textarea, input[type="text"]') as HTMLInputElement
            if (input) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
              nativeInputValueSetter?.call(input, action.prompt + content.slice(0, 200))
              input.dispatchEvent(new Event('input', { bubbles: true }))
              input.focus()
            }
          }}
          style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', padding: '3px 8px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = accentColor; (e.target as HTMLElement).style.color = accentColor }}
          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}>
          {action.label}
        </button>
      ))}
    </div>
  )
}

function TextOutput({ content, accentColor }: { content: string, accentColor: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Convert basic markdown to HTML
  const formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^## (.*$)/gm, `<h2 style="color:${accentColor};font-family:monospace;font-size:14px;letter-spacing:0.08em;margin:12px 0 6px">$1</h2>`)
    .replace(/^### (.*$)/gm, `<h3 style="color:${accentColor};font-family:monospace;font-size:12px;letter-spacing:0.06em;margin:10px 0 4px">$1</h3>`)
    .replace(/^- (.*$)/gm, '<li style="margin:2px 0;padding-left:4px">$1</li>')
    .replace(/\n/g, '<br/>')

  return (
    <div>
      <div
        style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.87)' }}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
      <QuickActions type="text" content={content} accentColor={accentColor} onCopy={handleCopy} copied={copied} />
    </div>
  )
}

function CodeOutput({ content, accentColor }: { content: string, accentColor: string }) {
  const [copied, setCopied] = useState(false)

  // Extract code blocks
  const blocks = content.split(/(```\w*\n[\s\S]*?```)/g)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {blocks.map((block, i) => {
        const codeMatch = block.match(/```(\w+)?\n([\s\S]*?)```/)
        if (codeMatch) {
          const lang = codeMatch[1] || 'code'
          const code = codeMatch[2].trim()
          return (
            <div key={i} style={{ borderRadius: '6px', overflow: 'hidden', border: `1px solid rgba(212,175,55,0.2)` }}>
              {/* Language badge + copy button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(212,175,55,0.08)', borderBottom: `1px solid rgba(212,175,55,0.1)` }}>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', color: accentColor, textTransform: 'uppercase' }}>{lang}</span>
                <button onClick={() => handleCopy(code)} style={{ fontSize: '10px', fontFamily: 'monospace', color: copied ? '#4ade80' : accentColor, background: 'transparent', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
              {/* Code block */}
              <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontSize: '13px', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)', background: '#0A0A0A', fontFamily: 'monospace' }}>
                <code>{code}</code>
              </pre>
            </div>
          )
        }
        // Plain text between code blocks
        if (block.trim()) {
          return <p key={i} style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{block}</p>
        }
        return null
      })}
      <QuickActions type="code" content={content} accentColor={accentColor} onCopy={() => handleCopy(content)} copied={copied} />
    </div>
  )
}

function ResearchOutput({ content, accentColor }: { content: string, accentColor: string }) {
  const [showSources, setShowSources] = useState(false)

  // Extract citation numbers [1], [2] etc
  const citations = [...content.matchAll(/\[(\d+)\]/g)].map(m => m[1])
  const uniqueCitations = [...new Set(citations)]

  // Clean content — remove citation brackets for display
  const cleanContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')

  return (
    <div>
      <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'rgba(255,255,255,0.87)' }}
        dangerouslySetInnerHTML={{ __html: cleanContent }} />

      {uniqueCitations.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={() => setShowSources(!showSources)}
            style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', color: accentColor, background: 'transparent', border: `1px solid rgba(212,175,55,0.3)`, borderRadius: '4px', padding: '4px 12px', cursor: 'pointer' }}>
            {showSources ? 'HIDE' : 'VIEW'} {uniqueCitations.length} SOURCES
          </button>

          {showSources && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {uniqueCitations.map(num => (
                <div key={num} style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', padding: '4px 8px', background: 'rgba(212,175,55,0.04)', borderRadius: '4px', borderLeft: `2px solid rgba(212,175,55,0.3)` }}>
                  [{num}] Perplexity verified source
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <QuickActions type="research" content={content} accentColor={accentColor} />
    </div>
  )
}

interface RichOutputProps {
  content: string
  requestType?: string
  platformLabel?: string
  creditsUsed?: number
  creditsRemaining?: number
  accentColor?: string
}

export default function RichOutput({
  content, requestType, platformLabel, creditsUsed, creditsRemaining, accentColor = '#D4AF37'
}: RichOutputProps) {

  // Detect code blocks
  const codeMatch = content.match(/```(\w+)?\n([\s\S]*?)```/)

  if (requestType === 'code' || codeMatch) {
    return <CodeOutput content={content} accentColor={accentColor} />
  }

  if (requestType === 'research' || requestType === 'website_analysis') {
    return <ResearchOutput content={content} accentColor={accentColor} />
  }

  // Default: markdown text output
  return <TextOutput content={content} accentColor={accentColor} />
}
