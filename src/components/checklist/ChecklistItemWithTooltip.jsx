import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ChecklistItemWithTooltip({ checked, onChange, label, weight, description, tooltip, darkMode, show = true }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "w-full border-2 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 transition-all group relative overflow-hidden",
          checked
            ? "bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-600/20"
            : darkMode
              ? "border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
              : "border-zinc-300 hover:border-zinc-400 bg-zinc-50 text-black hover:bg-zinc-100"
        )}
      >
        {checked && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
        )}
        
        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          <div className={cn(
            "w-5 h-5 sm:w-6 sm:h-6 border-2 flex items-center justify-center rounded-lg transition-all flex-shrink-0",
            checked ? "border-white bg-white scale-110" : darkMode ? "border-zinc-600" : "border-zinc-400"
          )}>
            {checked && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600" strokeWidth={3} />}
          </div>
          
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
              <span className={cn("font-bold tracking-wider text-xs sm:text-sm", checked ? "text-white" : darkMode ? "text-white" : "text-black")}>
                {label}
              </span>
              {tooltip && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(!showTooltip);
                  }}
                  className={cn("transition-colors", checked ? "text-white/70 hover:text-white" : darkMode ? "text-zinc-500 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-500")}
                >
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
            </div>
            {description && (
              <div className={cn("text-[10px] sm:text-xs font-sans leading-tight", checked ? "text-teal-100" : darkMode ? "text-zinc-500" : "text-zinc-600")}>
                {description}
              </div>
            )}
          </div>
          
          {weight && (
            <div className={cn("px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0",
              checked ? "bg-white text-teal-600" : darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600")}>
              +{weight}%
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn("overflow-hidden rounded-lg sm:rounded-xl mt-1 border-2",
              darkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-100 border-zinc-300"
            )}
          >
            <div className="p-2.5 sm:p-3">
              <div className={cn("text-xs font-sans leading-relaxed", darkMode ? "text-zinc-400" : "text-zinc-600")}>
                {tooltip}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}