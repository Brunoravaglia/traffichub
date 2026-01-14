import { motion } from "framer-motion";
import { Plus, Users, BarChart3, Briefcase, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const monthStart = format(startOfMonth(currentDate), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(currentDate), "yyyy-MM-dd");

  // Fetch stats
  const { data: stats, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    staleTime: 0,
    queryFn: async () => {
      const [clientesRes, gestoresRes, checklistsRes, relatoriosRes] = await Promise.all([
        supabase.from("clientes").select("id, nome, logo_url, created_at").order("created_at", { ascending: false }),
        supabase.from("gestores").select("id, nome, foto_url"),
        supabase.from("checklists").select("*").gte("data", monthStart).lte("data", monthEnd),
        supabase.from("relatorios").select("*").gte("data", monthStart).lte("data", monthEnd),
      ]);

      const checklists = checklistsRes.data || [];
      const pendentes = checklists.filter(c => 
        c.pendencias && c.pendencias.trim() !== ""
      ).length;

      const completedItems = checklists.reduce((acc, c) => {
        const fields = [
          c.pagamento_ok, c.conta_sem_bloqueios, c.saldo_suficiente,
          c.pixel_tag_instalados, c.conversoes_configuradas, c.integracao_crm,
          c.criativos_atualizados, c.cta_claro, c.teste_ab_ativo
        ];
        return acc + fields.filter(Boolean).length;
      }, 0);

      const totalItems = checklists.length * 9;
      const avgProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // Generate chart data for last 7 days
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = format(date, "yyyy-MM-dd");
        const dayChecklists = checklists.filter(c => c.data === dateStr);
        const dayRelatorios = (relatoriosRes.data || []).filter(r => r.data === dateStr);
        
        chartData.push({
          name: format(date, "EEE", { locale: ptBR }),
          checklists: dayChecklists.length,
          relatorios: dayRelatorios.length,
        });
      }

      // Pie chart data
      const pieData = [
        { name: "Completos", value: avgProgress, color: "hsl(var(--primary))" },
        { name: "Pendentes", value: 100 - avgProgress, color: "hsl(var(--muted))" },
      ];

      return {
        clientes: clientesRes.data || [],
        gestores: gestoresRes.data || [],
        totalChecklists: checklists.length,
        pendentes,
        avgProgress,
        totalRelatorios: relatoriosRes.data?.length || 0,
        chartData,
        pieData,
      };
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-full bg-background overflow-hidden p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-foreground">Olá, </span>
            <span className="vcd-gradient-text">Gestor</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Gerencie suas contas de mídia paga com eficiência
          </motion.p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <motion.div variants={itemVariants} className="vcd-card group hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.clientes.length || 0}</p>
            <p className="text-sm text-muted-foreground">Clientes Ativos</p>
          </motion.div>

          <motion.div variants={itemVariants} className="vcd-card group hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.gestores.length || 0}</p>
            <p className="text-sm text-muted-foreground">Gestores</p>
          </motion.div>

          <motion.div variants={itemVariants} className="vcd-card group hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.avgProgress || 0}%</p>
            <p className="text-sm text-muted-foreground">Média Conclusão</p>
          </motion.div>

          <motion.div variants={itemVariants} className="vcd-card group hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.pendentes || 0}</p>
            <p className="text-sm text-muted-foreground">Pendências</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <motion.div variants={itemVariants} className="md:col-span-2 vcd-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Atividade Semanal</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData || []}>
                  <defs>
                    <linearGradient id="colorChecklists" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="checklists" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fill="url(#colorChecklists)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Progress Pie */}
          <motion.div variants={itemVariants} className="vcd-card flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-foreground mb-4">Progresso Geral</h3>
            <div className="h-40 w-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.pieData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.pieData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{stats?.avgProgress || 0}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/novo-cliente")}
              className="vcd-card-hover group text-left p-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Novo Cliente</h4>
            </motion.button>

            <motion.button
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/clientes")}
              className="vcd-card-hover group text-left p-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Ver Clientes</h4>
            </motion.button>

            <motion.button
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/gestores")}
              className="vcd-card-hover group text-left p-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Gestores</h4>
            </motion.button>

            <motion.button
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className="vcd-card-hover group text-left p-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Dashboard</h4>
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Clients with Logos */}
        {stats?.clientes && stats.clientes.length > 0 && (
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Clientes Recentes</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {stats.clientes.slice(0, 6).map((cliente, index) => (
                <motion.button
                  key={cliente.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/cliente/${cliente.id}`)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
                >
                  {cliente.logo_url ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary border border-border">
                      <img src={cliente.logo_url} alt={cliente.nome} className="w-full h-full object-contain p-1" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-foreground">
                        {cliente.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors truncate max-w-full">
                    {cliente.nome}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Gestores Team */}
        {stats?.gestores && stats.gestores.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Equipe de Gestores</h3>
              <button
                onClick={() => navigate("/gestores")}
                className="text-sm text-primary hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {stats.gestores.slice(0, 5).map((gestor, index) => (
                <motion.div
                  key={gestor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
                >
                  {gestor.foto_url ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
                      <img src={gestor.foto_url} alt={gestor.nome} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">
                        {gestor.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">{gestor.nome}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
