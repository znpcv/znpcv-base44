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
      <div className={cn("border-2 rounded-xl p-3", theme.border, theme.bg)}>
        <div className="flex items-center gap-2">
          <Shield className={cn("w-4 h-4", theme.textMuted)} />
          <div>
            <h3 className={cn("font-bold tracking-wider text-xs", theme.text)}>NO-TRADE SKILL</h3>
            <div className={cn("text-[9px] font-sans", theme.textMuted)}>No logs yet</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("border-2 rounded-xl", theme.border, theme.bg)}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className={cn("w-4 h-4", darkMode ? "text-white" : "text-black")} />
            <div>
              <h3 className={cn("font-bold tracking-wider text-xs", theme.text)}>NO-TRADE</h3>
              <div className={cn("text-[9px] font-sans", theme.textMuted)}>{totalNoTrades} saved</div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("text-lg font-bold", theme.text)}>{last30Days}</div>
            <div className={cn("text-[8px]", theme.textMuted)}>30d</div>
          </div>
        </div>

        {/* Top Reasons - Ultra Compact */}
        <div className="space-y-0.5">
          {Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([reason, count]) => {
            const Icon = reasonIcons[reason] || Shield;
            
            return (
              <div key={reason} className="flex items-center gap-1.5">
                <Icon className={cn("w-3 h-3 flex-shrink-0", reasonColors[reason] || theme.textMuted)} />
                <div className={cn("text-[9px] font-bold flex-1 truncate", reasonColors[reason])}>
                  {reasonLabels[reason]}
                </div>
                <div className={cn("text-[10px] font-bold", theme.text)}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}