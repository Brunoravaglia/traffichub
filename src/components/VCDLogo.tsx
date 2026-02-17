import { motion } from "framer-motion";
import brandMark from "@/assets/brand-mark.png";

interface VCDLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { container: 40, text: "text-base" },
  md: { container: 56, text: "text-xl" },
  lg: { container: 72, text: "text-3xl" },
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
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: dimensions.container, height: dimensions.container }}
      >
        <img
          src={brandMark}
          alt="Vurp"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-sm leading-tight">Vurp</span>
          <span className="text-xs text-muted-foreground leading-tight">Performance</span>
        </div>
      )}
    </motion.div>
  );
};

export default VCDLogo;
