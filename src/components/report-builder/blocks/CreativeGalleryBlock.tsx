import { Heart, MessageCircle, Eye, Calendar } from "lucide-react";
import type { CreativeGalleryConfig } from "../types";

interface CreativeGalleryBlockProps {
  config: CreativeGalleryConfig;
  onUpdate?: (config: CreativeGalleryConfig) => void;
  isEditing?: boolean;
}

export function CreativeGalleryBlock({ config }: CreativeGalleryBlockProps) {
  return (
    <div className="space-y-4">
      {config.title && (
        <h3 className="text-center text-lg font-bold text-primary">{config.title}</h3>
      )}
      <div className="flex flex-wrap gap-4 justify-center">
        {config.images.map((image, index) => (
          <div 
            key={index} 
            className="relative w-48 rounded-xl overflow-hidden bg-card border border-border group"
          >
            <img 
              src={image.url} 
              alt={`Creative ${index + 1}`}
              className="w-full h-auto object-contain"
            />
            {/* Overlay with stats */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 space-y-1">
              {/* IG Sorter badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-0.5 rounded">
                  IG Sorter
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-white text-xs">
                {image.likes !== undefined && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    {image.likes}
                  </span>
                )}
                {image.comments !== undefined && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {image.comments}
                  </span>
                )}
              </div>
              
              {image.date && (
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <Calendar className="w-3 h-3" />
                  {image.date}
                </div>
              )}
              
              {image.views !== undefined && (
                <div className="flex items-center gap-1 text-white text-xs">
                  <Eye className="w-3 h-3 text-primary" />
                  {image.views.toLocaleString()}
                </div>
              )}
              
              {image.engagement && (
                <div className="text-primary text-xs font-bold">
                  ER {image.engagement}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
