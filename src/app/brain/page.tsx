'use client'
import { useState, useEffect, useRef } from 'react'

interface KnowledgeSource {
  id: string
  name: string
  type: string
  file_size: number
  status: string
  created_at: string
}

export default function BrainPage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageLimit, setStorageLimit] = useState(0)
  const [userTier, setUserTier] = useState("")

  const loadSources = async () => {
    const res = await fetch('/api/brain/sources')
    const data = await res.json()
    setSources(data.sources || [])
  }

  const loadStorageInfo = async () => {
    const res = await fetch("/api/brain/storage")
    if (res.ok) {
      const data = await res.json()
      setStorageUsed(data.used_bytes || 0)
      setStorageLimit(data.limit_bytes || 0)
      setUserTier(data.tier || "free")
    }
  }

  useEffect(() => { loadSources(); loadStorageInfo() }, [])

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
    docx: '📝', xlsx: '📈', txt: '📋', default: '📁'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#d0c5af', fontFamily: 'Roboto, sans-serif', padding: '48px 40px' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '28px', marginBottom: '40px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.5)', marginBottom: '10px' }}>KHEMET.AI</div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '28px', color: '#D4AF37', letterSpacing: '0.08em', margin: '0 0 8px' }}>
          KHEMET BRAIN
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(208,197,175,0.5)', margin: 0 }}>
          Your global knowledge vault. Every agent reads this before responding.
        </p>
      </div>

      {storageLimit > 0 && (
        <div style={{ marginBottom: "32px", padding: "20px 24px", background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", color: "rgba(212,175,55,0.7)" }}>STORAGE USAGE</span>
            <span style={{ fontFamily: "Roboto, sans-serif", fontSize: "11px", color: "rgba(208,197,175,0.6)" }}>
              {storageUsed < 1024*1024 ? `${(storageUsed/1024).toFixed(1)} KB` : `${(storageUsed/(1024*1024)).toFixed(1)} MB`} / {storageLimit < 1024*1024*1024 ? `${(storageLimit/(1024*1024)).toFixed(0)} MB` : `${(storageLimit/(1024*1024*1024)).toFixed(0)} GB`}
            </span>
          </div>
          <div style={{ height: "4px", background: "rgba(212,175,55,0.08)", position: "relative" }}>
            <div style={{ height: "100%", width: `${Math.min((storageUsed/storageLimit)*100,100).toFixed(1)}%`, background: storageUsed/storageLimit > 0.9 ? "#ef4444" : storageUsed/storageLimit > 0.7 ? "#f59e0b" : "#D4AF37", transition: "width 0.4s ease" }} />
          </div>
          <div style={{ marginTop: "6px", fontSize: "10px", color: "rgba(208,197,175,0.35)", fontFamily: "monospace" }}>{userTier.replace(/_/g, " ").toUpperCase()} PLAN</div>
        </div>
      )}

      {/* Upload Zone */}
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
          {uploading ? uploadProgress : 'UPLOAD TO BRAIN'}
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

      {/* Sources List */}
      <div style={{ marginBottom: '16px', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.5)' }}>
        KNOWLEDGE SOURCES ({sources.length})
      </div>

      {sources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(208,197,175,0.25)', fontSize: '12px' }}>
          Brain is empty. Upload your first document to begin.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sources.map(source => (
            <div key={source.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(212,175,55,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '20px' }}>{typeIcon[source.type] || typeIcon.default}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: '#d0c5af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {source.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(208,197,175,0.4)', marginTop: '2px', letterSpacing: '0.06em' }}>
                    {source.type.toUpperCase()} · {formatSize(source.file_size)} · {formatDate(source.created_at)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                <span style={{
                  fontSize: '9px', letterSpacing: '0.1em',
                  color: source.status === 'ready' ? 'rgba(100,220,100,0.7)' : 'rgba(212,175,55,0.5)',
                  fontFamily: 'monospace',
                }}>
                  {source.status.toUpperCase()}
                </span>
                <button
                  onClick={() => handleDelete(source.id, source.name)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.5)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}