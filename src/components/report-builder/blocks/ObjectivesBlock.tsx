import { Target } from "lucide-react";
import type { ObjectivesConfig } from "../types";

interface ObjectivesBlockProps {
  config: ObjectivesConfig;
  onUpdate?: (config: ObjectivesConfig) => void;
  isEditing?: boolean;
}

export function ObjectivesBlock({ config }: ObjectivesBlockProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex gap-6">
      {/* Left side - objectives list */}
      <div className="flex-1 space-y-3">
        {config.objectives.map((objective, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">{index + 1}</span>
            </div>
            <p className="text-foreground text-sm">{objective}</p>
          </div>
        ))}
      </div>
      
      {/* Right side - description */}
      {config.description && (
        <div className="flex-1 border-l border-border pl-6">
          <h4 className="text-2xl font-bold text-primary mb-2">Objetivos</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {config.description}
          </p>
        </div>
      )}
    </div>
  );
}
