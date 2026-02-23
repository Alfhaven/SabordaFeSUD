"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminSpiceForm } from "@/components/admin-spice-form"
import { AdminSpiceList } from "@/components/admin-spice-list"
import { AdminChapelDeliveries } from "@/components/admin-chapel-deliveries"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Package, DollarSign, Users, Church, Bell } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface Stats {
  totalSpices: number
  totalOrders: number
  totalRevenue: number
  pendingChapelDeliveries: number
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ totalSpices: 0, totalOrders: 0, totalRevenue: 0, pendingChapelDeliveries: 0 })
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
      const [spicesCount, ordersData, chapelData] = await Promise.all([
        supabase.from("spices").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount"),
        supabase.from("chapel_deliveries").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ])

      setStats({
        totalSpices: spicesCount.count ?? 0,
        totalOrders: ordersData.data?.length ?? 0,
        totalRevenue: ordersData.data?.reduce((sum, order) => sum + (order.total_amount ?? 0), 0) ?? 0,
        pendingChapelDeliveries: chapelData.count ?? 0,
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
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            <Card className={`border-border bg-card ${stats.pendingChapelDeliveries > 0 ? "border-orange-300 bg-orange-50" : ""}`}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-full p-3 ${stats.pendingChapelDeliveries > 0 ? "bg-orange-100" : "bg-primary/10"}`}>
                  <Church className={`h-6 w-6 ${stats.pendingChapelDeliveries > 0 ? "text-orange-600" : "text-primary"}`} aria-hidden="true" />
                </div>
                <div>
                  <p className={`text-sm ${stats.pendingChapelDeliveries > 0 ? "text-orange-600" : "text-muted-foreground"}`}>
                    Entregas na Capela
                  </p>
                  <p className={`text-2xl font-bold ${stats.pendingChapelDeliveries > 0 ? "text-orange-800" : "text-card-foreground"}`}>
                    {stats.pendingChapelDeliveries} pendentes
                  </p>
                </div>
                {stats.pendingChapelDeliveries > 0 && (
                  <Bell className="ml-auto h-5 w-5 text-orange-500 animate-pulse" aria-hidden="true" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="chapel" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="chapel" className="data-[state=active]:bg-background relative">
                <Church className="mr-2 h-4 w-4" />
                Entregas Capela
                {stats.pendingChapelDeliveries > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    {stats.pendingChapelDeliveries}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-background">
                Lista de Temperos
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-background">
                Adicionar Tempero
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chapel">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Church className="h-5 w-5 text-primary" />
                    Entregas na Capela
                  </CardTitle>
                  <CardDescription>
                    Gerencie as entregas especiais de domingo na A Igreja de Jesus Cristo dos Santos dos Ultimos Dias (CEP: 04678-000)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminChapelDeliveries />
                </CardContent>
              </Card>
            </TabsContent>

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
