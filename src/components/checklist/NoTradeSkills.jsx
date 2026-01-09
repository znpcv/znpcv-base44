import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XOctagon, TrendingDown, MapPin, Calendar, Layers, DollarSign, AlertTriangle, CheckCircle2, Info, Shield, Target, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';

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
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  // PROFESSIONELLE No-Trade Analyse - Alle 7 Checklist Levels
  const conditions = useMemo(() => {
    const detected = [];
    const totalScore = weeklyScore + dailyScore + h4Score + entryScore;

    // ==================== LEVEL 1 & 2: PAIR & DIRECTION ====================
    if (!formData.pair || !formData.direction) {
      return detected; // Stop: Keine Analyse ohne Grunddaten
    }

    // ==================== LEVEL 2-4: TREND ANALYSIS ====================
    // Check 1: Fehlende Trends (NO DATA)
    const hasNoTrends = !formData.w_trend || !formData.d_trend || !formData.h4_trend;
    
    // Check 2: Widersprüchliche Trends (CHOPPY MARKET)
    const hasMixedTrends = formData.w_trend && formData.d_trend && formData.h4_trend &&
      (formData.w_trend !== formData.d_trend || formData.d_trend !== formData.h4_trend);
    
    if (hasNoTrends || hasMixedTrends) {
      detected.push({
        id: 'choppy_market',
        icon: TrendingDown,
        title: 'CHOPPY MARKET',
        titleDe: 'UNKLARER MARKT',
        severity: 'critical',
        details: hasNoTrends ? 'Missing trend data' : 'Conflicting trends across timeframes'
      });
    }

    // ==================== LEVEL 2-4: AOI CONFIRMATION ====================
    const aoiChecks = {
      weekly: formData.w_at_aoi,
      daily: formData.d_at_aoi,
      h4: formData.h4_at_aoi
    };
    const aoiCount = Object.values(aoiChecks).filter(Boolean).length;
    
    // Critical: Kein einziger AOI Rejection
    if (aoiCount === 0 && formData.w_trend) {
      detected.push({
        id: 'mid_range',
        icon: MapPin,
        title: 'MID-RANGE PRICE',
        titleDe: 'PREIS IN DER MITTE',
        severity: 'critical',
        details: '0/3 timeframes at AOI'
      });
    }

    // ==================== LEVEL 2-4: CONFLUENCE VALIDATION ====================
    const confluenceChecks = {
      weekly: formData.w_trend === formData.direction,
      daily: formData.d_trend === formData.direction,
      h4: formData.h4_trend === formData.direction
    };
    const confluenceCount = Object.values(confluenceChecks).filter(Boolean).length;

    if (confluenceCount < 2) {
      detected.push({
        id: 'low_confluence',
        icon: Layers,
        title: 'LOW CONFLUENCE',
        titleDe: 'GERINGE ÜBEREINSTIMMUNG',
        severity: confluenceCount === 0 ? 'critical' : 'high',
        details: `${confluenceCount}/3 timeframes aligned`
      });
    }

    // ==================== LEVEL 2-5: SCORE VALIDATION ====================
    // Einzelne Timeframe Scores prüfen
    const weakTimeframes = [];
    if (weeklyScore < 40) weakTimeframes.push('W');
    if (dailyScore < 40) weakTimeframes.push('D');
    if (h4Score < 25) weakTimeframes.push('4H');
    if (entryScore < 15) weakTimeframes.push('Entry');

    if (totalScore < 85 && totalScore > 0) {
      detected.push({
        id: 'low_score',
        icon: Activity,
        title: 'LOW SCORE',
        titleDe: 'NIEDRIGER SCORE',
        severity: totalScore < 70 ? 'critical' : 'high',
        details: weakTimeframes.length > 0 ? `Weak: ${weakTimeframes.join(', ')}` : `${totalScore}% < 85%`
      });
    }

    // ==================== LEVEL 5: ENTRY VALIDATION ====================
    // Entry Bestätigungen prüfen
    const entryConfirmations = {
      sos: formData.entry_sos,
      engulfing: formData.entry_engulfing,
      pattern: formData.entry_pattern && formData.entry_pattern !== 'none'
    };
    const entryCount = Object.values(entryConfirmations).filter(Boolean).length;
    
    if (entryCount < 2 && formData.w_trend) {
      detected.push({
        id: 'weak_entry',
        icon: Target,
        title: 'WEAK ENTRY',
        titleDe: 'SCHWACHER EINSTIEG',
        severity: 'high',
        details: `${entryCount}/3 entry signals confirmed`
      });
    }

    // ==================== LEVEL 6: RISK MANAGEMENT ====================
    // R:R Ratio Check
    if (riskCalc && parseFloat(riskCalc.rr) < 2.5 && formData.entry_price && formData.stop_loss && formData.take_profit) {
      detected.push({
        id: 'poor_rr',
        icon: DollarSign,
        title: 'POOR R:R',
        titleDe: 'SCHLECHTES R:R',
        severity: 'critical',
        details: `R:R ${riskCalc.rr} < 2.5 minimum`
      });
    }

    // Risk Management Daten fehlen
    if (!formData.entry_price || !formData.stop_loss || !formData.take_profit) {
      detected.push({
        id: 'missing_risk',
        icon: AlertTriangle,
        title: 'INCOMPLETE RISK',
        titleDe: 'UNVOLLSTÄNDIGES RISIKO',
        severity: 'high',
        details: 'Missing entry/SL/TP levels'
      });
    }

    // ==================== LEVEL 7: FINAL CONFIRMATION ====================
    // Golden Rule nicht bestätigt
    if (formData.direction && !formData.confirms_rule) {
      detected.push({
        id: 'rule_violation',
        icon: Shield,
        title: 'RULE NOT CONFIRMED',
        titleDe: 'REGEL NICHT BESTÄTIGT',
        severity: 'high',
        details: 'ZNPCV Golden Rule must be confirmed'
      });
    }

    // ==================== ZUSÄTZLICHE VALIDIERUNGEN ====================
    // Pattern Konsistenz prüfen
    const patterns = [formData.w_pattern, formData.d_pattern, formData.h4_pattern, formData.entry_pattern]
      .filter(p => p && p !== 'none');
    
    if (patterns.length > 0) {
      const allBullish = patterns.every(p => ['double_bottom', 'inv_head_shoulders'].includes(p));
      const allBearish = patterns.every(p => ['double_top', 'head_shoulders'].includes(p));
      const isLong = formData.direction === 'long';
      
      if ((isLong && patterns.length > 1 && !allBullish) || (!isLong && patterns.length > 1 && !allBearish)) {
        detected.push({
          id: 'pattern_conflict',
          icon: Layers,
          title: 'PATTERN CONFLICT',
          titleDe: 'PATTERN KONFLIKT',
          severity: 'medium',
          details: 'Mixed bullish/bearish patterns detected'
        });
      }
    }

    return detected;
  }, [formData, weeklyScore, dailyScore, h4Score, entryScore, riskCalc]);

  const hasNoTradeConditions = conditions.length > 0;
  const criticalCount = conditions.filter(c => c.severity === 'critical').length;
  const highSeverityCount = conditions.filter(c => c.severity === 'high').length;
  const totalScore = weeklyScore + dailyScore + h4Score + entryScore;
  
  // Severity-basierte Farben
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return { bg: 'bg-rose-600', border: 'border-rose-500', text: 'text-rose-600' };
      case 'high': return { bg: 'bg-orange-600', border: 'border-orange-500', text: 'text-orange-600' };
      case 'medium': return { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-500' };
      default: return { bg: 'bg-zinc-600', border: 'border-zinc-500', text: 'text-zinc-600' };
    }
  };

  const theme = {
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    bg: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600'
  };

  if (!hasNoTradeConditions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("border-2 rounded-lg overflow-hidden relative", 
          darkMode ? "bg-emerald-700/10 border-emerald-700/30" : "bg-teal-500/10 border-emerald-600/30"
        )}
      >
        <div className="p-2 sm:p-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-emerald-600 font-bold text-[10px] tracking-wider">NO-TRADE CLEAR</div>
              <div className={`${theme.textSecondary} text-[8px] font-sans`}>{totalScore}%</div>
            </div>
            {totalScore >= 85 && (
              <div className="px-1.5 py-0.5 bg-emerald-700 text-white text-[8px] font-bold rounded">OK</div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("border-2 rounded-lg overflow-hidden",
        criticalCount > 0 ? "border-rose-600" : "border-amber-500"
      )}
    >
      {/* Header - Ultra Compact */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={cn("w-6 h-6 rounded flex items-center justify-center flex-shrink-0",
            criticalCount > 0 ? "bg-rose-600" : "bg-amber-500"
          )}>
            <XOctagon className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className={cn("font-bold tracking-wider text-[10px]",
              criticalCount > 0 ? "text-rose-600" : "text-amber-500"
            )}>
              NO-TRADE
            </div>
            <div className={`${theme.textSecondary} text-[8px] font-sans`}>{conditions.length} • {totalScore}%</div>
          </div>
        </div>
        <div className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold",
          criticalCount > 0 ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
        )}>
          {conditions.length}
        </div>
      </div>

      {/* Conditions - Ultra Compact */}
      <div className={cn("border-t p-1.5 space-y-0.5",
        darkMode ? "border-zinc-800 bg-zinc-950/50" : "border-zinc-200 bg-white/50"
      )}>
        {conditions.map((condition) => {
          const Icon = condition.icon;
          const colors = getSeverityColor(condition.severity);
          
          return (
            <div key={condition.id} className={cn("flex items-center gap-1.5 p-1.5 rounded border",
              darkMode ? `${colors.bg}/10 ${colors.border}/30` : `${colors.bg}/5 ${colors.border}/50`
            )}>
              <div className={cn("w-5 h-5 rounded flex items-center justify-center flex-shrink-0", colors.bg)}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              <div className={cn("font-bold text-[9px] tracking-wider flex-1 truncate", colors.text)}>
                {t('language') === 'de' ? condition.titleDe : condition.title}
              </div>
              <div className={cn("px-1 py-0.5 rounded text-[7px] font-bold text-white",
                condition.severity === 'critical' ? 'bg-rose-600' :
                condition.severity === 'high' ? 'bg-orange-600' : 'bg-amber-500'
              )}>
                {condition.severity === 'critical' ? '!!!' : condition.severity === 'high' ? '!!' : '!'}
              </div>
            </div>
          );
        })}

        {/* Action Button - Ultra Compact */}
        <button onClick={() => onNoTrade(conditions)}
          className={cn("w-full mt-1 p-2 rounded font-bold text-[10px] tracking-wider border",
            criticalCount > 0
              ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-500"
              : "bg-amber-500 hover:bg-amber-600 text-white border-amber-400"
          )}
        >
          <XOctagon className="w-3 h-3 inline-block mr-1" />
          LOG & EXIT
        </button>
      </div>
    </motion.div>
  );
}