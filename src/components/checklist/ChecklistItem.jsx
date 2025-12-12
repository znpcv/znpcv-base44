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
        "w-full p-4 rounded-xl border-2 transition-all text-left group relative overflow-hidden",
        checked 
          ? "bg-teal-600 border-teal-600" 
          : darkMode 
            ? "bg-zinc-900 border-zinc-800 hover:border-teal-600/50"
            : "bg-white border-zinc-200 hover:border-teal-600/50"
      )}
    >
      {weight && (
        <div className={cn("absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold",
          checked ? "bg-white/20 text-white" : "bg-teal-600/10 text-teal-600")}>
          +{weight}%
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all",
          checked ? "bg-white border-white" : darkMode ? "border-zinc-700" : "border-zinc-400"
        )}>
          {checked && <Check className="w-4 h-4 text-teal-600" strokeWidth={3} />}
        </div>
        <div className="flex-1">
          <div className={cn("text-sm font-bold tracking-wider mb-1", 
            checked ? "text-white" : darkMode ? "text-white" : "text-black")}>
            {label}
          </div>
          {description && (
            <div className={cn("text-xs leading-relaxed", 
              checked ? "text-teal-100" : darkMode ? "text-zinc-500" : "text-zinc-600")}>
              {description}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}