import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Globe,
  User,
  Search,
  Sparkles,
  Check,
  BarChart3,
  Target,
  Layout,
  ChevronRight,
  Zap,
  PieChart,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useGestor } from "@/contexts/GestorContext";
import { cn } from "@/lib/utils";

interface MetricConfig {
  key: string;
  label: string;
  icon: string;
  platform: "google" | "meta" | "both";
  visible: boolean;
}

interface TemplateConfig {
  id?: string;
  nome: string;
  descricao: string;
  is_global: boolean;
  metrics: MetricConfig[];
  sections: {
    showObjetivos: boolean;
    showGoogleAds: boolean;
    showMetaAds: boolean;
    showCriativosGoogle: boolean;
    showCriativosMeta: boolean;
    showResumo: boolean;
  };
}

interface TemplateSelectorProps {
  onSelect: (template: TemplateConfig | null) => void;
  selectedTemplateId?: string;
}

const DEFAULT_SECTIONS = {
  showObjetivos: true,
  showGoogleAds: true,
  showMetaAds: true,
  showCriativosGoogle: true,
  showCriativosMeta: true,
  showResumo: true,
};

type PlatformFilter = "all" | "google" | "meta";

export function TemplateSelector({ onSelect, selectedTemplateId }: TemplateSelectorProps) {
  const { gestor } = useGestor();
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["report-templates-selector", gestor?.id],
    queryFn: async () => {
      // Fetch templates that are global OR belong to this gestor
      let query = supabase
        .from("report_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (gestor?.id) {
        query = query.or(`is_global.eq.true,gestor_id.eq.${gestor.id}`);
      } else {
        query = query.eq("is_global", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map((t) => ({
        id: t.id,
        nome: t.nome,
        descricao: t.descricao || "",
        is_global: t.is_global,
        metrics: (t.layout as any)?.metrics || [],
        sections: (t.layout as any)?.sections || DEFAULT_SECTIONS,
      })) as TemplateConfig[];
    },
    enabled: true,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Filter templates by search and platform
  const filteredTemplates = templates?.filter((t) => {
    const matchesSearch = t.nome.toLowerCase().includes(search.toLowerCase()) ||
      t.descricao.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (platformFilter === "all") return true;

    // Check if template has metrics for the selected platform
    const hasGoogle = t.sections?.showGoogleAds || t.metrics?.some(m => m.platform === "google" && m.visible);
    const hasMeta = t.sections?.showMetaAds || t.metrics?.some(m => m.platform === "meta" && m.visible);

    if (platformFilter === "google") {
      return hasGoogle && !hasMeta;
    }
    if (platformFilter === "meta") {
      return hasMeta && !hasGoogle;
    }

    return true;
  });

  const getTemplateStats = (template: TemplateConfig) => {
    const googleMetrics = template.metrics?.filter(m => m.platform === "google" && m.visible).length || 0;
    const metaMetrics = template.metrics?.filter(m => m.platform === "meta" && m.visible).length || 0;
    const activeSections = Object.values(template.sections || {}).filter(Boolean).length;
    return { googleMetrics, metaMetrics, activeSections };
  };

  const getTemplateIcon = (template: TemplateConfig, index: number) => {
    const icons = [BarChart3, PieChart, TrendingUp, Target, Layout, Zap];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-blue-500/20 via-cyan-500/10 to-transparent",
      "from-purple-500/20 via-pink-500/10 to-transparent",
      "from-orange-500/20 via-amber-500/10 to-transparent",
      "from-green-500/20 via-emerald-500/10 to-transparent",
      "from-rose-500/20 via-red-500/10 to-transparent",
      "from-indigo-500/20 via-violet-500/10 to-transparent",
    ];
    return gradients[index % gradients.length];
  };

  const getIconColorClass = (index: number) => {
    const colors = [
      "text-blue-500",
      "text-purple-500",
      "text-orange-500",
      "text-green-500",
      "text-rose-500",
      "text-indigo-500",
    ];
    return colors[index % colors.length];
  };

  const handleSelectTemplate = (template: TemplateConfig) => {
    if (selectedTemplateId === template.id) {
      onSelect(null); // Deselect
    } else {
      onSelect(template);
    }
  };

  return (
    <>
      {/* Header and Actions */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Escolha um Modelo</h3>
              <p className="text-sm text-muted-foreground">
                Selecione um template para agilizar ou comece do zero
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar modelos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-border h-11 rounded-xl"
              />
            </div>
            
            <Button 
              onClick={() => onSelect(null)}
              variant="outline"
              className="h-11 px-6 rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 transition-all font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Do Zero
            </Button>
          </div>
        </div>

        {/* Platform Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Filtrar por:</span>
          <div className="flex gap-2">
            <Button
              variant={platformFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatformFilter("all")}
              className={cn(
                "transition-all",
                platformFilter === "all" && "bg-primary text-primary-foreground"
              )}
            >
              Ambos
            </Button>
            <Button
              variant={platformFilter === "google" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatformFilter("google")}
              className={cn(
                "transition-all",
                platformFilter === "google" && "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 mr-2" />
              Só Google
            </Button>
            <Button
              variant={platformFilter === "meta" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatformFilter("meta")}
              className={cn(
                "transition-all",
                platformFilter === "meta" && "bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-purple-400 mr-2" />
              Só Meta
            </Button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => {
              const stats = getTemplateStats(template);
              const Icon = getTemplateIcon(template, index);
              const isSelected = selectedTemplateId === template.id;
              const isHovered = hoveredId === template.id;

              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onMouseEnter={() => setHoveredId(template.id || null)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    onClick={() => handleSelectTemplate(template)}
                    className={cn(
                      "relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300",
                      "bg-card border-2",
                      isSelected
                        ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                        : "border-border hover:border-primary/40 hover:shadow-md"
                    )}
                  >
                    {/* Gradient Background */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                        getGradientClass(index),
                        (isHovered || isSelected) && "opacity-100"
                      )}
                    />

                    {/* Selected Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-3 right-3 z-10"
                        >
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Content */}
                    <div className="relative p-5 space-y-4">
                      {/* Icon & Title */}
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2.5 rounded-xl transition-all duration-300",
                            isSelected
                              ? "bg-primary/20"
                              : "bg-secondary group-hover:bg-primary/10"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-5 h-5 transition-colors duration-300",
                              isSelected ? "text-primary" : getIconColorClass(index)
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate pr-8">
                            {template.nome}
                          </h4>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "mt-1 text-[10px] px-2 py-0",
                              template.is_global
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {template.is_global ? (
                              <>
                                <Globe className="w-3 h-3 mr-1" />
                                Global
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3 mr-1" />
                                Pessoal
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {template.descricao || "Modelo de relatório personalizado"}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-muted-foreground">
                            Google: <span className="text-foreground font-medium">{stats.googleMetrics}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="text-muted-foreground">
                            Meta: <span className="text-foreground font-medium">{stats.metaMetrics}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Layout className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            <span className="text-foreground font-medium">{stats.activeSections}</span> seções
                          </span>
                        </div>
                      </div>

                      {/* Hover Action */}
                      <motion.div
                        initial={false}
                        animate={{
                          opacity: isHovered && !isSelected ? 1 : 0,
                          y: isHovered && !isSelected ? 0 : 10,
                        }}
                        className="absolute bottom-5 right-5"
                      >
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          Usar modelo
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium text-foreground mb-2">
            Nenhum modelo encontrado
          </h4>
          <p className="text-sm text-muted-foreground max-w-sm">
            {search
              ? "Tente buscar por outro termo ou limpe a pesquisa"
              : "Crie seu primeiro modelo de relatório para agilizar o trabalho"}
          </p>
        </motion.div>
      )}

      {/* Skip Option (kept as secondary fallback at the bottom) */}
      <div className="flex items-center justify-center pt-2 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(null)}
          className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest font-medium"
        >
          Ou pular e começar relatório do zero
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </>
  );
}

export default TemplateSelector;
