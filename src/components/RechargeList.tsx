import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Filter,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface RechargeItem {
  clienteId: string;
  clienteNome: string;
  clienteLogo: string | null;
  platform: "google" | "meta";
  date: Date;
  saldo: number;
  valorDiario: number;
  diasRestantes: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const RechargeList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "google" | "meta" | "urgent">("all");

  const { data: trackingData, isLoading } = useQuery({
    queryKey: ["recharge-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_tracking")
        .select("*, clientes(id, nome, logo_url)")
        .or("google_proxima_recarga.not.is.null,meta_proxima_recarga.not.is.null");

      if (error) throw error;
      return data || [];
    },
  });

  const recharges = useMemo(() => {
    if (!trackingData) return [];

    const allRecharges: RechargeItem[] = [];
    const today = new Date();

    trackingData.forEach((tracking) => {
      const cliente = tracking.clientes as any;
      if (!cliente) return;

      // Google recharge
      if (tracking.google_proxima_recarga) {
        const date = new Date(tracking.google_proxima_recarga);
        const diasRestantes = differenceInDays(date, today);
        
        allRecharges.push({
          clienteId: tracking.cliente_id,
          clienteNome: cliente.nome,
          clienteLogo: cliente.logo_url,
          platform: "google",
          date,
          saldo: Number(tracking.google_saldo) || 0,
          valorDiario: Number(tracking.google_valor_diario) || 0,
          diasRestantes,
        });
      }

      // Meta recharge
      if (tracking.meta_proxima_recarga) {
        const date = new Date(tracking.meta_proxima_recarga);
        const diasRestantes = differenceInDays(date, today);
        
        allRecharges.push({
          clienteId: tracking.cliente_id,
          clienteNome: cliente.nome,
          clienteLogo: cliente.logo_url,
          platform: "meta",
          date,
          saldo: Number(tracking.meta_saldo) || 0,
          valorDiario: Number(tracking.meta_valor_diario) || 0,
          diasRestantes,
        });
      }
    });

    // Sort by days remaining (most urgent first)
    return allRecharges.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [trackingData]);

  const filteredRecharges = useMemo(() => {
    switch (filter) {
      case "google":
        return recharges.filter((r) => r.platform === "google");
      case "meta":
        return recharges.filter((r) => r.platform === "meta");
      case "urgent":
        return recharges.filter((r) => r.diasRestantes <= 3);
      default:
        return recharges;
    }
  }, [recharges, filter]);

  const urgentCount = recharges.filter((r) => r.diasRestantes <= 3).length;

  const getUrgencyBadge = (diasRestantes: number) => {
    if (diasRestantes <= 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Vencido
        </Badge>
      );
    }
    if (diasRestantes <= 3) {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600 gap-1">
          <Clock className="w-3 h-3" />
          {diasRestantes} dia{diasRestantes > 1 ? "s" : ""}
        </Badge>
      );
    }
    if (diasRestantes <= 7) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black gap-1">
          <Clock className="w-3 h-3" />
          {diasRestantes} dias
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500 hover:bg-green-600 gap-1">
        <Clock className="w-3 h-3" />
        {diasRestantes} dias
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Próximas Recargas
          </h3>
          {urgentCount > 0 && (
            <p className="text-sm text-orange-500">
              {urgentCount} recarga{urgentCount > 1 ? "s" : ""} urgente{urgentCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-32 bg-secondary border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="meta">Meta</SelectItem>
            <SelectItem value="urgent">Urgentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filteredRecharges.length > 0 ? (
        <div className="space-y-3">
          {filteredRecharges.map((recharge, index) => (
            <motion.div
              key={`${recharge.clienteId}-${recharge.platform}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "vcd-card p-4 cursor-pointer hover:border-primary/30 transition-all",
                recharge.diasRestantes <= 0 && "border-red-500/50",
                recharge.diasRestantes > 0 && recharge.diasRestantes <= 3 && "border-orange-500/50"
              )}
              onClick={() => navigate(`/cliente/${recharge.clienteId}`)}
            >
              <div className="flex items-center gap-4">
                {/* Client Avatar */}
                {recharge.clienteLogo ? (
                  <img
                    src={recharge.clienteLogo}
                    alt={recharge.clienteNome}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {recharge.clienteNome.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {recharge.clienteNome}
                    </p>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs rounded-full text-white",
                        recharge.platform === "google" ? "bg-blue-500" : "bg-pink-500"
                      )}
                    >
                      {recharge.platform === "google" ? "Google" : "Meta"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(recharge.saldo)}
                    </span>
                    <span>
                      {format(recharge.date, "dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Urgency Badge */}
                {getUrgencyBadge(recharge.diasRestantes)}

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="vcd-card text-center py-8">
          <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {filter === "all"
              ? "Nenhuma recarga programada"
              : `Nenhuma recarga ${filter === "urgent" ? "urgente" : `de ${filter}`}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default RechargeList;
