import { motion } from "framer-motion";

interface VCDLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { container: 32, text: "text-sm" },
  md: { container: 48, text: "text-xl" },
  lg: { container: 64, text: "text-2xl" },
};

const VCDLogo = ({ size = "md", className = "", showText = false }: VCDLogoProps) => {
  const dimensions = sizeMap[size];

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Traffic Hub Logo */}
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: dimensions.container, height: dimensions.container }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle cx="50" cy="50" r="48" fill="hsl(var(--primary))" />
          
          {/* Inner design - stylized T and H for Traffic Hub */}
          <path
            d="M30 30 H70 V38 H54 V70 H46 V38 H30 V30Z"
            fill="hsl(var(--primary-foreground))"
          />
          <path
            d="M60 45 H68 V70 H60 V60 H52 V70 H44 V45 H52 V52 H60 V45Z"
            fill="hsl(var(--primary-foreground))"
            opacity="0.8"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-sm leading-tight">Traffic Hub</span>
          <span className="text-xs text-muted-foreground leading-tight">Performance</span>
        </div>
      )}
    </motion.div>
  );
};

export default VCDLogo;
