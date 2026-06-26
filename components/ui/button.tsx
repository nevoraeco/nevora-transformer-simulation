import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Enterprise Button Primitive
 * Features tactile active-state scaling, Radix Slot composition for Next.js Links,
 * and strict CVA variant enforcement aligned with the Nevora identity.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] dark:focus-visible:ring-offset-obsidian",
  {
    variants: {
      variant: {
        // Primary Brand Action
        default:
          "bg-emerald text-white shadow-sm hover:bg-emerald-dark",
        
        // Critical / Destructive Action
        danger:
          "bg-danger text-white shadow-sm hover:opacity-90",
          
        // Secondary / Outline Action
        outline:
          "border border-border bg-transparent hover:bg-gray-50 hover:text-gray-900 dark:border-obsidian-border dark:hover:bg-obsidian-surface dark:hover:text-white",
          
        // Muted Action
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-obsidian-surface dark:text-gray-100 dark:hover:bg-gray-800",
          
        // Invisible Background (for icons or subtle text)
        ghost: 
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-obsidian-surface dark:hover:text-white",
          
        // Inline Text Link Action
        link: 
          "text-emerald underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10", // Perfect square for standalone icons
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Allows delegating button styles to a child component (like Next/Link)
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };