import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Gauge,
  Wallet,
  Clock,
  Banknote,
} from "lucide-react";
import { useGestor } from "@/contexts/GestorContext";

interface ClientTracking {
  id: string;
  cliente_id: string;
  google_saldo: number;
  google_valor_diario: number;
  google_dias_restantes: number;
  meta_saldo: number;
  meta_valor_diario: number;
  meta_dias_restantes: number;
  pixel_installed: boolean;
  clarity_installed: boolean;
  meta_ads_active: boolean;
  clientes?: {
    nome: string;
    gestor_id: string;
  };
}

interface ControleDashboardProps {
  gestorFilter?: string;
}

const COLORS = {
  google: "#4285f4",
  meta: "#a855f7",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const ControleDashboard = ({ gestorFilter }: ControleDashboardProps) => {
  const { gestor } = useGestor();
  const agencyId = gestor?.agencia_id ?? null;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Fetch all clients for gestor filtering
  const { data: clientesData } = useQuery({
    queryKey: ["clientes-for-filter", agencyId, gestorFilter],
    queryFn: async () => {
      if (!agencyId) return [];
      let query = supabase.from("clientes").select("id, gestor_id");
      query = query.eq("agencia_id", agencyId);
      if (gestorFilter && gestorFilter !== "all") {
        query = query.eq("gestor_id", gestorFilter);
      }
      const { data } = await query;
      return data || [];
    },
    enabled: !!agencyId,
    initialData: [],
  });

  const clienteIds = clientesData?.map((c) => c.id) || [];

  const { data: trackingData, isLoading } = useQuery({
    queryKey: ["client-tracking-dashboard", agencyId, gestorFilter, clienteIds],
    queryFn: async () => {
      if (!agencyId || clienteIds.length === 0) return [];
      const { data, error } = await supabase
        .from("client_tracking")
        .select(`
          *,
          clientes(nome, gestor_id)
        `)
        .in("cliente_id", clienteIds);
      if (error) throw error;
      return data as ClientTracking[];
    },
    enabled: !!agencyId && clienteIds.length > 0,
    initialData: [],
  });

  // Filter tracking data by gestor
  const filteredTrackingData = trackingData?.filter((t) => {
    if (!gestorFilter || gestorFilter === "all") return true;
    return t.clientes?.gestor_id === gestorFilter;
  }) || [];

  // Fetch monthly investment from client_reports - filtered by gestor's clients
  const { data: monthlyInvestment } = useQuery({
    queryKey: ["monthly-investment", format(monthStart, "yyyy-MM"), gestorFilter, clienteIds],
    queryFn: async () => {
      // NOTE: alguns relatórios antigos salvavam o investido só dentro de `data_values`.
      // Para não zerar o KPI, usamos fallback para `data_values.google/meta.investido`.
      if (!agencyId || clienteIds.length === 0) {
        return { google: 0, meta: 0, total: 0 };
      }

      let query = supabase
        .from("client_reports")
        .select("cliente_id, google_investido, meta_investido, data_values")
        .in("cliente_id", clienteIds)
        .gte("periodo_inicio", format(monthStart, "yyyy-MM-dd"))
        .lte("periodo_fim", format(monthEnd, "yyyy-MM-dd"));

      const { data, error } = await query;
      if (error) throw error;

      const filteredData =
        gestorFilter && gestorFilter !== "all"
          ? data?.filter((r) => clienteIds.includes(r.cliente_id))
          : data;

      const totalGoogle =
        filteredData?.reduce((acc, r: any) => {
          const fromColumn = Number(r.google_investido);
          const fromJson = Number(r?.data_values?.google?.investido);
          const value = (fromColumn || 0) > 0 ? fromColumn : (fromJson || 0);
          return acc + value;
        }, 0) || 0;

      const totalMeta =
        filteredData?.reduce((acc, r: any) => {
          const fromColumn = Number(r.meta_investido);
          const fromJson = Number(r?.data_values?.meta?.investido);
          const value = (fromColumn || 0) > 0 ? fromColumn : (fromJson || 0);
          return acc + value;
        }, 0) || 0;

      return { google: totalGoogle, meta: totalMeta, total: totalGoogle + totalMeta };
    },
    enabled: !!agencyId && clienteIds.length > 0,
    initialData: { google: 0, meta: 0, total: 0 },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {["stats-1", "stats-2", "stats-3", "stats-4"].map((cardId) => (
          <Card key={cardId} className="animate-pulse">
            <CardContent className="h-28" />
          </Card>
        ))}
      </div>
    );
  }

  // Calculate stats using filtered data
  const totalClientes = filteredTrackingData.length;
  const totalGoogleSaldo = filteredTrackingData.reduce((acc, t) => acc + (t.google_saldo || 0), 0);
  const totalMetaSaldo = filteredTrackingData.reduce((acc, t) => acc + (t.meta_saldo || 0), 0);
  const totalSaldo = totalGoogleSaldo + totalMetaSaldo;

  const clientesCriticos = filteredTrackingData.filter(
    (t) => (t.google_dias_restantes <= 3 && t.google_saldo > 0) || 
           (t.meta_dias_restantes <= 3 && t.meta_saldo > 0)
  ).length;

  const clientesAtencao = filteredTrackingData.filter(
    (t) => ((t.google_dias_restantes > 3 && t.google_dias_restantes <= 7) && t.google_saldo > 0) || 
           ((t.meta_dias_restantes > 3 && t.meta_dias_restantes <= 7) && t.meta_saldo > 0)
  ).length;

  const clientesSaudaveis = totalClientes - clientesCriticos - clientesAtencao;

  // Pie chart data for health status
  const healthData = [
    { name: "Saudável", value: clientesSaudaveis, color: COLORS.success },
    { name: "Atenção", value: clientesAtencao, color: COLORS.warning },
    { name: "Crítico", value: clientesCriticos, color: COLORS.danger },
  ].filter(d => d.value > 0);

  // Bar chart data - Top 8 clients by total balance
  const topClientes = [...filteredTrackingData]
    .map(t => ({
      nome: t.clientes?.nome?.substring(0, 12) || "Cliente",
      google: t.google_saldo || 0,
      meta: t.meta_saldo || 0,
      total: (t.google_saldo || 0) + (t.meta_saldo || 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Integration stats
  const pixelInstalado = filteredTrackingData.filter(t => t.pixel_installed).length;
  const clarityInstalado = filteredTrackingData.filter(t => t.clarity_installed).length;
  const metaAtivo = filteredTrackingData.filter(t => t.meta_ads_active).length;

  const integrationData = [
    { name: "Pixel", value: pixelInstalado, total: totalClientes },
    { name: "Clarity", value: clarityInstalado, total: totalClientes },
    { name: "Meta Ads", value: metaAtivo, total: totalClientes },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Monthly Investment - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Investido Este Mês</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(monthlyInvestment?.total || 0)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-blue-500">G: {formatCurrency(monthlyInvestment?.google || 0)}</span>
                    <span className="text-purple-500">M: {formatCurrency(monthlyInvestment?.meta || 0)}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Banknote className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Total</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(totalSaldo)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-blue-500">G: {formatCurrency(totalGoogleSaldo)}</span>
                    <span className="text-purple-500">M: {formatCurrency(totalMetaSaldo)}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Wallet className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clientes Monitorados</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalClientes}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-[10px]">
                      {clientesSaudaveis} OK
                    </Badge>
                    {clientesAtencao > 0 && (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 text-[10px]">
                        {clientesAtencao} Atenção
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`bg-gradient-to-br ${clientesCriticos > 0 ? 'from-red-500/10 to-orange-500/5 border-red-500/20' : 'from-green-500/10 to-emerald-500/5 border-green-500/20'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Crítico</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{clientesCriticos}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {clientesCriticos > 0 ? "Clientes com ≤3 dias" : "Nenhum cliente crítico"}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${clientesCriticos > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  {clientesCriticos > 0 ? (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gasto Diário Total</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(
                      filteredTrackingData.reduce((acc, t) => acc + (t.google_valor_diario || 0) + (t.meta_valor_diario || 0), 0)
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Média por cliente: {formatCurrency(
                      totalClientes > 0 
                        ? filteredTrackingData.reduce((acc, t) => acc + (t.google_valor_diario || 0) + (t.meta_valor_diario || 0), 0) / totalClientes
                        : 0
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - Top Clients by Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Saldo por Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topClientes.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topClientes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="nome" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `R$${value/1000}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="google" name="Google" fill={COLORS.google} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="meta" name="Meta" fill={COLORS.meta} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart - Health Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                Saúde dos Saldos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={healthData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {healthData.map((entry) => (
                        <Cell key={`${entry.name}-${entry.color}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => (
                        <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>
                          {value}: {entry.payload.value}
                        </span>
                      )}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} clientes`, name]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Integration Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Status das Integrações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {integrationData.map((item) => {
                const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium text-foreground">
                        {item.value}/{item.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ControleDashboard;
