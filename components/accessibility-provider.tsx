"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AccessibilityContextType {
  colorblindMode: boolean
  setColorblindMode: (value: boolean) => void
  highContrast: boolean
  setHighContrast: (value: boolean) => void
  audioDescriptionEnabled: boolean
  setAudioDescriptionEnabled: (value: boolean) => void
  speak: (text: string) => void
  fontSize: number
  setFontSize: (value: number) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [colorblindMode, setColorblindMode] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [audioDescriptionEnabled, setAudioDescriptionEnabled] = useState(false)
  const [fontSize, setFontSize] = useState(100)

  useEffect(() => {
    const saved = localStorage.getItem("accessibility-settings")
    if (saved) {
      const settings = JSON.parse(saved)
      setColorblindMode(settings.colorblindMode ?? false)
      setHighContrast(settings.highContrast ?? false)
      setAudioDescriptionEnabled(settings.audioDescriptionEnabled ?? false)
      setFontSize(settings.fontSize ?? 100)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "accessibility-settings",
      JSON.stringify({ colorblindMode, highContrast, audioDescriptionEnabled, fontSize })
    )

    const html = document.documentElement
    html.classList.toggle("colorblind-mode", colorblindMode)
    html.classList.toggle("high-contrast", highContrast)
    html.style.fontSize = `${fontSize}%`
  }, [colorblindMode, highContrast, audioDescriptionEnabled, fontSize])

  const speak = (text: string) => {
    if (audioDescriptionEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "pt-BR"
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <AccessibilityContext.Provider
      value={{
        colorblindMode,
        setColorblindMode,
        highContrast,
        setHighContrast,
        audioDescriptionEnabled,
        setAudioDescriptionEnabled,
        speak,
        fontSize,
        setFontSize,
      }}
    >
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider")
  }
  return context
}
