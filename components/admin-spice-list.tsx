"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AdminSpiceForm } from "@/components/admin-spice-form"
import { useAccessibility } from "@/components/accessibility-provider"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, Loader2, Package } from "lucide-react"

interface Spice {
  id: string
  name: string
  description: string | null
  price: number
  weight_grams: number
  package_weight_grams?: number
  image_url: string | null
  available: boolean
  created_at: string
}

export function AdminSpiceList() {
  const [spices, setSpices] = useState<Spice[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingSpice, setEditingSpice] = useState<Spice | null>(null)
  const { speak, audioDescriptionEnabled } = useAccessibility()
  const { toast } = useToast()
  const supabase = createClient()

  const fetchSpices = async () => {
    const { data } = await supabase
      .from("spices")
      .select("*")
      .order("created_at", { ascending: false })

    setSpices(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSpices()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const handleDelete = async (spice: Spice) => {
    setDeletingId(spice.id)

    if (audioDescriptionEnabled) {
      speak(`Excluindo ${spice.name}...`)
    }

    try {
      const { error } = await supabase.from("spices").delete().eq("id", spice.id)

      if (error) throw error

      setSpices((prev) => prev.filter((s) => s.id !== spice.id))
      toast({
        title: "Tempero excluído",
        description: `${spice.name} foi removido da loja.`,
      })

      if (audioDescriptionEnabled) {
        speak(`${spice.name} excluído com sucesso.`)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o tempero.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditSuccess = () => {
    setEditingSpice(null)
    fetchSpices()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (spices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Package className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <p className="text-muted-foreground">
          Nenhum tempero cadastrado ainda. Adicione o primeiro tempero!
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">Nome</TableHead>
            <TableHead className="text-foreground">Preço</TableHead>
            <TableHead className="text-foreground">Peso</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-right text-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spices.map((spice) => (
            <TableRow key={spice.id}>
              <TableCell className="font-medium text-foreground">{spice.name}</TableCell>
              <TableCell className="text-foreground">{formatPrice(spice.price)}</TableCell>
              <TableCell className="text-foreground">{spice.weight_grams}g</TableCell>
              <TableCell>
                <Badge variant={spice.available ? "default" : "secondary"}>
                  {spice.available ? "Disponível" : "Indisponível"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingSpice(spice)}
                        aria-label={`Editar ${spice.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-card-foreground">Editar Tempero</DialogTitle>
                        <DialogDescription>
                          Atualize as informações do tempero
                        </DialogDescription>
                      </DialogHeader>
                      {editingSpice && (
                        <AdminSpiceForm
                          initialData={editingSpice}
                          onSuccess={handleEditSuccess}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                        aria-label={`Excluir ${spice.name}`}
                        disabled={deletingId === spice.id}
                      >
                        {deletingId === spice.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-card-foreground">
                          Excluir Tempero
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir "{spice.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(spice)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
