import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import { 
  Trophy, Star, Crown, Gem, Award, Zap, Target, Users, 
  FileText, Clock, Camera, Rocket, UserCheck, UserPlus,
  BarChart2, Files, CheckCircle, Layout, Palette, Flame,
  Lock, Download, Linkedin, Share2, Filter, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

interface GestorAchievement {
  id: string;
  gestor_id: string;
  achievement_id: string;
  unlocked_at: string;
  shared_linkedin: boolean;
  achievement?: Achievement;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  trophy: Trophy,
  star: Star,
  crown: Crown,
  gem: Gem,
  award: Award,
  zap: Zap,
  target: Target,
  users: Users,
  "file-text": FileText,
  files: Files,
  clock: Clock,
  camera: Camera,
  rocket: Rocket,
  "user-check": UserCheck,
  "user-plus": UserPlus,
  "bar-chart-2": BarChart2,
  "check-circle": CheckCircle,
  layout: Layout,
  palette: Palette,
  flame: Flame,
};

const rarityConfig = {
  common: {
    label: "Comum",
    color: "from-slate-400 to-slate-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-400/30",
    textColor: "text-slate-400",
    glowColor: "shadow-slate-400/20",
  },
  rare: {
    label: "Raro",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-400/30",
    textColor: "text-blue-400",
    glowColor: "shadow-blue-400/30",
  },
  epic: {
    label: "Épico",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-400/30",
    textColor: "text-purple-400",
    glowColor: "shadow-purple-400/40",
  },
  legendary: {
    label: "Lendário",
    color: "from-amber-400 via-orange-500 to-red-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-400/50",
    textColor: "text-amber-400",
    glowColor: "shadow-amber-400/50",
  },
};

const categoryLabels: Record<string, string> = {
  onboarding: "Primeiros Passos",
  clientes: "Clientes",
  relatorios: "Relatórios",
  tempo: "Dedicação",
  checklists: "Checklists",
  modelos: "Modelos",
};

const Conquistas = () => {
  const { gestor } = useGestor();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement & { unlocked?: boolean; unlockedAt?: string } | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const achievementCardRef = useRef<HTMLDivElement>(null);

  // Fetch all achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("category", { ascending: true })
        .order("requirement_value", { ascending: true });
      if (error) throw error;
      return data as Achievement[];
    },
  });

  // Fetch unlocked achievements for current gestor
  const { data: unlockedAchievements = [] } = useQuery({
    queryKey: ["gestor-achievements", gestor?.id],
    queryFn: async () => {
      if (!gestor?.id) return [];
      const { data, error } = await supabase
        .from("gestor_achievements")
        .select("*")
        .eq("gestor_id", gestor.id);
      if (error) throw error;
      return data as GestorAchievement[];
    },
    enabled: !!gestor?.id,
  });

  const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievement_id));
  
  const totalPoints = achievements
    .filter(a => unlockedIds.has(a.id))
    .reduce((sum, a) => sum + a.points, 0);

  const maxPoints = achievements.reduce((sum, a) => sum + a.points, 0);
  const progressPercent = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

  const categories = [...new Set(achievements.map(a => a.category))];

  const filteredAchievements = achievements.filter(a => {
    if (filter !== "all" && a.category !== filter) return false;
    if (showUnlockedOnly && !unlockedIds.has(a.id)) return false;
    return true;
  });

  const handleExportPDF = async () => {
    if (!achievementCardRef.current || !selectedAchievement) return;

    try {
      const canvas = await html2canvas(achievementCardRef.current, {
        scale: 2,
        backgroundColor: "#1a1a2e",
      });
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`conquista-${selectedAchievement.name.toLowerCase().replace(/\s/g, "-")}.pdf`);
      toast.success("Conquista exportada com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar conquista");
    }
  };

  const handleShareLinkedIn = async () => {
    if (!selectedAchievement || !gestor) return;

    const rarityLabel = rarityConfig[selectedAchievement.rarity].label;
    const message = encodeURIComponent(
      `🏆 Acabei de desbloquear a conquista "${selectedAchievement.name}" (${rarityLabel}) no TrafficHub!\n\n` +
      `${selectedAchievement.description}\n\n` +
      `+${selectedAchievement.points} pontos de experiência!\n\n` +
      `#TrafficHub #Conquista #Marketing #Performance #Gamification`
    );

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${message}`;
    window.open(linkedInUrl, "_blank", "width=600,height=400");

    // Mark as shared
    const unlockedAch = unlockedAchievements.find(ua => ua.achievement_id === selectedAchievement.id);
    if (unlockedAch) {
      await supabase
        .from("gestor_achievements")
        .update({ shared_linkedin: true })
        .eq("id", unlockedAch.id);
    }

    toast.success("Compartilhado no LinkedIn!");
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Trophy;
  };

  const getUnlockedDate = (achievementId: string) => {
    const unlocked = unlockedAchievements.find(ua => ua.achievement_id === achievementId);
    return unlocked?.unlocked_at;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-amber-500/10 border border-primary/20 p-6 md:p-8"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/20"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                scale: Math.random() * 0.5 + 0.5 
              }}
              animate={{ 
                y: [null, "-100%"],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ 
                duration: Math.random() * 5 + 5, 
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Trophy Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Trophy className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/50"
            />
          </motion.div>

          {/* Stats */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-amber-400 bg-clip-text text-transparent"
            >
              Suas Conquistas
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mt-2"
            >
              {gestor?.nome}, você é um verdadeiro campeão! Continue desbloqueando conquistas.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex flex-wrap items-center gap-4 justify-center md:justify-start"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-xl">{totalPoints}</span>
                <span className="text-muted-foreground">pontos</span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-bold">{unlockedAchievements.length}</span>
                <span className="text-muted-foreground">/ {achievements.length}</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-4 max-w-md mx-auto md:mx-0"
            >
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1 text-center md:text-left">
                {progressPercent.toFixed(1)}% completo
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3 items-center"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtrar:</span>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="flex-1">
          <TabsList className="bg-muted/50 h-auto flex-wrap">
            <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {categoryLabels[cat] || cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button
          variant={showUnlockedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
          className="gap-2"
        >
          <Trophy className="w-4 h-4" />
          Desbloqueadas
        </Button>
      </motion.div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredAchievements.map((achievement, index) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const rarity = rarityConfig[achievement.rarity];
          const IconComponent = getIcon(achievement.icon);
          const unlockedDate = getUnlockedDate(achievement.id);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAchievement({ 
                ...achievement, 
                unlocked: isUnlocked,
                unlockedAt: unlockedDate 
              })}
              className="cursor-pointer"
            >
              <Card 
                className={cn(
                  "relative overflow-hidden transition-all duration-300 h-full",
                  isUnlocked 
                    ? `${rarity.bgColor} ${rarity.borderColor} border-2 shadow-lg ${rarity.glowColor}` 
                    : "bg-muted/30 border-border/50 grayscale opacity-60"
                )}
              >
                {/* Rarity Indicator */}
                {isUnlocked && (
                  <div className={cn(
                    "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                    rarity.color
                  )} />
                )}

                <CardContent className="p-4 flex flex-col items-center text-center">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mb-3 relative",
                      isUnlocked 
                        ? `bg-gradient-to-br ${rarity.color}` 
                        : "bg-muted"
                    )}
                  >
                    {isUnlocked ? (
                      <IconComponent className="w-8 h-8 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className={cn(
                    "font-semibold text-sm line-clamp-2",
                    isUnlocked ? rarity.textColor : "text-muted-foreground"
                  )}>
                    {achievement.name}
                  </h3>

                  {/* Points */}
                  <div className="flex items-center gap-1 mt-2">
                    <Sparkles className={cn(
                      "w-3 h-3",
                      isUnlocked ? "text-amber-400" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      isUnlocked ? "text-amber-400" : "text-muted-foreground"
                    )}>
                      {achievement.points} pts
                    </span>
                  </div>

                  {/* Rarity Badge */}
                  <span 
                    className={cn(
                      "mt-2 text-[10px] px-2 py-0.5 rounded-full border",
                      isUnlocked 
                        ? `${rarity.textColor} ${rarity.borderColor}` 
                        : "text-muted-foreground border-muted"
                    )}
                  >
                    {rarity.label}
                  </span>
                </CardContent>

                {/* Legendary Shimmer Effect */}
                {isUnlocked && achievement.rarity === "legendary" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Detail Modal */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="sm:max-w-lg overflow-hidden p-0" aria-describedby={undefined}>
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedAchievement?.name || "Conquista"}</DialogTitle>
          </DialogHeader>
          {selectedAchievement && (
            <>
              {/* Exportable Card */}
              <div ref={achievementCardRef} className="p-6 bg-background">
                {/* Header with gradient */}
                <div className={cn(
                  "relative rounded-2xl overflow-hidden p-6 mb-4",
                  "bg-gradient-to-br",
                  rarityConfig[selectedAchievement.rarity].color
                )}>
                  <div className="relative flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {(() => {
                        const IconComponent = getIcon(selectedAchievement.icon);
                        return <IconComponent className="w-10 h-10 text-white" />;
                      })()}
                    </div>

                    <div className="flex-1">
                      <Badge className="bg-white/20 text-white border-white/30 mb-2">
                        {rarityConfig[selectedAchievement.rarity].label}
                      </Badge>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedAchievement.name}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {selectedAchievement.description}
                  </p>

                  <div className="flex items-center justify-between py-4 border-y border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-2xl font-bold">{selectedAchievement.points}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Pontos</span>
                    </div>

                    <div className="text-center">
                      <Badge variant="outline" className={rarityConfig[selectedAchievement.rarity].textColor}>
                        {categoryLabels[selectedAchievement.category] || selectedAchievement.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Categoria</p>
                    </div>

                    <div className="text-center">
                      {selectedAchievement.unlocked ? (
                        <>
                          <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedAchievement.unlockedAt 
                              ? new Date(selectedAchievement.unlockedAt).toLocaleDateString('pt-BR')
                              : "Desbloqueada"
                            }
                          </p>
                        </>
                      ) : (
                        <>
                          <Lock className="w-6 h-6 text-muted-foreground mx-auto" />
                          <p className="text-xs text-muted-foreground mt-1">Bloqueada</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Gestor info for export */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium">{gestor?.nome}</span>
                    <span className="text-xs text-muted-foreground">TrafficHub</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedAchievement.unlocked && (
                <div className="p-4 bg-muted/30 border-t border-border flex gap-3">
                  <Button 
                    onClick={handleExportPDF} 
                    variant="outline" 
                    className="flex-1 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar PDF
                  </Button>
                  <Button 
                    onClick={handleShareLinkedIn}
                    className="flex-1 gap-2 bg-[#0077B5] hover:bg-[#005885]"
                  >
                    <Linkedin className="w-4 h-4" />
                    Compartilhar
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Conquistas;
