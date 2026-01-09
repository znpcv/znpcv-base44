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

  // Calculate comprehensive no-trade conditions
  const conditions = useMemo(() => {
    const detected = [];

    // 1. CHOPPY MARKET - Keine klaren Trends über Zeitrahmen
    const hasNoTrends = !formData.w_trend || !formData.d_trend || !formData.h4_trend;
    const hasMixedTrends = formData.w_trend && formData.d_trend && formData.h4_trend &&
      (formData.w_trend !== formData.d_trend || formData.d_trend !== formData.h4_trend);
    
    if (hasNoTrends || hasMixedTrends) {
      const trendDetails = [
        formData.w_trend ? `W: ${formData.w_trend}` : 'W: none',
        formData.d_trend ? `D: ${formData.d_trend}` : 'D: none',
        formData.h4_trend ? `4H: ${formData.h4_trend}` : '4H: none'
      ].join(' • ');
      
      detected.push({
        id: 'choppy_market',
        icon: TrendingDown,
        title: 'CHOPPY MARKET',
        titleDe: 'UNKLARER MARKT',
        description: `No clear trend alignment: ${trendDetails}`,
        descriptionDe: `Keine klare Trendausrichtung: ${trendDetails}`,
        severity: 'critical',
        impact: 'Very High',
        score: 0,
        reason: hasMixedTrends ? 'Conflicting trends' : 'Missing trend data'
      });
    }

    // 2. MID-RANGE - Nicht am AOI
    const aoiCount = [formData.w_at_aoi, formData.d_at_aoi, formData.h4_at_aoi].filter(Boolean).length;
    const noAoiConfirmation = aoiCount === 0;
    
    if (noAoiConfirmation && formData.w_trend) {
      detected.push({
        id: 'mid_range',
        icon: MapPin,
        title: 'MID-RANGE PRICE',
        titleDe: 'PREIS IN DER MITTE',
        description: `Price not at AOI on any timeframe (0/3 confirmed)`,
        descriptionDe: `Preis nicht am AOI auf keinem Zeitrahmen (0/3 bestätigt)`,
        severity: 'critical',
        impact: 'Very High',
        score: weeklyScore + dailyScore + h4Score,
        reason: 'No AOI rejection confirmed'
      });
    } else if (aoiCount === 1 && formData.w_trend) {
      detected.push({
        id: 'mid_range',
        icon: MapPin,
        title: 'WEAK AOI CONFIRMATION',
        titleDe: 'SCHWACHE AOI BESTÄTIGUNG',
        description: `Only ${aoiCount}/3 timeframes at AOI`,
        descriptionDe: `Nur ${aoiCount}/3 Zeitrahmen am AOI`,
        severity: 'high',
        impact: 'High',
        score: weeklyScore + dailyScore + h4Score,
        reason: 'Insufficient AOI confirmation'
      });
    }

    // 3. LOW CONFLUENCE - Weniger als 2 Timeframes aligned
    const confluenceCount = [
      formData.w_trend === formData.direction,
      formData.d_trend === formData.direction,
      formData.h4_trend === formData.direction
    ].filter(Boolean).length;

    if (confluenceCount < 2 && formData.direction) {
      detected.push({
        id: 'low_confluence',
        icon: Layers,
        title: 'LOW CONFLUENCE',
        titleDe: 'GERINGE ÜBEREINSTIMMUNG',
        description: `Only ${confluenceCount}/3 timeframes aligned with ${formData.direction} direction`,
        descriptionDe: `Nur ${confluenceCount}/3 Zeitrahmen mit ${formData.direction} Richtung ausgerichtet`,
        severity: confluenceCount === 0 ? 'critical' : 'high',
        impact: confluenceCount === 0 ? 'Very High' : 'High',
        score: weeklyScore + dailyScore + h4Score,
        reason: 'Timeframe confluence too low'
      });
    }

    // 4. LOW OVERALL SCORE - Unter 85%
    const totalScore = weeklyScore + dailyScore + h4Score + entryScore;
    if (totalScore < 85 && totalScore > 0) {
      detected.push({
        id: 'low_score',
        icon: Activity,
        title: 'LOW CHECKLIST SCORE',
        titleDe: 'NIEDRIGER CHECKLIST SCORE',
        description: `Score ${totalScore}% below ZNPCV standard (85% minimum)`,
        descriptionDe: `Score ${totalScore}% unter ZNPCV Standard (85% minimum)`,
        severity: totalScore < 70 ? 'critical' : 'high',
        impact: totalScore < 70 ? 'Very High' : 'High',
        score: totalScore,
        reason: 'Insufficient technical setup'
      });
    }

    // 5. POOR R:R - Unter 1:2.5
    if (riskCalc && parseFloat(riskCalc.rr) < 2.5 && formData.entry_price && formData.stop_loss && formData.take_profit) {
      detected.push({
        id: 'poor_rr',
        icon: DollarSign,
        title: 'POOR RISK:REWARD',
        titleDe: 'SCHLECHTES RISK:REWARD',
        description: `R:R ${riskCalc.rr} below minimum 2.5 (${Math.round(parseFloat(riskCalc.rr) / 2.5 * 100)}% of target)`,
        descriptionDe: `R:R ${riskCalc.rr} unter Minimum 2.5 (${Math.round(parseFloat(riskCalc.rr) / 2.5 * 100)}% vom Ziel)`,
        severity: 'critical',
        impact: 'Very High',
        score: totalScore,
        reason: 'Risk management violation'
      });
    }

    // 6. NEWS RISK - Zeitfenster mit typischen News-Events
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // London Session: 8:00-10:00 UTC (News heavy)
    // New York Session: 13:00-15:00 UTC (News heavy)
    const isHighNewsTime = (hour >= 8 && hour <= 10) || (hour >= 13 && hour <= 15);
    const isWeekday = day >= 1 && day <= 5;
    
    if (isHighNewsTime && isWeekday && formData.pair) {
      detected.push({
        id: 'major_news',
        icon: Calendar,
        title: 'HIGH NEWS RISK WINDOW',
        titleDe: 'HOHES NEWS-RISIKO ZEITFENSTER',
        description: `Trading during high-impact news window (${hour}:00 UTC)`,
        descriptionDe: `Trading während High-Impact News Fenster (${hour}:00 UTC)`,
        severity: 'medium',
        impact: 'Medium',
        score: totalScore,
        reason: 'Major economic releases possible'
      });
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
        className={cn("border-2 rounded-xl overflow-hidden relative", 
          darkMode ? "bg-emerald-700/10 border-emerald-700/30" : "bg-teal-500/10 border-emerald-600/30"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/5 to-transparent pointer-events-none" />
        <div className="relative z-10 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-emerald-600 font-bold text-sm sm:text-base tracking-wider mb-0.5">NO-TRADE CONDITIONS CLEAR</div>
              <div className={`${theme.textSecondary} text-[10px] sm:text-xs font-sans flex items-center gap-2`}>
                <Shield className="w-3 h-3" />
                All checks passed • Score: {totalScore}%
              </div>
            </div>
            {totalScore >= 85 && (
              <div className="px-2.5 py-1 bg-emerald-700 text-white text-[10px] font-bold rounded-md">
                READY
              </div>
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
      className={cn("border-2 rounded-xl overflow-hidden relative",
        criticalCount > 0 
          ? "border-rose-600"
          : highSeverityCount > 0 
          ? "border-orange-600"
          : darkMode ? "border-amber-600" : "border-amber-500"
      )}
    >
      {/* Animated Background Pattern */}
      <div className={cn("absolute inset-0 opacity-5 pointer-events-none",
        criticalCount > 0 ? "bg-rose-600" : "bg-amber-500"
      )}>
        <div className="w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }} />
      </div>

      {/* Header - Compact */}
      <div className={cn("p-3 sm:p-3.5 flex items-center justify-between relative z-10")}>
        <div className="flex items-center gap-2 flex-1">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            criticalCount > 0 ? "bg-rose-600" : "bg-amber-500"
          )}>
            <XOctagon className="w-5 h-5 text-white" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className={cn("font-bold tracking-wider text-xs sm:text-sm",
              criticalCount > 0 ? "text-rose-600" : "text-amber-500"
            )}>
              NO-TRADE SKILL
            </div>
            <div className={`${theme.textSecondary} text-[9px] sm:text-[10px] font-sans`}>
              {conditions.length} issue{conditions.length !== 1 ? 's' : ''} • {totalScore}%
            </div>
          </div>
        </div>
        <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold",
          criticalCount > 0 ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
        )}>
          {conditions.length}
        </div>
      </div>

      {/* Conditions List - Compact */}
      <div className={cn("border-t-2 p-2 sm:p-2.5 space-y-1",
        darkMode ? "border-zinc-800 bg-zinc-950/50" : "border-zinc-200 bg-white/50"
      )}>
        {conditions.map((condition, index) => {
          const Icon = condition.icon;
          const colors = getSeverityColor(condition.severity);
          
          return (
            <div
              key={condition.id}
              className={cn("flex items-center gap-2 p-2 rounded-lg border",
                darkMode ? `${colors.bg}/10 ${colors.border}/30` : `${colors.bg}/5 ${colors.border}/50`
              )}
            >
              <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0", colors.bg)}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("font-bold text-[10px] sm:text-xs tracking-wider", colors.text)}>
                  {t('language') === 'de' ? condition.titleDe : condition.title}
                </div>
              </div>
              <div className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold text-white flex-shrink-0",
                condition.severity === 'critical' ? 'bg-rose-600' :
                condition.severity === 'high' ? 'bg-orange-600' : 'bg-amber-500'
              )}>
                {condition.severity === 'critical' ? '!!!' : condition.severity === 'high' ? '!!' : '!'}
              </div>
            </div>
          );
        })}

              {/* Action Button - Compact */}
              <button
                onClick={() => onNoTrade(conditions)}
                className={cn("w-full mt-2 p-2.5 rounded-lg font-bold text-xs sm:text-sm tracking-wider transition-all border-2",
                  criticalCount > 0
                    ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-500"
                    : "bg-amber-500 hover:bg-amber-600 text-white border-amber-400"
                )}
              >
                <XOctagon className="w-4 h-4 inline-block mr-1.5" />
                LOG NO-TRADE & EXIT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}