'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string
  color: string
  created_at: string
}

interface Thread {
  id: string
  title: string
  hero_slug: string
  updated_at: string
}

export default function ProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [projRes, threadsRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/threads?projectId=${id}`)
      ])
      const projData = await projRes.json()
      const threadsData = await threadsRes.json()
      setProject(projData.project)
      setThreads(threadsData.threads || [])
      setLoading(false)
    }
    if (id) load()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this project?')) return
    await fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'monospace' }}>
      LOADING...
    </div>
  )

  if (!project) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'monospace' }}>
      PROJECT NOT FOUND
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: '40px 32px', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.5)', marginBottom: '6px' }}>PROJECT</div>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '24px', color: '#D4AF37', letterSpacing: '0.08em', margin: 0 }}>
            {project.name}
          </h1>
          {project.description && (
            <p style={{ color: 'rgba(208,197,175,0.6)', fontSize: '12px', marginTop: '6px' }}>{project.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          style={{ fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(255,80,80,0.6)', background: 'transparent', border: '1px solid rgba(255,80,80,0.3)', padding: '6px 14px', cursor: 'pointer', fontFamily: 'monospace' }}
        >
          DELETE PROJECT
        </button>
      </div>

      {/* Missions in this project */}
      <div style={{ marginBottom: '16px', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.5)' }}>
        MISSIONS IN PROJECT ({threads.length})
      </div>

      {threads.length === 0 ? (
        <div style={{ color: 'rgba(208,197,175,0.3)', fontSize: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          No missions assigned to this project yet.
          <br />Start a new mission and assign it here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {threads.map(thread => (
            <Link
              key={thread.id}
              href={`/chat/${thread.hero_slug?.toLowerCase()}?thread=${thread.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid rgba(212,175,55,0.15)',
                background: 'rgba(212,175,55,0.03)',
                textDecoration: 'none',
                color: '#d0c5af',
                fontSize: '12px',
              }}
            >
              <span>✦ {thread.title || 'Untitled Mission'}</span>
              <span style={{ fontSize: '10px', color: 'rgba(212,175,55,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {thread.hero_slug}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
