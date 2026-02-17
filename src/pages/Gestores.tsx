import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  Phone, 
  Link as LinkIcon, 
  Edit2, 
  Clock, 
  Users, 
  FileText,
  TrendingUp,
  ChevronRight,
  Timer,
  Briefcase,
  Trophy
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import EditGestorForm from "@/components/EditGestorForm";
import { useGestor } from "@/contexts/GestorContext";
import { cn } from "@/lib/utils";

interface GestorLink {
  nome: string;
  url: string;
}

interface GestorWithStats {
  id: string;
  nome: string;
  foto_url: string | null;
  telefone: string | null;
  links: GestorLink[] | null;
  total_clientes: number;
  total_relatorios: number;
  tempo_semana_segundos: number;
  total_conquistas: number;
}

const formatDuration = (seconds: number): string => {
  if (seconds === 0) return "0min";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

const Gestores = () => {
  const navigate = useNavigate();
  const { gestor: currentGestor, refreshGestor } = useGestor();
  const queryClient = useQueryClient();
  const [editingGestorId, setEditingGestorId] = useState<string | null>(null);
  const [expandedGestorId, setExpandedGestorId] = useState<string | null>(null);

  const { data: gestores, isLoading } = useQuery({
    queryKey: ["gestores-with-stats"],
    queryFn: async () => {
      // Fetch gestores
      const { data: gestoresData, error: gestoresError } = await supabase
        .from("gestores")
        .select("*")
        .order("nome");

      if (gestoresError) throw gestoresError;

      // Fetch stats for each gestor
      const gestoresWithStats: GestorWithStats[] = await Promise.all(
        gestoresData.map(async (gestor) => {
          // Get client count
          const { count: clientCount } = await supabase
            .from("clientes")
            .select("*", { count: "exact", head: true })
            .eq("gestor_id", gestor.id);

          // Get report count (reports from clients of this gestor)
          const { data: clientIds } = await supabase
            .from("clientes")
            .select("id")
            .eq("gestor_id", gestor.id);

          let reportCount = 0;
          if (clientIds && clientIds.length > 0) {
            const { count } = await supabase
              .from("client_reports")
              .select("*", { count: "exact", head: true })
              .in("cliente_id", clientIds.map(c => c.id));
            reportCount = count || 0;
          }

          // Get session time for the week
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          const { data: sessions } = await supabase
            .from("gestor_sessions")
            .select("duration_seconds")
            .eq("gestor_id", gestor.id)
            .gte("login_at", weekAgo.toISOString());

          const tempoSemana = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;

          // Get achievement count
          const { count: achievementCount } = await supabase
            .from("gestor_achievements")
            .select("*", { count: "exact", head: true })
            .eq("gestor_id", gestor.id);

          return {
            id: gestor.id,
            nome: gestor.nome,
            foto_url: gestor.foto_url,
            telefone: gestor.telefone,
            links: gestor.links as unknown as GestorLink[] | null,
            total_clientes: clientCount || 0,
            total_relatorios: reportCount,
            tempo_semana_segundos: tempoSemana,
            total_conquistas: achievementCount || 0,
          };
        })
      );

      return gestoresWithStats;
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  const getActivityLevel = (seconds: number) => {
    const hours = seconds / 3600;
    if (hours >= 20) return { label: "Alta", color: "bg-green-500", textColor: "text-green-500" };
    if (hours >= 10) return { label: "Média", color: "bg-yellow-500", textColor: "text-yellow-500" };
    if (hours > 0) return { label: "Baixa", color: "bg-orange-500", textColor: "text-orange-500" };
    return { label: "Inativo", color: "bg-muted", textColor: "text-muted-foreground" };
  };

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestores de Tráfego
            </h1>
            <p className="text-muted-foreground">
              Acompanhe a atividade e produtividade da sua equipe
            </p>
          </div>
          <Button
            onClick={() => navigate("/novo-gestor")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Gestor
          </Button>
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
            className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {gestores.map((gestor) => {
              const links = gestor.links || [];
              const activityLevel = getActivityLevel(gestor.tempo_semana_segundos);
              const isExpanded = expandedGestorId === gestor.id;
              
              return (
                <motion.div
                  key={gestor.id}
                  variants={itemVariants}
                  layout
                  className={cn(
                    "relative rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                    "bg-gradient-to-br from-card via-card to-card/50",
                    isExpanded 
                      ? "border-primary shadow-lg shadow-primary/10" 
                      : "border-border hover:border-primary/30 hover:shadow-md"
                  )}
                >
                  {/* Activity Indicator Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1">
                    <div 
                      className={cn("h-full transition-all", activityLevel.color)}
                      style={{ 
                        width: `${Math.min(100, (gestor.tempo_semana_segundos / (40 * 3600)) * 100)}%` 
                      }}
                    />
                  </div>

                  {/* Main Card Content */}
                  <div 
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedGestorId(isExpanded ? null : gestor.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      {gestor.foto_url ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary border border-border flex-shrink-0 ring-2 ring-background shadow-md">
                          <img
                            src={gestor.foto_url}
                            alt={gestor.nome}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0 ring-2 ring-background shadow-md">
                          <span className="text-xl font-bold text-primary-foreground">
                            {gestor.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {gestor.nome}
                          </h3>
                          {currentGestor?.id === gestor.id && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                              Você
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs px-2 py-0.5",
                              activityLevel.textColor,
                              "bg-opacity-10"
                            )}
                          >
                            <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5", activityLevel.color)} />
                            {activityLevel.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Expand Indicator */}
                      <ChevronRight 
                        className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )} 
                      />
                    </div>

                    {/* Quick Stats Row */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Timer className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            {formatDuration(gestor.tempo_semana_segundos)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">esta semana</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">{gestor.total_clientes}</p>
                          <p className="text-[10px] text-muted-foreground">clientes</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">{gestor.total_relatorios}</p>
                          <p className="text-[10px] text-muted-foreground">relatórios</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">{gestor.total_conquistas}</p>
                          <p className="text-[10px] text-muted-foreground">conquistas</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isExpanded ? "auto" : 0,
                      opacity: isExpanded ? 1 : 0 
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-border/50">
                      {/* Contact Info */}
                      {gestor.telefone && (
                        <div className="flex items-center gap-2 pt-4 text-muted-foreground text-sm">
                          <Phone className="w-4 h-4 text-primary/70" />
                          <span>{gestor.telefone}</span>
                        </div>
                      )}

                      {/* Links */}
                      {links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <LinkIcon className="w-3 h-3" />
                              {link.nome}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Detailed Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            Tempo Online (7 dias)
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {formatDuration(gestor.tempo_semana_segundos)}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <TrendingUp className="w-3 h-3" />
                            Média Diária
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {formatDuration(Math.round(gestor.tempo_semana_segundos / 7))}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Dialog 
                          open={editingGestorId === gestor.id} 
                          onOpenChange={(open) => setEditingGestorId(open ? gestor.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
                            <DialogHeader>
                              <DialogTitle>Editar Gestor</DialogTitle>
                            </DialogHeader>
                            <EditGestorForm 
                              gestorId={gestor.id} 
                              onClose={() => setEditingGestorId(null)} 
                              onSuccess={async () => {
                                if (currentGestor?.id === gestor.id) {
                                  await refreshGestor();
                                }
                                queryClient.invalidateQueries({ queryKey: ["gestores-with-stats"] });
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/clientes?gestor=${gestor.id}`);
                          }}
                        >
                          <Briefcase className="w-4 h-4 mr-2" />
                          Ver Clientes
                        </Button>
                      </div>
                    </div>
                  </motion.div>
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
      </div>
    </div>
  );
};

export default Gestores;
