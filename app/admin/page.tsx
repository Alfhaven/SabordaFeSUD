"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSpiceForm } from "@/components/admin-spice-form"
import { AdminSpiceList } from "@/components/admin-spice-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Package, DollarSign, Users } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface Stats {
  totalSpices: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ totalSpices: 0, totalOrders: 0, totalRevenue: 0 })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      const adminStatus = user.user_metadata?.is_admin ?? false
      setIsAdmin(adminStatus)

      if (!adminStatus) {
        setLoading(false)
        return
      }

      // Fetch stats
      const [spicesCount, ordersData] = await Promise.all([
        supabase.from("spices").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount"),
      ])

      setStats({
        totalSpices: spicesCount.count ?? 0,
        totalOrders: ordersData.data?.length ?? 0,
        totalRevenue: ordersData.data?.reduce((sum, order) => sum + (order.total_amount ?? 0), 0) ?? 0,
      })

      setLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
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

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main-content" className="flex flex-1 items-center justify-center px-4">
          <Card className="w-full max-w-md border-border bg-card">
            <CardContent className="p-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" aria-hidden="true" />
              <h1 className="mb-2 text-xl font-bold text-card-foreground">
                Acesso Restrito
              </h1>
              <p className="text-muted-foreground">
                Esta área é restrita a administradores. Você não tem permissão para acessar este conteúdo.
              </p>
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
      
      <main id="main-content" className="flex-1 bg-secondary/20 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Painel Administrativo
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie os temperos e acompanhe os pedidos
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Package className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Temperos</p>
                  <p className="text-2xl font-bold text-card-foreground">{stats.totalSpices}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-card-foreground">{stats.totalOrders}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <DollarSign className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-card-foreground">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="list" className="data-[state=active]:bg-background">
                Lista de Temperos
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-background">
                Adicionar Tempero
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Temperos Cadastrados</CardTitle>
                  <CardDescription>
                    Gerencie os temperos disponíveis na loja
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminSpiceList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Adicionar Novo Tempero</CardTitle>
                  <CardDescription>
                    Preencha os dados do novo tempero para adicionar à loja
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminSpiceForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
