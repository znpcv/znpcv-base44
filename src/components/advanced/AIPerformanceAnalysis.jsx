import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Target, AlertTriangle, Award, Clock, DollarSign, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AIPerformanceAnalysis({ checklists, darkMode }) {
  const [expanded, setExpanded] = useState(false);

  const analysis = useMemo(() => {
    const executed = checklists.filter(t => t.outcome && t.outcome !== 'pending');
    if (executed.length < 5) return null;

    // Pattern Analysis
    const patterns = {
      bestPair: {},
      worstPair: {},
      bestDirection: { long: 0, short: 0 },
      timeOfDay: {},
      scoreCorrelation: [],
      commonMistakes: [],
      strengths: [],
    };

    executed.forEach(trade => {
      // Pair Performance
      const pair = trade.pair;
      if (!patterns.bestPair[pair]) patterns.bestPair[pair] = { wins: 0, losses: 0, pnl: 0 };
      if (trade.outcome === 'win') patterns.bestPair[pair].wins++;
      else if (trade.outcome === 'loss') patterns.bestPair[pair].losses++;
      patterns.bestPair[pair].pnl += parseFloat(trade.actual_pnl || 0);

      // Direction Performance
      if (trade.direction === 'long' && trade.outcome === 'win') patterns.bestDirection.long++;
      else if (trade.direction === 'short' && trade.outcome === 'win') patterns.bestDirection.short++;

      // Score Correlation
      if (trade.completion_percentage) {
        patterns.scoreCorrelation.push({
          score: trade.completion_percentage,
          outcome: trade.outcome
        });
      }

      // Time Analysis
      const hour = new Date(trade.created_date).getHours();
      const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      if (!patterns.timeOfDay[timeSlot]) patterns.timeOfDay[timeSlot] = { wins: 0, losses: 0 };
      if (trade.outcome === 'win') patterns.timeOfDay[timeSlot].wins++;
      else if (trade.outcome === 'loss') patterns.timeOfDay[timeSlot].losses++;

      // Common Mistakes
      if (trade.outcome === 'loss') {
        if (trade.completion_percentage < 85) {
          patterns.commonMistakes.push('Trading mit Score unter 85%');
        }
        if (!trade.w_trend || !trade.d_trend || trade.w_trend !== trade.d_trend) {
          patterns.commonMistakes.push('Keine Confluence zwischen Timeframes');
        }
      }

      // Strengths
      if (trade.outcome === 'win' && trade.completion_percentage >= 85) {
        patterns.strengths.push('Hohe Disziplin bei A+++ Setups');
      }
    });

    // Calculate best pair
    const bestPair = Object.entries(patterns.bestPair).reduce((best, [pair, data]) => {
      const winRate = data.wins / (data.wins + data.losses);
      return (!best || winRate > best.winRate) ? { pair, winRate, pnl: data.pnl, ...data } : best;
    }, null);

    // Best direction
    const bestDirection = patterns.bestDirection.long > patterns.bestDirection.short ? 'LONG' : 'SHORT';

    // Best time
    const bestTime = Object.entries(patterns.timeOfDay).reduce((best, [time, data]) => {
      const winRate = data.wins / (data.wins + data.losses);
      return (!best || winRate > best.winRate) ? { time, winRate, ...data } : best;
    }, null);

    // Score effectiveness
    const highScoreTrades = patterns.scoreCorrelation.filter(t => t.score >= 85);
    const highScoreWinRate = highScoreTrades.length > 0 
      ? (highScoreTrades.filter(t => t.outcome === 'win').length / highScoreTrades.length * 100).toFixed(0)
      : 0;

    // Unique mistakes (deduplicate)
    const uniqueMistakes = [...new Set(patterns.commonMistakes)].slice(0, 3);
    const uniqueStrengths = [...new Set(patterns.strengths)].slice(0, 3);

    return {
      bestPair,
      bestDirection,
      bestTime,
      highScoreWinRate,
      uniqueMistakes,
      uniqueStrengths,
      totalAnalyzed: executed.length
    };
  }, [checklists]);

  if (!analysis) return null;

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 ${expanded ? 'border-blue-600/50' : theme.border} rounded-2xl overflow-hidden ${theme.bg}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full p-4 sm:p-5 flex items-center justify-between hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className={`text-base sm:text-lg tracking-widest font-bold ${theme.text}`}>
              AI PERFORMANCE INSIGHTS
            </h3>
            <p className={`text-xs ${theme.textMuted}`}>
              Analysiert {analysis.totalAnalyzed} Trades
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-xs font-bold">
            BETA
          </div>
          {expanded ? <ChevronUp className={`w-5 h-5 ${theme.text}`} /> : <ChevronDown className={`w-5 h-5 ${theme.text}`} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 space-y-4 border-t border-blue-600/20">
              {/* Best Performers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-teal-600" />
                    <span className={`text-xs ${theme.textMuted}`}>BEST PAIR</span>
                  </div>
                  <div className={`text-xl font-bold ${theme.text}`}>{analysis.bestPair.pair}</div>
                  <div className="text-xs text-teal-600">{(analysis.bestPair.winRate * 100).toFixed(0)}% Win Rate</div>
                  <div className={`text-xs ${theme.textMuted}`}>PnL: ${analysis.bestPair.pnl.toFixed(0)}</div>
                </div>

                <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className={`text-xs ${theme.textMuted}`}>BEST DIRECTION</span>
                  </div>
                  <div className={`text-xl font-bold ${theme.text}`}>{analysis.bestDirection}</div>
                  <div className="text-xs text-blue-500">Trades fokussieren</div>
                </div>

                <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className={`text-xs ${theme.textMuted}`}>BEST TIME</span>
                  </div>
                  <div className={`text-xl font-bold ${theme.text} capitalize`}>{analysis.bestTime.time}</div>
                  <div className="text-xs text-purple-500">{(analysis.bestTime.winRate * 100).toFixed(0)}% Win Rate</div>
                </div>
              </div>

              {/* Score Effectiveness */}
              <div className={`${theme.bgCard} border-2 border-teal-600/30 rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-teal-600" />
                  <span className={`text-sm font-bold ${theme.text}`}>ZNPCV SCORE EFFECTIVENESS</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-teal-600">{analysis.highScoreWinRate}%</div>
                  <div className={`text-xs ${theme.textMuted}`}>
                    Win Rate bei Trades mit 85%+ Score<br/>
                    <span className="text-teal-600 font-bold">→ Nur A+++ Setups traden!</span>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {analysis.uniqueStrengths.length > 0 && (
                <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-teal-600" />
                    <span className={`text-sm font-bold ${theme.text}`}>STÄRKEN</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.uniqueStrengths.map((strength, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-teal-600 text-xs font-bold">✓</span>
                        </div>
                        <span className={`text-xs ${theme.text}`}>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Mistakes */}
              {analysis.uniqueMistakes.length > 0 && (
                <div className={`${theme.bgCard} border-2 border-amber-500/30 rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className={`text-sm font-bold ${theme.text}`}>VERBESSERUNGSPOTENZIAL</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.uniqueMistakes.map((mistake, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-amber-500 text-xs font-bold">!</span>
                        </div>
                        <span className={`text-xs ${theme.text}`}>{mistake}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className={`bg-gradient-to-r ${darkMode ? 'from-blue-600/20 to-purple-600/20' : 'from-blue-500/20 to-purple-500/20'} border-2 ${darkMode ? 'border-blue-600/30' : 'border-blue-500/30'} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className={`text-sm font-bold ${theme.text}`}>AI EMPFEHLUNGEN</span>
                </div>
                <div className="space-y-2 text-xs">
                  <p className={theme.text}>
                    <span className="font-bold text-blue-500">1.</span> Fokussiere dich auf <span className="font-bold">{analysis.bestPair.pair}</span> in der <span className="font-bold capitalize">{analysis.bestTime.time}</span>-Session
                  </p>
                  <p className={theme.text}>
                    <span className="font-bold text-blue-500">2.</span> Bevorzuge <span className="font-bold">{analysis.bestDirection}</span> Setups - hier ist deine Win Rate am höchsten
                  </p>
                  <p className={theme.text}>
                    <span className="font-bold text-blue-500">3.</span> Trade NUR noch bei 85%+ Score - deine Win Rate steigt auf <span className="font-bold text-teal-600">{analysis.highScoreWinRate}%</span>
                  </p>
                  {analysis.uniqueMistakes.length > 0 && (
                    <p className={theme.text}>
                      <span className="font-bold text-blue-500">4.</span> Vermeide Trades ohne klare Confluence zwischen allen Timeframes
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}