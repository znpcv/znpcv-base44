import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Award, Activity, TrendingUp, BarChart3 } from 'lucide-react';

export default function QuickStats({ checklists, darkMode }) {
  const stats = useMemo(() => {
    const executed = checklists.filter(t => t.outcome && t.outcome !== 'pending');
    const wins = executed.filter(t => t.outcome === 'win');
    const losses = executed.filter(t => t.outcome === 'loss');
    
    const profitFactor = losses.length > 0 
      ? Math.abs(wins.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / 
          Math.abs(losses.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0)))
      : wins.length > 0 ? 999 : 0;
    
    const avgRR = executed.filter(t => t.take_profit && t.stop_loss && t.entry_price).length > 0
      ? (executed.filter(t => t.take_profit && t.stop_loss && t.entry_price).reduce((sum, t) => {
          const entry = parseFloat(t.entry_price);
          const sl = parseFloat(t.stop_loss);
          const tp = parseFloat(t.take_profit);
          const isLong = t.direction === 'long';
          const slDist = isLong ? entry - sl : sl - entry;
          const tpDist = isLong ? tp - entry : entry - tp;
          return sum + (slDist > 0 ? tpDist / slDist : 0);
        }, 0) / executed.filter(t => t.take_profit && t.stop_loss && t.entry_price).length)
      : 0;
    
    const bestTrade = executed.length > 0 
      ? executed.reduce((max, t) => parseFloat(t.actual_pnl || 0) > parseFloat(max.actual_pnl || 0) ? t : max, executed[0])
      : null;
    
    const consistency = executed.length >= 10 
      ? (executed.slice(-10).filter(t => t.outcome === 'win').length / 10 * 100).toFixed(0)
      : 0;

    return { profitFactor, avgRR, bestTrade, consistency };
  }, [checklists]);

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
      <motion.div className={`border ${theme.border} rounded-2xl p-3 sm:p-4 ${theme.bg}`}>
        <Zap className={`w-4 h-4 mb-2 ${theme.text}`} />
        <div className={`text-xl sm:text-2xl font-light mb-1 ${theme.text}`}>
          {stats.profitFactor > 10 ? '∞' : stats.profitFactor.toFixed(2)}
        </div>
        <div className={`text-[10px] tracking-widest ${theme.textMuted}`}>PROFIT FACTOR</div>
      </motion.div>
      
      <motion.div className={`border ${theme.border} rounded-2xl p-3 sm:p-4 ${theme.bg}`}>
        <Target className={`w-4 h-4 mb-2 ${theme.text}`} />
        <div className={`text-xl sm:text-2xl font-light mb-1 ${theme.text}`}>1:{stats.avgRR.toFixed(2)}</div>
        <div className={`text-[10px] tracking-widest ${theme.textMuted}`}>AVG R:R</div>
      </motion.div>
      
      <motion.div className={`border ${theme.border} rounded-2xl p-3 sm:p-4 ${theme.bg}`}>
        <TrendingUp className={`w-4 h-4 mb-2 text-teal-600`} />
        <div className={`text-xl sm:text-2xl font-light mb-1 text-teal-600`}>
          ${stats.bestTrade ? parseFloat(stats.bestTrade.actual_pnl).toFixed(0) : '0'}
        </div>
        <div className={`text-[10px] tracking-widest ${theme.textMuted}`}>BEST TRADE</div>
      </motion.div>
      
      <motion.div className={`border ${theme.border} rounded-2xl p-3 sm:p-4 ${theme.bg}`}>
        <BarChart3 className={`w-4 h-4 mb-2 ${theme.text}`} />
        <div className={`text-xl sm:text-2xl font-light mb-1 ${theme.text}`}>{stats.consistency}%</div>
        <div className={`text-[10px] tracking-widest ${theme.textMuted}`}>CONSISTENCY (L10)</div>
      </motion.div>
    </div>
  );
}