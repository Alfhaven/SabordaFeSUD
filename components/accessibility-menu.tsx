"use client"

import { Eye, Volume2, Minus, Plus, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useAccessibility } from "@/components/accessibility-provider"
import { useState, useEffect } from "react"

export function AccessibilityMenu() {
  const {
    colorblindMode,
    setColorblindMode,
    highContrast,
    setHighContrast,
    audioDescriptionEnabled,
    setAudioDescriptionEnabled,
    speak,
    fontSize,
    setFontSize,
  } = useAccessibility()

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const isDarkMode = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(isDarkMode)
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const newValue = !isDark
    setIsDark(newValue)
    document.documentElement.classList.toggle("dark", newValue)
    localStorage.setItem("theme", newValue ? "dark" : "light")
    if (audioDescriptionEnabled) {
      speak(newValue ? "Modo escuro ativado" : "Modo claro ativado")
    }
  }

  const handleColorblindToggle = () => {
    const newValue = !colorblindMode
    setColorblindMode(newValue)
    if (audioDescriptionEnabled) {
      speak(newValue ? "Modo daltonismo ativado" : "Modo daltonismo desativado")
    }
  }

  const handleHighContrastToggle = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    if (audioDescriptionEnabled) {
      speak(newValue ? "Alto contraste ativado" : "Alto contraste desativado")
    }
  }

  const handleAudioToggle = () => {
    const newValue = !audioDescriptionEnabled
    setAudioDescriptionEnabled(newValue)
    if (newValue) {
      speak("Audiodescrição ativada. Você receberá descrições em áudio das ações do site.")
    }
  }

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(80, Math.min(150, fontSize + delta))
    setFontSize(newSize)
    if (audioDescriptionEnabled) {
      speak(`Tamanho da fonte: ${newSize} por cento`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Menu de acessibilidade"
          title="Acessibilidade"
        >
          <Eye className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover p-3">
        <DropdownMenuLabel className="text-base font-semibold text-foreground">
          Acessibilidade
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="space-y-3 py-2">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <label htmlFor="dark-mode" className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Modo Escuro
            </label>
            <Switch
              id="dark-mode"
              checked={isDark}
              onCheckedChange={toggleDarkMode}
              aria-label="Alternar modo escuro"
            />
          </div>

          {/* Colorblind Mode */}
          <div className="flex items-center justify-between">
            <label htmlFor="colorblind-mode" className="cursor-pointer text-sm text-foreground">
              Modo Daltonismo
            </label>
            <Switch
              id="colorblind-mode"
              checked={colorblindMode}
              onCheckedChange={handleColorblindToggle}
              aria-label="Alternar modo daltonismo"
            />
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <label htmlFor="high-contrast" className="cursor-pointer text-sm text-foreground">
              Alto Contraste
            </label>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={handleHighContrastToggle}
              aria-label="Alternar alto contraste"
            />
          </div>

          {/* Audio Description */}
          <div className="flex items-center justify-between">
            <label htmlFor="audio-description" className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <Volume2 className="h-4 w-4" />
              Audiodescrição
            </label>
            <Switch
              id="audio-description"
              checked={audioDescriptionEnabled}
              onCheckedChange={handleAudioToggle}
              aria-label="Alternar audiodescrição"
            />
          </div>

          <DropdownMenuSeparator />

          {/* Font Size */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Tamanho da Fonte: {fontSize}%</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustFontSize(-10)}
                disabled={fontSize <= 80}
                aria-label="Diminuir tamanho da fonte"
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 rounded-md bg-muted px-3 py-1 text-center text-sm text-foreground">
                {fontSize}%
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustFontSize(10)}
                disabled={fontSize >= 150}
                aria-label="Aumentar tamanho da fonte"
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
