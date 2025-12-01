import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, TrendingUp, TrendingDown, Calendar, ChevronRight, 
  Target, CheckCircle, Clock, XCircle, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => base44.entities.TradeChecklist.list('-created_date', 100),
  });

  // Stats
  const stats = useMemo(() => {
    const total = checklists.length;
    const ready = checklists.filter(c => c.status === 'ready_to_trade').length;
    const executed = checklists.filter(c => c.status === 'executed').length;
    const inProgress = checklists.filter(c => c.status === 'in_progress').length;
    const skipped = checklists.filter(c => c.status === 'skipped').length;
    
    const longs = checklists.filter(c => c.direction === 'long').length;
    const shorts = checklists.filter(c => c.direction === 'short').length;
    
    const withConfluence = checklists.filter(c => 
      c.weekly_trend && c.daily_trend && c.h4_trend &&
      c.weekly_trend === c.daily_trend && c.daily_trend === c.h4_trend
    ).length;

    const avgCompletion = total > 0 
      ? Math.round(checklists.reduce((acc, c) => acc + (c.completion_percentage || 0), 0) / total)
      : 0;

    return { total, ready, executed, inProgress, skipped, longs, shorts, withConfluence, avgCompletion };
  }, [checklists]);

  // Performance data for chart
  const performanceData = useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTrades = checklists.filter(c => 
        c.trade_date === dateStr || format(new Date(c.created_date), 'yyyy-MM-dd') === dateStr
      );
      last30Days.push({
        date: format(date, 'dd.MM'),
        trades: dayTrades.length,
        ready: dayTrades.filter(c => c.status === 'ready_to_trade').length,
      });
    }
    return last30Days;
  }, [checklists]);

  // Direction distribution for pie chart
  const directionData = [
    { name: 'Long', value: stats.longs, color: '#22c55e' },
    { name: 'Short', value: stats.shorts, color: '#ef4444' },
    { name: 'Undefined', value: stats.total - stats.longs - stats.shorts, color: '#3f3f46' },
  ].filter(d => d.value > 0);

  // Calendar
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;

  const getTradesForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return checklists.filter(c => c.trade_date === dateStr);
  };

  const recentTrades = checklists.slice(0, 6);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* White Header */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/2f200c537_PNGZNPCVLOGOwei.png" 
              alt="ZNPCV" 
              className="h-16 w-auto"
            />
            <Button
              onClick={() => navigate(createPageUrl('Checklist'))}
              className="bg-black hover:bg-zinc-800 text-white px-6 py-3 rounded-none tracking-widest"
            >
              <Plus className="w-5 h-5 mr-2" />
              NEUE ANALYSE
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl tracking-widest mb-2">TRADING DASHBOARD</h1>
          <p className="text-zinc-500 tracking-wider">ÜBERSICHT & PERFORMANCE</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'TOTAL ANALYSEN', value: stats.total, icon: Target, color: 'text-white' },
            { label: 'READY TO TRADE', value: stats.ready, icon: CheckCircle, color: 'text-green-500' },
            { label: 'IN PROGRESS', value: stats.inProgress, icon: Clock, color: 'text-yellow-500' },
            { label: 'MIT CONFLUENCE', value: stats.withConfluence, icon: BarChart3, color: 'text-blue-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="border border-zinc-800 p-5 bg-zinc-900/30"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className={cn("text-4xl mb-1", stat.color)}>{stat.value}</div>
              <div className="text-xs text-zinc-500 tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-zinc-800 p-6 bg-zinc-900/30"
            >
              <h3 className="text-lg tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                AKTIVITÄT (30 TAGE)
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorTrades" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #3f3f46',
                        borderRadius: 0,
                        fontFamily: 'Bebas Neue'
                      }}
                    />
                    <Area type="monotone" dataKey="trades" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTrades)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Trades */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-zinc-800 bg-zinc-900/30"
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg tracking-widest">LETZTE ANALYSEN</h3>
                <span className="text-sm text-zinc-500">{recentTrades.length} VON {stats.total}</span>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center text-zinc-500">LADEN...</div>
              ) : recentTrades.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-zinc-500 mb-4">KEINE ANALYSEN</p>
                  <Button onClick={() => navigate(createPageUrl('Checklist'))} variant="outline" className="border-zinc-700 rounded-none">
                    ERSTE ANALYSE STARTEN
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {recentTrades.map((trade) => (
                    <div
                      key={trade.id}
                      onClick={() => navigate(createPageUrl('Checklist') + `?id=${trade.id}`)}
                      className="p-4 hover:bg-zinc-800/30 cursor-pointer transition-all group flex items-center gap-4"
                    >
                      <div className={cn(
                        "w-10 h-10 flex items-center justify-center border",
                        trade.direction === 'long' ? 'border-green-500 text-green-500' :
                        trade.direction === 'short' ? 'border-red-500 text-red-500' :
                        'border-zinc-700 text-zinc-500'
                      )}>
                        {trade.direction === 'long' ? <ArrowUpRight className="w-5 h-5" /> :
                         trade.direction === 'short' ? <ArrowDownRight className="w-5 h-5" /> :
                         <Minus className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg tracking-wider">{trade.pair || 'KEIN PAAR'}</span>
                          {trade.status === 'ready_to_trade' && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs tracking-wider">READY</span>
                          )}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {trade.trade_date ? format(new Date(trade.trade_date), 'dd.MM.yyyy') : format(new Date(trade.created_date), 'dd.MM.yyyy')}
                          {' • '}{Math.round(trade.completion_percentage || 0)}%
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Direction Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="border border-zinc-800 p-6 bg-zinc-900/30"
            >
              <h3 className="text-lg tracking-widest mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                RICHTUNG
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={directionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {directionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #3f3f46',
                        borderRadius: 0 
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500" />
                  <span className="text-sm text-zinc-400">LONG ({stats.longs})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500" />
                  <span className="text-sm text-zinc-400">SHORT ({stats.shorts})</span>
                </div>
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="border border-zinc-800 p-6 bg-zinc-900/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg tracking-widest flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  KALENDER
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} className="text-zinc-500 hover:text-white">←</button>
                  <span className="text-sm tracking-wider">{format(calendarMonth, 'MMM yyyy', { locale: de }).toUpperCase()}</span>
                  <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="text-zinc-500 hover:text-white">→</button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 mb-2">
                {['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'].map(d => <div key={d}>{d}</div>)}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {calendarDays.map((day) => {
                  const trades = getTradesForDay(day);
                  const hasReady = trades.some(t => t.status === 'ready_to_trade');
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "aspect-square flex items-center justify-center text-sm relative",
                        isToday(day) && "bg-white text-black",
                        trades.length > 0 && !isToday(day) && "bg-zinc-800"
                      )}
                    >
                      {format(day, 'd')}
                      {hasReady && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Avg Completion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border border-zinc-800 p-6 bg-zinc-900/30 text-center"
            >
              <div className="text-6xl text-white mb-2">{stats.avgCompletion}%</div>
              <div className="text-sm text-zinc-500 tracking-widest">DURCHSCHNITTLICHE COMPLETION</div>
              <div className="mt-4 h-2 bg-zinc-800">
                <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${stats.avgCompletion}%` }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-600 text-sm tracking-widest">WWW.ZNPCV.COM</p>
        </footer>
      </main>
    </div>
  );
}