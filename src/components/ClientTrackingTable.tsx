import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Pencil,
  ExternalLink,
  Check,
  X,
  AlertTriangle,
  Plus,
  RefreshCw,
  LayoutGrid,
  Globe,
  Share2,
  Wallet,
  Search,
  SortAsc,
  Filter,
  Eye,
  Settings2
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
    gestor_id: string | null;
  };
}

const RECARGA_OPTIONS = [
  { value: "mensal", label: "Mensal (1x/mês)" },
  { value: "semanal", label: "Semanal (4x/mês)" },
  { value: "continuo", label: "Contínuo (Cartão)" },
];

type CategoryType = "all" | "google" | "meta" | "financial" | "technical";

const EditTrackingDialog = ({ tracking, clienteId, clienteNome, onClose, onSave }: any) => {
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
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Settings2 className="w-5 h-5 text-primary" />
          {tracking ? "Configurar Tracking" : "Novo Tracking"}
          <span className="text-muted-foreground ml-1">| {tracking?.clientes?.nome || clienteNome}</span>
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-6 py-6 font-inter">
        <div className="space-y-4 col-span-2 md:col-span-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 mb-2">Google Ecosystem</h4>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400">GTM ID</Label>
              <Input className="bg-secondary/40 border-border/50 h-9 font-mono text-xs" value={formData.gtm_id || ""} onChange={(e) => setFormData({ ...formData, gtm_id: e.target.value })} placeholder="GTM-XXXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400">GA4 ID</Label>
              <Input className="bg-secondary/40 border-border/50 h-9 font-mono text-xs" value={formData.ga4_id || ""} onChange={(e) => setFormData({ ...formData, ga4_id: e.target.value })} placeholder="G-XXXXXXXXXX" />
            </div>
          </div>
        </div>

        <div className="space-y-4 col-span-2 md:col-span-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 mb-2">Site & Analytics</h4>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400">URL do Projeto</Label>
              <Input className="bg-secondary/40 border-border/50 h-9 text-xs" value={formData.url || ""} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Switch checked={formData.clarity_installed} onCheckedChange={(v) => setFormData({ ...formData, clarity_installed: v })} />
                <Label className="text-xs font-bold">Clarity</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.pixel_installed} onCheckedChange={(v) => setFormData({ ...formData, pixel_installed: v })} />
                <Label className="text-xs font-bold">Pixel Meta</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80">
              <RefreshCw className="w-3 h-3" /> Financeiro Google
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">Saldo (R$)</Label>
                <Input type="number" step="0.01" className="bg-secondary/40 h-9" value={formData.google_saldo || 0} onChange={(e) => setFormData({ ...formData, google_saldo: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">Diário (R$)</Label>
                <Input type="number" step="0.01" className="bg-secondary/40 h-9" value={formData.google_valor_diario || 0} onChange={(e) => setFormData({ ...formData, google_valor_diario: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80">
              <RefreshCw className="w-3 h-3" /> Financeiro Meta
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">Saldo (R$)</Label>
                <Input type="number" step="0.01" className="bg-secondary/40 h-9" value={formData.meta_saldo || 0} onChange={(e) => setFormData({ ...formData, meta_saldo: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">Diário (R$)</Label>
                <Input type="number" step="0.01" className="bg-secondary/40 h-9" value={formData.meta_valor_diario || 0} onChange={(e) => setFormData({ ...formData, meta_valor_diario: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-xs">Cancelar</Button>
        <Button onClick={() => onSave(formData)} className="rounded-xl font-black text-xs px-8 bg-primary hover:bg-primary/90 text-white shadow-lg">Salvar Alterações</Button>
      </div>
    </DialogContent>
  );
};

const StatusBadge = ({ value, type }: any) => {
  if (type === "boolean" || typeof value === "boolean") {
    return value ? (
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
        <Check className="w-3 h-3" /> installed
      </div>
    ) : (
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md border border-red-400/20">
        <X className="w-3 h-3" /> missing
      </div>
    );
  }
  return <span className="text-xs font-bold text-gray-400">{value || "-"}</span>;
};

const ClientTrackingTable = ({ gestorFilter }: { gestorFilter?: string }) => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingTracking, setEditingTracking] = useState<ClientTracking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClienteId, setNewClienteId] = useState<string | null>(null);
  const [newClienteNome, setNewClienteNome] = useState<string>("");

  const { data: trackingData, isLoading } = useQuery({
    queryKey: ["client-tracking", gestorFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_tracking")
        .select(`*, clientes(nome, logo_url, gestor_id)`);
      if (error) throw error;
      return gestorFilter && gestorFilter !== "all"
        ? (data as any[]).filter(t => t.clientes?.gestor_id === gestorFilter)
        : data as ClientTracking[];
    }
  });

  const { data: clientesSemTracking } = useQuery({
    queryKey: ["clientes-sem-tracking", gestorFilter],
    queryFn: async () => {
      let q = supabase.from("clientes").select("id, nome, gestor_id");
      if (gestorFilter && gestorFilter !== "all") q = q.eq("gestor_id", gestorFilter);
      const { data: c } = await q;
      const { data: t } = await supabase.from("client_tracking").select("cliente_id");
      const tIds = t?.map(x => x.cliente_id) || [];
      return c?.filter(x => !tIds.includes(x.id)) || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ClientTracking>) => {
      const gD = data.google_valor_diario! > 0 ? Math.floor(data.google_saldo! / data.google_valor_diario!) : 0;
      const mD = data.meta_valor_diario! > 0 ? Math.floor(data.meta_saldo! / data.meta_valor_diario!) : 0;
      const now = format(new Date(), "yyyy-MM-dd");
      const payload = { ...data, google_dias_restantes: gD, meta_dias_restantes: mD, google_ultima_validacao: now, meta_ultima_validacao: now };
      delete (payload as any).clientes;
      if (data.id) return supabase.from("client_tracking").update(payload).eq("id", data.id);
      return supabase.from("client_tracking").insert([payload]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-tracking"] });
      queryClient.invalidateQueries({ queryKey: ["clientes-sem-tracking"] });
      toast({ title: "Dados atualizados" });
      setIsDialogOpen(false);
    }
  });

  const filteredData = useMemo(() => {
    if (!trackingData) return [];
    let data = [...trackingData];
    if (searchTerm) data = data.filter(t => t.clientes?.nome?.toLowerCase().includes(searchTerm.toLowerCase()));
    data.sort((a, b) => sortOrder === "asc" ? (a.clientes?.nome || "").localeCompare(b.clientes?.nome || "") : (b.clientes?.nome || "").localeCompare(a.clientes?.nome || ""));
    return data;
  }, [trackingData, searchTerm, sortOrder]);

  const sidebarItems = [
    { id: "all", label: "Visão Geral", icon: LayoutGrid },
    { id: "google", label: "Google Ecosystem", icon: Globe },
    { id: "meta", label: "Paid Social (Meta)", icon: Share2 },
    { id: "financial", label: "Financeiro & Saldos", icon: Wallet },
    { id: "technical", label: "Technical Setup", icon: Settings2 },
  ];

  if (isLoading) return <div className="h-96 flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary/30" /></div>;

  return (
    <div className="flex h-[calc(100vh-320px)] min-h-[600px] border border-border/50 rounded-[2rem] bg-card/30 backdrop-blur-xl overflow-hidden font-inter shadow-2xl">
      {/* Sidebar - High End Nav */}
      <div className="w-64 border-r border-border/50 bg-black/20 p-6 flex flex-col gap-8">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Categorias</h3>
          <div className="space-y-1.5">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.id as CategoryType)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                  activeCategory === item.id
                    ? "bg-primary text-white shadow-[0_4px_12px_rgba(5,140,66,0.2)]"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeCategory === item.id ? "text-white" : "text-gray-500")} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-border/30">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4">Quick Filters</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500">Com Clarity</span>
              <Switch className="scale-75" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500">Ads Ativos</span>
              <Switch className="scale-75" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar - Sheets Style */}
        <div className="h-20 border-b border-border/50 bg-black/10 px-8 flex items-center justify-between gap-6">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Pesquisar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-black/20 border-border/50 rounded-xl focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")} className="h-10 px-4 rounded-xl border-border/50 font-bold text-xs gap-2">
              <SortAsc className="w-4 h-4" /> A-Z
            </Button>
            <div className="h-6 w-px bg-border/50 mx-2" />
            <Select>
              <SelectTrigger className="w-40 h-10 border-border/50 rounded-xl font-bold text-xs">
                <div className="flex items-center gap-2"><Filter className="w-3 h-3" /><SelectValue placeholder="Status" /></div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ok">Operante</SelectItem>
                <SelectItem value="warn">Atenção</SelectItem>
                <SelectItem value="err">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
            {clientesSemTracking && clientesSemTracking.length > 0 && (
              <Button
                className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs gap-2 shadow-lg"
                onClick={() => {
                  setNewClienteId(clientesSemTracking[0].id);
                  setNewClienteNome(clientesSemTracking[0].nome);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4" /> Novo Tracking
              </Button>
            )}
          </div>
        </div>

        {/* Content - Dense Grid */}
        <ScrollArea className="flex-1 w-full bg-[#020202]">
          <Table className="border-collapse table-fixed w-full">
            <TableHeader className="sticky top-0 bg-[#020202] z-20 shadow-sm border-b border-white/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[200px] border-r border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 pl-8">Cliente</TableHead>
                {activeCategory === "all" && (
                  <>
                    <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Clarity</TableHead>
                    <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">G-Ads</TableHead>
                    <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">M-Ads</TableHead>
                    <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Saldo Total</TableHead>
                  </>
                )}
                {activeCategory === "google" && (
                  <>
                    <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Google Status</TableHead>
                    <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">GTM ID</TableHead>
                    <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">GA4 ID</TableHead>
                    <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">S. Console</TableHead>
                  </>
                )}
                {activeCategory === "meta" && (
                  <>
                    <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Meta Status</TableHead>
                    <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Pixel Status</TableHead>
                    <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Business ID</TableHead>
                  </>
                )}
                {activeCategory === "financial" && (
                  <>
                    <TableHead className="w-[140px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Saldo G-Ads</TableHead>
                    <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center text-red-400">Burn Rate (G)</TableHead>
                    <TableHead className="w-[140px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Saldo Meta</TableHead>
                    <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center text-red-400">Burn Rate (M)</TableHead>
                  </>
                )}
                {activeCategory === "technical" && (
                  <>
                    <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">GTM Integration</TableHead>
                    <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">GA4 Stream</TableHead>
                    <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Clarity Heatmaps</TableHead>
                  </>
                )}
                <TableHead className="flex-1 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right pr-8">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredData.map((t, idx) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group hover:bg-white/[0.03] border-b border-white/[0.02] transition-all"
                  >
                    <TableCell className="border-r border-white/5 pl-8 py-4 sticky left-0 bg-[#020202] group-hover:bg-[#080808] z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-800 flex items-center justify-center text-[10px] font-black text-white">
                          {t.clientes?.nome?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors truncate">{t.clientes?.nome}</span>
                      </div>
                    </TableCell>

                    {activeCategory === "all" && (
                      <>
                        <TableCell className="text-center"><StatusBadge value={t.clarity_installed} type="boolean" /></TableCell>
                        <TableCell className="text-center font-bold text-xs text-gray-400">{t.google_ads_status || "N/A"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase", t.meta_ads_active ? "text-blue-400 border-blue-400/30" : "text-gray-600 border-gray-600/30")}>
                            {t.meta_ads_active ? "Ativo" : "Off"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs font-black text-emerald-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((t.google_saldo || 0) + (t.meta_saldo || 0))}
                        </TableCell>
                      </>
                    )}

                    {activeCategory === "google" && (
                      <>
                        <TableCell className="text-center"><StatusBadge value={t.google_ads_status} /></TableCell>
                        <TableCell className="text-center font-mono text-[10px] text-gray-500">{t.gtm_id || "-"}</TableCell>
                        <TableCell className="text-center font-mono text-[10px] text-gray-500">{t.ga4_id || "-"}</TableCell>
                        <TableCell className="text-center"><StatusBadge value={t.search_console_status} /></TableCell>
                      </>
                    )}

                    {activeCategory === "financial" && (
                      <>
                        <TableCell className="text-center font-bold text-xs">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.google_saldo || 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-red-400">-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.google_valor_diario || 0)}</span>
                            <span className="text-[8px] font-bold text-gray-600 uppercase">per day</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.meta_saldo || 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-red-400">-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.meta_valor_diario || 0)}</span>
                            <span className="text-[8px] font-bold text-gray-600 uppercase">per day</span>
                          </div>
                        </TableCell>
                      </>
                    )}

                    {activeCategory === "technical" && (
                      <>
                        <TableCell className="text-center font-mono text-[10px] text-gray-400 italic">{t.gtm_id || "GTM-NONE"}</TableCell>
                        <TableCell className="text-center font-mono text-[10px] text-gray-400 italic">{t.ga4_id || "G-NONE"}</TableCell>
                        <TableCell className="text-center"><StatusBadge value={t.clarity_installed} type="boolean" /></TableCell>
                      </>
                    )}

                    <TableCell className="pr-8 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 hover:bg-primary/20 hover:text-primary rounded-lg">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {t.url && (
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:bg-blue-400/20 hover:text-blue-400 rounded-lg">
                            <a href={t.url} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-400/20 hover:text-emerald-400 rounded-lg">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Footer Info */}
        <div className="h-10 border-t border-border/50 bg-black/40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Páginas: 1 de 1</span>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total: {filteredData.length} records</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Real-time Sync Active</span>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <EditTrackingDialog tracking={editingTracking} clienteId={newClienteId} clienteNome={newClienteNome} onClose={() => setIsDialogOpen(false)} onSave={(data: any) => saveMutation.mutate(data)} />
      </Dialog>
    </div>
  );
};

export default ClientTrackingTable;
