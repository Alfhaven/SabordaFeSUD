"use client"

import Link from "next/link"
import Image from "next/image"
import { useAccessibility } from "@/components/accessibility-provider"

export function Footer() {
  const { speak, audioDescriptionEnabled } = useAccessibility()

  const handleLinkClick = (label: string) => {
    if (audioDescriptionEnabled) {
      speak(`Abrindo link: ${label}`)
    }
  }

  return (
    <footer className="border-t border-border bg-card" role="contentinfo">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Logo and Mission */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo Sabor da Fé"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h3 className="font-bold text-foreground">Sabor da Fé</h3>
                <p className="text-sm text-muted-foreground">O Gosto da Eternidade</p>
              </div>
            </Link>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              Um projeto da Organização dos Rapazes (OR) da Igreja de Jesus Cristo dos Santos dos Últimos Dias.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <h4 className="font-semibold text-foreground">Links Rápidos</h4>
            <nav className="flex flex-col items-center gap-2 md:items-start" aria-label="Links do rodapé">
              <Link 
                href="/loja" 
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
                onClick={() => handleLinkClick("Loja")}
              >
                Loja
              </Link>
              <Link 
                href="/sobre" 
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
                onClick={() => handleLinkClick("Sobre Nós")}
              >
                Sobre Nós
              </Link>
              <Link 
                href="/frete" 
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
                onClick={() => handleLinkClick("Calcular Frete")}
              >
                Calcular Frete
              </Link>
              <Link 
                href="/auth/login" 
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
                onClick={() => handleLinkClick("Entrar")}
              >
                Entrar
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <h4 className="font-semibold text-foreground">Contato</h4>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              sabordafesud.com.br
            </p>
          </div>
        </div>

        {/* Gospel Message */}
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-primary/5 p-6 text-center">
            <p className="text-balance text-lg font-medium text-foreground">
              "Aprenda mais sobre o Evangelho e ajude a espalhar a luz de Cristo pelo Mundo"
            </p>
            <a
              href="https://www.churchofjesuschrist.org/?lang=pt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={() => handleLinkClick("Igreja de Jesus Cristo")}
              aria-label="Visitar site oficial da Igreja de Jesus Cristo dos Santos dos Últimos Dias (abre em nova aba)"
            >
              Visite o site oficial da Igreja
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sabor da Fé - Organização dos Rapazes (OR)</p>
          <p className="mt-1">Igreja de Jesus Cristo dos Santos dos Últimos Dias</p>
        </div>
      </div>
    </footer>
  )
}
