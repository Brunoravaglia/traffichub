import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const ProgressBar = ({ progress, size = "md", showLabel = true, className }: ProgressBarProps) => {
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Progresso</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
      )}
      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", sizeMap[size])}>
        <div
          className="h-full vcd-progress-bar transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
