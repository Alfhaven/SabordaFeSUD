import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Truck, Heart, Shield } from "lucide-react"

const features = [
  {
    icon: Leaf,
    title: "Temperos Naturais",
    description: "Selecionados com cuidado para garantir qualidade e sabor em suas refeições.",
  },
  {
    icon: Truck,
    title: "Entrega Rápida",
    description: "Enviamos para todo o Brasil com cálculo de frete por CEP.",
  },
  {
    icon: Heart,
    title: "Projeto Social",
    description: "Toda compra ajuda os jovens da Igreja a realizar seus projetos e missões.",
  },
  {
    icon: Shield,
    title: "Qualidade Garantida",
    description: "Produtos selecionados e embalados com carinho pela nossa equipe.",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
              <div className="flex-1 space-y-6">
                <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  Sabor da Fé
                </h1>
                <p className="text-xl font-medium text-primary md:text-2xl">
                  O Gosto da Eternidade
                </p>
                <p className="max-w-xl text-pretty text-lg text-muted-foreground">
                  Descubra nossa seleção de temperos especiais, cuidadosamente escolhidos 
                  para dar mais sabor às suas receitas. Um projeto da Organização dos 
                  Rapazes (OR) da Igreja de Jesus Cristo dos Santos dos Últimos Dias.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                  <Link href="/loja">
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
                      Ver Temperos
                    </Button>
                  </Link>
                  <Link href="/sobre">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                      Conheça Nossa História
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Sabor da Fé - Uma colher com temperos, pimentas e especiarias"
                  width={350}
                  height={350}
                  className="drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16" aria-labelledby="features-title">
          <div className="container mx-auto px-4">
            <h2 id="features-title" className="mb-12 text-center text-3xl font-bold text-foreground">
              Por que escolher Sabor da Fé?
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="border-border bg-card transition-shadow hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                      <feature.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
              Pronto para temperar sua vida?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-primary-foreground/90">
              Conheça nossa variedade de temperos e ajude os jovens da Igreja a realizar 
              seus projetos enquanto você leva mais sabor para sua cozinha.
            </p>
            <Link href="/loja">
              <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                Explorar Loja
              </Button>
            </Link>
          </div>
        </section>

        {/* About Preview */}
        <section className="py-16" aria-labelledby="about-title">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 id="about-title" className="mb-6 text-3xl font-bold text-foreground">
                Sobre a Organização dos Rapazes
              </h2>
              <p className="mb-8 text-pretty text-lg text-muted-foreground">
                A Organização dos Rapazes (OR) é um programa da Igreja de Jesus Cristo dos 
                Santos dos Últimos Dias dedicado ao desenvolvimento espiritual, social e 
                pessoal de jovens rapazes. Este projeto de venda de temperos é uma iniciativa 
                para arrecadar fundos e ensinar princípios de trabalho, serviço e autossuficiência.
              </p>
              <Link href="/sobre">
                <Button variant="outline" size="lg">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
