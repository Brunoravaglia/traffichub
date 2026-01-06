import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import ChecklistItem from "./ChecklistItem";

interface ChecklistCardProps {
  title: string;
  icon: LucideIcon;
  items: {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }[];
  delay?: number;
}

const ChecklistCard = ({ title, icon: Icon, items, delay = 0 }: ChecklistCardProps) => {
  const completedCount = items.filter((item) => item.checked).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="vcd-card"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{items.length}
          </span>
          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full vcd-progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {items.map((item, index) => (
          <ChecklistItem
            key={item.id}
            label={item.label}
            checked={item.checked}
            onChange={item.onChange}
            delay={delay + index * 0.05}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ChecklistCard;
