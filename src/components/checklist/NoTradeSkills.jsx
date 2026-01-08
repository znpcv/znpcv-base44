import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XOctagon, TrendingDown, MapPin, Calendar, Layers, DollarSign, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
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

  // Calculate no-trade conditions
  const conditions = [];

  // 1. Choppy Market - keine klaren Trends
  const hasNoTrends = !formData.w_trend || !formData.d_trend || !formData.h4_trend;
  const hasMixedTrends = formData.w_trend && formData.d_trend && formData.h4_trend &&
    (formData.w_trend !== formData.d_trend || formData.d_trend !== formData.h4_trend);
  
  if (hasNoTrends || hasMixedTrends) {
    conditions.push({
      id: 'choppy_market',
      icon: TrendingDown,
      title: 'CHOPPY MARKET',
      titleDe: 'UNKLARER MARKT',
      description: 'No clear trend alignment across timeframes',
      descriptionDe: 'Keine klare Trendausrichtung über alle Zeitrahmen',
      severity: 'high',
      active: true
    });
  }

  // 2. Mid-Range - nicht am AOI
  const noAoiConfirmation = !formData.w_at_aoi && !formData.d_at_aoi && !formData.h4_at_aoi;
  if (noAoiConfirmation && formData.w_trend) {
    conditions.push({
      id: 'mid_range',
      icon: MapPin,
      title: 'MID-RANGE PRICE',
      titleDe: 'PREIS IN DER MITTE',
      description: 'Price not at Area of Interest - no clear entry zone',
      descriptionDe: 'Preis nicht am AOI - keine klare Einstiegszone',
      severity: 'high',
      active: true
    });
  }

  // 3. Low Confluence - weniger als 3 Timeframes aligned
  const confluenceCount = [
    formData.w_trend === formData.direction,
    formData.d_trend === formData.direction,
    formData.h4_trend === formData.direction
  ].filter(Boolean).length;

  if (confluenceCount < 2 && formData.direction) {
    conditions.push({
      id: 'low_confluence',
      icon: Layers,
      title: 'LOW CONFLUENCE',
      titleDe: 'GERINGE ÜBEREINSTIMMUNG',
      description: `Only ${confluenceCount}/3 timeframes aligned`,
      descriptionDe: `Nur ${confluenceCount}/3 Zeitrahmen ausgerichtet`,
      severity: 'medium',
      active: true
    });
  }

  // 4. Poor R:R - unter 1:2.5
  if (riskCalc && parseFloat(riskCalc.rr) < 2.5 && formData.entry_price && formData.stop_loss && formData.take_profit) {
    conditions.push({
      id: 'poor_rr',
      icon: DollarSign,
      title: 'POOR R:R RATIO',
      titleDe: 'SCHLECHTES R:R',
      description: `Risk:Reward ${riskCalc.rr} < 2.5`,
      descriptionDe: `Risk:Reward ${riskCalc.rr} < 2.5`,
      severity: 'high',
      active: true
    });
  }

  // 5. Major News - Placeholder (würde externe API benötigen)
  // Für jetzt: Warnung wenn Trade an bestimmten Wochentagen/Zeiten
  const now = new Date();
  const hour = now.getHours();
  const isNewsTime = (hour >= 8 && hour <= 10) || (hour >= 13 && hour <= 15); // Beispiel: typische News-Zeiten
  
  if (isNewsTime && formData.pair) {
    conditions.push({
      id: 'major_news',
      icon: Calendar,
      title: 'POTENTIAL NEWS RISK',
      titleDe: 'POTENTIELLES NEWS-RISIKO',
      description: 'Current time window often has major economic releases',
      descriptionDe: 'Aktuelle Zeitfenster hat oft wichtige Wirtschaftsdaten',
      severity: 'medium',
      active: true
    });
  }

  const activeConditions = conditions.filter(c => c.active);
  const hasNoTradeConditions = activeConditions.length > 0;
  const highSeverityCount = activeConditions.filter(c => c.severity === 'high').length;

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
        className={cn("border-2 rounded-xl p-3 sm:p-4", 
          darkMode ? "bg-emerald-700/10 border-emerald-700/30" : "bg-teal-500/10 border-emerald-600/30"
        )}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-emerald-600 font-bold text-xs sm:text-sm tracking-wider">NO-TRADE CONDITIONS CLEAR</div>
            <div className={`${theme.textSecondary} text-[10px] font-sans`}>All conditions passed ✓</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("border-2 rounded-xl overflow-hidden",
        highSeverityCount > 0 
          ? "border-rose-600 bg-rose-600/5"
          : darkMode ? "border-amber-600 bg-amber-600/5" : "border-amber-500 bg-amber-500/5"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn("w-full p-3 sm:p-4 flex items-center justify-between transition-colors",
          darkMode ? "hover:bg-zinc-900/50" : "hover:bg-zinc-100/50"
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <XOctagon className={cn("w-5 h-5 sm:w-6 sm:h-6", 
            highSeverityCount > 0 ? "text-rose-600" : "text-amber-500"
          )} />
          <div className="text-left">
            <div className={cn("font-bold tracking-wider text-xs sm:text-sm",
              highSeverityCount > 0 ? "text-rose-600" : "text-amber-500"
            )}>
              NO-TRADE SKILL ACTIVATED
            </div>
            <div className={`${theme.textSecondary} text-[10px] font-sans`}>
              {activeConditions.length} condition{activeConditions.length !== 1 ? 's' : ''} detected
            </div>
          </div>
        </div>
        <div className={cn("px-2 py-1 rounded-full text-[10px] font-bold",
          highSeverityCount > 0 ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
        )}>
          {activeConditions.length}
        </div>
      </button>

      {/* Conditions List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={cn("border-t p-2 sm:p-3 space-y-1.5 sm:space-y-2",
              darkMode ? "border-zinc-800 bg-zinc-950/50" : "border-zinc-200 bg-white/50"
            )}>
              {activeConditions.map((condition) => {
                const Icon = condition.icon;
                return (
                  <div
                    key={condition.id}
                    className={cn("flex items-start gap-2 p-2 sm:p-2.5 rounded-lg border",
                      condition.severity === 'high'
                        ? darkMode ? "bg-rose-600/10 border-rose-600/30" : "bg-red-50 border-red-200"
                        : darkMode ? "bg-amber-600/10 border-amber-600/30" : "bg-amber-50 border-amber-200"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5",
                      condition.severity === 'high' ? "text-rose-600" : "text-amber-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-bold text-[10px] sm:text-xs tracking-wider",
                        condition.severity === 'high' ? "text-rose-600" : "text-amber-500"
                      )}>
                        {t('language') === 'de' ? condition.titleDe : condition.title}
                      </div>
                      <div className={`${theme.textSecondary} text-[9px] sm:text-[10px] font-sans leading-tight`}>
                        {t('language') === 'de' ? condition.descriptionDe : condition.description}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Action Button */}
              <button
                onClick={() => onNoTrade(activeConditions)}
                className={cn("w-full mt-2 p-2.5 sm:p-3 rounded-lg font-bold text-xs sm:text-sm tracking-wider transition-all border-2",
                  highSeverityCount > 0
                    ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
                    : "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                )}
              >
                <XOctagon className="w-4 h-4 inline-block mr-2" />
                LOG NO-TRADE & EXIT
              </button>

              <div className={`text-center text-[9px] ${theme.textSecondary} font-sans pt-1`}>
                ✓ Smart decision saves capital
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}