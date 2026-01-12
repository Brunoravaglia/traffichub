import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Phone, Link as LinkIcon, Edit2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import VCDLogo from "@/components/VCDLogo";
import EditGestorForm from "@/components/EditGestorForm";

interface GestorLink {
  nome: string;
  url: string;
}

const Gestores = () => {
  const navigate = useNavigate();

  const { data: gestores, isLoading } = useQuery({
    queryKey: ["gestores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gestores")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data;
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <VCDLogo size="sm" />
          <div className="flex-1" />
          <Button
            onClick={() => navigate("/novo-gestor")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Gestor
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Gestores de Tráfego
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie sua equipe de gestores
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : gestores && gestores.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {gestores.map((gestor) => {
              const links = (gestor.links as unknown as GestorLink[] | null) || [];
              
              return (
                <motion.div
                  key={gestor.id}
                  variants={itemVariants}
                  className="vcd-card-hover group"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {gestor.foto_url ? (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary border border-border flex-shrink-0">
                        <img
                          src={gestor.foto_url}
                          alt={gestor.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-primary-foreground">
                          {gestor.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {gestor.nome}
                      </h3>
                      
                      {gestor.telefone && (
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                          <Phone className="w-4 h-4 text-primary/70" />
                          <span>{gestor.telefone}</span>
                        </div>
                      )}

                      {links.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {links.slice(0, 3).map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <LinkIcon className="w-3 h-3" />
                              {link.nome}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Edit Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
                        <DialogHeader>
                          <DialogTitle>Editar Gestor</DialogTitle>
                        </DialogHeader>
                        <EditGestorForm gestorId={gestor.id} onClose={() => {}} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum gestor cadastrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Comece cadastrando seu primeiro gestor de tráfego
            </p>
            <Button
              onClick={() => navigate("/novo-gestor")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastrar Gestor
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Gestores;
