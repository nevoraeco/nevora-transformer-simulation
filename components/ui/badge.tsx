import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Enterprise Badge Primitive
 * Utilizes Class Variance Authority (CVA) to enforce strict, type-safe design variants.
 * Mapped directly to the Nevora Ecovolt semantic color system.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald focus:ring-offset-2 dark:focus:ring-offset-obsidian",
  {
    variants: {
      variant: {
        // Standard Brand Accent (Safe / Active)
        default:
          "border-transparent bg-emerald text-white shadow hover:bg-emerald-dark",
        
        // Neutral Information
        secondary:
          "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-obsidian-border dark:text-gray-100 dark:hover:bg-gray-700",
        
        // Critical System State (Overload / Error)
        danger:
          "border-transparent bg-danger text-white shadow hover:opacity-90",
          
        // Approaching Limits (Warning)
        warning:
          "border-transparent bg-warning text-white shadow hover:opacity-90",
          
        // Minimalist Wireframe State
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };