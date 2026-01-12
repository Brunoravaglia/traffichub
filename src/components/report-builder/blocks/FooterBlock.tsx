import { Instagram, Globe } from "lucide-react";
import type { FooterConfig } from "../types";

interface FooterBlockProps {
  config: FooterConfig;
  onUpdate?: (config: FooterConfig) => void;
  isEditing?: boolean;
}

export function FooterBlock({ config }: FooterBlockProps) {
  return (
    <div className="bg-card border-t-4 border-primary rounded-b-xl p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Company branding */}
        <div className="flex items-center gap-4">
          {config.companyLogo ? (
            <img 
              src={config.companyLogo} 
              alt={config.companyName}
              className="h-12 object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">V</span>
              </div>
              <span className="text-xl font-black">
                <span className="text-primary">VOCÊ</span>
                <span className="text-foreground">DIGITAL</span>
              </span>
            </div>
          )}
        </div>
        
        {/* Contact info */}
        <div className="flex items-center gap-6 text-sm">
          {config.instagram && (
            <a 
              href={`https://instagram.com/${config.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span>{config.instagram}</span>
            </a>
          )}
          {config.website && (
            <a 
              href={config.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{config.website}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
