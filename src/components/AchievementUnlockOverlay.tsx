import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Star, Crown, Gem, Award, Zap, Target, Users, 
  FileText, Clock, Camera, Rocket, UserCheck, UserPlus,
  BarChart2, Files, CheckCircle, Layout, Palette, Flame, Sparkles, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  category: string;
}

interface AchievementUnlockOverlayProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  trophy: Trophy,
  star: Star,
  crown: Crown,
  gem: Gem,
  award: Award,
  zap: Zap,
  target: Target,
  users: Users,
  "file-text": FileText,
  files: Files,
  clock: Clock,
  camera: Camera,
  rocket: Rocket,
  "user-check": UserCheck,
  "user-plus": UserPlus,
  "bar-chart-2": BarChart2,
  "check-circle": CheckCircle,
  layout: Layout,
  palette: Palette,
  flame: Flame,
};

const rarityConfig = {
  common: {
    label: "Comum",
    color: "from-slate-400 to-slate-600",
    bgGlow: "rgba(148, 163, 184, 0.3)",
    textColor: "text-slate-300",
  },
  rare: {
    label: "Raro",
    color: "from-blue-400 to-blue-600",
    bgGlow: "rgba(59, 130, 246, 0.4)",
    textColor: "text-blue-300",
  },
  epic: {
    label: "Épico",
    color: "from-purple-400 to-purple-600",
    bgGlow: "rgba(168, 85, 247, 0.5)",
    textColor: "text-purple-300",
  },
  legendary: {
    label: "Lendário",
    color: "from-amber-400 via-orange-500 to-red-500",
    bgGlow: "rgba(251, 191, 36, 0.6)",
    textColor: "text-amber-300",
  },
};

const AchievementUnlockOverlay = ({ achievement, onClose }: AchievementUnlockOverlayProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (achievement) {
      // Trigger confetti
      const duration = achievement.rarity === "legendary" ? 5000 : 3000;
      const particleCount = achievement.rarity === "legendary" ? 200 : 100;
      
      confetti({
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: achievement.rarity === "legendary" 
          ? ["#fbbf24", "#f97316", "#ef4444", "#fcd34d"]
          : achievement.rarity === "epic"
          ? ["#a855f7", "#7c3aed", "#c084fc"]
          : achievement.rarity === "rare"
          ? ["#3b82f6", "#60a5fa", "#2563eb"]
          : ["#94a3b8", "#64748b", "#cbd5e1"],
      });

      // Show content after initial animation
      setTimeout(() => setShowContent(true), 500);

      // Auto close for common/rare
      if (achievement.rarity === "common" || achievement.rarity === "rare") {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const rarity = rarityConfig[achievement.rarity];
  const IconComponent = iconMap[achievement.icon] || Trophy;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                background: `linear-gradient(135deg, ${rarity.bgGlow}, transparent)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -200],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Radial Glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, ${rarity.bgGlow} 0%, transparent 70%)`,
          }}
        />

        {/* Main Content */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative z-10 flex flex-col items-center text-center px-8"
        >
          {/* Trophy Icon with Glow */}
          <motion.div
            animate={{
              boxShadow: [
                `0 0 20px ${rarity.bgGlow}`,
                `0 0 60px ${rarity.bgGlow}`,
                `0 0 20px ${rarity.bgGlow}`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center mb-6",
              "bg-gradient-to-br",
              rarity.color
            )}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <IconComponent className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>

          {/* Achievement Unlocked Text */}
          <AnimatePresence>
            {showContent && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  <span className="text-lg font-medium text-amber-400 tracking-widest uppercase">
                    Conquista Desbloqueada!
                  </span>
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                  {achievement.name}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-xl text-muted-foreground max-w-md mb-6"
                >
                  {achievement.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center gap-6 mb-8"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-2xl font-bold text-amber-400">
                      +{achievement.points}
                    </span>
                    <span className="text-muted-foreground">pontos</span>
                  </div>

                  <div className={cn(
                    "px-4 py-2 rounded-full border-2",
                    `border-current ${rarity.textColor}`
                  )}>
                    <span className={cn("font-semibold", rarity.textColor)}>
                      {rarity.label}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <Button
                    onClick={onClose}
                    size="lg"
                    className={cn(
                      "gap-2 text-lg px-8 bg-gradient-to-r",
                      rarity.color
                    )}
                  >
                    Incrível!
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-6 right-6 text-white/60 hover:text-white hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Legendary Shimmer */}
        {achievement.rarity === "legendary" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent pointer-events-none"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementUnlockOverlay;
