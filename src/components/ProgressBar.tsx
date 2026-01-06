import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeMap = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const ProgressBar = ({ progress, size = "md", showLabel = true }: ProgressBarProps) => {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Progresso</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
      )}
      <div className={`w-full bg-secondary rounded-full overflow-hidden ${sizeMap[size]}`}>
        <motion.div
          className="h-full vcd-progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
