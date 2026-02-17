import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, User, ChevronDown } from "lucide-react";
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
  const { login } = useGestor();
  const [gestores, setGestores] = useState<GestorOption[]>([]);
  const [selectedGestorId, setSelectedGestorId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const fetchGestores = async () => {
      setIsFetching(true);
      const { data, error } = await supabase
        .from("gestores")
        .select("id, nome, foto_url")
        .order("nome");

      if (!error && data) {
        setGestores(data);
      }
      setIsFetching(false);
    };

    fetchGestores();
  }, []);

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
            {/* Logo */}
            <VCDLogo size="lg" />

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Checklist do Gestor de Tráfego
              </h1>
              <p className="text-muted-foreground text-sm">
                Selecione seu perfil e digite a senha
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Gestor Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gestor</label>
                <Select
                  value={selectedGestorId}
                  onValueChange={setSelectedGestorId}
                  disabled={isFetching}
                >
                  <SelectTrigger className="h-14 text-lg bg-secondary border-2 border-border focus:border-primary">
                    <SelectValue placeholder={isFetching ? "Carregando..." : "Selecione seu perfil"}>
                      {selectedGestor && (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedGestor.foto_url || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">
                              {selectedGestor.nome.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedGestor.nome}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {gestores.length === 0 && !isFetching && (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhum gestor cadastrado
                      </div>
                    )}
                    {gestores.map((gestor) => (
                      <SelectItem key={gestor.id} value={gestor.id}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={gestor.foto_url || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">
                              {gestor.nome.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{gestor.nome}</span>
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
                    placeholder="Senha de acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-12 h-14 text-lg bg-secondary border-2 transition-all duration-200 ${error
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary"
                      }`}
                  />
                </div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-destructive text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading || !password || !selectedGestorId}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow transition-all duration-200 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Acessar
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google Sign-In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full h-14 text-lg font-medium border-border/40 hover:bg-secondary transition-all gap-3"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Entrar com Google
            </Button>

            {gestores.length === 0 && !isFetching && (
              <p className="text-xs text-muted-foreground text-center">
                Cadastre gestores no menu após o login inicial
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GestorLogin;

