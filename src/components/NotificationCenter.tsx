import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
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
    <>
      {/* Floating Bell Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 left-6 z-50 bg-card border border-border rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-6 z-50 w-80 max-h-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Notificações</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Notifications List */}
            <ScrollArea className="max-h-72">
              {notifications.length > 0 ? (
                <div className="p-2 space-y-2">
                  {notifications.map((notification) => (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação pendente
                  </p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;
