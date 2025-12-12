import React from 'react';
import { Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function TradeFilters({ filter, setFilter, darkMode, stats }) {
  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
  };

  const filters = [
    { key: 'all', label: 'ALL', count: stats.executedTrades.length },
    { key: 'win', label: 'WINS', count: stats.wins, color: 'teal' },
    { key: 'loss', label: 'LOSSES', count: stats.losses, color: 'rose' },
    { key: 'breakeven', label: 'BE', count: stats.breakeven, color: 'zinc' },
    { key: 'pending', label: 'PENDING', count: stats.pending, color: 'blue' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className={`w-4 h-4 ${theme.textMuted}`} />
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all border-2 flex items-center gap-1.5",
            filter === f.key
              ? f.color === 'teal' ? 'bg-teal-600 text-white border-teal-600' :
                f.color === 'rose' ? 'bg-rose-600 text-white border-rose-600' :
                f.color === 'blue' ? 'bg-blue-500 text-white border-blue-500' :
                f.color === 'zinc' ? 'bg-zinc-600 text-white border-zinc-600' :
                darkMode ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900'
              : darkMode 
                ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700' 
                : 'bg-zinc-100 text-zinc-600 border-zinc-300 hover:text-black hover:border-zinc-400'
          )}
        >
          {f.label}
          <span className={cn("px-1.5 py-0.5 rounded-full text-[9px]",
            filter === f.key ? 'bg-white/20' : darkMode ? 'bg-zinc-800' : 'bg-zinc-200')}>
            {f.count}
          </span>
        </button>
      ))}
    </div>
  );
}