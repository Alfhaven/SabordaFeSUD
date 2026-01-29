import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, BookOpen, Sun, Star, HandHeart } from "lucide-react"

const values = [
  {
    icon: BookOpen,
    title: "Fé",
    description: "Acreditamos no poder do evangelho de Jesus Cristo para transformar vidas e famílias.",
  },
  {
    icon: HandHeart,
    title: "Serviço",
    description: "Servir ao próximo é uma forma de demonstrar nosso amor por Deus e pela comunidade.",
  },
  {
    icon: Users,
    title: "Fraternidade",
    description: "Trabalhamos juntos como irmãos, apoiando uns aos outros em nossa jornada.",
  },
  {
    icon: Star,
    title: "Crescimento",
    description: "Buscamos constantemente melhorar em todas as áreas de nossas vidas.",
  },
]

const objectives = [
  "Arrecadar fundos para atividades da Igreja",
  "Desenvolver habilidades empreendedoras nos jovens",
  "Promover o trabalho em equipe e a colaboração",
  "Ensinar princípios de autossuficiência",
  "Preparar jovens para servir missões",
  "Fortalecer os laços de amizade e fraternidade",
]

export default function SobrePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-secondary to-background py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
              <div className="flex-1 space-y-6">
                <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                  Sobre a Organização dos Rapazes
                </h1>
                <p className="text-pretty text-lg text-muted-foreground">
                  Conheça mais sobre a OR e como este projeto de venda de temperos 
                  ajuda os jovens da Igreja de Jesus Cristo dos Santos dos Últimos Dias.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Sabor da Fé"
                  width={250}
                  height={250}
                  className="drop-shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About OR Section */}
        <section className="py-16" aria-labelledby="about-or">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 id="about-or" className="mb-8 text-center text-3xl font-bold text-foreground">
                O que é a OR?
              </h2>
              
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p className="text-pretty leading-relaxed">
                  A <strong className="text-foreground">Organização dos Rapazes (OR)</strong> é o 
                  programa da Igreja de Jesus Cristo dos Santos dos Últimos Dias dedicado aos rapazes 
                  de 12 a 18 anos. O objetivo da OR é ajudar cada jovem a fortalecer sua fé em Jesus 
                  Cristo, desenvolver seu potencial e preparar-se para suas futuras responsabilidades.
                </p>
                
                <p className="text-pretty leading-relaxed">
                  Os jovens da OR participam de diversas atividades que incluem estudos das escrituras, 
                  projetos de serviço comunitário, acampamentos, atividades esportivas e projetos que 
                  desenvolvem habilidades práticas para a vida.
                </p>
                
                <p className="text-pretty leading-relaxed">
                  O projeto <strong className="text-foreground">Sabor da Fé</strong> nasceu da iniciativa 
                  de jovens da OR que desejavam contribuir com a comunidade e arrecadar fundos para 
                  atividades da Igreja, incluindo a preparação de jovens para servirem missões. Ao 
                  comprar nossos temperos, você está apoiando diretamente esses jovens em sua jornada 
                  de crescimento e serviço.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-secondary/30 py-16" aria-labelledby="values-title">
          <div className="container mx-auto px-4">
            <h2 id="values-title" className="mb-12 text-center text-3xl font-bold text-foreground">
              Nossos Valores
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <Card key={value.title} className="border-border bg-card transition-shadow hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">
                      <value.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-card-foreground">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Objectives Section */}
        <section className="py-16" aria-labelledby="objectives-title">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 id="objectives-title" className="mb-8 text-center text-3xl font-bold text-foreground">
                Objetivos do Projeto
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="rounded-full bg-primary/10 p-1">
                      <Sun className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <p className="text-foreground">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Church Info Section */}
        <section className="bg-primary py-16" aria-labelledby="church-title">
          <div className="container mx-auto px-4 text-center">
            <h2 id="church-title" className="mb-6 text-3xl font-bold text-primary-foreground">
              A Igreja de Jesus Cristo dos Santos dos Últimos Dias
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-primary-foreground/90">
              Somos uma Igreja cristã restaurada que segue os ensinamentos de Jesus Cristo. 
              Acreditamos que famílias podem ser eternas e que todos somos filhos de um 
              Pai Celestial amoroso que deseja nossa felicidade.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="https://www.churchofjesuschrist.org/?lang=pt"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                  Conheça a Igreja
                </Button>
              </a>
              <a
                href="https://www.vindeacristo.org/ps/reunir-com-missionarios?cid=C22297611837G176881100578A736240060980&adlang=por&source=google&network=g&gad_source=1&gad_campaignid=22297611837&gclid=Cj0KCQiAvtzLBhCPARIsALwhxdpL21L3tzcuQn5km1B-lF0LJk-uL5V3_otWAfpUL_uSb39P7R9bahUaAg0uEALw_wcB"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                  Vinde a Cristo
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Mission Prep Section */}
        <section className="py-16" aria-labelledby="mission-title">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-primary" aria-hidden="true" />
              <h2 id="mission-title" className="mb-6 text-3xl font-bold text-foreground">
                Preparando Missionários
              </h2>
              <p className="mb-8 text-pretty text-lg text-muted-foreground">
                Uma parte importante da vida de muitos jovens Santos dos Últimos Dias é a 
                oportunidade de servir uma missão de tempo integral. Por dois anos, eles 
                dedicam suas vidas a ensinar o evangelho de Jesus Cristo e servir as pessoas 
                ao redor do mundo. Este projeto ajuda jovens a se prepararem financeiramente 
                e espiritualmente para essa experiência transformadora.
              </p>
              <Link href="/loja">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Apoie Nossa Causa
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4">
            <blockquote className="mx-auto max-w-2xl text-center">
              <p className="text-balance text-2xl font-medium italic text-foreground">
                "Deixai vir a mim os pequeninos, e não os impeçais, porque dos tais é o reino de Deus."
              </p>
              <footer className="mt-4 text-muted-foreground">
                — Marcos 10:14
              </footer>
            </blockquote>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
