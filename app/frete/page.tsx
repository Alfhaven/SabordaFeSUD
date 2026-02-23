"use client"

import React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAccessibility } from "@/components/accessibility-provider"
import { Loader2, MapPin, Clock, AlertCircle, Info, XCircle } from "lucide-react"

interface ShippingResult {
  distance: number
  estimatedTime: string
  neighborhood: string
  city: string
  state: string
}

// CEP de origem - Sabor da Fé localizado em São Paulo
const ORIGIN_CEP = "04678-000" // CEP base em São Paulo - Zona Sul
const ORIGIN_NEIGHBORHOOD = "Campo Grande"

// Coordenadas aproximadas do CEP de origem (04678-000 - Campo Grande, São Paulo)
const ORIGIN_COORDS = { lat: -23.6521, lng: -46.7012 }

export default function FretePage() {
  const [cep, setCep] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notInArea, setNotInArea] = useState(false)
  const [result, setResult] = useState<ShippingResult | null>(null)
  const { speak, audioDescriptionEnabled } = useAccessibility()

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 5) return numbers
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCep(e.target.value))
    setNotInArea(false)
  }

  const calculateShipping = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setResult(null)
    setNotInArea(false)
    setLoading(true)

    if (audioDescriptionEnabled) {
      speak("Calculando frete...")
    }

    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length !== 8) {
      setError("Por favor, digite um CEP válido com 8 dígitos.")
      setLoading(false)
      return
    }

    try {
      // Fetch address info from ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (data.erro) {
        setError("CEP não encontrado. Verifique se está correto.")
        if (audioDescriptionEnabled) {
          speak("CEP não encontrado.")
        }
        setLoading(false)
        return
      }

      // Verificar se está em São Paulo capital
      if (data.localidade !== "São Paulo" || data.uf !== "SP") {
        setNotInArea(true)
        if (audioDescriptionEnabled) {
          speak("Desculpe, entregamos apenas na cidade de São Paulo.")
        }
        setLoading(false)
        return
      }

      // Calcular distância estimada baseada no bairro/região
      const distance = calculateDistanceInSaoPaulo(data.bairro, cleanCep)
      
      // Calcular tempo estimado (velocidade média: 20km/h considerando trânsito de SP)
      const hours = distance / 20
      const estimatedTime = formatTime(hours)

      const result: ShippingResult = {
        distance: Math.round(distance * 10) / 10,
        estimatedTime,
        neighborhood: data.bairro || "Centro",
        city: data.localidade,
        state: data.uf,
      }

      setResult(result)

      if (audioDescriptionEnabled) {
        speak(`Tempo de entrega calculado para ${data.bairro}, São Paulo. Distância estimada: ${result.distance} quilômetros. Tempo estimado: ${estimatedTime}.`)
      }
    } catch (err) {
      setError("Erro ao calcular o frete. Tente novamente.")
      if (audioDescriptionEnabled) {
        speak("Erro ao calcular frete.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Calcular distância estimada dentro de São Paulo
  const calculateDistanceInSaoPaulo = (bairro: string, cep: string): number => {
    // Distâncias aproximadas do CEP 04678-000 (Campo Grande, Zona Sul) para diferentes regiões
    const regionDistances: Record<string, number> = {
      // Zona Sul (mais próximos)
      "Campo Grande": 2,
      "Santo Amaro": 5,
      "Jardim São Luís": 4,
      "Capão Redondo": 6,
      "Grajaú": 12,
      "Parelheiros": 18,
      "Cidade Dutra": 10,
      "Socorro": 4,
      "Interlagos": 8,
      "Pedreira": 6,
      "Cidade Ademar": 7,
      "Jabaquara": 9,
      "Saúde": 12,
      "Vila Mariana": 14,
      "Moema": 15,
      "Brooklin": 13,
      "Campo Belo": 12,
      "Itaim Bibi": 16,
      
      // Centro
      "Sé": 20,
      "República": 20,
      "Consolação": 18,
      "Bela Vista": 18,
      "Liberdade": 18,
      "Cambuci": 16,
      
      // Zona Oeste
      "Pinheiros": 17,
      "Butantã": 15,
      "Perdizes": 20,
      "Lapa": 22,
      "Vila Leopoldina": 24,
      "Jaguaré": 20,
      "Rio Pequeno": 18,
      "Raposo Tavares": 16,
      
      // Zona Norte
      "Santana": 28,
      "Tucuruvi": 30,
      "Tremembé": 35,
      "Jaçanã": 32,
      "Vila Maria": 26,
      "Casa Verde": 25,
      "Limão": 24,
      "Freguesia do Ó": 26,
      "Pirituba": 28,
      
      // Zona Leste
      "Mooca": 20,
      "Tatuapé": 24,
      "Penha": 28,
      "Vila Matilde": 30,
      "Itaquera": 35,
      "São Mateus": 32,
      "Sapopemba": 25,
      "Vila Prudente": 22,
      "São Lucas": 20,
      "Ipiranga": 14,
      "Vila Formosa": 26,
      "Aricanduva": 28,
      "Ermelino Matarazzo": 35,
      "São Miguel Paulista": 40,
      "Guaianases": 42,
    }
    
    // Verificar se temos o bairro na lista
    if (bairro && regionDistances[bairro]) {
      return regionDistances[bairro]
    }
    
    // Estimar baseado no prefixo do CEP
    const cepPrefix = parseInt(cep.substring(0, 3))
    
    // CEPs de São Paulo capital começam geralmente de 01000 a 08999
    if (cepPrefix >= 10 && cepPrefix <= 19) {
      // Centro
      return 20
    } else if (cepPrefix >= 20 && cepPrefix <= 39) {
      // Zona Norte/Nordeste
      return 28
    } else if (cepPrefix >= 40 && cepPrefix <= 49) {
      // Zona Sul (estamos aqui!)
      return 8
    } else if (cepPrefix >= 50 && cepPrefix <= 59) {
      // Zona Leste
      return 30
    } else if (cepPrefix >= 80 && cepPrefix <= 89) {
      // Zona Leste extremo
      return 38
    }
    
    // Distância padrão para áreas não mapeadas
    return 20
  }

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutos`
    }
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) {
      return `${h} hora${h > 1 ? "s" : ""}`
    }
    return `${h}h ${m}min`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 bg-secondary/20 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                Tempo de Entrega
              </h1>
              <p className="mt-2 text-muted-foreground">
                Digite seu CEP para calcular o tempo estimado de entrega
              </p>
              <p className="mt-1 text-sm text-primary font-medium">
                Entregamos apenas na cidade de São Paulo - SP
              </p>
            </div>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                  Seu Endereço
                </CardTitle>
                <CardDescription>
                  Saímos do bairro {ORIGIN_NEIGHBORHOOD}, São Paulo (CEP: {ORIGIN_CEP})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={calculateShipping} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {notInArea && (
                    <Alert variant="destructive" role="alert" className="border-orange-500 bg-orange-50 text-orange-800">
                      <XCircle className="h-4 w-4 text-orange-500" />
                      <AlertDescription className="text-orange-800">
                        <strong>Área não atendida.</strong> Desculpe, no momento entregamos apenas na cidade de São Paulo - SP. 
                        Se você mora em outra cidade, entre em contato conosco para verificar possibilidades de envio.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="cep" className="text-foreground">CEP de Entrega</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cep"
                        type="text"
                        placeholder="00000-000"
                        value={cep}
                        onChange={handleCepChange}
                        maxLength={9}
                        className="bg-background"
                        aria-describedby="cep-hint"
                      />
                      <Button
                        type="submit"
                        disabled={loading || cep.replace(/\D/g, "").length !== 8}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Calcular"
                        )}
                      </Button>
                    </div>
                    <p id="cep-hint" className="text-xs text-muted-foreground">
                      Não sabe seu CEP?{" "}
                      <a
                        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Consulte nos Correios
                      </a>
                    </p>
                  </div>
                </form>

                {result && (
                  <div className="mt-6 space-y-4">
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-primary/20 p-3">
                            <Clock className="h-8 w-8 text-primary" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Tempo estimado de entrega</p>
                            <p className="text-2xl font-bold text-primary">{result.estimatedTime}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-primary/20">
                          <p className="font-medium text-foreground">
                            Destino: {result.neighborhood}, {result.city} - {result.state}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Distância estimada: {result.distance} km a partir do {ORIGIN_NEIGHBORHOOD}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Alert className="border-primary/20 bg-primary/5">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-sm text-foreground">
                        O tempo estimado considera as condições normais de trânsito em São Paulo e pode variar em horários de pico. 
                        A entrega e gratuita para pedidos pequenos!
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info sobre área de entrega */}
            <Card className="mt-6 border-border bg-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-3">Área de Entrega</h2>
                <p className="text-muted-foreground text-sm">
                  Atualmente realizamos entregas apenas na <strong>cidade de São Paulo - SP</strong>. 
                  Nossa base fica no bairro {ORIGIN_NEIGHBORHOOD} (CEP: {ORIGIN_CEP}), na Zona Sul de São Paulo.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  As entregas são feitas de <strong>segunda a sábado</strong>, das 9h às 18h. 
                  A entrega e gratuita para todos os pedidos!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
