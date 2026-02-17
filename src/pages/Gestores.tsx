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
  ChevronDown,
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

const StatBox = ({ icon: Icon, value, label, color }: { icon: React.ElementType; value: string | number; label: string; color: string }) => (
  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/40 border border-border/30 min-w-0">
    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color)}>
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-lg font-bold text-foreground leading-none">{value}</span>
    <span className="text-[11px] text-muted-foreground leading-none">{label}</span>
  </div>
);

const Gestores = () => {
  const navigate = useNavigate();
  const { gestor: currentGestor, refreshGestor } = useGestor();
  const queryClient = useQueryClient();
  const [editingGestorId, setEditingGestorId] = useState<string | null>(null);
  const [expandedGestorId, setExpandedGestorId] = useState<string | null>(null);

  const { data: gestores, isLoading } = useQuery({
    queryKey: ["gestores-with-stats"],
    queryFn: async () => {
      const { data: gestoresData, error: gestoresError } = await supabase
        .from("gestores")
        .select("*")
        .order("nome");

      if (gestoresError) throw gestoresError;

      const gestoresWithStats: GestorWithStats[] = await Promise.all(
        gestoresData.map(async (gestor) => {
          const { count: clientCount } = await supabase
            .from("clientes")
            .select("*", { count: "exact", head: true })
            .eq("gestor_id", gestor.id);

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

          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          const { data: sessions } = await supabase
            .from("gestor_sessions")
            .select("duration_seconds")
            .eq("gestor_id", gestor.id)
            .gte("login_at", weekAgo.toISOString());

          const tempoSemana = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;

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

  const getActivityLevel = (seconds: number) => {
    const hours = seconds / 3600;
    if (hours >= 20) return { label: "Alta", dotColor: "bg-green-500" };
    if (hours >= 10) return { label: "Média", dotColor: "bg-yellow-500" };
    if (hours > 0) return { label: "Baixa", dotColor: "bg-orange-500" };
    return { label: "Inativo", dotColor: "bg-muted-foreground/50" };
  };

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Gestores de Tráfego
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe a atividade e produtividade da sua equipe
            </p>
          </div>
          <Button
            onClick={() => navigate("/novo-gestor")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
            className="space-y-4"
          >
            {gestores.map((gestor) => {
              const links = gestor.links || [];
              const activityLevel = getActivityLevel(gestor.tempo_semana_segundos);
              const isExpanded = expandedGestorId === gestor.id;
              
              return (
                <motion.div
                  key={gestor.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                  }}
                  layout
                  className={cn(
                    "rounded-2xl border transition-all duration-300 overflow-hidden",
                    "bg-card",
                    isExpanded 
                      ? "border-primary/40 shadow-lg shadow-primary/5" 
                      : "border-border hover:border-primary/20"
                  )}
                >
                  {/* Main Row */}
                  <div 
                    className="p-5 sm:p-6 cursor-pointer"
                    onClick={() => setExpandedGestorId(isExpanded ? null : gestor.id)}
                  >
                    {/* Top: Avatar + Name + Badge */}
                    <div className="flex items-center gap-4 mb-5">
                      {gestor.foto_url ? (
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary border-2 border-border flex-shrink-0">
                          <img
                            src={gestor.foto_url}
                            alt={gestor.nome}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                          <span className="text-xl font-bold text-primary-foreground">
                            {gestor.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {gestor.nome}
                          </h3>
                          {currentGestor?.id === gestor.id && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-primary/10 text-primary border-primary/20">
                              Você
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={cn("w-2 h-2 rounded-full", activityLevel.dotColor)} />
                          <span className="text-xs text-muted-foreground">
                            Atividade {activityLevel.label}
                          </span>
                        </div>
                      </div>

                      <ChevronDown 
                        className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                          isExpanded && "rotate-180"
                        )} 
                      />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatBox
                        icon={Timer}
                        value={formatDuration(gestor.tempo_semana_segundos)}
                        label="esta semana"
                        color="bg-blue-500/10 text-blue-500"
                      />
                      <StatBox
                        icon={Users}
                        value={gestor.total_clientes}
                        label="clientes"
                        color="bg-green-500/10 text-green-500"
                      />
                      <StatBox
                        icon={FileText}
                        value={gestor.total_relatorios}
                        label="relatórios"
                        color="bg-purple-500/10 text-purple-500"
                      />
                      <StatBox
                        icon={Trophy}
                        value={gestor.total_conquistas}
                        label="conquistas"
                        color="bg-yellow-500/10 text-yellow-500"
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isExpanded ? "auto" : 0,
                      opacity: isExpanded ? 1 : 0 
                    }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-6 space-y-5 border-t border-border/50 pt-5">
                      {/* Contact & Links */}
                      <div className="flex flex-wrap items-center gap-3">
                        {gestor.telefone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                            <Phone className="w-3.5 h-3.5 text-primary/70" />
                            <span>{gestor.telefone}</span>
                          </div>
                        )}
                        {links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <LinkIcon className="w-3 h-3" />
                            {link.nome}
                          </a>
                        ))}
                      </div>

                      {/* Detailed Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Clock className="w-3.5 h-3.5" />
                            Tempo Online (7 dias)
                          </div>
                          <p className="text-xl font-bold text-foreground">
                            {formatDuration(gestor.tempo_semana_segundos)}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Média Diária
                          </div>
                          <p className="text-xl font-bold text-foreground">
                            {formatDuration(Math.round(gestor.tempo_semana_segundos / 7))}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-1">
                        <Dialog 
                          open={editingGestorId === gestor.id} 
                          onOpenChange={(open) => setEditingGestorId(open ? gestor.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="default"
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
                          size="default"
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
