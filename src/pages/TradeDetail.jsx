import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Home, Calendar, TrendingUp, TrendingDown, Target, DollarSign, Edit, Save, X, Upload, Trash2, Image as ImageIcon, FileText } from 'lucide-react';
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
  const { darkMode } = useLanguage();
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      
      const updatedScreenshots = [...(trade.screenshots || []), ...newUrls];
      await base44.entities.TradeChecklist.update(tradeId, { screenshots: updatedScreenshots });
      await loadTrade();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (url) => {
    const updatedScreenshots = (trade.screenshots || []).filter(s => s !== url);
    await base44.entities.TradeChecklist.update(tradeId, { screenshots: updatedScreenshots });
    await loadTrade();
  };

  const handleSaveOutcome = async () => {
    await base44.entities.TradeChecklist.update(tradeId, {
      outcome: editData.outcome,
      actual_pnl: editData.actual_pnl,
      exit_date: editData.exit_date,
      notes: editData.notes,
      status: editData.outcome !== 'pending' ? 'closed' : trade.status
    });
    await loadTrade();
    setEditing(false);
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-xl mb-4">Trade nicht gefunden</p>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))}>Zurück zum Dashboard</Button>
        </div>
      </div>
    );
  }

  const weeklyScore = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + 
    (trade.w_candlestick ? 10 : 0) + (trade.w_psp_rejection ? 10 : 0) + 
    (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 5 : 0) + 
    (trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);
  
  const dailyScore = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + 
    (trade.d_candlestick ? 10 : 0) + (trade.d_psp_rejection ? 10 : 0) + 
    (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + 
    (trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);
  
  const h4Score = (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + 
    (trade.h4_psp_rejection ? 5 : 0) + (trade.h4_swing ? 5 : 0) + 
    (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);
  
  const entryScore = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + 
    (trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);

  const totalScore = weeklyScore + dailyScore + h4Score + entryScore;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className={theme.textSecondary}>
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button onClick={() => navigate(createPageUrl('Home'))} className={theme.textSecondary}>
                <Home className="w-6 h-6" />
              </button>
            </div>
            <img 
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV" 
              className="h-10 w-auto"
            />
            <Button onClick={() => navigate(createPageUrl('Checklist') + `?id=${tradeId}`)} variant="outline" className={theme.border}>
              <Edit className="w-4 h-4 mr-2" />
              BEARBEITEN
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Trade Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl tracking-widest mb-2">{trade.pair}</h1>
              <p className={theme.textSecondary}>{format(new Date(trade.created_date), 'dd.MM.yyyy HH:mm')}</p>
            </div>
            <div className={cn("px-6 py-3 rounded-xl text-2xl font-bold",
              trade.direction === 'long' ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white')}>
              {trade.direction === 'long' ? '↑ LONG' : '↓ SHORT'}
            </div>
          </div>
        </motion.div>

        {/* Live Market Data */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <LivePriceDisplay pair={trade.pair} darkMode={darkMode} />
          <MarketChart pair={trade.pair} darkMode={darkMode} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">