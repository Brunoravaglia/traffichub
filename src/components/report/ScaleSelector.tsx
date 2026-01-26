import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type ScaleOption = "100" | "110" | "120" | "130" | "140" | "150";

const scaleOptions: { value: ScaleOption; label: string }[] = [
  { value: "100", label: "100%" },
  { value: "110", label: "110%" },
  { value: "120", label: "120%" },
  { value: "130", label: "130%" },
  { value: "140", label: "140%" },
  { value: "150", label: "150%" },
];

interface ScaleSelectorProps {
  value: ScaleOption;
  onChange: (value: ScaleOption) => void;
  className?: string;
}

export function ScaleSelector({ value, onChange, className }: ScaleSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as ScaleOption)}
      className={cn("flex flex-wrap gap-1", className)}
    >
      {scaleOptions.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className="h-7 px-2 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function scaleOptionToTransform(scale: ScaleOption): number {
  return parseInt(scale) / 100;
}
