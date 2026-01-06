import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VCDLogo from "./VCDLogo";

interface PasswordGateProps {
  onUnlock: () => void;
}

const CORRECT_PASSWORD = "vcd123";

const PasswordGate = ({ onUnlock }: PasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        onUnlock();
      } else {
        setError(true);
        setIsLoading(false);
        setTimeout(() => setError(false), 500);
      }
    }, 300);
  };

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
                Digite a senha para acessar
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
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
                    className={`pl-12 h-14 text-lg bg-secondary border-2 transition-all duration-200 ${
                      error
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
                    Senha incorreta
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading || !password}
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
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordGate;
