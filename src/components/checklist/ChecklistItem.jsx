import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ChecklistItem({ 
  label, 
  checked, 
  onChange, 
  description,
  index 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onChange(!checked)}
      className={cn(
        "group cursor-pointer p-4 border-b border-zinc-800/50 transition-all duration-300",
        "hover:bg-zinc-900/50",
        checked && "bg-[#4A5D23]/10"
      )}
    >
      <div className="flex items-center gap-4">
        <div 
          className={cn(
            "w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300",
            checked 
              ? "bg-[#4A5D23] border-[#4A5D23]" 
              : "border-zinc-600 group-hover:border-zinc-400"
          )}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </div>
        
        <div className="flex-1">
          <p className={cn(
            "font-medium transition-all duration-300",
            checked ? "text-zinc-400 line-through" : "text-white"
          )}>
            {label}
          </p>
          {description && (
            <p className="text-sm text-zinc-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}