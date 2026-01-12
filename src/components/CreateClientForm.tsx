import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Briefcase, DollarSign, Target, Share2, Upload, X, Image as ImageIcon, Phone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import VCDLogo from "./VCDLogo";
import { cn } from "@/lib/utils";

const REDES_SOCIAIS = [
  { id: "meta", label: "Meta Ads (Facebook/Instagram)" },
  { id: "google", label: "Google Ads" },
  { id: "tiktok", label: "TikTok Ads" },
  { id: "linkedin", label: "LinkedIn Ads" },
  { id: "youtube", label: "YouTube Ads" },
  { id: "twitter", label: "Twitter/X Ads" },
  { id: "pinterest", label: "Pinterest Ads" },
];

const CreateClientForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [gestorId, setGestorId] = useState("");
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [redesSociais, setRedesSociais] = useState<string[]>([]);
  const [investimentoMensal, setInvestimentoMensal] = useState("");
  const [expectativaResultados, setExpectativaResultados] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const { data: gestores } = useQuery({
    queryKey: ["gestores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gestores").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const toggleRedeSocial = (id: string) => {
    setRedesSociais(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const createClientMutation = useMutation({
    mutationFn: async () => {
      // First create the client
      const { data: clientData, error: clientError } = await supabase
        .from("clientes")
        .insert({
          nome,
          gestor_id: gestorId,
          data_inicio: format(dataInicio, "yyyy-MM-dd"),
          redes_sociais: redesSociais,
          investimento_mensal: investimentoMensal ? parseFloat(investimentoMensal) : 0,
          expectativa_resultados: expectativaResultados,
          telefone_contato: telefoneContato || null,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Upload logo if provided
      if (logoFile && clientData) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${clientData.id}-${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("client-logos")
          .upload(filePath, logoFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("client-logos")
            .getPublicUrl(filePath);

          // Update client with logo URL
          await supabase
            .from("clientes")
            .update({ logo_url: publicUrl })
            .eq("id", clientData.id);
        }
      }

      return clientData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast({
        title: "Cliente criado!",
        description: `${nome} foi adicionado com sucesso.`,
      });
      navigate(`/cliente/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Erro ao criar cliente",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !gestorId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e gestor.",
        variant: "destructive",
      });
      return;
    }
    createClientMutation.mutate();
  };

  return (
    <div className="min-h-full bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Criar Novo Cliente
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados para iniciar o checklist
          </p>
        </div>

          <motion.form
            onSubmit={handleSubmit}
            className="vcd-card space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {/* Nome do Cliente */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Nome do Cliente
              </label>
              <Input
                placeholder="Ex: Empresa XYZ"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-12 bg-secondary border-border focus:border-primary"
              />
            </div>

            {/* Telefone de Contato */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Telefone de Contato
              </label>
              <Input
                placeholder="Ex: (11) 99999-9999"
                value={telefoneContato}
                onChange={(e) => setTelefoneContato(e.target.value)}
                className="h-12 bg-secondary border-border focus:border-primary"
              />
            </div>

            {/* Gestor Responsável */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Gestor Responsável
              </label>
              <Select value={gestorId} onValueChange={setGestorId}>
                <SelectTrigger className="h-12 bg-secondary border-border focus:border-primary">
                  <SelectValue placeholder="Selecione o gestor" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {gestores?.map((gestor) => (
                    <SelectItem key={gestor.id} value={gestor.id}>
                      {gestor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data de Início */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Data de Início
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start text-left font-normal bg-secondary border-border hover:bg-secondary/80"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {format(dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dataInicio}
                    onSelect={(date) => date && setDataInicio(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                Redes Sociais que Anuncia
              </label>
              <div className="grid grid-cols-2 gap-3">
                {REDES_SOCIAIS.map((rede) => (
                  <label
                    key={rede.id}
                    htmlFor={`rede-${rede.id}`}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      redesSociais.includes(rede.id)
                        ? "bg-primary/10 border-primary"
                        : "bg-secondary border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      id={`rede-${rede.id}`}
                      checked={redesSociais.includes(rede.id)}
                      onCheckedChange={() => toggleRedeSocial(rede.id)}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm text-foreground">{rede.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Logo do Cliente */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Logo do Cliente
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-xl border border-border overflow-hidden bg-secondary">
                      <img
                        src={logoPreview}
                        alt="Preview do logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
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
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoPreview ? "Trocar Logo" : "Selecionar Logo"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG ou SVG. Máximo 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Investimento Mensal */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Investimento Mensal (R$)
              </label>
              <Input
                type="number"
                placeholder="Ex: 5000"
                value={investimentoMensal}
                onChange={(e) => setInvestimentoMensal(e.target.value)}
                className="h-12 bg-secondary border-border focus:border-primary"
              />
            </div>

            {/* Expectativa de Resultados */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Expectativa de Resultados
              </label>
              <Textarea
                placeholder="Descreva as expectativas do cliente..."
                value={expectativaResultados}
                onChange={(e) => setExpectativaResultados(e.target.value)}
                className="min-h-[100px] bg-secondary border-border focus:border-primary resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createClientMutation.isPending}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow transition-all duration-200 hover:scale-[1.02]"
            >
              {createClientMutation.isPending ? (
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Criar Cliente"
              )}
            </Button>
          </motion.form>
        </motion.div>
      </div>
    );
};

export default CreateClientForm;