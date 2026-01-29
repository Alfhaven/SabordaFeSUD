"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, ShoppingCart, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useAccessibility } from "@/components/accessibility-provider"
import { AccessibilityMenu } from "@/components/accessibility-menu"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/loja", label: "Loja" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/frete", label: "Calcular Frete" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const { speak, audioDescriptionEnabled } = useAccessibility()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setIsAdmin(user.user_metadata?.is_admin ?? false)
        
        // Get cart count
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
        setCartCount(count ?? 0)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsAdmin(session?.user?.user_metadata?.is_admin ?? false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setCartCount(0)
    window.location.href = "/"
  }

  const handleNavClick = (label: string) => {
    if (audioDescriptionEnabled) {
      speak(`Navegando para ${label}`)
    }
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4" aria-label="Navegação principal">
        <Link 
          href="/" 
          className="flex items-center gap-2"
          onClick={() => handleNavClick("página inicial")}
          aria-label="Sabor da Fé - Ir para página inicial"
        >
          <Image
            src="/logo.png"
            alt="Logo Sabor da Fé - Temperos com o gosto da eternidade"
            width={50}
            height={50}
            className="rounded-full"
          />
          <span className="hidden font-bold text-foreground sm:inline-block">
            Sabor da Fé
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary"
              onClick={() => handleNavClick(link.label)}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              onClick={() => handleNavClick("Painel Admin")}
            >
              Painel Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <AccessibilityMenu />

          {user && (
            <Link href="/carrinho" aria-label={`Carrinho de compras com ${cartCount} itens`}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu do usuário">
                  <User className="h-5 w-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="flex cursor-pointer items-center gap-2">
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pedidos" className="flex cursor-pointer items-center gap-2">
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    Meus Pedidos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex cursor-pointer items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/cadastro">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Cadastrar
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Abrir menu de navegação">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="flex flex-col gap-4 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    onClick={() => handleNavClick(link.label)}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-lg font-medium text-primary transition-colors hover:text-primary/80"
                    onClick={() => handleNavClick("Painel Admin")}
                  >
                    Painel Admin
                  </Link>
                )}
                {!user && (
                  <div className="flex flex-col gap-2 pt-4">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/auth/cadastro" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Cadastrar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
