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
        setDisplayValue(value === 0 ? "" : String(value));
      }
    }, [value, isFocused]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // If value is 0, show empty to allow clean typing
      if (value === 0) {
        setDisplayValue("");
      }
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // Parse final value
      const parsed = isDecimal ? parseFloat(displayValue) : parseInt(displayValue);
      const finalValue = isNaN(parsed) ? 0 : parsed;
      onChange(finalValue);
      setDisplayValue(finalValue === 0 ? "" : String(finalValue));
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Allow empty string
      if (inputValue === "") {
        setDisplayValue("");
        onChange(0);
        return;
      }

      // Validate numeric input - allow digits, decimal point, and minus
      const regex = isDecimal ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
      if (regex.test(inputValue)) {
        setDisplayValue(inputValue);
        const parsed = isDecimal ? parseFloat(inputValue) : parseInt(inputValue);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }
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
