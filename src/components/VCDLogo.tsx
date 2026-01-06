import { motion } from "framer-motion";

interface VCDLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: 32, text: "text-sm" },
  md: { container: 48, text: "text-xl" },
  lg: { container: 64, text: "text-2xl" },
};

const VCDLogo = ({ size = "md", className = "" }: VCDLogoProps) => {
  const dimensions = sizeMap[size];

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Speech Bubble Logo */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.container, height: dimensions.container }}
      >
        {/* Bubble shape */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          className="w-full h-full"
        >
          {/* Main bubble */}
          <path
            d="M24 4C12.954 4 4 11.954 4 22C4 27.5 6.5 32.4 10.5 35.8L8 44L18 39.5C19.9 40.1 21.9 40.5 24 40.5C35.046 40.5 44 32.546 44 22C44 11.454 35.046 4 24 4Z"
            fill="hsl(43, 100%, 50%)"
          />
        </svg>
        {/* V Letter */}
        <span
          className={`absolute font-bold text-primary-foreground ${dimensions.text}`}
          style={{ marginTop: -2 }}
        >
          V
        </span>
      </div>
    </motion.div>
  );
};

export default VCDLogo;
