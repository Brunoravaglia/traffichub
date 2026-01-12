import { useDraggable } from "@dnd-kit/core";
import { 
  Type, 
  LayoutDashboard, 
  Image, 
  BarChart3, 
  FileText, 
  Target, 
  Wallet,
  Images,
  Heading1,
  AlignLeft
} from "lucide-react";
import type { ReportBlockType } from "./types";

interface PaletteItem {
  type: ReportBlockType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const paletteItems: PaletteItem[] = [
  { type: 'header', label: 'Cabeçalho', icon: <Heading1 className="w-5 h-5" />, description: 'Logo e período' },
  { type: 'section-title', label: 'Título Seção', icon: <Type className="w-5 h-5" />, description: 'Tráfego Google/Meta' },
  { type: 'metric-row', label: 'Linha de Métricas', icon: <LayoutDashboard className="w-5 h-5" />, description: '5 métricas em linha' },
  { type: 'metric-card', label: 'Card de Métrica', icon: <LayoutDashboard className="w-5 h-5" />, description: 'Métrica individual' },
  { type: 'creative-gallery', label: 'Galeria Criativos', icon: <Images className="w-5 h-5" />, description: 'Posts com métricas' },
  { type: 'image', label: 'Imagem/Screenshot', icon: <Image className="w-5 h-5" />, description: 'Print ou gráfico' },
  { type: 'chart', label: 'Gráfico', icon: <BarChart3 className="w-5 h-5" />, description: 'Linha ou barra' },
  { type: 'objectives', label: 'Objetivos', icon: <Target className="w-5 h-5" />, description: 'Lista de objetivos' },
  { type: 'text', label: 'Texto', icon: <AlignLeft className="w-5 h-5" />, description: 'Parágrafo livre' },
  { type: 'balance-info', label: 'Saldos', icon: <Wallet className="w-5 h-5" />, description: 'Google/Meta Ads' },
  { type: 'footer', label: 'Rodapé', icon: <FileText className="w-5 h-5" />, description: 'Logo e contatos' },
];

function DraggablePaletteItem({ item }: { item: PaletteItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: {
      type: item.type,
      fromPalette: true,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-3 p-3 rounded-lg border border-border bg-card
        cursor-grab active:cursor-grabbing transition-all duration-200
        hover:border-primary/50 hover:bg-secondary/50
        ${isDragging ? 'opacity-50 ring-2 ring-primary' : ''}
      `}
    >
      <div className="p-2 rounded-md bg-primary/10 text-primary">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
      </div>
    </div>
  );
}

export function BlockPalette() {
  return (
    <div className="w-72 bg-card border-r border-border p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-foreground mb-4">Componentes</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Arraste os componentes para montar seu relatório
      </p>
      <div className="space-y-2">
        {paletteItems.map((item) => (
          <DraggablePaletteItem key={item.type} item={item} />
        ))}
      </div>
    </div>
  );
}
