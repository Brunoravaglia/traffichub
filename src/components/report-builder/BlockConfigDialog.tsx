import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ReportBlock } from "./types";

interface BlockConfigDialogProps {
  block: ReportBlock | null;
  open: boolean;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => void;
}

export function BlockConfigDialog({ block, open, onClose, onSave }: BlockConfigDialogProps) {
  const [config, setConfig] = useState<Record<string, unknown>>(block?.config || {});
  const [uploading, setUploading] = useState(false);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('report-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('report-assets')
        .getPublicUrl(filePath);

      setConfig({ ...config, [field]: publicUrl });
      toast.success('Imagem carregada!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploading(false);
    }
  };

  const renderConfigFields = () => {
    if (!block) return null;

    switch (block.type) {
      case 'header':
        return (
          <div className="space-y-4">
            <div>
              <Label>Nome do Cliente</Label>
              <Input
                value={(config.clientName as string) || ''}
                onChange={(e) => setConfig({ ...config, clientName: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <Label>Logo do Cliente (URL)</Label>
              <div className="flex gap-2">
                <Input
                  value={(config.clientLogo as string) || ''}
                  onChange={(e) => setConfig({ ...config, clientLogo: e.target.value })}
                  placeholder="URL da logo"
                />
                <label className="shrink-0">
                  <Button variant="outline" size="icon" asChild>
                    <span><Upload className="w-4 h-4" /></span>
                  </Button>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'clientLogo')} />
                </label>
              </div>
            </div>
            <div>
              <Label>Título</Label>
              <Input
                value={(config.title as string) || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="RESULTADOS DAS CAMPANHAS"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Período Início</Label>
                <Input
                  type="date"
                  value={(config.periodStart as string) || ''}
                  onChange={(e) => setConfig({ ...config, periodStart: e.target.value })}
                />
              </div>
              <div>
                <Label>Período Fim</Label>
                <Input
                  type="date"
                  value={(config.periodEnd as string) || ''}
                  onChange={(e) => setConfig({ ...config, periodEnd: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 'section-title':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título da Seção</Label>
              <Input
                value={(config.title as string) || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="TRÁFEGO GOOGLE"
              />
            </div>
            <div>
              <Label>Plataforma</Label>
              <Select
                value={(config.platform as string) || ''}
                onValueChange={(value) => setConfig({ ...config, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="meta">Meta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'metric-row': {
        const metrics = (config.metrics as any[]) || [];
        return (
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={(config.title as string) || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Métricas Google"
              />
            </div>
            <div>
              <Label>Métricas</Label>
              <div className="space-y-3 mt-2">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex gap-2 items-center p-3 bg-secondary rounded-lg">
                    <Select
                      value={metric.icon || 'click'}
                      onValueChange={(value) => {
                        const newMetrics = [...metrics];
                        newMetrics[index] = { ...newMetrics[index], icon: value };
                        setConfig({ ...config, metrics: newMetrics });
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="click">Click</SelectItem>
                        <SelectItem value="eye">Olho</SelectItem>
                        <SelectItem value="message">Msg</SelectItem>
                        <SelectItem value="dollar">$</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="target">Alvo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={metric.label || ''}
                      onChange={(e) => {
                        const newMetrics = [...metrics];
                        newMetrics[index] = { ...newMetrics[index], label: e.target.value };
                        setConfig({ ...config, metrics: newMetrics });
                      }}
                      placeholder="Label"
                      className="flex-1"
                    />
                    <Input
                      value={metric.value || ''}
                      onChange={(e) => {
                        const newMetrics = [...metrics];
                        newMetrics[index] = { ...newMetrics[index], value: e.target.value };
                        setConfig({ ...config, metrics: newMetrics });
                      }}
                      placeholder="Valor"
                      className="w-28"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newMetrics = metrics.filter((_, i) => i !== index);
                        setConfig({ ...config, metrics: newMetrics });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfig({
                      ...config,
                      metrics: [...metrics, { icon: 'click', label: '', value: '' }],
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Métrica
                </Button>
              </div>
            </div>
          </div>
        );
      }

      case 'objectives': {
        const objectives = (config.objectives as string[]) || [];
        return (
          <div className="space-y-4">
            <div>
              <Label>Objetivos</Label>
              <div className="space-y-2 mt-2">
                {objectives.map((obj, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={obj}
                      onChange={(e) => {
                        const newObjs = [...objectives];
                        newObjs[index] = e.target.value;
                        setConfig({ ...config, objectives: newObjs });
                      }}
                      placeholder={`Objetivo ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newObjs = objectives.filter((_, i) => i !== index);
                        setConfig({ ...config, objectives: newObjs });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig({ ...config, objectives: [...objectives, ''] })}
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Objetivo
                </Button>
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={(config.description as string) || ''}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Descrição dos objetivos..."
              />
            </div>
          </div>
        );
      }

      case 'balance-info':
        return (
          <div className="space-y-4">
            <div>
              <Label>Saldo Google Ads</Label>
              <Input
                value={(config.googleBalance as string) || ''}
                onChange={(e) => setConfig({ ...config, googleBalance: e.target.value })}
                placeholder="R$ 80,03"
              />
            </div>
            <div>
              <Label>Saldo Meta Ads</Label>
              <Input
                value={(config.metaBalance as string) || ''}
                onChange={(e) => setConfig({ ...config, metaBalance: e.target.value })}
                placeholder="R$ 3,03"
              />
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-4">
            <div>
              <Label>Nome da Empresa</Label>
              <Input
                value={(config.companyName as string) || ''}
                onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                placeholder="Você Digital"
              />
            </div>
            <div>
              <Label>Logo (URL)</Label>
              <div className="flex gap-2">
                <Input
                  value={(config.companyLogo as string) || ''}
                  onChange={(e) => setConfig({ ...config, companyLogo: e.target.value })}
                  placeholder="URL da logo"
                />
                <label className="shrink-0">
                  <Button variant="outline" size="icon" asChild>
                    <span><Upload className="w-4 h-4" /></span>
                  </Button>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'companyLogo')} />
                </label>
              </div>
            </div>
            <div>
              <Label>Instagram</Label>
              <Input
                value={(config.instagram as string) || ''}
                onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                placeholder="@vocedigitalpropaganda"
              />
            </div>
            <div>
              <Label>Website</Label>
              <Input
                value={(config.website as string) || ''}
                onChange={(e) => setConfig({ ...config, website: e.target.value })}
                placeholder="www.vocedigitalpropaganda.com.br"
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Variante</Label>
              <Select
                value={(config.variant as string) || 'paragraph'}
                onValueChange={(value) => setConfig({ ...config, variant: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraph">Parágrafo</SelectItem>
                  <SelectItem value="highlight">Destaque</SelectItem>
                  <SelectItem value="note">Nota</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conteúdo</Label>
              <Textarea
                value={(config.content as string) || ''}
                onChange={(e) => setConfig({ ...config, content: e.target.value })}
                placeholder="Digite seu texto..."
                rows={4}
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL da Imagem</Label>
              <div className="flex gap-2">
                <Input
                  value={(config.url as string) || ''}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  placeholder="URL da imagem"
                />
                <label className="shrink-0">
                  <Button variant="outline" size="icon" asChild disabled={uploading}>
                    <span><Upload className="w-4 h-4" /></span>
                  </Button>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'url')} />
                </label>
              </div>
            </div>
            <div>
              <Label>Legenda</Label>
              <Input
                value={(config.caption as string) || ''}
                onChange={(e) => setConfig({ ...config, caption: e.target.value })}
                placeholder="Legenda opcional"
              />
            </div>
          </div>
        );

      case 'creative-gallery': {
        const images = (config.images as any[]) || [];
        return (
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={(config.title as string) || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="TRÁFEGO META ADS"
              />
            </div>
            <div>
              <Label>Criativos</Label>
              <div className="space-y-3 mt-2 max-h-64 overflow-y-auto">
                {images.map((img, index) => (
                  <div key={index} className="p-3 bg-secondary rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={img.url || ''}
                        onChange={(e) => {
                          const newImages = [...images];
                          newImages[index] = { ...newImages[index], url: e.target.value };
                          setConfig({ ...config, images: newImages });
                        }}
                        placeholder="URL da imagem"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newImages = images.filter((_, i) => i !== index);
                          setConfig({ ...config, images: newImages });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        type="number"
                        value={img.likes || ''}
                        onChange={(e) => {
                          const newImages = [...images];
                          newImages[index] = { ...newImages[index], likes: parseInt(e.target.value) || 0 };
                          setConfig({ ...config, images: newImages });
                        }}
                        placeholder="Likes"
                      />
                      <Input
                        type="number"
                        value={img.comments || ''}
                        onChange={(e) => {
                          const newImages = [...images];
                          newImages[index] = { ...newImages[index], comments: parseInt(e.target.value) || 0 };
                          setConfig({ ...config, images: newImages });
                        }}
                        placeholder="Comments"
                      />
                      <Input
                        value={img.date || ''}
                        onChange={(e) => {
                          const newImages = [...images];
                          newImages[index] = { ...newImages[index], date: e.target.value };
                          setConfig({ ...config, images: newImages });
                        }}
                        placeholder="Data"
                      />
                      <Input
                        value={img.engagement || ''}
                        onChange={(e) => {
                          const newImages = [...images];
                          newImages[index] = { ...newImages[index], engagement: e.target.value };
                          setConfig({ ...config, images: newImages });
                        }}
                        placeholder="ER %"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfig({
                      ...config,
                      images: [...images, { url: '', likes: 0, comments: 0, date: '', engagement: '' }],
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Criativo
                </Button>
              </div>
            </div>
          </div>
        );
      }

      case 'chart': {
        const chartData = (config.data as any[]) || [];
        return (
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={(config.title as string) || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Performance mensal"
              />
            </div>
            <div>
              <Label>Tipo de Gráfico</Label>
              <Select
                value={(config.type as string) || 'line'}
                onValueChange={(value) => setConfig({ ...config, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="bar">Barra</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dados</Label>
              <div className="space-y-2 mt-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.name || ''}
                      onChange={(e) => {
                        const newData = [...chartData];
                        newData[index] = { ...newData[index], name: e.target.value };
                        setConfig({ ...config, data: newData });
                      }}
                      placeholder="Nome"
                    />
                    <Input
                      type="number"
                      value={item.value || ''}
                      onChange={(e) => {
                        const newData = [...chartData];
                        newData[index] = { ...newData[index], value: parseFloat(e.target.value) || 0 };
                        setConfig({ ...config, data: newData });
                      }}
                      placeholder="Valor"
                      className="w-28"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newData = chartData.filter((_, i) => i !== index);
                        setConfig({ ...config, data: newData });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig({ ...config, data: [...chartData, { name: '', value: 0 }] })}
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Ponto
                </Button>
              </div>
            </div>
          </div>
        );
      }

      default:
        return <p className="text-muted-foreground">Configurações não disponíveis</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Bloco</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {renderConfigFields()}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
