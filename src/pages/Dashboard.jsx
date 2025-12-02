import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ChevronRight, Target, CheckCircle, Clock, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Minus, Globe, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, subMonths, addMonths } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import TradingQuote from '@/components/TradingQuote';

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

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => base44.entities.TradeChecklist.list('-created_date', 100),
  });

  const stats = useMemo(() => {
    const total = checklists.length;
    const ready = checklists.filter(c => c.status === 'ready_to_trade').length;
    const inProgress = checklists.filter(c => c.status === 'in_progress').length;
    const longs = checklists.filter(c => c.direction === 'bullish' || c.direction === 'long').length;
    const shorts = checklists.filter(c => c.direction === 'bearish' || c.direction === 'short').length;
    const withConfluence = checklists.filter(c => 
      c.weekly_trend && c.daily_trend && c.h4_trend &&
      c.weekly_trend === c.daily_trend && c.daily_trend === c.h4_trend
    ).length;
    const avgCompletion = total > 0 ? Math.round(checklists.reduce((acc, c) => acc + (c.completion_percentage || 0), 0) / total) : 0;
    return { total, ready, inProgress, longs, shorts, withConfluence, avgCompletion };
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
    { name: t('long'), value: stats.longs, color: '#ffffff' },
    { name: t('short'), value: stats.shorts, color: '#71717a' },
  ].filter(d => d.value > 0);

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const getTradesForDay = (date) => checklists.filter(c => c.trade_date === format(date, 'yyyy-MM-dd'));

  const recentTrades = checklists.slice(0, 6);
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
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(createPageUrl('Home'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
                <Home className="w-6 h-6" />
              </button>
              <button onClick={() => navigate(createPageUrl('Home'))}>
                <img src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/0d76bb102_schwa.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/006a71847_PNGZNPCVLOGOwei.jpg"
            } alt="ZNPCV" className="h-12 w-auto cursor-pointer hover:opacity-80" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <LanguageToggle />
              <Button onClick={() => navigate(createPageUrl('Checklist'))} className={`px-6 py-3 rounded-xl tracking-widest ${darkMode ? 'bg-white hover:bg-zinc-200 text-black' : 'bg-zinc-900 hover:bg-zinc-800 text-white'}`}>
                <Plus className="w-5 h-5 mr-2" />
                {t('newAnalysis').split(' ')[0]}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className={`text-4xl tracking-widest mb-2 ${theme.text}`}>{t('tradingDashboard')}</h1>
          <p className={`${theme.textMuted} tracking-wider`}>{t('overviewStats')}</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t('totalAnalyses'), value: stats.total, icon: Target },
            { label: t('readyToTradeShort'), value: stats.ready, icon: CheckCircle, highlight: true },
            { label: t('inProgress'), value: stats.inProgress, icon: Clock },
            { label: t('withConfluence'), value: stats.withConfluence, icon: BarChart3 },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + index * 0.05 }}
              className={cn("border rounded-2xl p-6", 
                stat.highlight 
                  ? "bg-emerald-500 text-white border-emerald-500" 
                  : `${theme.border} ${theme.bgSecondary}`)}>
              <stat.icon className={cn("w-6 h-6 mb-4", stat.highlight ? "text-white" : theme.text)} />
              <div className={cn("text-4xl font-light mb-1", stat.highlight ? "text-white" : theme.text)}>{stat.value}</div>
              <div className={cn("text-xs tracking-widest", stat.highlight ? "text-emerald-100" : theme.textMuted)}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-lg tracking-widest mb-6 flex items-center gap-3 ${theme.text}`}>
                <BarChart3 className="w-5 h-5" />
                {t('activity30Days')}
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorTrades" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={darkMode ? "#ffffff" : "#10b981"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={darkMode ? "#ffffff" : "#10b981"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke={darkMode ? "#3f3f46" : "#a1a1aa"} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke={darkMode ? "#3f3f46" : "#a1a1aa"} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12, color: darkMode ? '#fff' : '#000' }} />
                    <Area type="monotone" dataKey="trades" stroke={darkMode ? "#ffffff" : "#10b981"} strokeWidth={2} fillOpacity={1} fill="url(#colorTrades)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Trades */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className={`border ${theme.border} rounded-2xl ${theme.bgSecondary} overflow-hidden`}>
              <div className={`p-5 border-b ${theme.border} flex items-center justify-between`}>
                <h3 className={`text-lg tracking-widest ${theme.text}`}>{t('lastAnalyses')}</h3>
                <span className={`text-sm ${theme.textDimmed}`}>{recentTrades.length} {t('of')} {stats.total}</span>
              </div>
              
              {isLoading ? (
                <div className={`p-8 text-center ${theme.textDimmed}`}>{t('loading')}</div>
              ) : recentTrades.length === 0 ? (
                <div className="p-8 text-center">
                  <p className={`${theme.textDimmed} mb-4`}>{t('noAnalyses')}</p>
                  <Button onClick={() => navigate(createPageUrl('Checklist'))} className={`rounded-xl ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                    {t('startFirstAnalysis')}
                  </Button>
                </div>
              ) : (
                <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'}`}>
                  {recentTrades.map((trade) => (
                    <div key={trade.id} onClick={() => navigate(createPageUrl('Checklist') + `?id=${trade.id}`)}
                      className={`p-5 cursor-pointer transition-all group flex items-center gap-4 ${darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-200/50'}`}>
                      <div className={cn("w-12 h-12 flex items-center justify-center border rounded-xl",
                        trade.direction === 'bullish' || trade.direction === 'long' ? 'border-emerald-500 bg-emerald-500 text-white' :
                        trade.direction === 'bearish' || trade.direction === 'short' ? 'border-red-500 bg-red-500/10 text-red-500' : `${theme.border} ${theme.textDimmed}`)}>
                        {trade.direction === 'bullish' || trade.direction === 'long' ? <ArrowUpRight className="w-5 h-5" /> :
                         trade.direction === 'bearish' || trade.direction === 'short' ? <ArrowDownRight className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`text-lg tracking-wider ${theme.text}`}>{trade.pair || '-'}</span>
                          {trade.status === 'ready_to_trade' && (
                            <span className="px-3 py-1 bg-emerald-500 text-white text-xs tracking-wider rounded-full">READY</span>
                          )}
                        </div>
                        <div className={`text-sm ${theme.textDimmed} font-sans`}>
                          {format(new Date(trade.created_date), 'dd.MM.yyyy')} • {Math.round(trade.completion_percentage || 0)}%
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${theme.textDimmed} group-hover:${theme.text} transition-colors`} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Direction Pie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-lg tracking-widest mb-4 flex items-center gap-3 ${theme.text}`}>
                <PieChart className="w-5 h-5" />
                {t('direction')}
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={[
                      { name: t('long'), value: stats.longs, color: '#10b981' },
                      { name: t('short'), value: stats.shorts, color: '#ef4444' },
                    ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                      {[
                        { name: t('long'), value: stats.longs, color: '#10b981' },
                        { name: t('short'), value: stats.shorts, color: '#ef4444' },
                      ].filter(d => d.value > 0).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12, color: darkMode ? '#fff' : '#000' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded" /><span className={`text-sm ${theme.textMuted}`}>{t('long')} ({stats.longs})</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded" /><span className={`text-sm ${theme.textMuted}`}>{t('short')} ({stats.shorts})</span></div>
              </div>
            </motion.div>

            {/* Market Sessions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-lg tracking-widest mb-4 flex items-center gap-3 ${theme.text}`}>
                <Globe className="w-5 h-5" />
                {t('marketSessions')}
              </h3>
              <div className="space-y-3">
                {SESSIONS.map((session) => {
                  const isOpen = isSessionOpen(session);
                  return (
                    <div key={session.name} className={cn("flex items-center justify-between p-4 border rounded-xl transition-all",
                      isOpen ? "border-emerald-500 bg-emerald-500 text-white" : `${theme.border}`)}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{session.emoji}</span>
                        <div>
                          <div className={cn("text-sm tracking-wider", isOpen ? "text-white" : theme.text)}>{session.name}</div>
                          <div className={cn("text-xs", isOpen ? "text-emerald-100" : theme.textDimmed)}>
                            {isOpen ? `● ${t('open')}` : `○ ${t('closed')}`}
                          </div>
                        </div>
                      </div>
                      <div className={cn("text-2xl font-mono", isOpen ? "text-white" : theme.textMuted)}>
                        {times[session.name] || '--:--'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg tracking-widest flex items-center gap-3 ${theme.text}`}>
                  <Calendar className="w-5 h-5" />
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
                      {hasReady && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Avg Completion */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary} text-center`}>
              <div className={`text-6xl font-light mb-2 ${theme.text}`}>{stats.avgCompletion}%</div>
              <div className={`text-sm ${theme.textMuted} tracking-widest mb-4`}>{t('avgCompletion')}</div>
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.avgCompletion}%` }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-12">
          <TradingQuote variant="minimal" />
        </div>

        {/* Footer */}
        <footer className={`mt-16 pt-8 border-t ${theme.border}`}>
          <div className="flex items-center justify-between">
            <img src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/0d76bb102_schwa.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/006a71847_PNGZNPCVLOGOwei.jpg"
            } alt="ZNPCV" className="h-12 w-auto opacity-50" />
            <p className={`${theme.textDimmed} text-sm tracking-widest`}>WWW.ZNPCV.COM</p>
          </div>
        </footer>
      </main>
    </div>
  );
}