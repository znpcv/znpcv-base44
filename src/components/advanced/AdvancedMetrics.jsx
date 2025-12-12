import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Award, Zap, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AdvancedMetrics({ checklists, darkMode }) {
  const metrics = useMemo(() => {
    const executed = checklists.filter(t => t.outcome && t.outcome !== 'pending');
    const wins = executed.filter(t => t.outcome === 'win');
    const losses = executed.filter(t => t.outcome === 'loss');
    
    const totalPnL = executed.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
    const totalRisk = executed.reduce((sum, t) => {
      const acc = parseFloat(t.account_size || 0);
      const risk = parseFloat(t.risk_percent || 0);
      return sum + (acc * risk / 100);
    }, 0);
    
    const profitFactor = losses.length > 0 
      ? Math.abs(wins.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / 
          losses.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0))
      : wins.length > 0 ? Infinity : 0;
    
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
    
    const avgScore = executed.length > 0
      ? executed.reduce((sum, t) => sum + (t.completion_percentage || 0), 0) / executed.length
      : 0;
    
    const streakData = (() => {
      let current = 0;
      let maxWin = 0;
      let maxLoss = 0;
      
      executed.forEach(t => {
        if (t.outcome === 'win') {
          current = current > 0 ? current + 1 : 1;
          maxWin = Math.max(maxWin, current);
        } else if (t.outcome === 'loss') {
          current = current < 0 ? current - 1 : -1;
          maxLoss = Math.max(maxLoss, Math.abs(current));
        } else {
          current = 0;
        }
      });
      
      return { maxWin, maxLoss, current };
    })();
    
    return {
      profitFactor: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2),
      avgRR: avgRR.toFixed(2),
      avgScore: avgScore.toFixed(0),
      expectancy: executed.length > 0 ? (totalPnL / executed.length).toFixed(2) : '0',
      maxWinStreak: streakData.maxWin,
      maxLossStreak: streakData.maxLoss,
      roi: totalRisk > 0 ? ((totalPnL / totalRisk) * 100).toFixed(1) : '0',
    };
  }, [checklists]);

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
    >
      <div className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bg}`}>
        <Zap className={`w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 ${theme.text}`} />
        <div className={`text-2xl sm:text-3xl font-light mb-1 sm:mb-2 ${theme.text}`}>{metrics.profitFactor}</div>
        <div className={`text-xs tracking-widest ${theme.textMuted}`}>PROFIT FACTOR</div>
      </div>
      <div className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bg}`}>
        <Target className={`w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 ${theme.text}`} />
        <div className={`text-2xl sm:text-3xl font-light mb-1 sm:mb-2 ${theme.text}`}>1:{metrics.avgRR}</div>
        <div className={`text-xs tracking-widest ${theme.textMuted}`}>AVG R:R</div>
      </div>
      <div className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bg}`}>
        <Award className={`w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 ${theme.text}`} />
        <div className={`text-2xl sm:text-3xl font-light mb-1 sm:mb-2 ${theme.text}`}>{metrics.avgScore}%</div>
        <div className={`text-xs tracking-widest ${theme.textMuted}`}>AVG SCORE</div>
      </div>
      <div className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bg}`}>
        <Activity className={`w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 ${theme.text}`} />
        <div className={`text-2xl sm:text-3xl font-light mb-1 sm:mb-2 ${theme.text}`}>{metrics.roi}%</div>
        <div className={`text-xs tracking-widest ${theme.textMuted}`}>ROI</div>
      </div>
    </motion.div>
  );
}