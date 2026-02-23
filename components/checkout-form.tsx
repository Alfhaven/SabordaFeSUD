"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAccessibility } from "@/components/accessibility-provider"
import { Loader2, Church, Calendar, AlertCircle, CheckCircle, Info, Package } from "lucide-react"
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

interface CheckoutFormProps {
  items: CartItem[]
  total: number
  user: User
  onSuccess?: () => void
}

// Função para calcular o próximo domingo após o próximo (domingo daqui a 2 semanas)
function getNextNextSunday(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay()
  
  // Dias até o próximo domingo
  const daysUntilNextSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek
  
  // Próximo domingo + 7 dias = domingo após o próximo
  const nextNextSunday = new Date(today)
  nextNextSunday.setDate(today.getDate() + daysUntilNextSunday + 7)
  nextNextSunday.setHours(0, 0, 0, 0)
  
  return nextNextSunday
}

function formatDatePtBr(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const MAX_CHAPEL_WEIGHT_GRAMS = 5000 // 5kg máximo para entrega na capela

export function CheckoutForm({ items, total, user, onSuccess }: CheckoutFormProps) {
  const [chapelDelivery, setChapelDelivery] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const { speak, audioDescriptionEnabled } = useAccessibility()
  const supabase = createClient()

  // Calcular peso total do pedido
  const totalWeight = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.spice.weight_grams * item.quantity), 0)
  }, [items])

  // Verificar se pode usar entrega na capela (máximo 5kg)
  const canUseChapelDelivery = totalWeight <= MAX_CHAPEL_WEIGHT_GRAMS

  // Data da entrega na capela
  const chapelDeliveryDate = useMemo(() => getNextNextSunday(), [])

  // Se o peso excede o limite e estava selecionado, desmarcar
  useEffect(() => {
    if (!canUseChapelDelivery && chapelDelivery) {
      setChapelDelivery(false)
    }
  }, [canUseChapelDelivery, chapelDelivery])

  const handleSubmit = async () => {
    setError("")
    setLoading(true)

    if (audioDescriptionEnabled) {
      speak("Finalizando pedido...")
    }

    try {
      const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Cliente"
      const userPhone = user.user_metadata?.phone || null

      // Criar o pedido
      const orderData = {
        user_id: user.id,
        total_amount: total,
        status: "pending",
        delivery_type: chapelDelivery ? "chapel" : "normal",
        items: items.map(item => ({
          spice_id: item.spice.id,
          name: item.spice.name,
          price: item.spice.price,
          quantity: item.quantity,
          weight_grams: item.spice.weight_grams,
        })),
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select("id")
        .single()

      if (orderError) throw orderError

      // Se é entrega na capela, criar registro na tabela chapel_deliveries
      if (chapelDelivery && order) {
        const chapelData = {
          order_id: order.id,
          user_id: user.id,
          user_name: userName,
          user_email: user.email,
          user_phone: userPhone,
          delivery_date: chapelDeliveryDate.toISOString().split("T")[0],
          chapel_name: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
          chapel_cep: "04678-000",
          total_weight_grams: totalWeight,
          items: items.map(item => ({
            spice_id: item.spice.id,
            name: item.spice.name,
            quantity: item.quantity,
            weight_grams: item.spice.weight_grams,
          })),
          status: "pending",
        }

        const { error: chapelError } = await supabase
          .from("chapel_deliveries")
          .insert(chapelData)

        if (chapelError) throw chapelError
      }

      // Limpar carrinho
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)

      setSuccess(true)
      
      toast({
        title: "Pedido realizado com sucesso!",
        description: chapelDelivery 
          ? `Seu pedido será entregue na capela em ${formatDatePtBr(chapelDeliveryDate)}.`
          : "Seu pedido foi confirmado e será entregue em breve.",
      })

      if (audioDescriptionEnabled) {
        speak("Pedido realizado com sucesso!")
      }

      onSuccess?.()
    } catch (err) {
      console.error("Erro ao finalizar pedido:", err)
      setError("Erro ao finalizar pedido. Tente novamente.")
      if (audioDescriptionEnabled) {
        speak("Erro ao finalizar pedido.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 rounded-full bg-primary/20 p-4">
            <CheckCircle className="h-12 w-12 text-primary" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Pedido Confirmado!
          </h2>
          {chapelDelivery ? (
            <p className="text-muted-foreground">
              Seu pedido será entregue na capela <br />
              <strong className="text-foreground">A Igreja de Jesus Cristo dos Santos dos Últimos Dias</strong> <br />
              no dia <strong className="text-primary">{formatDatePtBr(chapelDeliveryDate)}</strong>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Seu pedido foi confirmado e será entregue em breve.
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informação de peso do pedido */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm text-muted-foreground">Peso total do pedido</p>
              <p className="font-semibold text-foreground">
                {(totalWeight / 1000).toFixed(2)} kg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opção de entrega na capela */}
      <Card className={`border-2 transition-colors ${chapelDelivery ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="chapel-delivery"
              checked={chapelDelivery}
              onCheckedChange={(checked) => setChapelDelivery(checked === true)}
              disabled={!canUseChapelDelivery}
              aria-describedby="chapel-delivery-description"
            />
            <div className="flex-1">
              <Label 
                htmlFor="chapel-delivery" 
                className={`text-base font-semibold cursor-pointer flex items-center gap-2 ${!canUseChapelDelivery ? "text-muted-foreground" : "text-foreground"}`}
              >
                <Church className="h-5 w-5 text-primary" aria-hidden="true" />
                Retirar na Capela (Domingo)
              </Label>
              <CardDescription id="chapel-delivery-description" className="mt-1">
                Entrega especial durante as reuniões dominicais
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {canUseChapelDelivery ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">Data de entrega:</span>
                  <span className="font-medium text-foreground">
                    {formatDatePtBr(chapelDeliveryDate)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong>Local:</strong> A Igreja de Jesus Cristo dos Santos dos Últimos Dias
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  CEP: 04678-000 - A entrega sera feita apos as reunioes normais do Domingo
                </p>
              </div>

              {chapelDelivery && (
                <Alert className="border-primary/20 bg-primary/5">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm text-foreground">
                    Ao escolher esta opcao, a entrega normal sera substituida pela entrega na capela. 
                    Voce recebera seu pedido diretamente apos as reunioes.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert variant="destructive" className="border-orange-300 bg-orange-50 text-orange-800">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-800">
                <strong>Peso excedido.</strong> A entrega na capela esta disponivel apenas para pedidos de ate 5kg. 
                Seu pedido atual tem {(totalWeight / 1000).toFixed(2)} kg.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Finalizando...
          </>
        ) : (
          "Finalizar Pedido"
        )}
      </Button>
    </div>
  )
}
