import * as React from "react";
import { cn } from "@/lib/utils";

interface NumericInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  isDecimal?: boolean;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, value, onChange, isDecimal = false, placeholder = "0", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>("");
    const [isFocused, setIsFocused] = React.useState(false);

    // Sync display value with external value when not focused
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(value === 0 ? "" : formatDisplay(value));
      }
    }, [value, isFocused, isDecimal]);

    const formatDisplay = (val: number) => {
      if (isDecimal) {
        return new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(val);
      } else {
        return new Intl.NumberFormat('pt-BR').format(val);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (value === 0) {
        setDisplayValue("");
      } else {
        // Just show the current display value, let them edit
      }
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // Ensure it snaps to clean formatting on blur
      setDisplayValue(value === 0 ? "" : formatDisplay(value));
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      setDisplayValue(inputValue);

      if (inputValue === "") {
        onChange(0);
        return;
      }

      // Remove R$, spaces, any letters
      let clean = inputValue.replace(/[^\d.,-]/g, "");

      if (!clean || clean === "-" || clean === "." || clean === ",") {
        onChange(0);
        return;
      }

      let parsed = 0;

      // Detect if user is typing with comma (pt-BR format)
      if (clean.includes(',')) {
        // Remove dots (thousands separators)
        clean = clean.replace(/\./g, "");
        // Replace comma with dot for parseFloat
        clean = clean.replace(",", ".");

        parsed = isDecimal ? parseFloat(clean) : parseInt(clean);
      } else {
        // Only dots. If it's a decimal, allow one dot. 
        // If they use multiple dots, assume thousands.
        const dotCount = (clean.match(/\./g) || []).length;
        if (dotCount > 1 || !isDecimal) {
          clean = clean.replace(/\./g, "");
        }
        parsed = isDecimal ? parseFloat(clean) : parseInt(clean);
      }

      const finalValue = isNaN(parsed) ? 0 : parsed;
      onChange(finalValue);
    };

    return (
      <input
        type="text"
        inputMode={isDecimal ? "decimal" : "numeric"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

NumericInput.displayName = "NumericInput";

export { NumericInput };
