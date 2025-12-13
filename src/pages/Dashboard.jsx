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
import PerformanceChart from '@/components/advanced/PerformanceChart';
import AIPerformanceAnalysis from '@/components/advanced/AIPerformanceAnalysis';

const SESSIONS = [
  { name: 'TOKYO', timezone: 'Asia/Tokyo', emoji: '🇯🇵', openHour: 9, closeHour: 18 },
  { name: 'LONDON', timezone: 'Europe/London', emoji: '🇬🇧', openHour: 8, closeHour: 17 },
  { name: 'NEW YORK', timezone: 'America/New_York', emoji: '🇺🇸', openHour: 9, closeHour: 17 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t, language, isRTL, darkMode } = useLanguage();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [times, setTimes] = useState({});

  React.useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const newTimes = {};
      SESSIONS.forEach(session => {
        newTimes[session.name] = now.toLocaleTimeString('de-DE', {
          timeZone: session.timezone,
          hour: '2-digit',
          minute: '2-digit',
        });
      });
      setTimes(newTimes);
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSessionOpen = (session) => {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: session.timezone }));
    const hour = localTime.getHours();
    const day = localTime.getDay();
    if (day === 0 || day === 6) return false;
    return hour >= session.openHour && hour < session.closeHour;
  };

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
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTrades = checklists.filter(c => c.trade_date === dateStr || format(new Date(c.created_date), 'yyyy-MM-dd') === dateStr);
      last30Days.push({ date: format(date, 'dd.MM'), trades: dayTrades.length });
    }
    return last30Days;
  }, [checklists]);

  const directionData = [
    { name: t('long'), value: stats.longs, color: '#0d9488' },
    { name: t('short'), value: stats.shorts, color: '#e11d48' },
  ].filter(d => d.value > 0);

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const getTradesForDay = (date) => checklists.filter(c => c.trade_date === format(date, 'yyyy-MM-dd'));

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
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <DarkModeToggle />
                <button onClick={() => navigate(createPageUrl('Home'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors p-1.5 sm:p-2`}>
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
                <button onClick={() => navigate(createPageUrl('Home'))}>
                  <img src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              } alt="ZNPCV" className="h-10 sm:h-12 md:h-14 w-auto cursor-pointer hover:opacity-80" />
                </button>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <LanguageToggle />
                <AccountButton />
              </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 md:mb-10">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl tracking-widest mb-2 sm:mb-3 ${theme.text}`}>{t('tradingDashboard')}</h1>
          <p className={`${theme.textMuted} tracking-wider text-sm sm:text-base`}>{t('overviewStats')}</p>
        </motion.div>

        {/* Quick Actions - Prominent */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button onClick={() => navigate(createPageUrl('Checklist'))}
            className={cn("group relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl overflow-hidden border-2 text-left",
              darkMode ? "bg-white text-black border-white" : "bg-black text-white border-black")}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-black/5 rounded-full -translate-y-10 translate-x-10" />
            <Plus className={cn("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 sm:mb-3", darkMode ? "text-black" : "text-white")} />
            <div className={cn("text-base sm:text-lg md:text-xl font-bold tracking-wider", darkMode ? "text-black" : "text-white")}>NEW ANALYSIS</div>
            <div className={cn("text-[10px] sm:text-xs mt-1", darkMode ? "text-black/60" : "text-white/60")}>Start Checklist</div>
          </button>

          <button onClick={() => navigate(createPageUrl('TradeHistory'))}
            className={cn("group relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl overflow-hidden border-2 text-left",
              darkMode ? "bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700" : "bg-zinc-100 text-black border-zinc-300 hover:border-zinc-400")}>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
            <Activity className={cn("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 sm:mb-3", darkMode ? "text-white" : "text-black")} />
            <div className={cn("text-base sm:text-lg md:text-xl font-bold tracking-wider", darkMode ? "text-white" : "text-black")}>TRADE HISTORY</div>
            <div className={cn("text-[10px] sm:text-xs mt-1", darkMode ? "text-zinc-400" : "text-zinc-600")}>Full Journal</div>
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10">
          {[
            { label: t('totalAnalyses'), value: stats.total, icon: Target },
            { label: t('readyToTradeShort'), value: stats.ready, icon: CheckCircle, highlight: true },
            { label: 'WIN RATE', value: `${stats.winRate}%`, icon: BarChart3, highlight: stats.winRate >= 60 },
            { label: 'P&L', value: `$${stats.totalPnL.toFixed(0)}`, icon: TrendingUp, highlight: stats.totalPnL > 0, isProfit: true },
            { label: 'EXECUTED', value: stats.executed, icon: Activity },
            { label: t('withConfluence'), value: stats.withConfluence, icon: Target },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + index * 0.05 }}
              className={cn("border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6", 
                stat.highlight && stat.isProfit && stats.totalPnL > 0 ? "bg-teal-600 text-white border-teal-600" :
                stat.highlight && stat.isProfit && stats.totalPnL < 0 ? "bg-rose-600 text-white border-rose-600" :
                stat.highlight ? "bg-teal-600 text-white border-teal-600" : 
                `${theme.border} ${theme.bgSecondary}`)}>
              <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mb-2 sm:mb-3 md:mb-4", stat.highlight ? "text-white" : theme.text)} />
              <div className={cn("text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light mb-1 sm:mb-2", stat.highlight ? "text-white" : theme.text)}>{stat.value}</div>
              <div className={cn("text-[9px] sm:text-[10px] md:text-xs tracking-widest", stat.highlight ? "text-white/90" : theme.textMuted)}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Performance Analysis */}
        <AIPerformanceAnalysis checklists={checklists} darkMode={darkMode} />

        {/* Performance Chart */}
        <PerformanceChart checklists={checklists} darkMode={darkMode} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Trade History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className={`border-2 ${theme.border} rounded-2xl ${theme.bgSecondary} overflow-hidden`}>
              <div className={`p-5 sm:p-6 border-b ${theme.border} flex items-center justify-between flex-wrap gap-3`}>
                <h3 className={`text-lg sm:text-xl tracking-widest ${theme.text}`}>TRADE HISTORY</h3>
                <div className="flex gap-2">
                  {['all', 'win', 'loss'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={cn("px-3 sm:px-4 py-1.5 sm:py-2 text-xs tracking-wider rounded-xl transition-all font-bold border-2",
                        filter === f 
                          ? darkMode ? "bg-white text-black border-white" : "bg-zinc-900 text-white border-zinc-900"
                          : darkMode ? "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700" : "bg-zinc-100 text-zinc-600 border-zinc-300 hover:text-black hover:border-zinc-400")}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className={`p-8 sm:p-10 text-center ${theme.textDimmed}`}>{t('loading')}</div>
              ) : recentTrades.length === 0 ? (
                <div className="p-8 sm:p-10 text-center">
                  <p className={`${theme.textDimmed} mb-5 text-sm sm:text-base`}>{t('noAnalyses')}</p>
                  <Button onClick={() => navigate(createPageUrl('Checklist'))} className={`rounded-xl border-2 font-bold px-6 py-3 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                    {t('startFirstAnalysis')}
                  </Button>
                </div>
              ) : (
                <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'} max-h-[650px] overflow-y-auto`}>
                  {recentTrades.filter(t => filter === 'all' || (filter === 'win' && t.outcome === 'win') || (filter === 'loss' && t.outcome === 'loss')).slice(0, 8).map((trade) => (
                    <div key={trade.id} 
                      className={`p-5 sm:p-6 transition-all group cursor-pointer ${darkMode ? 'hover:bg-zinc-900/70' : 'hover:bg-zinc-200/70'}`}
                      onClick={() => navigate(createPageUrl('TradeDetail') + `?id=${trade.id}`)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border-2",
                            trade.outcome === 'win' ? 'bg-teal-600 text-white' :
                            trade.outcome === 'loss' ? 'bg-rose-600 text-white' : 
                            trade.direction === 'long' ? 'border-2 border-teal-600 text-teal-600' : 'border-2 border-rose-600 text-rose-600')}>
                            {(trade.outcome === 'win' && parseFloat(trade.actual_pnl || 0) > 0) || (!trade.outcome && trade.direction === 'long') ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </div>
                          <div>
                            <div className={`text-base sm:text-lg font-bold tracking-wider ${theme.text}`}>{trade.pair || '-'}</div>
                            <div className={`text-xs ${theme.textMuted}`}>
                              {format(new Date(trade.created_date), 'dd.MM.yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            {trade.outcome && trade.actual_pnl && (
                              <>
                                <div className={cn("text-base sm:text-lg font-bold",
                                  parseFloat(trade.actual_pnl) > 0 ? 'text-teal-600' :
                                  parseFloat(trade.actual_pnl) < 0 ? 'text-rose-600' : theme.text)}>
                                  {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                                </div>
                                <div className={cn("text-[10px] sm:text-xs tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full",
                                  trade.outcome === 'win' ? 'bg-teal-600/20 text-teal-600' :
                                  trade.outcome === 'loss' ? 'bg-rose-600/20 text-rose-600' : 'bg-zinc-600/20 text-zinc-400')}>
                                  {trade.outcome.toUpperCase()}
                                </div>
                              </>
                            )}
                            {!trade.outcome && (
                              <span className="px-2 sm:px-3 py-1 bg-blue-500 text-white text-[10px] sm:text-xs tracking-wider rounded-full font-bold">
                                {trade.status === 'ready_to_trade' ? 'READY' : 'PENDING'}
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrade(e, trade.id);
                            }}
                            className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:bg-rose-600/20 text-rose-400 hover:text-rose-500' : 'hover:bg-red-100 text-red-600 hover:text-red-700'}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={theme.textMuted}>Score: <span className={`font-bold ${theme.text}`}>{Math.round(trade.completion_percentage || 0)}%</span></span>
                        {trade.risk_percent && <span className={theme.textMuted}>Risk: <span className={`font-bold ${theme.text}`}>{trade.risk_percent}%</span></span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Performance Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-base sm:text-lg tracking-widest mb-4 sm:mb-5 flex items-center gap-2 ${theme.text}`}>
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t('activity30Days')}</span>
                <span className="sm:hidden text-sm">ACTIVITY</span>
              </h3>
              <div className="h-32 sm:h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorTrades" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={darkMode ? "#ffffff" : "#0d9488"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={darkMode ? "#ffffff" : "#0d9488"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke={darkMode ? "#3f3f46" : "#a1a1aa"} fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke={darkMode ? "#3f3f46" : "#a1a1aa"} fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12, color: darkMode ? '#fff' : '#000' }} />
                    <Area type="monotone" dataKey="trades" stroke={darkMode ? "#ffffff" : "#0d9488"} strokeWidth={2} fillOpacity={1} fill="url(#colorTrades)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Direction Pie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-base sm:text-lg tracking-widest mb-4 sm:mb-5 flex items-center gap-2 ${theme.text}`}>
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('direction')}
              </h3>
              <div className="h-32 sm:h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={[
                      { name: t('long'), value: stats.longs, color: '#0d9488' },
                      { name: t('short'), value: stats.shorts, color: '#e11d48' },
                    ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value">
                      {[
                        { name: t('long'), value: stats.longs, color: '#0d9488' },
                        { name: t('short'), value: stats.shorts, color: '#e11d48' },
                      ].filter(d => d.value > 0).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12, color: darkMode ? '#fff' : '#000' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 sm:gap-6 mt-3 sm:mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal-600 rounded" /><span className={`text-xs sm:text-sm ${theme.textMuted}`}>{t('long')} ({stats.longs})</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-600 rounded" /><span className={`text-xs sm:text-sm ${theme.textMuted}`}>{t('short')} ({stats.shorts})</span></div>
              </div>
            </motion.div>

            {/* Market Sessions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-base sm:text-lg tracking-widest mb-4 sm:mb-5 flex items-center gap-2 ${theme.text}`}>
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('marketSessions')}
              </h3>
              <div className="space-y-3">
                {SESSIONS.map((session) => {
                  const isOpen = isSessionOpen(session);
                  return (
                    <div key={session.name} className={cn("flex items-center justify-between p-4 border-2 rounded-xl transition-all",
                      isOpen ? "border-teal-600 bg-teal-600 text-white" : darkMode ? "border-zinc-800 bg-zinc-900" : "border-zinc-300 bg-zinc-100")}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-lg sm:text-xl">{session.emoji}</span>
                        <div>
                          <div className={cn("text-xs sm:text-sm tracking-wider font-bold", isOpen ? "text-white" : theme.text)}>{session.name}</div>
                          <div className={cn("text-[10px] sm:text-xs", isOpen ? "text-emerald-100" : theme.textDimmed)}>
                            {isOpen ? '● OPEN' : '○ CLOSED'}
                          </div>
                        </div>
                      </div>
                      <div className={cn("text-xl sm:text-2xl font-mono font-bold", isOpen ? "text-white" : theme.textMuted)}>
                        {times[session.name] || '--:--'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 ${theme.bgSecondary}`}>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className={`text-base sm:text-lg tracking-widest flex items-center gap-2 ${theme.text}`}>
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('calendar')}
                </h3>
                <div className="flex gap-3">
                  <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} className={`${theme.textDimmed} hover:${theme.text} transition-colors`}>←</button>
                  <span className={`text-sm tracking-wider ${theme.textSecondary}`}>{format(calendarMonth, 'MMM yyyy', { locale }).toUpperCase()}</span>
                  <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className={`${theme.textDimmed} hover:${theme.text} transition-colors`}>→</button>
                </div>
              </div>
              
              <div className={`grid grid-cols-7 gap-1 text-center text-xs ${theme.textDimmed} mb-2`}>
                {(language === 'de' ? ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'] : language === 'fa' ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] : ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']).map(d => <div key={d}>{d}</div>)}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {calendarDays.map((day) => {
                  const trades = getTradesForDay(day);
                  const hasReady = trades.some(t => t.status === 'ready_to_trade');
                  return (
                    <div key={day.toISOString()} className={cn(
                      "aspect-square flex items-center justify-center text-sm relative rounded-lg",
                      isToday(day) && (darkMode ? "bg-white text-black" : "bg-zinc-900 text-white") + " font-bold",
                      trades.length > 0 && !isToday(day) && (darkMode ? "bg-zinc-900" : "bg-zinc-200")
                    )}>
                      {format(day, 'd')}
                      {hasReady && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Avg Completion */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className={`border-2 ${theme.border} rounded-2xl p-6 sm:p-8 ${theme.bgSecondary} text-center`}>
              <div className={`text-5xl sm:text-6xl md:text-7xl font-light mb-3 ${theme.text}`}>{stats.avgCompletion}%</div>
              <div className={`text-xs sm:text-sm ${theme.textMuted} tracking-widest mb-4`}>{t('avgCompletion')}</div>
              <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${stats.avgCompletion}%` }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-10 sm:mt-14 md:mt-16">
          <TradingQuote variant="minimal" />
        </div>

        {/* Footer */}
        <footer className={`mt-10 sm:mt-14 md:mt-16 pt-8 border-t ${theme.border}`}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <img src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            } alt="ZNPCV" className="h-12 sm:h-14 md:h-16 w-auto opacity-50 mx-auto" />
            <p className={`${theme.textDimmed} text-sm tracking-widest`}>WWW.ZNPCV.COM</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 text-xs">
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
        </footer>
      </main>
    </div>
  );
}