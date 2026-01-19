import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Plus,
  Trash2,
  Copy,
  Settings,
  FileText,
  Globe,
  User,
} from "lucide-react";
import { useGestor } from "@/contexts/GestorContext";

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
  // Google Ads Metrics
  { key: "google_cliques", label: "Cliques", icon: "click", platform: "google", visible: true },
  { key: "google_impressoes", label: "Impressões", icon: "eye", platform: "google", visible: true },
  { key: "google_contatos", label: "Contatos/Leads", icon: "message", platform: "google", visible: true },
  { key: "google_investido", label: "Investido", icon: "dollar", platform: "google", visible: true },
  { key: "google_cpl", label: "Custo por Lead", icon: "target", platform: "google", visible: true },
  { key: "google_cpm", label: "CPM", icon: "trending", platform: "google", visible: false },
  { key: "google_ctr", label: "CTR (%)", icon: "percent", platform: "google", visible: false },
  { key: "google_cpc", label: "CPC (Custo por Clique)", icon: "dollar", platform: "google", visible: false },
  { key: "google_conversoes", label: "Conversões", icon: "check", platform: "google", visible: true },
  { key: "google_taxa_conversao", label: "Taxa de Conversão", icon: "percent", platform: "google", visible: false },
  { key: "google_roas", label: "ROAS", icon: "trending", platform: "google", visible: false },
  { key: "google_custo_conversao", label: "Custo por Conversão", icon: "target", platform: "google", visible: false },
  { key: "google_alcance", label: "Alcance", icon: "users", platform: "google", visible: false },
  { key: "google_frequencia", label: "Frequência", icon: "repeat", platform: "google", visible: false },
  { key: "google_visualizacoes_video", label: "Visualizações de Vídeo", icon: "play", platform: "google", visible: false },
  { key: "google_taxa_visualizacao", label: "Taxa de Visualização", icon: "percent", platform: "google", visible: false },
  { key: "google_interacoes", label: "Interações", icon: "mouse", platform: "google", visible: false },
  { key: "google_taxa_interacao", label: "Taxa de Interação", icon: "percent", platform: "google", visible: false },
  
  // Meta Ads Metrics
  { key: "meta_impressoes", label: "Impressões", icon: "eye", platform: "meta", visible: true },
  { key: "meta_engajamento", label: "Engajamento", icon: "trending", platform: "meta", visible: true },
  { key: "meta_conversas", label: "Conversas", icon: "message", platform: "meta", visible: true },
  { key: "meta_investido", label: "Investido", icon: "dollar", platform: "meta", visible: true },
  { key: "meta_cpl", label: "Custo por Lead", icon: "target", platform: "meta", visible: true },
  { key: "meta_cpm", label: "CPM", icon: "trending", platform: "meta", visible: false },
  { key: "meta_custo_seguidor", label: "Custo por Seguidor", icon: "users", platform: "meta", visible: false },
  { key: "meta_cliques", label: "Cliques no Link", icon: "click", platform: "meta", visible: true },
  { key: "meta_ctr", label: "CTR (%)", icon: "percent", platform: "meta", visible: false },
  { key: "meta_cpc", label: "CPC (Custo por Clique)", icon: "dollar", platform: "meta", visible: false },
  { key: "meta_alcance", label: "Alcance", icon: "users", platform: "meta", visible: true },
  { key: "meta_frequencia", label: "Frequência", icon: "repeat", platform: "meta", visible: false },
  { key: "meta_leads", label: "Leads Gerados", icon: "user-plus", platform: "meta", visible: true },
  { key: "meta_conversoes", label: "Conversões", icon: "check", platform: "meta", visible: false },
  { key: "meta_roas", label: "ROAS", icon: "trending", platform: "meta", visible: false },
  { key: "meta_curtidas_pagina", label: "Curtidas na Página", icon: "thumbs-up", platform: "meta", visible: false },
  { key: "meta_seguidores", label: "Novos Seguidores", icon: "user-plus", platform: "meta", visible: false },
  { key: "meta_compartilhamentos", label: "Compartilhamentos", icon: "share", platform: "meta", visible: false },
  { key: "meta_salvos", label: "Salvos", icon: "bookmark", platform: "meta", visible: false },
  { key: "meta_comentarios", label: "Comentários", icon: "message-circle", platform: "meta", visible: false },
  { key: "meta_visualizacoes_video", label: "Visualizações de Vídeo", icon: "play", platform: "meta", visible: false },
  { key: "meta_retencao_video", label: "Retenção de Vídeo (%)", icon: "percent", platform: "meta", visible: false },
  { key: "meta_mensagens_iniciadas", label: "Mensagens Iniciadas", icon: "send", platform: "meta", visible: false },
  { key: "meta_respostas_mensagem", label: "Respostas de Mensagem", icon: "reply", platform: "meta", visible: false },
  { key: "meta_agendamentos", label: "Agendamentos", icon: "calendar", platform: "meta", visible: false },
  { key: "meta_checkins", label: "Check-ins", icon: "map-pin", platform: "meta", visible: false },
];

