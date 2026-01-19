import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  clienteId?: string;
  clienteNome?: string;
}

const NotificationCenter = () => {
  const { gestor } = useGestor();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Check for clients without weekly reports
  const { data: clientesData } = useQuery({
    queryKey: ["clientes-reports-check", gestor?.id],
    queryFn: async () => {
      if (!gestor) return [];
      
      const { data: clientes, error } = await supabase
        .from("clientes")
        .select("id, nome, gestor_id")
        .eq("gestor_id", gestor.id);
      
      if (error) throw error;
      return clientes || [];
    },
    enabled: !!gestor,
  });

  const { data: checklistsData } = useQuery({
    queryKey: ["checklists-weekly-check", gestor?.id],
    queryFn: async () => {
      if (!gestor || !clientesData) return [];
      
      const lastWeekStart = format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const lastWeekEnd = format(endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), "yyyy-MM-dd");
      
      const clienteIds = clientesData.map(c => c.id);
      
      const { data, error } = await supabase
        .from("checklists")
        .select("cliente_id, relatorio_semanal_enviado")
        .in("cliente_id", clienteIds)
        .gte("data", lastWeekStart)
        .lte("data", lastWeekEnd);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!gestor && !!clientesData && clientesData.length > 0,
  });

  // Build notifications based on missing reports
  useEffect(() => {
    if (!clientesData || !checklistsData) return;

    const newNotifications: Notification[] = [];
    
    // Check each client for missing weekly report
    clientesData.forEach(cliente => {
      const clienteChecklists = checklistsData.filter(c => c.cliente_id === cliente.id);
      const hasWeeklyReport = clienteChecklists.some(c => c.relatorio_semanal_enviado);
      
      if (!hasWeeklyReport && clienteChecklists.length > 0) {
        newNotifications.push({
          id: `report-${cliente.id}`,
          type: "warning",
          title: "Relatório Semanal Pendente",
          message: `O relatório semanal de ${cliente.nome} não foi enviado.`,
          clienteId: cliente.id,
          clienteNome: cliente.nome,
        });
      }
    });

    setNotifications(newNotifications);
  }, [clientesData, checklistsData]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.clienteId) {
      navigate(`/cliente/${notification.clienteId}`);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-primary" />;
    }
  };

  const unreadCount = notifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} pendente{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-72">
          {notifications.length > 0 ? (
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.button
                    key={notification.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
