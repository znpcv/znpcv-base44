import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function SectionProgressBar({ current, max, label, darkMode }) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  const getColor = () => {
    const ratio = current / max;
    if (ratio >= 0.7) return 'bg-teal-600';
    if (ratio >= 0.4) return 'bg-amber-500';
    return darkMode ? 'bg-zinc-700' : 'bg-zinc-400';
  };

  return (
    <div className={`px-3 py-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] sm:text-xs tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {label}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={cn(
            "text-lg sm:text-xl md:text-2xl font-bold",
            percentage >= 70 ? "text-teal-600" : percentage >= 40 ? "text-amber-500" : darkMode ? "text-white" : "text-black"
          )}>
            {current}
          </span>
          <span className={`${darkMode ? 'text-zinc-600' : 'text-zinc-400'} text-xs sm:text-sm`}>/{max}</span>
        </div>
      </div>
      <div className={`h-2 sm:h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`}>
        <motion.div 
          className={cn("h-full rounded-full", getColor())}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}