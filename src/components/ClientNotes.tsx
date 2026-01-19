import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  MessageSquare, 
  Bell, 
  Lightbulb, 
  AlertTriangle,
  StickyNote
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import NoteCard, { Note } from "./NoteCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientNotesProps {
  clienteId: string;
}

const noteTypes = [
  { value: "nota", label: "Nota", icon: MessageSquare, color: "text-blue-500" },
  { value: "lembrete", label: "Lembrete", icon: Bell, color: "text-orange-500" },
  { value: "insight", label: "Insight", icon: Lightbulb, color: "text-yellow-500" },
  { value: "alerta", label: "Alerta", icon: AlertTriangle, color: "text-red-500" },
];

const ClientNotes = ({ clienteId }: ClientNotesProps) => {
  const { gestor } = useGestor();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<string>("nota");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Fetch notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ["client-notes", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_notes" as any)
        .select("*, gestores(nome, foto_url)")
        .eq("cliente_id", clienteId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Note[];
    },
    enabled: !!clienteId,
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (data: { content: string; type: string }) => {
      const { error } = await supabase.from("client_notes" as any).insert({
        cliente_id: clienteId,
        gestor_id: gestor!.id,
        content: data.content,
        type: data.type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-notes", clienteId] });
      setNewNote("");
      setIsAddingNote(false);
      toast({ title: "Nota adicionada!", description: "Sua nota foi salva com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível adicionar a nota.", variant: "destructive" });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("client_notes" as any)
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-notes", clienteId] });
      toast({ title: "Nota atualizada!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível atualizar a nota.", variant: "destructive" });
    },
  });

  // Pin note mutation
  const pinNoteMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("client_notes" as any)
        .update({ is_pinned: isPinned })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-notes", clienteId] });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_notes" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-notes", clienteId] });
      toast({ title: "Nota excluída!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível excluir a nota.", variant: "destructive" });
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim() || !gestor) return;
    addNoteMutation.mutate({ content: newNote, type: noteType });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-primary" />
            Notas e Comentários
          </h2>
          <p className="text-sm text-muted-foreground">
            Histórico de anotações sobre este cliente
          </p>
        </div>
        {!isAddingNote && (
          <Button onClick={() => setIsAddingNote(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Nota
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      <AnimatePresence>
        {isAddingNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="vcd-card"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger className="w-40 bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {noteTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className={`w-4 h-4 ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Digite sua nota aqui..."
                className="min-h-[100px] bg-secondary border-border"
                autoFocus
              />

              <div className="flex gap-2">
                <Button 
                  onClick={handleAddNote} 
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                >
                  {addNoteMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    "Adicionar Nota"
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setIsAddingNote(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      {notes && notes.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                currentGestorId={gestor?.id || ""}
                onPin={(id, isPinned) => pinNoteMutation.mutate({ id, isPinned })}
                onDelete={(id) => deleteNoteMutation.mutate(id)}
                onEdit={(id, content) => updateNoteMutation.mutate({ id, content })}
                delay={index * 0.05}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="vcd-card text-center py-12"
        >
          <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma nota ainda
          </h3>
          <p className="text-muted-foreground mb-4">
            Adicione notas para registrar informações importantes sobre este cliente.
          </p>
          <Button onClick={() => setIsAddingNote(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeira Nota
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ClientNotes;
