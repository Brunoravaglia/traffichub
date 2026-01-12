import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FileText } from "lucide-react";
import { SortableBlock } from "./SortableBlock";
import type { ReportBlock } from "./types";

interface ReportCanvasProps {
  blocks: ReportBlock[];
  onUpdateBlock: (id: string, config: Record<string, unknown>) => void;
  onDeleteBlock: (id: string) => void;
  onOpenConfig: (id: string) => void;
  isEditing: boolean;
}

export function ReportCanvas({ blocks, onUpdateBlock, onDeleteBlock, onOpenConfig, isEditing }: ReportCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'report-canvas',
  });

  return (
    <div className="flex-1 overflow-auto p-6 bg-background">
      <div 
        ref={setNodeRef}
        className={`
          max-w-3xl mx-auto min-h-[800px] bg-[#0B0B0B] rounded-2xl shadow-2xl overflow-hidden
          ${isOver ? 'ring-2 ring-primary ring-dashed' : ''}
        `}
      >
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
            <FileText className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Arraste componentes aqui</p>
            <p className="text-sm">Construa seu relatório arrastando itens da paleta</p>
          </div>
        ) : (
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="p-4 space-y-4">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onUpdate={onUpdateBlock}
                  onDelete={onDeleteBlock}
                  onOpenConfig={onOpenConfig}
                  isEditing={isEditing}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
