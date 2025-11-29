"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  glow?: boolean;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "primary", glow = false, children, ...props }, ref) => {
    const baseStyles = "glass px-6 py-3 rounded-xl font-medium transition-all duration-300";
    
    const variants = {
      primary: "bg-[rgba(79,158,255,0.2)] text-white border-[rgba(79,158,255,0.3)] hover:bg-[rgba(79,158,255,0.3)]",
      secondary: "bg-[rgba(255,255,255,0.1)] text-white border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.15)]",
      ghost: "bg-transparent text-white border-transparent hover:bg-[rgba(255,255,255,0.05)]",
    };

  const {
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...restProps
  } = props;
  
  return (
    <motion.button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        glow && "glow",
        "glass-hover",
        className
      )}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      {...(restProps as any)}
    >
      {children}
    </motion.button>
  );
  }
);

GlassButton.displayName = "GlassButton";

export default GlassButton;

