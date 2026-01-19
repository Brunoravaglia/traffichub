import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGestor } from "@/contexts/GestorContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SecurityLockScreenProps {
  onUnlock: () => void;
  onTimeout: () => void;
}

const LOCK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const TIMEOUT_SECONDS = 60; // 60 seconds to respond

const SecurityLockScreen = ({ onUnlock, onTimeout }: SecurityLockScreenProps) => {
  const { gestor, logout } = useGestor();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);
  const [attempts, setAttempts] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gestor || !password.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("gestores")
        .select("senha")
        .eq("id", gestor.id)
        .single();

      if (fetchError) {
        setError("Erro ao verificar senha");
        setIsLoading(false);
        return;
      }

      if (data.senha === password) {
        sessionStorage.setItem("vcd_unlocked", "true");
        sessionStorage.setItem("vcd_last_unlock", Date.now().toString());
        toast.success("Verificação de segurança concluída!");
        onUnlock();
      } else {
        setAttempts((prev) => prev + 1);
        setError(`Senha incorreta. ${3 - attempts - 1} tentativas restantes.`);
        setPassword("");

        if (attempts >= 2) {
          toast.error("Muitas tentativas incorretas. Sessão encerrada.");
          await logout();
        }
      }
    } catch (err) {
      setError("Erro ao verificar senha");
    } finally {
      setIsLoading(false);
    }
  };

  const getCountdownColor = () => {
    if (countdown <= 10) return "text-red-500";
    if (countdown <= 30) return "text-amber-500";
    return "text-primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 backdrop-blur-lg"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        {/* Shield Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/50"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Verificação de Segurança
          </h2>
          <p className="text-muted-foreground">
            Por favor, confirme sua senha para continuar trabalhando
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "flex items-center justify-center gap-2 mb-6 p-3 rounded-lg",
            countdown <= 10 ? "bg-red-500/20" : "bg-muted/20"
          )}
        >
          <Clock className={cn("w-5 h-5", getCountdownColor())} />
          <span className={cn("text-lg font-mono font-bold", getCountdownColor())}>
            {countdown}s
          </span>
          <span className="text-muted-foreground">para responder</span>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            className="w-full h-12 gap-2"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="w-5 h-5" />
              </motion.div>
            ) : (
              <Shield className="w-5 h-5" />
            )}
            Confirmar Identidade
          </Button>
        </motion.form>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Logado como <span className="text-primary font-medium">{gestor?.nome}</span>
          </p>
        </motion.div>

        {/* Warning */}
        {countdown <= 30 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/30"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-amber-400 font-medium text-sm">
                  Atenção: Sessão será pausada!
                </p>
                <p className="text-amber-400/80 text-xs">
                  Se você não confirmar sua senha, a contagem de tempo será pausada.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SecurityLockScreen;

export { LOCK_INTERVAL_MS };
