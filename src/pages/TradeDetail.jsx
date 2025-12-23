import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Home, Edit, Save, X, Upload, Trash2, Image as ImageIcon, FileText, TrendingUp, Target, Activity, ArrowUpRight, ArrowDownRight, Calendar, DollarSign, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import TradeShareCard from '@/components/advanced/TradeShareCard';
import LivePriceDisplay from '@/components/LivePriceDisplay';
import MarketChart from '@/components/MarketChart';

export default function TradeDetailPage() {
  const navigate = useNavigate();
  const { t, darkMode } = useLanguage();
  const [searchParams] = useSearchParams();
  const tradeId = searchParams.get('id');

  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editData, setEditData] = useState({
    outcome: 'pending',
    actual_pnl: '',
    exit_date: '',
    notes: ''
  });

  useEffect(() => {
    if (tradeId) loadTrade();
  }, [tradeId]);

  const loadTrade = async () => {
    try {
      const data = await base44.entities.TradeChecklist.filter({ id: tradeId });
      if (data.length > 0) {
        setTrade(data[0]);
        setEditData({
          outcome: data[0].outcome || 'pending',
          actual_pnl: data[0].actual_pnl || '',
          exit_date: data[0].exit_date || '',
          notes: data[0].notes || ''
        });
      }
    } catch (err) {
      console.error('Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = files.map((file) =>
      base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.file_url);

      const updatedScreenshots = [...(trade.screenshots || []), ...newUrls];
      await base44.entities.TradeChecklist.update(tradeId, { screenshots: updatedScreenshots });
      
      // Force reload across all pages
      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['checklists'] });
      }
      
      await loadTrade();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (url) => {
    try {
      const updatedScreenshots = (trade.screenshots || []).filter((s) => s !== url);
      await base44.entities.TradeChecklist.update(tradeId, { screenshots: updatedScreenshots });
      
      // Force reload across all pages
      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['checklists'] });
      }
      
      await loadTrade();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSaveOutcome = async () => {
    try {
      await base44.entities.TradeChecklist.update(tradeId, {
        outcome: editData.outcome,
        actual_pnl: editData.actual_pnl,
        exit_date: editData.exit_date,
        notes: editData.notes,
        status: editData.outcome !== 'pending' ? 'closed' : trade.status
      });
      
      // Force reload across all pages
      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['checklists'] });
      }
      
      await loadTrade();
      setEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200'
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full" />
      </div>);

  }

  if (!trade) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-xl mb-4">{t('tradeNotFound')}</p>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))} className={`border-2 font-bold ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>{t('backToDashboard')}</Button>
        </div>
      </div>);

  }

  const weeklyScore = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + (
  trade.w_candlestick ? 10 : 0) + (trade.w_psp_rejection ? 10 : 0) + (
  trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + (
  trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);

  const dailyScore = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + (
  trade.d_candlestick ? 10 : 0) + (trade.d_psp_rejection ? 10 : 0) + (
  trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + (
  trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);

  const h4Score = (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + (
  trade.h4_psp_rejection ? 5 : 0) + (trade.h4_swing ? 5 : 0) + (
  trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);

  const entryScore = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + (
  trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);

  const totalScore = weeklyScore + dailyScore + h4Score + entryScore;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Ultra Advanced Header with Gradient */}
      <header className={cn("sticky top-0 z-50 border-b-2 backdrop-blur-xl shadow-2xl",
        darkMode ? "bg-black/90 border-zinc-800/50" : "bg-white/90 border-zinc-200")}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(createPageUrl('TradeHistory'))} 
                className={cn("p-2 rounded-xl border-2 transition-all",
                  darkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white" 
                           : "bg-zinc-100 border-zinc-300 hover:border-zinc-400 text-zinc-600 hover:text-zinc-900")}>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img
                src={darkMode ?
                "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png" :
                "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV"
                className="h-10 sm:h-12 md:h-14 w-auto" />
            </button>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate(createPageUrl('Checklist') + `?id=${tradeId}`)} 
              className={cn("flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm border-2 shadow-lg transition-all",
                darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800')}>
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('edit')}</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Ultra Advanced Hero Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className={cn("relative rounded-3xl p-6 sm:p-8 mb-6 overflow-hidden border-2 shadow-2xl",
            trade.direction === 'long' 
              ? darkMode ? "bg-gradient-to-br from-teal-950 via-emerald-950 to-black border-teal-600/30" 
                        : "bg-gradient-to-br from-teal-50 via-emerald-50 to-white border-teal-400"
              : darkMode ? "bg-gradient-to-br from-rose-950 via-red-950 to-black border-rose-600/30"
                        : "bg-gradient-to-br from-rose-50 via-red-50 to-white border-rose-400")}>
          
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl animate-pulse",
              trade.direction === 'long' ? "bg-teal-600" : "bg-rose-600")} style={{ animationDuration: '4s' }} />
            <div className={cn("absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl animate-pulse",
              trade.direction === 'long' ? "bg-emerald-600" : "bg-red-600")} style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-2",
                    trade.direction === 'long' 
                      ? "bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-500/50" 
                      : "bg-gradient-to-br from-rose-600 to-red-600 border-rose-500/50")}>
                    {trade.direction === 'long' ? <ArrowUpRight className="w-6 h-6 text-white" /> : <ArrowDownRight className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider">{trade.pair}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className={cn("w-3.5 h-3.5", theme.textSecondary)} />
                      <p className={`${theme.textSecondary} text-xs sm:text-sm font-mono`}>
                        {trade.trade_date ? format(new Date(trade.trade_date), 'dd.MM.yyyy') : format(new Date(trade.created_date), 'dd.MM.yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={cn("px-5 py-3 rounded-2xl font-black text-lg sm:text-2xl border-2 shadow-xl whitespace-nowrap",
                trade.direction === 'long' 
                  ? "bg-teal-600 border-teal-500 text-white" 
                  : "bg-rose-600 border-rose-500 text-white")}>
                {trade.direction === 'long' ? 'LONG' : 'SHORT'}
              </div>
            </div>

            {/* Quick Stats in Hero */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Score', value: `${totalScore}%`, icon: Target },
                { label: t('entry'), value: trade.entry_price || '-', icon: Activity },
                { label: 'SL', value: trade.stop_loss || '-', icon: Shield },
                { label: 'TP', value: trade.take_profit || '-', icon: TrendingUp }
              ].map((stat) => (
                <div key={stat.label} className={cn("p-3 rounded-xl border-2 text-center backdrop-blur-sm",
                  darkMode ? "bg-zinc-900/60 border-zinc-800/50" : "bg-white/60 border-zinc-200")}>
                  <stat.icon className={cn("w-4 h-4 mx-auto mb-1", theme.textSecondary)} />
                  <div className={`text-[10px] ${theme.textSecondary} tracking-wider mb-0.5`}>{stat.label}</div>
                  <div className={`text-sm sm:text-base font-black ${theme.text}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Live Market Data - Ultra Advanced */}
        <div className="grid gap-4 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <LivePriceDisplay pair={trade.pair} darkMode={darkMode} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <MarketChart pair={trade.pair} darkMode={darkMode} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Left Column - Screenshots */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
            {/* Screenshots Section - Ultra Advanced */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}
              className={cn("relative rounded-3xl p-5 sm:p-6 overflow-hidden border-2 shadow-xl",
                darkMode ? "bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800/50" : "bg-gradient-to-br from-zinc-50 to-white border-zinc-300")}>
              
              <div className="flex items-center justify-between mb-5 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                    darkMode ? "bg-gradient-to-br from-zinc-800 to-zinc-900" : "bg-gradient-to-br from-zinc-100 to-zinc-200")}>
                    <ImageIcon className={cn("w-5 h-5", theme.text)} />
                  </div>
                  <h2 className="text-base sm:text-lg tracking-widest font-bold">{t('screenshots')}</h2>
                </div>
                <motion.label whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all text-xs sm:text-sm font-bold shadow-lg",
                    darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800',
                    uploading && 'opacity-50 cursor-not-allowed')}>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  <Upload className="w-4 h-4" />
                  {uploading ? t('uploading') : t('uploadCharts')}
                </motion.label>
              </div>
              
              {trade.screenshots && trade.screenshots.length > 0 ?
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {trade.screenshots.map((url, index) =>
                    <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="relative group overflow-hidden rounded-2xl">
                      <img src={url} alt={`Screenshot ${index + 1}`} 
                        className={cn("w-full h-40 sm:h-48 md:h-56 object-cover transition-transform group-hover:scale-110 border-2",
                          darkMode ? "border-zinc-800" : "border-zinc-300")} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteImage(url)}
                        className="absolute top-2 right-2 p-2 bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  )}
                </div> :
                <div className={cn("border-2 border-dashed rounded-2xl p-12 text-center",
                  darkMode ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-300 bg-zinc-100/30")}>
                  <ImageIcon className={cn("w-16 h-16 mx-auto mb-3", theme.textSecondary)} />
                  <p className={`${theme.textSecondary} text-sm`}>{t('noScreenshots')}</p>
                </div>
              }
            </motion.div>

            {/* Trade Outcome - Ultra Advanced mit Entry */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}
              className={cn("relative rounded-3xl p-5 sm:p-6 overflow-hidden border-2 shadow-xl",
                trade.outcome === 'win' 
                  ? darkMode ? "bg-gradient-to-br from-teal-950 via-emerald-950 to-black border-teal-600/30" : "bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-400"
                  : trade.outcome === 'loss'
                  ? darkMode ? "bg-gradient-to-br from-rose-950 via-red-950 to-black border-rose-600/30" : "bg-gradient-to-br from-rose-50 to-red-50 border-rose-400"
                  : darkMode ? "bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800/50" : "bg-gradient-to-br from-zinc-50 to-white border-zinc-300")}>
              
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className={cn("absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl animate-pulse",
                  trade.outcome === 'win' ? "bg-teal-600" : trade.outcome === 'loss' ? "bg-rose-600" : "bg-zinc-600")} 
                  style={{ animationDuration: '3s' }} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                      trade.outcome === 'win' ? "bg-gradient-to-br from-teal-600 to-emerald-600" 
                        : trade.outcome === 'loss' ? "bg-gradient-to-br from-rose-600 to-red-600"
                        : darkMode ? "bg-zinc-800" : "bg-zinc-200")}>
                      <TrendingUp className={cn("w-5 h-5", trade.outcome === 'win' || trade.outcome === 'loss' ? "text-white" : theme.text)} />
                    </div>
                    <h2 className="text-base sm:text-lg tracking-widest font-bold">{t('result')}</h2>
                  </div>
                  {!editing &&
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setEditing(true)} 
                      className={cn("flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 shadow-lg transition-all",
                        darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800')}>
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{t('edit')}</span>
                    </motion.button>
                  }
                </div>

                {editing ?
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className={`block text-xs sm:text-sm ${theme.textSecondary} mb-2 tracking-wider font-bold`}>{t('result')}</label>
                      <Select value={editData.outcome} onValueChange={(v) => setEditData({ ...editData, outcome: v })}>
                        <SelectTrigger className={cn("h-11 rounded-xl border-2", theme.border)}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t('pending')}</SelectItem>
                          <SelectItem value="win">{t('win')}</SelectItem>
                          <SelectItem value="loss">{t('loss')}</SelectItem>
                          <SelectItem value="breakeven">{t('breakeven')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className={`block text-xs sm:text-sm ${theme.textSecondary} mb-2 tracking-wider font-bold`}>{t('pnl')} ($)</label>
                      <Input type="number" step="0.01" value={editData.actual_pnl}
                        onChange={(e) => setEditData({ ...editData, actual_pnl: e.target.value })}
                        placeholder="z.B. 250.50"
                        className={cn("h-11 rounded-xl border-2 font-mono", theme.border)} />
                    </div>

                    <div>
                      <label className={`block text-xs sm:text-sm ${theme.textSecondary} mb-2 tracking-wider font-bold`}>{t('date')}</label>
                      <Input type="date" value={editData.exit_date}
                        onChange={(e) => setEditData({ ...editData, exit_date: e.target.value })}
                        className={cn("h-11 rounded-xl border-2 font-mono", theme.border)} />
                    </div>

                    <div>
                      <label className={`block text-xs sm:text-sm ${theme.textSecondary} mb-2 tracking-wider font-bold`}>{t('notes')}</label>
                      <Textarea value={editData.notes}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        placeholder={t('tradeNotes')}
                        className={cn("min-h-[100px] rounded-xl border-2 text-sm", theme.border)} />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleSaveOutcome}
                        className={cn("flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold border-2 shadow-lg",
                          darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800')}>
                        <Save className="w-4 h-4" />
                        {t('save')}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setEditing(false)}
                        className={cn("px-4 h-11 rounded-xl border-2 transition-all",
                          darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-200 border-zinc-300 hover:bg-zinc-300")}>
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div> :
                  
                  <div className="space-y-3">
                    {/* Status Badge - Groß und prominent */}
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}
                      className={cn("p-5 rounded-2xl border-2 text-center shadow-xl",
                        trade.outcome === 'win' ? 'bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-500/50 text-white' :
                        trade.outcome === 'loss' ? 'bg-gradient-to-br from-rose-600 to-red-600 border-rose-500/50 text-white' :
                        trade.outcome === 'breakeven' ? 'bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-400/50 text-white' :
                        darkMode ? 'bg-zinc-800/80 border-zinc-700' : 'bg-zinc-100 border-zinc-300')}>
                      <div className="text-xs tracking-widest mb-1 opacity-90">{t('status')}</div>
                      <div className="text-2xl sm:text-3xl font-black tracking-wide">{
                        trade.outcome === 'win' ? t('win') :
                        trade.outcome === 'loss' ? t('loss') :
                        trade.outcome === 'breakeven' ? t('breakeven') :
                        t('pending')
                      }</div>
                    </motion.div>

                    {/* Entry Details Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: t('entry'), value: trade.entry_price, color: theme.text },
                        { label: 'SL', value: trade.stop_loss, color: 'text-rose-600' },
                        { label: 'TP', value: trade.take_profit, color: 'text-teal-600' }
                      ].map((item) => (
                        <div key={item.label} className={cn("p-3 rounded-xl border-2 text-center backdrop-blur-sm",
                          darkMode ? "bg-zinc-900/60 border-zinc-800/50" : "bg-white/60 border-zinc-200")}>
                          <div className={`text-[10px] ${theme.textSecondary} tracking-wider mb-1`}>{item.label}</div>
                          <div className={cn("text-sm font-black font-mono", item.color)}>{item.value || '-'}</div>
                        </div>
                      ))}
                    </div>

                    {/* P&L - Groß und auffällig */}
                    {trade.actual_pnl &&
                      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}
                        className={cn("p-5 rounded-2xl border-2 text-center shadow-xl",
                          darkMode ? "bg-zinc-900/80 border-zinc-800/50" : "bg-white/80 border-zinc-200")}>
                        <div className={`text-xs ${theme.textSecondary} tracking-widest mb-1`}>{t('pnl')}</div>
                        <div className={cn("text-3xl sm:text-4xl font-black",
                          parseFloat(trade.actual_pnl) > 0 ? 'text-teal-600' :
                          parseFloat(trade.actual_pnl) < 0 ? 'text-rose-600' : theme.text)}>
                          {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                        </div>
                      </motion.div>
                    }

                    {/* Exit Date */}
                    {trade.exit_date &&
                      <div className={cn("p-3 rounded-xl border-2 flex items-center justify-between",
                        darkMode ? "bg-zinc-900/60 border-zinc-800/50" : "bg-white/60 border-zinc-200")}>
                        <span className={`${theme.textSecondary} text-xs flex items-center gap-1.5`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {t('exit')}
                        </span>
                        <span className={`${theme.text} text-xs font-mono font-bold`}>{format(new Date(trade.exit_date), 'dd.MM.yyyy')}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </motion.div>
          </div>

          {/* Right Column - Trade Details */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Score Summary - Ultra Advanced */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 }}
              className={cn("relative rounded-3xl p-6 text-center overflow-hidden border-2 shadow-xl",
                totalScore >= 85 
                  ? darkMode ? "bg-gradient-to-br from-teal-950 via-emerald-950 to-black border-teal-600/30" : "bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-400"
                  : darkMode ? "bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800/50" : "bg-gradient-to-br from-zinc-50 to-white border-zinc-300")}>
              
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl animate-pulse",
                  totalScore >= 85 ? "bg-teal-600" : "bg-zinc-600")} style={{ animationDuration: '4s' }} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shadow-xl border-2",
                    totalScore >= 85 ? "bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-500/50" 
                                    : darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-200 border-zinc-300")}>
                    <Target className={cn("w-5 h-5", totalScore >= 85 ? "text-white" : theme.text)} />
                  </div>
                </div>

                <div className={cn("text-6xl font-black mb-2",
                  totalScore >= 85 ? 'bg-gradient-to-br from-teal-600 to-emerald-600 bg-clip-text text-transparent' : theme.text)}>
                  {totalScore}%
                </div>
                <div className={`text-xs ${theme.textSecondary} tracking-widest mb-5 font-bold`}>{t('avgScore')}</div>
                
                <div className="space-y-2.5">
                  {[
                    { label: 'Weekly', value: weeklyScore, max: 60 },
                    { label: 'Daily', value: dailyScore, max: 60 },
                    { label: '4H', value: h4Score, max: 35 },
                    { label: 'Entry', value: entryScore, max: 25 }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={theme.textSecondary}>{item.label}</span>
                        <span className={cn("font-bold", theme.text)}>{item.value}/{item.max}</span>
                      </div>
                      <div className={cn("h-2 rounded-full overflow-hidden",
                        darkMode ? "bg-zinc-800" : "bg-zinc-200")}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / item.max) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={cn("h-full rounded-full",
                            item.value / item.max >= 0.8 ? "bg-gradient-to-r from-teal-600 to-emerald-600" : "bg-gradient-to-r from-zinc-500 to-zinc-600")} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Trade Setup - Ultra Advanced */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.6 }}
              className={cn("relative rounded-3xl p-5 overflow-hidden border-2 shadow-xl",
                darkMode ? "bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800/50" : "bg-gradient-to-br from-zinc-50 to-white border-zinc-300")}>
              
              <div className="flex items-center gap-2.5 mb-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shadow-lg",
                  darkMode ? "bg-zinc-800" : "bg-zinc-200")}>
                  <Activity className={cn("w-5 h-5", theme.text)} />
                </div>
                <h3 className="text-base tracking-widest font-bold">{t('setup')}</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: t('entry'), value: trade.entry_price, icon: Activity, color: theme.text },
                  { label: 'SL', value: trade.stop_loss, icon: Shield, color: 'text-rose-600' },
                  { label: 'TP', value: trade.take_profit, icon: TrendingUp, color: 'text-teal-600' },
                  { label: t('account'), value: trade.account_size ? `$${trade.account_size}` : null, icon: DollarSign, color: theme.text },
                  { label: t('risk'), value: trade.risk_percent ? `${trade.risk_percent}%` : null, icon: Target, color: theme.text },
                  { label: t('leverage'), value: trade.leverage ? `1:${trade.leverage}` : null, icon: TrendingUp, color: theme.text }
                ].filter(item => item.value).map((item) => (
                  <motion.div key={item.label} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}
                    className={cn("p-3 rounded-xl border-2 flex items-center justify-between group",
                      darkMode ? "bg-zinc-900/60 border-zinc-800/50 hover:border-zinc-700" : "bg-white/60 border-zinc-200 hover:border-zinc-300")}>
                    <div className="flex items-center gap-2">
                      <item.icon className={cn("w-4 h-4", theme.textSecondary)} />
                      <span className={`${theme.textSecondary} text-xs`}>{item.label}</span>
                    </div>
                    <span className={cn("text-sm font-black font-mono", item.color)}>{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Notes - Ultra Advanced */}
            {trade.notes && !editing &&
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.7 }}
                className={cn("relative rounded-3xl p-5 overflow-hidden border-2 shadow-xl",
                  darkMode ? "bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800/50" : "bg-gradient-to-br from-zinc-50 to-white border-zinc-300")}>
                
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shadow-lg",
                    darkMode ? "bg-zinc-800" : "bg-zinc-200")}>
                    <FileText className={cn("w-5 h-5", theme.text)} />
                  </div>
                  <h3 className="text-base tracking-widest font-bold">{t('notes')}</h3>
                </div>
                
                <div className={cn("p-4 rounded-xl border-2",
                  darkMode ? "bg-zinc-900/60 border-zinc-800/50" : "bg-white/60 border-zinc-200")}>
                  <p className={`text-sm ${theme.text} leading-relaxed font-sans whitespace-pre-wrap`}>{trade.notes}</p>
                </div>
              </motion.div>
            }

            {/* Share Card - Ultra Advanced */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.8 }}>
              <TradeShareCard trade={trade} darkMode={darkMode} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>);

}