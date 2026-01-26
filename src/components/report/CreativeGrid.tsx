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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ResizableImage } from "./ResizableImage";

export interface Creative {
  id: string;
  url: string;
  name: string;
  platform: "google" | "meta";
  width?: number;
  height?: number;
}

interface CreativeGridProps {
  platform: "google" | "meta";
  creatives: Creative[];
  onChange: (creatives: Creative[]) => void;
  clienteId: string;
  maxCreatives?: number;
}

export function CreativeGrid({
  platform,
  creatives,
  onChange,
  clienteId,
  maxCreatives = 5,
}: CreativeGridProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const platformCreatives = creatives.filter((c) => c.platform === platform);
  const canAddMore = platformCreatives.length < maxCreatives;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const platformIds = platformCreatives.map((c) => c.id);
      const oldIndex = platformIds.indexOf(active.id as string);
      const newIndex = platformIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedPlatformCreatives = arrayMove(platformCreatives, oldIndex, newIndex);
        const otherCreatives = creatives.filter((c) => c.platform !== platform);
        onChange([...otherCreatives, ...reorderedPlatformCreatives]);
      }
    }
  };

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Apenas imagens são permitidas", variant: "destructive" });
        return;
      }

      if (platformCreatives.length >= maxCreatives) {
        toast({ title: `Limite de ${maxCreatives} criativos atingido`, variant: "destructive" });
        return;
      }

      setUploading(true);
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${clienteId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("report-assets")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("report-assets")
          .getPublicUrl(fileName);

        const newCreative: Creative = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          url: urlData.publicUrl,
          name: file.name,
          platform,
        };

        onChange([...creatives, newCreative]);
        toast({ title: "Criativo adicionado!" });
      } catch (error: any) {
        toast({ title: "Erro ao fazer upload", description: error.message, variant: "destructive" });
      } finally {
        setUploading(false);
      }
    },
    [clienteId, creatives, maxCreatives, onChange, platform, platformCreatives.length]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (const file of Array.from(files)) {
      if (platformCreatives.length >= maxCreatives) break;
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
      if (platformCreatives.length >= maxCreatives) break;
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
    onChange(creatives.filter((c) => c.id !== id));
  };

  const handleResize = (id: string, width: number, height: number) => {
    onChange(creatives.map((c) => (c.id === id ? { ...c, width, height } : c)));
  };

  const borderColor = platform === "google" ? "border-blue-500/50" : "border-purple-500/50";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-4 p-3 rounded-lg transition-colors",
        isDragOver && `bg-muted/50 ring-2 ${platform === "google" ? "ring-blue-500/50" : "ring-purple-500/50"}`
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={platformCreatives.map((c) => c.id)} strategy={rectSortingStrategy}>
          {platformCreatives.map((creative) => (
            <ResizableImage
              key={creative.id}
              id={creative.id}
              url={creative.url}
              name={creative.name}
              width={creative.width}
              height={creative.height}
              onRemove={handleRemove}
              onResize={handleResize}
            />
          ))}
        </SortableContext>
      </DndContext>

      {canAddMore && (
        <label
          className={cn(
            "w-[200px] h-[150px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors cursor-pointer",
            borderColor,
            platform === "google" ? "hover:border-blue-500 hover:text-blue-500" : "hover:border-purple-500 hover:text-purple-500",
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
