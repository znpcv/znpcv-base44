import React, { useMemo } from 'react';
import { Clock, TrendingUp, Calendar } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

export default function BestTradingTimes({ trades, darkMode }) {
  const { t } = useLanguage();

  const timeAnalysis = useMemo(() => {
    const executedTrades = trades.filter(t => t.outcome && t.outcome !== 'pending');
    if (executedTrades.length === 0) return null;

    // Analyze by hour
    const hourStats = {};
    const dayStats = {};

    executedTrades.forEach(trade => {
      const date = new Date(trade.created_date);
      const hour = date.getHours();
      const day = date.getDay(); // 0 = Sunday

      // Hour analysis
      if (!hourStats[hour]) {
        hourStats[hour] = { wins: 0, losses: 0, total: 0 };
      }
      hourStats[hour].total++;
      if (trade.outcome === 'win') hourStats[hour].wins++;
      if (trade.outcome === 'loss') hourStats[hour].losses++;

      // Day analysis
      if (!dayStats[day]) {
        dayStats[day] = { wins: 0, losses: 0, total: 0 };
      }
      dayStats[day].total++;
      if (trade.outcome === 'win') dayStats[day].wins++;
      if (trade.outcome === 'loss') dayStats[day].losses++;
    });

    // Calculate win rates
    const hourData = Object.entries(hourStats)
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        winRate: (stats.wins / stats.total) * 100,
        total: stats.total
      }))
      .filter(d => d.total >= 3) // Min 3 trades
      .sort((a, b) => b.winRate - a.winRate);

    const dayData = Object.entries(dayStats)
      .map(([day, stats]) => ({
        day: parseInt(day),
        winRate: (stats.wins / stats.total) * 100,
        total: stats.total
      }))
      .filter(d => d.total >= 3)
      .sort((a, b) => b.winRate - a.winRate);

    return { hourData, dayData };
  }, [trades]);

  if (!timeAnalysis || timeAnalysis.hourData.length === 0) {
    return null;
  }

  const theme = {
    bg: darkMode ? 'bg-zinc-900' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
  };

  const bestHour = timeAnalysis.hourData[0];
  const bestDay = timeAnalysis.dayData[0];
  
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  return (
    <div className={cn("rounded-xl border-2 p-4 sm:p-5 md:p-6", theme.bg, theme.border)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className={cn("w-5 h-5", theme.text)} />
        <h3 className={cn("text-sm tracking-wider font-bold", theme.text)}>BESTE TRADING ZEITEN</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Best Hour */}
        <div className={cn("p-4 rounded-lg border", darkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200')}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span className={cn("text-xs tracking-wider font-bold", theme.textMuted)}>BESTE STUNDE</span>
          </div>
          <div className={cn("text-2xl font-bold mb-1", theme.text)}>
            {bestHour.hour}:00 - {bestHour.hour + 1}:00
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("text-sm", theme.textMuted)}>
              Win Rate: <span className="text-teal-600 font-bold">{bestHour.winRate.toFixed(0)}%</span>
            </div>
            <div className={cn("text-xs px-2 py-0.5 rounded-full", darkMode ? 'bg-zinc-700' : 'bg-zinc-200')}>
              {bestHour.total} {t('trades')}
            </div>
          </div>
        </div>

        {/* Best Day */}
        {bestDay && (
          <div className={cn("p-4 rounded-lg border", darkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200')}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className={cn("text-xs tracking-wider font-bold", theme.textMuted)}>BESTER TAG</span>
            </div>
            <div className={cn("text-2xl font-bold mb-1", theme.text)}>
              {dayNames[bestDay.day]}
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("text-sm", theme.textMuted)}>
                Win Rate: <span className="text-blue-500 font-bold">{bestDay.winRate.toFixed(0)}%</span>
              </div>
              <div className={cn("text-xs px-2 py-0.5 rounded-full", darkMode ? 'bg-zinc-700' : 'bg-zinc-200')}>
                {bestDay.total} {t('trades')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Hours Overview */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: darkMode ? '#27272a' : '#e4e4e7' }}>
        <div className={cn("text-xs tracking-wider mb-3 font-bold", theme.textMuted)}>STÜNDLICHE ÜBERSICHT</div>
        <div className="grid grid-cols-6 gap-2">
          {timeAnalysis.hourData.slice(0, 12).map(item => (
            <div key={item.hour} className={cn("p-2 rounded text-center", darkMode ? 'bg-zinc-800/30' : 'bg-zinc-100')}>
              <div className={cn("text-xs font-bold mb-1", theme.text)}>{item.hour}:00</div>
              <div className={cn("text-[10px]", item.winRate >= 60 ? 'text-teal-600' : theme.textMuted)}>
                {item.winRate.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}