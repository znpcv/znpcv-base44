import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

export default function TradeCompareModal({ trade1, trade2, onClose, darkMode }) {
  const theme = {
    bg: darkMode ? 'bg-zinc-900' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const calculateScore = (trade) => {
    const w = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + (trade.w_candlestick ? 10 : 0) + 
      (trade.w_psp_rejection ? 10 : 0) + (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + 
      (trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);
    const d = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + (trade.d_candlestick ? 10 : 0) + 
      (trade.d_psp_rejection ? 10 : 0) + (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + 
      (trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);
    const h = (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + (trade.h4_psp_rejection ? 5 : 0) + 
      (trade.h4_swing ? 5 : 0) + (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);
    const e = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + 
      (trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);
    return { weekly: w, daily: d, h4: h, entry: e, total: w + d + h + e };
  };

  const score1 = calculateScore(trade1);
  const score2 = calculateScore(trade2);

  const CompareRow = ({ label, value1, value2, type = 'text' }) => {
    const isDifferent = value1 !== value2;
    return (
      <div className={cn("grid grid-cols-3 gap-2 py-2 border-b", theme.border)}>
        <div className={cn("text-xs", theme.textSecondary)}>{label}</div>
        <div className={cn("text-xs font-bold text-center", isDifferent && "text-teal-600")}>{value1 || '-'}</div>
        <div className={cn("text-xs font-bold text-center", isDifferent && "text-rose-600")}>{value2 || '-'}</div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.1 }}
        className={cn("max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border-2 p-6", theme.bg, theme.border)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={cn("text-xl tracking-widest", theme.text)}>TRADE VERGLEICH</h2>
          <button onClick={onClose} className={cn("p-2 rounded-lg transition-colors", darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-200")}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Headers */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={cn("text-xs font-bold", theme.textSecondary)}>KATEGORIE</div>
          <div className="text-center">
            <div className={cn("text-lg font-bold mb-1", theme.text)}>{trade1.pair}</div>
            <div className={cn("text-xs", trade1.direction === 'long' ? 'text-teal-600' : 'text-rose-600')}>
              {trade1.direction === 'long' ? '↑ LONG' : '↓ SHORT'}
            </div>
          </div>
          <div className="text-center">
            <div className={cn("text-lg font-bold mb-1", theme.text)}>{trade2.pair}</div>
            <div className={cn("text-xs", trade2.direction === 'long' ? 'text-teal-600' : 'text-rose-600')}>
              {trade2.direction === 'long' ? '↑ LONG' : '↓ SHORT'}
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className={cn("rounded-xl p-4 mb-4", darkMode ? "bg-zinc-950" : "bg-zinc-100")}>
          <CompareRow label="TOTAL SCORE" value1={`${score1.total}%`} value2={`${score2.total}%`} />
          <CompareRow label="Weekly" value1={`${score1.weekly}/60`} value2={`${score2.weekly}/60`} />
          <CompareRow label="Daily" value1={`${score1.daily}/60`} value2={`${score2.daily}/60`} />
          <CompareRow label="4H" value1={`${score1.h4}/35`} value2={`${score2.h4}/35`} />
          <CompareRow label="Entry" value1={`${score1.entry}/25`} value2={`${score2.entry}/25`} />
        </div>

        {/* Trade Details */}
        <div className={cn("rounded-xl p-4", darkMode ? "bg-zinc-950" : "bg-zinc-100")}>
          <CompareRow label="Entry" value1={trade1.entry_price} value2={trade2.entry_price} />
          <CompareRow label="Stop Loss" value1={trade1.stop_loss} value2={trade2.stop_loss} />
          <CompareRow label="Take Profit" value1={trade1.take_profit} value2={trade2.take_profit} />
          <CompareRow label="Risk %" value1={trade1.risk_percent} value2={trade2.risk_percent} />
          <CompareRow label="Outcome" value1={trade1.outcome || 'pending'} value2={trade2.outcome || 'pending'} />
          <CompareRow label="P&L" value1={trade1.actual_pnl ? `$${trade1.actual_pnl}` : '-'} value2={trade2.actual_pnl ? `$${trade2.actual_pnl}` : '-'} />
        </div>

        <Button onClick={onClose} className={cn("w-full mt-6 h-11 font-bold border-2", 
          darkMode ? "bg-white text-black border-white" : "bg-zinc-900 text-white border-zinc-900")}>
          Schließen
        </Button>
      </motion.div>
    </motion.div>
  );
}