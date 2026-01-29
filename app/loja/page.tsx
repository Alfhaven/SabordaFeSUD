import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SpiceGrid } from "@/components/spice-grid"

export default async function LojaPage() {
  const supabase = await createClient()

  // Busca todos os temperos com estoque disponível
  const { data: spices } = await supabase
    .from("spices")
    .select("*")
    .gt("stock", 0)
    .order("name", { ascending: true })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 bg-secondary/20 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Nossa Loja de Temperos
            </h1>
            <p className="mt-2 text-muted-foreground">
              Confira nossa seleção de temperos especiais
            </p>
          </div>

          <SpiceGrid spices={spices ?? []} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
