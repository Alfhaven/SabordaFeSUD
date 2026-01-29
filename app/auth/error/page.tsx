import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main id="main-content" className="flex flex-1 items-center justify-center bg-secondary/30 px-4 py-12">
        <Card className="w-full max-w-md border-border bg-card">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-card-foreground">
              Erro de Autenticação
            </h1>
            <p className="mb-6 text-muted-foreground">
              Ocorreu um erro durante o processo de autenticação. Por favor, tente novamente.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/auth/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Tentar Login
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
