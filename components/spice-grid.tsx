"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAccessibility } from "@/components/accessibility-provider"
import { ShoppingCart, Plus, Minus, Search, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

interface Spice {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  weight_grams: number
  stock: number
}

interface SpiceGridProps {
  spices: Spice[]
}

export function SpiceGrid({ spices }: SpiceGridProps) {
  const [search, setSearch] = useState("")
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [user, setUser] = useState<User | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const { speak, audioDescriptionEnabled } = useAccessibility()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const filteredSpices = spices.filter((spice) =>
    spice.name.toLowerCase().includes(search.toLowerCase()) ||
    spice.description?.toLowerCase().includes(search.toLowerCase())
  )

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }))
  }

  const getQuantity = (id: string) => quantities[id] || 1

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const addToCart = async (spice: Spice) => {
    if (!user) {
      toast({
        title: "Faça login primeiro",
        description: "Você precisa estar logado para adicionar itens ao carrinho.",
        variant: "destructive",
      })
      if (audioDescriptionEnabled) {
        speak("Você precisa fazer login para adicionar ao carrinho.")
      }
      return
    }

    setAddingToCart(spice.id)
    const quantity = getQuantity(spice.id)

    try {
      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("spice_id", spice.id)
        .single()

      if (existingItem) {
        // Update quantity
        await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)
      } else {
        // Add new item
        await supabase.from("cart_items").insert({
          user_id: user.id,
          spice_id: spice.id,
          quantity,
        })
      }

      toast({
        title: "Adicionado ao carrinho!",
        description: `${quantity}x ${spice.name} foi adicionado ao seu carrinho.`,
      })

      if (audioDescriptionEnabled) {
        speak(`${quantity} ${spice.name} adicionado ao carrinho.`)
      }

      // Reset quantity
      setQuantities((prev) => ({ ...prev, [spice.id]: 1 }))
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao carrinho. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  if (spices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="mb-4 h-16 w-16 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-foreground">
          Nenhum tempero disponível no momento
        </h2>
        <p className="mt-2 text-muted-foreground">
          Volte em breve para conferir nossos produtos!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative mx-auto max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          placeholder="Buscar temperos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background pl-10"
          aria-label="Buscar temperos"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredSpices.map((spice) => (
          <Card key={spice.id} className="overflow-hidden border-border bg-card transition-shadow hover:shadow-lg">
            <div className="relative aspect-square bg-muted">
              {spice.image_url ? (
                <Image
                  src={spice.image_url || "/placeholder.svg"}
                  alt={`Foto do tempero ${spice.name}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-card-foreground">{spice.name}</h3>
              {spice.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {spice.description}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {spice.weight_grams}g
              </p>
              <p className="mt-2 text-xl font-bold text-primary">
                {formatPrice(spice.price)}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-md border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(spice.id, -1)}
                    disabled={getQuantity(spice.id) <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm text-foreground" aria-label={`Quantidade: ${getQuantity(spice.id)}`}>
                    {getQuantity(spice.id)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(spice.id, 1)}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => addToCart(spice)}
                  disabled={addingToCart === spice.id}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
                  {addingToCart === spice.id ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSpices.length === 0 && spices.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            Nenhum tempero encontrado para "{search}"
          </p>
        </div>
      )}
    </div>
  )
}
