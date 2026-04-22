'use client'

import { useLanguage } from '@/hooks/useLanguage';
import { useTranslations } from '@/lib/translations';
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'

type Project = {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  chat_threads?: { count: number }[] | { count: number }
}

const COLOR_PRESETS = [
  '#D4AF37', // Gold
  '#3A6DD4', // Blue
  '#00C9B1', // Teal
  '#9B59B6', // Purple
  '#E74C3C', // Red
  '#C0C0C0'  // Silver
]

export default function ProjectsPage() {
  const router = useRouter()
  const [lang] = useLanguage()
  const t = useTranslations(lang)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New project state
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.projects) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Failed to fetch projects', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim() || null,
          color: newColor
        })
      })
      const data = await res.json()
      if (data.project) {
        setProjects([data.project, ...projects])
        setIsModalOpen(false)
        setNewName('')
        setNewDesc('')
        setNewColor(COLOR_PRESETS[0])
      }
    } catch (error) {
      console.error('Failed to create project', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getThreadCount = (project: Project) => {
    if (Array.isArray(project.chat_threads)) {
      return project.chat_threads[0]?.count || 0
    }
    return project.chat_threads?.count || 0
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#d0c5af] p-8 pb-24 md:pb-8 pt-16 md:pt-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="font-orbitron tracking-widest text-xl text-[#D4AF37] uppercase flex items-center gap-3">
          <span className="text-[#D4AF37]">✦</span> YOUR PROJECTS
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-transparent border border-[rgba(212,175,55,0.3)] text-[#D4AF37] px-4 py-2 font-orbitron tracking-widest text-xs hover:bg-[rgba(212,175,55,0.1)] transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> {lang === 'ar' ? 'مشروع جديد' : 'NEW PROJECT'}
        </button>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.12)] rounded-sm" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.03)]">
          <p className="text-[#d0c5af]/70 mb-6 font-roboto">{lang === 'ar' ? 'لا توجد مشاريع بعد.' : 'No projects yet.'} Create your first empire project.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[rgba(212,175,55,0.1)] border border-[#D4AF37] text-[#D4AF37] px-6 py-3 font-orbitron tracking-widest text-sm hover:bg-[rgba(212,175,55,0.2)] transition-colors"
          >
            + {lang === 'ar' ? 'مشروع جديد' : 'NEW PROJECT'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.12)] hover:bg-[rgba(212,175,55,0.06)] transition-all overflow-hidden relative min-h-[160px] flex flex-col"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                style={{ backgroundColor: project.color || '#D4AF37' }}
              />
              <div className="pl-6 p-5 flex-1 flex flex-col">
                <h3 className="font-cinzel text-xl text-white mb-2">{project.name}</h3>
                <p className="text-sm text-[#d0c5af]/80 font-roboto line-clamp-2 flex-1">
                  {project.description || (lang === 'ar' ? 'لا يوجد وصف' : 'No description provided.')}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-[#d0c5af]/50 font-roboto border-t border-[rgba(212,175,55,0.1)] pt-3">
                  <span dir="ltr">{getThreadCount(project)}</span> {lang === "ar" ? "مهام" : "Missions"}
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#D4AF37] w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#d0c5af]/50 hover:text-[#D4AF37] transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-6 border-b border-[rgba(212,175,55,0.2)]">
              <h2 className="font-orbitron tracking-widest text-[#D4AF37] text-lg uppercase">
                {lang === 'ar' ? 'إنشاء المشروع' : 'Initialize Project'}
              </h2>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-6">
              <div>
                <label className="block font-orbitron text-xs tracking-wider text-[#d0c5af]/70 mb-2">
                  {lang === 'ar' ? 'اسم المشروع' : 'PROJECT DESIGNATION'}
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] text-white p-3 font-roboto outline-none transition-colors"
                  placeholder="e.g. Operation Horizon"
                />
              </div>

              <div>
                <label className="block font-orbitron text-xs tracking-wider text-[#d0c5af]/70 mb-2">
                  {lang === 'ar' ? 'الهدف (اختياري)' : 'OBJECTIVE (OPTIONAL)'}
                </label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] text-white p-3 font-roboto outline-none transition-colors resize-none"
                  placeholder="Define the scope..."
                />
              </div>

              <div>
                <label className="block font-orbitron text-xs tracking-wider text-[#d0c5af]/70 mb-2">
                  {lang === 'ar' ? 'لون المشروع' : 'PROJECT SIGNATURE (COLOR)'}
                </label>
                <div className="flex gap-3">
                  {COLOR_PRESETS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newColor === color ? 'scale-110 ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#0A0A0A]' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-orbitron text-xs tracking-widest text-[#d0c5af]/70 hover:text-white"
                >
                  {lang === 'ar' ? 'إلغاء' : 'CANCEL'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim()}
                  className="bg-[rgba(212,175,55,0.1)] border border-[#D4AF37] text-[#D4AF37] px-6 py-2 font-orbitron text-xs tracking-widest hover:bg-[rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? 'INITIALIZING...' : 'CREATE PROJECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}