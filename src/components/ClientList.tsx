import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, Calendar, Plus, History, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import VCDLogo from "./VCDLogo";
import ProgressBar from "./ProgressBar";

const ClientList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const gestorFilter = searchParams.get("gestor");

  const { data: gestorInfo } = useQuery({
    queryKey: ["gestor", gestorFilter],
    queryFn: async () => {
      if (!gestorFilter) return null;
      const { data, error } = await supabase
        .from("gestores")
        .select("*")
        .eq("id", gestorFilter)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!gestorFilter,
  });

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes", gestorFilter],
    queryFn: async () => {
      let query = supabase
        .from("clientes")
        .select(`
          *,
          gestores(nome),
          checklists(*)
        `)
        .order("updated_at", { ascending: false });

      if (gestorFilter) {
        query = query.eq("gestor_id", gestorFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const clearFilter = () => {
    setSearchParams({});
  };

  const calculateProgress = (checklist: any) => {
    if (!checklist) return 0;
    const fields = [
      checklist.pagamento_ok,
      checklist.conta_sem_bloqueios,
      checklist.saldo_suficiente,
      checklist.pixel_tag_instalados,
      checklist.conversoes_configuradas,
      checklist.integracao_crm,
      checklist.criativos_atualizados,
      checklist.cta_claro,
      checklist.teste_ab_ativo,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
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
            onClick={() => navigate("/novo-cliente")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {gestorFilter && gestorInfo 
                ? `Clientes de ${gestorInfo.nome}` 
                : "Clientes Cadastrados"}
            </h1>
            <p className="text-muted-foreground">
              Selecione um cliente para gerenciar o checklist
            </p>
            {gestorFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilter}
                className="mt-4 border-border hover:bg-primary/10 hover:text-primary"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar filtro
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : !clientes?.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Nenhum cliente cadastrado
              </h2>
              <p className="text-muted-foreground mb-6">
                Comece criando seu primeiro cliente
              </p>
              <Button
                onClick={() => navigate("/novo-cliente")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Cliente
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {clientes.map((cliente) => {
                const latestChecklist = cliente.checklists?.[0];
                const progress = calculateProgress(latestChecklist);
                const totalChecklists = cliente.checklists?.length || 0;

                return (
                  <motion.div
                    key={cliente.id}
                    variants={itemVariants}
                    className="vcd-card-hover p-6 group"
                  >
                    <div className="flex items-center gap-6">
                      {/* Client Info */}
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/cliente/${cliente.id}`)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {cliente.nome}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {cliente.gestores?.nome}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(cliente.data_inicio), "dd/MM/yyyy")}
                          </span>
                          {totalChecklists > 0 && (
                            <span className="text-xs">
                              {totalChecklists} relatório{totalChecklists > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="w-32">
                        <ProgressBar progress={progress} size="sm" />
                      </div>

                      {/* History Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cliente/${cliente.id}/historico`);
                        }}
                        className="hover:bg-primary/10 hover:text-primary"
                        title="Ver histórico"
                      >
                        <History className="w-5 h-5" />
                      </Button>

                      {/* Arrow */}
                      <button
                        onClick={() => navigate(`/cliente/${cliente.id}`)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ClientList;
