import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Target } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AOIAnalysis({ aoiPosition, onAOIChange, aoiIdentified, onAOIIdentifiedChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">
          Area of Interest (AOI)
        </label>
      </div>
      
      {/* AOI Identified Check */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => onAOIIdentifiedChange(!aoiIdentified)}
        className={cn(
          "w-full p-4 rounded-lg border flex items-center gap-3 transition-all",
          aoiIdentified 
            ? "bg-[#4A5D23]/20 border-[#4A5D23]/50" 
            : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-600"
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded border-2 flex items-center justify-center",
          aoiIdentified ? "bg-[#4A5D23] border-[#4A5D23]" : "border-zinc-600"
        )}>
          {aoiIdentified && <Target className="w-4 h-4 text-white" />}
        </div>
        <div className="text-left">
          <span className={cn("font-medium", aoiIdentified ? "text-white" : "text-zinc-400")}>
            AOI identifiziert
          </span>
          <p className="text-xs text-zinc-500">W - Daily & 4hr Confluence Zone gefunden</p>
        </div>
      </motion.button>

      {/* Price Position relative to AOI */}
      {aoiIdentified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-xs text-zinc-500 uppercase tracking-wider">
            Preis Position zum AOI
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onAOIChange('above')}
              className={cn(
                "p-4 rounded-lg border flex flex-col items-center gap-2 transition-all",
                aoiPosition === 'above'
                  ? "bg-green-500/10 border-green-500/50 text-green-500"
                  : "bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:border-zinc-600"
              )}
            >
              <ArrowUp className="w-6 h-6" />
              <span className="font-bold text-sm">ÜBER AOI</span>
              <span className="text-xs opacity-70">Potentieller Short</span>
            </button>
            
            <button
              onClick={() => onAOIChange('below')}
              className={cn(
                "p-4 rounded-lg border flex flex-col items-center gap-2 transition-all",
                aoiPosition === 'below'
                  ? "bg-red-500/10 border-red-500/50 text-red-500"
                  : "bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:border-zinc-600"
              )}
            >
              <ArrowDown className="w-6 h-6" />
              <span className="font-bold text-sm">UNTER AOI</span>
              <span className="text-xs opacity-70">Potentieller Long</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}