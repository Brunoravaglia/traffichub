import { useState, useRef, useCallback, useEffect } from "react";
import { Trash2, GripVertical, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ResizableImageProps {
  id: string;
  url: string;
  name: string;
  width?: number;
  height?: number;
  onRemove: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
}

export function ResizableImage({
  id,
  url,
  name,
  width,
  height,
  onRemove,
  onResize,
  minWidth = 100,
  minHeight = 60,
  maxWidth = 800,
}: ResizableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [currentSize, setCurrentSize] = useState({ width: width || 280, height: height || 180 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : isResizing ? 20 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  useEffect(() => {
    if (width && height) {
      setCurrentSize({ width, height });
    }
  }, [width, height]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    
    // Set initial size if not already set, maintaining aspect ratio
    if (!width || !height) {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let newWidth = Math.min(280, img.naturalWidth);
      let newHeight = newWidth / aspectRatio;
      
      if (newHeight > 400) {
        newHeight = 400;
        newWidth = newHeight * aspectRatio;
      }
      
      setCurrentSize({ width: newWidth, height: newHeight });
      onResize(id, newWidth, newHeight);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...currentSize };
  }, [currentSize]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    let newWidth = startSize.current.width;
    let newHeight = startSize.current.height;

    const aspectRatio = naturalSize.width / naturalSize.height || 1;

    if (resizeHandle.includes("e")) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.current.width + deltaX));
    }
    if (resizeHandle.includes("w")) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.current.width - deltaX));
    }
    if (resizeHandle.includes("s")) {
      newHeight = Math.max(minHeight, startSize.current.height + deltaY);
    }
    if (resizeHandle.includes("n")) {
      newHeight = Math.max(minHeight, startSize.current.height - deltaY);
    }

    // For corner handles, maintain aspect ratio with shift
    if (e.shiftKey && resizeHandle.length === 2) {
      newHeight = newWidth / aspectRatio;
    }

    setCurrentSize({ width: newWidth, height: newHeight });
  }, [isResizing, resizeHandle, minWidth, minHeight, maxWidth, naturalSize]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      onResize(id, currentSize.width, currentSize.height);
      setIsResizing(false);
      setResizeHandle(null);
    }
  }, [isResizing, id, currentSize, onResize]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleClasses = "absolute bg-primary rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10";
  const cornerSize = "w-3 h-3";
  const edgeHorizontal = "w-8 h-2";
  const edgeVertical = "w-2 h-8";

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="inline-block"
    >
      <div
        ref={containerRef}
        className={cn(
          "relative group rounded-lg overflow-visible border-2 border-transparent hover:border-primary/50 transition-colors",
          isDragging && "ring-2 ring-primary shadow-lg",
          isResizing && "ring-2 ring-primary"
        )}
        style={{ 
          width: currentSize.width, 
          height: currentSize.height,
        }}
      >
        <img
          src={url}
          alt={name}
          onLoad={handleImageLoad}
          className="w-full h-full object-contain rounded-lg"
          draggable={false}
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none rounded-lg" />

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1.5 bg-background/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Delete button */}
        <button
          onClick={() => onRemove(id)}
          className="absolute top-2 right-2 p-1 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <Trash2 className="w-4 h-4 text-destructive-foreground" />
        </button>

        {/* Size indicator */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {Math.round(currentSize.width)} × {Math.round(currentSize.height)}
        </div>

        {/* Resize handles - corners */}
        <div
          className={cn(handleClasses, cornerSize, "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize")}
          onMouseDown={(e) => handleMouseDown(e, "nw")}
        />
        <div
          className={cn(handleClasses, cornerSize, "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize")}
          onMouseDown={(e) => handleMouseDown(e, "ne")}
        />
        <div
          className={cn(handleClasses, cornerSize, "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize")}
          onMouseDown={(e) => handleMouseDown(e, "sw")}
        />
        <div
          className={cn(handleClasses, cornerSize, "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize")}
          onMouseDown={(e) => handleMouseDown(e, "se")}
        />

        {/* Resize handles - edges */}
        <div
          className={cn(handleClasses, edgeHorizontal, "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize")}
          onMouseDown={(e) => handleMouseDown(e, "n")}
        />
        <div
          className={cn(handleClasses, edgeHorizontal, "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize")}
          onMouseDown={(e) => handleMouseDown(e, "s")}
        />
        <div
          className={cn(handleClasses, edgeVertical, "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize")}
          onMouseDown={(e) => handleMouseDown(e, "w")}
        />
        <div
          className={cn(handleClasses, edgeVertical, "top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize")}
          onMouseDown={(e) => handleMouseDown(e, "e")}
        />
      </div>
    </div>
  );
}
