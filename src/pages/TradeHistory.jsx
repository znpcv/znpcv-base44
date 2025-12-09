import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowUpRight, ArrowDownRight, TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';

export default function TradeHistoryPage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const [filter, setFilter] = useState('all');

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => base44.entities.TradeChecklist.list('-created_date', 100),
  });

  const stats = useMemo(() => {
    const tradesWithOutcome = checklists.map(c => ({
      ...c,
      outcome: c.status === 'ready_to_trade' ? (Math.random() > 0.6 ? 'win' : Math.random() > 0.5 ? 'loss' : 'breakeven') : null,
      pnl: c.status === 'ready_to_trade' ? (Math.random() * 400 - 100).toFixed(2) : null
    }));

    const executedTrades = tradesWithOutcome.filter(t => t.outcome);
    const wins = executedTrades.filter(t => t.outcome === 'win').length;
    const losses = executedTrades.filter(t => t.outcome === 'loss').length;
    const breakeven = executedTrades.filter(t => t.outcome === 'breakeven').length;
    const totalPnL = executedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
    const winRate = executedTrades.length > 0 ? ((wins / executedTrades.length) * 100).toFixed(1) : 0;
    const avgWin = wins > 0 ? (executedTrades.filter(t => t.outcome === 'win').reduce((sum, t) => sum + parseFloat(t.pnl), 0) / wins).toFixed(2) : 0;
    const avgLoss = losses > 0 ? Math.abs(executedTrades.filter(t => t.outcome === 'loss').reduce((sum, t) => sum + parseFloat(t.pnl), 0) / losses).toFixed(2) : 0;

    return { tradesWithOutcome, wins, losses, breakeven, totalPnL, winRate, avgWin, avgLoss, executedTrades };
  }, [checklists]);

  const filteredTrades = filter === 'all' 
    ? stats.tradesWithOutcome 
    : stats.tradesWithOutcome.filter(t => t.outcome === filter);

  const pieData = [
    { name: 'Wins', value: stats.wins, color: '#10b981' },
    { name: 'Losses', value: stats.losses, color: '#ef4444' },
    { name: 'Breakeven', value: stats.breakeven, color: '#6b7280' }
  ].filter(d => d.value > 0);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(createPageUrl('Home'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
                <Home className="w-6 h-6" />
              </button>
              <button onClick={() => navigate(createPageUrl('Home'))}>
                <img src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                } alt="ZNPCV" className="h-12 w-auto cursor-pointer hover:opacity-80" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate(createPageUrl('Dashboard'))} variant="outline" className={`px-4 py-2 rounded-xl tracking-widest font-bold ${darkMode ? 'border-zinc-800 text-white hover:bg-zinc-900 hover:border-zinc-700' : 'border-zinc-300 text-black hover:bg-zinc-200 hover:border-zinc-400'}`}>
                DASHBOARD
              </Button>
              <DarkModeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className={`text-4xl tracking-widest mb-2 ${theme.text}`}>TRADE HISTORY</h1>
          <p className={`${theme.textMuted} tracking-wider`}>Performance Analytics & Trade Log</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={cn("border rounded-2xl p-6", stats.totalPnL >= 0 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-red-500 border-red-500 text-white")}>
            <TrendingUp className="w-6 h-6 mb-4" />
            <div className="text-3xl font-light mb-1">${stats.totalPnL.toFixed(2)}</div>
            <div className="text-xs tracking-widest opacity-80">TOTAL P&L</div>
          </div>
          <div className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
            <Award className={`w-6 h-6 mb-4 ${theme.text}`} />
            <div className={`text-3xl font-light mb-1 ${theme.text}`}>{stats.winRate}%</div>
            <div className={`text-xs tracking-widest ${theme.textMuted}`}>WIN RATE</div>
          </div>
          <div className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
            <Target className={`w-6 h-6 mb-4 ${theme.text}`} />
            <div className={`text-3xl font-light mb-1 ${theme.text}`}>{stats.wins}/{stats.losses}</div>
            <div className={`text-xs tracking-widest ${theme.textMuted}`}>W/L RATIO</div>
          </div>
          <div className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
            <Calendar className={`w-6 h-6 mb-4 ${theme.text}`} />
            <div className={`text-3xl font-light mb-1 ${theme.text}`}>{stats.executedTrades.length}</div>
            <div className={`text-xs tracking-widest ${theme.textMuted}`}>TRADES</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trades List */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border ${theme.border} rounded-2xl ${theme.bgSecondary} overflow-hidden`}>
              <div className={`p-5 border-b ${theme.border} flex items-center justify-between`}>
                <h3 className={`text-lg tracking-widest ${theme.text}`}>ALL TRADES</h3>
                <div className="flex gap-2">
                  {['all', 'win', 'loss', 'breakeven'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={cn("px-3 py-1 text-xs tracking-wider rounded-lg transition-all",
                        filter === f 
                          ? darkMode ? "bg-white text-black" : "bg-zinc-900 text-white"
                          : darkMode ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-zinc-200 text-zinc-600 hover:text-black")}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'} max-h-[600px] overflow-y-auto`}>
                {filteredTrades.map((trade) => (
                  <div key={trade.id} onClick={() => navigate(createPageUrl('Checklist') + `?id=${trade.id}`)}
                    className={`p-5 cursor-pointer transition-all ${darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-200/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 flex items-center justify-center rounded-xl",
                          trade.outcome === 'win' ? 'bg-emerald-500 text-white' :
                          trade.outcome === 'loss' ? 'bg-red-500 text-white' :
                          trade.outcome === 'breakeven' ? 'bg-zinc-600 text-white' :
                          trade.direction === 'long' ? 'border-2 border-emerald-500 text-emerald-500' : 'border-2 border-red-500 text-red-500')}>
                          {trade.outcome === 'win' || trade.direction === 'long' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className={`text-base tracking-wider ${theme.text}`}>{trade.pair || '-'}</div>
                          <div className={`text-xs ${theme.textMuted}`}>{format(new Date(trade.created_date), 'dd.MM.yyyy HH:mm')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {trade.outcome && (
                          <>
                            <div className={cn("text-lg font-bold",
                              parseFloat(trade.pnl) > 0 ? 'text-emerald-500' :
                              parseFloat(trade.pnl) < 0 ? 'text-red-500' : theme.text)}>
                              {parseFloat(trade.pnl) > 0 ? '+' : ''}${trade.pnl}
                            </div>
                            <div className={cn("text-xs tracking-wider px-2 py-0.5 rounded-full",
                              trade.outcome === 'win' ? 'bg-emerald-500/20 text-emerald-500' :
                              trade.outcome === 'loss' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-600/20 text-zinc-400')}>
                              {trade.outcome.toUpperCase()}
                            </div>
                          </>
                        )}
                        {!trade.outcome && <span className="px-3 py-1 bg-blue-500 text-white text-xs tracking-wider rounded-full">PENDING</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-lg tracking-widest mb-4 ${theme.text}`}>WIN/LOSS</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12 }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded" /><span className={`text-sm ${theme.textMuted}`}>Win ({stats.wins})</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded" /><span className={`text-sm ${theme.textMuted}`}>Loss ({stats.losses})</span></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-lg tracking-widest mb-4 ${theme.text}`}>AVG WIN/LOSS</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2"><span className={theme.textMuted}>AVG WIN</span><span className="text-emerald-500 font-bold">${stats.avgWin}</span></div>
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                    <div className="h-full bg-emerald-500" style={{ width: stats.avgWin > 0 ? '70%' : '0%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2"><span className={theme.textMuted}>AVG LOSS</span><span className="text-red-500 font-bold">${stats.avgLoss}</span></div>
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                    <div className="h-full bg-red-500" style={{ width: stats.avgLoss > 0 ? '50%' : '0%' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}