import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useOffline } from '@/components/offline/OfflineManager';
import { offlineClient } from '@/components/offline/OfflineBase44Client';
import { Plus, Calendar, ChevronRight, Target, CheckCircle, Clock, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Minus, Globe, Home, Activity, Trash2, Edit, TrendingUp, ArrowLeft, Download, FileText, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, subMonths, addMonths } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import TradingQuote from '@/components/TradingQuote';
import DailyQuoteWidget from '@/components/DailyQuoteWidget';
import NotificationPrompt from '@/components/NotificationPrompt';
import AccountButton from '@/components/AccountButton';
import { lazy, Suspense } from 'react';
const BestTradingTimes = lazy(() => import('@/components/advanced/BestTradingTimes'));
const SwipeNavigation = lazy(() => import('@/components/mobile/SwipeNavigation'));
const BottomNav = lazy(() => import('@/components/mobile/BottomNav'));
const NoTradeStats = lazy(() => import('@/components/dashboard/NoTradeStats'));
import PremiumPageWrapper from '@/components/PremiumPageWrapper';

function DashboardPageInner() {
  const navigate = useNavigate();
  const { t, language, isRTL, darkMode } = useLanguage();
  const { isOnline, updatePendingCount } = useOffline();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showDailyQuote, setShowDailyQuote] = useState(false);
  
  useEffect(() => {
    offlineClient.setUpdateCallback(updatePendingCount);
  }, [updatePendingCount]);

  const { data: checklists = [], isLoading, refetch } = useQuery({
    queryKey: ['checklists'],
    queryFn: async () => {
      const client = await offlineClient.TradeChecklist();
      const all = await client.list('-created_date', 100);
      return all.filter(t => !t.deleted);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: isOnline ? 5000 : false
  });

  React.useEffect(() => {
    const checkUserSettings = async () => {
      try {
        const userData = await base44.auth.me();
        setShowDailyQuote(userData.show_daily_quote_in_app || false);
      } catch (err) {
        console.error('Failed to load user settings');
      }
    };
    checkUserSettings();
  }, []);

  const handleDeleteTrade = async (e, tradeId) => {
    e.stopPropagation();
    if (window.confirm(t('confirmDelete') || 'Trade wirklich löschen?')) {
      try {
        const client = await offlineClient.TradeChecklist();
        await client.update(tradeId, { 
          deleted: true, 
          deleted_date: new Date().toISOString() 
        });
        refetch();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const [filter, setFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  const stats = useMemo(() => {
    const total = checklists.length;
    const ready = checklists.filter(c => c.status === 'ready_to_trade').length;
    const inProgress = checklists.filter(c => c.status === 'in_progress').length;
    const executed = checklists.filter(c => c.outcome && c.outcome !== 'pending');
    const wins = executed.filter(c => c.outcome === 'win').length;
    const losses = executed.filter(c => c.outcome === 'loss').length;
    const breakeven = executed.filter(c => c.outcome === 'breakeven').length;
    const longs = checklists.filter(c => c.direction === 'bullish' || c.direction === 'long').length;
    const shorts = checklists.filter(c => c.direction === 'bearish' || c.direction === 'short').length;
    const withConfluence = checklists.filter(c => 
      c.w_trend && c.d_trend && c.h4_trend &&
      c.w_trend === c.d_trend && c.d_trend === c.h4_trend
    ).length;
    const avgCompletion = total > 0 ? Math.round(checklists.reduce((acc, c) => acc + (c.completion_percentage || 0), 0) / total) : 0;
    const winRate = executed.length > 0 ? ((wins / executed.length) * 100).toFixed(0) : 0;
    const totalPnL = executed.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
    const totalWins = executed.filter(c => c.outcome === 'win').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
    const totalLosses = Math.abs(executed.filter(c => c.outcome === 'loss').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0));
    const avgWin = wins > 0 ? (totalWins / wins).toFixed(2) : 0;
    const avgLoss = losses > 0 ? (totalLosses / losses).toFixed(2) : 0;
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : totalWins > 0 ? '∞' : 0;
    
    return { total, ready, inProgress, longs, shorts, wins, losses, breakeven, withConfluence, avgCompletion, winRate, totalPnL, totalWins, totalLosses, avgWin, avgLoss, profitFactor, executed: executed.length };
  }, [checklists]);

  const performanceData = useMemo(() => {
    const last30Days = [];
    let cumulativePnL = 0;
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTrades = checklists.filter(c => {
        return c.trade_date === dateStr;
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
  // Determine trading session based on UTC hour
  const getTradingSession = (date) => {
    if (!date) return null;
    const hour = new Date(date).getUTCHours();
    // Tokyo: 00:00-09:00 UTC
    if (hour >= 0 && hour < 9) return 'tokyo';
    // London: 08:00-17:00 UTC
    if (hour >= 8 && hour < 17) return 'london';
    // New York: 13:00-22:00 UTC
    if (hour >= 13 && hour < 22) return 'newyork';
    return 'tokyo'; // Default
  };

  const getTradesForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return checklists.filter(c => {
      const tradeDate = c.trade_date;
      if (tradeDate !== dateStr) return false;
      
      // Apply session filter
      if (sessionFilter === 'all') return true;
      const tradeSession = getTradingSession(c.created_date || c.trade_date);
      return tradeSession === sessionFilter;
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
    <Suspense fallback={null}>
    <SwipeNavigation currentPage="Dashboard">
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'} pb-20 md:pb-0`} style={{ transition: 'none' }}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4 relative">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <DarkModeToggle />
                <button onClick={() => navigate(createPageUrl('Home'))} className={`p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-zinc-900 text-zinc-400 hover:text-white' : 'hover:bg-zinc-200 text-zinc-600 hover:text-black'}`}>
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => navigate(createPageUrl('Trash'))}
                  className={cn("p-2 rounded-xl border-2 transition-all relative group",
                    darkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white" : "bg-zinc-100 border-zinc-300 hover:border-zinc-400 text-zinc-600 hover:text-black")}>
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
        {showDailyQuote && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-6">
            <DailyQuoteWidget darkMode={darkMode} />
          </motion.div>
        )}

        {/* Title - Compact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-widest mb-1 sm:mb-2 md:mb-3 ${theme.text}`}>DASHBOARD</h1>
              <p className={`${theme.textMuted} tracking-wider text-xs sm:text-sm md:text-base`}>{t('overviewStats')}</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button onClick={async () => {
                try {
                  setExporting(true);
                  const response = await base44.functions.invoke('exportTradesPDF', {});
                  const blob = new Blob([response.data], { type: 'application/pdf' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ZNPCV_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Export failed:', error);
                } finally {
                  setExporting(false);
                }
              }} disabled={exporting} className={cn("h-9 px-3 sm:px-4 text-xs border-2 font-bold rounded-xl transition-all",
                darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:border-zinc-400')}>
                <Download className="w-4 h-4 mr-1.5" />
                PDF
              </Button>
              <Button onClick={async () => {
                try {
                  setExporting(true);
                  const response = await base44.functions.invoke('exportTradesExcel', {});
                  const blob = new Blob([response.data], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ZNPCV_Dashboard_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Export failed:', error);
                } finally {
                  setExporting(false);
                }
              }} disabled={exporting} className={cn("h-9 px-3 sm:px-4 text-xs border-2 font-bold rounded-xl transition-all",
                darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:border-zinc-400')}>
                <FileText className="w-4 h-4 mr-1.5" />
                CSV
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - Responsive Design */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button onClick={() => navigate(createPageUrl('Checklist'))}
            className={cn("group relative rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all active:scale-[0.98] md:hover:scale-[1.02] touch-manipulation",
              "p-3 sm:p-4 md:p-5 lg:p-6 min-h-[140px] sm:min-h-[160px] md:min-h-[180px]",
              darkMode ? "bg-white border-white" : "bg-zinc-900 border-zinc-900")}>
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
              darkMode ? "bg-gradient-to-br from-zinc-100 to-white" : "bg-gradient-to-br from-zinc-800 to-zinc-900")} />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
              <div className={cn("w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform",
                darkMode ? "bg-black" : "bg-white shadow-xl")}>
                <Plus className={cn("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10", darkMode ? "text-white" : "text-black")} />
              </div>
              <div className={cn("text-xs sm:text-sm md:text-base lg:text-lg font-black tracking-wider mb-0.5 sm:mb-1",
                darkMode ? "text-black" : "text-white")}>
                {t('newAnalysis').toUpperCase()}
              </div>
              <div className={cn("text-[8px] sm:text-[9px] md:text-[10px] font-sans", darkMode ? "text-black/60" : "text-white/60")}>
                Analyse starten
              </div>
            </div>
          </button>

          <button onClick={() => navigate(createPageUrl('TradeHistory'))}
            className={cn("group relative rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all active:scale-[0.98] md:hover:scale-[1.02] touch-manipulation",
              "p-3 sm:p-4 md:p-5 lg:p-6 min-h-[140px] sm:min-h-[160px] md:min-h-[180px]",
              darkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300")}>
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
              darkMode ? "bg-gradient-to-br from-zinc-800 to-zinc-900" : "bg-gradient-to-br from-zinc-200 to-zinc-100")} />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
              <div className={cn("w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform",
                darkMode ? "bg-white" : "bg-zinc-900 shadow-xl")}>
                <History className={cn("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10", darkMode ? "text-black" : "text-white")} />
              </div>
              <div className={cn("text-xs sm:text-sm md:text-base lg:text-lg font-black tracking-wider mb-0.5 sm:mb-1",
                darkMode ? "text-white" : "text-black")}>
                TRADE HISTORY
              </div>
              <div className={cn("text-[8px] sm:text-[9px] md:text-[10px] font-sans", darkMode ? "text-zinc-400" : "text-zinc-600")}>
                Alle Trades
              </div>
            </div>
          </button>
        </motion.div>

        {/* Stats - Kompakt */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6 md:mb-8">
          {[
            { label: t('totalAnalyses'), value: stats.total, icon: Target, shortLabel: 'TOTAL' },
            { label: t('readyToTradeShort'), value: stats.ready, icon: CheckCircle, shortLabel: 'READY' },
            { label: t('winRate'), value: `${stats.winRate}%`, icon: BarChart3, shortLabel: 'WIN%', highlight: stats.winRate >= 50 },
          ].map((stat) => (
            <motion.div key={stat.label} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.1 }}
              className={cn("border-2 rounded-xl p-3 sm:p-4 md:p-5",
                stat.highlight 
                  ? darkMode ? "bg-emerald-700/20 border-emerald-700" : "bg-teal-100 border-emerald-700"
                  : `${theme.border} ${theme.bgSecondary}`)}>
              <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mb-2 sm:mb-3", 
                stat.highlight ? "text-emerald-700" : theme.text)} />
              <div className={cn("text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light mb-1 sm:mb-2", 
                stat.highlight ? "text-emerald-700" : theme.text)}>{stat.value}</div>
              <div className={cn("text-[9px] sm:text-[10px] md:text-xs tracking-widest", theme.textMuted)}>
                <span className="sm:hidden">{stat.shortLabel}</span>
                <span className="hidden sm:inline">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mt-4 sm:mt-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-5">
            {/* Trade History - Mobile Kompakt */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
              className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl ${theme.bgSecondary} overflow-hidden`}>
              <div className={`p-3 sm:p-4 md:p-5 border-b-2 ${theme.border} ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className={`text-sm sm:text-base md:text-lg tracking-widest ${theme.text} flex items-center gap-1.5 sm:gap-2`}>
                    <div className="w-1 h-4 sm:h-5 bg-emerald-700 rounded-full" />
                    {t('recentTrades')}
                  </h3>
                  <button
                    onClick={() => navigate(createPageUrl('TradeHistory'))}
                    className={cn("flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border transition-all active:scale-95 touch-manipulation",
                      darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-zinc-300 text-zinc-600")}
                  >
                    Alle
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {['all', 'win', 'loss', 'pending'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={cn("px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs tracking-wider rounded-lg transition-all font-bold border flex-shrink-0 touch-manipulation",
                        filter === f 
                          ? darkMode ? "bg-white text-black border-white" : "bg-zinc-900 text-white border-zinc-900"
                          : darkMode ? "bg-zinc-900/50 text-zinc-400 border-zinc-800/50" : "bg-white text-zinc-600 border-zinc-300")}>
                      {f === 'all' ? t('all') : f === 'win' ? t('win') : f === 'loss' ? t('loss') : t('pending')}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className={`p-10 sm:p-12 text-center ${theme.textDimmed}`}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  {t('loading')}
                </div>
              ) : recentTrades.length === 0 ? (
                <div className="p-10 sm:p-12 text-center">
                  <div className={`w-16 h-16 rounded-2xl ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center mx-auto mb-4`}>
                    <Plus className={`w-8 h-8 ${theme.textMuted}`} />
                  </div>
                  <p className={`${theme.textDimmed} mb-5 text-sm sm:text-base font-sans`}>{t('noAnalyses')}</p>
                  <Button onClick={() => navigate(createPageUrl('Checklist'))} className={`rounded-lg sm:rounded-xl border-2 font-bold px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm transition-all ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                    {t('startFirstAnalysis')}
                  </Button>
                </div>
              ) : (
                <div className={`divide-y ${darkMode ? 'divide-zinc-800/50' : 'divide-zinc-200/50'} max-h-[500px] sm:max-h-[600px] overflow-y-auto`}>
                  {recentTrades.filter(t => 
                    filter === 'all' || 
                    (filter === 'win' && t.outcome === 'win') || 
                    (filter === 'loss' && t.outcome === 'loss') ||
                    (filter === 'pending' && (!t.outcome || t.outcome === 'pending'))
                  ).slice(0, 6).map((trade, idx) => (
                    <motion.div key={trade.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1 }}
                      className={`p-3 sm:p-4 md:p-5 transition-all group cursor-pointer relative active:scale-[0.98] touch-manipulation ${darkMode ? 'active:bg-zinc-900' : 'active:bg-zinc-100'}`}
                      onClick={() => navigate(createPageUrl('TradeDetail') + `?id=${trade.id}`)}>
                      
                      {/* Hover Glow */}
                      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                        trade.outcome === 'win' && "bg-gradient-to-r from-teal-600/5 to-transparent",
                        trade.outcome === 'loss' && "bg-gradient-to-r from-rose-600/5 to-transparent"
                      )} />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg border-2 flex-shrink-0",
                              trade.outcome === 'win' ? 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white border-emerald-600' :
                              trade.outcome === 'loss' ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white border-rose-500' : 
                              trade.direction === 'long' ? 'border-emerald-700 text-emerald-700 bg-emerald-700/10' : 'border-rose-600 text-rose-600 bg-rose-600/10')}>
                              {(trade.outcome === 'win' && parseFloat(trade.actual_pnl || 0) > 0) || (!trade.outcome && trade.direction === 'long') ? 
                                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-base sm:text-lg font-black tracking-wider ${theme.text} mb-0.5 truncate`}>{trade.pair || '-'}</div>
                              <div className={`text-[10px] sm:text-xs ${theme.textMuted} flex items-center gap-1`}>
                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {format(new Date(trade.trade_date || trade.created_date), 'dd.MM.yy')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {trade.outcome && trade.actual_pnl && (
                              <>
                                <div className={cn("text-base sm:text-lg font-black mb-0.5",
                                  parseFloat(trade.actual_pnl) > 0 ? 'text-emerald-700' :
                                  parseFloat(trade.actual_pnl) < 0 ? 'text-rose-600' : theme.text)}>
                                  {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                                </div>
                                <div className={cn("text-[9px] sm:text-[10px] tracking-wider px-2 py-0.5 rounded-md font-bold inline-block",
                                 trade.outcome === 'win' ? 'bg-emerald-700 text-white' :
                                 trade.outcome === 'loss' ? 'bg-rose-600 text-white' : 'bg-zinc-600 text-white')}>
                                 {trade.outcome === 'win' ? t('win') : trade.outcome === 'loss' ? t('loss') : t('breakeven')}
                                </div>
                              </>
                            )}
                            {!trade.outcome && (
                              <span className="px-2 py-1 bg-blue-600 text-white text-[10px] sm:text-xs tracking-wider rounded-md font-bold">
                                {trade.status === 'ready_to_trade' ? 'READY' : 'PENDING'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs flex-wrap">
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                            <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className={`font-bold ${theme.text}`}>{Math.round(trade.completion_percentage || 0)}%</span>
                          </div>
                          {trade.risk_percent && (
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                              <span className={`font-bold ${theme.text}`}>{trade.risk_percent}%</span>
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
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {/* Performance Chart - Mobile Optimiert */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className={cn("relative rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 overflow-hidden border-2",
                performanceData[performanceData.length - 1]?.cumulative >= 0 
                  ? darkMode ? "bg-gradient-to-br from-teal-950 via-black to-black border-emerald-700/30" : "bg-gradient-to-br from-teal-50 via-white to-white border-teal-400"
                  : darkMode ? "bg-gradient-to-br from-rose-950 via-black to-black border-rose-600/30" : "bg-gradient-to-br from-rose-50 via-white to-white border-rose-400")}>
              
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl animate-pulse",
                  performanceData[performanceData.length - 1]?.cumulative >= 0 ? "bg-emerald-700" : "bg-rose-600")} style={{ animationDuration: '3s' }} />
                <div className={cn("absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl animate-pulse",
                  performanceData[performanceData.length - 1]?.cumulative >= 0 ? "bg-emerald-600" : "bg-red-600")} style={{ animationDuration: '4s' }} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center",
                      performanceData[performanceData.length - 1]?.cumulative >= 0 
                        ? "bg-gradient-to-br from-teal-600 to-emerald-700" 
                        : "bg-gradient-to-br from-rose-600 to-red-600")}>
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-[10px] sm:text-xs tracking-widest ${theme.text}`}>CUMULATIVE</h3>
                      <div className={cn("text-lg sm:text-xl md:text-2xl font-black",
                        performanceData[performanceData.length - 1]?.cumulative >= 0 ? 'text-emerald-700' : 'text-rose-600')}>
                        {performanceData[performanceData.length - 1]?.cumulative >= 0 ? '+' : ''}${(performanceData[performanceData.length - 1]?.cumulative || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className={cn("px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg font-black text-[10px] sm:text-xs border-2",
                    performanceData[performanceData.length - 1]?.cumulative >= 0 
                      ? "bg-emerald-700/20 border-emerald-700/50 text-emerald-700" 
                      : "bg-rose-600/20 border-rose-600/50 text-rose-600")}>
                    30D
                  </div>
                </div>
                
                <div className="h-32 sm:h-40 md:h-48 relative mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={performanceData[performanceData.length - 1]?.cumulative >= 0 ? "#0d9488" : "#e11d48"} stopOpacity={0.6}/>
                          <stop offset="95%" stopColor={performanceData[performanceData.length - 1]?.cumulative >= 0 ? "#0d9488" : "#e11d48"} stopOpacity={0.05}/>
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <XAxis dataKey="date" stroke={darkMode ? "#52525b" : "#a1a1aa"} fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke={darkMode ? "#52525b" : "#a1a1aa"} fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          background: `linear-gradient(135deg, ${darkMode ? '#18181b' : '#ffffff'} 0%, ${darkMode ? '#09090b' : '#fafafa'} 100%)`,
                          border: `2px solid ${performanceData[performanceData.length - 1]?.cumulative >= 0 ? '#0d9488' : '#e11d48'}`, 
                          borderRadius: 16, 
                          padding: '12px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                        }}
                        labelStyle={{ color: darkMode ? '#fff' : '#000', fontWeight: 'bold', fontSize: '11px', marginBottom: '6px' }}
                        formatter={(value, name) => {
                          if (name === 'cumulative') return [`$${value.toFixed(2)}`, 'Total'];
                          return [value, 'Trades'];
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cumulative" 
                        stroke={performanceData[performanceData.length - 1]?.cumulative >= 0 ? "#0d9488" : "#e11d48"} 
                        strokeWidth={3.5} 
                        fillOpacity={1} 
                        fill="url(#colorCumulative)"
                        filter="url(#glow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { label: t('start'), value: '$0', color: theme.textMuted },
                    { label: t('peak'), value: `$${Math.max(...performanceData.map(d => d.cumulative), 0).toFixed(0)}`, color: 'text-emerald-700' },
                    { label: t('now'), value: `${performanceData[performanceData.length - 1]?.cumulative >= 0 ? '+' : ''}$${(performanceData[performanceData.length - 1]?.cumulative || 0).toFixed(0)}`, color: performanceData[performanceData.length - 1]?.cumulative >= 0 ? 'text-emerald-700' : 'text-rose-600' }
                  ].map((stat) => (
                    <div key={stat.label} className={cn("p-2 sm:p-2.5 rounded-lg text-center border transition-all",
                      darkMode ? "bg-zinc-900/80 border-zinc-800/50" : "bg-white/80 border-zinc-200")}>
                      <div className={`text-[8px] sm:text-[9px] ${theme.textMuted} tracking-wider mb-1`}>{stat.label}</div>
                      <div className={`text-xs sm:text-sm font-black ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Trade Performance - Advanced */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
              className={cn("rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 border-2 relative overflow-hidden",
                darkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-6 sm:mb-7 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center relative",
                    darkMode ? "bg-gradient-to-br from-zinc-900 to-zinc-800" : "bg-gradient-to-br from-zinc-200 to-zinc-100")}>
                    <Activity className={cn("w-5 h-5 sm:w-6 sm:h-6", theme.text)} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-700 rounded-full border-2 border-zinc-950" />
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg tracking-widest ${theme.text} font-black`}>PERFORMANCE</h3>
                    <div className={`text-[10px] sm:text-xs ${theme.textMuted} font-sans`}>{stats.executed} Trades • {stats.winRate}% Win Rate</div>
                  </div>
                </div>
              </div>

              {/* Performance Matrix - Direction x Outcome */}
              <div className="mb-6 relative z-10">
                <div className={`text-xs sm:text-sm tracking-wider ${theme.textMuted} mb-4 font-bold flex items-center gap-2`}>
                  <div className={`w-1.5 h-5 rounded-full ${darkMode ? 'bg-white' : 'bg-zinc-900'}`} />
                  TRADE MATRIX
                </div>

                <div className={cn("rounded-xl p-4 sm:p-5 border-2",
                  darkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-300")}>

                  {/* Matrix Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {/* Header Row */}
                    <div />
                    <div className={`text-[10px] font-black text-center ${theme.textMuted}`}>WIN</div>
                    <div className={`text-[10px] font-black text-center ${theme.textMuted}`}>LOSS</div>
                    <div className={`text-[10px] font-black text-center ${theme.textMuted}`}>BE</div>

                    {/* Long Row */}
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                      <span className={`text-[10px] font-black text-emerald-700`}>LONG</span>
                    </div>
                    {(() => {
                      const longTrades = checklists.filter(c => c.direction === 'long' || c.direction === 'bullish');
                      const longWins = longTrades.filter(c => c.outcome === 'win').length;
                      const longLosses = longTrades.filter(c => c.outcome === 'loss').length;
                      const longBE = longTrades.filter(c => c.outcome === 'breakeven').length;
                      return (
                        <>
                          <div className={cn("rounded-lg p-2 text-center border-2 transition-all hover:scale-105",
                            longWins > 0 
                              ? darkMode ? "bg-emerald-700/20 border-emerald-700/50" : "bg-teal-100 border-teal-400"
                              : darkMode ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-100 border-zinc-300")}>
                            <div className={`text-lg font-black ${longWins > 0 ? 'text-emerald-700' : theme.textMuted}`}>{longWins}</div>
                            {longWins > 0 && <div className={`text-[8px] ${theme.textMuted}`}>{((longWins/longTrades.length)*100).toFixed(0)}%</div>}
                          </div>
                          <div className={cn("rounded-lg p-2 text-center border-2 transition-all hover:scale-105",
                            longLosses > 0 
                              ? darkMode ? "bg-rose-600/20 border-rose-600/50" : "bg-rose-100 border-rose-400"
                              : darkMode ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-100 border-zinc-300")}>
                            <div className={`text-lg font-black ${longLosses > 0 ? 'text-rose-600' : theme.textMuted}`}>{longLosses}</div>
                            {longLosses > 0 && <div className={`text-[8px] ${theme.textMuted}`}>{((longLosses/longTrades.length)*100).toFixed(0)}%</div>}
                          </div>
                          <div className={cn("rounded-lg p-2 text-center border-2 transition-all hover:scale-105",
                            longBE > 0 
                              ? darkMode ? "bg-zinc-700/50 border-zinc-600" : "bg-zinc-200 border-zinc-400"
                              : darkMode ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-100 border-zinc-300")}>
                            <div className={`text-lg font-black ${longBE > 0 ? theme.text : theme.textMuted}`}>{longBE}</div>
                            {longBE > 0 && <div className={`text-[8px] ${theme.textMuted}`}>{((longBE/longTrades.length)*100).toFixed(0)}%</div>}
                          </div>
                        </>
                      );
                    })()}

                    {/* Short Row */}
                    <div className="flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-rose-600" />
                      <span className={`text-[10px] font-black text-rose-600`}>SHORT</span>
                    </div>
                    {(() => {
                      const shortTrades = checklists.filter(c => c.direction === 'short' || c.direction === 'bearish');
                      const shortWins = shortTrades.filter(c => c.outcome === 'win').length;
                      const shortLosses = shortTrades.filter(c => c.outcome === 'loss').length;
                      const shortBE = shortTrades.filter(c => c.outcome === 'breakeven').length;
                      return (
                        <>
                          <div className={cn("rounded-lg p-2 text-center border-2 transition-all hover:scale-105",
                            shortWins > 0 
                              ? darkMode ? "bg-emerald-700/20 border-emerald-700/50" : "bg-teal-100 border-teal-400"
                              : darkMode ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-100 border-zinc-300")}>
                            <div className={`text-lg font-black ${shortWins > 0 ? 'text-emerald-700' : theme.textMuted}`}>{shortWins}</div>
                            {shortWins > 0 && <div className={`text-[8px] ${theme.textMuted}`}>{((shortWins/shortTrades.length)*100).toFixed(0)}%</div>}
                          </div>
                          <div className={cn("rounded-lg p-2 text-center border-2 transition-all hover:scale-105",
                            shortLosses > 0 
                              ? darkMode ? "bg-rose-600/20 border-rose-600/50" : "bg-rose-100 border-rose-400"
                              : darkMode ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-100 border-zinc-300")}>
                            <div className={`text-lg font-black ${shortLosses > 0 ? 'text-rose-600' : theme.textMuted}`}>{shortLosses}</div>
                            {shortLosses > 0 && <div className={`text-[8px] ${theme.textMuted}`}>{((shortLosses/shortTrades.length)*100).toFixed(0)}%</div>}
                          </div>
                          <div className={cn("rounded-lg p-2 text-center border-2 transition-all hover:scale-105",
                            shortBE > 0 
                              ? darkMode ? "bg-zinc-700/50 border-zinc-600" : "bg-zinc-200 border-zinc-400"
                              : darkMode ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-100 border-zinc-300")}>
                            <div className={`text-lg font-black ${shortBE > 0 ? theme.text : theme.textMuted}`}>{shortBE}</div>
                            {shortBE > 0 && <div className={`text-[8px] ${theme.textMuted}`}>{((shortBE/shortTrades.length)*100).toFixed(0)}%</div>}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t-2 border-zinc-800/50">
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl font-black text-emerald-700`}>{stats.wins}</div>
                      <div className={`text-[9px] ${theme.textMuted} tracking-wider mt-1`}>WINS</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl font-black text-rose-600`}>{stats.losses}</div>
                      <div className={`text-[9px] ${theme.textMuted} tracking-wider mt-1`}>LOSSES</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl font-black ${theme.text}`}>{stats.breakeven}</div>
                      <div className={`text-[9px] ${theme.textMuted} tracking-wider mt-1`}>BE</div>
                    </div>
                  </div>

                  {/* Advanced Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className={cn("text-center p-2 rounded-lg border",
                      darkMode ? "bg-emerald-700/10 border-emerald-700/30" : "bg-teal-50 border-teal-300")}>
                      <div className="text-xs sm:text-sm font-black text-emerald-700">${stats.avgWin}</div>
                      <div className={`text-[8px] ${theme.textMuted} mt-0.5`}>Ø WIN</div>
                    </div>
                    <div className={cn("text-center p-2 rounded-lg border",
                      darkMode ? "bg-rose-600/10 border-rose-600/30" : "bg-rose-50 border-rose-300")}>
                      <div className="text-xs sm:text-sm font-black text-rose-600">${stats.avgLoss}</div>
                      <div className={`text-[8px] ${theme.textMuted} mt-0.5`}>Ø LOSS</div>
                    </div>
                    <div className={cn("text-center p-2 rounded-lg border",
                      darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-300")}>
                      <div className={`text-xs sm:text-sm font-black ${theme.text}`}>{stats.profitFactor}</div>
                      <div className={`text-[8px] ${theme.textMuted} mt-0.5`}>P-FACTOR</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Direction Stats */}
              <div className={cn("relative z-10 rounded-lg p-3 border flex items-center justify-center gap-4",
                darkMode ? "bg-zinc-900/30 border-zinc-800/50" : "bg-white border-zinc-300")}>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-700" />
                  <span className="text-xl font-black text-emerald-700">{stats.longs}</span>
                  <span className={`text-xs ${theme.textMuted}`}>LONG</span>
                </div>
                <div className={`w-px h-6 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  <span className="text-xl font-black text-rose-600">{stats.shorts}</span>
                  <span className={`text-xs ${theme.textMuted}`}>SHORT</span>
                </div>
              </div>
            </motion.div>

            {/* Calendar - Mobile Touch Optimiert */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
              className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 ${theme.bgSecondary}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className={`text-xs sm:text-sm md:text-base tracking-widest flex items-center gap-1.5 ${theme.text}`}>
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {t('calendar')}
                </h3>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} 
                    className={`w-7 h-7 rounded-md border ${theme.border} ${darkMode ? 'active:bg-zinc-800' : 'active:bg-zinc-200'} transition-all flex items-center justify-center touch-manipulation`}>
                    <span className={`${theme.text} text-sm`}>←</span>
                  </button>
                  <span className={`text-[10px] sm:text-xs tracking-wider font-bold ${theme.text} min-w-[70px] sm:min-w-[90px] text-center`}>
                    {format(calendarMonth, 'MMM yy', { locale }).toUpperCase()}
                  </span>
                  <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} 
                    className={`w-7 h-7 rounded-md border ${theme.border} ${darkMode ? 'active:bg-zinc-800' : 'active:bg-zinc-200'} transition-all flex items-center justify-center touch-manipulation`}>
                    <span className={`${theme.text} text-sm`}>→</span>
                  </button>
                </div>
              </div>

              {/* Session Filter - Touch Optimiert */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {[
                  { id: 'all', label: 'ALL', emoji: '🌍' },
                  { id: 'london', label: 'LON', emoji: '🇬🇧' },
                  { id: 'newyork', label: 'NY', emoji: '🇺🇸' },
                  { id: 'tokyo', label: 'TYO', emoji: '🇯🇵' }
                ].map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSessionFilter(session.id)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-[9px] sm:text-[10px] tracking-wider rounded-md transition-all font-bold border flex-shrink-0 touch-manipulation",
                      sessionFilter === session.id
                        ? darkMode ? "bg-white text-black border-white" : "bg-zinc-900 text-white border-zinc-900"
                        : darkMode ? "bg-zinc-900/50 text-zinc-400 border-zinc-800/50" : "bg-white text-zinc-600 border-zinc-300"
                    )}
                  >
                    <span className="text-xs">{session.emoji}</span>
                    <span className="hidden sm:inline">{session.label}</span>
                  </button>
                ))}
              </div>
              
              <div className={`grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[9px] sm:text-[10px] font-bold ${theme.textMuted} mb-2`}>
                {(language === 'de' ? ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'] : language === 'fa' ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] : ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']).map(d => <div key={d} className="py-0.5">{d}</div>)}
              </div>
              
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {calendarDays.map((day) => {
                  const trades = getTradesForDay(day);
                  const dayPnL = trades.filter(t => t.actual_pnl).reduce((sum, t) => sum + parseFloat(t.actual_pnl), 0);
                  const hasWins = trades.some(t => t.outcome === 'win');
                  const hasLosses = trades.some(t => t.outcome === 'loss');
                  const isProfitable = dayPnL > 0;
                  const isNegative = dayPnL < 0;
                  
                  return (
                    <button
                      type="button"
                      key={day.toISOString()}
                      onClick={() => trades.length > 0 && navigate(createPageUrl('TradeDetail') + `?id=${trades[0].id}`)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center relative rounded-md sm:rounded-lg transition-all group overflow-hidden touch-manipulation",
                        isToday(day) && "ring-2 ring-offset-2 ring-teal-600 ring-offset-black scale-105 z-10",
                        trades.length > 0 && isProfitable && (darkMode 
                          ? "bg-gradient-to-br from-teal-600/40 via-teal-600/30 to-emerald-700/30 hover:from-teal-600/60 hover:via-teal-600/50 hover:to-emerald-700/50 border-2 border-emerald-600/50 shadow-lg shadow-teal-600/20" 
                          : "bg-gradient-to-br from-teal-100 via-teal-50 to-emerald-50 hover:from-teal-200 hover:via-teal-100 hover:to-emerald-100 border-2 border-teal-400 shadow-lg"),
                        trades.length > 0 && isNegative && (darkMode 
                          ? "bg-gradient-to-br from-rose-600/40 via-rose-600/30 to-red-600/30 hover:from-rose-600/60 hover:via-rose-600/50 hover:to-red-600/50 border-2 border-rose-500/50 shadow-lg shadow-rose-600/20" 
                          : "bg-gradient-to-br from-rose-100 via-rose-50 to-red-50 hover:from-rose-200 hover:via-rose-100 hover:to-red-100 border-2 border-rose-400 shadow-lg"),
                        trades.length > 0 && dayPnL === 0 && (darkMode 
                          ? "bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border-2 border-zinc-700 shadow-md" 
                          : "bg-gradient-to-br from-zinc-200 to-zinc-300 hover:from-zinc-300 hover:to-zinc-400 border-2 border-zinc-400 shadow-md"),
                        trades.length > 0 && "cursor-pointer",
                        trades.length === 0 && (darkMode ? "border border-zinc-800/30 hover:bg-zinc-900/20 hover:border-zinc-700/50" : "border border-zinc-300/50 hover:bg-zinc-100 hover:border-zinc-400/80")
                      )}>
                      
                      {/* Glow Effect */}
                      {trades.length > 0 && (
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl",
                          isProfitable && "bg-emerald-700/30",
                          isNegative && "bg-rose-600/30"
                        )} />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <span className={cn("text-xs sm:text-sm font-bold mb-0.5", 
                          isToday(day) ? "text-emerald-700 text-sm sm:text-base" : 
                          trades.length > 0 ? theme.text : theme.textSecondary)}>
                          {format(day, 'd')}
                        </span>
                        {trades.length > 0 && dayPnL !== 0 && (
                          <div className={cn("flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold",
                            isProfitable ? "bg-emerald-700/20 text-emerald-700" : "bg-rose-600/20 text-rose-600")}>
                            {isProfitable ? '↑' : '↓'}
                            {Math.abs(dayPnL).toFixed(0)}
                          </div>
                        )}
                      </div>

                      {trades.length > 1 && (
                        <div className="absolute top-0.5 right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-700 text-white text-[9px] sm:text-[10px] rounded-md flex items-center justify-center font-black">
                          {trades.length}
                        </div>
                      )}
                      
                      {/* Subtle Pattern Overlay */}
                      {trades.length > 0 && (
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)',
                          backgroundSize: '8px 8px'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Stats Summary - Mobile */}
              <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 ${theme.border} grid grid-cols-3 gap-1.5 sm:gap-2`}>
                <div className={cn("text-center p-2 sm:p-2.5 rounded-lg border-2",
                  darkMode ? "bg-emerald-700/10 border-emerald-700/30" : "bg-teal-50 border-teal-300")}>
                  <div className="text-base sm:text-lg md:text-xl font-black text-emerald-700">
                    {checklists.filter(t => {
                      const tDate = format(new Date(t.trade_date || t.created_date), 'yyyy-MM');
                      const cMonth = format(calendarMonth, 'yyyy-MM');
                      return tDate === cMonth && t.outcome === 'win';
                    }).length}
                  </div>
                  <div className={`text-[8px] sm:text-[9px] tracking-wider mt-0.5 ${theme.textMuted} font-bold`}>WINS</div>
                </div>
                <div className={cn("text-center p-2 sm:p-2.5 rounded-lg border-2",
                  darkMode ? "bg-rose-600/10 border-rose-600/30" : "bg-rose-50 border-rose-300")}>
                  <div className="text-base sm:text-lg md:text-xl font-black text-rose-600">
                    {checklists.filter(t => {
                      const tDate = format(new Date(t.trade_date || t.created_date), 'yyyy-MM');
                      const cMonth = format(calendarMonth, 'yyyy-MM');
                      return tDate === cMonth && t.outcome === 'loss';
                    }).length}
                  </div>
                  <div className={`text-[8px] sm:text-[9px] tracking-wider mt-0.5 ${theme.textMuted} font-bold`}>LOSS</div>
                </div>
                <div className={cn("text-center p-2 sm:p-2.5 rounded-lg border-2",
                  darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300")}>
                  <div className={`text-base sm:text-lg md:text-xl font-black ${theme.text}`}>
                    {(() => {
                      const monthPnL = checklists
                        .filter(t => {
                          const tDate = format(new Date(t.trade_date || t.created_date), 'yyyy-MM');
                          const cMonth = format(calendarMonth, 'yyyy-MM');
                          return tDate === cMonth;
                        })
                        .reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
                      return monthPnL >= 0 ? `+${monthPnL.toFixed(0)}` : monthPnL.toFixed(0);
                    })()}
                  </div>
                  <div className={`text-[8px] sm:text-[9px] tracking-wider mt-0.5 ${theme.textMuted} font-bold`}>P&L</div>
                </div>
              </div>
            </motion.div>



            {/* Best Trading Times */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}>
              <BestTradingTimes trades={checklists} darkMode={darkMode} />
            </motion.div>

            {/* No-Trade Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}>
              <NoTradeStats darkMode={darkMode} />
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

      {/* Notification Prompt */}
      <NotificationPrompt darkMode={darkMode} />
      
      {/* Mobile Bottom Navigation */}
      <BottomNav darkMode={darkMode} />
    </div>
    </SwipeNavigation>
    </Suspense>
  );
}

export default function DashboardPage() {
  return <PremiumPageWrapper><DashboardPageInner /></PremiumPageWrapper>;
}