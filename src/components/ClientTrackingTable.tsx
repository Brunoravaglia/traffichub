import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Pencil, ExternalLink, Check, X, AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ClientTracking {
  id: string;
  cliente_id: string;
  gtm_id: string | null;
  ga4_id: string | null;
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
  clientes?: {
    nome: string;
    logo_url: string | null;
  };
}

const RECARGA_OPTIONS = [
  { value: "mensal", label: "Mensal (1x/mês)" },
  { value: "semanal", label: "Semanal (4x/mês)" },
  { value: "continuo", label: "Contínuo (Cartão)" },
];

interface EditDialogProps {
  tracking: ClientTracking | null;
  clienteId?: string;
  clienteNome?: string;
  onClose: () => void;
  onSave: (data: Partial<ClientTracking>) => void;
}

const EditTrackingDialog = ({ tracking, clienteId, clienteNome, onClose, onSave }: EditDialogProps) => {
  const [formData, setFormData] = useState<Partial<ClientTracking>>(
    tracking || {
      cliente_id: clienteId,
      gtm_id: "",
      ga4_id: "",
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
    }
  );

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {tracking ? "Editar Tracking" : "Novo Tracking"} - {tracking?.clientes?.nome || clienteNome}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label>GTM ID</Label>
          <Input
            value={formData.gtm_id || ""}
            onChange={(e) => setFormData({ ...formData, gtm_id: e.target.value })}
            placeholder="GTM-XXXXXXXX"
          />
        </div>
        <div className="space-y-2">
          <Label>GA4 ID</Label>
          <Input
            value={formData.ga4_id || ""}
            onChange={(e) => setFormData({ ...formData, ga4_id: e.target.value })}
            placeholder="G-XXXXXXXXXX"
          />
        </div>
        <div className="space-y-2">
          <Label>Google Ads Status</Label>
          <Input
            value={formData.google_ads_status || ""}
            onChange={(e) => setFormData({ ...formData, google_ads_status: e.target.value })}
            placeholder="validar campanha"
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
            placeholder="sim / não - enviado"
          />
        </div>
        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            value={formData.url || ""}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.clarity_installed}
              onCheckedChange={(v) => setFormData({ ...formData, clarity_installed: v })}
            />
            <Label>Clarity</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.meta_ads_active}
              onCheckedChange={(v) => setFormData({ ...formData, meta_ads_active: v })}
            />
            <Label>Meta Ads</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.pixel_installed}
              onCheckedChange={(v) => setFormData({ ...formData, pixel_installed: v })}
            />
            <Label>Pixel</Label>
          </div>
        </div>

        <div className="col-span-2 border-t border-border pt-4 mt-2">
          <h4 className="font-semibold text-foreground mb-3">Saldos Google Ads</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Saldo Google (R$)</Label>
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
              <Label>Saldo Meta (R$)</Label>
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
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(formData)}>
          Salvar
        </Button>
      </div>
    </DialogContent>
  );
};

const StatusBadge = ({ value, type }: { value: boolean | string | null; type?: "boolean" | "text" }) => {
  if (type === "boolean" || typeof value === "boolean") {
    return value ? (
      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
        <Check className="w-3 h-3 mr-1" /> sim
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
        <X className="w-3 h-3 mr-1" /> não
      </Badge>
    );
  }

  if (!value) return <span className="text-muted-foreground">-</span>;

  if (value.includes("não") && value.includes("enviado")) {
    return (
      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
        <AlertTriangle className="w-3 h-3 mr-1" /> {value}
      </Badge>
    );
  }

  if (value === "sim") {
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
        <Check className="w-3 h-3 mr-1" /> sim
      </Badge>
    );
  }

  return <span className="text-sm text-foreground">{value}</span>;
};

