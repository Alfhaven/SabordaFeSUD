"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, ShoppingBag, Calendar, MapPin } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface Order {
  id: string
  status: string
  total_amount: number
  shipping_address: string
  shipping_method: string
  created_at: string
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  preparing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
}

export default function PedidosPage() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setOrders(data ?? [])
      setLoading(false)
    }

    fetchOrders()
  }, [supabase, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
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
          <h1 className="mb-8 text-3xl font-bold text-foreground">
            Meus Pedidos
          </h1>

          {orders.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-card-foreground">
                  Você ainda não fez nenhum pedido
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Explore nossa loja e faça seu primeiro pedido!
                </p>
                <Link href="/loja" className="mt-4">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Ir para a Loja
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                      <Package className="h-5 w-5 text-primary" aria-hidden="true" />
                      Pedido #{order.id.slice(0, 8)}
                    </CardTitle>
                    <Badge variant={statusColors[order.status] || "secondary"}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <div>
                          <p className="text-sm text-muted-foreground">Data</p>
                          <p className="font-medium text-foreground">{formatDate(order.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <div>
                          <p className="text-sm text-muted-foreground">Entrega</p>
                          <p className="font-medium text-foreground">
                            {order.shipping_method === "bike" ? "Motoboy/Bike" : "Carro"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-primary">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                    </div>

                    {order.shipping_address && (
                      <div className="mt-4 rounded-lg bg-muted p-3">
                        <p className="text-sm text-muted-foreground">Endereço de entrega:</p>
                        <p className="text-sm text-foreground">{order.shipping_address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
