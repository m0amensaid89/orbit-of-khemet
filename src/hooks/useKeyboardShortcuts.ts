'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts(options?: {
  onToggleSidebar?: () => void
  onNewChat?: () => void
  onOpenPalette?: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const mod = isMac ? e.metaKey : e.ctrlKey

      if (!mod) return

      switch (e.key.toLowerCase()) {
        case 'k':
          e.preventDefault()
          options?.onOpenPalette?.()
          break
        case 'n':
          e.preventDefault()
          options?.onNewChat?.()
          router.push('/hub')
          break
        case 'b':
          e.preventDefault()
          options?.onToggleSidebar?.()
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [options, router])
}
