import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Circle, Camera, Users, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useGestor } from "@/contexts/GestorContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  field: "foto_preenchida" | "dados_completos";
  action?: () => void;
}

const OnboardingChecklist = () => {
  const { gestor, refreshGestor } = useGestor();
  const navigate = useNavigate();
  
  // Check sessionStorage to see if user dismissed onboarding this session
  const [dismissedThisSession, setDismissedThisSession] = useState(() => {
    return sessionStorage.getItem("vcd_onboarding_dismissed") === "true";
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const items: OnboardingItem[] = [
    {
      id: "foto",
      title: "Adicionar foto de perfil",
      description: "Adicione sua foto de perfil para identificação",
      icon: <Camera className="h-5 w-5" />,
      field: "foto_preenchida",
      action: () => navigate("/gestores"),
    },
    {
      id: "dados",
      title: "Completar dados dos clientes",
      description: "Preencha logo, telefone e redes sociais de todos os clientes",
      icon: <Users className="h-5 w-5" />,
      field: "dados_completos",
      action: () => navigate("/clientes"),
    },
  ];

  const completedCount = items.filter((item) => gestor?.[item.field]).length;
  const progress = (completedCount / items.length) * 100;
  const allCompleted = completedCount === items.length;

  useEffect(() => {
    // Only show if not completed, not dismissed this session, and gestor exists
    if (gestor && !gestor.onboarding_completo && !dismissedThisSession) {
      setIsOpen(true);
    }
  }, [gestor, dismissedThisSession]);

  const markAsComplete = async () => {
    if (!gestor) return;

    await supabase
      .from("gestores")
      .update({ onboarding_completo: true })
      .eq("id", gestor.id);

    await refreshGestor();
    setIsOpen(false);
  };

  const handleDismiss = async () => {
    if (dontShowAgain && gestor) {
      // Save permanently to database
      await supabase
        .from("gestores")
        .update({ onboarding_completo: true })
        .eq("id", gestor.id);
      await refreshGestor();
    } else {
      // Just dismiss for this session
      sessionStorage.setItem("vcd_onboarding_dismissed", "true");
      setDismissedThisSession(true);
    }
    setIsOpen(false);
  };

  if (!gestor || gestor.onboarding_completo || dismissedThisSession) return null;

  return (
    <>
      {/* Floating button when minimized */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              setIsMinimized(false);
              setIsOpen(true);
            }}
            className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
          >
            <Sparkles className="h-6 w-6" />
            {!allCompleted && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {items.length - completedCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6" />
                    <h2 className="text-xl font-bold">Bem-vindo, {gestor.nome}!</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-primary-foreground/80">
                  Complete as tarefas abaixo para configurar sua conta
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>{completedCount}/{items.length} tarefas</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-primary-foreground/20" />
                </div>
              </div>

              {/* Items */}
              <div className="p-6 space-y-4">
                {items.map((item, index) => {
                  const isCompleted = gestor[item.field];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? "bg-primary/5 border-primary/20"
                          : "bg-secondary/50 border-border hover:border-primary/50 cursor-pointer"
                      }`}
                      onClick={() => !isCompleted && item.action?.()}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          item.icon
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${
                            isCompleted ? "text-primary line-through" : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 space-y-4">
                {!allCompleted && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dontShowOnboarding"
                      checked={dontShowAgain}
                      onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                    />
                    <Label
                      htmlFor="dontShowOnboarding"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Não exibir mais essa mensagem
                    </Label>
                  </div>
                )}
                
                {allCompleted ? (
                  <Button
                    onClick={markAsComplete}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Concluir Onboarding
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleDismiss}
                    className="w-full"
                  >
                    Fazer depois
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OnboardingChecklist;
