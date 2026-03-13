import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, User, Calendar, Plus, History, Building2, Filter, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgressBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGestor } from "@/contexts/GestorContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ClientList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { gestor: loggedGestor, isLoggedIn } = useGestor();
  const agencyId = loggedGestor?.agencia_id ?? null;
  
  // Initialize filter with URL param or logged gestor's ID
  const urlGestor = searchParams.get("gestor");
  const [selectedGestorId, setSelectedGestorId] = useState<string>(urlGestor || "all");
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Set the filter to the logged gestor when they first load the page (only if no URL param)
  useEffect(() => {
    if (!hasInitialized && isLoggedIn && loggedGestor?.id) {
      if (!urlGestor) {
        setSelectedGestorId(loggedGestor.id);
      }
      setHasInitialized(true);
    }
  }, [isLoggedIn, loggedGestor?.id, hasInitialized, urlGestor]);

  // Update URL when filter changes
  useEffect(() => {
    if (selectedGestorId && selectedGestorId !== "all") {
      setSearchParams({ gestor: selectedGestorId });
    } else if (selectedGestorId === "all") {
      setSearchParams({});
    }
  }, [selectedGestorId, setSearchParams]);

  const gestorFilter = selectedGestorId !== "all" ? selectedGestorId : null;

  // Fetch all gestores for the filter dropdown
  const { data: allGestores } = useQuery({
    queryKey: ["gestores-filter", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const { data, error } = await supabase
        .from("gestores")
        .select("id, nome, foto_url")
        .eq("agencia_id", agencyId)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!agencyId,
  });

  const { data: gestorInfo } = useQuery({
    queryKey: ["gestor", gestorFilter, agencyId],
    queryFn: async () => {
      if (!gestorFilter || !agencyId) return null;
      const { data, error } = await supabase
        .from("gestores")
        .select("*")
        .eq("id", gestorFilter)
        .eq("agencia_id", agencyId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!gestorFilter && !!agencyId,
  });

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes", gestorFilter, agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      let query = supabase
        .from("clientes")
        .select(`
          *,
          gestores(nome),
          checklists(*)
        `)
        .eq("agencia_id", agencyId)
        .order("updated_at", { ascending: false });

      if (gestorFilter) {
        query = query.eq("gestor_id", gestorFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!agencyId,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const calculateProgress = (checklist: any) => {
    if (!checklist) return 0;
    // Setup inicial: apenas Faturamento + Rastreamento (6 campos)
    const fields = [
      checklist.pagamento_ok,
      checklist.conta_sem_bloqueios,
      checklist.saldo_suficiente,
      checklist.pixel_tag_instalados,
      checklist.conversoes_configuradas,
      checklist.integracao_crm,
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
    <div className="min-h-full bg-background px-4 py-5 sm:p-6">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 mb-8"
        >
          {/* Header Row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-4xl">
                {gestorFilter && gestorInfo 
                  ? `Clientes de ${gestorInfo.nome}` 
                  : "Todos os Clientes"}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Selecione um cliente para gerenciar o checklist
              </p>
            </div>
            <Button
              onClick={() => navigate("/novo-cliente")}
              className="h-14 w-full bg-primary text-base hover:bg-primary/90 sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </div>

          {/* Filter Row */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtrar por gestor:</span>
            </div>
            <Select
              value={selectedGestorId}
              onValueChange={setSelectedGestorId}
            >
              <SelectTrigger className="h-12 w-full bg-background sm:w-[280px]">
                <SelectValue placeholder="Selecione um gestor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Todos os gestores</span>
                  </div>
                </SelectItem>
                {allGestores?.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={g.foto_url || undefined} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {g.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{g.nome}</span>
                      {g.id === loggedGestor?.id && (
                        <span className="text-xs text-muted-foreground">(você)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {gestorFilter && gestorFilter !== loggedGestor?.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedGestorId(loggedGestor?.id || "all")}
                className="h-11 justify-start px-0 text-muted-foreground hover:text-primary sm:ml-auto sm:h-9 sm:px-3"
              >
                Ver meus clientes
              </Button>
            )}
          </div>
        </motion.div>

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
                    className="vcd-card-hover group p-4 sm:p-6"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <Avatar className="h-14 w-14 shrink-0 border-2 border-border sm:h-16 sm:w-16">
                          <AvatarImage src={cliente.logo_url || undefined} alt={cliente.nome} />
                          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                            {cliente.nome.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <button
                          type="button"
                          className="min-w-0 flex-1 cursor-pointer text-left"
                          onClick={() => navigate(`/cliente/${cliente.id}`)}
                        >
                          <div className="flex flex-col gap-2">
                            <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                              {cliente.nome}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                {cliente.gestores?.nome}
                              </span>
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(cliente.data_inicio), "dd/MM/yyyy")}
                              </span>
                              {totalChecklists > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  {totalChecklists} relatório{totalChecklists > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
                            <span>Progresso</span>
                            <span>{progress}%</span>
                          </div>
                          <ProgressBar progress={progress} size="sm" />
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cliente/${cliente.id}/historico`);
                          }}
                          className="h-11 w-11 shrink-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                          title="Ver histórico"
                        >
                          <History className="h-5 w-5" />
                        </Button>

                        <button
                          type="button"
                          onClick={() => navigate(`/cliente/${cliente.id}`)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-primary/10"
                          title="Abrir cliente"
                        >
                          <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClientList;
