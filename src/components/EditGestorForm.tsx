import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, Link as LinkIcon, Upload, X, Plus, Save, Camera } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GestorLink {
  label: string;
  url: string;
}

interface EditGestorFormProps {
  gestorId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditGestorForm = ({ gestorId, onClose, onSuccess }: EditGestorFormProps) => {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [links, setLinks] = useState<GestorLink[]>([]);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: gestor, isLoading } = useQuery({
    queryKey: ["gestor-edit", gestorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gestores")
        .select("*")
        .eq("id", gestorId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (gestor) {
      setNome(gestor.nome || "");
      setTelefone(gestor.telefone || "");
      const gestorLinks = gestor.links as unknown as GestorLink[] | null;
      setLinks(gestorLinks || []);
      setExistingFotoUrl(gestor.foto_url || null);
      setFotoPreview(gestor.foto_url || null);
    }
  }, [gestor]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 2MB.",
        variant: "destructive",
      });
      return;
    }

    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const removeFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setExistingFotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addLink = () => {
    setLinks([...links, { label: "", url: "" }]);
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateGestorMutation = useMutation({
    mutationFn: async () => {
      let fotoUrl = existingFotoUrl;

      // Upload new photo if provided
      if (fotoFile) {
        const fileExt = fotoFile.name.split(".").pop();
        const fileName = `gestor-${gestorId}-${Date.now()}.${fileExt}`;
        const filePath = `gestores/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("client-logos")
          .upload(filePath, fotoFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("client-logos")
            .getPublicUrl(filePath);
          fotoUrl = publicUrl;
        }
      }

      // Filter out empty links
      const validLinks = links.filter(link => link.label && link.url);

      // Determine if foto_preenchida should be true (has photo)
      const hasFoto = !!fotoUrl;

      const { error } = await supabase
        .from("gestores")
        .update({
          nome,
          telefone: telefone || null,
          foto_url: fotoUrl,
          links: validLinks as unknown as null,
          foto_preenchida: hasFoto,
        })
        .eq("id", gestorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gestores"] });
      queryClient.invalidateQueries({ queryKey: ["gestor", gestorId] });
      queryClient.invalidateQueries({ queryKey: ["gestor-edit", gestorId] });
      toast({
        title: "Gestor atualizado!",
        description: `${nome} foi atualizado com sucesso.`,
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar gestor",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha o nome do gestor.",
        variant: "destructive",
      });
      return;
    }
    updateGestorMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Foto do Gestor */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {fotoPreview ? (
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-primary/20 overflow-hidden bg-secondary">
                <img
                  src={fotoPreview}
                  alt="Foto do gestor"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeFoto}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Camera className="w-8 h-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Foto</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFotoChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {fotoPreview ? "Trocar Foto" : "Adicionar Foto"}
        </Button>
      </div>

      {/* Nome do Gestor */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Nome do Gestor
        </label>
        <Input
          placeholder="Digite o nome do gestor"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="h-12 bg-secondary border-border focus:border-primary"
        />
      </div>

      {/* Telefone */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          Telefone de Contato
        </label>
        <Input
          placeholder="Ex: (11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="h-12 bg-secondary border-border focus:border-primary"
        />
      </div>

      {/* Links */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-primary" />
          Links (Redes Sociais, Portfolio, etc.)
        </label>
        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Nome (ex: LinkedIn)"
                value={link.label}
                onChange={(e) => updateLink(index, "label", e.target.value)}
                className="flex-1 h-10 bg-secondary border-border focus:border-primary"
              />
              <Input
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateLink(index, "url", e.target.value)}
                className="flex-[2] h-10 bg-secondary border-border focus:border-primary"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLink(index)}
                className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLink}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Link
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={updateGestorMutation.isPending}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {updateGestorMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default EditGestorForm;
