import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Calendar, Users, Timer, Target, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "0min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

const ProductivityDashboard = () => {
  const { gestor } = useGestor();
  const [period, setPeriod] = useState<"week" | "month">("week");

  const { data: productivityData, isLoading } = useQuery({
    queryKey: ["productivity-dashboard", gestor?.id, period],
    enabled: !!gestor?.id,
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (period === "week") {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      // Fetch gestor sessions
      const { data: sessions } = await supabase
        .from("gestor_sessions")
        .select("*")
        .eq("gestor_id", gestor!.id)
        .gte("login_at", startDate.toISOString())
        .lte("login_at", endDate.toISOString())
        .order("login_at", { ascending: true });

      // Fetch client time tracking
      const { data: clientTime } = await supabase
        .from("client_time_tracking")
        .select("*, clientes(nome)")
        .eq("gestor_id", gestor!.id)
        .gte("opened_at", startDate.toISOString())
        .lte("opened_at", endDate.toISOString());

      // Fetch all sessions for comparison
      const { data: allSessions } = await supabase
        .from("gestor_sessions")
        .select("gestor_id, duration_seconds")
        .gte("login_at", startDate.toISOString())
        .lte("login_at", endDate.toISOString());

      // Fetch all gestores for comparison
      const { data: allGestores } = await supabase
        .from("gestores")
        .select("id, nome");

      // Calculate total time worked
      const totalSeconds = (sessions || []).reduce(
        (acc, s) => acc + (s.duration_seconds || 0),
        0
      );

      // Calculate average session duration
      const avgSessionSeconds = sessions?.length
        ? totalSeconds / sessions.length
        : 0;

      // Calculate daily average
      const daysInPeriod = differenceInDays(endDate, startDate) + 1;
      const dailyAvgSeconds = totalSeconds / daysInPeriod;

      // Generate daily chart data
      const dailyData: { date: string; hours: number; sessions: number }[] = [];
      for (let i = 0; i < daysInPeriod; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = format(date, "yyyy-MM-dd");
        
        const daySessions = (sessions || []).filter(
          (s) => format(new Date(s.login_at), "yyyy-MM-dd") === dateStr
        );
        
        const daySeconds = daySessions.reduce(
          (acc, s) => acc + (s.duration_seconds || 0),
          0
        );

        dailyData.push({
          date: format(date, period === "week" ? "EEE" : "dd/MM", { locale: ptBR }),
          hours: Math.round((daySeconds / 3600) * 100) / 100,
          sessions: daySessions.length,
        });
      }

      // Calculate time per client
      const clientTimeMap = new Map<string, { name: string; seconds: number }>();
      (clientTime || []).forEach((ct) => {
        const clientName = (ct.clientes as any)?.nome || "Desconhecido";
        const existing = clientTimeMap.get(ct.cliente_id) || { name: clientName, seconds: 0 };
        existing.seconds += ct.duration_seconds || 0;
        clientTimeMap.set(ct.cliente_id, existing);
      });

      const clientTimeData = Array.from(clientTimeMap.values())
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5)
        .map((c) => ({
          name: c.name.length > 15 ? c.name.substring(0, 15) + "..." : c.name,
          hours: Math.round((c.seconds / 3600) * 100) / 100,
        }));

      // Calculate comparison with other gestores
      const gestorTotals = new Map<string, number>();
      (allSessions || []).forEach((s) => {
        const current = gestorTotals.get(s.gestor_id) || 0;
        gestorTotals.set(s.gestor_id, current + (s.duration_seconds || 0));
      });

      const allTotals = Array.from(gestorTotals.values());
      const avgAllGestores = allTotals.length
        ? allTotals.reduce((a, b) => a + b, 0) / allTotals.length
        : 0;

      const ranking = Array.from(gestorTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .findIndex(([id]) => id === gestor!.id) + 1;

      return {
        totalSeconds,
        avgSessionSeconds,
        dailyAvgSeconds,
        sessionCount: sessions?.length || 0,
        clientTimeData,
        dailyData,
        comparison: {
          avgAllGestores,
          ranking,
          totalGestores: gestorTotals.size,
          percentAboveAvg: avgAllGestores > 0 
            ? Math.round(((totalSeconds - avgAllGestores) / avgAllGestores) * 100)
            : 0,
        },
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Timer className="w-6 h-6 text-primary" />
            Produtividade
          </h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe suas horas trabalhadas e atividade
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="week">Esta Semana</TabsTrigger>
            <TabsTrigger value="month">Este Mês</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="vcd-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatDuration(productivityData?.totalSeconds || 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Trabalhado</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="vcd-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatDuration(productivityData?.dailyAvgSeconds || 0)}
          </p>
          <p className="text-sm text-muted-foreground">Média Diária</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="vcd-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {productivityData?.sessionCount || 0}
          </p>
          <p className="text-sm text-muted-foreground">Sessões</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="vcd-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            {(productivityData?.comparison.percentAboveAvg || 0) > 0 && (
              <TrendingUp className="w-4 h-4 text-green-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">
            #{productivityData?.comparison.ranking || "-"}
          </p>
          <p className="text-sm text-muted-foreground">
            de {productivityData?.comparison.totalGestores || 0} gestores
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="vcd-card"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Horas por Dia
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData?.dailyData || []}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(v) => `${v}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [`${value}h`, "Horas"]}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Time per Client */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="vcd-card"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Tempo por Cliente
          </h3>
          <div className="h-48">
            {productivityData?.clientTimeData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivityData.clientTimeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`${value}h`, "Horas"]}
                  />
                  <Bar
                    dataKey="hours"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhum dado de cliente disponível
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Comparison Card */}
      {productivityData?.comparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="vcd-card"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Comparativo com a Equipe
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Seu Total</p>
              <p className="text-xl font-bold text-foreground">
                {formatDuration(productivityData.totalSeconds)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Média da Equipe</p>
              <p className="text-xl font-bold text-foreground">
                {formatDuration(productivityData.comparison.avgAllGestores)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Diferença</p>
              <p className={`text-xl font-bold ${
                productivityData.comparison.percentAboveAvg >= 0 
                  ? "text-green-500" 
                  : "text-red-500"
              }`}>
                {productivityData.comparison.percentAboveAvg >= 0 ? "+" : ""}
                {productivityData.comparison.percentAboveAvg}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductivityDashboard;
