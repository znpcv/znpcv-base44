import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const PATTERNS = [
  { 
    key: 'head_shoulders', 
    label: 'Head & Shoulders', 
    icon: '👤',
    description: 'Umkehr-Pattern',
    type: 'reversal'
  },
  { 
    key: 'inv_head_shoulders', 
    label: 'Inv. Head & Shoulders', 
    icon: '🙃',
    description: 'Bullish Umkehr',
    type: 'reversal'
  },
  { 
    key: 'double_top', 
    label: 'Double Top', 
    icon: '⛰️',
    description: 'Bearish Signal',
    type: 'reversal'
  },
  { 
    key: 'double_bottom', 
    label: 'Double Bottom', 
    icon: '🏔️',
    description: 'Bullish Signal',
    type: 'reversal'
  },
  { 
    key: 'triangle', 
    label: 'Triangle', 
    icon: '📐',
    description: 'Continuation',
    type: 'continuation'
  },
  { 
    key: 'flag', 
    label: 'Flag / Pennant', 
    icon: '🚩',
    description: 'Continuation',
    type: 'continuation'
  },
  { 
    key: 'wedge', 
    label: 'Wedge', 
    icon: '◢',
    description: 'Reversal/Cont.',
    type: 'both'
  },
  { 
    key: 'channel', 
    label: 'Channel', 
    icon: '═',
    description: 'Range Trading',
    type: 'continuation'
  },
];

export default function PatternSelector({ selectedPatterns, onPatternToggle, patternConfirmed, onPatternConfirmedChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">
          Chart Patterns
        </label>
        <span className="text-xs text-zinc-600">{selectedPatterns.length} ausgewählt</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {PATTERNS.map((pattern, index) => {
          const isSelected = selectedPatterns.includes(pattern.key);
          return (
            <motion.button
              key={pattern.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onPatternToggle(pattern.key)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                isSelected
                  ? "bg-[#4A5D23]/20 border-[#4A5D23]/50"
                  : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-600"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{pattern.icon}</span>
                <div>
                  <div className={cn("font-medium text-sm", isSelected ? "text-white" : "text-zinc-400")}>
                    {pattern.label}
                  </div>
                  <div className="text-xs text-zinc-500">{pattern.description}</div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Pattern Confirmation */}
      {selectedPatterns.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onPatternConfirmedChange(!patternConfirmed)}
          className={cn(
            "w-full p-4 rounded-lg border flex items-center gap-3 transition-all mt-4",
            patternConfirmed 
              ? "bg-[#4A5D23]/20 border-[#4A5D23]/50" 
              : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-600"
          )}
        >
          <div className={cn(
            "w-6 h-6 rounded border-2 flex items-center justify-center",
            patternConfirmed ? "bg-[#4A5D23] border-[#4A5D23]" : "border-zinc-600"
          )}>
            {patternConfirmed && <span className="text-white text-sm">✓</span>}
          </div>
          <div className="text-left">
            <span className={cn("font-medium", patternConfirmed ? "text-white" : "text-zinc-400")}>
              Pattern bestätigt
            </span>
            <p className="text-xs text-zinc-500">Pattern ist klar erkennbar und valide</p>
          </div>
        </motion.button>
      )}
    </div>
  );
}