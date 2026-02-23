import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Filter,
  Users,
  ChevronRight,
} from "lucide-react";
import { useGestor } from "@/contexts/GestorContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { GradientButton } from "@/components/ui/gradient-button";

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
  { key: "google_contatos", label: "Conversões", icon: "message", platform: "google", visible: true },
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
  const navigate = useNavigate();
  const { gestor } = useGestor();
  const agencyId = gestor?.agencia_id ?? null;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Client selection modal
  const [clientSelectOpen, setClientSelectOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedGestorId, setSelectedGestorId] = useState<string>("all");
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

  // Fetch gestores for client filter
  const { data: allGestores } = useQuery({
    queryKey: ["gestores-filter-modelos", agencyId],
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

  // Fetch clients for selection modal
  const gestorFilter = selectedGestorId !== "all" ? selectedGestorId : null;
  const { data: clientes, isLoading: clientesLoading } = useQuery({
    queryKey: ["clientes-modelos", agencyId, gestorFilter],
    queryFn: async () => {
      if (!agencyId) return [];
      let query = supabase
        .from("clientes")
        .select("id, nome, logo_url, gestor_id")
        .eq("agencia_id", agencyId)
        .order("nome");

      if (gestorFilter) {
        query = query.eq("gestor_id", gestorFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!agencyId,
  });

  const filteredClientes = clientes?.filter((c) =>
    c.nome.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Handle using a template - opens client selection
  const handleUseTemplate = (template: TemplateConfig) => {
    setSelectedTemplate(template);
    setClientSearch("");
    // Set filter to logged gestor by default
    if (gestor?.id) {
      setSelectedGestorId(gestor.id);
    }
    setClientSelectOpen(true);
  };

  // Navigate to report creation
  const handleSelectClient = (clienteId: string) => {
    if (selectedTemplate?.id) {
      navigate(`/cliente/${clienteId}/enviar-relatorio?templateId=${selectedTemplate.id}`);
    } else {
      // Fluxo sem modelo: usar rota estável de criação manual para evitar tela preta.
      navigate(`/cliente/${clienteId}/novo-relatorio`);
    }
    setClientSelectOpen(false);
  };

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

  const handleStartWithoutTemplate = () => {
    setSelectedTemplate(null);
    setClientSearch("");
    if (gestor?.id) setSelectedGestorId(gestor.id);
    setClientSelectOpen(true);
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
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 md:p-10 shadow-lg shadow-primary/5"
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
          <GradientButton onClick={handleStartWithoutTemplate} className="gap-2 shadow-lg shadow-primary/10">
            <Plus className="w-4 h-4" />
            Novo Relatório
          </GradientButton>
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

        <Button onClick={handleNewTemplate} className="gap-2">
          <Plus className="w-4 h-4" />
          Criar novo modelo
        </Button>
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
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick New Template Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={cn(
                "relative group rounded-2xl overflow-hidden transition-all duration-300 h-full",
                "bg-card border-2 border-border hover:border-primary/40 hover:shadow-lg flex flex-col"
              )}
            >
              <div className="relative p-5 flex flex-col h-full space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-secondary group-hover:bg-primary/10 transition-all duration-300">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      Novo modelo
                    </h4>
                    <Badge variant="secondary" className="mt-1 text-[10px] px-2 py-0 bg-secondary text-muted-foreground">
                      Template
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  Crie um template para reutilizar sua estrutura em novos relatórios.
                </p>

                <div className="mt-auto pt-4 border-t border-border/50">
                  <Button
                    onClick={handleNewTemplate}
                    className="w-full gap-2 transition-all"
                    size="sm"
                  >
                    <LayoutTemplate className="w-4 h-4" />
                    Novo modelo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

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
                          <DropdownMenuItem
                            onClick={() => template.id && handleDeleteClick(template.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
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

                      {/* Use Template Button */}
                      <Button
                        onClick={() => handleUseTemplate(template)}
                        className="w-full mt-2 gap-2"
                        size="sm"
                      >
                        <FileText className="w-4 h-4" />
                        Usar este modelo
                        <ChevronRight className="w-4 h-4" />
                      </Button>
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
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                        metric.visible
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-secondary/30 border-border"
                      )}
                      onClick={() => toggleMetric(metric.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleMetric(metric.key);
                        }
                      }}
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
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                        metric.visible
                          ? "bg-purple-500/10 border-purple-500/30"
                          : "bg-secondary/30 border-border"
                      )}
                      onClick={() => toggleMetric(metric.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleMetric(metric.key);
                        }
                      }}
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

      {/* Client Selection Modal */}
      <Dialog open={clientSelectOpen} onOpenChange={setClientSelectOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Selecionar Cliente
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedTemplate?.nome
                ? `Escolha o cliente para criar um relatório com o modelo "${selectedTemplate.nome}"`
                : "Escolha o cliente para criar um relatório sem modelo"}
            </p>
          </DialogHeader>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-3 flex-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select
                value={selectedGestorId}
                onValueChange={setSelectedGestorId}
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Todos</span>
                    </div>
                  </SelectItem>
                  {allGestores?.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={g.foto_url || undefined} />
                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                            {g.nome.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{g.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="flex-1 overflow-y-auto py-2">
            {clientesLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredClientes && filteredClientes.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredClientes.map((cliente, index) => (
                  <motion.div
                    key={cliente.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      className="cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      onClick={() => handleSelectClient(cliente.id)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <Avatar className="w-10 h-10 group-hover:scale-105 transition-transform">
                          <AvatarImage src={cliente.logo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {cliente.nome.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {cliente.nome}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Criar relatório
                            <ChevronRight className="w-3 h-3" />
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum cliente encontrado</p>
                <p className="mt-1 text-sm">
                  Você precisa criar o primeiro cliente para gerar relatórios.
                </p>
                <Button
                  type="button"
                  className="mt-4"
                  onClick={() => {
                    setClientSelectOpen(false);
                    navigate("/novo-cliente");
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro cliente
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Modelos;
