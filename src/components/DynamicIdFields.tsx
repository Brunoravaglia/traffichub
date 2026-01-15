import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DynamicIdFieldsProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  maxItems?: number;
}

export function DynamicIdFields({
  label,
  placeholder,
  values,
  onChange,
  maxItems = 10,
}: DynamicIdFieldsProps) {
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    const trimmed = newValue.trim();
    if (trimmed && !values.includes(trimmed) && values.length < maxItems) {
      onChange([...values, trimmed]);
      setNewValue("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-primary" />
        {label}
      </Label>

      {/* Existing values */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 py-1.5 px-3 bg-primary/10 text-primary border border-primary/20"
            >
              <span className="font-mono text-xs">{value}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add new value */}
      <div className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 h-10 bg-secondary border-border focus:border-primary font-mono text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAdd}
          disabled={!newValue.trim() || values.length >= maxItems}
          className="h-10 w-10 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {values.length}/{maxItems} IDs adicionados. Pressione Enter ou clique em + para adicionar.
      </p>
    </div>
  );
}

export default DynamicIdFields;
