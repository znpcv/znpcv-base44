import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowUpRight, ArrowDownRight, TrendingUp, Award, Target, Calendar, Trash2, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';
import TradeEditModal from '@/components/advanced/TradeEditModal';
import AdvancedMetrics from '@/components/advanced/AdvancedMetrics';
import TradeFilters from '@/components/advanced/TradeFilters';
import QuickStats from '@/components/advanced/QuickStats';
import AIPerformanceAnalysis from '@/components/advanced/AIPerformanceAnalysis';

export default function TradeHistoryPage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [editingTrade, setEditingTrade] = useState(null);
  const queryClient = useQueryClient();

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => base44.entities.TradeChecklist.list('-created_date', 100),
  });

  const updateTradeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TradeChecklist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      setEditingTrade(null);
    },
  });

  const deleteTradeMutation = useMutation({
    mutationFn: (id) => base44.entities.TradeChecklist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });

  const handleDeleteTrade = async (e, tradeId) => {
    e.stopPropagation();
    if (window.confirm('Trade wirklich löschen?')) {
      deleteTradeMutation.mutate(tradeId);
    }
  };

  const handleEditTrade = (e, trade) => {
    e.stopPropagation();
    setEditingTrade(trade);
  };

  const handleSaveTrade = (data) => {
    updateTradeMutation.mutate({ id: editingTrade.id, data });
  };

  const stats = useMemo(() => {
    const executedTrades = checklists.filter(t => t.outcome && t.outcome !== 'pending');
    const pending = checklists.filter(t => !t.outcome || t.outcome === 'pending').length;
    const wins = executedTrades.filter(t => t.outcome === 'win').length;
    const losses = executedTrades.filter(t => t.outcome === 'loss').length;
    const breakeven = executedTrades.filter(t => t.outcome === 'breakeven').length;
    const totalPnL = executedTrades.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
    const winRate = executedTrades.length > 0 ? ((wins / executedTrades.length) * 100).toFixed(1) : 0;
    const avgWin = wins > 0 ? (executedTrades.filter(t => t.outcome === 'win').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / wins).toFixed(2) : 0;
    const avgLoss = losses > 0 ? Math.abs(executedTrades.filter(t => t.outcome === 'loss').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / losses).toFixed(2) : 0;

    return { wins, losses, breakeven, pending, totalPnL, winRate, avgWin, avgLoss, executedTrades };
  }, [checklists]);

  const filteredTrades = filter === 'all' 
    ? checklists 
    : filter === 'pending'
    ? checklists.filter(t => !t.outcome || t.outcome === 'pending')
    : checklists.filter(t => t.outcome === filter);

  const pieData = [
    { name: 'Wins', value: stats.wins, color: '#0d9488' },
    { name: 'Losses', value: stats.losses, color: '#e11d48' },
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <DarkModeToggle />
              <button onClick={() => navigate(createPageUrl('Home'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
                <Home className="w-6 h-6" />
              </button>
              <button onClick={() => navigate(createPageUrl('Home'))}>
                <img src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                } alt="ZNPCV" className="h-10 sm:h-12 w-auto cursor-pointer hover:opacity-80" />
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button onClick={() => navigate(createPageUrl('Dashboard'))} variant="outline" className={`px-4 py-2 rounded-xl tracking-widest font-bold ${darkMode ? 'border-zinc-800 text-white hover:bg-zinc-900 hover:border-zinc-700' : 'border-zinc-300 text-black hover:bg-zinc-200 hover:border-zinc-400'}`}>
                DASHBOARD
              </Button>
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className={`text-4xl tracking-widest mb-2 ${theme.text}`}>TRADE HISTORY</h1>
          <p className={`${theme.textMuted} tracking-wider`}>Performance Analytics & Trade Log</p>
        </motion.div>

        {/* AI Analysis */}
        <AIPerformanceAnalysis checklists={checklists} darkMode={darkMode} />

        {/* Quick Stats */}
        <QuickStats checklists={checklists} darkMode={darkMode} />

        {/* Advanced Metrics */}
        <AdvancedMetrics checklists={checklists} darkMode={darkMode} />

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className={cn("border-2 rounded-2xl p-4 sm:p-6", stats.totalPnL >= 0 ? "bg-teal-600 border-teal-600 text-white" : "bg-rose-600 border-rose-600 text-white")}>
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4" />
            <div className="text-2xl sm:text-3xl font-light mb-1">${stats.totalPnL.toFixed(2)}</div>
            <div className="text-[10px] sm:text-xs tracking-widest opacity-80">TOTAL P&L</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-2xl p-4 sm:p-6 ${theme.bgSecondary}`}>
            <Award className={`w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 ${theme.text}`} />
            <div className={`text-2xl sm:text-3xl font-light mb-1 ${theme.text}`}>{stats.winRate}%</div>
            <div className={`text-[10px] sm:text-xs tracking-widest ${theme.textMuted}`}>WIN RATE</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-2xl p-4 sm:p-6 ${theme.bgSecondary}`}>
            <Target className={`w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 ${theme.text}`} />
            <div className={`text-2xl sm:text-3xl font-light mb-1 ${theme.text}`}>{stats.wins}/{stats.losses}</div>
            <div className={`text-[10px] sm:text-xs tracking-widest ${theme.textMuted}`}>W/L RATIO</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-2xl p-4 sm:p-6 ${theme.bgSecondary}`}>
            <Calendar className={`w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 ${theme.text}`} />
            <div className={`text-2xl sm:text-3xl font-light mb-1 ${theme.text}`}>{stats.executedTrades.length}</div>
            <div className={`text-[10px] sm:text-xs tracking-widest ${theme.textMuted}`}>TRADES</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Trades List */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border ${theme.border} rounded-2xl ${theme.bgSecondary} overflow-hidden`}>
              <div className={`p-4 sm:p-5 border-b ${theme.border}`}>
                <h3 className={`text-base sm:text-lg tracking-widest ${theme.text} mb-3`}>ALL TRADES</h3>
                <TradeFilters filter={filter} setFilter={setFilter} darkMode={darkMode} stats={stats} />
              </div>
              <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'} max-h-[700px] overflow-y-auto`}>
                {filteredTrades.map((trade) => (
                  <div key={trade.id}
                    className={`p-4 sm:p-5 transition-all group ${darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-200/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 cursor-pointer" onClick={() => navigate(createPageUrl('TradeDetail') + `?id=${trade.id}`)}>
                        <div className={cn("w-10 h-10 flex items-center justify-center rounded-xl",
                          trade.outcome === 'win' ? 'bg-teal-600 text-white' :
                          trade.outcome === 'loss' ? 'bg-rose-600 text-white' :
                          trade.outcome === 'breakeven' ? 'bg-zinc-600 text-white' :
                          trade.direction === 'long' ? 'border-2 border-teal-600 text-teal-600' : 'border-2 border-rose-600 text-rose-600')}>
                          {(trade.outcome === 'win' && parseFloat(trade.actual_pnl || 0) > 0) || (!trade.outcome && trade.direction === 'long') ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`text-base tracking-wider ${theme.text}`}>{trade.pair || '-'}</div>
                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              trade.completion_percentage >= 85 ? 'bg-teal-600/20 text-teal-600' : 
                              trade.completion_percentage >= 70 ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-600/20 text-rose-600'
                            }`}>
                              {Math.round(trade.completion_percentage || 0)}%
                            </div>
                          </div>
                          <div className={`text-xs ${theme.textMuted}`}>{format(new Date(trade.created_date), 'dd.MM.yyyy HH:mm')}</div>
                        </div>
                      </div>
                      {trade.screenshots && trade.screenshots.length > 0 && (
                        <div className="flex gap-1 mr-3">
                          {trade.screenshots.slice(0, 2).map((url, i) => (
                            <div key={i} className={`w-8 h-8 rounded border ${theme.border} overflow-hidden`}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {trade.screenshots.length > 2 && (
                            <div className={`w-8 h-8 rounded ${theme.bgCard} border ${theme.border} flex items-center justify-center text-xs ${theme.textSecondary}`}>
                              +{trade.screenshots.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 sm:gap-3">
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
                          {!trade.outcome && <span className="px-2 sm:px-3 py-1 bg-blue-500 text-white text-[10px] sm:text-xs tracking-wider rounded-full font-bold">PENDING</span>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={(e) => {
                            e.stopPropagation();
                            navigate(createPageUrl('Checklist') + `?id=${trade.id}`);
                          }}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-teal-600/20 text-teal-400 hover:text-teal-500' : 'hover:bg-teal-100 text-teal-600 hover:text-teal-700'}`}
                            title="Checklist bearbeiten">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={(e) => handleDeleteTrade(e, trade.id)}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-rose-600/20 text-rose-400 hover:text-rose-500' : 'hover:bg-red-100 text-red-600 hover:text-red-700'}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-lg tracking-widest mb-4 ${theme.text}`}>WIN/LOSS</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12 }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal-600 rounded" /><span className={`text-sm ${theme.textMuted}`}>Win ({stats.wins})</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-600 rounded" /><span className={`text-sm ${theme.textMuted}`}>Loss ({stats.losses})</span></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-lg tracking-widest mb-4 ${theme.text}`}>AVG WIN/LOSS</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2"><span className={theme.textMuted}>AVG WIN</span><span className="text-teal-600 font-bold">${stats.avgWin}</span></div>
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                    <div className="h-full bg-teal-600" style={{ width: stats.avgWin > 0 ? '70%' : '0%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2"><span className={theme.textMuted}>AVG LOSS</span><span className="text-rose-600 font-bold">${stats.avgLoss}</span></div>
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                    <div className="h-full bg-rose-600" style={{ width: stats.avgLoss > 0 ? '50%' : '0%' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`mt-12 sm:mt-16 pt-6 sm:pt-8 border-t ${theme.border}`}>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
            <button type="button" onClick={() => navigate(createPageUrl('Impressum'))} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
              Impressum
            </button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button type="button" onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
              Datenschutz
            </button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button type="button" onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
              AGB
            </button>
          </div>
        </footer>
      </main>

      {/* Edit Modal */}
      {editingTrade && (
        <TradeEditModal
          trade={editingTrade}
          onClose={() => setEditingTrade(null)}
          onSave={handleSaveTrade}
        />
      )}
    </div>
  );
}