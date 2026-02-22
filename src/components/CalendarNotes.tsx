import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  BellOff,
  Plus,
  X,
  Trash2,
  StickyNote,
  Save,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CalendarNote {
  id: string;
  gestor_id: string;
  cliente_id: string | null;
  note_date: string;
  title: string;
  content: string | null;
  has_reminder: boolean;
  reminder_shown: boolean;
  created_at: string;
  clientes?: { nome: string; logo_url: string | null } | null;
}

interface CalendarNotesProps {
  selectedDate?: Date;
  gestorFilter?: string;
}

const CalendarNotes = ({ selectedDate, gestorFilter }: CalendarNotesProps) => {
  const { gestor } = useGestor();
  const agencyId = gestor?.agencia_id ?? null;
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    has_reminder: false,
    cliente_id: "",
    note_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
  });

  // Update note_date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setNewNote(prev => ({
        ...prev,
        note_date: format(selectedDate, "yyyy-MM-dd")
      }));
    }
  }, [selectedDate]);

  const { data: agencyGestores } = useQuery({
    queryKey: ["agency-gestores-for-notes", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const { data, error } = await supabase
        .from("gestores")
        .select("id")
        .eq("agencia_id", agencyId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!agencyId,
    initialData: [],
  });

  const allowedGestorIds = (agencyGestores || []).map((g) => g.id);

  // Fetch notes for the selected period
  const { data: notes, isLoading } = useQuery({
    queryKey: ["calendar-notes", agencyId, gestorFilter, selectedDate?.toISOString(), allowedGestorIds],
    queryFn: async () => {
      if (!agencyId || allowedGestorIds.length === 0) return [];
      let query = supabase
        .from("calendar_notes")
        .select("*, clientes(nome, logo_url)")
        .in("gestor_id", allowedGestorIds)
        .order("note_date", { ascending: true })
        .order("created_at", { ascending: false });

      if (gestorFilter && gestorFilter !== "all") {
        query = query.eq("gestor_id", gestorFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CalendarNote[];
    },
    enabled: !!agencyId,
    initialData: [],
  });

  // Fetch clients for dropdown
  const { data: clientes } = useQuery({
    queryKey: ["clientes-for-notes", agencyId, gestorFilter],
    queryFn: async () => {
      if (!agencyId) return [];
      let query = supabase.from("clientes").select("id, nome").eq("agencia_id", agencyId).order("nome");
      
      if (gestorFilter && gestorFilter !== "all") {
        query = query.eq("gestor_id", gestorFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!agencyId,
    initialData: [],
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (note: typeof newNote) => {
      if (!gestor?.id || !agencyId) throw new Error("Gestor não autenticado");
      const { error } = await supabase.from("calendar_notes").insert({
        gestor_id: gestor?.id,
        cliente_id: note.cliente_id || null,
        note_date: note.note_date,
        title: note.title,
        content: note.content || null,
        has_reminder: note.has_reminder,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-notes"] });
      toast.success("Nota criada com sucesso!");
      setIsAddOpen(false);
      setNewNote({
        title: "",
        content: "",
        has_reminder: false,
        cliente_id: "",
        note_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      });
    },
    onError: () => {
      toast.error("Erro ao criar nota");
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!agencyId || allowedGestorIds.length === 0) throw new Error("Agência não identificada");
      const { error } = await supabase
        .from("calendar_notes")
        .delete()
        .eq("id", noteId)
        .in("gestor_id", allowedGestorIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-notes"] });
      toast.success("Nota removida!");
    },
    onError: () => {
      toast.error("Erro ao remover nota");
    },
  });

  // Toggle reminder mutation
  const toggleReminderMutation = useMutation({
    mutationFn: async ({ noteId, hasReminder }: { noteId: string; hasReminder: boolean }) => {
      if (!agencyId || allowedGestorIds.length === 0) throw new Error("Agência não identificada");
      const { error } = await supabase
        .from("calendar_notes")
        .update({ has_reminder: hasReminder })
        .eq("id", noteId)
        .in("gestor_id", allowedGestorIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-notes"] });
    },
  });

  // Filter notes for selected date
  const notesForSelectedDate = notes?.filter((note) => 
    selectedDate && isSameDay(new Date(note.note_date), selectedDate)
  ) || [];

  const upcomingNotes = notes?.filter((note) => {
    const noteDate = new Date(note.note_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return noteDate >= today && note.has_reminder;
  }).slice(0, 5) || [];

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Notas</h3>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Nova Nota</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="note-date">Data</Label>
                <Input
                  id="note-date"
                  type="date"
                  value={newNote.note_date}
                  onChange={(e) =>
                    setNewNote({ ...newNote, note_date: e.target.value })
                  }
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="note-title">Título</Label>
                <Input
                  id="note-title"
                  placeholder="Título da nota..."
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="note-content">Descrição (opcional)</Label>
                <Textarea
                  id="note-content"
                  placeholder="Detalhes da nota..."
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  className="bg-secondary border-border min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="note-client">Cliente (opcional)</Label>
                <Select
                  value={newNote.cliente_id}
                  onValueChange={(v) =>
                    setNewNote({ ...newNote, cliente_id: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="none">Nenhum</SelectItem>
                    {clientes?.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="note-reminder">Ativar lembrete</Label>
                </div>
                <Switch
                  id="note-reminder"
                  checked={newNote.has_reminder}
                  onCheckedChange={(checked) =>
                    setNewNote({ ...newNote, has_reminder: checked })
                  }
                />
              </div>
              <Button
                onClick={() => createNoteMutation.mutate(newNote)}
                disabled={!newNote.title.trim() || createNoteMutation.isPending}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Nota
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes for Selected Date */}
      {selectedDate && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </p>
          {notesForSelectedDate.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {notesForSelectedDate.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "vcd-card p-3 group relative",
                      note.has_reminder && "border-primary/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-foreground">
                            {note.title}
                          </p>
                          {note.has_reminder && (
                            <Bell className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        {note.content && (
                          <p className="text-xs text-muted-foreground">
                            {note.content}
                          </p>
                        )}
                        {note.clientes && (
                          <div className="flex items-center gap-1 mt-2">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {note.clientes.nome}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            toggleReminderMutation.mutate({
                              noteId: note.id,
                              hasReminder: !note.has_reminder,
                            })
                          }
                        >
                          {note.has_reminder ? (
                            <BellOff className="w-3 h-3" />
                          ) : (
                            <Bell className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteNoteMutation.mutate(note.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Nenhuma nota para este dia
            </p>
          )}
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingNotes.length > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Próximos Lembretes
          </p>
          <div className="space-y-2">
            {upcomingNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-center gap-2 text-sm p-2 rounded-lg bg-primary/5 border border-primary/20"
              >
                <Bell className="w-3 h-3 text-primary shrink-0" />
                <span className="flex-1 truncate text-foreground">{note.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(note.note_date), "dd/MM", { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default CalendarNotes;
