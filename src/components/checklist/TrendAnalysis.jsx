import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";

const TIMEFRAMES = [
  { key: 'weekly', label: 'Weekly', description: 'Haupttrend' },
  { key: 'daily', label: 'Daily', description: 'Mittelfristig' },
  { key: 'h4', label: '4H', description: 'Einstieg' },
];

const TRENDS = [
  { value: 'bullish', label: 'Bullish', icon: TrendingUp, color: 'text-green-500 bg-green-500/10 border-green-500/30' },
  { value: 'bearish', label: 'Bearish', icon: TrendingDown, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  { value: 'neutral', label: 'Neutral', icon: Minus, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' },
];

export default function TrendAnalysis({ trends, onTrendChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">
          Trend Analyse
        </label>
        <span className="text-xs text-zinc-600 italic">W → D → 4H Confluence</span>
      </div>
      
      <div className="space-y-3">
        {TIMEFRAMES.map((tf, tfIndex) => (
          <motion.div
            key={tf.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: tfIndex * 0.1 }}
            className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-white">{tf.label}</span>
                <span className="text-xs text-zinc-500 ml-2">{tf.description}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {TRENDS.map((trend) => {
                const Icon = trend.icon;
                const isSelected = trends[tf.key] === trend.value;
                return (
                  <button
                    key={trend.value}
                    onClick={() => onTrendChange(tf.key, trend.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-2 rounded-lg border transition-all",
                      isSelected ? trend.color : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{trend.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Confluence Indicator */}
      {trends.weekly && trends.daily && trends.h4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-lg border text-center",
            trends.weekly === trends.daily && trends.daily === trends.h4
              ? "bg-[#4A5D23]/20 border-[#4A5D23]/50"
              : "bg-amber-500/10 border-amber-500/30"
          )}
        >
          {trends.weekly === trends.daily && trends.daily === trends.h4 ? (
            <span className="text-[#4A5D23] font-bold text-sm">
              ✓ CONFLUENCE BESTÄTIGT - Alle Timeframes {trends.weekly}
            </span>
          ) : (
            <span className="text-amber-500 font-bold text-sm">
              ⚠ Keine Confluence - Mixed Signals
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}