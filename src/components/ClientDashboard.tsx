import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Settings,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import DynamicIdFields from "./DynamicIdFields";

interface ClientDashboardProps {
  clienteId: string;
  cliente: {
    nome: string;
    investimento_mensal: number | null;
    redes_sociais?: string[];
    gestores?: { nome: string };
  };
}

interface ClientTracking {
  id?: string;
  cliente_id: string;
  gtm_id: string | null;
  gtm_ids: string[];
  ga4_id: string | null;
  ga4_ids: string[];
  google_ads_status: string | null;
  clarity_installed: boolean;
  meta_ads_active: boolean;
  pixel_installed: boolean;
  search_console_status: string | null;
  gmn_status: string | null;
  google_saldo: number;
  google_valor_diario: number;
  google_dias_restantes: number;
  google_ultima_validacao: string | null;
  google_proxima_recarga: string | null;
  google_recarga_tipo: string | null;
  meta_saldo: number;
  meta_valor_diario: number;
  meta_dias_restantes: number;
  meta_ultima_validacao: string | null;
  meta_proxima_recarga: string | null;
  meta_recarga_tipo: string | null;
  url: string | null;
}

const RECARGA_OPTIONS = [
  { value: "mensal", label: "Mensal (1x/mês)" },
  { value: "semanal", label: "Semanal (4x/mês)" },
  { value: "continuo", label: "Contínuo (Cartão)" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const StatusBadge = ({ value, label }: { value: boolean; label: string }) => {
  return value ? (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
        <Check className="w-3 h-3 mr-1" /> {label}
      </Badge>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
        <X className="w-3 h-3 mr-1" /> {label}
      </Badge>
    </div>
  );
};

const ClientDashboard = ({ clienteId, cliente }: ClientDashboardProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientTracking>>({});

  // Check if client has specific services
  const hasGoogleAds = cliente.redes_sociais?.includes("google") ?? true;
  const hasMetaAds = cliente.redes_sociais?.includes("meta") ?? true;

  const { data: tracking, isLoading } = useQuery({
    queryKey: ["client-tracking", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_tracking")
        .select("*")
        .eq("cliente_id", clienteId)
        .maybeSingle();

      if (error) throw error;

      // Handle legacy gtm_ids and ga4_ids
      const result = data as ClientTracking | null;
      if (result) {
        result.gtm_ids = (result as any).gtm_ids || [];
        result.ga4_ids = (result as any).ga4_ids || [];
      }
      return result;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ClientTracking>) => {
      // Calculate remaining days based on current input values
      const now = new Date();
      let googleDias = data.google_valor_diario && data.google_valor_diario > 0
        ? Math.floor((data.google_saldo || 0) / data.google_valor_diario)
        : 0;
      let metaDias = data.meta_valor_diario && data.meta_valor_diario > 0
        ? Math.floor((data.meta_saldo || 0) / data.meta_valor_diario)
        : 0;

      // Handle dynamic deduction if the values weren't manually edited 
      // but just saved from auto-calculations (we check the last validation date)
      if (tracking?.google_ultima_validacao && data.google_saldo === tracking.google_saldo) {
        const lastValG = new Date(tracking.google_ultima_validacao);
        const daysPassedG = differenceInDays(now, lastValG);
        if (daysPassedG > 0 && data.google_valor_diario && data.google_saldo && data.google_valor_diario > 0 && data.google_saldo > 0) {
          const deductionG = daysPassedG * data.google_valor_diario;
          data.google_saldo = Math.max(0, data.google_saldo - deductionG);
          googleDias = Math.floor(data.google_saldo / data.google_valor_diario);
        }
      }

      if (tracking?.meta_ultima_validacao && data.meta_saldo === tracking.meta_saldo) {
        const lastValM = new Date(tracking.meta_ultima_validacao);
        const daysPassedM = differenceInDays(now, lastValM);
        if (daysPassedM > 0 && data.meta_valor_diario && data.meta_saldo && data.meta_valor_diario > 0 && data.meta_saldo > 0) {
          const deductionM = daysPassedM * data.meta_valor_diario;
          data.meta_saldo = Math.max(0, data.meta_saldo - deductionM);
          metaDias = Math.floor(data.meta_saldo / data.meta_valor_diario);
        }
      }

      const googleProxima = new Date(now);
      googleProxima.setDate(googleProxima.getDate() + googleDias);
      const metaProxima = new Date(now);
      metaProxima.setDate(metaProxima.getDate() + metaDias);

      const payload = {
        cliente_id: clienteId,
        gtm_id: data.gtm_ids?.[0] || data.gtm_id || null,
        gtm_ids: data.gtm_ids || [],
        ga4_id: data.ga4_ids?.[0] || data.ga4_id || null,
        ga4_ids: data.ga4_ids || [],
        google_ads_status: data.google_ads_status,
        clarity_installed: data.clarity_installed,
        meta_ads_active: data.meta_ads_active,
        pixel_installed: data.pixel_installed,
        search_console_status: data.search_console_status,
        gmn_status: data.gmn_status,
        google_saldo: data.google_saldo,
        google_valor_diario: data.google_valor_diario,
        google_dias_restantes: googleDias,
        google_recarga_tipo: data.google_recarga_tipo || "mensal",
        meta_saldo: data.meta_saldo,
        meta_valor_diario: data.meta_valor_diario,
        meta_dias_restantes: metaDias,
        meta_recarga_tipo: data.meta_recarga_tipo || "mensal",
        google_ultima_validacao: format(now, "yyyy-MM-dd"),
        meta_ultima_validacao: format(now, "yyyy-MM-dd"),
        google_proxima_recarga: format(googleProxima, "yyyy-MM-dd"),
        meta_proxima_recarga: format(metaProxima, "yyyy-MM-dd"),
        url: data.url,
      };

      if (tracking?.id) {
        const { error } = await supabase
          .from("client_tracking")
          .update(payload as any)
          .eq("id", tracking.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("client_tracking")
          .insert([payload as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-tracking", clienteId] });
      toast({ title: "Dados salvos com sucesso!" });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openEditDialog = () => {
    if (tracking) {
      // Ensure arrays are properly initialized from existing data
      setFormData({
        ...tracking,
        gtm_ids: tracking.gtm_ids || (tracking.gtm_id ? [tracking.gtm_id] : []),
        ga4_ids: tracking.ga4_ids || (tracking.ga4_id ? [tracking.ga4_id] : []),
      });
    } else {
      setFormData({
        cliente_id: clienteId,
        gtm_id: "",
        gtm_ids: [],
        ga4_id: "",
        ga4_ids: [],
        google_ads_status: "",
        clarity_installed: false,
        meta_ads_active: false,
        pixel_installed: false,
        search_console_status: "",
        gmn_status: "",
        google_saldo: 0,
        google_valor_diario: 0,
        google_recarga_tipo: "mensal",
        meta_saldo: 0,
        meta_valor_diario: 0,
        meta_recarga_tipo: "mensal",
        url: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Dynamic calculation for display
  const displayGoogleSaldo = () => {
    if (!tracking) return 0;
    let s = tracking.google_saldo || 0;
    if (tracking.google_ultima_validacao && tracking.google_valor_diario > 0 && s > 0) {
      const daysPassed = differenceInDays(new Date(), new Date(tracking.google_ultima_validacao));
      if (daysPassed > 0) {
        s = Math.max(0, s - (daysPassed * tracking.google_valor_diario));
      }
    }
    return s;
  };

  const displayGoogleDias = () => {
    if (!tracking || !tracking.google_valor_diario) return 0;
    return Math.floor(displayGoogleSaldo() / tracking.google_valor_diario);
  };

  const displayMetaSaldo = () => {
    if (!tracking) return 0;
    let s = tracking.meta_saldo || 0;
    if (tracking.meta_ultima_validacao && tracking.meta_valor_diario > 0 && s > 0) {
      const daysPassed = differenceInDays(new Date(), new Date(tracking.meta_ultima_validacao));
      if (daysPassed > 0) {
        s = Math.max(0, s - (daysPassed * tracking.meta_valor_diario));
      }
    }
    return s;
  };

  const displayMetaDias = () => {
    if (!tracking || !tracking.meta_valor_diario) return 0;
    return Math.floor(displayMetaSaldo() / tracking.meta_valor_diario);
  };

  const currentGoogleDias = displayGoogleDias();
  const currentMetaDias = displayMetaDias();

  const googleDiasClass = tracking?.google_valor_diario && currentGoogleDias <= 3
    ? "text-red-500"
    : tracking?.google_valor_diario && currentGoogleDias <= 7
      ? "text-yellow-500"
      : "text-green-500";

  const metaDiasClass = tracking?.meta_valor_diario && currentMetaDias <= 3
    ? "text-red-500"
    : tracking?.meta_valor_diario && currentMetaDias <= 7
      ? "text-yellow-500"
      : "text-green-500";

  return (
    <div className="space-y-6">
      {/* Summary Cards - Show only for contracted services */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hasGoogleAds && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  Saldo Google Ads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tracking?.google_recarga_tipo === "continuo" ? (
                  <>
                    <p className="text-2xl font-bold text-green-500">Recorrente</p>
                    <p className="text-sm text-muted-foreground">Cartão automático</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(tracking?.google_saldo || 0)}
                    </p>
                    <p className={`text-sm ${googleDiasClass}`}>
                      {tracking?.google_dias_restantes || 0} dias restantes
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {hasMetaAds && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                  Saldo Meta Ads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tracking?.meta_recarga_tipo === "continuo" ? (
                  <>
                    <p className="text-2xl font-bold text-green-500">Recorrente</p>
                    <p className="text-sm text-muted-foreground">Cartão automático</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(tracking?.meta_saldo || 0)}
                    </p>
                    <p className={`text-sm ${metaDiasClass}`}>
                      {tracking?.meta_dias_restantes || 0} dias restantes
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Investimento Diário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(
                  (hasGoogleAds ? tracking?.google_valor_diario || 0 : 0) +
                  (hasMetaAds ? tracking?.meta_valor_diario || 0 : 0)
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasGoogleAds && `Google: ${formatCurrency(tracking?.google_valor_diario || 0)}`}
                {hasGoogleAds && hasMetaAds && " | "}
                {hasMetaAds && `Meta: ${formatCurrency(tracking?.meta_valor_diario || 0)}`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                Investimento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(cliente.investimento_mensal || 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                Cadastrado no cliente
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tracking & Integrations */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-border h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Tracking & Integrações</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={openEditDialog}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Configurar Tracking - {cliente.nome}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Dynamic GTM IDs */}
                    <DynamicIdFields
                      label="GTM IDs (múltiplos containers)"
                      placeholder="GTM-XXXXXXXX"
                      values={formData.gtm_ids || []}
                      onChange={(values) => setFormData({ ...formData, gtm_ids: values })}
                      maxItems={10}
                    />

                    {/* Dynamic GA4 IDs */}
                    <DynamicIdFields
                      label="GA4 IDs (múltiplas propriedades)"
                      placeholder="G-XXXXXXXXXX"
                      values={formData.ga4_ids || []}
                      onChange={(values) => setFormData({ ...formData, ga4_ids: values })}
                      maxItems={10}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Google Ads Status</Label>
                        <Input
                          value={formData.google_ads_status || ""}
                          onChange={(e) => setFormData({ ...formData, google_ads_status: e.target.value })}
                          placeholder="ativo / inativo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Search Console</Label>
                        <Input
                          value={formData.search_console_status || ""}
                          onChange={(e) => setFormData({ ...formData, search_console_status: e.target.value })}
                          placeholder="sim / não"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GMN Status</Label>
                        <Input
                          value={formData.gmn_status || ""}
                          onChange={(e) => setFormData({ ...formData, gmn_status: e.target.value })}
                          placeholder="sim / não"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL do Site</Label>
                        <Input
                          value={formData.url || ""}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.clarity_installed || false}
                          onCheckedChange={(v) => setFormData({ ...formData, clarity_installed: v })}
                        />
                        <Label>Clarity</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.meta_ads_active || false}
                          onCheckedChange={(v) => setFormData({ ...formData, meta_ads_active: v })}
                        />
                        <Label>Meta Ads</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.pixel_installed || false}
                          onCheckedChange={(v) => setFormData({ ...formData, pixel_installed: v })}
                        />
                        <Label>Pixel</Label>
                      </div>
                    </div>

                    <div className="col-span-2 border-t border-border pt-4 mt-2">
                      <h4 className="font-semibold text-foreground mb-3">Saldos Google Ads</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Saldo (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.google_saldo || 0}
                            onChange={(e) => setFormData({ ...formData, google_saldo: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor Diário (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.google_valor_diario || 0}
                            onChange={(e) => setFormData({ ...formData, google_valor_diario: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de Recarga</Label>
                          <Select
                            value={formData.google_recarga_tipo || "mensal"}
                            onValueChange={(v) => setFormData({ ...formData, google_recarga_tipo: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {RECARGA_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 border-t border-border pt-4 mt-2">
                      <h4 className="font-semibold text-foreground mb-3">Saldos Meta Ads</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Saldo (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.meta_saldo || 0}
                            onChange={(e) => setFormData({ ...formData, meta_saldo: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor Diário (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.meta_valor_diario || 0}
                            onChange={(e) => setFormData({ ...formData, meta_valor_diario: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de Recarga</Label>
                          <Select
                            value={formData.meta_recarga_tipo || "mensal"}
                            onValueChange={(v) => setFormData({ ...formData, meta_recarga_tipo: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {RECARGA_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {tracking ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">GTM ID</p>
                      <p className="text-sm font-medium">{tracking.gtm_id || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">GA4 ID</p>
                      <p className="text-sm font-medium">{tracking.ga4_id || "-"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={tracking.clarity_installed || false} label="Clarity" />
                    <StatusBadge value={tracking.pixel_installed || false} label="Pixel" />
                    <StatusBadge value={tracking.meta_ads_active || false} label="Meta Ads" />
                  </div>

                  {tracking.url && (
                    <a
                      href={tracking.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {tracking.url}
                    </a>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Nenhum tracking configurado para este cliente
                  </p>
                  <Button variant="outline" onClick={openEditDialog}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar Agora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Only show Próximas Recargas if client has any ads platform */}
        {(hasGoogleAds || hasMetaAds) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-card border-border h-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Próximas Recargas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tracking ? (
                  <>
                    {hasGoogleAds && (
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-400">Google Ads</span>
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                            {tracking.google_recarga_tipo === "continuo" ? (
                              <><RefreshCw className="w-3 h-3 mr-1" /> Contínuo</>
                            ) : tracking.google_recarga_tipo === "semanal" ? (
                              "Semanal"
                            ) : (
                              "Mensal"
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Em {displayGoogleDias()} dias</span>
                          <span className="font-medium">
                            {tracking.google_proxima_recarga ? format(new Date(tracking.google_proxima_recarga), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                          </span>
                        </div>
                      </div>
                    )}

                    {hasMetaAds && (
                      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-purple-400">Meta Ads</span>
                          <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
                            {tracking.meta_recarga_tipo === "continuo" ? (
                              <><RefreshCw className="w-3 h-3 mr-1" /> Contínuo</>
                            ) : tracking.meta_recarga_tipo === "semanal" ? (
                              "Semanal"
                            ) : (
                              "Mensal"
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Em {displayMetaDias()} dias</span>
                          <span className="font-medium">
                            {tracking.meta_proxima_recarga ? format(new Date(tracking.meta_proxima_recarga), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    Configure o tracking para ver as próximas recargas
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
