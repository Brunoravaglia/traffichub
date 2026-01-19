import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarNote {
  id: string;
  gestor_id: string;
  note_date: string;
  title: string;
  content: string | null;
  has_reminder: boolean;
  reminder_shown: boolean;
  clientes?: { nome: string } | null;
}

const CalendarReminders = () => {
  const { gestor } = useGestor();
  const queryClient = useQueryClient();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Fetch active reminders for today and tomorrow
  const { data: reminders } = useQuery({
    queryKey: ["calendar-reminders", gestor?.id],
    queryFn: async () => {
      if (!gestor?.id) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = format(today, "yyyy-MM-dd");
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("calendar_notes")
        .select("*, clientes(nome)")
        .eq("gestor_id", gestor.id)
        .eq("has_reminder", true)
        .eq("reminder_shown", false)
        .or(`note_date.eq.${todayStr},note_date.eq.${tomorrowStr}`)
        .order("note_date", { ascending: true });

      if (error) throw error;
      return data as CalendarNote[];
    },
    enabled: !!gestor?.id,
    refetchInterval: 60000, // Refetch every minute
  });

  // Mark reminder as shown
  const markShownMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("calendar_notes")
        .update({ reminder_shown: true })
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-reminders"] });
    },
  });

  const activeReminders = reminders?.filter((r) => !dismissedIds.has(r.id)) || [];

  const handleDismiss = (noteId: string, permanent: boolean = false) => {
    if (permanent) {
      markShownMutation.mutate(noteId);
    } else {
      setDismissedIds((prev) => new Set(prev).add(noteId));
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "dd/MM", { locale: ptBR });
  };

  if (!activeReminders.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-2">
      <AnimatePresence>
        {activeReminders.map((reminder, index) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "bg-card border border-primary/30 rounded-lg shadow-lg p-4",
              "ring-2 ring-primary/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      isToday(new Date(reminder.note_date))
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {getDateLabel(reminder.note_date)}
                  </span>
                </div>
                <p className="font-medium text-foreground text-sm">
                  {reminder.title}
                </p>
                {reminder.content && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {reminder.content}
                  </p>
                )}
                {reminder.clientes && (
                  <p className="text-xs text-primary mt-1">
                    {reminder.clientes.nome}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDismiss(reminder.id, false)}
                  title="Dispensar temporariamente"
                >
                  <X className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-green-500 hover:text-green-600"
                  onClick={() => handleDismiss(reminder.id, true)}
                  title="Marcar como visto"
                >
                  <Check className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CalendarReminders;
