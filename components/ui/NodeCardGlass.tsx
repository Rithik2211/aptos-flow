"use client";

import { HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NodeCardGlassProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  category?: "trigger" | "action" | "logic";
}

const NodeCardGlass = forwardRef<HTMLDivElement, NodeCardGlassProps>(
  ({ className, icon: Icon, title, description, category = "action", children, ...props }, ref) => {
    const categoryColors = {
      trigger: "border-[rgba(79,158,255,0.4)]",
      action: "border-[rgba(126,212,255,0.4)]",
      logic: "border-[rgba(255,255,255,0.3)]",
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
      className={cn(
        "glass glass-hover p-4 cursor-pointer",
        categoryColors[category],
        className
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      {...(restProps as any)}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="mb-2 text-[#4F9EFF]">
            <Icon size={24} />
          </div>
        )}
        <h3 className="font-semibold text-white mb-1">{title}</h3>
      </div>
        
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}
        {children}
      </motion.div>
    );
  }
);

NodeCardGlass.displayName = "NodeCardGlass";

export default NodeCardGlass;

