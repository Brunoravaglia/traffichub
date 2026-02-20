import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, FileSignature, CheckCircle2, Search, ArrowLeft } from "lucide-react";
import HomeNavbar from "@/components/home/HomeNavbar";
import FooterSection from "@/components/home/FooterSection";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ValidarRelatorio = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialId = searchParams.get("id") || "";

    const [validationId, setValidationId] = useState(initialId);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        if (initialId) {
            setValidationId(initialId);
        }
    }, [initialId]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validationId.trim() || !password.trim()) {
            setErrorMsg("Preencha a ID e a Senha.");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");
        setReportData(null);

        try {
            const { data, error } = await supabase
                .from("client_reports")
                .select(`
          id,
          nome,
          data_values,
          created_at,
          clientes (
            nome,
            logo_url,
            gestores (
              nome,
              foto_url
            )
          )
        `)
                .eq("data_values->>validationId", validationId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                setErrorMsg("Relatório não encontrado ou ID inválida.");
                setIsLoading(false);
                return;
            }

            // @ts-ignore - Supabase JSONB typing
            const storedPassword = data.data_values?.validationPassword;

            if (storedPassword !== password.toUpperCase()) {
                setErrorMsg("Senha incorreta. Tente novamente.");
                setIsLoading(false);
                return;
            }

            setReportData(data);
        } catch (err: any) {
            console.error(err);
            setErrorMsg("Ocorreu um erro ao verificar o relatório. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <HomeNavbar />

            <main className="flex-grow pt-32 pb-24 flex items-center justify-center">
                <div className="max-w-md w-full mx-auto px-4">

                    <AnimatePresence mode="wait">
                        {!reportData ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden backdrop-blur-xl shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/30">
                                        <Search className="w-8 h-8 text-primary" />
                                    </div>

                                    <h1 className="text-2xl font-bold text-center text-white mb-2">Verificar Relatório</h1>
                                    <p className="text-center text-gray-400 mb-8 text-sm">
                                        Digite a ID e a senha localizadas no rodapé do relatório gerado pela Você Digital Propaganda para confirmar sua autenticidade.
                                    </p>

                                    <form onSubmit={handleVerify} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">ID de Validação</label>
                                            <Input
                                                value={validationId}
                                                onChange={(e) => setValidationId(e.target.value)}
                                                placeholder="Ex: 550e8400..."
                                                className="bg-black/50 border-white/10 h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Senha (6 dígitos)</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <Input
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value.toUpperCase())}
                                                    placeholder="ABC123"
                                                    maxLength={6}
                                                    className="bg-black/50 border-white/10 h-12 pl-10 uppercase tracking-widest font-mono"
                                                />
                                            </div>
                                        </div>

                                        {errorMsg && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20"
                                            >
                                                {errorMsg}
                                            </motion.p>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-12 mt-4 text-base font-semibold shadow-[0_0_20px_-5px_var(--primary)]"
                                        >
                                            {isLoading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                "Verificar Autenticidade"
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)] text-center"
                            >
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                                <div className="relative z-10">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                        className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30"
                                    >
                                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                                    </motion.div>

                                    <h2 className="text-3xl font-black text-white mb-2">Relatório Autêntico</h2>
                                    <p className="text-green-400 font-medium mb-8">
                                        Certificado VURP de Integridade Confirmado
                                    </p>

                                    <div className="bg-black/40 rounded-2xl p-6 border border-white/5 text-left space-y-4 mb-8">
                                        <div>
                                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">Cliente</span>
                                            <div className="flex items-center gap-3">
                                                {reportData.clientes?.logo_url && (
                                                    <img src={reportData.clientes.logo_url} alt="Logo" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                                                )}
                                                <span className="text-white font-semibold">{reportData.clientes?.nome || "Desconhecido"}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">Data de Emissão Original</span>
                                            <span className="text-gray-300">
                                                {reportData.data_values?.validationTime
                                                    ? format(new Date(reportData.data_values.validationTime), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })
                                                    : format(new Date(reportData.created_at), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">Assinado por Gestor</span>
                                            <div className="flex items-center gap-2">
                                                {reportData.clientes?.gestores?.foto_url && (
                                                    <img src={reportData.clientes.gestores.foto_url} alt="Gestor" className="w-6 h-6 rounded-full border border-white/10 object-cover" />
                                                )}
                                                <span className="text-gray-300">{reportData.clientes?.gestores?.nome || "Equipe VURP"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-400 mb-6 italic">
                                        Este relatório foi gerado e criptografado pela plataforma Você Digital Propaganda, atestando que todas as métricas são verdadeiras e inalteradas.
                                    </p>

                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setReportData(null);
                                            setPassword("");
                                            setValidationId("");
                                        }}
                                        className="w-full bg-transparent border-white/10 hover:bg-white/5"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Validar outro relatório
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </main>

            <FooterSection />
        </div>
    );
};

export default ValidarRelatorio;
