import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, AlertTriangle, Clock, Calculator, Brain, Type, Zap } from "lucide-react";
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

const TIMEOUT_SECONDS = 60; // 60 seconds to respond

type ChallengeType = "password" | "math" | "sequence" | "typing";

interface Challenge {
  type: ChallengeType;
  question: string;
  answer: string;
  icon: React.ReactNode;
  hint?: string;
}

// Generate random math challenge
const generateMathChallenge = (): Challenge => {
  const operations = ["+", "-", "×"];
  const op = operations[Math.floor(Math.random() * operations.length)];
  let a: number, b: number, answer: number;

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 50) + 30;
      b = Math.floor(Math.random() * 30) + 1;
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      answer = a * b;
      break;
    default:
      a = 10;
      b = 5;
      answer = 15;
  }

  return {
    type: "math",
    question: `Quanto é ${a} ${op} ${b}?`,
    answer: answer.toString(),
    icon: <Calculator className="w-6 h-6" />,
    hint: "Digite o resultado",
  };
};

// Generate sequence challenge
const generateSequenceChallenge = (): Challenge => {
  const sequences = [
    { seq: [2, 4, 6, 8], next: "10", hint: "Sequência crescente de 2 em 2" },
    { seq: [1, 3, 5, 7], next: "9", hint: "Números ímpares" },
    { seq: [3, 6, 9, 12], next: "15", hint: "Tabuada do 3" },
    { seq: [5, 10, 15, 20], next: "25", hint: "Múltiplos de 5" },
    { seq: [1, 2, 4, 8], next: "16", hint: "Dobrando a cada vez" },
    { seq: [100, 90, 80, 70], next: "60", hint: "Subtraindo 10" },
    { seq: [1, 4, 9, 16], next: "25", hint: "Quadrados perfeitos" },
  ];

  const chosen = sequences[Math.floor(Math.random() * sequences.length)];

  return {
    type: "sequence",
    question: `Complete a sequência: ${chosen.seq.join(", ")}, ?`,
    answer: chosen.next,
    icon: <Brain className="w-6 h-6" />,
    hint: chosen.hint,
  };
};

// Generate typing challenge
const generateTypingChallenge = (): Challenge => {
  const phrases = [
    "TRABALHANDO",
    "FOCADO",
    "PRODUTIVO",
    "GESTÃO",
    "DIGITAL",
    "TRÁFEGO",
    "MARKETING",
    "RESULTADOS",
  ];

  const phrase = phrases[Math.floor(Math.random() * phrases.length)];

  return {
    type: "typing",
    question: `Digite a palavra: ${phrase}`,
    answer: phrase,
    icon: <Type className="w-6 h-6" />,
    hint: "Exatamente como mostrado (maiúsculas)",
  };
};

// Generate password challenge
const generatePasswordChallenge = (): Challenge => {
  return {
    type: "password",
    question: "Confirme sua senha para continuar",
    answer: "", // Will be validated against database
    icon: <Lock className="w-6 h-6" />,
  };
};

// Pick a random challenge type
const generateChallenge = (): Challenge => {
  const types: ChallengeType[] = ["math", "sequence", "typing", "password"];
  const weights = [0.3, 0.25, 0.25, 0.2]; // 30% math, 25% sequence, 25% typing, 20% password

  let random = Math.random();
  let selectedType: ChallengeType = "math";

  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      selectedType = types[i];
      break;
    }
  }

  switch (selectedType) {
    case "math":
      return generateMathChallenge();
    case "sequence":
      return generateSequenceChallenge();
    case "typing":
      return generateTypingChallenge();
    case "password":
    default:
      return generatePasswordChallenge();
  }
};

const SecurityLockScreen = ({ onUnlock, onTimeout }: SecurityLockScreenProps) => {
  const { gestor, logout } = useGestor();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);
  const [attempts, setAttempts] = useState(0);

  // Generate challenge on mount
  const [challenge] = useState<Challenge>(() => generateChallenge());

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
    if (!gestor || !answer.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      let isCorrect = false;

      if (challenge.type === "password") {
        // Validate password against database
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

        isCorrect = data.senha === answer;
      } else {
        // Validate against challenge answer
        isCorrect = answer.trim().toUpperCase() === challenge.answer.toUpperCase();
      }

      if (isCorrect) {
        sessionStorage.setItem("vcd_unlocked", "true");
        sessionStorage.setItem("vcd_last_activity", Date.now().toString());
        toast.success("Verificação de segurança concluída!");
        onUnlock();
      } else {
        setAttempts((prev) => prev + 1);
        const remaining = 3 - attempts - 1;
        setError(
          remaining > 0
            ? `Resposta incorreta. ${remaining} tentativa${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.`
            : "Última tentativa incorreta."
        );
        setAnswer("");

        if (attempts >= 2) {
          toast.error("Muitas tentativas incorretas. Sessão encerrada.");
          await logout();
        }
      }
    } catch (err) {
      setError("Erro ao verificar resposta");
    } finally {
      setIsLoading(false);
    }
  };

  const getCountdownColor = () => {
    if (countdown <= 10) return "text-red-500";
    if (countdown <= 30) return "text-amber-500";
    return "text-primary";
  };

  const getChallengeColor = () => {
    switch (challenge.type) {
      case "math":
        return "from-blue-500 to-cyan-500";
      case "sequence":
        return "from-purple-500 to-pink-500";
      case "typing":
        return "from-green-500 to-emerald-500";
      case "password":
      default:
        return "from-primary to-primary/50";
    }
  };

  const getChallengeLabel = () => {
    switch (challenge.type) {
      case "math":
        return "Desafio Matemático";
      case "sequence":
        return "Complete a Sequência";
      case "typing":
        return "Desafio de Digitação";
      case "password":
      default:
        return "Verificação de Senha";
    }
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
        {/* Challenge Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div
              className={cn(
                "w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center",
                getChallengeColor()
              )}
            >
              <div className="text-white">{challenge.icon}</div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/50"
            />
            {/* Challenge Type Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-card border border-border text-xs font-medium flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-primary" />
              {getChallengeLabel()}
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6 mt-4"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Verificação de Atividade
          </h2>
          <p className="text-muted-foreground text-sm">
            Detectamos inatividade. Resolva o desafio para continuar.
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

        {/* Challenge Question */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10 text-center"
        >
          <p className="text-lg font-medium text-white">{challenge.question}</p>
          {challenge.hint && (
            <p className="text-xs text-muted-foreground mt-1">{challenge.hint}</p>
          )}
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
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {challenge.icon}
              </div>
              <Input
                type={challenge.type === "password" ? "password" : "text"}
                placeholder={
                  challenge.type === "password"
                    ? "Sua senha"
                    : "Sua resposta"
                }
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground text-center text-lg"
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
                  className="flex items-center justify-center gap-2 text-red-400 text-sm"
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
            disabled={isLoading || !answer.trim()}
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
            Confirmar
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
                  Se você não responder, a contagem de tempo será pausada.
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
