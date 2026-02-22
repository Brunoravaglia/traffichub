import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, FileText, Calendar, Search, Eye, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import VCDLogo from "@/components/VCDLogo";
import { useGestor } from "@/contexts/GestorContext";

interface ReportWithClient {
  id: string;
  nome: string;
  periodo_inicio: string;
  periodo_fim: string;
  created_at: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_logo: string | null;
}

const TodosRelatorios = () => {
  const navigate = useNavigate();
  const { gestor } = useGestor();
  const agencyId = gestor?.agencia_id ?? null;
  const [search, setSearch] = useState("");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["all-reports", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const { data: scopedClients, error: clientsError } = await supabase
        .from("clientes")
        .select("id")
        .eq("agencia_id", agencyId);
      if (clientsError) throw clientsError;
      const clientIds = (scopedClients || []).map((c) => c.id);
      if (clientIds.length === 0) return [];

      const { data, error } = await supabase
        .from("client_reports")
        .select(`
          id,
          nome,
          periodo_inicio,
          periodo_fim,
          created_at,
          cliente_id,
          clientes (
            nome,
            logo_url
          )
        `)
        .in("cliente_id", clientIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((report: any) => ({
        id: report.id,
        nome: report.nome,
        periodo_inicio: report.periodo_inicio,
        periodo_fim: report.periodo_fim,
        created_at: report.created_at,
        cliente_id: report.cliente_id,
        cliente_nome: report.clientes?.nome || "Cliente",
        cliente_logo: report.clientes?.logo_url || null,
      })) as ReportWithClient[];
    },
    enabled: !!agencyId,
  });

  const filteredReports = reports?.filter(
    (r) =>
      r.nome.toLowerCase().includes(search.toLowerCase()) ||
      r.cliente_nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-background p-6">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="hover:bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <VCDLogo size="sm" />
        <div className="flex-1" />
        <Badge variant="outline" className="text-muted-foreground">
          <FileText className="w-3 h-3 mr-1" />
          {reports?.length || 0} relatórios
        </Badge>
      </header>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Histórico de Relatórios
        </h1>
        <p className="text-muted-foreground">
          Todos os relatórios enviados para clientes
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Reports List */}
      {isLoading ? (
        <div className="grid gap-4">
          {["skeleton-1", "skeleton-2", "skeleton-3"].map((skeletonId) => (
            <div
              key={skeletonId}
              className="h-24 bg-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredReports && filteredReports.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4"
        >
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Client Logo */}
                {report.cliente_logo ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary border border-border flex-shrink-0">
                    <img
                      src={report.cliente_logo}
                      alt={report.cliente_nome}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {report.nome}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {report.cliente_nome}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(report.periodo_inicio), "dd/MM", {
                        locale: ptBR,
                      })}{" "}
                      -{" "}
                      {format(parseISO(report.periodo_fim), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="text-right hidden md:block">
                  <p className="text-xs text-muted-foreground">Criado em</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(parseISO(report.created_at), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>

                {/* View Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/cliente/${report.cliente_id}/enviar-relatorio?reportId=${report.id}`)
                  }
                  className="flex-shrink-0"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum relatório encontrado
          </h3>
          <p className="text-muted-foreground mb-6">
            {search
              ? "Tente uma busca diferente"
              : "Crie seu primeiro relatório para um cliente"}
          </p>
          <Button onClick={() => navigate("/clientes")}>Ver Clientes</Button>
        </motion.div>
      )}
    </div>
  );
};

export default TodosRelatorios;
