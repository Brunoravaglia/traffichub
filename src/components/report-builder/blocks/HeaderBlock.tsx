import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { HeaderConfig } from "../types";

interface HeaderBlockProps {
  config: HeaderConfig;
  onUpdate?: (config: HeaderConfig) => void;
  isEditing?: boolean;
}

export function HeaderBlock({ config, onUpdate, isEditing }: HeaderBlockProps) {
  const formatPeriod = () => {
    try {
      const start = new Date(config.periodStart);
      const end = new Date(config.periodEnd);
      return `${format(start, 'dd/MM', { locale: ptBR })} - ${format(end, 'dd/MM', { locale: ptBR })}`;
    } catch {
      return 'Período';
    }
  };

  return (
    <div className="bg-background rounded-xl overflow-hidden">
      {/* Top yellow border */}
      <div className="h-2 bg-primary" />
      
      {/* Client logo area */}
      <div className="flex justify-center py-6">
        {config.clientLogo ? (
          <img 
            src={config.clientLogo} 
            alt={config.clientName}
            className="h-16 object-contain"
          />
        ) : (
          <div className="px-6 py-3 rounded-full bg-secondary text-foreground font-bold text-xl">
            {config.clientName}
          </div>
        )}
      </div>
      
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-black text-center text-foreground tracking-tight">
        {config.title || 'RESULTADOS DAS CAMPANHAS'}
      </h1>
      
      {/* Period */}
      <p className="text-4xl md:text-5xl font-black text-center text-primary mt-2 mb-6">
        {formatPeriod()}
      </p>
      
      {/* Bottom yellow border */}
      <div className="h-2 bg-primary" />
    </div>
  );
}
