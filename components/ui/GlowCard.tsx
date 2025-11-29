"use client";

import { HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  intensity?: "low" | "medium" | "high";
}

const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glowColor = "rgba(79, 158, 255, 0.4)", intensity = "medium", children, ...props }, ref) => {
    const intensities = {
      low: "0 0 10px",
      medium: "0 0 20px",
      high: "0 0 30px",
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
    <motion.div
      ref={ref}
      className={cn("glass glass-hover", className)}
      style={{
        boxShadow: `${intensities[intensity]} ${glowColor}, 0px 8px 32px rgba(0, 0, 0, 0.2)`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...(restProps as any)}
    >
      {children}
    </motion.div>
  );
  }
);

GlowCard.displayName = "GlowCard";

export default GlowCard;

