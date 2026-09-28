"use client";

import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

// Simple custom cva-like logic since class-variance-authority isn't in package.json
// But actually the user didn't ask for it specifically so we can just use template literals
// wait, we can just write simple classes with tailwind-merge logic. Let's do that to avoid having 'class-variance-authority' dependency.

// Tailwind utilities are perfect for this.
const buttonVariants = {
  base: "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      default: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_var(--accent-glow)]",
      destructive: "bg-red-500 text-white hover:bg-red-500/90",
      outline: "border border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_var(--accent-glow)]",
      secondary: "bg-muted text-muted-foreground hover:bg-muted/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-accent underline-offset-4 hover:underline",
      glass: "glass text-foreground hover:bg-white/10",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-none px-3",
      lg: "h-11 rounded-none px-8",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
};

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: keyof typeof buttonVariants.variants.variant;
  size?: keyof typeof buttonVariants.variants.size;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    // Generate class string based on variants
    const classes = cn(
      buttonVariants.base,
      buttonVariants.variants.variant[variant],
      buttonVariants.variants.size[size],
      className
    );

    if (asChild && isValidElement<{ className?: string; tabIndex?: number; "aria-disabled"?: boolean }>(children)) {
      return cloneElement(children, {
        className: cn(classes, children.props.className),
        tabIndex: props.disabled ? -1 : children.props.tabIndex,
        "aria-disabled": props.disabled || children.props["aria-disabled"],
      });
    }
    
    return (
      <motion.button
        ref={ref}
        className={classes}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
