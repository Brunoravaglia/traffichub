import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface LogoUploadProps {
  clienteId: string;
  currentLogoUrl?: string | null;
  onUpload: (url: string) => void;
}

const LogoUpload = ({ clienteId, currentLogoUrl, onUpload }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${clienteId}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("client-logos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("client-logos")
        .getPublicUrl(filePath);

      // Update client record
      const { error: updateError } = await supabase
        .from("clientes")
        .update({ logo_url: publicUrl })
        .eq("id", clienteId);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      onUpload(publicUrl);

      toast({
        title: "Logo atualizado!",
        description: "O logo do cliente foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do logo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const { error } = await supabase
        .from("clientes")
        .update({ logo_url: null })
        .eq("id", clienteId);

      if (error) throw error;

      setPreviewUrl(null);
      onUpload("");

      toast({
        title: "Logo removido",
        description: "O logo do cliente foi removido.",
      });
    } catch (error) {
      console.error("Remove error:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o logo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        Logo do Cliente
      </label>
      
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative">
            <div className="w-24 h-24 rounded-xl border border-border overflow-hidden bg-secondary">
              <img
                src={previewUrl}
                alt="Logo do cliente"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Upload</span>
          </div>
        )}

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mb-2"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {previewUrl ? "Trocar Logo" : "Selecionar Logo"}
          </Button>
          <p className="text-xs text-muted-foreground">
            PNG, JPG ou SVG. Máximo 2MB.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
