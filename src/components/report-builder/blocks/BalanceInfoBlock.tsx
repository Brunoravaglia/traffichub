import type { BalanceInfoConfig } from "../types";

interface BalanceInfoBlockProps {
  config: BalanceInfoConfig;
  onUpdate?: (config: BalanceInfoConfig) => void;
  isEditing?: boolean;
}

export function BalanceInfoBlock({ config }: BalanceInfoBlockProps) {
  return (
    <div className="text-center space-y-2 py-4">
      {config.googleBalance && (
        <p className="text-foreground">
          <span className="font-bold tracking-wide">SALDO DO GOOGLE ADS:</span>{' '}
          <span className="text-primary font-bold">{config.googleBalance}</span>
        </p>
      )}
      {config.metaBalance && (
        <p className="text-foreground">
          <span className="font-bold tracking-wide">SALDO DO META ADS:</span>{' '}
          <span className="text-primary font-bold">{config.metaBalance}</span>
        </p>
      )}
    </div>
  );
}
