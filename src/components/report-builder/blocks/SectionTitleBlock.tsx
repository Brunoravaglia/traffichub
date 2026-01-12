import type { SectionTitleConfig } from "../types";

interface SectionTitleBlockProps {
  config: SectionTitleConfig;
  onUpdate?: (config: SectionTitleConfig) => void;
  isEditing?: boolean;
}

export function SectionTitleBlock({ config }: SectionTitleBlockProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative">
        {/* Yellow background badge */}
        <div className="bg-primary px-6 py-2 rounded-lg shadow-lg">
          <h2 className="text-lg md:text-xl font-black text-primary-foreground tracking-[0.3em] uppercase">
            {config.title}
          </h2>
        </div>
        {/* Small decorative corners */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
      </div>
    </div>
  );
}
