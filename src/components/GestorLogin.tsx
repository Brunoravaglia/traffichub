import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Home, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VCDLogo from "./VCDLogo";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";

interface GestorOption {
  id: string;
  nome: string;
  foto_url: string | null;
}

const GestorLogin = () => {
  const { login, agencia, setAgenciaBySlug } = useGestor();
  const [gestores, setGestores] = useState<GestorOption[]>([]);
  const [selectedGestorId, setSelectedGestorId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [agencySlug, setAgencySlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Fetch gestores only when agency is selected
  useEffect(() => {
    const fetchGestores = async () => {
      if (!agencia) return;

      setIsFetching(true);
      const { data, error } = await (supabase
        .from("gestores")
        .select("id, nome, foto_url")
        .eq("agencia_id", agencia.id)
        .order("nome") as any);

      if (!error && data) {
        setGestores(data);
      }
      setIsFetching(false);
    };

    fetchGestores();
  }, [agencia]);

  const handleAgencySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencySlug) return;

    setIsLoading(true);
    setError(null);
    const result = await setAgenciaBySlug(agencySlug);
    if (!result.success) {
      setError(result.error || "Agência não encontrada");
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      console.error("Google login error:", error.message);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGestorId) {
      setError("Selecione um gestor");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await login(selectedGestorId, password);

    if (!result.success) {
      setError(result.error || "Erro ao fazer login");
      setIsLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  const selectedGestor = gestores.find((g) => g.id === selectedGestorId);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="vcd-card border-primary/20 animate-glow-pulse">
          <div className="flex flex-col items-center gap-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-4">
              {agencia ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    {agencia.logo_url ? (
                      <div className="h-24 w-48 flex items-center justify-center p-2 rounded-xl bg-white/50 backdrop-blur-sm self-center">
                        <img
                          src={agencia.logo_url}
                          alt={agencia.nome}
                          className="h-full w-full object-contain filter drop-shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                        <Home className="w-10 h-10 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground">{agencia.nome}</h2>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs text-muted-foreground h-auto p-0"
                      onClick={() => window.location.reload()}
                    >
                      Trocar agência
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <VCDLogo size="lg" />
              )}
            </div>

            {/* Title / Form Section */}
            <AnimatePresence mode="wait">
              {!agencia ? (
                <motion.div
                  key="agency-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-full space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      Bem-vindo ao Vurp
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Digite o identificador da sua agência para continuar
                    </p>
                  </div>

                  <form onSubmit={handleAgencySearch} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Identificador da agência (vcd, etc)"
                        value={agencySlug}
                        onChange={(e) => setAgencySlug(e.target.value)}
                        className="pl-12 h-14 text-lg bg-secondary border-2 border-border focus:border-primary"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !agencySlug}
                      className="w-full h-14 text-lg font-semibold bg-primary hover:brightness-110 text-primary-foreground transition-all"
                      style={{
                        backgroundColor: agencia?.cor_primaria || undefined,
                        borderColor: agencia?.cor_secundaria || undefined
                      }}
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          Continuar
                          <ChevronRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="gestor-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full space-y-6"
                >
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold opacity-70">
                      Login de Gestor
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="w-full space-y-4">
                    {/* Gestor Selector */}
                    <div className="space-y-2">
                      <Select
                        value={selectedGestorId}
                        onValueChange={setSelectedGestorId}
                        disabled={isFetching}
                      >
                        <SelectTrigger className="h-14 text-lg bg-secondary border-2 border-border focus:border-primary">
                          <SelectValue placeholder={isFetching ? "Carregando..." : "Selecione seu perfil"}>
                            {selectedGestor && (
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 text-primary border border-primary/20">
                                  <AvatarImage src={selectedGestor.foto_url || undefined} className="object-cover" />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {selectedGestor.nome.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{selectedGestor.nome}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border/50">
                          {gestores.map((gestor) => (
                            <SelectItem
                              key={gestor.id}
                              value={gestor.id}
                              className="focus:bg-primary/20 transition-colors"
                            >
                              <div className="flex items-center gap-3 py-1">
                                <Avatar className="h-8 w-8 border border-primary/20">
                                  <AvatarImage src={gestor.foto_url || undefined} className="object-cover" />
                                  <AvatarFallback
                                    className="bg-primary/10 text-primary text-xs font-bold"
                                    style={{
                                      backgroundColor: agencia?.cor_primaria ? `${agencia.cor_primaria}22` : undefined,
                                      color: agencia?.cor_primaria || undefined
                                    }}
                                  >
                                    {gestor.nome.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{gestor.nome}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Password Input */}
                    <motion.div
                      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`pl-12 h-14 text-lg bg-secondary border-2 transition-all duration-200 ${error
                            ? "border-destructive/50 focus:border-destructive"
                            : "border-border/50 focus:border-primary"
                            }`}
                        />
                      </div>
                    </motion.div>

                    <Button
                      type="submit"
                      disabled={isLoading || !password || !selectedGestorId}
                      className="w-full h-14 text-lg font-semibold bg-primary hover:brightness-110 text-primary-foreground vcd-button-glow transition-all duration-200"
                      style={{
                        backgroundColor: agencia?.cor_primaria || undefined
                      }}
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        "Acessar Dashboard"
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive text-sm font-medium text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Google Sign-In */}
            <div className="w-full space-y-4 pt-2">
              <div className="flex items-center gap-3 w-full opacity-50">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">ou entre com</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-12 text-base font-medium border-border/40 hover:bg-secondary transition-all gap-3"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Google
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GestorLogin;

