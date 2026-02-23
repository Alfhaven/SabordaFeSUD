"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAccessibility } from "@/components/accessibility-provider"
import { Loader2, Church, Calendar, User, Package, Phone, Mail, Eye, CheckCircle, Clock, XCircle } from "lucide-react"

interface ChapelDelivery {
  id: string
  order_id: string
  user_id: string
  user_name: string
  user_email: string
  user_phone: string | null
  delivery_date: string
  chapel_name: string
  chapel_cep: string
  total_weight_grams: number
  items: Array<{
    spice_id: string
    name: string
    quantity: number
    weight_grams: number
  }>
  status: "pending" | "confirmed" | "delivered" | "cancelled"
  admin_notes: string | null
  created_at: string
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  delivered: { label: "Entregue", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  confirmed: <CheckCircle className="h-3 w-3" />,
  delivered: <Package className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
}

export function AdminChapelDeliveries() {
  const [deliveries, setDeliveries] = useState<ChapelDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDelivery, setSelectedDelivery] = useState<ChapelDelivery | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const { toast } = useToast()
  const { speak, audioDescriptionEnabled } = useAccessibility()
  const supabase = createClient()

  const fetchDeliveries = async () => {
    const { data, error } = await supabase
      .from("chapel_deliveries")
      .select("*")
      .order("delivery_date", { ascending: true })

    if (!error && data) {
      setDeliveries(data as ChapelDelivery[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const updateStatus = async (delivery: ChapelDelivery, newStatus: string) => {
    setUpdatingId(delivery.id)

    if (audioDescriptionEnabled) {
      speak(`Atualizando status para ${statusLabels[newStatus]?.label}...`)
    }

    try {
      const { error } = await supabase
        .from("chapel_deliveries")
        .update({ 
          status: newStatus,
          admin_notes: adminNotes || delivery.admin_notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", delivery.id)

      if (error) throw error

      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === delivery.id ? { ...d, status: newStatus as ChapelDelivery["status"], admin_notes: adminNotes || d.admin_notes } : d
        )
      )

      toast({
        title: "Status atualizado",
        description: `Entrega de ${delivery.user_name} marcada como ${statusLabels[newStatus]?.label}.`,
      })

      if (audioDescriptionEnabled) {
        speak("Status atualizado com sucesso.")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Nao foi possivel atualizar o status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Agrupar entregas por data
  const deliveriesByDate = deliveries.reduce((acc, delivery) => {
    const date = delivery.delivery_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(delivery)
    return acc
  }, {} as Record<string, ChapelDelivery[]>)

  // Contar pendentes
  const pendingCount = deliveries.filter((d) => d.status === "pending").length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Church className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <p className="text-muted-foreground">
          Nenhuma entrega na capela agendada no momento.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com contador */}
      {pendingCount > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-orange-100 p-2">
              <Clock className="h-5 w-5 text-orange-600" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-orange-800">
                {pendingCount} {pendingCount === 1 ? "entrega pendente" : "entregas pendentes"}
              </p>
              <p className="text-sm text-orange-600">
                Aguardando confirmacao para o proximo domingo
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entregas agrupadas por data */}
      {Object.entries(deliveriesByDate).map(([date, dateDeliveries]) => (
        <Card key={date} className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg text-card-foreground">
                {formatDate(date)}
              </CardTitle>
            </div>
            <CardDescription>
              {dateDeliveries.length} {dateDeliveries.length === 1 ? "entrega agendada" : "entregas agendadas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">Cliente</TableHead>
                    <TableHead className="text-foreground">Contato</TableHead>
                    <TableHead className="text-foreground">Peso</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-right text-foreground">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dateDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span className="font-medium text-foreground">{delivery.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {delivery.user_email}
                          </div>
                          {delivery.user_phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {delivery.user_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-foreground">
                          {(delivery.total_weight_grams / 1000).toFixed(2)} kg
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusLabels[delivery.status]?.variant || "secondary"}
                          className="flex w-fit items-center gap-1"
                        >
                          {statusIcons[delivery.status]}
                          {statusLabels[delivery.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDelivery(delivery)
                                setAdminNotes(delivery.admin_notes || "")
                              }}
                              aria-label={`Ver detalhes de ${delivery.user_name}`}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-card-foreground">
                                <Church className="h-5 w-5 text-primary" />
                                Entrega na Capela
                              </DialogTitle>
                              <DialogDescription>
                                Detalhes do pedido de {delivery.user_name}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Info do cliente */}
                              <div className="rounded-lg bg-secondary/50 p-3">
                                <h4 className="font-semibold text-foreground mb-2">Cliente</h4>
                                <div className="space-y-1 text-sm">
                                  <p className="text-foreground">{delivery.user_name}</p>
                                  <p className="text-muted-foreground">{delivery.user_email}</p>
                                  {delivery.user_phone && (
                                    <p className="text-muted-foreground">{delivery.user_phone}</p>
                                  )}
                                </div>
                              </div>

                              {/* Info da entrega */}
                              <div className="rounded-lg bg-secondary/50 p-3">
                                <h4 className="font-semibold text-foreground mb-2">Entrega</h4>
                                <div className="space-y-1 text-sm">
                                  <p className="text-foreground">
                                    <strong>Data:</strong> {formatDate(delivery.delivery_date)}
                                  </p>
                                  <p className="text-muted-foreground">
                                    <strong>Local:</strong> {delivery.chapel_name}
                                  </p>
                                  <p className="text-muted-foreground">
                                    <strong>CEP:</strong> {delivery.chapel_cep}
                                  </p>
                                </div>
                              </div>

                              {/* Itens do pedido */}
                              <div className="rounded-lg bg-secondary/50 p-3">
                                <h4 className="font-semibold text-foreground mb-2">
                                  Itens ({delivery.items.length})
                                </h4>
                                <ul className="space-y-1 text-sm">
                                  {delivery.items.map((item, index) => (
                                    <li key={index} className="flex justify-between text-foreground">
                                      <span>{item.quantity}x {item.name}</span>
                                      <span className="text-muted-foreground">
                                        {item.weight_grams * item.quantity}g
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                                <p className="mt-2 pt-2 border-t border-border text-sm font-medium text-foreground">
                                  Peso total: {(delivery.total_weight_grams / 1000).toFixed(2)} kg
                                </p>
                              </div>

                              {/* Notas do admin */}
                              <div>
                                <label className="text-sm font-medium text-foreground">
                                  Notas do administrador
                                </label>
                                <Textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Adicione notas sobre esta entrega..."
                                  className="mt-1 bg-background"
                                  rows={2}
                                />
                              </div>

                              {/* Atualizar status */}
                              <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-foreground">
                                  Status:
                                </label>
                                <Select
                                  value={delivery.status}
                                  onValueChange={(value) => updateStatus(delivery, value)}
                                  disabled={updatingId === delivery.id}
                                >
                                  <SelectTrigger className="w-40 bg-background">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="confirmed">Confirmado</SelectItem>
                                    <SelectItem value="delivered">Entregue</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                  </SelectContent>
                                </Select>
                                {updatingId === delivery.id && (
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
