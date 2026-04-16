'use client'

import React, { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, FileText, Upload, Clock, Image as ImageIcon, Check } from 'lucide-react'
import HeroAgentModal from './HeroAgentModal'
import { getHero } from '@/lib/heroes'
import { heroAgents } from '@/lib/agents'

type Project = {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  instructions: string | null
  created_at: string
}

type Thread = {
  id: string
  title: string
  hero_slug: string
  agent_slug: string | null
  updated_at: string
}

type KnowledgeSource = {
  id: string
  name: string
  type: string
  file_size: number
  created_at: string
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [files, setFiles] = useState<KnowledgeSource[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Editable states
  const [instructions, setInstructions] = useState('')
  const [isSavingInstructions, setIsSavingInstructions] = useState(false)
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)

  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')

  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [editDesc, setEditDesc] = useState('')

  const [isUploading, setIsUploading] = useState(false)

  const fetchProjectData = async () => {
    try {
      const [projRes, threadsRes, filesRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/threads?projectId=${projectId}`),
        fetch(`/api/brain/sources`)
      ])

      const projData = await projRes.json()
      const threadsData = await threadsRes.json()
      const filesData = await filesRes.json()

      if (projData.project) {
        setProject(projData.project)
        setInstructions(projData.project.instructions || '')
        setEditName(projData.project.name)
        setEditDesc(projData.project.description || '')
      }
      if (threadsData.threads) setThreads(threadsData.threads)

      // Note: We currently don't have project_id filtering on /api/brain/sources in the API.
      // Ideally we would filter by project_id here or on the server.
      // For now, if the API doesn't support it, we'll just show the user's files.
      // In a real implementation, you'd want to link files to projects.
      if (filesData.sources) setFiles(filesData.sources)

    } catch (error) {
      console.error('Failed to fetch project data', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const handlePatchProject = async (updates: Partial<Project>) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      if (data.project) {
        setProject(data.project)
      }
    } catch (error) {
      console.error('Failed to update project', error)
    }
  }

  const handleSaveInstructions = async () => {
    if (instructions === project?.instructions) return
    setIsSavingInstructions(true)
    await handlePatchProject({ instructions })
    setIsSavingInstructions(false)
    setShowSavedIndicator(true)
    setTimeout(() => setShowSavedIndicator(false), 2000)
  }

  const handleSaveName = async () => {
    setIsEditingName(false)
    if (editName.trim() && editName !== project?.name) {
      await handlePatchProject({ name: editName.trim() })
    } else {
      setEditName(project?.name || '')
    }
  }

  const handleSaveDesc = async () => {
    setIsEditingDesc(false)
    if (editDesc.trim() !== project?.description) {
      await handlePatchProject({ description: editDesc.trim() })
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? All threads will remain but will lose their project association.')) return

    try {
      await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId })
      })
      router.push('/projects')
    } catch (error) {
      console.error('Failed to delete project', error)
    }
  }

  const handleCreateMission = async (heroSlug: string, agentId: string | null, agentName: string | null) => {
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroSlug,
          agentId,
          projectId,
          title: 'New Mission'
        })
      })
      const data = await res.json()
      if (data.thread) {
        setIsModalOpen(false)
        const url = `/chat/${heroSlug}?thread=${data.thread.id}${agentId ? `&agent=${agentId}` : ''}`
        router.push(url)
      }
    } catch (error) {
      console.error('Failed to create thread', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId) // Add projectId to form data

    try {
      const res = await fetch('/api/brain/upload', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        fetchProjectData() // Refresh files list
      }
    } catch (error) {
      console.error('Upload failed', error)
    } finally {
      setIsUploading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const totalStorage = files.reduce((acc, file) => acc + file.file_size, 0)
  const maxStorage = 50 * 1024 * 1024 // Assuming 50MB free tier for display
  const storagePercentage = Math.min((totalStorage / maxStorage) * 100, 100)

  if (isLoading) return <div className="min-h-screen bg-[#0A0A0A] p-8 flex justify-center items-center"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
  if (!project) return <div className="min-h-screen bg-[#0A0A0A] p-8 text-white">Project not found.</div>

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#d0c5af] p-8 pb-24 md:pb-8 pt-20 md:pt-8 max-w-[1600px] mx-auto">

      <div className="flex flex-col lg:flex-row gap-8 h-full">

        {/* LEFT COLUMN: PROJECT IDENTITY (30%) */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6">
          <div className="relative pl-6 py-4 bg-[rgba(212,175,55,0.02)] border border-[rgba(212,175,55,0.1)] h-full min-h-[400px]">
            <div
              className="absolute left-0 top-0 bottom-0 w-2"
              style={{ backgroundColor: project.color || '#D4AF37' }}
            />

            <div className="space-y-8 pr-4">
              {/* Icon & Name */}
              <div className="flex gap-4 items-center">
                {/* Icon display */}
                <div className="w-16 h-16 rounded flex items-center justify-center text-3xl cursor-pointer hover:bg-[rgba(212,175,55,0.1)] transition-colors border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)]"
                     onClick={() => {
                       const newIcon = prompt('Enter a single emoji icon:', project.icon || '🚀')
                       if (newIcon && newIcon !== project.icon) {
                         handlePatchProject({ icon: newIcon })
                       }
                     }}
                     title="Click to edit icon"
                >
                  {project.icon || '🚀'}
                </div>

                <div className="flex-1">
                  {isEditingName ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                    className="w-full bg-transparent border-b border-[#D4AF37] text-3xl font-cinzel text-white outline-none"
                  />
                ) : (
                  <h1
                    onClick={() => setIsEditingName(true)}
                    className="text-3xl font-cinzel text-white cursor-pointer hover:text-[#D4AF37] transition-colors break-words"
                    title="Click to edit"
                  >
                    {project.name}
                  </h1>
                )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-orbitron text-[10px] tracking-widest text-[#d0c5af]/50 mb-2 uppercase">Project Scope</h3>
                {isEditingDesc ? (
                  <textarea
                    autoFocus
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    onBlur={handleSaveDesc}
                    className="w-full bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] text-sm font-roboto text-[#d0c5af] outline-none p-2 resize-none h-24"
                  />
                ) : (
                  <p
                    onClick={() => setIsEditingDesc(true)}
                    className={`text-sm font-roboto cursor-pointer hover:bg-[rgba(212,175,55,0.05)] p-2 -ml-2 rounded transition-colors min-h-[60px] ${!project.description ? 'text-[#d0c5af]/30 italic' : 'text-[#d0c5af]/80'}`}
                    title="Click to edit"
                  >
                    {project.description || 'Click to add a description...'}
                  </p>
                )}
              </div>

              {/* Energy */}
              <div>
                <h3 className="font-orbitron text-[10px] tracking-widest text-[#d0c5af]/50 mb-2 uppercase flex items-center gap-2">
                  <span className="text-[#D4AF37]">✦</span> GRID ENERGY UTILIZED
                </h3>
                <div className="text-2xl font-orbitron text-[#D4AF37]">0</div>
                <div className="text-xs font-roboto text-[#d0c5af]/50 mt-1">Energy tracking coming soon</div>
              </div>

              {/* Meta */}
              <div className="pt-8 border-t border-[rgba(212,175,55,0.1)]">
                <div className="flex items-center gap-2 text-xs font-roboto text-[#d0c5af]/40">
                  <Clock size={12} />
                  Initialized {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Delete */}
              <div className="pt-4">
                <button
                  onClick={handleDeleteProject}
                  className="flex items-center gap-2 text-xs font-orbitron tracking-widest text-red-500/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 px-4 py-2 transition-all w-full justify-center"
                >
                  <Trash2 size={14} /> DELETE PROJECT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: MISSIONS (40%) */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 h-full min-h-[500px]">
          <div className="flex items-center justify-between">
            <h2 className="font-orbitron tracking-widest text-[#D4AF37] uppercase flex items-center gap-3">
              <span className="text-[#D4AF37]">✦</span> ACTIVE MISSIONS
              <span className="bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] text-xs px-2 py-0.5">
                {threads.length}
              </span>
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[rgba(212,175,55,0.1)] border border-[#D4AF37] text-[#D4AF37] px-4 py-1.5 font-orbitron tracking-widest text-[10px] hover:bg-[rgba(212,175,55,0.2)] transition-colors flex items-center gap-2"
            >
              <Plus size={12} /> NEW MISSION
            </button>
          </div>

          <div className="flex-1 bg-[rgba(212,175,55,0.02)] border border-[rgba(212,175,55,0.1)] p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {threads.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <p className="text-[#d0c5af]/50 font-roboto mb-4">No missions yet. Launch your first operative.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-transparent border border-[rgba(212,175,55,0.3)] text-[#D4AF37] px-6 py-2 font-orbitron tracking-widest text-xs hover:bg-[rgba(212,175,55,0.1)] transition-colors"
                >
                  INITIALIZE
                </button>
              </div>
            ) : (
              threads.map(thread => {
                const hero = getHero(thread.hero_slug)
                const agent = thread.agent_slug ? (heroAgents[thread.hero_slug] || []).find(a => a.id === thread.agent_slug) : null

                return (
                  <Link
                    key={thread.id}
                    href={`/chat/${thread.hero_slug}?thread=${thread.id}${thread.agent_slug ? `&agent=${thread.agent_slug}` : ''}`}
                    className="block bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.1)] hover:bg-[rgba(212,175,55,0.08)] hover:border-[#D4AF37]/50 p-4 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-roboto font-medium text-white group-hover:text-[#D4AF37] transition-colors truncate pr-4">
                        {thread.title}
                      </h3>
                      <span className="text-[10px] font-roboto text-[#d0c5af]/40 whitespace-nowrap">
                        {timeAgo(thread.updated_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]"
                        style={{ backgroundColor: hero?.accentColor || '#D4AF37', color: hero?.accentColor || '#D4AF37' }}
                      />
                      <span className="font-orbitron text-[10px] tracking-wider text-[#d0c5af]/80 uppercase">
                        {hero?.name || thread.hero_slug}
                      </span>
                      {agent && (
                        <>
                          <span className="text-[#d0c5af]/30">•</span>
                          <span className="font-roboto text-[11px] text-[#d0c5af]/60">
                            {agent.name}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INSTRUCTIONS & FILES (30%) */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6">

          {/* Section A: Instructions */}
          <div className="flex flex-col flex-1 min-h-[250px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron tracking-widest text-[#D4AF37] uppercase flex items-center gap-3 text-sm">
                <span className="text-[#D4AF37]">✦</span> PROJECT INSTRUCTIONS
              </h2>
              {showSavedIndicator && (
                <span className="text-[#D4AF37] text-[10px] font-orbitron tracking-widest flex items-center gap-1">
                  <Check size={10} /> SAVED
                </span>
              )}
            </div>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              onBlur={handleSaveInstructions}
              placeholder="Set context and instructions for all agents in this project. Every agent will inherit this context when chatting."
              className="w-full flex-1 min-h-[150px] bg-[rgba(212,175,55,0.02)] border border-[rgba(212,175,55,0.1)] focus:border-[#D4AF37]/50 focus:bg-[rgba(212,175,55,0.04)] text-sm font-roboto text-[#d0c5af] p-4 outline-none resize-none transition-all custom-scrollbar placeholder:text-[#d0c5af]/30"
            />
            <div className="text-right mt-1 text-[10px] font-roboto text-[#d0c5af]/40">
              {instructions.length} characters
            </div>
          </div>

          {/* Section B: Files */}
          <div className="flex flex-col flex-1 min-h-[250px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron tracking-widest text-[#D4AF37] uppercase flex items-center gap-3 text-sm">
                <span className="text-[#D4AF37]">✦</span> PROJECT FILES
              </h2>
              <label className="cursor-pointer bg-[rgba(212,175,55,0.1)] border border-[#D4AF37] text-[#D4AF37] px-3 py-1 font-orbitron tracking-widest text-[10px] hover:bg-[rgba(212,175,55,0.2)] transition-colors flex items-center gap-2">
                <Upload size={10} /> {isUploading ? 'UPLOADING...' : 'UPLOAD'}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,.csv,.pptx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            <div className="flex-1 bg-[rgba(212,175,55,0.02)] border border-[rgba(212,175,55,0.1)] p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              {files.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-[#d0c5af]/40 font-roboto text-sm p-4">
                  No files uploaded. Add context files for your agents.
                </div>
              ) : (
                files.map(file => (
                  <div key={file.id} className="bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.08)] p-3 flex items-center gap-3 group">
                    {file.type === 'image' ? <ImageIcon size={16} className="text-[#D4AF37]/70" /> : <FileText size={16} className="text-[#D4AF37]/70" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-roboto text-[#d0c5af] truncate" title={file.name}>{file.name}</div>
                      <div className="text-[10px] text-[#d0c5af]/50 uppercase">{file.type} • {formatBytes(file.file_size)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Storage Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-roboto text-[#d0c5af]/60 mb-1">
                <span>Storage Utilized</span>
                <span>{formatBytes(totalStorage)} / {formatBytes(maxStorage)}</span>
              </div>
              <div className="h-1 bg-[rgba(212,175,55,0.1)] w-full">
                <div
                  className="h-full bg-[#D4AF37] transition-all duration-500"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <HeroAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleCreateMission}
      />
    </div>
  )
}
