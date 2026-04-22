import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true); return
    }
    if (sessionStorage.getItem('pwa_prompt_dismissed')) {
      setIsDismissed(true); return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') { setIsInstalled(true); setPrompt(null) }
    else { dismiss() }
  }

  const dismiss = () => {
    sessionStorage.setItem('pwa_prompt_dismissed', '1')
    setIsDismissed(true); setPrompt(null)
  }

  return { canInstall: !!prompt && !isInstalled && !isDismissed, install, dismiss, isInstalled }
}
