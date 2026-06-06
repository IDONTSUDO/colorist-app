import { useState, useEffect } from 'react'

export function useInstallPWA() {
    const [prompt, setPrompt] = useState<any>(null)

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault()
            setPrompt(e)
        }
        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const install = async () => {
        if (!prompt) return
        prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') setPrompt(null)
    }
    if (import.meta.env.DEV) {
        return { canInstall: true, install }
    }
    return { canInstall: !!prompt, install }
}
