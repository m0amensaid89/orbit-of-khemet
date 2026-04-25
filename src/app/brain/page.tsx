'use client'
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslations } from '@/lib/translations';
import { useState, useEffect, useRef } from 'react'

interface KnowledgeSource {
  id: string
  name: string
  type: string
  file_size: number
  status: string
  created_at: string
}

interface Memory {
  id: string
  memory_text: string
  category: string
  source: string
  created_at: string
}

export default function BrainPage() {
  const [lang] = useLanguage()
  const t = useTranslations(lang)
  const [activeTab, setActiveTab] = useState<'knowledge' | 'memory' | 'import'>('knowledge')
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageLimit, setStorageLimit] = useState(52428800) // default 50MB for free tier
  const [userTier, setUserTier] = useState('')
  const [memories, setMemories] = useState<Memory[]>([])
  const [newMemoryText, setNewMemoryText] = useState('')
  const [newMemoryCategory, setNewMemoryCategory] = useState('general')
  const [memoryLoading, setMemoryLoading] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{extracted: number} | null>(null)
  const [importError, setImportError] = useState('')

  const loadSources = async () => {
    const res = await fetch('/api/brain/sources')
    const data = await res.json()
    setSources(data.sources || [])
  }

  const loadStorageInfo = async () => {
    const res = await fetch('/api/brain/storage')
    if (res.ok) {
      const data = await res.json()
      setStorageUsed(data.used_bytes || 0)
      setStorageLimit(data.limit_bytes || 52428800) // fallback 50MB
      setUserTier(data.tier || 'free')
    }
  }

  const loadMemories = async () => {
    const res = await fetch('/api/brain/memory')
    const data = await res.json()
    setMemories(data.memories || [])
  }

  useEffect(() => {
    loadSources()
    loadStorageInfo()
    loadMemories()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    const totalFiles = Array.from(files).length
    let fileIndex = 0
    for (const file of Array.from(files)) {
      fileIndex++
      setUploadProgress(`Uploading ${fileIndex} of ${totalFiles}: ${file.name}`)
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/brain/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) setError(data.error || 'Upload failed')
      } catch {
        setError(`Failed to upload ${file.name}`)
      }
    }
    setUploading(false)
    setUploadProgress('')
    await loadSources()
    await loadStorageInfo()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from your Brain?`)) return
    await fetch('/api/brain/sources', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadSources()
    await loadStorageInfo()
  }

  const handleAddMemory = async () => {
    if (!newMemoryText.trim()) return
    setMemoryLoading(true)
    await fetch('/api/brain/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memory_text: newMemoryText.trim(), category: newMemoryCategory }),
    })
    setNewMemoryText('')
    await loadMemories()
    setMemoryLoading(false)
  }

  const handleDeleteMemory = async (id: string) => {
    await fetch('/api/brain/memory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadMemories()
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const typeIcon: Record<string, string> = {
    pdf: '📄', image: '🖼️', video: '🎬', pptx: '📊',
    docx: '📝', xlsx: '📈', txt: '📋', default: '📁',
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(212,175,55,0.03)',
    border: '1px solid rgba(212,175,55,0.15)',
    color: '#d0c5af',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '13px',
    padding: '12px',
    borderRadius: '4px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }


  const handleImport = async () => {
    if (!importText.trim()) return
    setImporting(true)
    setImportError('')
    setImportResult(null)
    try {
      // Convert pasted conversation to messages array
      const lines = importText.trim().split('\n').filter(l => l.trim())
      const messages = lines.map(line => {
        const lower = line.toLowerCase()
        if (lower.startsWith('you:') || lower.startsWith('user:') || lower.startsWith('human:')) {
          return { role: 'user', content: line.replace(/^(you|user|human):/i, '').trim() }
        }
        if (lower.startsWith('assistant:') || lower.startsWith('chatgpt:') || lower.startsWith('claude:') || lower.startsWith('ai:') || lower.startsWith('gemini:')) {
          return { role: 'assistant', content: line.replace(/^(assistant|chatgpt|claude|ai|gemini):/i, '').trim() }
        }
        return { role: 'user', content: line }
      }).filter(m => m.content.length > 10)

      if (messages.length === 0) {
        setImportError('Could not parse any conversation turns. Format each line as "You: ..." or "Assistant: ..."')
        setImporting(false)
        return
      }

      // Get current user ID from session
      const sessionRes = await fetch('/api/credits')
      const sessionData = await sessionRes.json()
      const userId = sessionData?.userId

      const res = await fetch('/api/brain/extract-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.slice(-20), userId }),
      })
      const data = await res.json()
      setImportResult({ extracted: data.extracted || 0 })
      if (data.extracted > 0) {
        await loadMemories()
        setActiveTab('memory')
      }
    } catch {
      setImportError('Import failed. Please try again.')
    }
    setImporting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#d0c5af', fontFamily: 'Roboto, sans-serif', padding: '48px 40px' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '28px', marginBottom: '32px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.5)', marginBottom: '10px' }}>KHEMET.AI</div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '28px', color: '#D4AF37', letterSpacing: '0.08em', margin: '0 0 8px' }}>
          {lang === 'ar' ? 'عقل كيميت' : 'KHEMET BRAIN'}
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(208,197,175,0.5)', margin: 0 }}>
          {lang === 'ar' ? 'قاعدة معرفتك الشاملة — كل وكيل يقرأها قبل الإجابة.' : 'Your global knowledge vault. Every agent reads this before responding.'}
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', marginBottom: '32px', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
        {(['knowledge', 'memory', 'import'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #D4AF37' : '2px solid transparent',
              color: activeTab === tab ? '#D4AF37' : 'rgba(208,197,175,0.4)',
              fontFamily: activeTab === tab ? 'Cinzel Decorative, serif' : 'Roboto, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.12em',
              padding: '8px 0',
              marginRight: '32px',
              cursor: 'pointer',
              marginBottom: '-1px',
              textTransform: 'uppercase',
            }}
          >
            {tab === 'knowledge' ? (lang === 'ar' ? 'المعرفة' : 'KNOWLEDGE') : tab === 'memory' ? (lang === 'ar' ? 'الذاكرة' : 'MEMORY') : (lang === 'ar' ? 'الاستيراد' : 'IMPORT')}
          </button>
        ))}
      </div>

      {/* KNOWLEDGE TAB */}
      {activeTab === 'knowledge' && (
        <>
          {( // always show storage bar — limit defaults to 100MB
          true && (
            <div style={{ marginBottom: '32px', padding: '20px 24px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(212,175,55,0.7)' }}>{lang === 'ar' ? 'استخدام التخزين' : 'STORAGE USAGE'}</span>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '11px', color: 'rgba(208,197,175,0.6)' }}>
                  {storageUsed < 1024 * 1024 ? (<span dir="ltr">{(storageUsed / 1024).toFixed(1)} KB</span>) : (<span dir="ltr">{(storageUsed / (1024 * 1024)).toFixed(1)} MB</span>)} / {storageLimit < 1024 * 1024 * 1024 ? `${(storageLimit / (1024 * 1024)).toFixed(0)} MB` : `${(storageLimit / (1024 * 1024 * 1024)).toFixed(0)} GB`}
                </span>
              </div>
              <div style={{ height: '4px', background: 'rgba(212,175,55,0.08)', position: 'relative' }}>
                <div style={{ height: '100%', width: `${Math.min((storageUsed / storageLimit) * 100, 100).toFixed(1)}%`, background: storageUsed / storageLimit > 0.9 ? '#ef4444' : storageUsed / storageLimit > 0.7 ? '#f59e0b' : '#D4AF37', transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ marginTop: '6px', fontSize: '10px', color: 'rgba(208,197,175,0.35)', fontFamily: 'monospace' }}>{lang === 'ar' ? t.brain.planLabel : userTier.replace(/_/g, ' ').toUpperCase() + ' PLAN'}</div>
            </div>
          )}

          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              border: '1px dashed rgba(212,175,55,0.3)',
              padding: '40px',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              marginBottom: '40px',
              background: 'rgba(212,175,55,0.02)',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⬆</div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.12em', color: '#D4AF37', marginBottom: '8px' }}>
              {uploading ? uploadProgress : lang === 'ar' ? 'رفع إلى عقل كيميت' : 'UPLOAD TO BRAIN'}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(208,197,175,0.4)' }}>
              PDF · DOCX · XLSX · PPT · TXT · Images · Video · Select multiple files at once
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', padding: '12px 16px', marginBottom: '24px', fontSize: '12px', color: 'rgba(255,120,120,0.9)' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.5)' }}>
            {lang === 'ar' ? 'مصادر المعرفة' : 'KNOWLEDGE SOURCES'} ({sources.length})
          </div>

          {sources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(208,197,175,0.25)', fontSize: '12px' }}>
              {lang === 'ar' ? 'لا توجد مصادر بعد. ارفع أول ملف للبدء.' : 'Brain is empty. Upload your first document to begin.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sources.map(source => (
                <div key={source.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid rgba(212,175,55,0.12)', background: 'rgba(212,175,55,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '20px' }}>{typeIcon[source.type] || typeIcon.default}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: '#d0c5af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.name}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(208,197,175,0.4)', marginTop: '2px', letterSpacing: '0.06em' }}>
                        {source.type.toUpperCase()} · {formatSize(source.file_size)} · {formatDate(source.created_at)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', letterSpacing: '0.1em', color: source.status === 'ready' ? 'rgba(100,220,100,0.7)' : 'rgba(212,175,55,0.5)', fontFamily: 'monospace' }}>
                      {source.status.toUpperCase()}
                    </span>
                    <button onClick={() => handleDelete(source.id, source.name)} style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.5)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MEMORY TAB */}
      {activeTab === 'memory' && (
        <>
          {/* Add Memory Form */}
          <div style={{ marginBottom: '40px', padding: '24px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.5)', marginBottom: '16px' }}>ADD MEMORY</div>
            <textarea
              rows={3}
              placeholder="Add a memory the agents should know about you..."
              value={newMemoryText}
              onChange={e => setNewMemoryText(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: '12px', display: 'block' }}
            />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select
                value={newMemoryCategory}
                onChange={e => setNewMemoryCategory(e.target.value)}
                style={{ ...inputStyle, width: 'auto', flex: 1 }}
              >
                <option value="general">General</option>
                <option value="preferences">Preferences</option>
                <option value="goals">Goals</option>
                <option value="business_context">Business Context</option>
                <option value="personal_context">Personal Context</option>
              </select>
              <button
                onClick={handleAddMemory}
                disabled={memoryLoading || !newMemoryText.trim()}
                style={{
                  background: memoryLoading || !newMemoryText.trim() ? 'rgba(212,175,55,0.3)' : '#D4AF37',
                  color: '#0A0A0A',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  padding: '12px 24px',
                  border: 'none',
                  cursor: memoryLoading || !newMemoryText.trim() ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {memoryLoading ? 'SAVING...' : 'ADD MEMORY'}
              </button>
            </div>
          </div>

          {/* Memory List */}
          <div style={{ marginBottom: '16px', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.5)' }}>
            {lang === 'ar' ? 'ذاكرة الوكلاء' : 'AGENT MEMORIES'} ({memories.length})
          </div>

          {memories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(208,197,175,0.25)', fontSize: '12px' }}>
              No memories yet. Agents will learn about you as you chat.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {memories.map(memory => (
                <div key={memory.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid rgba(212,175,55,0.12)', background: 'rgba(212,175,55,0.02)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '9px', color: 'rgba(212,175,55,0.7)', letterSpacing: '0.1em', fontFamily: 'monospace', marginBottom: '6px', display: 'inline-block' }}>
                      {memory.category.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <div style={{ fontSize: '13px', color: '#d0c5af', lineHeight: '1.5' }}>{memory.memory_text}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(208,197,175,0.4)', marginTop: '6px', letterSpacing: '0.06em' }}>
                      {memory.source.toUpperCase()} · {formatDate(memory.created_at)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMemory(memory.id)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.5)', cursor: 'pointer', fontSize: '16px', padding: '4px', marginLeft: '12px', flexShrink: 0 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* IMPORT TAB */}
      {activeTab === 'import' && (
        <>
          <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.5)', marginBottom: '12px' }}>IMPORT CONVERSATION</div>
            <p style={{ fontSize: '12px', color: 'rgba(208,197,175,0.5)', marginBottom: '14px', lineHeight: '1.6' }}>
              Paste exported conversation history from ChatGPT, Claude, or Gemini. Format each line as:
              <br /><strong style={{ color: 'rgba(212,175,55,0.6)' }}>You: your message</strong> or <strong style={{ color: 'rgba(212,175,55,0.6)' }}>Assistant: response</strong>
            </p>
            <textarea
              rows={10}
              placeholder="You: message&#10;Assistant: response&#10;You: next message..."
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportError(''); setImportResult(null); }}
              style={{
                width: '100%', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.15)',
                color: '#d0c5af', fontFamily: 'Roboto, sans-serif', fontSize: '12px', padding: '12px',
                borderRadius: '4px', resize: 'vertical', outline: 'none', marginBottom: '12px', display: 'block',
              }}
            />
            {importError && (
              <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', padding: '10px 14px', fontSize: '12px', color: 'rgba(255,120,120,0.8)', marginBottom: '12px' }}>
                {importError}
              </div>
            )}
            {importResult && (
              <div style={{ background: 'rgba(100,220,100,0.06)', border: '1px solid rgba(100,220,100,0.2)', padding: '10px 14px', fontSize: '12px', color: 'rgba(100,220,100,0.8)', marginBottom: '12px' }}>
                {importResult.extracted > 0
                  ? `${importResult.extracted} memor${importResult.extracted === 1 ? 'y' : 'ies'} extracted and saved. Switching to Memory tab...`
                  : 'No memorable facts found in this conversation. Try a longer export with more personal context.'}
              </div>
            )}
            <button
              onClick={handleImport}
              disabled={importing || !importText.trim()}
              style={{
                background: importing || !importText.trim() ? 'rgba(212,175,55,0.3)' : '#D4AF37',
                color: '#0A0A0A', fontFamily: 'Orbitron, sans-serif', fontSize: '10px',
                letterSpacing: '0.1em', padding: '12px 24px', border: 'none', cursor: importing || !importText.trim() ? 'not-allowed' : 'pointer', borderRadius: '4px',
              }}
            >
              {importing ? 'EXTRACTING MEMORIES...' : 'EXTRACT MEMORIES FROM IMPORT'}
            </button>
          </div>

          <div style={{ fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.4)', marginBottom: '12px' }}>HOW TO EXPORT</div>
          {[
            { platform: 'ChatGPT', steps: 'Settings → Data Controls → Export Data → Download → Open conversations.json and copy relevant chat text' },
            { platform: 'Claude', steps: 'Open a conversation → Copy all text from the thread → Paste here with You: / Assistant: format' },
            { platform: 'Gemini', steps: 'Google Takeout → Select Gemini → Export → Copy conversation text here' },
          ].map(item => (
            <div key={item.platform} style={{ marginBottom: '10px', padding: '12px 14px', background: 'rgba(212,175,55,0.02)', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em', color: 'rgba(212,175,55,0.6)', marginBottom: '4px' }}>{item.platform}</div>
              <div style={{ fontSize: '11px', color: 'rgba(208,197,175,0.5)', lineHeight: '1.5' }}>{item.steps}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}