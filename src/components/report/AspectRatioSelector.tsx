import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type AspectRatioOption = "auto" | "1:1" | "5:4" | "9:16" | "16:9";

export function aspectRatioOptionToCss(value?: string): string | undefined {
  switch (value) {
    case "1:1":
      return "1 / 1";
    case "5:4":
      return "5 / 4";
    case "9:16":
      return "9 / 16";
    case "16:9":
      return "16 / 9";
    default:
      return undefined;
  }
}

interface AspectRatioSelectorProps {
  value?: AspectRatioOption;
  onChange?: (value: AspectRatioOption) => void;
  className?: string;
}

export function AspectRatioSelector({ value = "auto", onChange, className }: AspectRatioSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => onChange?.(((next || "auto") as AspectRatioOption))}
      variant="outline"
      size="sm"
      className={cn("flex-wrap justify-center", className)}
    >
      <ToggleGroupItem value="auto" aria-label="Proporção automática">
        Auto
      </ToggleGroupItem>
      <ToggleGroupItem value="1:1" aria-label="Proporção 1 por 1">
        1:1
      </ToggleGroupItem>
      <ToggleGroupItem value="5:4" aria-label="Proporção 5 por 4">
        5:4
      </ToggleGroupItem>
      <ToggleGroupItem value="9:16" aria-label="Proporção 9 por 16">
        9:16
      </ToggleGroupItem>
      <ToggleGroupItem value="16:9" aria-label="Proporção 16 por 9">
        16:9
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
