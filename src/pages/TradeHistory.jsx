import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowUpRight, ArrowDownRight, TrendingUp, Award, Target, Calendar, Trash2, Edit, Plus } from 'lucide-react';
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
  const [creatingNew, setCreatingNew] = useState(false);
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

  const createTradeMutation = useMutation({
    mutationFn: (data) => base44.entities.TradeChecklist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      setCreatingNew(false);
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
    if (creatingNew) {
      createTradeMutation.mutate(data);
    } else {
      updateTradeMutation.mutate({ id: editingTrade.id, data });
    }
  };

  const handleCreateNew = () => {
    setCreatingNew(true);
    setEditingTrade({
      pair: '',
      direction: '',
      outcome: 'pending',
      actual_pnl: '',
      exit_date: '',
      notes: '',
      completion_percentage: 0,
      status: 'in_progress'
    });
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
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4 relative">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <DarkModeToggle />
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors p-1.5 sm:p-2`}>
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

      <main className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div className="min-w-0">
            <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-5xl tracking-widest mb-1 sm:mb-2 ${theme.text}`}>HISTORY</h1>
            <p className={`${theme.textMuted} text-xs sm:text-sm tracking-wider`}>{t('performanceAnalytics')}</p>
          </div>
        </motion.div>

        {/* Quick Action */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 sm:mb-4 md:mb-6">
          <Button onClick={handleCreateNew} className={`w-full ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'} gap-2 h-10 sm:h-11 md:h-12 text-sm sm:text-base font-bold`}>
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            NEW TRADE
          </Button>
        </motion.div>

        {/* AI Analysis */}
        <AIPerformanceAnalysis checklists={checklists} darkMode={darkMode} />

        {/* Quick Stats */}
        <QuickStats checklists={checklists} darkMode={darkMode} />

        {/* Advanced Metrics */}
        <AdvancedMetrics checklists={checklists} darkMode={darkMode} />

        {/* Stats Grid - Wichtigste Metriken groß */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-5 sm:mb-6 md:mb-8">
          <div className={cn("border-2 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8", stats.totalPnL >= 0 ? "bg-teal-600 border-teal-600 text-white" : "bg-rose-600 border-rose-600 text-white")}>
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-3 sm:mb-4" />
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-1.5 sm:mb-2">${stats.totalPnL.toFixed(2)}</div>
            <div className="text-xs sm:text-sm tracking-widest opacity-90">TOTAL P&L</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 ${theme.bgSecondary}`}>
            <Award className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-3 sm:mb-4 ${theme.text}`} />
            <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-1.5 sm:mb-2 ${theme.text}`}>{stats.winRate}%</div>
            <div className={`text-xs sm:text-sm tracking-widest ${theme.textMuted}`}>WIN RATE</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 ${theme.bgSecondary}`}>
            <Target className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-3 sm:mb-4 ${theme.text}`} />
            <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-1.5 sm:mb-2 ${theme.text}`}>{stats.wins}/{stats.losses}</div>
            <div className={`text-xs sm:text-sm tracking-widest ${theme.textMuted}`}>W/L RATIO</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 ${theme.bgSecondary}`}>
            <Calendar className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-3 sm:mb-4 ${theme.text}`} />
            <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-1.5 sm:mb-2 ${theme.text}`}>{stats.executedTrades.length}</div>
            <div className={`text-xs sm:text-sm tracking-widest ${theme.textMuted}`}>TRADES</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Trades List */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl ${theme.bgSecondary} overflow-hidden`}>
        {/* Stats Grid - Wichtigste Metriken groß und lesbar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-5 sm:mb-6 md:mb-8">
          <div className={cn("border-2 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8", stats.totalPnL >= 0 ? "bg-teal-600 border-teal-600 text-white" : "bg-rose-600 border-rose-600 text-white")}>
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-3 sm:mb-4" />
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-2">${stats.totalPnL.toFixed(2)}</div>
            <div className="text-xs sm:text-sm tracking-widest opacity-90">TOTAL P&L</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8 ${theme.bgSecondary}`}>
            <Award className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-3 sm:mb-4 ${theme.text}`} />
            <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-2 ${theme.text}`}>{stats.winRate}%</div>
            <div className={`text-xs sm:text-sm tracking-widest ${theme.textMuted}`}>WIN RATE</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8 ${theme.bgSecondary}`}>
            <Target className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-3 sm:mb-4 ${theme.text}`} />
            <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-2 ${theme.text}`}>{stats.wins}/{stats.losses}</div>
            <div className={`text-xs sm:text-sm tracking-widest ${theme.textMuted}`}>W/L</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8 ${theme.bgSecondary}`}>
            <Calendar className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-3 sm:mb-4 ${theme.text}`} />
            <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-2 ${theme.text}`}>{stats.executedTrades.length}</div>
            <div className={`text-xs sm:text-sm tracking-widest ${theme.textMuted}`}>TRADES</div>
          </div>
        </motion.div>
            </motion.div>
          </div>

          {/* Charts - Kompakt für Seitenleiste */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-sm sm:text-base md:text-lg tracking-widest mb-3 sm:mb-4 ${theme.text}`}>WIN/LOSS</h3>
              <div className="h-36 sm:h-40 md:h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12, fontSize: '12px' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal-600 rounded" /><span className={`text-xs sm:text-sm ${theme.textMuted}`}>W ({stats.wins})</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-600 rounded" /><span className={`text-xs sm:text-sm ${theme.textMuted}`}>L ({stats.losses})</span></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-sm sm:text-base md:text-lg tracking-widest mb-3 sm:mb-4 ${theme.text}`}>AVERAGE</h3>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <div className="flex justify-between mb-2 sm:mb-3 gap-2"><span className={`text-xs sm:text-sm ${theme.textMuted}`}>Win</span><span className="text-teal-600 text-base sm:text-lg md:text-xl font-bold">${stats.avgWin}</span></div>
                  <div className={`h-2.5 sm:h-3 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                    <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: stats.avgWin > 0 ? '70%' : '0%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 sm:mb-3 gap-2"><span className={`text-xs sm:text-sm ${theme.textMuted}`}>Loss</span><span className="text-rose-600 text-base sm:text-lg md:text-xl font-bold">${stats.avgLoss}</span></div>
                  <div className={`h-2.5 sm:h-3 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                    <div className="h-full bg-rose-600 rounded-full transition-all" style={{ width: stats.avgLoss > 0 ? '50%' : '0%' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`mt-12 sm:mt-16 md:mt-20 pt-8 border-t ${theme.border}`}>
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

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingTrade && (
          <TradeEditModal
            trade={editingTrade}
            onClose={() => {
              setEditingTrade(null);
              setCreatingNew(false);
            }}
            onSave={handleSaveTrade}
            isCreating={creatingNew}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}