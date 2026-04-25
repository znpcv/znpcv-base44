import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, TrendingDown, MapPin, Layers, Activity, Target, DollarSign, AlertTriangle, Shield, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function NoTradeSkills({ 
  formData, 
  weeklyScore, 
  dailyScore, 
  h4Score, 
  entryScore, 
  riskCalc,
  darkMode,
  onNoTrade 
}) {
  const conditions = useMemo(() => {
    const detected = [];
    const totalScore = weeklyScore + dailyScore + h4Score + entryScore;

    if (!formData.pair || !formData.direction) return detected;

    const hasNoTrends = !formData.w_trend || !formData.d_trend || !formData.h4_trend;
    const hasMixedTrends = formData.w_trend && formData.d_trend && formData.h4_trend &&
      (formData.w_trend !== formData.d_trend || formData.d_trend !== formData.h4_trend);
    if (hasNoTrends || hasMixedTrends) {
      detected.push({ id: 'choppy_market', icon: TrendingDown, title: 'Unklarer Markt', severity: 'critical' });
    }

    const aoiCount = [formData.w_at_aoi, formData.d_at_aoi, formData.h4_at_aoi].filter(Boolean).length;
    if (aoiCount === 0 && formData.w_trend) {
      detected.push({ id: 'mid_range', icon: MapPin, title: 'Kein AOI bestätigt', severity: 'critical' });
    }

    const confluenceCount = [
      formData.w_trend === formData.direction,
      formData.d_trend === formData.direction,
      formData.h4_trend === formData.direction
    ].filter(Boolean).length;
    if (confluenceCount < 2) {
      detected.push({ id: 'low_confluence', icon: Layers, title: 'Geringe Übereinstimmung', severity: confluenceCount === 0 ? 'critical' : 'high' });
    }

    if (totalScore < 85 && totalScore > 0) {
      detected.push({ id: 'low_score', icon: Activity, title: `Score ${totalScore}% < 85%`, severity: totalScore < 70 ? 'critical' : 'high' });
    }

    const entryCount = [formData.entry_sos, formData.entry_engulfing, formData.entry_pattern && formData.entry_pattern !== 'none'].filter(Boolean).length;
    if (entryCount < 2 && formData.w_trend) {
      detected.push({ id: 'weak_entry', icon: Target, title: 'Einstieg schwach', severity: 'high' });
    }

    if (riskCalc && parseFloat(riskCalc.rr) < 2.5 && formData.entry_price && formData.stop_loss && formData.take_profit) {
      detected.push({ id: 'poor_rr', icon: DollarSign, title: `R:R ${riskCalc.rr} < 2.5`, severity: 'critical' });
    }

    if (!formData.entry_price || !formData.stop_loss || !formData.take_profit) {
      detected.push({ id: 'missing_risk', icon: AlertTriangle, title: 'Risiko unvollständig', severity: 'high' });
    }

    if (formData.direction && !formData.confirms_rule) {
      detected.push({ id: 'rule_violation', icon: Shield, title: 'Regel nicht bestätigt', severity: 'high' });
    }

    return detected;
  }, [formData, weeklyScore, dailyScore, h4Score, entryScore, riskCalc]);

  const totalScore = weeklyScore + dailyScore + h4Score + entryScore;
  const criticalCount = conditions.filter(c => c.severity === 'critical').length;

  // ALL CLEAR — minimal green indicator
  if (conditions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border",
          darkMode ? "border-emerald-700/30 bg-emerald-700/5" : "border-emerald-600/20 bg-emerald-50"
        )}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="text-emerald-600 text-[10px] font-bold tracking-wider">NO-TRADE BEDINGUNGEN KLAR</span>
      </motion.div>
    );
  }

  // WARNINGS — compact, calm, structured
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-lg border overflow-hidden",
        darkMode ? "border-zinc-700 bg-zinc-900/60" : "border-zinc-300 bg-zinc-50"
      )}
    >
      {/* Header — one line only */}
      <div className={cn(
        "flex items-center justify-between px-3 py-2 border-b",
        darkMode ? "border-zinc-800" : "border-zinc-200"
      )}>
        <div className="flex items-center gap-2">
          <AlertCircle className={cn("w-3.5 h-3.5 flex-shrink-0", criticalCount > 0 ? "text-rose-500" : "text-amber-500")} />
          <span className={cn("text-[10px] font-bold tracking-wider", criticalCount > 0 ? "text-rose-500" : "text-amber-500")}>
            NO-TRADE
          </span>
          <span className={cn("text-[10px]", darkMode ? "text-zinc-500" : "text-zinc-400")}>
            {conditions.length} Hinweis{conditions.length > 1 ? 'e' : ''}
          </span>
        </div>
        <span className={cn(
          "text-[9px] font-bold px-1.5 py-0.5 rounded",
          criticalCount > 0 
            ? "bg-rose-600/15 text-rose-500" 
            : "bg-amber-500/15 text-amber-500"
        )}>
          {totalScore}%
        </span>
      </div>

      {/* Conditions — plain list, no color explosion */}
      <div className="px-3 py-2 space-y-1">
        {conditions.map((condition) => {
          const Icon = condition.icon;
          return (
            <div key={condition.id} className="flex items-center gap-2">
              <div className={cn(
                "w-1 h-1 rounded-full flex-shrink-0",
                condition.severity === 'critical' ? "bg-rose-500" : "bg-amber-500"
              )} />
              <Icon className={cn(
                "w-3 h-3 flex-shrink-0",
                condition.severity === 'critical' 
                  ? darkMode ? "text-zinc-400" : "text-zinc-500"
                  : darkMode ? "text-zinc-500" : "text-zinc-400"
              )} />
              <span className={cn(
                "text-[10px] font-sans",
                darkMode ? "text-zinc-300" : "text-zinc-600"
              )}>
                {condition.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action — subtle, not screaming */}
      <div className={cn("px-3 py-2 border-t", darkMode ? "border-zinc-800" : "border-zinc-200")}>
        <button
          onClick={() => onNoTrade(conditions)}
          className={cn(
            "w-full py-1.5 rounded text-[10px] font-bold tracking-wider transition-all",
            darkMode
              ? "border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              : "border border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
          )}
        >
          Nicht handeln — protokollieren
        </button>
      </div>
    </motion.div>
  );
}