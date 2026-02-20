import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    Palette,
    Upload,
    Save,
    Eye,
    Hexagon,
    Layout,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGestor } from "@/contexts/GestorContext";
import { supabase } from "@/integrations/supabase/client";

const AgencySettings = () => {
    const { agencia, gestor } = useGestor();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: "",
        logo_url: "",
        logo_black_url: "",
        cor_primaria: "#10b981",
        cor_secundaria: "#059669",
    });

    useEffect(() => {
        if (agencia) {
            setFormData({
                nome: agencia.nome || "",
                logo_url: agencia.logo_url || "",
                logo_black_url: agencia.logo_black_url || "",
                cor_primaria: agencia.cor_primaria || "#10b981",
                cor_secundaria: agencia.cor_secundaria || "#059669",
            });
        }
    }, [agencia]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agencia) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("agencias")
                .update({
                    nome: formData.nome,
                    logo_url: formData.logo_url,
                    logo_black_url: formData.logo_black_url,
                    cor_primaria: formData.cor_primaria,
                    cor_secundaria: formData.cor_secundaria,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", agencia.id);

            if (error) throw error;

            toast({
                title: "Sucesso!",
                description: "Configurações da agência atualizadas com sucesso.",
            });

            // Reload to apply colors globally if needed, or rely on Context refresh
            window.location.reload();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: error.message || "Não foi possível atualizar as configurações.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!gestor?.is_admin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <AlertCircle className="w-16 h-16 text-destructive mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
                <p className="text-muted-foreground max-w-md">
                    Esta área é restrita a administradores da agência. Se você acredita que deveria ter acesso, entre em contato com o suporte.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Configurações da Agência
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Personalize a identidade visual e o white-label do seu portal
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-primary hover:brightness-110 shadow-lg shadow-primary/20 min-w-[140px]"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Side */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="vcd-card space-y-8"
                        >
                            {/* Basic Info */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary/80 uppercase tracking-wider">
                                    <Layout className="w-4 h-4" />
                                    Informações Básicas
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="agencyName">Nome da Agência</Label>
                                        <Input
                                            id="agencyName"
                                            value={formData.nome}
                                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                            placeholder="Ex: Minha Agência Digital"
                                            className="bg-secondary/50 border-border"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Identity Colors */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary/80 uppercase tracking-wider">
                                    <Palette className="w-4 h-4" />
                                    Kit de Cores (KV)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                                        <Label className="flex items-center justify-between">
                                            <span>Cor Primária</span>
                                            <span className="text-xs font-mono text-muted-foreground uppercase">{formData.cor_primaria}</span>
                                        </Label>
                                        <div className="flex gap-4 items-center">
                                            <div
                                                className="w-12 h-12 rounded-xl border border-border/50 shadow-inner"
                                                style={{ backgroundColor: formData.cor_primaria }}
                                            />
                                            <Input
                                                type="color"
                                                value={formData.cor_primaria}
                                                onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
                                                className="h-10 w-full bg-transparent border-none cursor-pointer p-0"
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Usada em botões, ícones ativos e elementos principais.
                                        </p>
                                    </div>

                                    <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                                        <Label className="flex items-center justify-between">
                                            <span>Cor Secundária</span>
                                            <span className="text-xs font-mono text-muted-foreground uppercase">{formData.cor_secundaria}</span>
                                        </Label>
                                        <div className="flex gap-4 items-center">
                                            <div
                                                className="w-12 h-12 rounded-xl border border-border/50 shadow-inner"
                                                style={{ backgroundColor: formData.cor_secundaria }}
                                            />
                                            <Input
                                                type="color"
                                                value={formData.cor_secundaria}
                                                onChange={(e) => setFormData({ ...formData, cor_secundaria: e.target.value })}
                                                className="h-10 w-full bg-transparent border-none cursor-pointer p-0"
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Usada em bordas sutis e elementos decorativos.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Branding Logos */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary/80 uppercase tracking-wider">
                                    <ImageIcon className="w-4 h-4" />
                                    Logotipos
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="logoUrl">URL do Logotipo (Claro/SVG)</Label>
                                        <div className="flex gap-3">
                                            <Input
                                                id="logoUrl"
                                                value={formData.logo_url}
                                                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                                placeholder="https://sua-agencia.com/logo.svg"
                                                className="bg-secondary/50 border-border"
                                            />
                                            <Button variant="outline" size="icon" className="shrink-0 border-border/50">
                                                <Upload className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Logotipo principal usado em fundos escuros.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="logoBlackUrl">URL do Logotipo (Escuro/Contraste)</Label>
                                        <div className="flex gap-3">
                                            <Input
                                                id="logoBlackUrl"
                                                value={formData.logo_black_url}
                                                onChange={(e) => setFormData({ ...formData, logo_black_url: e.target.value })}
                                                placeholder="https://sua-agencia.com/logo-black.svg"
                                                className="bg-secondary/50 border-border"
                                            />
                                            <Button variant="outline" size="icon" className="shrink-0 border-border/50">
                                                <Upload className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Versão para fundos claros/brancos (Sidebar e Login Card).
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    </div>

                    {/* Preview Side */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-6"
                        >
                            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-primary/80 uppercase tracking-wider">
                                <Eye className="w-4 h-4" />
                                Live Preview
                            </div>

                            <div className="space-y-6">
                                {/* Login Preview */}
                                <div className="vcd-card p-0 overflow-hidden bg-zinc-950 border-white/5">
                                    <div className="p-3 bg-zinc-900 border-b border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Login View</span>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col items-center gap-6">
                                        <div
                                            className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl"
                                            style={{ boxShadow: `0 20px 40px -15px ${formData.cor_primaria}44` }}
                                        >
                                            {formData.logo_black_url || formData.logo_url ? (
                                                <img
                                                    src={formData.logo_black_url || formData.logo_url}
                                                    alt="Preview"
                                                    className="h-10 w-auto object-contain"
                                                />
                                            ) : (
                                                <Hexagon className="w-10 h-10 text-zinc-700" />
                                            )}
                                        </div>
                                        <div className="w-full space-y-3">
                                            <div className="h-8 w-full rounded-md bg-white/5 animate-pulse" />
                                            <Button
                                                disabled
                                                className="w-full"
                                                style={{ backgroundColor: formData.cor_primaria }}
                                            >
                                                Acessar Portal
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Preview */}
                                <div className="vcd-card p-0 overflow-hidden bg-card border-border/50">
                                    <div className="p-3 bg-secondary/50 border-b border-border/50 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Sidebar View</span>
                                    </div>
                                    <div className="p-4 flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center p-1 border border-border/50"
                                            >
                                                {formData.logo_black_url ? (
                                                    <img src={formData.logo_black_url} className="h-full w-full object-contain" />
                                                ) : (
                                                    <Layout className="w-4 h-4 text-zinc-400" />
                                                )}
                                            </div>
                                            <div className="h-2 w-24 rounded bg-muted animate-pulse" />
                                        </div>
                                        <div className="space-y-2">
                                            <div
                                                className="h-8 w-full rounded-md bg-primary/10 border-l-2 border-primary flex items-center px-3"
                                                style={{
                                                    backgroundColor: `${formData.cor_primaria}11`,
                                                    borderColor: formData.cor_primaria
                                                }}
                                            >
                                                <div className="h-1.5 w-16 rounded bg-primary/40" style={{ backgroundColor: `${formData.cor_primaria}44` }} />
                                            </div>
                                            <div className="h-8 w-full rounded-md bg-transparent flex items-center px-3">
                                                <div className="h-1.5 w-20 rounded bg-muted" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgencySettings;
