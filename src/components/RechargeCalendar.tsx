import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useGestor } from "@/contexts/GestorContext";

interface RechargeEvent {
  clienteId: string;
  clienteNome: string;
  clienteLogo: string | null;
  platform: "google" | "meta";
  date: Date;
  saldo: number;
  valorDiario: number;
  diasRestantes: number;
  gestorId: string;
}

interface RechargeCalendarProps {
  gestorFilter?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const RechargeCalendarComponent = ({ gestorFilter }: RechargeCalendarProps) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: rechargeData, isLoading } = useQuery({
    queryKey: ["recharge-calendar", gestorFilter],
    queryFn: async () => {
      let query = supabase
        .from("client_tracking")
        .select("*, clientes(id, nome, logo_url, gestor_id)")
        .or("google_proxima_recarga.not.is.null,meta_proxima_recarga.not.is.null");

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Array<{
        cliente_id: string;
        google_proxima_recarga: string | null;
        google_recarga_tipo: string | null;
        google_saldo: number | null;
        google_valor_diario: number | null;
        google_dias_restantes: number | null;
        meta_proxima_recarga: string | null;
        meta_recarga_tipo: string | null;
        meta_ads_active: boolean | null;
        meta_saldo: number | null;
        meta_valor_diario: number | null;
        meta_dias_restantes: number | null;
        clientes: { id: string; nome: string; logo_url: string | null; gestor_id: string } | null;
      }>;
    },
  });

  const events = useMemo(() => {
    if (!rechargeData) return [];

    const allEvents: RechargeEvent[] = [];

    rechargeData.forEach((tracking) => {
      const cliente = tracking.clientes as any;
      if (!cliente) return;

      // Filter by gestor if specified
      if (gestorFilter && gestorFilter !== "all" && cliente.gestor_id !== gestorFilter) {
        return;
      }

      // Google recharge - skip if:
      // - tipo is "continuo" (recorrente/cartão)
      // - no daily spend configured (means client doesn't use Google Ads)
      const googleTipo = tracking.google_recarga_tipo;
      const googleValorDiario = Number(tracking.google_valor_diario) || 0;
      if (tracking.google_proxima_recarga && googleTipo !== "continuo" && googleValorDiario > 0) {
        allEvents.push({
          clienteId: tracking.cliente_id,
          clienteNome: cliente.nome,
          clienteLogo: cliente.logo_url,
          platform: "google",
          date: new Date(tracking.google_proxima_recarga),
          saldo: Number(tracking.google_saldo) || 0,
          valorDiario: googleValorDiario,
          diasRestantes: tracking.google_dias_restantes || 0,
          gestorId: cliente.gestor_id,
        });
      }

      // Meta recharge - skip if:
      // - tipo is "continuo"
      // - meta_ads_active is false
      // - no daily spend configured
      const metaTipo = tracking.meta_recarga_tipo;
      const metaAdsActive = tracking.meta_ads_active;
      const metaValorDiario = Number(tracking.meta_valor_diario) || 0;
      if (tracking.meta_proxima_recarga && metaTipo !== "continuo" && metaAdsActive && metaValorDiario > 0) {
        allEvents.push({
          clienteId: tracking.cliente_id,
          clienteNome: cliente.nome,
          clienteLogo: cliente.logo_url,
          platform: "meta",
          date: new Date(tracking.meta_proxima_recarga),
          saldo: Number(tracking.meta_saldo) || 0,
          valorDiario: metaValorDiario,
          diasRestantes: tracking.meta_dias_restantes || 0,
          gestorId: cliente.gestor_id,
        });
      }
    });

    return allEvents;
  }, [rechargeData, gestorFilter]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.date, day));
  };

  const getUrgencyColor = (diasRestantes: number) => {
    if (diasRestantes <= 0) return "bg-red-500";
    if (diasRestantes <= 3) return "bg-orange-500";
    if (diasRestantes <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPlatformColor = (platform: "google" | "meta") => {
    return platform === "google" ? "bg-blue-500" : "bg-pink-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground min-w-[200px] text-center">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
          Hoje
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="vcd-card p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "min-h-[80px] p-2 rounded-lg border border-transparent transition-all text-left",
                      isCurrentMonth
                        ? "bg-secondary/50 hover:bg-secondary"
                        : "bg-secondary/20 text-muted-foreground",
                      isCurrentDay && "border-primary ring-1 ring-primary",
                      dayEvents.length > 0 && "cursor-pointer"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrentDay && "text-primary"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getPlatformColor(event.platform)
                            )}
                            title={`${event.clienteNome} - ${event.platform}`}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                </PopoverTrigger>
                {dayEvents.length > 0 && (
                  <PopoverContent className="w-80 bg-card border-border p-0" align="start">
                    <div className="p-3 border-b border-border">
                      <h3 className="font-semibold text-foreground">
                        {format(day, "dd 'de' MMMM", { locale: ptBR })}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {dayEvents.length} recarga{dayEvents.length > 1 ? "s" : ""} prevista{dayEvents.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {dayEvents.map((event, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => navigate(`/cliente/${event.clienteId}`)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
                        >
                          {event.clienteLogo ? (
                            <img
                              src={event.clienteLogo}
                              alt={event.clienteNome}
                              className="w-10 h-10 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {event.clienteNome.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-foreground text-sm">
                              {event.clienteNome}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 text-xs rounded-full text-white",
                                  getPlatformColor(event.platform)
                                )}
                              >
                                {event.platform === "google" ? "Google" : "Meta"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Saldo: {formatCurrency(event.saldo)}
                              </span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              getUrgencyColor(event.diasRestantes)
                            )}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Google Ads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-muted-foreground">Meta Ads</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Urgente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">1-3 dias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">4-7 dias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">+7 dias</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechargeCalendarComponent;
