import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Globe,
  User,
  Search,
  Sparkles,
  BarChart3,
  Target,
  Layout,
  Zap,
  PieChart,
  TrendingUp,
  Plus,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Save,
  LayoutTemplate,
} from "lucide-react";
import { useGestor } from "@/contexts/GestorContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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

const DEFAULT_METRICS: MetricConfig[] = [
  { key: "google_cliques", label: "Cliques", icon: "click", platform: "google", visible: true },
  { key: "google_impressoes", label: "Impressões", icon: "eye", platform: "google", visible: true },
  { key: "google_contatos", label: "Contatos/Leads", icon: "message", platform: "google", visible: true },
  { key: "google_investido", label: "Investido", icon: "dollar", platform: "google", visible: true },
  { key: "google_cpl", label: "Custo por Lead", icon: "target", platform: "google", visible: true },
  { key: "google_cpm", label: "CPM", icon: "trending", platform: "google", visible: false },
  { key: "google_conversoes", label: "Conversões", icon: "check", platform: "google", visible: true },
  { key: "meta_impressoes", label: "Impressões", icon: "eye", platform: "meta", visible: true },
  { key: "meta_engajamento", label: "Engajamento", icon: "trending", platform: "meta", visible: true },
  { key: "meta_conversas", label: "Conversas", icon: "message", platform: "meta", visible: true },
  { key: "meta_investido", label: "Investido", icon: "dollar", platform: "meta", visible: true },
  { key: "meta_cpl", label: "Custo por Lead", icon: "target", platform: "meta", visible: true },
  { key: "meta_cliques", label: "Cliques no Link", icon: "click", platform: "meta", visible: true },
  { key: "meta_alcance", label: "Alcance", icon: "users", platform: "meta", visible: true },
  { key: "meta_leads", label: "Leads Gerados", icon: "user-plus", platform: "meta", visible: true },
];

const DEFAULT_SECTIONS = {
  showObjetivos: true,
  showGoogleAds: true,
  showMetaAds: true,
  showCriativosGoogle: true,
  showCriativosMeta: true,
  showResumo: true,
};

type PlatformFilter = "all" | "google" | "meta";

