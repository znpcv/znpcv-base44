import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Home, History, TrendingUp, TrendingDown, DollarSign, Target, Award, AlertCircle, BarChart3, PieChart as PieChartIcon, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';

export default function TradeHistoryPage() {
  const navigate = useNavigate();
  const { language, isRTL, darkMode } = useLanguage();
  const [filter, setFilter] = useState('all');

  const { data: checklists = [] } = useQuery({
    queryKey: ['checklists_history'],
    queryFn: () => base44.entities.TradeChecklist.list('-created_date', 200),
  });

  const stats = useMemo(() => {
    // For demo: randomly assign outcomes
    const tradesWithOutcome = checklists.map(c => ({
      ...c,
      outcome: c.status === 'ready_to_trade' ? (Math.random() > 0.6 ? 'win' : Math.random() > 0.5 ? 'loss' : 'breakeven') : null,
      pnl: c.status === 'ready_to_trade' ? (Math.random() * 400 - 100).toFixed(2) : null
    }));

    const executed = tradesWithOutcome.filter(t => t.outcome);
    const wins = executed.filter(t => t.outcome === 'win').length;
    const losses = executed.filter(t => t.outcome === 'loss').length;
    const breakeven = executed.filter(t => t.outcome === 'breakeven').length;
    const winRate = executed.length > 0 ? ((wins / executed.length) * 100).toFixed(1) : 0;
    const totalPnl = executed.reduce((acc, t) => acc + parseFloat(t.pnl || 0), 0).toFixed(2);

    return { tradesWithOutcome, executed, wins, losses, breakeven, winRate, totalPnl };
  }, [checklists]);

  const filteredTrades = filter === 'all' 
    ? stats.executed 
    : stats.executed.filter(t => t.outcome === filter);

  const pieData = [
    { name: 'Wins', value: stats.wins, color: '#10b981' },
    { name: 'Losses', value: stats.losses, color: '#ef4444' },
    { name: 'Breakeven', value: stats.breakeven, color: '#6b7280' }
  ].filter(d => d.value > 0);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(createPageUrl('Home'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
                <Home className="w-6 h-6" />
              </button>
              <button onClick={() => navigate(createPageUrl('Home'))}>
                <img src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                } alt="ZNPCV" className="h-10 sm:h-12 md:h-14 w-auto cursor-pointer hover:opacity-80" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <History className={`w-8 h-8 ${theme.text}`} />
            <h1 className={`text-3xl md:text-4xl tracking-widest ${theme.text}`}>TRADE HISTORY</h1>
          </div>
          <p className={`${theme.textMuted} tracking-wider`}>Vollständige Übersicht aller Trades</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`border ${theme.border} rounded-2xl p-6 ${theme.bgCard}`}>
            <Target className={`w-6 h-6 mb-4 ${theme.text}`} />
            <div className={`text-3xl font-light mb-1 ${theme.text}`}>{stats.executed.length}</div>
            <div className={`text-xs tracking-widest ${theme.textMuted}`}>TOTAL TRADES</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
            className="border border-emerald-500 rounded-2xl p-6 bg-emerald-500 text-white">
            <TrendingUp className="w-6 h-6 mb-4" />
            <div className="text-3xl font-light mb-1">{stats.wins}</div>
            <div className="text-xs tracking-widest text-emerald-100">WINS</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="border border-red-500 rounded-2xl p-6 bg-red-500 text-white">
            <TrendingDown className="w-6 h-6 mb-4" />
            <div className="text-3xl font-light mb-1">{stats.losses}</div>
            <div className="text-xs tracking-widest text-red-100">LOSSES</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
            className={`border ${theme.border} rounded-2xl p-6 ${theme.bgCard}`}>
            <Award className={`w-6 h-6 mb-4 ${theme.text}`} />
            <div className={`text-3xl font-light mb-1 ${theme.text}`}>{stats.winRate}%</div>
            <div className={`text-xs tracking-widest ${theme.textMuted}`}>WIN RATE</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className={cn("border rounded-2xl p-6", 
              parseFloat(stats.totalPnl) > 0 ? "border-emerald-500 bg-emerald-500 text-white" : "border-red-500 bg-red-500 text-white")}>
            <DollarSign className="w-6 h-6 mb-4" />
            <div className="text-3xl font-light mb-1">${stats.totalPnl}</div>
            <div className={cn("text-xs tracking-widest", parseFloat(stats.totalPnl) > 0 ? "text-emerald-100" : "text-red-100")}>TOTAL P&L</div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgCard}`}>
              <h3 className={`text-lg tracking-widest mb-4 flex items-center gap-3 ${theme.text}`}>
                <PieChartIcon className="w-5 h-5" />
                WIN/LOSS
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12, color: darkMode ? '#fff' : '#000' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded" /><span className={theme.textSecondary}>Wins ({stats.wins})</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded" /><span className={theme.textSecondary}>Losses ({stats.losses})</span></div>
              </div>
            </motion.div>
          </div>

          {/* Trades List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`lg:col-span-2 border ${theme.border} rounded-2xl overflow-hidden ${theme.bgCard}`}>
            <div className={`p-5 border-b ${theme.border} flex items-center justify-between`}>
              <h3 className={`text-lg tracking-widest ${theme.text}`}>ALLE TRADES</h3>
              <div className="flex gap-2">
                {['all', 'win', 'loss', 'breakeven'].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cn("px-3 py-1.5 text-xs tracking-wider rounded-lg transition-all",
                      filter === f 
                        ? darkMode ? "bg-white text-black" : "bg-zinc-900 text-white"
                        : darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600")}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'} max-h-[600px] overflow-y-auto`}>
              {filteredTrades.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${theme.textMuted}`} />
                  <p className={theme.textMuted}>Keine Trades gefunden</p>
                </div>
              ) : (
                filteredTrades.map((trade) => (
                  <motion.div key={trade.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className={`p-5 ${darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-200/50'} transition-colors cursor-pointer`}
                    onClick={() => navigate(createPageUrl('Checklist') + `?id=${trade.id}`)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-12 h-12 flex items-center justify-center rounded-xl",
                          trade.outcome === 'win' ? 'bg-emerald-500 text-white' :
                          trade.outcome === 'loss' ? 'bg-red-500 text-white' : 'bg-zinc-600 text-white')}>
                          {trade.outcome === 'win' ? <TrendingUp className="w-6 h-6" /> :
                           trade.outcome === 'loss' ? <TrendingDown className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className={`text-lg tracking-wider ${theme.text}`}>{trade.pair || 'N/A'}</div>
                          <div className={`text-sm ${theme.textMuted}`}>
                            {format(new Date(trade.created_date), 'dd.MM.yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-2xl font-bold",
                          parseFloat(trade.pnl) > 0 ? 'text-emerald-500' :
                          parseFloat(trade.pnl) < 0 ? 'text-red-500' : theme.text)}>
                          {parseFloat(trade.pnl) > 0 ? '+' : ''}${trade.pnl}
                        </div>
                        <div className={cn("text-xs tracking-wider px-2 py-1 rounded-full inline-block",
                          trade.outcome === 'win' ? 'bg-emerald-500/20 text-emerald-500' :
                          trade.outcome === 'loss' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-600/20 text-zinc-400')}>
                          {trade.outcome.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={theme.textMuted}>Direction: <span className={theme.text}>{trade.direction || 'N/A'}</span></span>
                      <span className={theme.textMuted}>Score: <span className={theme.text}>{Math.round(trade.completion_percentage || 0)}%</span></span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}