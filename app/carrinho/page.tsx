"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccessibility } from "@/components/accessibility-provider"
import { useToast } from "@/hooks/use-toast"
import { CheckoutForm } from "@/components/checkout-form"
import { Loader2, Trash2, Plus, Minus, ShoppingBag, Package } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface CartItem {
  id: string
  quantity: number
  spice: {
    id: string
    name: string
    price: number
    weight_grams: number
    image_url: string | null
  }
}

export default function CarrinhoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { speak, audioDescriptionEnabled } = useAccessibility()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          spice:spices(id, name, price, weight_grams, image_url)
        `)
        .eq("user_id", user.id)

      setItems(data as unknown as CartItem[] ?? [])
      setLoading(false)
    }

    fetchCart()
  }, [supabase, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const total = items.reduce((sum, item) => sum + item.spice.price * item.quantity, 0)

  const handleCheckoutSuccess = () => {
    setItems([])
  }

  const updateQuantity = async (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta
    
    if (newQuantity <= 0) {
      await removeItem(item)
      return
    }

    setUpdatingId(item.id)

    try {
      await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", item.id)

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        )
      )

      if (audioDescriptionEnabled) {
        speak(`Quantidade atualizada para ${newQuantity}`)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a quantidade.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const removeItem = async (item: CartItem) => {
    setUpdatingId(item.id)

    try {
      await supabase.from("cart_items").delete().eq("id", item.id)

      setItems((prev) => prev.filter((i) => i.id !== item.id))

      toast({
        title: "Item removido",
        description: `${item.spice.name} foi removido do carrinho.`,
      })

      if (audioDescriptionEnabled) {
        speak(`${item.spice.name} removido do carrinho`)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o item.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
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
          <h1 className="mb-8 text-3xl font-bold text-foreground">
            Meu Carrinho
          </h1>

          {items.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-card-foreground">
                  Seu carrinho está vazio
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Adicione alguns temperos deliciosos!
                </p>
                <Link href="/loja" className="mt-4">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Ver Loja
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">
                      Itens ({items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-lg border border-border p-4"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.spice.image_url ? (
                            <Image
                              src={item.spice.image_url || "/placeholder.svg"}
                              alt={item.spice.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{item.spice.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.spice.weight_grams}g</p>
                          <p className="font-medium text-primary">{formatPrice(item.spice.price)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 rounded-md border border-border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item, -1)}
                              disabled={updatingId === item.id}
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm text-foreground">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item, 1)}
                              disabled={updatingId === item.id}
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item)}
                            disabled={updatingId === item.id}
                            aria-label={`Remover ${item.spice.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="sticky top-24 border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({items.length} {items.length === 1 ? "item" : "itens"})</span>
                      <span className="text-foreground">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Entrega</span>
                      <span className="text-primary font-medium">Gratis</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary text-xl">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout Form com opção de entrega na capela */}
                <div className="mt-4">
                  {user && (
                    <CheckoutForm 
                      items={items} 
                      total={total} 
                      user={user} 
                      onSuccess={handleCheckoutSuccess}
                    />
                  )}
                </div>

                <Link href="/loja" className="mt-4 block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Continuar Comprando
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
