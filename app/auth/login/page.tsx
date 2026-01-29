"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAccessibility } from "@/components/accessibility-provider"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { speak, audioDescriptionEnabled } = useAccessibility()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (audioDescriptionEnabled) {
      speak("Processando login...")
    }

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.includes("Failed to fetch") || signInError.message.includes("fetch")) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.")
        } else if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos. Verifique seus dados e tente novamente.")
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Email não confirmado. Verifique sua caixa de entrada para confirmar seu cadastro.")
        } else {
          setError("Email ou senha incorretos. Tente novamente.")
        }
        if (audioDescriptionEnabled) {
          speak("Erro no login.")
        }
      } else {
        if (audioDescriptionEnabled) {
          speak("Login realizado com sucesso! Redirecionando...")
        }
        router.push("/loja")
        router.refresh()
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
        setError("Erro de conexão com o servidor. Verifique sua internet e tente novamente.")
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.")
      }
      if (audioDescriptionEnabled) {
        speak("Erro inesperado ao fazer login.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main id="main-content" className="flex flex-1 items-center justify-center bg-secondary/30 px-4 py-12">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto">
              <Image
                src="/logo.png"
                alt="Logo Sabor da Fé"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Entrar na sua conta
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Digite seu email e senha para acessar a loja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-background"
                  aria-describedby="email-hint"
                />
                <span id="email-hint" className="sr-only">
                  Digite o email cadastrado na sua conta
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-background pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/auth/cadastro" className="font-medium text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
