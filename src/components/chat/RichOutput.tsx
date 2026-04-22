'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface QuickActionsProps {
  type: 'text' | 'code' | 'research' | 'video'
  content: string
  accentColor: string
  onCopy?: () => void
  copied?: boolean
}

function QuickActions({ type, content, accentColor, onCopy, copied }: QuickActionsProps) {
  if (content.length < 50) return null

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

// TOC: auto-generate table of contents for outputs with 3+ headings
function TableOfContents({ headings, accentColor }: { headings: { id: string; text: string; level: number }[]; accentColor: string }) {
  if (headings.length < 3) return null
  return (
    <div style={{
      position: 'sticky', top: '12px',
      background: 'rgba(10,10,10,0.95)',
      border: '1px solid rgba(212,175,55,0.15)',
      borderRadius: '4px',
      padding: '12px',
      minWidth: '160px',
      maxWidth: '200px',
      float: 'right',
      marginLeft: '16px',
      marginBottom: '12px',
    }}>
      <div style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.16em', color: 'rgba(212,175,55,0.45)', marginBottom: '8px' }}>CONTENTS</div>
      {headings.map(h => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={e => {
            e.preventDefault()
            document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          style={{
            display: 'block',
            fontSize: '11px',
            color: 'rgba(208,197,175,0.6)',
            textDecoration: 'none',
            padding: '3px 0',
            paddingLeft: h.level === 3 ? '10px' : '0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'color 0.15s',
            fontFamily: 'monospace',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.color = accentColor }}
          onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(208,197,175,0.6)' }}
        >
          {h.text.slice(0, 22)}
        </a>
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

  // Extract headings for TOC
  const headingMatches = [...content.matchAll(/^(#{2,3}) (.+)$/gm)]
  const headings = headingMatches.map((m, i) => ({
    id: `h-${i}-${m[2].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
    text: m[2],
    level: m[1].length,
  }))

  // Convert markdown to HTML, injecting IDs on headings
  let hi = 0
  const formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^## (.+)$/gm, (_match, capturedText) => {
      const h = headings[hi++]
      return `<h2 id="${h?.id || ''}" style="color:${accentColor};font-family:monospace;font-size:14px;letter-spacing:0.08em;margin:16px 0 6px;scroll-margin-top:12px">${capturedText}</h2>`
    })
    .replace(/^### (.+)$/gm, (_match, capturedText) => {
      const h = headings[hi++]
      return `<h3 id="${h?.id || ''}" style="color:${accentColor};font-family:monospace;font-size:12px;letter-spacing:0.06em;margin:12px 0 4px;scroll-margin-top:12px">${capturedText}</h3>`
    })
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0;padding-left:4px">$1</li>')
    .replace(/\n/g, '<br/>')

  return (
    <div>
      {headings.length >= 3 && <TableOfContents headings={headings} accentColor={accentColor} />}
      <div
        style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.87)' }}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
      <QuickActions type="text" content={content} accentColor={accentColor} onCopy={handleCopy} copied={copied} />
    </div>
  )
}

// Render CSV as styled table
function CsvTable({ csv, accentColor }: { csv: string; accentColor: string }) {
  const rows = csv.trim().split('\n').map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, '')))
  if (rows.length < 2) return <pre style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{csv}</pre>
  const [headers, ...data] = rows
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'monospace' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '8px 12px', textAlign: 'left', background: `rgba(212,175,55,0.08)`, color: accentColor, letterSpacing: '0.08em', borderBottom: `1px solid rgba(212,175,55,0.2)`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(212,175,55,0.02)' : 'transparent' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '7px 12px', color: 'rgba(208,197,175,0.8)', borderBottom: '1px solid rgba(212,175,55,0.06)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Chart artifact — renders JSON chart blocks using Chart.js via CDN
function ChartArtifact({ code, accentColor }: { code: string; accentColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const renderChart = useCallback(() => {
    if (!canvasRef.current) return
    try {
      const data = JSON.parse(code)
      const Chart = (window as any).Chart
      if (!Chart) { setError('Chart.js loading...'); return }
      if (chartRef.current) chartRef.current.destroy()
      const COLORS = [accentColor, '#22d3ee', '#a78bfa', '#fb923c', '#4ade80']
      const datasets = (data.datasets || []).map((ds: any, i: number) => ({
        ...ds,
        backgroundColor: ds.backgroundColor || (data.type === 'line' ? 'transparent' : COLORS[i % COLORS.length] + '99'),
        borderColor: ds.borderColor || COLORS[i % COLORS.length],
        borderWidth: 2,
        pointBackgroundColor: COLORS[i % COLORS.length],
      }))
      chartRef.current = new Chart(canvasRef.current, {
        type: data.type || 'bar',
        data: { labels: data.labels || [], datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#d0c5af', font: { family: 'monospace', size: 11 } } } },
          scales: data.type === 'pie' || data.type === 'doughnut' ? {} : {
            x: { ticks: { color: '#d0c5af' }, grid: { color: 'rgba(212,175,55,0.08)' } },
            y: { ticks: { color: '#d0c5af' }, grid: { color: 'rgba(212,175,55,0.08)' } },
          },
        }
      })
      setError(null)
    } catch (e) {
      setError('Invalid chart JSON')
    }
  }, [code, accentColor])

  useEffect(() => {
    const load = () => {
      if ((window as any).Chart) { renderChart(); return }
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
      script.onload = renderChart
      document.head.appendChild(script)
    }
    load()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [renderChart])

  return (
    <div style={{ border: '1px solid rgba(212,175,55,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
        <span style={{ fontSize: '9px', fontFamily: 'Orbitron, monospace', letterSpacing: '2px', color: accentColor }}>CHART</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ fontSize: '9px', fontFamily: 'monospace', color: copied ? '#4ade80' : accentColor, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {copied ? 'COPIED' : 'COPY DATA'}
        </button>
      </div>
      <div style={{ padding: '16px', background: '#111111', height: '280px', position: 'relative' }}>
        {error && <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '12px', fontFamily: 'monospace', textAlign: 'center', paddingTop: '100px' }}>{error}</div>}
        <canvas ref={canvasRef} style={{ display: error ? 'none' : 'block' }} />
      </div>
    </div>
  )
}

// HTML artifact with PREVIEW / CODE toggle + EDIT + device frame
function HtmlArtifact({ code, accentColor }: { code: string; accentColor: string }) {
  const [mode, setMode] = useState<'preview' | 'code'>('preview')
  const [editing, setEditing] = useState(false)
  const [editedCode, setEditedCode] = useState(code)
  const [liveCode, setLiveCode] = useState(code)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)
  const isMockup = code.includes('class="mockup"') || code.includes('data-mockup')

  const handleCopy = () => {
    navigator.clipboard.writeText(liveCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ border: '1px solid rgba(212,175,55,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.1)', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {(['preview', 'code'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setEditing(false) }}
              style={{ fontSize: '9px', fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em', padding: '4px 12px', border: '1px solid rgba(212,175,55,0.3)', cursor: 'pointer', background: mode === m ? 'rgba(212,175,55,0.12)' : 'transparent', color: mode === m ? accentColor : 'rgba(208,197,175,0.4)', borderRadius: m === 'preview' ? '3px 0 0 3px' : '0 3px 3px 0', borderRight: m === 'preview' ? 'none' : undefined }}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isMockup && mode === 'preview' && (
            <div style={{ display: 'flex', gap: '0' }}>
              {(['desktop', 'mobile'] as const).map(d => (
                <button key={d} onClick={() => setDevice(d)}
                  style={{ fontSize: '8px', fontFamily: 'Orbitron, monospace', letterSpacing: '1px', padding: '3px 8px', border: '1px solid rgba(212,175,55,0.2)', cursor: 'pointer', background: device === d ? 'rgba(212,175,55,0.1)' : 'transparent', color: device === d ? accentColor : 'rgba(208,197,175,0.35)', borderRadius: d === 'desktop' ? '3px 0 0 3px' : '0 3px 3px 0', borderRight: d === 'desktop' ? 'none' : undefined }}>
                  {d.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          {mode === 'preview' && !editing && (
            <button onClick={() => setEditing(true)}
              style={{ fontSize: '9px', fontFamily: 'Orbitron, monospace', letterSpacing: '1px', color: accentColor, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              EDIT
            </button>
          )}
          <button onClick={handleCopy} style={{ fontSize: '9px', fontFamily: 'monospace', color: copied ? '#4ade80' : accentColor, background: 'transparent', border: 'none', cursor: 'pointer' }}>
            {copied ? 'COPIED' : 'COPY HTML'}
          </button>
        </div>
      </div>
      {editing ? (
        <div style={{ background: '#0d0d0d', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            value={editedCode}
            onChange={e => setEditedCode(e.target.value)}
            style={{ width: '100%', minHeight: '200px', background: '#0d0d0d', color: '#d0c5af', fontFamily: 'monospace', fontSize: '12px', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '4px', padding: '12px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setLiveCode(editedCode); setEditing(false) }}
              style={{ fontSize: '9px', fontFamily: 'Orbitron, monospace', letterSpacing: '2px', padding: '6px 16px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', color: accentColor, cursor: 'pointer', borderRadius: '4px' }}>
              RENDER
            </button>
            <button onClick={() => { setEditedCode(liveCode); setEditing(false) }}
              style={{ fontSize: '9px', fontFamily: 'Orbitron, monospace', letterSpacing: '2px', padding: '6px 16px', background: 'transparent', border: '1px solid rgba(212,175,55,0.15)', color: 'rgba(208,197,175,0.4)', cursor: 'pointer', borderRadius: '4px' }}>
              CANCEL
            </button>
          </div>
        </div>
      ) : mode === 'preview' ? (
        <div style={{ background: '#111', display: 'flex', justifyContent: device === 'mobile' ? 'center' : 'stretch', padding: device === 'mobile' ? '16px' : '0' }}>
          <iframe
            srcDoc={liveCode}
            sandbox="allow-scripts"
            style={{
              width: device === 'mobile' ? '375px' : '100%',
              height: '360px', border: 'none', background: '#fff', display: 'block',
              ...(device === 'mobile' ? { border: '8px solid #222', borderRadius: '20px', boxShadow: '0 0 0 2px rgba(212,175,55,0.2)' } : {})
            }}
            title="HTML preview"
          />
        </div>
      ) : (
        <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontSize: '12px', lineHeight: '1.5', color: 'rgba(255,255,255,0.85)', background: '#0A0A0A', fontFamily: 'monospace', maxHeight: '360px' }}>
          <code>{liveCode}</code>
        </pre>
      )}
    </div>
  )
}

function CodeOutput({ content, accentColor }: { content: string, accentColor: string }) {
  const [copied, setCopied] = useState(false)

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
          const lang = (codeMatch[1] || 'code').toLowerCase()
          const code = codeMatch[2].trim()

          // Chart — render as Chart.js visualization
          if (lang === 'chart') {
            return <ChartArtifact key={i} code={code} accentColor={accentColor} />
          }

          // HTML — render with preview toggle + edit + device frame
          if (lang === 'html') {
            return <HtmlArtifact key={i} code={code} accentColor={accentColor} />
          }

          // CSV — render as table
          if (lang === 'csv') {
            return (
              <div key={i} style={{ borderRadius: '4px', overflow: 'hidden', border: `1px solid rgba(212,175,55,0.2)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(212,175,55,0.08)', borderBottom: `1px solid rgba(212,175,55,0.1)` }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', color: accentColor }}>CSV TABLE</span>
                  <button onClick={() => handleCopy(code)} style={{ fontSize: '10px', fontFamily: 'monospace', color: copied ? '#4ade80' : accentColor, background: 'transparent', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>
                    {copied ? 'COPIED' : 'COPY CSV'}
                  </button>
                </div>
                <div style={{ padding: '12px', background: '#0A0A0A' }}>
                  <CsvTable csv={code} accentColor={accentColor} />
                </div>
              </div>
            )
          }

          // JSON — enhanced copy
          if (lang === 'json') {
            return (
              <div key={i} style={{ borderRadius: '4px', overflow: 'hidden', border: `1px solid rgba(212,175,55,0.2)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(212,175,55,0.08)', borderBottom: `1px solid rgba(212,175,55,0.1)` }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', color: accentColor }}>JSON</span>
                  <button onClick={() => handleCopy(code)} style={{ fontSize: '10px', fontFamily: 'monospace', color: copied ? '#4ade80' : accentColor, background: 'transparent', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>
                    {copied ? '✓ COPIED' : 'COPY JSON'}
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontSize: '12px', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)', background: '#0A0A0A', fontFamily: 'monospace' }}>
                  <code>{code}</code>
                </pre>
              </div>
            )
          }

          // Default code block
          return (
            <div key={i} style={{ borderRadius: '4px', overflow: 'hidden', border: `1px solid rgba(212,175,55,0.2)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(212,175,55,0.08)', borderBottom: `1px solid rgba(212,175,55,0.1)` }}>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', color: accentColor, textTransform: 'uppercase' }}>{lang}</span>
                <button onClick={() => handleCopy(code)} style={{ fontSize: '10px', fontFamily: 'monospace', color: copied ? '#4ade80' : accentColor, background: 'transparent', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontSize: '13px', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)', background: '#0A0A0A', fontFamily: 'monospace' }}>
                <code>{code}</code>
              </pre>
            </div>
          )
        }
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

  const citations = [...content.matchAll(/\[(\d+)\]/g)].map(m => m[1])
  const uniqueCitations = [...new Set(citations)]

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

function BrowserOutput({ content, accentColor }: { content: string, accentColor: string }) {
  const [imgError, setImgError] = useState(false)

  let data: {
    success?: boolean
    screenshot?: string | null
    url?: string | null
    action?: string
    result?: string
    steps?: string[]
  } = {}
  
  try {
    data = JSON.parse(content)
  } catch {
    data = { result: content, success: false }
  }

  const { success, screenshot, url, action, result, steps } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: success ? 'rgba(100,180,60,0.08)' : 'rgba(220,80,60,0.08)', border: `1px solid ${success ? 'rgba(100,180,60,0.25)' : 'rgba(220,80,60,0.25)'}`, borderRadius: '4px' }}>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em', color: success ? 'rgba(100,200,60,0.8)' : 'rgba(220,100,80,0.8)' }}>
          {success ? '✦ BROWSER ACTION COMPLETE' : '⚠ BROWSER AGENT PENDING'}
        </span>
        {url && (
          <span style={{ fontSize: '11px', color: 'rgba(208,197,175,0.5)', marginLeft: '8px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {url}
          </span>
        )}
      </div>

      {/* Screenshot */}
      {screenshot && !imgError && (
        <div style={{ border: '1px solid rgba(212,175,55,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '6px 12px', background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.1em', color: accentColor }}>SCREENSHOT</span>
            {url && <span style={{ fontSize: '10px', color: 'rgba(208,197,175,0.4)', fontFamily: 'monospace' }}>{url.slice(0, 50)}</span>}
          </div>
          <img
            src={screenshot.startsWith('data:') ? screenshot : `data:image/png;base64,${screenshot}`}
            alt="Browser screenshot"
            onError={() => setImgError(true)}
            style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'contain', background: '#fff' }}
          />
        </div>
      )}

      {/* Action taken */}
      {action && (
        <div style={{ fontSize: '12px', color: 'rgba(208,197,175,0.6)', fontFamily: 'monospace', padding: '8px 12px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '4px' }}>
          <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: '9px', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>INSTRUCTION</span>
          {action}
        </div>
      )}

      {/* Result text */}
      {result && (
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
          {result}
        </div>
      )}

      {/* Steps taken */}
      {steps && steps.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(212,175,55,0.08)', paddingTop: '10px' }}>
          <div style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.12em', color: 'rgba(212,175,55,0.4)', marginBottom: '8px' }}>STEPS EXECUTED</div>
          {steps.map((step, i) => (
            <div key={i} style={{ fontSize: '11px', color: 'rgba(208,197,175,0.6)', padding: '3px 0 3px 12px', borderLeft: '2px solid rgba(212,175,55,0.2)', marginBottom: '4px', fontFamily: 'monospace' }}>
              {i + 1}. {step}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


export default function RichOutput({
  content, requestType, platformLabel, creditsUsed, creditsRemaining, accentColor = '#D4AF37'
}: RichOutputProps) {

  const codeMatch = content.match(/```(\w+)?\n([\s\S]*?)```/)

  if (requestType === 'code' || codeMatch) {
    return <CodeOutput content={content} accentColor={accentColor} />
  }

  if (requestType === 'research' || requestType === 'website_analysis') {
    return <ResearchOutput content={content} accentColor={accentColor} />
  }

  if (requestType === 'browser_control' || requestType === 'browser_result') {
    return <BrowserOutput content={content} accentColor={accentColor} />
  }

  return <TextOutput content={content} accentColor={accentColor} />
}
