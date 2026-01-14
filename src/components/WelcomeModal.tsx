import { motion } from "framer-motion";
import { X, Sparkles, Rocket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import VCDLogo from "./VCDLogo";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
  gestorName: string;
}

const WelcomeModal = ({ isOpen, onClose, gestorName }: WelcomeModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const features = [
    { icon: CheckCircle2, text: "Gerencie checklists de mídia paga" },
    { icon: Rocket, text: "Envie relatórios profissionais" },
    { icon: Sparkles, text: "Acompanhe métricas em tempo real" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(dontShowAgain)}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 text-center">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.8, 0.5, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <VCDLogo size="lg" showText={false} />
              </div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                Bem-vindo, {gestorName}! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                Este é seu primeiro acesso ao Traffic Hub
              </motion.p>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Aqui você pode:
            </p>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Don't show again checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center space-x-2 pt-2"
            >
              <Checkbox
                id="dontShowAgain"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              />
              <Label
                htmlFor="dontShowAgain"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Não mostrar esta mensagem novamente
              </Label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={() => onClose(dontShowAgain)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Começar a usar
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