const Modelos = () => {
  const { gestor } = useGestor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TemplateConfig | null>(null);
  const [formData, setFormData] = useState<TemplateConfig>({
    nome: "",
    descricao: "",
    is_global: false,
    metrics: [...DEFAULT_METRICS],
    sections: { ...DEFAULT_SECTIONS },
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["report-templates-page", gestor?.id],
    queryFn: async () => {
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
        metrics: (t.layout as any)?.metrics || DEFAULT_METRICS,
        sections: (t.layout as any)?.sections || DEFAULT_SECTIONS,
      })) as TemplateConfig[];
    },
    enabled: true,
  });

  const saveMutation = useMutation({
    mutationFn: async (template: TemplateConfig) => {
      const layoutData = JSON.parse(JSON.stringify({
        metrics: template.metrics,
        sections: template.sections,
      }));

      const payload = {
        nome: template.nome,
        descricao: template.descricao,
        is_global: template.is_global,
        gestor_id: gestor?.id,
        layout: layoutData,
      };

      if (template.id) {
        const { error } = await supabase
          .from("report_templates")
          .update(payload)
          .eq("id", template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("report_templates")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates-page"] });
      queryClient.invalidateQueries({ queryKey: ["report-templates-selector"] });
      toast({ title: "Modelo salvo com sucesso!" });
      setIsDialogOpen(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("report_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates-page"] });
      queryClient.invalidateQueries({ queryKey: ["report-templates-selector"] });
      toast({ title: "Modelo excluído!" });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });

  const filteredTemplates = templates?.filter((t) => {
    const matchesSearch = t.nome.toLowerCase().includes(search.toLowerCase()) ||
      t.descricao.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (platformFilter === "all") return true;

    const hasGoogle = t.sections?.showGoogleAds || t.metrics?.some(m => m.platform === "google" && m.visible);
    const hasMeta = t.sections?.showMetaAds || t.metrics?.some(m => m.platform === "meta" && m.visible);

    if (platformFilter === "google") return hasGoogle && !hasMeta;
    if (platformFilter === "meta") return hasMeta && !hasGoogle;

    return true;
  });

  const getTemplateStats = (template: TemplateConfig) => {
    const googleMetrics = template.metrics?.filter(m => m.platform === "google" && m.visible).length || 0;
    const metaMetrics = template.metrics?.filter(m => m.platform === "meta" && m.visible).length || 0;
    const activeSections = Object.values(template.sections || {}).filter(Boolean).length;
    return { googleMetrics, metaMetrics, activeSections };
  };

  const getTemplateIcon = (index: number) => {
    const icons = [BarChart3, PieChart, TrendingUp, Target, Layout, Zap];
    return icons[index % icons.length];
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

  const handleNewTemplate = () => {
    setFormData({
      nome: "",
      descricao: "",
      is_global: false,
      metrics: [...DEFAULT_METRICS],
      sections: { ...DEFAULT_SECTIONS },
    });
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (template: TemplateConfig) => {
    setFormData({ ...template });
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (template: TemplateConfig) => {
    setFormData({
      ...template,
      id: undefined,
      nome: `${template.nome} (Cópia)`,
    });
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    saveMutation.mutate(formData);
  };

  const toggleMetric = (key: string) => {
    setFormData({
      ...formData,
      metrics: formData.metrics.map((m) =>
        m.key === key ? { ...m, visible: !m.visible } : m
      ),
    });
  };

  const toggleSection = (key: keyof typeof DEFAULT_SECTIONS) => {
    setFormData({
      ...formData,
      sections: { ...formData.sections, [key]: !formData.sections[key] },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <LayoutTemplate className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Modelos de Relatório</h1>
              <p className="text-muted-foreground">
                Gerencie os templates disponíveis para você e sua equipe
              </p>
            </div>
          </div>
          <Button onClick={handleNewTemplate} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Modelo
          </Button>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {filteredTemplates?.length || 0} modelos
            </h3>
            <p className="text-sm text-muted-foreground">
              disponíveis para uso
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar modelos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-border focus:border-primary"
          />
        </div>
      </motion.div>

      {/* Platform Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2"
      >
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
      </motion.div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => {
              const stats = getTemplateStats(template);
              const Icon = getTemplateIcon(index);
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
                    className={cn(
                      "relative group rounded-2xl overflow-hidden transition-all duration-300",
                      "bg-card border-2 border-border hover:border-primary/40 hover:shadow-lg"
                    )}
                  >
                    {/* Gradient Background */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                        getGradientClass(index),
                        isHovered && "opacity-100"
                      )}
                    />

                    {/* Actions Menu */}
                    <div className="absolute top-3 right-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          {!template.is_global && (
                            <DropdownMenuItem
                              onClick={() => template.id && handleDeleteClick(template.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Content */}
                    <div className="relative p-5 space-y-4">
                      {/* Icon & Title */}
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2.5 rounded-xl transition-all duration-300",
                            "bg-secondary group-hover:bg-primary/10"
                          )}
                        >
                          <Icon className={cn("w-5 h-5", getIconColorClass(index))} />
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
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h4 className="text-xl font-semibold text-foreground mb-2">
            Nenhum modelo encontrado
          </h4>
          <p className="text-muted-foreground max-w-sm mb-6">
            {search
              ? "Tente buscar por outro termo ou limpe a pesquisa"
              : "Crie seu primeiro modelo de relatório para agilizar o trabalho"}
          </p>
          {!search && (
            <Button onClick={handleNewTemplate} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Modelo
            </Button>
          )}
        </motion.div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              {editingTemplate ? "Editar Modelo" : "Novo Modelo de Relatório"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Modelo</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Relatório Mensal Completo"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <Switch
                  checked={formData.is_global}
                  onCheckedChange={(v) => setFormData({ ...formData, is_global: v })}
                />
                <Label>Disponível para todos os gestores</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o objetivo deste modelo..."
              />
            </div>

            {/* Sections Config */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Seções do Relatório</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(formData.sections).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <Label className="text-sm">
                      {key.replace("show", "").replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Switch
                      checked={value}
                      onCheckedChange={() => toggleSection(key as keyof typeof DEFAULT_SECTIONS)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Config */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Métricas Google Ads ({formData.metrics.filter(m => m.platform === "google" && m.visible).length} selecionadas)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {formData.metrics
                  .filter((m) => m.platform === "google")
                  .map((metric) => (
                    <div
                      key={metric.key}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors",
                        metric.visible
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-secondary/30 border-border"
                      )}
                      onClick={() => toggleMetric(metric.key)}
                    >
                      <span className="text-sm truncate mr-2">{metric.label}</span>
                      <Switch checked={metric.visible} />
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Métricas Meta Ads ({formData.metrics.filter(m => m.platform === "meta" && m.visible).length} selecionadas)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {formData.metrics
                  .filter((m) => m.platform === "meta")
                  .map((metric) => (
                    <div
                      key={metric.key}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors",
                        metric.visible
                          ? "bg-purple-500/10 border-purple-500/30"
                          : "bg-secondary/30 border-border"
                      )}
                      onClick={() => toggleMetric(metric.key)}
                    >
                      <span className="text-sm truncate mr-2">{metric.label}</span>
                      <Switch checked={metric.visible} />
                    </div>
                  ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? "Salvando..." : "Salvar Modelo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir modelo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O modelo será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => templateToDelete && deleteMutation.mutate(templateToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Modelos;
