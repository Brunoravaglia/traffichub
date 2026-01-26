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
import { Upload, Plus, X, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResizableImage } from "./ResizableImage";

export interface CustomSectionImage {
  id: string;
  url: string;
  name: string;
  width?: number;
  height?: number;
}

export interface CustomSection {
  id: string;
  title: string;
  images: CustomSectionImage[];
}

interface CustomSectionCardProps {
  section: CustomSection;
  onUpdate: (section: CustomSection) => void;
  onRemove: (id: string) => void;
  clienteId: string;
  maxImages?: number;
}

function CustomSectionCard({ section, onUpdate, onRemove, clienteId, maxImages = 5 }: CustomSectionCardProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const canAddMore = section.images.length < maxImages;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const imageIds = section.images.map((i) => i.id);
      const oldIndex = imageIds.indexOf(active.id as string);
      const newIndex = imageIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedImages = arrayMove(section.images, oldIndex, newIndex);
        onUpdate({ ...section, images: reorderedImages });
      }
    }
  };

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Apenas imagens são permitidas", variant: "destructive" });
        return;
      }

      if (section.images.length >= maxImages) {
        toast({ title: `Limite de ${maxImages} imagens atingido`, variant: "destructive" });
        return;
      }

      setUploading(true);
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${clienteId}/custom-sections/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("report-assets")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("report-assets")
          .getPublicUrl(fileName);

        const newImage: CustomSectionImage = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          url: urlData.publicUrl,
          name: file.name,
        };

        onUpdate({ ...section, images: [...section.images, newImage] });
        toast({ title: "Imagem adicionada!" });
      } catch (error: any) {
        toast({ title: "Erro ao fazer upload", description: error.message, variant: "destructive" });
      } finally {
        setUploading(false);
      }
    },
    [clienteId, section, maxImages, onUpdate]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (const file of Array.from(files)) {
      if (section.images.length >= maxImages) break;
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
      if (section.images.length >= maxImages) break;
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

  const handleRemoveImage = (id: string) => {
    onUpdate({ ...section, images: section.images.filter((i) => i.id !== id) });
  };

  const handleResizeImage = (id: string, width: number, height: number) => {
    onUpdate({
      ...section,
      images: section.images.map((i) => (i.id === id ? { ...i, width, height } : i)),
    });
  };

  const handleSaveTitle = () => {
    onUpdate({ ...section, title: editTitle });
    setIsEditingTitle(false);
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-8 text-lg font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setEditTitle(section.title);
                    setIsEditingTitle(false);
                  }
                }}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveTitle}>
                <Check className="w-4 h-4 text-green-500" />
              </Button>
            </div>
          ) : (
            <CardTitle className="text-lg flex items-center gap-2">
              {section.title}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsEditingTitle(true)}
              >
                <Pencil className="w-3 h-3 text-muted-foreground" />
              </Button>
            </CardTitle>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(section.id)}>
            <X className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex flex-wrap gap-4 p-4 rounded-lg transition-colors min-h-[200px]",
            isDragOver && "bg-muted/50 ring-2 ring-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={section.images.map((i) => i.id)} strategy={rectSortingStrategy}>
              {section.images.map((image) => (
                <ResizableImage
                  key={image.id}
                  id={image.id}
                  url={image.url}
                  name={image.name}
                  width={image.width}
                  height={image.height}
                  onRemove={handleRemoveImage}
                  onResize={handleResizeImage}
                />
              ))}
            </SortableContext>
          </DndContext>

          {canAddMore && (
            <label
              className={cn(
                "aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors cursor-pointer hover:border-primary hover:text-primary",
                isDragOver && "border-primary bg-muted/30"
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
      </CardContent>
    </Card>
  );
}

interface CustomSectionGridProps {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
  clienteId: string;
}

export function CustomSectionGrid({ sections, onChange, clienteId }: CustomSectionGridProps) {
  const addSection = () => {
    const newSection: CustomSection = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      title: "Nova Seção",
      images: [],
    };
    onChange([...sections, newSection]);
  };

  const updateSection = (updatedSection: CustomSection) => {
    onChange(sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)));
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <CustomSectionCard
          key={section.id}
          section={section}
          onUpdate={updateSection}
          onRemove={removeSection}
          clienteId={clienteId}
        />
      ))}
      <Button variant="outline" onClick={addSection} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Seção Personalizada
      </Button>
    </div>
  );
}
