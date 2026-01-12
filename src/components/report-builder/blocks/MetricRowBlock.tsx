import { 
  MousePointer, 
  Eye, 
  MessageCircle, 
  DollarSign, 
  Users,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import type { MetricRowConfig, MetricCardConfig } from "../types";

const iconMap: Record<string, React.ReactNode> = {
  click: <MousePointer className="w-6 h-6" />,
  eye: <Eye className="w-6 h-6" />,
  message: <MessageCircle className="w-6 h-6" />,
  dollar: <DollarSign className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  trending: <TrendingUp className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
};

interface MetricRowBlockProps {
  config: MetricRowConfig;
  onUpdate?: (config: MetricRowConfig) => void;
  isEditing?: boolean;
}

function MetricCard({ metric }: { metric: MetricCardConfig }) {
  return (
    <div className="flex-1 bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 min-w-[120px]">
      <div className="p-2 rounded-full bg-primary/10 text-primary">
        {iconMap[metric.icon] || <Zap className="w-6 h-6" />}
      </div>
      <span className="text-2xl md:text-3xl font-black text-foreground">
        {metric.value}
      </span>
      <span className="text-xs text-muted-foreground text-center uppercase tracking-wide">
        {metric.label}
      </span>
    </div>
  );
}

export function MetricRowBlock({ config }: MetricRowBlockProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 justify-center">
        {config.metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>
    </div>
  );
}
