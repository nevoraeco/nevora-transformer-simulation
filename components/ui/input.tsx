import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Enterprise Text/Data Input Primitive
 * Delivers precise focus-visible micro-states, semantic design token mapping,
 * and standard ref forwarding optimized for advanced form management libraries.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base form metrics and sizing rules
          "flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground",
          "transition-all duration-200 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium",
          
          // Micro-typography adjustments for input prompts
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          
          // High-Fidelity Interactive Focus Layering
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald focus-visible:border-emerald",
          
          // System state locks
          "disabled:cursor-not-allowed disabled:opacity-50",
          
          // Theme token inheritance mapping
          "dark:bg-card",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };