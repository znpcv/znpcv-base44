import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useOffline } from '@/components/offline/OfflineManager';
import { offlineClient } from '@/components/offline/OfflineBase44Client';
import { Home, ArrowUpRight, ArrowDownRight, TrendingUp, Award, Target, Calendar, Trash2, Edit, Plus, ArrowLeft, Download, FileText, GitCompare, CheckSquare, Archive, Search, ArrowUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import toast from 'react-hot-toast';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';
import TradeEditModal from '@/components/advanced/TradeEditModal';
import TradeFilters from '@/components/advanced/TradeFilters';
import AdvancedTradeFilters from '@/components/advanced/AdvancedTradeFilters';
import BulkDeletePanel from '@/components/advanced/BulkDeletePanel';
import TradeCompareModal from '@/components/advanced/TradeCompareModal';

export default function TradeHistoryPage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const { isOnline, updatePendingCount } = useOffline();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    offlineClient.setUpdateCallback(updatePendingCount);
  }, [updatePendingCount]);
  const [editingTrade, setEditingTrade] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
    pair: 'all',
    minRR: 'all'
  });
  const [exporting, setExporting] = useState(false);
  const queryClient = useQueryClient();

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: async () => {
      const client = await offlineClient.TradeChecklist();
      const allTrades = await client.list('-created_date', 100);
      return allTrades.filter((t) => !t.deleted);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: isOnline ? 5000 : false
  });

  const { data: deletedTrades = [] } = useQuery({
    queryKey: ['deletedTrades'],
    queryFn: async () => {
      const allTrades = await base44.entities.TradeChecklist.list('-deleted_date', 100);
      return allTrades.filter((t) => t.deleted);
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false
  });

  const updateTradeMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const client = await offlineClient.TradeChecklist();
      return client.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      setEditingTrade(null);
    },
    onError: (error) => console.error('Update failed:', error)
  });

  const createTradeMutation = useMutation({
    mutationFn: async (data) => {
      const client = await offlineClient.TradeChecklist();
      return client.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      setCreatingNew(false);
    },
    onError: (error) => console.error('Create failed:', error)
  });

  const deleteTradeMutation = useMutation({
    mutationFn: async (id) => {
      const client = await offlineClient.TradeChecklist();
      return client.update(id, {
        deleted: true,
        deleted_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['deletedTrades'] });
      toast.success('Trade in Papierkorb verschoben', {
        style: darkMode ? {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a'
        } : {}
      });
    },
    onError: (error) => {
      console.error('Delete failed:', error);
      toast.error('Fehler beim Löschen');
    }
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
    const tradeData = {
      ...data,
      trade_date: data.trade_date || format(new Date(), 'yyyy-MM-dd')
    };

    if (creatingNew) {
      createTradeMutation.mutate(tradeData);
    } else {
      updateTradeMutation.mutate({ id: editingTrade.id, data: tradeData });
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
      trade_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      completion_percentage: 0,
      status: 'in_progress'
    });
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const response = await base44.functions.invoke('exportTradesPDF', {});
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZNPCV_Trades_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const response = await base44.functions.invoke('exportTradesExcel', {});
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZNPCV_Trades_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`${selectedTrades.length} Trades in Papierkorb verschieben?`)) {
      try {
        await Promise.all(selectedTrades.map((id) =>
        base44.entities.TradeChecklist.update(id, {
          deleted: true,
          deleted_date: new Date().toISOString()
        })
        ));
        queryClient.invalidateQueries({ queryKey: ['checklists'] });
        queryClient.invalidateQueries({ queryKey: ['deletedTrades'] });
        setSelectedTrades([]);
        toast.success(`${selectedTrades.length} Trades in Papierkorb verschoben`, {
          style: darkMode ? {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a'
          } : {}
        });
      } catch (error) {
        console.error('Bulk delete failed:', error);
        toast.error('Fehler beim Löschen');
      }
    }
  };

  const toggleTradeSelection = (tradeId) => {
    setSelectedTrades((prev) =>
    prev.includes(tradeId) ? prev.filter((id) => id !== tradeId) : [...prev, tradeId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTrades.length === filteredTrades.length) {
      setSelectedTrades([]);
    } else {
      setSelectedTrades(filteredTrades.map((t) => t.id));
    }
  };

  const stats = useMemo(() => {
    const executedTrades = checklists.filter((t) => t.outcome && t.outcome !== 'pending');
    const pending = checklists.filter((t) => !t.outcome || t.outcome === 'pending').length;
    const wins = executedTrades.filter((t) => t.outcome === 'win').length;
    const losses = executedTrades.filter((t) => t.outcome === 'loss').length;
    const breakeven = executedTrades.filter((t) => t.outcome === 'breakeven').length;
    const totalPnL = executedTrades.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
    const totalGross = executedTrades.reduce((sum, t) => sum + Math.abs(parseFloat(t.actual_pnl || 0)), 0);
    const totalWins = executedTrades.filter((t) => t.outcome === 'win').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
    const totalLosses = Math.abs(executedTrades.filter((t) => t.outcome === 'loss').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0));
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : totalWins > 0 ? '∞' : 0;
    const winRate = executedTrades.length > 0 ? (wins / executedTrades.length * 100).toFixed(1) : 0;
    const avgWin = wins > 0 ? (executedTrades.filter((t) => t.outcome === 'win').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / wins).toFixed(2) : 0;
    const avgLoss = losses > 0 ? Math.abs(executedTrades.filter((t) => t.outcome === 'loss').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / losses).toFixed(2) : 0;

    return { wins, losses, breakeven, pending, totalPnL, totalWins, totalLosses, profitFactor, winRate, avgWin, avgLoss, executedTrades, total: checklists.length, executed: executedTrades.length };
  }, [checklists]);

  const filteredTrades = useMemo(() => {
    let filtered = checklists;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => {
        const pair = (t.pair || '').toLowerCase();
        const date = format(new Date(t.trade_date || t.created_date), 'dd.MM.yyyy');
        const direction = (t.direction || '').toLowerCase();
        const outcome = (t.outcome || '').toLowerCase();
        return pair.includes(query) || date.includes(query) || direction.includes(query) || outcome.includes(query);
      });
    }

    // Basic filter
    if (filter !== 'all') {
      filtered = filter === 'pending' ?
      filtered.filter((t) => !t.outcome || t.outcome === 'pending') :
      filtered.filter((t) => t.outcome === filter);
    }

    // Advanced filters
    if (advancedFilters.dateFrom) {
      filtered = filtered.filter((t) => {
        return t.trade_date && t.trade_date >= advancedFilters.dateFrom;
      });
    }

    if (advancedFilters.dateTo) {
      filtered = filtered.filter((t) => {
        return t.trade_date && t.trade_date <= advancedFilters.dateTo;
      });
    }

    if (advancedFilters.pair !== 'all') {
      filtered = filtered.filter((t) => t.pair === advancedFilters.pair);
    }

    if (advancedFilters.minRR !== 'all') {
      const minRR = parseFloat(advancedFilters.minRR);
      filtered = filtered.filter((t) => {
        if (!t.entry_price || !t.stop_loss || !t.take_profit) return false;
        const entry = parseFloat(t.entry_price);
        const sl = parseFloat(t.stop_loss);
        const tp = parseFloat(t.take_profit);
        const isLong = t.direction === 'long';
        const slDistance = isLong ? entry - sl : sl - entry;
        const tpDistance = isLong ? tp - entry : entry - tp;
        const rr = slDistance > 0 ? tpDistance / slDistance : 0;
        return rr >= minRR;
      });
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.trade_date || b.created_date) - new Date(a.trade_date || a.created_date);
        case 'date-asc':
          return new Date(a.trade_date || a.created_date) - new Date(b.trade_date || b.created_date);
        case 'pnl-desc':
          return parseFloat(b.actual_pnl || 0) - parseFloat(a.actual_pnl || 0);
        case 'pnl-asc':
          return parseFloat(a.actual_pnl || 0) - parseFloat(b.actual_pnl || 0);
        case 'pair-asc':
          return (a.pair || '').localeCompare(b.pair || '');
        case 'pair-desc':
          return (b.pair || '').localeCompare(a.pair || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [checklists, filter, advancedFilters, searchQuery, sortBy]);

  const pieData = [
  { name: 'Wins', value: stats.wins, color: '#0d9488' },
  { name: 'Losses', value: stats.losses, color: '#e11d48' },
  { name: 'Breakeven', value: stats.breakeven, color: '#6b7280' }].
  filter((d) => d.value > 0);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    textDimmed: darkMode ? 'text-zinc-600' : 'text-zinc-400',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200'
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
              <button
                onClick={() => navigate(createPageUrl('Trash'))}
                className={`relative ${theme.textSecondary} hover:${theme.text} transition-colors p-1 sm:p-1.5 md:p-2`}>

                <Archive className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                {deletedTrades.length > 0 &&
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] sm:text-[10px] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
                    {deletedTrades.length}
                  </span>
                }
              </button>
            </div>

            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img src={darkMode ?
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png" :
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
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
        {/* Title mit Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className={`${darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400'} border-2 rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 transition-all flex-shrink-0 group`}>
                <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${theme.text} group-hover:-translate-x-1 transition-transform`} />
              </button>
              <div className="min-w-0">
                <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-widest mb-1 ${theme.text}`}>{t('tradeHistory')}</h1>
                <p className={`${theme.textMuted} text-xs sm:text-sm tracking-wider`}>{t('performanceAnalytics')}</p>
              </div>
            </div>
            
            {/* Export Buttons */}
            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              <Button onClick={handleExportPDF} disabled={exporting} className={`h-8 sm:h-9 px-2 sm:px-3 text-xs border-2 font-bold rounded-xl transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:border-zinc-400'}`}>
                <Download className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button onClick={handleExportExcel} disabled={exporting} className={`h-8 sm:h-9 px-2 sm:px-3 text-xs border-2 font-bold rounded-xl transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:border-zinc-400'}`}>
                <FileText className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">CSV</span>
              </Button>
              {filteredTrades.length >= 2 &&
              <Button
                onClick={() => setCompareMode(!compareMode)}
                className={cn("h-8 sm:h-9 px-2 sm:px-3 border-2 text-xs font-bold rounded-xl transition-all",
                compareMode ? "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800" : darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700" : "bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:border-zinc-400")}>
                  <GitCompare className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">{compareMode ? 'Fertig' : 'Vergleich'}</span>
                </Button>
              }
            </div>
          </div>
          
          {/* Advanced Filters */}
          <AdvancedTradeFilters
            filters={advancedFilters}
            onFilterChange={setAdvancedFilters}
            onReset={() => setAdvancedFilters({ dateFrom: '', dateTo: '', pair: 'all', minRR: 'all' })}
            darkMode={darkMode} />

        </motion.div>

        {/* Stats Grid - Erweiterte Metriken */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          <div className={cn("border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5", stats.totalPnL >= 0 ? "bg-emerald-700 border-emerald-700 text-white" : "bg-rose-600 border-rose-600 text-white")}>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mb-2" />
            <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1">${stats.totalPnL.toFixed(2)}</div>
            <div className="text-[10px] sm:text-xs tracking-widest opacity-90">GESAMT P&L</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 ${theme.bgSecondary}`}>
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 mb-2 text-emerald-700" />
            <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1 text-emerald-700">${stats.totalWins.toFixed(2)}</div>
            <div className={`text-[10px] sm:text-xs tracking-widest ${theme.textMuted}`}>GEWINNE</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 ${theme.bgSecondary}`}>
            <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 mb-2 text-rose-600" />
            <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1 text-rose-600">${stats.totalLosses.toFixed(2)}</div>
            <div className={`text-[10px] sm:text-xs tracking-widest ${theme.textMuted}`}>VERLUSTE</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 ${theme.bgSecondary}`}>
            <Award className={`w-4 h-4 sm:w-5 sm:h-5 mb-2 ${theme.text}`} />
            <div className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 ${theme.text}`}>{stats.winRate}%</div>
            <div className={`text-[10px] sm:text-xs tracking-widest ${theme.textMuted}`}>WINRATE</div>
          </div>
          <div className={`border-2 ${theme.border} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 ${theme.bgSecondary}`}>
            <Target className={`w-4 h-4 sm:w-5 sm:h-5 mb-2 ${theme.text}`} />
            <div className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 ${theme.text}`}>{stats.profitFactor}</div>
            <div className={`text-[10px] sm:text-xs tracking-widest ${theme.textMuted}`}>PROFIT FAKTOR</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {/* Trades List */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
            className={`border-2 ${theme.border} rounded-lg sm:rounded-xl md:rounded-2xl ${theme.bgSecondary} overflow-hidden`}>
              <div className={`p-3 sm:p-4 md:p-5 border-b ${theme.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm sm:text-base md:text-lg tracking-widest ${theme.text}`}>{t('allTrades')}</h3>
                  {filteredTrades.length > 0 &&
                  <button
                    onClick={toggleSelectAll}
                    className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border-2 transition-all",
                    selectedTrades.length === filteredTrades.length ?
                    "bg-emerald-700 text-white border-emerald-700" :
                    darkMode ? "border-zinc-800 text-zinc-400 hover:border-zinc-700" : "border-zinc-300 text-zinc-600 hover:border-zinc-400")}>
                      <CheckSquare className="w-3.5 h-3.5" />
                      {selectedTrades.length === filteredTrades.length ? 'Alle abwählen' : 'Alle auswählen'}
                    </button>
                  }
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Suche nach Pair, Datum oder Typ..."
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border-2 ${theme.border} ${darkMode ? 'bg-zinc-900/50 text-white' : 'bg-white text-black'} text-sm placeholder:${theme.textMuted}`}
                  />
                </div>

                {/* Sort & Filter */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <ArrowUpDown className={`w-3.5 h-3.5 ${theme.textSecondary}`} />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border-2 ${theme.border} ${darkMode ? 'bg-zinc-900/50 text-white' : 'bg-white text-black'}`}
                    >
                      <option value="date-desc">Neueste zuerst</option>
                      <option value="date-asc">Älteste zuerst</option>
                      <option value="pnl-desc">Höchster Gewinn</option>
                      <option value="pnl-asc">Höchster Verlust</option>
                      <option value="pair-asc">Pair A-Z</option>
                      <option value="pair-desc">Pair Z-A</option>
                    </select>
                  </div>
                </div>

                <TradeFilters filter={filter} setFilter={setFilter} darkMode={darkMode} stats={stats} />
              </div>

              {isLoading ?
              <div className={`p-8 sm:p-10 md:p-12 text-center ${theme.textDimmed} text-xs sm:text-sm`}>{t('loading')}</div> :
              filteredTrades.length === 0 ?
              <div className="p-8 sm:p-10 md:p-12 text-center">
                  <p className={`${theme.textDimmed} mb-4 sm:mb-5 md:mb-6 text-xs sm:text-sm`}>{t('noAnalyses')}</p>
                  <Button onClick={() => navigate(createPageUrl('Checklist'))} className={`rounded-lg sm:rounded-xl border-2 font-bold px-4 sm:px-6 h-10 sm:h-11 text-xs sm:text-sm ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                    {t('startFirstAnalysis')}
                  </Button>
                </div> :

              <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'} max-h-[500px] sm:max-h-[550px] md:max-h-[600px] overflow-y-auto`}>
                  {filteredTrades.map((trade) =>
                <div key={trade.id}
                className={cn("p-3 sm:p-4 md:p-5 lg:p-6 transition-all group cursor-pointer relative",
                compareMode && selectedTrades.includes(trade.id) && "ring-2 ring-emerald-700",
                darkMode ? 'hover:bg-zinc-900/70' : 'hover:bg-zinc-200/70')}
                onClick={(e) => {
                  if (compareMode) {
                    e.stopPropagation();
                    if (selectedTrades.length < 2 || selectedTrades.includes(trade.id)) {
                      toggleTradeSelection(trade.id);
                    }
                  } else {
                    navigate(createPageUrl('TradeDetail') + `?id=${trade.id}`);
                  }
                }}>
                      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-2.5 md:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1">
                          {compareMode &&
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTradeSelection(trade.id);
                        }}
                        className={cn("w-6 h-6 border-2 rounded flex items-center justify-center flex-shrink-0 cursor-pointer transition-all",
                        selectedTrades.includes(trade.id) ?
                        "bg-emerald-700 border-emerald-700" :
                        darkMode ? "border-zinc-700 hover:border-zinc-600" : "border-zinc-400 hover:border-zinc-500")}>
                              {selectedTrades.includes(trade.id) && <CheckSquare className="w-4 h-4 text-white" />}
                            </div>
                      }
                          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg sm:rounded-xl border-2",
                      trade.outcome === 'win' ? 'bg-emerald-700 text-white border-emerald-700' :
                      trade.outcome === 'loss' ? 'bg-rose-600 text-white border-rose-600' :
                      trade.outcome === 'breakeven' ? 'bg-zinc-600 text-white border-zinc-600' :
                      trade.direction === 'long' ? 'border-2 border-emerald-700 text-emerald-700' : 'border-2 border-rose-600 text-rose-600')}>
                            {trade.outcome === 'win' && parseFloat(trade.actual_pnl || 0) > 0 || !trade.outcome && trade.direction === 'long' ?
                        <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" /> : <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />}
                          </div>
                          <div className="flex-1">
                            <div className={`text-base sm:text-lg md:text-xl font-bold tracking-wider ${theme.text} mb-0.5 sm:mb-1`}>{trade.pair || '-'}</div>
                            <div className={`text-[10px] sm:text-xs md:text-sm ${theme.textMuted}`}>{format(new Date(trade.trade_date || trade.created_date), 'dd.MM.yyyy')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                          <div className="text-right">
                            {trade.outcome && trade.actual_pnl &&
                        <>
                                <div className={cn("text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1",
                          parseFloat(trade.actual_pnl) > 0 ? 'text-emerald-700' :
                          parseFloat(trade.actual_pnl) < 0 ? 'text-rose-600' : theme.text)}>
                                  {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                                </div>
                                <div className={cn("text-[9px] sm:text-[10px] md:text-xs tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full",
                          trade.outcome === 'win' ? 'bg-emerald-700/20 text-emerald-700' :
                          trade.outcome === 'loss' ? 'bg-rose-600/20 text-rose-600' : 'bg-zinc-600/20 text-zinc-400')}>
                                  {trade.outcome === 'win' ? t('win') : trade.outcome === 'loss' ? t('loss') : t('breakeven')}
                                </div>
                              </>
                        }
                            {!trade.outcome &&
                        <span className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 bg-blue-500 text-white text-[9px] sm:text-[10px] md:text-xs tracking-wider rounded-full font-bold">
                                {trade.status === 'ready_to_trade' ? t('readyToTradeShort') : t('pending')}
                              </span>
                        }
                          </div>
                          <div className="flex flex-col gap-1 sm:gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={(e) => handleEditTrade(e, trade)}
                        className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-colors ${darkMode ? 'hover:bg-emerald-700/20 text-teal-400 hover:text-teal-500' : 'hover:bg-teal-100 text-emerald-700 hover:text-teal-700'}`}>
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
                )}
                </div>
              }
            </motion.div>
          </div>

          {/* Charts & Stats */}
          <div className="space-y-3 sm:space-y-4">
            {/* Win/Loss Pie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
            className={`border-2 ${theme.border} rounded-lg sm:rounded-xl p-3 sm:p-4 ${theme.bgSecondary}`}>
              <h3 className={`text-sm sm:text-base tracking-widest mb-3 ${theme.text}`}>{t('winLoss')}</h3>
              <div className="h-32 sm:h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#ffffff', border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, borderRadius: 12, fontSize: '11px' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-2 sm:gap-3 mt-3">
                {pieData.map((item) =>
                <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded" style={{ backgroundColor: item.color }} />
                    <span className={`text-[10px] sm:text-xs ${theme.textMuted}`}>{item.name} ({item.value})</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Aggregierte Statistiken */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
            className={`border-2 ${theme.border} rounded-lg sm:rounded-xl p-3 sm:p-4 ${theme.bgSecondary}`}>
              <h3 className={`text-sm sm:text-base tracking-widest mb-3 ${theme.text}`}>STATISTIKEN</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme.textMuted}`}>Ø Gewinn</span>
                  <span className={`text-sm font-bold text-emerald-700`}>${stats.avgWin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme.textMuted}`}>Ø Verlust</span>
                  <span className={`text-sm font-bold text-rose-600`}>${stats.avgLoss}</span>
                </div>
                <div className={`flex items-center justify-between pt-2 border-t ${theme.border}`}>
                  <span className={`text-xs ${theme.textMuted}`}>Profit Faktor</span>
                  <span className={`text-base font-bold ${theme.text}`}>{stats.profitFactor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme.textMuted}`}>Trades gesamt</span>
                  <span className={`text-sm font-bold ${theme.text}`}>{stats.executed}</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Footer */}
        <footer className={`mt-12 sm:mt-16 md:mt-20 lg:mt-24 border-t ${theme.border}`}>
          <div className="py-6 sm:py-8 md:py-10">
            <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
              <img src={darkMode ?
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png" :
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
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

      {/* Modals */}
      <AnimatePresence>
        {editingTrade &&
        <TradeEditModal
          trade={editingTrade}
          onClose={() => {
            setEditingTrade(null);
            setCreatingNew(false);
          }}
          onSave={handleSaveTrade}
          isCreating={creatingNew}
          darkMode={darkMode} />

        }

        {compareMode && selectedTrades.length === 2 &&
        <TradeCompareModal
          trade1={checklists.find((t) => t.id === selectedTrades[0])}
          trade2={checklists.find((t) => t.id === selectedTrades[1])}
          onClose={() => {
            setCompareMode(false);
            setSelectedTrades([]);
          }}
          darkMode={darkMode} />

        }
      </AnimatePresence>

      {/* Bulk Delete Panel */}
      <BulkDeletePanel
        selectedCount={selectedTrades.length}
        onDelete={handleBulkDelete}
        onCancel={() => setSelectedTrades([])}
        darkMode={darkMode} />

    </div>);

}