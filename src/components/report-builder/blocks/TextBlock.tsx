import type { TextConfig } from "../types";

interface TextBlockProps {
  config: TextConfig;
  onUpdate?: (config: TextConfig) => void;
  isEditing?: boolean;
}

export function TextBlock({ config, onUpdate, isEditing }: TextBlockProps) {
  const variants = {
    paragraph: 'text-muted-foreground text-sm leading-relaxed',
    highlight: 'text-foreground text-lg font-semibold text-center',
    note: 'text-muted-foreground text-xs italic border-l-2 border-primary pl-4',
  };

  if (isEditing && onUpdate) {
    return (
      <textarea
        value={config.content}
        onChange={(e) => onUpdate({ ...config, content: e.target.value })}
        className={`w-full bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-primary rounded p-2 ${variants[config.variant]}`}
        rows={3}
        placeholder="Digite seu texto aqui..."
      />
    );
  }

  return (
    <p className={variants[config.variant]}>
      {config.content}
    </p>
  );
}
