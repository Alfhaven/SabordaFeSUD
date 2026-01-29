"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAccessibility } from "@/components/accessibility-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Mail, Phone, CheckCircle, AlertCircle } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  full_name: string
  phone: string
  address: string
  city: string
  state: string
  cep: string
}

export default function PerfilPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    cep: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { speak, audioDescriptionEnabled } = useAccessibility()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Get profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || user.user_metadata?.full_name || "",
          phone: profileData.phone || user.user_metadata?.phone || "",
          address: profileData.address || "",
          city: profileData.city || "",
          state: profileData.state || "",
          cep: profileData.cep || "",
        })
      } else {
        setProfile({
          full_name: user.user_metadata?.full_name || "",
          phone: user.user_metadata?.phone || "",
          address: "",
          city: "",
          state: "",
          cep: "",
        })
      }

      setLoading(false)
    }

    fetchProfile()
  }, [supabase, router])

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 5) return numbers
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === "phone") {
      setProfile((prev) => ({ ...prev, phone: formatPhone(value) }))
    } else if (name === "cep") {
      setProfile((prev) => ({ ...prev, cep: formatCep(value) }))
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setSaving(true)

    if (audioDescriptionEnabled) {
      speak("Salvando perfil...")
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user?.id,
          ...profile,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setSuccess(true)
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      })

      if (audioDescriptionEnabled) {
        speak("Perfil atualizado com sucesso!")
      }
    } catch (err) {
      setError("Erro ao salvar o perfil. Tente novamente.")
      if (audioDescriptionEnabled) {
        speak("Erro ao salvar perfil.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 bg-secondary/20 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-8 text-3xl font-bold text-foreground">
              Meu Perfil
            </h1>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <User className="h-5 w-5 text-primary" aria-hidden="true" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize suas informações de contato e endereço
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

                  {success && (
                    <Alert className="border-primary/20 bg-primary/5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-primary">
                        Perfil atualizado com sucesso!
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2">
                      <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">{user?.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-foreground">Nome Completo</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={profile.full_name}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className="bg-background"
                    />
                  </div>

                  <div className="border-t border-border pt-4">
                    <h3 className="mb-4 font-semibold text-foreground">Endereço de Entrega</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address" className="text-foreground">Endereço</Label>
                        <Input
                          id="address"
                          name="address"
                          value={profile.address}
                          onChange={handleChange}
                          placeholder="Rua, número, complemento"
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-foreground">Cidade</Label>
                        <Input
                          id="city"
                          name="city"
                          value={profile.city}
                          onChange={handleChange}
                          placeholder="Sua cidade"
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-foreground">Estado</Label>
                        <Input
                          id="state"
                          name="state"
                          value={profile.state}
                          onChange={handleChange}
                          placeholder="UF"
                          maxLength={2}
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cep" className="text-foreground">CEP</Label>
                        <Input
                          id="cep"
                          name="cep"
                          value={profile.cep}
                          onChange={handleChange}
                          placeholder="00000-000"
                          maxLength={9}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
