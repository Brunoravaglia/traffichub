import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportBlock } from "./types";
import {
  HeaderBlock,
  SectionTitleBlock,
  MetricRowBlock,
  CreativeGalleryBlock,
  ImageBlock,
  ObjectivesBlock,
  BalanceInfoBlock,
  FooterBlock,
  TextBlock,
  ChartBlock,
} from "./blocks";

interface SortableBlockProps {
  block: ReportBlock;
  onUpdate: (id: string, config: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onOpenConfig: (id: string) => void;
  isEditing: boolean;
}

export function SortableBlock({ block, onUpdate, onDelete, onOpenConfig, isEditing }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderBlock = () => {
    const commonProps = {
      onUpdate: handleConfigUpdate,
      isEditing,
    };

    switch (block.type) {
      case 'header':
        return <HeaderBlock config={block.config as any} {...commonProps} />;
      case 'section-title':
        return <SectionTitleBlock config={block.config as any} {...commonProps} />;
      case 'metric-row':
        return <MetricRowBlock config={block.config as any} {...commonProps} />;
      case 'metric-card':
        return <MetricRowBlock config={{ title: '', platform: 'google', metrics: [block.config as any] }} {...commonProps} />;
      case 'creative-gallery':
        return <CreativeGalleryBlock config={block.config as any} {...commonProps} />;
      case 'image':
        return <ImageBlock config={block.config as any} {...commonProps} />;
      case 'objectives':
        return <ObjectivesBlock config={block.config as any} {...commonProps} />;
      case 'balance-info':
        return <BalanceInfoBlock config={block.config as any} {...commonProps} />;
      case 'footer':
        return <FooterBlock config={block.config as any} {...commonProps} />;
      case 'text':
        return <TextBlock config={block.config as any} {...commonProps} />;
      case 'chart':
        return <ChartBlock config={block.config as any} {...commonProps} />;
      default:
        return <div className="p-4 text-muted-foreground">Bloco desconhecido</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group
        ${isDragging ? 'opacity-50 z-50' : ''}
        ${isEditing ? 'hover:ring-2 hover:ring-primary/30 rounded-xl' : ''}
      `}
    >
      {/* Controls overlay */}
      {isEditing && (
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="p-2 rounded-lg bg-secondary hover:bg-primary/20 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenConfig(block.id)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {renderBlock()}
    </div>
  );
}
