import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { Save, FileDown, FolderOpen, Eye, Pencil, Plus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlockPalette } from "./BlockPalette";
import { ReportCanvas } from "./ReportCanvas";
import { BlockConfigDialog } from "./BlockConfigDialog";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReportBlock, ReportBlockType } from "./types";
import type { Json } from "@/integrations/supabase/types";

const getDefaultConfig = (type: ReportBlockType): Record<string, unknown> => {
  switch (type) {
    case 'header':
      return { clientName: '', clientLogo: '', periodStart: '', periodEnd: '', title: 'RESULTADOS DAS CAMPANHAS' };
    case 'section-title':
      return { title: 'TRÁFEGO GOOGLE', platform: 'google' };
    case 'metric-row':
      return {
        title: '',
        platform: 'google',
        metrics: [
          { icon: 'click', label: 'Cliques', value: '0' },
          { icon: 'eye', label: 'Impressões', value: '0' },
          { icon: 'message', label: 'Conversões', value: '0' },
          { icon: 'dollar', label: 'Custo por Lead', value: 'R$ 0' },
          { icon: 'dollar', label: 'Investidos', value: 'R$ 0' },
        ]
      };
    case 'metric-card':
      return { icon: 'click', label: 'Métrica', value: '0' };
    case 'creative-gallery':
      return { title: 'TRÁFEGO META ADS', images: [] };
    case 'image':
      return { url: '', caption: '' };
    case 'objectives':
      return { objectives: ['Captar leads mais qualificados'], description: 'Abaixo segue o resumo de todos os resultados que obtivemos durante este período.' };
    case 'balance-info':
      return { googleBalance: 'R$ 0,00', metaBalance: 'R$ 0,00' };
    case 'footer':
      return { companyName: 'Você Digital', instagram: '@vocedigitalpropaganda', website: 'www.vocedigitalpropaganda.com.br' };
    case 'text':
      return { content: '', variant: 'paragraph' };
    case 'chart':
      return { type: 'line', title: 'Performance', data: [] };
    default:
      return {};
  }
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface ReportBuilderProps {
  clienteId?: string;
  reportId?: string;
}

export function ReportBuilder({ clienteId, reportId }: ReportBuilderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [blocks, setBlocks] = useState<ReportBlock[]>([]);
  const [reportName, setReportName] = useState('Novo Relatório');
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [configDialogBlock, setConfigDialogBlock] = useState<ReportBlock | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch existing report if editing
  const { data: existingReport } = useQuery({
    queryKey: ['client-report', reportId],
    queryFn: async () => {
      if (!reportId) return null;
      const { data, error } = await supabase
        .from('client_reports')
        .select('*')
        .eq('id', reportId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!reportId,
  });

  // Load existing report data
  useState(() => {
    if (existingReport) {
      setReportName(existingReport.nome);
      setPeriodoInicio(existingReport.periodo_inicio);
      setPeriodoFim(existingReport.periodo_fim);
      setBlocks((existingReport.layout as unknown as ReportBlock[]) || []);
    }
  });

  // Fetch client info
  const { data: cliente } = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) return null;
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clienteId,
  });

  // Save report mutation
  const saveReportMutation = useMutation({
    mutationFn: async () => {
      if (!clienteId) throw new Error('Cliente não selecionado');

      const reportData = {
        cliente_id: clienteId,
        nome: reportName,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        layout: blocks as unknown as Json,
        data_values: {} as Json,
      };

      if (reportId) {
        const { error } = await supabase
          .from('client_reports')
          .update(reportData)
          .eq('id', reportId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('client_reports')
          .insert(reportData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Relatório salvo com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['client-reports'] });
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      if (error?.message?.includes('Limite de relatórios')) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao salvar relatório. Verifique os dados e tente novamente.');
      }
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // If dragging from palette
    if (active.data.current?.fromPalette) {
      const blockType = active.data.current.type as ReportBlockType;
      const newBlock: ReportBlock = {
        id: generateId(),
        type: blockType,
        config: getDefaultConfig(blockType),
      };

      // Find position to insert
      const overId = over.id as string;
      if (overId === 'report-canvas') {
        setBlocks([...blocks, newBlock]);
      } else {
        const overIndex = blocks.findIndex(b => b.id === overId);
        if (overIndex >= 0) {
          const newBlocks = [...blocks];
          newBlocks.splice(overIndex, 0, newBlock);
          setBlocks(newBlocks);
        } else {
          setBlocks([...blocks, newBlock]);
        }
      }
      return;
    }

    // Reordering existing blocks
    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUpdateBlock = useCallback((id: string, config: Record<string, unknown>) => {
    setBlocks(blocks => blocks.map(b => b.id === id ? { ...b, config } : b));
  }, []);

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks(blocks => blocks.filter(b => b.id !== id));
  }, []);

  const handleOpenConfig = useCallback((id: string) => {
    const block = blocks.find(b => b.id === id);
    if (block) setConfigDialogBlock(block);
  }, [blocks]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <Input
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          className="max-w-xs font-semibold"
          placeholder="Nome do relatório"
        />

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={periodoInicio}
            onChange={(e) => setPeriodoInicio(e.target.value)}
            className="w-36"
          />
          <span className="text-muted-foreground">até</span>
          <Input
            type="date"
            value={periodoFim}
            onChange={(e) => setPeriodoFim(e.target.value)}
            className="w-36"
          />
        </div>

        <div className="flex-1" />

        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <Eye className="w-4 h-4 mr-2" /> : <Pencil className="w-4 h-4 mr-2" />}
          {isEditing ? 'Preview' : 'Editar'}
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={() => saveReportMutation.mutate()}
          disabled={saveReportMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {isEditing && <BlockPalette />}

          <ReportCanvas
            blocks={blocks}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onOpenConfig={handleOpenConfig}
            isEditing={isEditing}
          />
        </DndContext>
      </div>

      <BlockConfigDialog
        block={configDialogBlock}
        open={!!configDialogBlock}
        onClose={() => setConfigDialogBlock(null)}
        onSave={(config) => {
          if (configDialogBlock) {
            handleUpdateBlock(configDialogBlock.id, config);
          }
        }}
      />
    </div>
  );
}
