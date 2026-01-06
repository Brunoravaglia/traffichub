import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  delay?: number;
}

const ChecklistItem = ({ label, checked, onChange, delay = 0 }: ChecklistItemProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ${
        checked
          ? "bg-primary/5 border border-primary/20"
          : "hover:bg-secondary/50 border border-transparent"
      }`}
    >
      {/* Custom Checkbox */}
      <div
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? "bg-primary border-primary"
            : "border-muted-foreground/30 group-hover:border-primary/50"
        }`}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        )}
      </div>

      {/* Label */}
      <span
        className={`flex-1 text-left transition-colors duration-200 ${
          checked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        }`}
      >
        {label}
      </span>

      {/* Status indicator */}
      {checked && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs font-medium text-primary"
        >
          Concluído
        </motion.span>
      )}
    </motion.button>
  );
};

export default ChecklistItem;
