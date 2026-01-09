import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Check, Phone, Link as LinkIcon, Plus, X, Upload, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VCDLogo from "./VCDLogo";

interface GestorLink {
  label: string;
  url: string;
}

const CreateGestorForm = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [links, setLinks] = useState<GestorLink[]>([]);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("O tamanho máximo é 2MB.");
      return;
    }

    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const removeFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast.error("Nome do gestor é obrigatório");
      return;
    }

    setIsLoading(true);

    try {
      // First create the gestor
      const validLinks = links.filter(link => link.label && link.url);
      const { data: gestorData, error: gestorError } = await supabase
        .from("gestores")
        .insert([{ 
          nome: nome.trim(),
          telefone: telefone.trim() || null,
          links: validLinks as unknown as null,
        }])
        .select()
        .single();

      if (gestorError) throw gestorError;

      // Upload photo if provided
      if (fotoFile && gestorData) {
        const fileExt = fotoFile.name.split(".").pop();
        const fileName = `gestor-${gestorData.id}-${Date.now()}.${fileExt}`;
        const filePath = `gestores/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("client-logos")
          .upload(filePath, fotoFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("client-logos")
            .getPublicUrl(filePath);

          await supabase
            .from("gestores")
            .update({ foto_url: publicUrl })
            .eq("id", gestorData.id);
        }
      }

      toast.success("Gestor cadastrado com sucesso!");
      setNome("");
      setTelefone("");
      setLinks([]);
      setFotoFile(null);
      setFotoPreview(null);
    } catch (error) {
      console.error("Erro ao cadastrar gestor:", error);
      toast.error("Erro ao cadastrar gestor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <VCDLogo size="sm" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Novo Gestor
            </h1>
            <p className="text-muted-foreground">
              Cadastre um novo gestor de tráfego
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="vcd-card p-6">
              <div className="space-y-6">
                {/* Foto do Gestor */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {fotoPreview ? (
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden bg-secondary">
                          <img
                            src={fotoPreview}
                            alt="Foto do gestor"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeFoto}
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-full border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Camera className="w-6 h-6 text-muted-foreground" />
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

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Gestor</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite o nome do gestor"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Telefone de Contato
                  </Label>
                  <Input
                    id="telefone"
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="bg-background/50"
                  />
                </div>

                {/* Links */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-primary" />
                    Links (Redes Sociais, Portfolio, etc.)
                  </Label>
                  <div className="space-y-3">
                    {links.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Nome (ex: LinkedIn)"
                          value={link.label}
                          onChange={(e) => updateLink(index, "label", e.target.value)}
                          className="flex-1 h-10 bg-background/50"
                        />
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => updateLink(index, "url", e.target.value)}
                          className="flex-[2] h-10 bg-background/50"
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
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                "Cadastrando..."
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Cadastrar Gestor
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateGestorForm;
