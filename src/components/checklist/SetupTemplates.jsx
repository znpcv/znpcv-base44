import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Each template pre-fills confluence criteria fields
const TEMPLATES = [
  {
    id: 'order_block',
    name: 'Order Block Rejection',
    emoji: '🧱',
    description: 'Price rejects a fresh order block on all timeframes with PSP confirmation',
    criteria: {
      w_at_aoi: true,
      w_psp_rejection: true,
      w_candlestick: true,
      d_at_aoi: true,
      d_psp_rejection: true,
      d_candlestick: true,
      h4_at_aoi: true,
      h4_psp_rejection: true,
      h4_candlestick: true,
      entry_sos: true,
      entry_engulfing: true,
    }
  },
  {
    id: 'trend_continuation',
    name: 'Trend Continuation',
    emoji: '📈',
    description: 'Strong trending market with EMA confluence and swing structure intact',
    criteria: {
      w_at_aoi: true,
      w_ema_touch: true,
      w_swing: true,
      d_at_aoi: true,
      d_ema_touch: true,
      d_swing: true,
      h4_at_aoi: true,
      h4_swing: true,
      entry_sos: true,
      entry_engulfing: true,
    }
  },
  {
    id: 'round_level_rejection',
    name: 'Round Level Rejection',
    emoji: '🎯',
    description: 'Price rejects a key psychological round number with candlestick confirmation',
    criteria: {
      w_round_level: true,
      w_candlestick: true,
      d_round_level: true,
      d_candlestick: true,
      h4_candlestick: true,
      entry_sos: true,
      entry_engulfing: true,
    }
  },
  {
    id: 'swing_reversal',
    name: 'Swing High / Low Reversal',
    emoji: '↩️',
    description: 'Multi-timeframe swing point reached with full candlestick rejection',
    criteria: {
      w_swing: true,
      w_candlestick: true,
      w_at_aoi: true,
      d_swing: true,
      d_candlestick: true,
      d_at_aoi: true,
      h4_swing: true,
      h4_candlestick: true,
      h4_at_aoi: true,
      entry_sos: true,
    }
  },
  {
    id: 'full_confluence',
    name: 'Full Confluence Setup',
    emoji: '⭐',
    description: 'Maximum confluence: AOI + EMA + PSP + Swing across all timeframes',
    criteria: {
      w_at_aoi: true,
      w_ema_touch: true,
      w_candlestick: true,
      w_psp_rejection: true,
      w_swing: true,
      d_at_aoi: true,
      d_ema_touch: true,
      d_candlestick: true,
      d_psp_rejection: true,
      d_swing: true,
      h4_at_aoi: true,
      h4_candlestick: true,
      h4_psp_rejection: true,
      h4_swing: true,
      entry_sos: true,
      entry_engulfing: true,
    }
  },
];

export default function SetupTemplates({ onApply, darkMode = true }) {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(null);

  const handleApply = (template) => {
    onApply(template.criteria);
    setApplied(template.id);
    setOpen(false);
    setTimeout(() => setApplied(null), 3000);
  };

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textDimmed: darkMode ? 'text-zinc-600' : 'text-zinc-400',
  };

  return (
    <div className={cn('rounded-xl border-2 overflow-hidden', theme.border,
      darkMode ? 'border-violet-700/40 bg-violet-700/5' : 'border-violet-400/40 bg-violet-50')}>

      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
            darkMode ? 'bg-violet-700/30' : 'bg-violet-100')}>
            <Zap className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-left">
            <div className={cn('text-xs font-bold tracking-widest', darkMode ? 'text-violet-400' : 'text-violet-600')}>
              SETUP TEMPLATES
            </div>
            <div className={cn('text-[10px] font-sans', theme.textDimmed)}>
              {applied ? '✓ Template applied' : 'Auto-fill confluence criteria'}
            </div>
          </div>
        </div>
        {open
          ? <ChevronUp className={cn('w-4 h-4', theme.textMuted)} />
          : <ChevronDown className={cn('w-4 h-4', theme.textMuted)} />
        }
      </button>

      {/* Template List */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={cn('border-t', theme.border)}>
              <div className="p-3 space-y-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApply(tpl)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left transition-all',
                      applied === tpl.id
                        ? 'border-emerald-600 bg-emerald-700/20'
                        : darkMode
                          ? 'border-zinc-800 bg-zinc-900 hover:border-violet-600/50 hover:bg-violet-700/10'
                          : 'border-zinc-200 bg-white hover:border-violet-400/50 hover:bg-violet-50'
                    )}
                  >
                    <span className="text-xl shrink-0">{tpl.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-xs font-bold tracking-wider', theme.text)}>{tpl.name}</div>
                      <div className={cn('text-[10px] font-sans leading-tight mt-0.5', theme.textMuted)}>{tpl.description}</div>
                    </div>
                    {applied === tpl.id
                      ? <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      : <div className={cn('text-[9px] font-bold tracking-widest px-2 py-1 rounded-lg border shrink-0',
                          darkMode ? 'border-violet-700/50 text-violet-400' : 'border-violet-300 text-violet-600')}>
                          APPLY
                        </div>
                    }
                  </button>
                ))}
              </div>
              <div className={cn('px-4 py-2 text-[9px] font-sans border-t', theme.border, theme.textDimmed)}>
                Templates pre-fill confluence checkboxes — you can still adjust each item manually.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}