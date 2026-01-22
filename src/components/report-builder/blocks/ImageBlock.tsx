import { Upload } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AspectRatioSelector,
  aspectRatioOptionToCss,
  type AspectRatioOption,
} from "@/components/report/AspectRatioSelector";
import type { ImageConfig } from "../types";

interface ImageBlockProps {
  config: ImageConfig;
  onUpdate?: (config: ImageConfig) => void;
  isEditing?: boolean;
}

export function ImageBlock({ config, onUpdate, isEditing }: ImageBlockProps) {
  const [uploading, setUploading] = useState(false);

  const aspectValue = ((config.aspectRatio as AspectRatioOption | undefined) ?? "auto") as AspectRatioOption;
  const aspectCss = aspectRatioOptionToCss(config.aspectRatio);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdate) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('report-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('report-assets')
        .getPublicUrl(filePath);

      onUpdate({ ...config, url: publicUrl });
      toast.success('Imagem carregada!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploading(false);
    }
  };

  if (!config.url && isEditing) {
    return (
      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
        <Upload className="w-10 h-10 text-muted-foreground mb-2" />
        <span className="text-sm text-muted-foreground">
          {uploading ? 'Carregando...' : 'Clique ou arraste uma imagem'}
        </span>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden">
        <div className="w-full" style={aspectCss ? { aspectRatio: aspectCss } : undefined}>
          <img
            src={config.url || "/placeholder.svg"}
            alt={config.caption || "Report image"}
            className={`w-full object-contain max-h-96 ${aspectCss ? "h-full" : "h-auto"}`}
          />
        </div>

        {isEditing && (
          <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-white text-sm">Trocar imagem</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {isEditing && onUpdate && (
        <div className="flex justify-center">
          <AspectRatioSelector
            value={aspectValue}
            onChange={(next) => onUpdate({ ...config, aspectRatio: next === "auto" ? undefined : next })}
          />
        </div>
      )}

      {config.caption && (
        <p className="text-center text-sm text-muted-foreground">
          {config.caption}
        </p>
      )}
    </div>
  );
}
