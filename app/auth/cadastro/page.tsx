"use client"

import React, { useState } from "react"
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
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function CadastroPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { speak, audioDescriptionEnabled } = useAccessibility()

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (audioDescriptionEnabled) {
      speak("Processando cadastro...")
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      if (audioDescriptionEnabled) {
        speak("Erro: As senhas não coincidem.")
      }
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      if (audioDescriptionEnabled) {
        speak("Erro: A senha deve ter pelo menos 6 caracteres.")
      }
      setLoading(false)
      return
    }

    try {
      // Debug: verificar variáveis de ambiente
      console.log('[v0] NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      let supabase
      try {
        supabase = createClient()
        console.log('[v0] Supabase client created successfully')
      } catch (clientError) {
        console.error('[v0] Supabase client error:', clientError)
        setError("Erro de configuração do sistema. Por favor, tente novamente em alguns minutos ou entre em contato com o suporte.")
        if (audioDescriptionEnabled) {
          speak("Erro de configuração do sistema.")
        }
        setLoading(false)
        return
      }
      
      console.log('[v0] Attempting signUp with email:', email)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/loja`,
          data: {
            full_name: name,
            phone: phone,
            is_admin: false,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
          setError("Este email já está cadastrado. Tente fazer login.")
        } else if (signUpError.message.includes("Failed to fetch") || signUpError.message.includes("fetch")) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.")
        } else if (signUpError.message.includes("Invalid email")) {
          setError("Email inválido. Por favor, verifique o email digitado.")
        } else if (signUpError.message.includes("Password")) {
          setError("Senha muito fraca. Use pelo menos 6 caracteres com letras e números.")
        } else {
          setError(`Erro ao criar conta: ${signUpError.message}`)
        }
        if (audioDescriptionEnabled) {
          speak("Erro ao criar conta.")
        }
      } else if (data?.user) {
        setSuccess(true)
        if (audioDescriptionEnabled) {
          speak("Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.")
        }
      } else {
        // Caso estranho onde não há erro mas também não há usuário
        setError("Não foi possível criar a conta. Tente novamente.")
        if (audioDescriptionEnabled) {
          speak("Erro ao criar conta.")
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
        setError("Erro de conexão com o servidor. Verifique sua internet e tente novamente.")
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente mais tarde.")
      }
      if (audioDescriptionEnabled) {
        speak("Erro inesperado ao criar conta.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main-content" className="flex flex-1 items-center justify-center bg-secondary/30 px-4 py-12">
          <Card className="w-full max-w-md border-border bg-card">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-12 w-12 text-primary" aria-hidden="true" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-card-foreground">
                Cadastro realizado!
              </h1>
              <p className="mb-6 text-muted-foreground">
                Enviamos um email de confirmação para <strong>{email}</strong>. 
                Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
              </p>
              <Link href="/auth/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Ir para Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
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
              Criar uma conta
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha seus dados para se cadastrar
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
                <Label htmlFor="name" className="text-foreground">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="bg-background"
                />
              </div>

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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-background"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Cadastrando...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Faça login
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
