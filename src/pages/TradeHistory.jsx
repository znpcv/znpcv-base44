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
  const [showBulkActions, setShowBulkActions] = useState(false);
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
    setSelectedTrades((prev) => {
      const newSelection = prev.includes(tradeId) ? prev.filter((id) => id !== tradeId) : [...prev, tradeId];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTrades.length === filteredTrades.length) {
      setSelectedTrades([]);
      setShowBulkActions(false);
    } else {
      setSelectedTrades(filteredTrades.map((t) => t.id));
      setShowBulkActions(true);
    }
  };

  const handleBulkExportPDF = async () => {
    try {
      setExporting(true);
      const selectedData = checklists.filter(t => selectedTrades.includes(t.id));
      const response = await base44.functions.invoke('exportTradesPDF', { trades: selectedData });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZNPCV_Selected_${selectedTrades.length}_Trades.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${selectedTrades.length} Trades exportiert`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export fehlgeschlagen');
    } finally {
      setExporting(false);
    }
  };

  const handleCompareSelected = () => {
    if (selectedTrades.length === 2) {
      // Modal wird automatisch geöffnet durch AnimatePresence
    } else {
      toast.error('Wähle genau 2 Trades zum Vergleichen');
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
          <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4 relative">
            <div className="flex items-center gap-0.5 sm:gap-1.5 md:gap-2">
              <DarkModeToggle />
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors p-1 sm:p-1.5 md:p-2`}>
                <Home className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={() => navigate(createPageUrl('Trash'))}
                className={`relative ${theme.textSecondary} hover:${theme.text} transition-colors p-1 sm:p-1.5 md:p-2`}>
                <Archive className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                {deletedTrades.length > 0 &&
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[8px] sm:text-[10px] rounded-full w-3.5 h-3.5 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
                    {deletedTrades.length}
                  </span>
                }
              </button>
            </div>

            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img src={darkMode ?
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png" :
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              } alt="ZNPCV" className="h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-10">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="mb-3 sm:mb-5 md:mb-6">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className={cn("border-2 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 transition-all group",
                  darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400')}>
                <ArrowLeft className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${theme.text} group-hover:-translate-x-1 transition-transform`} />
              </button>
              <div>
                <h1 className={`text-xl sm:text-3xl md:text-4xl tracking-widest ${theme.text}`}>{t('tradeHistory')}</h1>
                <p className={`${theme.textMuted} text-[10px] sm:text-sm tracking-wider`}>{t('performanceAnalytics')}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5 sm:gap-2">
              <Button 
                onClick={() => navigate(createPageUrl('Checklist'))}
                className={cn("h-8 sm:h-9 px-2 sm:px-4 text-xs border-2 font-bold rounded-lg sm:rounded-xl transition-all hover:scale-105",
                  darkMode ? 'bg-white border-white text-black hover:bg-zinc-100' : 'bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800')}>
                <Plus className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Neu</span>
              </Button>
              <Button onClick={handleExportPDF} disabled={exporting} className={cn("h-8 sm:h-9 px-2 sm:px-3 text-xs border-2 font-bold rounded-lg sm:rounded-xl transition-all",
                darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:border-zinc-400')}>
                <Download className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button onClick={handleExportExcel} disabled={exporting} className={cn("h-8 sm:h-9 px-2 sm:px-3 text-xs border-2 font-bold rounded-lg sm:rounded-xl transition-all",
                darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:border-zinc-400')}>
                <FileText className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">CSV</span>
              </Button>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1, delay: 0.2 }} className="grid grid-cols-2 lg:grid-cols-5 gap-1.5 sm:gap-3 md:gap-4 mb-3 sm:mb-5 md:mb-6">
          <div className={cn("border-2 rounded-lg sm:rounded-xl p-2 sm:p-4 transition-all hover:scale-105", stats.totalPnL >= 0 ? "bg-emerald-700 border-emerald-700 text-white shadow-lg shadow-emerald-700/20" : "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20")}>
            <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 mb-1 sm:mb-2 opacity-90" />
            <div className="text-sm sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">${stats.totalPnL.toFixed(2)}</div>
            <div className="text-[8px] sm:text-xs tracking-widest opacity-80">GESAMT P&L</div>
          </div>
          <div className={cn("border-2 rounded-lg sm:rounded-xl p-2 sm:p-4 transition-all hover:scale-105", theme.border, theme.bgSecondary)}>
            <ArrowUpRight className="w-3 h-3 sm:w-5 sm:h-5 mb-1 sm:mb-2 text-emerald-700" />
            <div className="text-sm sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1 text-emerald-700">${stats.totalWins.toFixed(2)}</div>
            <div className={`text-[8px] sm:text-xs tracking-widest ${theme.textMuted}`}>GEWINNE</div>
          </div>
          <div className={cn("border-2 rounded-lg sm:rounded-xl p-2 sm:p-4 transition-all hover:scale-105", theme.border, theme.bgSecondary)}>
            <ArrowDownRight className="w-3 h-3 sm:w-5 sm:h-5 mb-1 sm:mb-2 text-rose-600" />
            <div className="text-sm sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1 text-rose-600">${stats.totalLosses.toFixed(2)}</div>
            <div className={`text-[8px] sm:text-xs tracking-widest ${theme.textMuted}`}>VERLUSTE</div>
          </div>
          <div className={cn("border-2 rounded-lg sm:rounded-xl p-2 sm:p-4 transition-all hover:scale-105", theme.border, theme.bgSecondary)}>
            <Award className={`w-3 h-3 sm:w-5 sm:h-5 mb-1 sm:mb-2 ${theme.text}`} />
            <div className={`text-sm sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1 ${theme.text}`}>{stats.winRate}%</div>
            <div className={`text-[8px] sm:text-xs tracking-widest ${theme.textMuted}`}>WINRATE</div>
          </div>
          <div className={cn("border-2 rounded-lg sm:rounded-xl p-2 sm:p-4 transition-all hover:scale-105", theme.border, theme.bgSecondary)}>
            <Target className={`w-3 h-3 sm:w-5 sm:h-5 mb-1 sm:mb-2 ${theme.text}`} />
            <div className={`text-sm sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1 ${theme.text}`}>{stats.profitFactor}</div>
            <div className={`text-[8px] sm:text-xs tracking-widest ${theme.textMuted}`}>PROFIT FAKTOR</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
          {/* Trades List */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1, delay: 0.3 }}
            className={`border-2 ${theme.border} rounded-lg sm:rounded-2xl ${theme.bgSecondary} overflow-hidden shadow-lg`}>
              <div className={`p-2 sm:p-4 md:p-5 border-b ${theme.border}`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <h3 className={`text-xs sm:text-base md:text-lg tracking-widest ${theme.text}`}>{t('allTrades')}</h3>
                    {selectedTrades.length > 0 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-700 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold">
                        <CheckSquare className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        {selectedTrades.length}
                      </motion.div>
                    )}
                  </div>
                  {filteredTrades.length > 0 &&
                  <button
                    onClick={toggleSelectAll}
                    className={cn("flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs border-2 transition-all font-bold",
                    selectedTrades.length === filteredTrades.length ?
                    "bg-emerald-700 text-white border-emerald-700" :
                    darkMode ? "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700" : "border-zinc-300 text-zinc-600 hover:text-black hover:border-zinc-400")}>
                      <CheckSquare className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">{selectedTrades.length === filteredTrades.length ? 'Alle abwählen' : 'Alle auswählen'}</span>
                      <span className="sm:hidden">{selectedTrades.length === filteredTrades.length ? 'Abw.' : 'Alle'}</span>
                    </button>
                  }
                </div>

                {/* Search & Sort Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="relative">
                    <Search className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 ${theme.textMuted}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Suche..."
                      className={cn("w-full pl-7 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 transition-all text-xs sm:text-sm font-mono",
                        theme.border,
                        searchQuery ? "ring-2 ring-emerald-700/30" : "",
                        darkMode ? 'bg-zinc-900/50 text-white placeholder:text-zinc-600' : 'bg-white text-black placeholder:text-zinc-400')}
                    />
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <ArrowUpDown className={`w-3 h-3 sm:w-4 sm:h-4 ${theme.textSecondary}`} />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={cn("flex-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 font-bold transition-all",
                        theme.border,
                        darkMode ? 'bg-zinc-900/50 text-white' : 'bg-white text-black')}
                    >
                      <option value="date-desc">Neueste</option>
                      <option value="date-asc">Älteste</option>
                      <option value="pnl-desc">+ Gewinn</option>
                      <option value="pnl-asc">- Verlust</option>
                      <option value="pair-asc">A-Z</option>
                      <option value="pair-desc">Z-A</option>
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

              <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'} max-h-[450px] sm:max-h-[550px] md:max-h-[600px] overflow-y-auto`}>
                  {filteredTrades.map((trade, idx) =>
                <motion.div 
                  key={trade.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={cn("p-2 sm:p-4 md:p-5 transition-all group relative cursor-pointer",
                  selectedTrades.includes(trade.id) && "ring-2 ring-inset ring-emerald-700 bg-emerald-700/5",
                  darkMode ? 'hover:bg-zinc-900/70' : 'hover:bg-zinc-200/70')}
                  onClick={() => navigate(createPageUrl('TradeDetail') + `?id=${trade.id}`)}>
                      <div className="flex items-center justify-between gap-1.5 sm:gap-3 mb-1.5 sm:mb-2.5">
                        <div className="flex items-center gap-1.5 sm:gap-3 flex-1">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTradeSelection(trade.id);
                            }}
                            className={cn("w-5 h-5 sm:w-7 sm:h-7 border-2 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer transition-all",
                            selectedTrades.includes(trade.id) ?
                            "bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-600 shadow-lg shadow-emerald-700/30" :
                            darkMode ? "border-zinc-700 hover:border-emerald-700/60 bg-zinc-900 hover:bg-zinc-800" : "border-zinc-300 hover:border-emerald-600/60 bg-white hover:bg-zinc-50")}>
                              <AnimatePresence>
                                {selectedTrades.includes(trade.id) && (
                                  <motion.div 
                                    initial={{ scale: 0, rotate: -180 }} 
                                    animate={{ scale: 1, rotate: 0 }} 
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ type: "spring", damping: 15 }}
                                  >
                                    <CheckSquare className="w-3 h-3 sm:w-4.5 sm:h-4.5 text-white" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          <div className={cn("w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg sm:rounded-xl border-2",
                      trade.outcome === 'win' ? 'bg-emerald-700 text-white border-emerald-700' :
                      trade.outcome === 'loss' ? 'bg-rose-600 text-white border-rose-600' :
                      trade.outcome === 'breakeven' ? 'bg-zinc-600 text-white border-zinc-600' :
                      trade.direction === 'long' ? 'border-2 border-emerald-700 text-emerald-700' : 'border-2 border-rose-600 text-rose-600')}>
                            {trade.outcome === 'win' && parseFloat(trade.actual_pnl || 0) > 0 || !trade.outcome && trade.direction === 'long' ?
                        <ArrowUpRight className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" /> : <ArrowDownRight className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm sm:text-lg md:text-xl font-bold tracking-wider ${theme.text} mb-0.5 truncate`}>{trade.pair || '-'}</div>
                            <div className={`text-[9px] sm:text-xs md:text-sm ${theme.textMuted}`}>{format(new Date(trade.trade_date || trade.created_date), 'dd.MM.yyyy')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2.5">
                          <div className="text-right">
                            {trade.outcome && trade.actual_pnl &&
                        <>
                                <div className={cn("text-xs sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5",
                          parseFloat(trade.actual_pnl) > 0 ? 'text-emerald-700' :
                          parseFloat(trade.actual_pnl) < 0 ? 'text-rose-600' : theme.text)}>
                                  {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                                </div>
                                <div className={cn("text-[8px] sm:text-[10px] md:text-xs tracking-wider px-1 sm:px-2 py-0.5 rounded-full whitespace-nowrap",
                          trade.outcome === 'win' ? 'bg-emerald-700/20 text-emerald-700' :
                          trade.outcome === 'loss' ? 'bg-rose-600/20 text-rose-600' : 'bg-zinc-600/20 text-zinc-400')}>
                                  {trade.outcome === 'win' ? t('win') : trade.outcome === 'loss' ? t('loss') : t('breakeven')}
                                </div>
                              </>
                        }
                            {!trade.outcome &&
                        <span className="px-1.5 sm:px-2.5 md:px-3 py-0.5 sm:py-1 bg-blue-500 text-white text-[8px] sm:text-[10px] md:text-xs tracking-wider rounded-full font-bold whitespace-nowrap">
                                {trade.status === 'ready_to_trade' ? t('readyToTradeShort') : t('pending')}
                              </span>
                        }
                          </div>
                          <div className="flex flex-col gap-0.5 sm:gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={(e) => handleEditTrade(e, trade)}
                        className={`p-1 sm:p-2 rounded-md sm:rounded-lg transition-colors ${darkMode ? 'hover:bg-emerald-700/20 text-teal-400 hover:text-teal-500' : 'hover:bg-teal-100 text-emerald-700 hover:text-teal-700'}`}>
                              <Edit className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button type="button" onClick={(e) => handleDeleteTrade(e, trade.id)}
                        className={`p-1 sm:p-2 rounded-md sm:rounded-lg transition-colors ${darkMode ? 'hover:bg-rose-600/20 text-rose-400 hover:text-rose-500' : 'hover:bg-red-100 text-red-600 hover:text-red-700'}`}>
                              <Trash2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className={cn("flex flex-wrap items-center gap-1 sm:gap-3 text-[8px] sm:text-[10px] mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t", theme.border)}>
                        <div className={cn("flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg", darkMode ? 'bg-zinc-900' : 'bg-zinc-100')}>
                          <Target className="w-2 h-2 sm:w-3 sm:h-3" />
                          <span className={theme.textMuted}><span className="hidden sm:inline">{t('avgScore')}: </span><span className={`font-bold ${theme.text}`}>{Math.round(trade.completion_percentage || 0)}%</span></span>
                        </div>
                        {trade.risk_percent && (
                          <div className={cn("flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg", darkMode ? 'bg-zinc-900' : 'bg-zinc-100')}>
                            <span className={theme.textMuted}><span className="hidden sm:inline">{t('risk')}: </span><span className={`font-bold ${theme.text}`}>{trade.risk_percent}%</span></span>
                          </div>
                        )}
                        {trade.entry_price && (
                          <div className={cn("flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg", darkMode ? 'bg-zinc-900' : 'bg-zinc-100')}>
                            <span className={theme.textMuted}><span className="hidden sm:inline">{t('entry')}: </span><span className={`font-bold ${theme.text}`}>{trade.entry_price}</span></span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                )}
                </div>
              }
            </motion.div>
          </div>

          {/* Gefilterte Statistiken */}
          <div className="space-y-3 sm:space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1, delay: 0.4 }}
            className={`border-2 ${theme.border} rounded-lg sm:rounded-2xl p-3 sm:p-5 ${theme.bgSecondary} shadow-lg`}>
              <h3 className={`text-xs sm:text-base tracking-widest mb-2 sm:mb-3 ${theme.text}`}>GEFILTERTE ERGEBNISSE</h3>
              <div className="space-y-2">
                <div className={cn("flex items-center justify-between p-2.5 rounded-lg border",
                  darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-300")}>
                  <span className={`text-[10px] sm:text-xs ${theme.textMuted}`}>Trades angezeigt</span>
                  <span className={`text-sm sm:text-base font-bold ${theme.text}`}>{filteredTrades.length}</span>
                </div>
                <div className={cn("flex items-center justify-between p-2.5 rounded-lg border",
                  darkMode ? "bg-emerald-700/10 border-emerald-700/30" : "bg-teal-50 border-teal-300")}>
                  <span className={`text-[10px] sm:text-xs ${theme.textMuted}`}>Gefilterte Wins</span>
                  <span className={`text-sm sm:text-base font-bold text-emerald-700`}>{filteredTrades.filter(t => t.outcome === 'win').length}</span>
                </div>
                <div className={cn("flex items-center justify-between p-2.5 rounded-lg border",
                  darkMode ? "bg-rose-600/10 border-rose-600/30" : "bg-rose-50 border-rose-300")}>
                  <span className={`text-[10px] sm:text-xs ${theme.textMuted}`}>Gefilterte Losses</span>
                  <span className={`text-sm sm:text-base font-bold text-rose-600`}>{filteredTrades.filter(t => t.outcome === 'loss').length}</span>
                </div>
                <div className={cn("flex items-center justify-between p-2.5 rounded-lg border",
                  darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-300")}>
                  <span className={`text-[10px] sm:text-xs ${theme.textMuted}`}>Gesamt P&L</span>
                  <span className={cn("text-sm sm:text-base font-bold",
                    filteredTrades.filter(t => t.actual_pnl).reduce((sum, t) => sum + parseFloat(t.actual_pnl), 0) >= 0 
                      ? 'text-emerald-700' : 'text-rose-600')}>
                    ${filteredTrades.filter(t => t.actual_pnl).reduce((sum, t) => sum + parseFloat(t.actual_pnl), 0).toFixed(2)}
                  </span>
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

        {selectedTrades.length === 2 &&
        <TradeCompareModal
          trade1={checklists.find((t) => t.id === selectedTrades[0])}
          trade2={checklists.find((t) => t.id === selectedTrades[1])}
          onClose={() => {
            setSelectedTrades([]);
            setShowBulkActions(false);
          }}
          darkMode={darkMode} />
        }
      </AnimatePresence>

      {/* Advanced Bulk Actions Bar */}
      <AnimatePresence>
        {showBulkActions && selectedTrades.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={cn("flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-2 shadow-2xl backdrop-blur-xl",
              darkMode ? "bg-zinc-900/95 border-zinc-700" : "bg-white/95 border-zinc-300")}>
              
              <Button
                onClick={handleBulkExportPDF}
                disabled={exporting}
                className={cn("h-7 sm:h-9 px-3 sm:px-5 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold flex items-center gap-1 sm:gap-2 border-2 transition-all",
                  darkMode ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-600" : "bg-zinc-100 border-zinc-300 text-black hover:bg-zinc-200 hover:border-zinc-400")}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Export ({selectedTrades.length})</span>
              </Button>

              {selectedTrades.length === 2 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Button
                    onClick={handleCompareSelected}
                    className="h-7 sm:h-9 px-3 sm:px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold flex items-center gap-1 sm:gap-2 shadow-lg shadow-blue-600/30"
                  >
                    <GitCompare className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Vergleichen</span>
                  </Button>
                </motion.div>
              )}

              <button
                onClick={() => {
                  setSelectedTrades([]);
                  setShowBulkActions(false);
                }}
                className={cn("p-1.5 sm:p-2 rounded-lg transition-colors",
                  darkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-200 text-zinc-600")}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>);

}