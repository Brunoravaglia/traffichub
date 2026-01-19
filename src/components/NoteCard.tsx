import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Pin, 
  PinOff, 
  Trash2, 
  Edit3, 
  MessageSquare, 
  Bell, 
  Lightbulb, 
  AlertTriangle,
  MoreHorizontal,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Note {
  id: string;
  cliente_id: string;
  gestor_id: string;
  content: string;
  type: "nota" | "lembrete" | "insight" | "alerta";
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  gestores?: {
    nome: string;
    foto_url: string | null;
  };
}

interface NoteCardProps {
  note: Note;
  currentGestorId: string;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  delay?: number;
}

const noteTypeConfig = {
  nota: {
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Nota",
  },
  lembrete: {
    icon: Bell,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    label: "Lembrete",
  },
  insight: {
    icon: Lightbulb,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Insight",
  },
  alerta: {
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Alerta",
  },
};

const NoteCard = ({ note, currentGestorId, onPin, onDelete, onEdit, delay = 0 }: NoteCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  
  const config = noteTypeConfig[note.type] || noteTypeConfig.nota;
  const Icon = config.icon;
  const isOwner = note.gestor_id === currentGestorId;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `Hoje às ${format(date, "HH:mm", { locale: ptBR })}`;
    } else if (diffInHours < 48) {
      return `Ontem às ${format(date, "HH:mm", { locale: ptBR })}`;
    } else {
      return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(note.id, editContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay }}
      className={`vcd-card relative ${note.is_pinned ? "border-primary/30 bg-primary/5" : ""}`}
    >
      {/* Pin indicator */}
      {note.is_pinned && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Pin className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {note.gestores?.foto_url ? (
            <img
              src={note.gestores.foto_url}
              alt={note.gestores.nome}
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {note.gestores?.nome?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-foreground">
              {note.gestores?.nome || "Gestor"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(note.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Type badge */}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${config.bgColor} ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>

          {/* Actions dropdown (only for owner) */}
          {isOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={() => onPin(note.id, !note.is_pinned)}>
                  {note.is_pinned ? (
                    <>
                      <PinOff className="w-4 h-4 mr-2" />
                      Desafixar
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4 mr-2" />
                      Fixar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(note.id)}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[80px] bg-secondary border-border"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit}>
              <Check className="w-4 h-4 mr-1" />
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap">
          {note.content}
        </p>
      )}
    </motion.div>
  );
};

export default NoteCard;
