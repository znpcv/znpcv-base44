import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

import { useLanguage } from '@/components/LanguageContext';

export default function ChecklistItem({ 
  label, 
  checked, 
  onChange, 
  description,
  weight
}) {
  const { darkMode } = useLanguage();

  return (
    <motion.button
      type="button"
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left group relative overflow-hidden",
        checked 
          ? "bg-emerald-700 border-emerald-700" 
          : darkMode 
            ? "bg-zinc-900 border-zinc-800 hover:border-emerald-700/50"
            : "bg-white border-zinc-200 hover:border-emerald-700/50"
      )}
    >
      {weight && (
        <div className={cn("absolute top-1.5 sm:top-2 right-1.5 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold",
          checked ? "bg-white/20 text-white" : "bg-emerald-700/10 text-emerald-700")}>
          +{weight}%
        </div>
      )}
      <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
        <div className={cn(
          "w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all",
          checked ? "bg-white border-white" : darkMode ? "border-zinc-700" : "border-zinc-400"
        )}>
          {checked && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-700" strokeWidth={3} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-xs sm:text-sm font-bold tracking-wider mb-0.5 sm:mb-1", 
            checked ? "text-white" : darkMode ? "text-white" : "text-black")}>
            {label}
          </div>
          {description && (
            <div className={cn("text-[10px] sm:text-xs leading-relaxed font-sans", 
              checked ? "text-emerald-100" : darkMode ? "text-zinc-500" : "text-zinc-600")}>
              {description}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}