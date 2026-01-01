import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, Target, X, Filter } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AdvancedTradeFilters({ filters, onFilterChange, onReset, darkMode }) {
  const theme = {
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    bg: darkMode ? 'bg-zinc-900/50' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
  };

  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF', 'NZD/USD', 'USD/CAD', 
    'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAU/USD', 'BTC/USD', 'ETH/USD'];

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.pair !== 'all' || filters.minRR !== 'all';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }}
      className={cn("border-2 rounded-xl sm:rounded-2xl overflow-hidden", theme.border, theme.bgSecondary)}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b", theme.border, darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50')}>
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", darkMode ? 'bg-zinc-800' : 'bg-zinc-200')}>
            <Filter className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${theme.text}`} />
          </div>
          <span className={`text-xs sm:text-sm font-bold tracking-wider ${theme.text}`}>ERWEITERTE FILTER</span>
          {hasActiveFilters && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 px-2 py-0.5 bg-emerald-700 text-white rounded-full text-[9px] font-bold">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              AKTIV
            </motion.div>
          )}
        </div>
        {hasActiveFilters && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={onReset}
            className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold border-2 transition-all hover:scale-105",
              darkMode ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-rose-600" : "bg-white border-zinc-300 text-zinc-600 hover:text-rose-600 hover:border-rose-500")}
          >
            <X className="w-3 h-3" />
            ZURÜCKSETZEN
          </motion.button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Date From */}
        <div className={cn("p-2.5 sm:p-3 rounded-xl border-2 transition-all", theme.border, theme.bg, filters.dateFrom && "ring-2 ring-emerald-700/30")}>
          <label className={cn("text-[9px] tracking-widest mb-1.5 flex items-center gap-1.5 font-bold", theme.textMuted)}>
            <Calendar className="w-3 h-3" />
            VON
          </label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
            max={filters.dateTo || undefined}
            className={cn("h-8 sm:h-9 text-xs font-mono border-0 p-0", darkMode ? 'bg-transparent text-white' : 'bg-transparent text-black')}
          />
        </div>

        {/* Date To */}
        <div className={cn("p-2.5 sm:p-3 rounded-xl border-2 transition-all", theme.border, theme.bg, filters.dateTo && "ring-2 ring-emerald-700/30")}>
          <label className={cn("text-[9px] tracking-widest mb-1.5 flex items-center gap-1.5 font-bold", theme.textMuted)}>
            <Calendar className="w-3 h-3" />
            BIS
          </label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
            min={filters.dateFrom || undefined}
            className={cn("h-8 sm:h-9 text-xs font-mono border-0 p-0", darkMode ? 'bg-transparent text-white' : 'bg-transparent text-black')}
          />
        </div>

        {/* Pair Filter */}
        <div className={cn("p-2.5 sm:p-3 rounded-xl border-2 transition-all", theme.border, theme.bg, filters.pair !== 'all' && "ring-2 ring-emerald-700/30")}>
          <label className={cn("text-[9px] tracking-widest mb-1.5 flex items-center gap-1.5 font-bold", theme.textMuted)}>
            <TrendingUp className="w-3 h-3" />
            PAIR
          </label>
          <Select value={filters.pair} onValueChange={(v) => onFilterChange({ ...filters, pair: v })}>
            <SelectTrigger className={cn("h-8 sm:h-9 text-xs border-0 p-0 focus:ring-0", theme.text)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Alle Pairs</SelectItem>
              {pairs.map(p => (
                <SelectItem key={p} value={p} className="text-xs font-bold">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* R:R Filter */}
        <div className={cn("p-2.5 sm:p-3 rounded-xl border-2 transition-all", theme.border, theme.bg, filters.minRR !== 'all' && "ring-2 ring-emerald-700/30")}>
          <label className={cn("text-[9px] tracking-widest mb-1.5 flex items-center gap-1.5 font-bold", theme.textMuted)}>
            <Target className="w-3 h-3" />
            MIN R:R
          </label>
          <Select value={filters.minRR} onValueChange={(v) => onFilterChange({ ...filters, minRR: v })}>
            <SelectTrigger className={cn("h-8 sm:h-9 text-xs border-0 p-0 focus:ring-0", theme.text)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Alle R:R</SelectItem>
              <SelectItem value="1" className="text-xs font-bold">1:1+</SelectItem>
              <SelectItem value="2" className="text-xs font-bold">1:2+</SelectItem>
              <SelectItem value="2.5" className="text-xs font-bold">1:2.5+</SelectItem>
              <SelectItem value="3" className="text-xs font-bold">1:3+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}