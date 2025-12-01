import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

const ENTRY_ITEMS = [
  { key: 'sos_confirmed', label: 'SOS bestätigt (30m-1hr)', description: 'Sign of Strength sichtbar' },
  { key: 'engulfing_confirmed', label: 'Engulfing Candle (30m-1hr)', description: 'Engulfing Pattern erkannt' },
  { key: 'fvg_ob_confirmed', label: 'FVG / Order Block', description: 'Fair Value Gap oder OB Entry' },
  { key: 'risk_reward', label: 'Risk/Reward ≥ 1:2', description: 'Minimum RR Ratio erfüllt' },
  { key: 'sl_placed', label: 'Stop Loss platziert', description: 'SL auf strukturellem Level' },
  { key: 'tp_placed', label: 'Take Profit definiert', description: 'TP Ziele festgelegt' },
];

export default function EntryChecklist({ entryChecks, onEntryCheckChange }) {
  const completedCount = Object.values(entryChecks).filter(Boolean).length;
  const allCompleted = completedCount === ENTRY_ITEMS.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">
          Entry Checkliste
        </label>
        <span className={cn(
          "text-xs font-bold",
          allCompleted ? "text-[#4A5D23]" : "text-zinc-500"
        )}>
          {completedCount}/{ENTRY_ITEMS.length}
        </span>
      </div>

      <div className="space-y-2">
        {ENTRY_ITEMS.map((item, index) => {
          const isChecked = entryChecks[item.key];
          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onEntryCheckChange(item.key, !isChecked)}
              className={cn(
                "w-full p-4 rounded-lg border flex items-center gap-3 transition-all text-left",
                isChecked 
                  ? "bg-[#4A5D23]/10 border-[#4A5D23]/30" 
                  : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-600"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                isChecked ? "bg-[#4A5D23] border-[#4A5D23]" : "border-zinc-600"
              )}>
                {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>
              <div>
                <span className={cn(
                  "font-medium text-sm transition-all",
                  isChecked ? "text-zinc-400 line-through" : "text-white"
                )}>
                  {item.label}
                </span>
                <p className="text-xs text-zinc-500">{item.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-[#4A5D23] rounded-lg text-center"
        >
          <span className="text-white font-bold tracking-wider">
            ✓ READY TO EXECUTE TRADE
          </span>
        </motion.div>
      )}
    </div>
  );
}