import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Upload, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AspectRatioSelector,
  aspectRatioOptionToCss,
  type AspectRatioOption,
} from "./AspectRatioSelector";

export interface AdPanelImage {
  id: string;
  url: string;
  name: string;
  platform: "google" | "meta";
  aspectRatio?: AspectRatioOption;
}

interface SortableAdPanelProps {
  image: AdPanelImage;
  onRemove: (id: string) => void;
  onAspectRatioChange: (id: string, ratio: AspectRatioOption | undefined) => void;
}

function SortableAdPanel({ image, onRemove, onAspectRatioChange }: SortableAdPanelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const aspectCss = aspectRatioOptionToCss(image.aspectRatio);

  return (
    <div ref={setNodeRef} style={style} className="space-y-2">
      <div
        className={cn(
          "relative group rounded-lg overflow-hidden border border-border",
          isDragging && "ring-2 ring-primary shadow-lg"
        )}
        style={aspectCss ? { aspectRatio: aspectCss } : undefined}
      >
        <img
          src={image.url}
          alt={image.name}
          className={cn("w-full object-contain", aspectCss ? "h-full" : "h-auto")}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1.5 bg-background/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-2 right-2 p-1 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4 text-destructive-foreground" />
        </button>
      </div>
      <AspectRatioSelector
        value={image.aspectRatio || "auto"}
        onChange={(next) => onAspectRatioChange(image.id, next === "auto" ? undefined : next)}
        className="justify-start"
      />
    </div>
  );
}

interface AdPanelGridProps {
  platform: "google" | "meta";
  images: AdPanelImage[];
  onChange: (images: AdPanelImage[]) => void;
  clienteId: string;
  maxImages?: number;
}

export function AdPanelGrid({
  platform,
  images,
  onChange,
  clienteId,
  maxImages = 3,
}: AdPanelGridProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const platformImages = images.filter((i) => i.platform === platform);
  const canAddMore = platformImages.length < maxImages;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const platformIds = platformImages.map((i) => i.id);
      const oldIndex = platformIds.indexOf(active.id as string);
      const newIndex = platformIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedPlatformImages = arrayMove(platformImages, oldIndex, newIndex);
        const otherImages = images.filter((i) => i.platform !== platform);
        onChange([...otherImages, ...reorderedPlatformImages]);
      }
    }
  };

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Apenas imagens são permitidas", variant: "destructive" });
        return;
      }

      if (platformImages.length >= maxImages) {
        toast({ title: `Limite de ${maxImages} painéis atingido`, variant: "destructive" });
        return;
      }

      setUploading(true);
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${clienteId}/ad-panels/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("report-assets")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("report-assets")
          .getPublicUrl(fileName);

        const newImage: AdPanelImage = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          url: urlData.publicUrl,
          name: file.name,
          platform,
        };

        onChange([...images, newImage]);
        toast({ title: "Painel adicionado!" });
      } catch (error: any) {
        toast({ title: "Erro ao fazer upload", description: error.message, variant: "destructive" });
      } finally {
        setUploading(false);
      }
    },
    [clienteId, images, maxImages, onChange, platform, platformImages.length]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (const file of Array.from(files)) {
      if (platformImages.length >= maxImages) break;
      await uploadFile(file);
    }
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (!files.length) return;

    for (const file of Array.from(files)) {
      if (platformImages.length >= maxImages) break;
      await uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canAddMore) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = (id: string) => {
    onChange(images.filter((i) => i.id !== id));
  };

  const handleAspectRatioChange = (id: string, ratio: AspectRatioOption | undefined) => {
    onChange(images.map((i) => (i.id === id ? { ...i, aspectRatio: ratio } : i)));
  };

  const borderColor = platform === "google" ? "border-blue-500/50" : "border-purple-500/50";
  const hoverBorderColor = platform === "google" ? "hover:border-blue-500" : "hover:border-purple-500";
  const ringColor = platform === "google" ? "ring-blue-500/50" : "ring-purple-500/50";

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-3 p-3 rounded-lg transition-colors",
        isDragOver && `bg-muted/50 ring-2 ${ringColor}`
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={platformImages.map((i) => i.id)} strategy={rectSortingStrategy}>
          {platformImages.map((image) => (
            <SortableAdPanel
              key={image.id}
              image={image}
              onRemove={handleRemove}
              onAspectRatioChange={handleAspectRatioChange}
            />
          ))}
        </SortableContext>
      </DndContext>

      {canAddMore && (
        <label
          className={cn(
            "aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors cursor-pointer",
            borderColor,
            hoverBorderColor,
            isDragOver && `${borderColor} bg-muted/30`
          )}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-xs text-center px-2">
                {isDragOver ? "Solte aqui" : "Arraste ou clique"}
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