const DEFAULT_SECTIONS = {
  showObjetivos: true,
  showGoogleAds: true,
  showMetaAds: true,
  showCriativosGoogle: true,
  showCriativosMeta: true,
  showResumo: true,
};

interface ReportTemplateManagerProps {
  onSelectTemplate?: (template: TemplateConfig) => void;
}

export function ReportTemplateManager({ onSelectTemplate }: ReportTemplateManagerProps) {
  const { gestor } = useGestor();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateConfig | null>(null);
  const [formData, setFormData] = useState<TemplateConfig>({
    nome: "",
    descricao: "",
    is_global: false,
    metrics: [...DEFAULT_METRICS],
    sections: { ...DEFAULT_SECTIONS },
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["report-templates", gestor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .or(`is_global.eq.true,gestor_id.eq.${gestor?.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((t) => ({
        id: t.id,
        nome: t.nome,
        descricao: t.descricao || "",
        is_global: t.is_global,
        metrics: (t.layout as any)?.metrics || DEFAULT_METRICS,
        sections: (t.layout as any)?.sections || DEFAULT_SECTIONS,
      })) as TemplateConfig[];
    },
    enabled: !!gestor?.id,
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
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["report-templates-selector"] });
      toast({ title: "Template salvo com sucesso!" });
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
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      toast({ title: "Template excluído!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (template: TemplateConfig) => {
    setFormData(template);
    setEditingTemplate(template);
    setIsDialogOpen(true);
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

  const handleDuplicate = (template: TemplateConfig) => {
    setFormData({
      ...template,
      id: undefined,
      nome: `${template.nome} (Cópia)`,
    });
    setEditingTemplate(null);
    setIsDialogOpen(true);
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

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Modelos de Relatório</h3>
        <Button onClick={handleNewTemplate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <Card key={template.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">{template.nome}</CardTitle>
                  <Badge variant={template.is_global ? "default" : "secondary"}>
                    {template.is_global ? (
                      <>
                        <Globe className="w-3 h-3 mr-1" /> Global
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" /> Pessoal
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {template.descricao || "Sem descrição"}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectTemplate?.(template)}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Usar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  {!template.is_global && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => template.id && deleteMutation.mutate(template.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
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
              <Label className="text-base font-semibold">Métricas Google Ads ({formData.metrics.filter(m => m.platform === "google" && m.visible).length} selecionadas)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                {formData.metrics
                  .filter((m) => m.platform === "google")
                  .map((metric) => (
                    <div
                      key={metric.key}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                        metric.visible
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-secondary/30 border-border"
                      }`}
                      onClick={() => toggleMetric(metric.key)}
                    >
                      <span className="text-sm truncate mr-2">{metric.label}</span>
                      <Switch checked={metric.visible} />
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Métricas Meta Ads ({formData.metrics.filter(m => m.platform === "meta" && m.visible).length} selecionadas)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                {formData.metrics
                  .filter((m) => m.platform === "meta")
                  .map((metric) => (
                    <div
                      key={metric.key}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                        metric.visible
                          ? "bg-purple-500/10 border-purple-500/30"
                          : "bg-secondary/30 border-border"
                      }`}
                      onClick={() => toggleMetric(metric.key)}
                    >
                      <span className="text-sm truncate mr-2">{metric.label}</span>
                      <Switch checked={metric.visible} />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar Modelo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReportTemplateManager;
