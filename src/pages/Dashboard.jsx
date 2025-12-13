import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ChevronRight, Target, CheckCircle, Clock, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Minus, Globe, Home, Activity, Trash2, Edit, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, subMonths, addMonths } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import TradingQuote from '@/components/TradingQuote';
import AccountButton from '@/components/AccountButton';


export default function DashboardPage() {
  const navigate = useNavigate();
  const { t, language, isRTL, darkMode } = useLanguage();
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { data: checklists = [], isLoading, refetch } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => base44.entities.TradeChecklist.list('-created_date', 100),
  });

  const handleDeleteTrade = async (e, tradeId) => {
    e.stopPropagation();
    if (window.confirm(t('confirmDelete') || 'Trade wirklich löschen?')) {
      try {
        await base44.entities.TradeChecklist.delete(tradeId);
        refetch();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const [filter, setFilter] = useState('all');

  const stats = useMemo(() => {
    const total = checklists.length;
    const ready = checklists.filter(c => c.status === 'ready_to_trade').length;
    const inProgress = checklists.filter(c => c.status === 'in_progress').length;
    const executed = checklists.filter(c => c.outcome && c.outcome !== 'pending');
    const wins = executed.filter(c => c.outcome === 'win').length;
    const longs = checklists.filter(c => c.direction === 'bullish' || c.direction === 'long').length;
    const shorts = checklists.filter(c => c.direction === 'bearish' || c.direction === 'short').length;
    const withConfluence = checklists.filter(c => 
      c.w_trend && c.d_trend && c.h4_trend &&
      c.w_trend === c.d_trend && c.d_trend === c.h4_trend
    ).length;
    const avgCompletion = total > 0 ? Math.round(checklists.reduce((acc, c) => acc + (c.completion_percentage || 0), 0) / total) : 0;
    const winRate = executed.length > 0 ? ((wins / executed.length) * 100).toFixed(0) : 0;
    const totalPnL = executed.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
    
    return { total, ready, inProgress, longs, shorts, withConfluence, avgCompletion, winRate, totalPnL, executed: executed.length };
  }, [checklists]);

  const performanceData = useMemo(() => {
    const last30Days = [];
    let cumulativePnL = 0;
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTrades = checklists.filter(c => {
        const tradeDate = c.trade_date || format(new Date(c.created_date), 'yyyy-MM-dd');
        return tradeDate === dateStr;
      });
      const dayPnL = dayTrades
        .filter(t => t.outcome && t.outcome !== 'pending' && t.actual_pnl)
        .reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
      cumulativePnL += dayPnL;
      last30Days.push({ 
        date: format(date, 'dd.MM'), 
        trades: dayTrades.length,
        pnl: dayPnL,
        cumulative: cumulativePnL
      });
    }
    return last30Days;
  }, [checklists]);

  const directionData = useMemo(() => {
    const longTrades = checklists.filter(c => 
      c.direction === 'long' || c.direction === 'bullish' || 
      (c.d_trend === 'bullish' && c.w_trend === 'bullish')
    ).length;
    const shortTrades = checklists.filter(c => 
      c.direction === 'short' || c.direction === 'bearish' || 
      (c.d_trend === 'bearish' && c.w_trend === 'bearish')
    ).length;
    return [
      { name: t('long'), value: longTrades, color: '#0d9488' },
      { name: t('short'), value: shortTrades, color: '#e11d48' },
    ].filter(d => d.value > 0);
  }, [checklists, t]);

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const getTradesForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return checklists.filter(c => {
      const tradeDate = c.trade_date || format(new Date(c.created_date), 'yyyy-MM-dd');
      return tradeDate === dateStr;
    });
  };

  const recentTrades = checklists.slice(0, 12);
  const locale = language === 'de' ? de : enUS;

  // Theme classes
  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    textDimmed: darkMode ? 'text-zinc-600' : 'text-zinc-400',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4 relative">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <DarkModeToggle />
                <button onClick={() => navigate(createPageUrl('Home'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors p-1.5 sm:p-2`}>
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
                <img src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                } alt="ZNPCV" className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </button>

              <div className="flex items-center gap-1 sm:gap-2">
                <LanguageToggle />
                <AccountButton />
              </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Title - Compact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-widest mb-1 sm:mb-2 md:mb-3 ${theme.text}`}>DASHBOARD</h1>
          <p className={`${theme.textMuted} tracking-wider text-xs sm:text-sm md:text-base`}>{t('overviewStats')}</p>
        </motion.div>

        {/* Quick Actions - Advanced */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-5 md:mb-8">
          <button onClick={() => navigate(createPageUrl('Checklist'))}
            className={cn("group relative p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl overflow-hidden border-2 text-left transition-all hover:scale-[1.02] hover:shadow-2xl",
              darkMode ? "bg-gradient-to-br from-white to-zinc-100 text-black border-white" : "bg-gradient-to-br from-zinc-900 to-black text-white border-zinc-900")}>
            <div className={cn("absolute inset-0 opacity-10", darkMode ? "bg-gradient-to-br from-teal-600 to-blue-600" : "bg-gradient-to-br from-teal-500 to-emerald-500")} />
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-teal-600/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16 blur-2xl" />
            <div className="relative z-10">
              <div className={cn("w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform",
                darkMode ? "bg-black" : "bg-white shadow-lg")}>
                <Plus className={cn("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8", darkMode ? "text-white" : "text-black")} />
              </div>
              <div className={cn("text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-wider", darkMode ? "text-black" : "text-white")}>NEW ANALYSIS</div>
              <div className={cn("text-xs sm:text-sm", darkMode ? "text-black/60" : "text-white/70")}>Start professional setup</div>
              <div className="flex items-center gap-2 mt-3 sm:mt-4">
                <div className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold", darkMode ? "bg-black text-white" : "bg-white/20 text-white")}>
                  ZNPCV METHOD
                </div>
              </div>
            </div>
          </button>

          <button onClick={() => navigate(createPageUrl('TradeHistory'))}
            className={cn("group relative p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl overflow-hidden border-2 text-left transition-all hover:scale-[1.02] hover:shadow-2xl",
              darkMode ? "bg-gradient-to-br from-zinc-950 to-zinc-900 text-white border-zinc-800" : "bg-gradient-to-br from-zinc-100 to-zinc-200 text-black border-zinc-300")}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5" />
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-600/10 rounded-full translate-y-12 sm:translate-y-16 -translate-x-12 sm:-translate-x-16 blur-2xl" />
            <div className="relative z-10">
              <div className={cn("w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform",
                darkMode ? "bg-white" : "bg-zinc-900 shadow-lg")}>
                <Activity className={cn("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8", darkMode ? "text-black" : "text-white")} />
              </div>
              <div className={cn("text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-wider mb-1", darkMode ? "text-white" : "text-black")}>TRADE JOURNAL</div>
              <div className={cn("text-xs sm:text-sm", darkMode ? "text-zinc-400" : "text-zinc-600")}>Performance & Analytics</div>
            </div>
          </button>
        </motion.div>

        {/* Stats - Einheitlich */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10">
          {[
            { label: t('totalAnalyses'), value: stats.total, icon: Target },
            { label: t('readyToTradeShort'), value: stats.ready, icon: CheckCircle },
            { label: 'WIN RATE', value: `${stats.winRate}%`, icon: BarChart3 },
            { label: 'EXECUTED', value: stats.executed, icon: Activity },
          ].map((stat, index) => (
            <motion.div key={stat.label} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.15 + index * 0.05 }}
              className={cn("border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6",
                `${theme.border} ${theme.bgSecondary}`)}>
              <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mb-2 sm:mb-3 md:mb-4", theme.text)} />
              <div className={cn("text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light mb-1 sm:mb-2", theme.text)}>{stat.value}</div>
              <div className={cn("text-[9px] sm:text-[10px] md:text-xs tracking-widest", theme.textMuted)}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Trade History - Advanced */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className={`border-2 ${theme.border} rounded-2xl ${theme.bgSecondary} overflow-hidden shadow-xl`}>
              <div className={`p-5 sm:p-6 border-b-2 ${theme.border} ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <h3 className={`text-lg sm:text-xl tracking-widest ${theme.text} flex items-center gap-2`}>
                    <div className="w-1.5 h-6 bg-teal-600 rounded-full" />
                    RECENT TRADES
                  </h3>
                  <div className={`text-xs ${theme.textMuted}`}>Last 8 trades</div>
                </div>
                <div className="flex gap-2">
                  {['all', 'win', 'loss'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={cn("px-4 py-2 text-xs tracking-wider rounded-xl transition-all font-bold border-2 hover:scale-105",
                        filter === f 
                          ? darkMode ? "bg-white text-black border-white shadow-md" : "bg-zinc-900 text-white border-zinc-900 shadow-md"
                          : darkMode ? "bg-zinc-900/50 text-zinc-400 border-zinc-800/50 hover:text-white hover:border-zinc-700" : "bg-white text-zinc-600 border-zinc-300 hover:text-black hover:border-zinc-400")}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className={`p-10 sm:p-12 text-center ${theme.textDimmed}`}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  {t('loading')}
                </div>
              ) : recentTrades.length === 0 ? (
                <div className="p-10 sm:p-12 text-center">
                  <div className={`w-16 h-16 rounded-2xl ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center mx-auto mb-4`}>
                    <Plus className={`w-8 h-8 ${theme.textMuted}`} />
                  </div>
                  <p className={`${theme.textDimmed} mb-5 text-sm sm:text-base font-sans`}>{t('noAnalyses')}</p>
                  <Button onClick={() => navigate(createPageUrl('Checklist'))} className={`rounded-xl border-2 font-bold px-6 py-3 hover:scale-105 transition-transform ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                    {t('startFirstAnalysis')}
                  </Button>
                </div>
              ) : (
                <div className={`divide-y ${darkMode ? 'divide-zinc-800/50' : 'divide-zinc-200/50'} max-h-[650px] overflow-y-auto`}>
                  {recentTrades.filter(t => filter === 'all' || (filter === 'win' && t.outcome === 'win') || (filter === 'loss' && t.outcome === 'loss')).slice(0, 8).map((trade, idx) => (
                    <motion.div key={trade.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-5 sm:p-6 transition-all group cursor-pointer relative ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}
                      onClick={() => navigate(createPageUrl('TradeDetail') + `?id=${trade.id}`)}>
                      
                      {/* Hover Glow */}
                      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                        trade.outcome === 'win' && "bg-gradient-to-r from-teal-600/5 to-transparent",
                        trade.outcome === 'loss' && "bg-gradient-to-r from-rose-600/5 to-transparent"
                      )} />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <motion.div 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={cn("w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl border-2 shadow-lg",
                                trade.outcome === 'win' ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white border-teal-500' :
                                trade.outcome === 'loss' ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white border-rose-500' : 
                                trade.direction === 'long' ? 'border-2 border-teal-600 text-teal-600 bg-teal-600/10' : 'border-2 border-rose-600 text-rose-600 bg-rose-600/10')}>
                              {(trade.outcome === 'win' && parseFloat(trade.actual_pnl || 0) > 0) || (!trade.outcome && trade.direction === 'long') ? 
                                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" /> : <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6" />}
                            </motion.div>
                            <div>
                              <div className={`text-lg sm:text-xl font-black tracking-wider ${theme.text} mb-1`}>{trade.pair || '-'}</div>
                              <div className={`text-xs ${theme.textMuted} flex items-center gap-2`}>
                                <Clock className="w-3 h-3" />
                                {format(new Date(trade.created_date), 'dd.MM.yyyy HH:mm')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              {trade.outcome && trade.actual_pnl && (
                                <>
                                  <div className={cn("text-lg sm:text-xl font-black mb-1",
                                    parseFloat(trade.actual_pnl) > 0 ? 'text-teal-600' :
                                    parseFloat(trade.actual_pnl) < 0 ? 'text-rose-600' : theme.text)}>
                                    {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                                  </div>
                                  <div className={cn("text-[10px] tracking-wider px-2.5 py-1 rounded-lg font-bold",
                                    trade.outcome === 'win' ? 'bg-teal-600 text-white' :
                                    trade.outcome === 'loss' ? 'bg-rose-600 text-white' : 'bg-zinc-600 text-white')}>
                                    {trade.outcome.toUpperCase()}
                                  </div>
                                </>
                              )}
                              {!trade.outcome && (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs tracking-wider rounded-lg font-bold shadow-md">
                                  {trade.status === 'ready_to_trade' ? 'READY' : 'PENDING'}
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTrade(e, trade.id);
                              }}
                              className={`p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 ${darkMode ? 'hover:bg-rose-600/20 text-rose-400 hover:text-rose-500' : 'hover:bg-red-100 text-red-600 hover:text-red-700'}`}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                            <Target className="w-3 h-3" />
                            <span className={theme.textMuted}>Score: <span className={`font-bold ${theme.text}`}>{Math.round(trade.completion_percentage || 0)}%</span></span>
                          </div>
                          {trade.risk_percent && (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                              <span className={theme.textMuted}>Risk: <span className={`font-bold ${theme.text}`}>{trade.risk_percent}%</span></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Performance Chart - Advanced */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bgSecondary} overflow-hidden`}>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className={`text-base sm:text-lg tracking-widest flex items-center gap-2 ${theme.text}`}>
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">CUMULATIVE P&L</span>
                  <span className="sm:hidden text-sm">P&L</span>
                </h3>
                <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${performanceData[performanceData.length - 1]?.cumulative >= 0 ? 'bg-teal-600/20 text-teal-600' : 'bg-rose-600/20 text-rose-600'} text-[10px] sm:text-xs font-bold`}>
                  {performanceData[performanceData.length - 1]?.cumulative >= 0 ? '+' : ''}${(performanceData[performanceData.length - 1]?.cumulative || 0).toFixed(2)}
                </div>
              </div>
              <div className="h-40 sm:h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={performanceData[performanceData.length - 1]?.cumulative >= 0 ? "#0d9488" : "#e11d48"} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={performanceData[performanceData.length - 1]?.cumulative >= 0 ? "#0d9488" : "#e11d48"} stopOpacity={0}/>
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <XAxis dataKey="date" stroke={darkMode ? "#52525b" : "#a1a1aa"} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke={darkMode ? "#52525b" : "#a1a1aa"} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#09090b' : '#ffffff', 
                        border: `2px solid ${performanceData[performanceData.length - 1]?.cumulative >= 0 ? '#0d9488' : '#e11d48'}`, 
                        borderRadius: 16, 
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: darkMode ? '#fff' : '#000', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}
                      formatter={(value, name) => {
                        if (name === 'cumulative') return [`$${value.toFixed(2)}`, 'Total P&L'];
                        if (name === 'pnl') return [`$${value.toFixed(2)}`, 'Day P&L'];
                        return [value, 'Trades'];
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke={performanceData[performanceData.length - 1]?.cumulative >= 0 ? "#0d9488" : "#e11d48"} 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorCumulative)"
                      filter="url(#glow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className={`mt-4 pt-4 border-t ${theme.border} grid grid-cols-3 gap-3`}>
                <div className="text-center">
                  <div className={`text-[10px] ${theme.textMuted} mb-1`}>START</div>
                  <div className={`text-xs sm:text-sm font-bold ${theme.text}`}>$0.00</div>
                </div>
                <div className="text-center">
                  <div className={`text-[10px] ${theme.textMuted} mb-1`}>PEAK</div>
                  <div className="text-xs sm:text-sm font-bold text-teal-600">
                    ${Math.max(...performanceData.map(d => d.cumulative), 0).toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-[10px] ${theme.textMuted} mb-1`}>NOW</div>
                  <div className={`text-xs sm:text-sm font-bold ${performanceData[performanceData.length - 1]?.cumulative >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                    ${(performanceData[performanceData.length - 1]?.cumulative || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Direction Analysis - Advanced */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bgSecondary} overflow-hidden`}>
              <h3 className={`text-base sm:text-lg tracking-widest mb-4 sm:mb-5 flex items-center gap-2 ${theme.text}`}>
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('direction')}
              </h3>
              <div className="h-40 sm:h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <defs>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    <Pie 
                      data={directionData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={35} 
                      outerRadius={60} 
                      paddingAngle={5} 
                      dataKey="value"
                      filter="url(#shadow)"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {directionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#09090b' : '#ffffff', 
                        border: `2px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, 
                        borderRadius: 16, 
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value, name) => [value, name]}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className={`text-xs ${theme.textMuted}`}>TOTAL</div>
                    <div className={`text-2xl font-bold ${theme.text}`}>{stats.longs + stats.shorts}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 sm:mt-5">
                {directionData.map((item) => (
                  <div key={item.name} className={`p-3 sm:p-4 rounded-xl border-2 ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-300'} text-center`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className={`text-xs font-bold tracking-wider ${theme.text}`}>{item.name.toUpperCase()}</span>
                    </div>
                    <div className={`text-xl sm:text-2xl font-bold ${theme.text}`}>{item.value}</div>
                    <div className={`text-[10px] ${theme.textMuted} mt-1`}>
                      {((item.value / (stats.longs + stats.shorts)) * 100).toFixed(0)}% OF TRADES
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Calendar - Advanced */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bgSecondary} overflow-hidden`}>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className={`text-base sm:text-lg tracking-widest flex items-center gap-2 ${theme.text}`}>
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('calendar')}
                </h3>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} 
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 ${theme.border} ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'} transition-all flex items-center justify-center`}>
                    <span className={theme.text}>←</span>
                  </button>
                  <span className={`text-xs sm:text-sm tracking-wider font-bold ${theme.text} min-w-[90px] sm:min-w-[100px] text-center`}>
                    {format(calendarMonth, 'MMM yyyy', { locale }).toUpperCase()}
                  </span>
                  <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} 
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 ${theme.border} ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'} transition-all flex items-center justify-center`}>
                    <span className={theme.text}>→</span>
                  </button>
                </div>
              </div>
              
              <div className={`grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold ${theme.textMuted} mb-3`}>
                {(language === 'de' ? ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'] : language === 'fa' ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] : ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']).map(d => <div key={d} className="py-1">{d}</div>)}
              </div>
              
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {calendarDays.map((day) => {
                  const trades = getTradesForDay(day);
                  const dayPnL = trades.filter(t => t.actual_pnl).reduce((sum, t) => sum + parseFloat(t.actual_pnl), 0);
                  const hasWins = trades.some(t => t.outcome === 'win');
                  const hasLosses = trades.some(t => t.outcome === 'loss');
                  const hasReady = trades.some(t => t.status === 'ready_to_trade');
                  
                  return (
                    <button
                      type="button"
                      key={day.toISOString()}
                      onClick={() => trades.length > 0 && navigate(createPageUrl('TradeDetail') + `?id=${trades[0].id}`)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center text-sm relative rounded-xl transition-all group",
                        isToday(day) && "ring-2 ring-offset-2 ring-teal-600 font-bold scale-105",
                        isToday(day) && darkMode && "ring-offset-black",
                        isToday(day) && !darkMode && "ring-offset-white",
                        trades.length > 0 && hasWins && !hasLosses && (darkMode ? "bg-teal-600/30 hover:bg-teal-600/50 border-2 border-teal-600/50" : "bg-teal-100 hover:bg-teal-200 border-2 border-teal-300"),
                        trades.length > 0 && hasLosses && !hasWins && (darkMode ? "bg-rose-600/30 hover:bg-rose-600/50 border-2 border-rose-600/50" : "bg-rose-100 hover:bg-rose-200 border-2 border-rose-300"),
                        trades.length > 0 && hasWins && hasLosses && (darkMode ? "bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600" : "bg-zinc-300 hover:bg-zinc-400 border-2 border-zinc-400"),
                        trades.length > 0 && !hasWins && !hasLosses && (darkMode ? "bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800" : "bg-zinc-200 hover:bg-zinc-300 border-2 border-zinc-300"),
                        trades.length > 0 && "cursor-pointer",
                        trades.length === 0 && (darkMode ? "hover:bg-zinc-900/30" : "hover:bg-zinc-100")
                      )}>
                      <span className={cn("text-xs sm:text-sm", isToday(day) ? "text-teal-600 font-black" : theme.text)}>
                        {format(day, 'd')}
                      </span>
                      {trades.length > 0 && dayPnL !== 0 && (
                        <span className={cn("text-[8px] font-bold mt-0.5", dayPnL > 0 ? "text-teal-600" : "text-rose-600")}>
                          {dayPnL > 0 ? '+' : ''}{dayPnL.toFixed(0)}
                        </span>
                      )}
                      {trades.length > 1 && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-teal-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow-md">
                          {trades.length}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 pt-4 border-t ${theme.border}">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${darkMode ? 'bg-teal-600/30 border border-teal-600/50' : 'bg-teal-100 border border-teal-300'}`} />
                  <span className={`text-[9px] sm:text-[10px] ${theme.textMuted}`}>WIN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${darkMode ? 'bg-rose-600/30 border border-rose-600/50' : 'bg-rose-100 border border-rose-300'}`} />
                  <span className={`text-[9px] sm:text-[10px] ${theme.textMuted}`}>LOSS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-teal-600" />
                  <span className={`text-[9px] sm:text-[10px] ${theme.textMuted}`}>TODAY</span>
                </div>
              </div>
            </motion.div>

            {/* Avg Completion - Kompakt für Mobile */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className={`border-2 ${theme.border} rounded-2xl p-4 sm:p-6 md:p-8 ${theme.bgSecondary} text-center overflow-hidden relative`}>
              
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-teal-600 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-600 rounded-full blur-3xl" />
              </div>
              
              <div className="relative z-10">
                <div className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-2 bg-gradient-to-br ${stats.avgCompletion >= 85 ? 'from-teal-600 to-emerald-600' : 'from-zinc-500 to-zinc-600'} bg-clip-text text-transparent`}>
                  {stats.avgCompletion}%
                </div>
                <div className={`text-[10px] sm:text-xs md:text-sm ${theme.textMuted} tracking-widest mb-4 sm:mb-5 font-bold`}>
                  <span className="hidden sm:inline">{t('avgCompletion')}</span>
                  <span className="sm:hidden">AVG SCORE</span>
                </div>
                
                {/* Circular Progress - Kompakt */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
                  <svg className="transform -rotate-90 w-24 h-24 sm:w-32 sm:h-32">
                    <circle cx={window.innerWidth < 640 ? "48" : "64"} cy={window.innerWidth < 640 ? "48" : "64"} r={window.innerWidth < 640 ? "40" : "56"} stroke={darkMode ? "#27272a" : "#e4e4e7"} strokeWidth={window.innerWidth < 640 ? "6" : "8"} fill="none" />
                    <circle 
                      cx={window.innerWidth < 640 ? "48" : "64"}
                      cy={window.innerWidth < 640 ? "48" : "64"}
                      r={window.innerWidth < 640 ? "40" : "56"}
                      stroke={stats.avgCompletion >= 85 ? "#0d9488" : "#6b7280"}
                      strokeWidth={window.innerWidth < 640 ? "6" : "8"}
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * (window.innerWidth < 640 ? 40 : 56)}`}
                      strokeDashoffset={`${2 * Math.PI * (window.innerWidth < 640 ? 40 : 56) * (1 - stats.avgCompletion / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {stats.avgCompletion >= 85 ? (
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                    ) : (
                      <Target className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-500" />
                    )}
                  </div>
                </div>
                
                <div className={`text-[9px] sm:text-xs ${theme.textMuted} font-sans px-2`}>
                  {stats.avgCompletion >= 85 ? '✓ STANDARD' : 'Ziel: 85%+'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`mt-12 sm:mt-16 md:mt-20 lg:mt-24 border-t ${theme.border}`}>
          <div className="py-6 sm:py-8 md:py-10">
            <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
              <img src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              } alt="ZNPCV" className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto opacity-40" />
              <p className={`${theme.textDimmed} text-xs sm:text-sm tracking-widest`}>© {new Date().getFullYear()} ZNPCV</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <button onClick={() => navigate(createPageUrl('Impressum'))} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
                Impressum
              </button>
              <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              <button onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
                Datenschutz
              </button>
              <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              <button onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
                AGB
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}