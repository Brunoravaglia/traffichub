import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PendenciasCardProps {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
}

const PendenciasCard = ({ value, onChange, delay = 0 }: PendenciasCardProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== value) {
        setIsSaving(true);
        onChange(localValue);
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [localValue, value, onChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="vcd-card"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">Pendências</h3>
        </div>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-primary text-sm"
          >
            <Save className="w-4 h-4" />
            Salvando...
          </motion.div>
        )}
      </div>

      {/* Textarea */}
      <Textarea
        placeholder="Anote aqui as pendências e observações importantes..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="min-h-[120px] bg-secondary border-border focus:border-primary resize-none"
      />
    </motion.div>
  );
};

export default PendenciasCard;
