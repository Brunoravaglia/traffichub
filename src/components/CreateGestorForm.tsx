import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VCDLogo from "./VCDLogo";

const CreateGestorForm = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast.error("Nome do gestor é obrigatório");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("gestores")
        .insert({ nome: nome.trim() });

      if (error) throw error;

      toast.success("Gestor cadastrado com sucesso!");
      setNome("");
    } catch (error) {
      console.error("Erro ao cadastrar gestor:", error);
      toast.error("Erro ao cadastrar gestor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <VCDLogo size="sm" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Novo Gestor
            </h1>
            <p className="text-muted-foreground">
              Cadastre um novo gestor de tráfego
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="vcd-card p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Gestor</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite o nome do gestor"
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                "Cadastrando..."
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Cadastrar Gestor
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateGestorForm;
