import React from 'react';
import { motion } from 'framer-motion';
import { XOctagon, Shield, TrendingDown, MapPin, Calendar, Layers, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

export default function NoTradeStats({ darkMode }) {
  const { data: noTradeLogs = [], isLoading } = useQuery({
    queryKey: ['noTradeLogs'],
    queryFn: () => base44.entities.NoTradeLog.list('-created_date', 100),
    initialData: [],
  });

  const reasonIcons = {
    choppy_market: TrendingDown,
    mid_range: MapPin,
    major_news: Calendar,
    low_confluence: Layers,
    poor_rr: DollarSign
  };

  const reasonLabels = {
    choppy_market: 'Choppy Market',
    mid_range: 'Mid-Range',
    major_news: 'News Risk',
    low_confluence: 'Low Confluence',
    poor_rr: 'Poor R:R'
  };

  const reasonColors = {
    choppy_market: 'text-rose-600',
    mid_range: 'text-amber-500',
    major_news: 'text-blue-500',
    low_confluence: 'text-purple-500',
    poor_rr: 'text-orange-500'
  };

  const theme = {
    bg: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500'
  };

  // Calculate stats
  const totalNoTrades = noTradeLogs.length;
  const last30Days = noTradeLogs.filter(log => {
    const logDate = new Date(log.avoided_date || log.created_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return logDate >= thirtyDaysAgo;
  }).length;

  // Count by reason
  const reasonCounts = noTradeLogs.reduce((acc, log) => {
    acc[log.reason] = (acc[log.reason] || 0) + 1;
    return acc;
  }, {});

  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];

  if (isLoading) {
    return (
      <div className={cn("border-2 rounded-xl p-4", theme.border, theme.bg)}>
        <div className="animate-pulse space-y-2">
          <div className={cn("h-4 rounded", darkMode ? "bg-zinc-800" : "bg-zinc-200")} />
          <div className={cn("h-3 rounded w-2/3", darkMode ? "bg-zinc-800" : "bg-zinc-200")} />
        </div>
      </div>
    );
  }

  if (totalNoTrades === 0) {
    return (
      <div className={cn("border-2 rounded-xl p-4", theme.border, theme.bg)}>
        <div className="flex items-center gap-2 mb-2">
          <Shield className={cn("w-5 h-5", theme.textMuted)} />
          <h3 className={cn("font-bold tracking-wider text-sm", theme.text)}>NO-TRADE SKILL</h3>
        </div>
        <div className={cn("text-xs font-sans", theme.textMuted)}>
          No saved trades yet. Start logging smart no-trade decisions!
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("border-2 rounded-xl overflow-hidden", theme.border, theme.bg)}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center",
              darkMode ? "bg-white" : "bg-zinc-900"
            )}>
              <Shield className={cn("w-5 h-5", darkMode ? "text-black" : "text-white")} />
            </div>
            <div>
              <h3 className={cn("font-bold tracking-wider text-sm", theme.text)}>NO-TRADE SKILL</h3>
              <div className={cn("text-[10px] font-sans", theme.textMuted)}>Smart decisions tracked</div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("text-2xl font-bold", theme.text)}>{totalNoTrades}</div>
            <div className={cn("text-[10px]", theme.textMuted)}>SAVED</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className={cn("p-2.5 rounded-lg border", darkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200")}>
            <div className={cn("text-xs font-sans", theme.textMuted)}>Last 30d</div>
            <div className={cn("text-lg font-bold", theme.text)}>{last30Days}</div>
          </div>
          <div className={cn("p-2.5 rounded-lg border", darkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200")}>
            <div className={cn("text-xs font-sans", theme.textMuted)}>Top Reason</div>
            <div className={cn("text-xs font-bold truncate", topReason ? reasonColors[topReason[0]] : theme.text)}>
              {topReason ? reasonLabels[topReason[0]] : '-'}
            </div>
          </div>
        </div>

        {/* Top Reasons */}
        <div className="space-y-1.5">
          {Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([reason, count]) => {
            const Icon = reasonIcons[reason];
            const percentage = ((count / totalNoTrades) * 100).toFixed(0);
            
            return (
              <div key={reason} className="flex items-center gap-2">
                <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", reasonColors[reason])} />
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[10px] font-bold truncate", reasonColors[reason])}>
                    {reasonLabels[reason]}
                  </div>
                  <div className={cn("h-1.5 rounded-full mt-0.5", darkMode ? "bg-zinc-800" : "bg-zinc-200")}>
                    <div 
                      className={cn("h-full rounded-full", reasonColors[reason].replace('text-', 'bg-'))}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className={cn("text-xs font-bold flex-shrink-0", theme.text)}>{count}</div>
              </div>
            );
          })}
        </div>

        {/* Impact Message */}
        <div className={cn("mt-3 pt-3 border-t text-center", darkMode ? "border-zinc-800" : "border-zinc-200")}>
          <div className={cn("text-[10px] font-sans italic", theme.textMuted)}>
            ✓ Discipline protects capital
          </div>
        </div>
      </div>
    </motion.div>
  );
}