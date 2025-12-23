import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowUpRight, ArrowDownRight, TrendingUp, Award, Target, Calendar, Trash2, Edit, Plus, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';
import TradeEditModal from '@/components/advanced/TradeEditModal';
import TradeFilters from '@/components/advanced/TradeFilters';

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
    if (window.confirm(t('confirmDelete') || 'Trade wirklich löschen?')) {
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

    return { wins, losses, breakeven, pending, totalPnL, winRate, avgWin, avgLoss, executedTrades, total: checklists.length, executed: executedTrades.length };
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
    textDimmed: darkMode ? 'text-zinc-600' : 'text-zinc-400',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-4 relative">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <DarkModeToggle />
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors p-1 sm:p-1.5 md:p-2`}>
                <Home className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              } alt="ZNPCV" className="h-7 sm:h-8 md:h-10 lg:h-12 xl:h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-10">
        {/* Title mit Zurück-Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
            <button 
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className={`${darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400'} border-2 rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 transition-all flex-shrink-0 group`}>
              <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${theme.text} group-hover:-translate-x-1 transition-transform`} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-widest mb-1 sm:mb-1.5 md:mb-2 ${theme.text}`}>{t('tradeHistory')}</h1>
              <p className={`${theme.textMuted} text-xs sm:text-sm tracking-wider`}>{t('performanceAnalytics')}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Wichtigste Metriken */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div className={cn("border-2 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-8", stats.totalPnL >= 0 ? "bg-teal-600 border-teal-600 text-white" : "bg-rose-600 border-rose-600 text-white")}>
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-2 sm:mb-3 md:mb-4" />
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-1 sm:mb-1.5 md:mb-2">${stats.totalPnL.toFixed(2)}</div>
            <div className="text-[10px] sm:text-xs md:text-sm tracking-widest opacity-90">{t('pnl')}</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-8 ${theme.bgSecondary}`}>
            <Award className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-2 sm:mb-3 md:mb-4 ${theme.text}`} />
            <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-1 sm:mb-1.5 md:mb-2 ${theme.text}`}>{stats.winRate}%</div>
            <div className={`text-[10px] sm:text-xs md:text-sm tracking-widest ${theme.textMuted}`}>{t('win')}</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-8 ${theme.bgSecondary}`}>
            <Target className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-2 sm:mb-3 md:mb-4 ${theme.text}`} />
            <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-1 sm:mb-1.5 md:mb-2 ${theme.text}`}>{stats.wins}/{stats.losses}</div>
            <div className={`text-[10px] sm:text-xs md:text-sm tracking-widest ${theme.textMuted}`}>{t('winLoss')}</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-8 ${theme.bgSecondary}`}>
            <Calendar className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-2 sm:mb-3 md:mb-4 ${theme.text}`} />
            <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-1 sm:mb-1.5 md:mb-2 ${theme.text}`}>{stats.executed}</div>
            <div className={`text-[10px] sm:text-xs md:text-sm tracking-widest ${theme.textMuted}`}>{t('exec')}</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {/* Trades List */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-lg sm:rounded-xl md:rounded-2xl ${theme.bgSecondary} overflow-hidden`}>
              <div className={`p-3 sm:p-4 md:p-5 lg:p-6 border-b ${theme.border}`}>
                <h3 className={`text-sm sm:text-base md:text-lg lg:text-xl tracking-widest ${theme.text} mb-2 sm:mb-3 md:mb-4`}>{t('allTrades')}</h3>
                <TradeFilters filter={filter} setFilter={setFilter} darkMode={darkMode} stats={stats} />
              </div>

              {isLoading ? (
                <div className={`p-8 sm:p-10 md:p-12 text-center ${theme.textDimmed} text-xs sm:text-sm`}>{t('loading')}</div>
              ) : filteredTrades.length === 0 ? (
                <div className="p-8 sm:p-10 md:p-12 text-center">
                  <p className={`${theme.textDimmed} mb-4 sm:mb-5 md:mb-6 text-xs sm:text-sm`}>{t('noAnalyses')}</p>
                  <Button onClick={() => navigate(createPageUrl('Checklist'))} className={`rounded-lg sm:rounded-xl border-2 font-bold text-xs sm:text-sm ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                    {t('startFirstAnalysis')}
                  </Button>
                </div>
              ) : (
                <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'} max-h-[500px] sm:max-h-[550px] md:max-h-[600px] overflow-y-auto`}>
                  {filteredTrades.map((trade) => (
                    <div key={trade.id}
                      className={`p-3 sm:p-4 md:p-5 lg:p-6 transition-all group cursor-pointer ${darkMode ? 'hover:bg-zinc-900/70' : 'hover:bg-zinc-200/70'}`}
                      onClick={() => navigate(createPageUrl('TradeDetail') + `?id=${trade.id}`)}>
                      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-2.5 md:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1">
                          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg sm:rounded-xl border-2",
                            trade.outcome === 'win' ? 'bg-teal-600 text-white border-teal-600' :
                            trade.outcome === 'loss' ? 'bg-rose-600 text-white border-rose-600' :
                            trade.outcome === 'breakeven' ? 'bg-zinc-600 text-white border-zinc-600' :
                            trade.direction === 'long' ? 'border-2 border-teal-600 text-teal-600' : 'border-2 border-rose-600 text-rose-600')}>
                            {(trade.outcome === 'win' && parseFloat(trade.actual_pnl || 0) > 0) || (!trade.outcome && trade.direction === 'long') ? 
                              <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" /> : <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />}
                          </div>
                          <div className="flex-1">
                            <div className={`text-base sm:text-lg md:text-xl font-bold tracking-wider ${theme.text} mb-0.5 sm:mb-1`}>{trade.pair || '-'}</div>
                            <div className={`text-[10px] sm:text-xs md:text-sm ${theme.textMuted}`}>{format(new Date(trade.created_date), 'dd.MM.yyyy HH:mm')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                          <div className="text-right">
                            {trade.outcome && trade.actual_pnl && (
                              <>
                                <div className={cn("text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1",
                                  parseFloat(trade.actual_pnl) > 0 ? 'text-teal-600' :
                                  parseFloat(trade.actual_pnl) < 0 ? 'text-rose-600' : theme.text)}>
                                  {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                                </div>
                                <div className={cn("text-[9px] sm:text-[10px] md:text-xs tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full",
                                  trade.outcome === 'win' ? 'bg-teal-600/20 text-teal-600' :
                                  trade.outcome === 'loss' ? 'bg-rose-600/20 text-rose-600' : 'bg-zinc-600/20 text-zinc-400')}>
                                  {trade.outcome === 'win' ? t('win') : trade.outcome === 'loss' ? t('loss') : t('breakeven')}
                                </div>
                              </>
                            )}
                            {!trade.outcome && (
                              <span className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 bg-blue-500 text-white text-[9px] sm:text-[10px] md:text-xs tracking-wider rounded-full font-bold">
                                {trade.status === 'ready_to_trade' ? t('readyToTradeShort') : t('pending')}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 sm:gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={(e) => handleEditTrade(e, trade)}
                              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-colors ${darkMode ? 'hover:bg-teal-600/20 text-teal-400 hover:text-teal-500' : 'hover:bg-teal-100 text-teal-600 hover:text-teal-700'}`}>
                              <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button type="button" onClick={(e) => handleDeleteTrade(e, trade.id)}
                              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-colors ${darkMode ? 'hover:bg-rose-600/20 text-rose-400 hover:text-rose-500' : 'hover:bg-red-100 text-red-600 hover:text-red-700'}`}>
                              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-[9px] sm:text-[10px] md:text-xs">
                        <span className={theme.textMuted}>{t('avgScore')}: <span className={`font-bold ${theme.text}`}>{Math.round(trade.completion_percentage || 0)}%</span></span>
                        {trade.risk_percent && <span className={theme.textMuted}>{t('risk')}: <span className={`font-bold ${theme.text}`}>{trade.risk_percent}%</span></span>}
                        {trade.entry_price && <span className={theme.textMuted}>{t('entry')}: <span className={`font-bold ${theme.text}`}>{trade.entry_price}</span></span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Charts */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-sm sm:text-base md:text-lg tracking-widest mb-2 sm:mb-3 md:mb-4 ${theme.text}`}>{t('winLoss')}</h3>
              <div className="h-32 sm:h-36 md:h-40 lg:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12, fontSize: '11px' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 md:mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className={`text-[10px] sm:text-xs md:text-sm ${theme.textMuted}`}>{item.name} ({item.value})</span>
                  </div>
                ))}
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