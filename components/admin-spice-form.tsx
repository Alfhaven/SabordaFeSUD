"use client"

import React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAccessibility } from "@/components/accessibility-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface SpiceFormData {
  name: string
  description: string
  price: string
  weight_grams: string
  package_weight_grams: string
  image_url: string
  available: boolean
}

interface AdminSpiceFormProps {
  initialData?: {
    id: string
    name: string
    description: string | null
    price: number
    weight_grams: number
    package_weight_grams?: number
    image_url: string | null
    available: boolean
  }
  onSuccess?: () => void
}

export function AdminSpiceForm({ initialData, onSuccess }: AdminSpiceFormProps) {
  const [formData, setFormData] = useState<SpiceFormData>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price?.toString() ?? "",
    weight_grams: initialData?.weight_grams?.toString() ?? "50",
    package_weight_grams: initialData?.package_weight_grams?.toString() ?? "",
    image_url: initialData?.image_url ?? "",
    available: initialData?.available ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { speak, audioDescriptionEnabled } = useAccessibility()
  const { toast } = useToast()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    if (audioDescriptionEnabled) {
      speak("Salvando tempero...")
    }

    // Validation
    if (!formData.name.trim()) {
      setError("O nome do tempero é obrigatório.")
      setLoading(false)
      return
    }

    const price = parseFloat(formData.price.replace(",", "."))
    if (isNaN(price) || price <= 0) {
      setError("Digite um preço válido.")
      setLoading(false)
      return
    }

    const weight = parseInt(formData.weight_grams)
    if (isNaN(weight) || weight <= 0) {
      setError("Digite um peso válido em gramas.")
      setLoading(false)
      return
    }

    // Package weight is optional but must be valid if provided
    let packageWeight: number | null = null
    if (formData.package_weight_grams.trim()) {
      packageWeight = parseInt(formData.package_weight_grams)
      if (isNaN(packageWeight) || packageWeight <= 0) {
        setError("Digite um peso de pacote válido em gramas.")
        setLoading(false)
        return
      }
    }

    try {
      const spiceData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price,
        weight_grams: weight,
        package_weight_grams: packageWeight || weight, // Se não informado, usa o peso do produto
        image_url: formData.image_url.trim() || null,
        available: formData.available,
      }

      if (initialData?.id) {
        // Update existing spice
        const { error } = await supabase
          .from("spices")
          .update(spiceData)
          .eq("id", initialData.id)

        if (error) throw error

        toast({
          title: "Tempero atualizado!",
          description: `${formData.name} foi atualizado com sucesso.`,
        })
      } else {
        // Create new spice
        const { error } = await supabase.from("spices").insert(spiceData)

        if (error) throw error

        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          weight_grams: "50",
          package_weight_grams: "",
          image_url: "",
          available: true,
        })

        toast({
          title: "Tempero adicionado!",
          description: `${formData.name} foi adicionado à loja.`,
        })
      }

      setSuccess(true)
      if (audioDescriptionEnabled) {
        speak("Tempero salvo com sucesso!")
      }
      onSuccess?.()
    } catch (err) {
      setError("Erro ao salvar o tempero. Tente novamente.")
      if (audioDescriptionEnabled) {
        speak("Erro ao salvar tempero.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && !initialData && (
        <Alert className="border-primary/20 bg-primary/5">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">
            Tempero adicionado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Nome do Tempero *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Páprica Defumada"
            required
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-foreground">Preço (R$) *</Label>
          <Input
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Ex: 12,50"
            required
            className="bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva o tempero, seu sabor e usos recomendados..."
          rows={3}
          className="bg-background"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight_grams" className="text-foreground">Peso do Produto (gramas) *</Label>
          <Input
            id="weight_grams"
            name="weight_grams"
            type="number"
            value={formData.weight_grams}
            onChange={handleChange}
            placeholder="Ex: 50"
            required
            min="1"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Peso liquido do tempero para exibicao aos clientes
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="package_weight_grams" className="text-foreground">Peso do Pacote (gramas)</Label>
          <Input
            id="package_weight_grams"
            name="package_weight_grams"
            type="number"
            value={formData.package_weight_grams}
            onChange={handleChange}
            placeholder="Ex: 60"
            min="1"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Peso total incluindo embalagem (usado para calcular limites de entrega)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url" className="text-foreground">URL da Imagem</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://exemplo.com/imagem.jpg"
          className="bg-background"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="available"
          checked={formData.available}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, available: checked }))}
        />
        <Label htmlFor="available" className="cursor-pointer text-foreground">
          Disponível para venda
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Salvando...
          </>
        ) : initialData ? (
          "Atualizar Tempero"
        ) : (
          "Adicionar Tempero"
        )}
      </Button>
    </form>
  )
}
