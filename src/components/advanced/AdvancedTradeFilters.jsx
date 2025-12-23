import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, Target, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AdvancedTradeFilters({ filters, onFilterChange, onReset, darkMode }) {
  const theme = {
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
  };

  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF', 'NZD/USD', 'USD/CAD', 
    'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAU/USD', 'BTC/USD', 'ETH/USD'];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2", theme.bg, "p-3 rounded-xl border-2", theme.border)}>
      {/* Date Range */}
      <div>
        <label className={cn("text-[10px] tracking-wider mb-1.5 flex items-center gap-1", theme.textSecondary)}>
          <Calendar className="w-3 h-3" />
          VON
        </label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
          className={cn("h-9 text-xs", theme.border)}
        />
      </div>

      <div>
        <label className={cn("text-[10px] tracking-wider mb-1.5 flex items-center gap-1", theme.textSecondary)}>
          <Calendar className="w-3 h-3" />
          BIS
        </label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
          className={cn("h-9 text-xs", theme.border)}
        />
      </div>

      {/* Pair Filter */}
      <div>
        <label className={cn("text-[10px] tracking-wider mb-1.5 flex items-center gap-1", theme.textSecondary)}>
          <TrendingUp className="w-3 h-3" />
          PAIR
        </label>
        <Select value={filters.pair} onValueChange={(v) => onFilterChange({ ...filters, pair: v })}>
          <SelectTrigger className={cn("h-9 text-xs", theme.border)}>
            <SelectValue placeholder="Alle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Pairs</SelectItem>
            {pairs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* R:R Filter */}
      <div>
        <label className={cn("text-[10px] tracking-wider mb-1.5 flex items-center gap-1", theme.textSecondary)}>
          <Target className="w-3 h-3" />
          MIN R:R
        </label>
        <Select value={filters.minRR} onValueChange={(v) => onFilterChange({ ...filters, minRR: v })}>
          <SelectTrigger className={cn("h-9 text-xs", theme.border)}>
            <SelectValue placeholder="Alle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="1">1:1+</SelectItem>
            <SelectItem value="2">1:2+</SelectItem>
            <SelectItem value="2.5">1:2.5+</SelectItem>
            <SelectItem value="3">1:3+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {(filters.dateFrom || filters.dateTo || filters.pair !== 'all' || filters.minRR !== 'all') && (
        <button
          onClick={onReset}
          className={cn("col-span-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border-2 transition-all",
            darkMode ? "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white" : "border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-black")}
        >
          <X className="w-3 h-3" />
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}