const RecargaBadge = ({ tipo }: { tipo: string | null }) => {
  const option = RECARGA_OPTIONS.find(o => o.value === tipo);
  
  if (!tipo || tipo === "mensal") {
    return (
      <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
        Mensal
      </Badge>
    );
  }
  
  if (tipo === "semanal") {
    return (
      <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
        Semanal
      </Badge>
    );
  }
  
  if (tipo === "continuo") {
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
        <RefreshCw className="w-3 h-3 mr-1" /> Contínuo
      </Badge>
    );
  }

  return <span className="text-muted-foreground text-xs">{option?.label || tipo}</span>;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

interface ClientTrackingTableProps {
  gestorFilter?: string;
}

const ClientTrackingTable = ({ gestorFilter }: ClientTrackingTableProps) => {
  const queryClient = useQueryClient();
  const [editingTracking, setEditingTracking] = useState<ClientTracking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClienteId, setNewClienteId] = useState<string | null>(null);
  const [newClienteNome, setNewClienteNome] = useState<string>("");

  // Fetch clients without tracking
  const { data: clientesSemTracking } = useQuery({
    queryKey: ["clientes-sem-tracking", gestorFilter],
    queryFn: async () => {
      let clientesQuery = supabase
        .from("clientes")
        .select("id, nome, gestor_id")
        .order("nome");

      if (gestorFilter && gestorFilter !== "all") {
        clientesQuery = clientesQuery.eq("gestor_id", gestorFilter);
      }

      const { data: clientes } = await clientesQuery;

      const { data: tracking } = await supabase
        .from("client_tracking")
        .select("cliente_id");

      const trackingIds = tracking?.map((t) => t.cliente_id) || [];
      return clientes?.filter((c) => !trackingIds.includes(c.id)) || [];
    },
  });

  // Fetch tracking data
  const { data: trackingData, isLoading } = useQuery({
    queryKey: ["client-tracking", gestorFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_tracking")
        .select(`
          *,
          clientes(nome, logo_url, gestor_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Filter by gestor if specified
      const filteredData = gestorFilter && gestorFilter !== "all"
        ? (data as any[])?.filter((t) => t.clientes?.gestor_id === gestorFilter)
        : data;
      
      return filteredData as ClientTracking[];
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ClientTracking>) => {
      // Calculate dias restantes
      const googleDias = data.google_valor_diario && data.google_valor_diario > 0
        ? Math.floor((data.google_saldo || 0) / data.google_valor_diario)
        : 0;
      const metaDias = data.meta_valor_diario && data.meta_valor_diario > 0
        ? Math.floor((data.meta_saldo || 0) / data.meta_valor_diario)
        : 0;

      const now = new Date();
      const googleProxima = new Date(now);
      googleProxima.setDate(googleProxima.getDate() + googleDias);
      const metaProxima = new Date(now);
      metaProxima.setDate(metaProxima.getDate() + metaDias);

      const payload = {
        cliente_id: data.cliente_id || data.id, // ensure cliente_id is set
        gtm_id: data.gtm_id,
        ga4_id: data.ga4_id,
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

      if (data.id) {
        const { error } = await supabase
          .from("client_tracking")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        // For insert, we need cliente_id from the function parameter
        const insertPayload = {
          ...payload,
          cliente_id: data.cliente_id!,
        };
        const { error } = await supabase
          .from("client_tracking")
          .insert([insertPayload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-tracking"] });
      queryClient.invalidateQueries({ queryKey: ["clientes-sem-tracking"] });
      toast({ title: "Tracking salvo com sucesso!" });
      setIsDialogOpen(false);
      setEditingTracking(null);
      setNewClienteId(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (tracking: ClientTracking) => {
    setEditingTracking(tracking);
    setNewClienteId(null);
    setIsDialogOpen(true);
  };

  const handleAddNew = (clienteId: string, clienteNome: string) => {
    setEditingTracking(null);
    setNewClienteId(clienteId);
    setNewClienteNome(clienteNome);
    setIsDialogOpen(true);
  };

  const handleSave = (data: Partial<ClientTracking>) => {
    if (!data.id && newClienteId) {
      data.cliente_id = newClienteId;
    }
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Add new client tracking */}
      {clientesSemTracking && clientesSemTracking.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-secondary/30 rounded-lg border border-border">
          <span className="text-sm text-muted-foreground self-center mr-2">
            Adicionar tracking para:
          </span>
          {clientesSemTracking.map((c) => (
            <Button
              key={c.id}
              variant="outline"
              size="sm"
              onClick={() => handleAddNew(c.id, c.nome)}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              {c.nome}
            </Button>
          ))}
        </div>
      )}

      {/* Tracking Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 bg-muted/50 z-10 min-w-[150px]">Cliente</TableHead>
                <TableHead className="min-w-[120px]">GTM</TableHead>
                <TableHead className="min-w-[120px]">GA4</TableHead>
                <TableHead className="min-w-[140px]">Google Ads</TableHead>
                <TableHead className="min-w-[80px]">Clarity</TableHead>
                <TableHead className="min-w-[90px]">Meta Ads</TableHead>
                <TableHead className="min-w-[70px]">Pixel</TableHead>
                <TableHead className="min-w-[130px]">Search Console</TableHead>
                <TableHead className="min-w-[110px]">GMN</TableHead>
                <TableHead className="min-w-[100px]">Saldo G</TableHead>
                <TableHead className="min-w-[80px]">Dias G</TableHead>
                <TableHead className="min-w-[100px]">Recarga G</TableHead>
                <TableHead className="min-w-[100px]">Saldo M</TableHead>
                <TableHead className="min-w-[80px]">Dias M</TableHead>
                <TableHead className="min-w-[100px]">Recarga M</TableHead>
                <TableHead className="min-w-[180px]">URL</TableHead>
                <TableHead className="min-w-[60px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trackingData?.map((tracking) => (
                <TableRow key={tracking.id} className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">
                    {tracking.clientes?.nome || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{tracking.gtm_id || "-"}</TableCell>
                  <TableCell className="font-mono text-xs">{tracking.ga4_id || "-"}</TableCell>
                  <TableCell>{tracking.google_ads_status || "-"}</TableCell>
                  <TableCell><StatusBadge value={tracking.clarity_installed} type="boolean" /></TableCell>
                  <TableCell><StatusBadge value={tracking.meta_ads_active} type="boolean" /></TableCell>
                  <TableCell><StatusBadge value={tracking.pixel_installed} type="boolean" /></TableCell>
                  <TableCell><StatusBadge value={tracking.search_console_status} /></TableCell>
                  <TableCell><StatusBadge value={tracking.gmn_status} /></TableCell>
                  <TableCell className={tracking.google_saldo < 100 ? "text-red-500 font-medium" : ""}>
                    {formatCurrency(tracking.google_saldo)}
                  </TableCell>
                  <TableCell className={tracking.google_dias_restantes < 5 ? "text-red-500 font-medium" : ""}>
                    {tracking.google_dias_restantes}
                  </TableCell>
                  <TableCell>
                    <RecargaBadge tipo={tracking.google_recarga_tipo} />
                  </TableCell>
                  <TableCell className={tracking.meta_saldo < 100 ? "text-red-500 font-medium" : ""}>
                    {formatCurrency(tracking.meta_saldo)}
                  </TableCell>
                  <TableCell className={tracking.meta_dias_restantes < 5 ? "text-red-500 font-medium" : ""}>
                    {tracking.meta_dias_restantes}
                  </TableCell>
                  <TableCell>
                    <RecargaBadge tipo={tracking.meta_recarga_tipo} />
                  </TableCell>
                  <TableCell>
                    {tracking.url ? (
                      <a
                        href={tracking.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-xs"
                      >
                        {tracking.url.replace(/https?:\/\//, "").substring(0, 25)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tracking)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <EditTrackingDialog
          tracking={editingTracking}
          clienteId={newClienteId || undefined}
          clienteNome={newClienteNome}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingTracking(null);
            setNewClienteId(null);
          }}
          onSave={handleSave}
        />
      </Dialog>
    </motion.div>
  );
};

export default ClientTrackingTable;
