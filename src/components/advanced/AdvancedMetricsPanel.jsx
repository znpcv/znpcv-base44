import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Award, Target, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

export default function AdvancedMetricsPanel({ trades, darkMode }) {
  const { t } = useLanguage();

  const metrics = useMemo(() => {
    const executedTrades = trades.filter(t => t.outcome && t.outcome !== 'pending' && t.actual_pnl);
    
    if (executedTrades.length === 0) {
      return null;
    }

    const wins = executedTrades.filter(t => t.outcome === 'win');
    const losses = executedTrades.filter(t => t.outcome === 'loss');

    // Calculate P&L values
    const pnlValues = executedTrades.map(t => parseFloat(t.actual_pnl || 0));
    const winPnls = wins.map(t => parseFloat(t.actual_pnl || 0));
    const lossPnls = losses.map(t => Math.abs(parseFloat(t.actual_pnl || 0)));

    const totalPnL = pnlValues.reduce((sum, val) => sum + val, 0);
    const avgWin = winPnls.length > 0 ? winPnls.reduce((sum, val) => sum + val, 0) / winPnls.length : 0;
    const avgLoss = lossPnls.length > 0 ? lossPnls.reduce((sum, val) => sum + val, 0) / lossPnls.length : 0;

    // Profit Factor
    const grossProfit = winPnls.reduce((sum, val) => sum + val, 0);
    const grossLoss = lossPnls.reduce((sum, val) => sum + val, 0);
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    // Sharpe Ratio (simplified)
    const avgPnL = pnlValues.reduce((sum, val) => sum + val, 0) / pnlValues.length;
    const variance = pnlValues.reduce((sum, val) => sum + Math.pow(val - avgPnL, 2), 0) / pnlValues.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgPnL / stdDev : 0;

    // Max Drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;

    executedTrades.forEach(trade => {
      cumulative += parseFloat(trade.actual_pnl || 0);
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Win Rate
    const winRate = executedTrades.length > 0 ? (wins.length / executedTrades.length) * 100 : 0;

    // Risk/Reward Ratio
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Expectancy
    const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss);

    return {
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      avgRR,
      expectancy,
      totalTrades: executedTrades.length,
      winRate
    };
  }, [trades]);

  if (!metrics) {
    return (
      <div className={cn("rounded-xl border-2 p-6 text-center", 
        darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600')}>
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Nicht genug Trades mit P&L Daten für erweiterte Metriken</p>
      </div>
    );
  }

  const theme = {
    bg: darkMode ? 'bg-zinc-900' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-800/50' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    borderCard: darkMode ? 'border-zinc-700' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
  };

  const metricsData = [
    {
      label: 'PROFIT FACTOR',
      value: metrics.profitFactor.toFixed(2),
      icon: TrendingUp,
      color: metrics.profitFactor >= 2 ? 'teal' : metrics.profitFactor >= 1 ? 'blue' : 'rose',
      description: 'Bruttogewinn / Bruttoverlust',
      benchmark: '> 2.0 Exzellent, > 1.0 Profitabel'
    },
    {
      label: 'SHARPE RATIO',
      value: metrics.sharpeRatio.toFixed(2),
      icon: Activity,
      color: metrics.sharpeRatio >= 1 ? 'teal' : metrics.sharpeRatio >= 0.5 ? 'blue' : 'zinc',
      description: 'Risk-adjusted Return',
      benchmark: '> 1.0 Sehr gut, > 0.5 Gut'
    },
    {
      label: 'MAX DRAWDOWN',
      value: `$${metrics.maxDrawdown.toFixed(2)}`,
      icon: TrendingDown,
      color: 'rose',
      description: 'Größter Verlust vom Peak',
      benchmark: 'Kleiner = Besser'
    },
    {
      label: 'AVG R:R',
      value: `1:${metrics.avgRR.toFixed(2)}`,
      icon: Target,
      color: metrics.avgRR >= 2 ? 'teal' : metrics.avgRR >= 1 ? 'blue' : 'zinc',
      description: 'Durchschnittliches Risk/Reward',
      benchmark: '> 1:2 Optimal'
    },
    {
      label: 'EXPECTANCY',
      value: `$${metrics.expectancy.toFixed(2)}`,
      icon: Award,
      color: metrics.expectancy > 0 ? 'teal' : 'rose',
      description: 'Erwarteter Gewinn pro Trade',
      benchmark: '> 0 Profitables System'
    },
    {
      label: 'KONSISTENZ',
      value: `${metrics.winRate.toFixed(0)}%`,
      icon: AlertTriangle,
      color: metrics.winRate >= 60 ? 'teal' : metrics.winRate >= 50 ? 'blue' : 'zinc',
      description: 'Win Rate',
      benchmark: `${metrics.totalTrades} Trades`
    }
  ];

  const getColorClass = (color) => {
    switch(color) {
      case 'teal': return 'text-teal-600';
      case 'blue': return 'text-blue-500';
      case 'rose': return 'text-rose-600';
      default: return theme.textMuted;
    }
  };

  return (
    <div className={cn("rounded-xl border-2 p-4 sm:p-5 md:p-6", theme.bg, theme.border)}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className={cn("w-5 h-5", theme.text)} />
        <h3 className={cn("text-sm tracking-wider font-bold", theme.text)}>ADVANCED METRICS</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {metricsData.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className={cn("p-4 rounded-lg border", theme.bgCard, theme.borderCard)}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-[10px] tracking-wider font-bold", theme.textMuted)}>{metric.label}</span>
                <Icon className={cn("w-4 h-4", getColorClass(metric.color))} />
              </div>
              <div className={cn("text-2xl font-bold mb-1", getColorClass(metric.color))}>
                {metric.value}
              </div>
              <div className={cn("text-xs mb-1", theme.textMuted)}>{metric.description}</div>
              <div className={cn("text-[10px] px-2 py-1 rounded-full inline-block", 
                darkMode ? 'bg-zinc-700/50' : 'bg-zinc-200')}>
                {metric.benchmark}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Assessment */}
      <div className={cn("mt-4 p-4 rounded-lg border", 
        metrics.profitFactor >= 1.5 && metrics.sharpeRatio >= 0.5 
          ? 'bg-teal-600/10 border-teal-600/30' 
          : 'bg-zinc-800/30 border-zinc-700')}>
        <div className="flex items-center gap-2 mb-2">
          <Award className={cn("w-4 h-4", 
            metrics.profitFactor >= 1.5 && metrics.sharpeRatio >= 0.5 ? 'text-teal-600' : theme.textMuted)} />
          <span className={cn("text-xs font-bold tracking-wider", theme.text)}>SYSTEM ASSESSMENT</span>
        </div>
        <p className={cn("text-sm", theme.textMuted)}>
          {metrics.profitFactor >= 2 && metrics.sharpeRatio >= 1 
            ? '🏆 Exzellentes Trading System! Hohe Profitabilität mit guter Risk-Adjusted Performance.'
            : metrics.profitFactor >= 1.5 && metrics.sharpeRatio >= 0.5
            ? '✅ Solides Trading System. Konsistent profitabel mit akzeptablem Risiko.'
            : metrics.profitFactor >= 1
            ? '⚠️ Profitabel aber verbesserungsfähig. Fokus auf besseres Risk Management.'
            : '❌ System braucht Optimierung. Überprüfe deine Strategie und Risk Management.'
          }
        </p>
      </div>
    </div>
  );
}