import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Home, Edit, Save, X, Upload, Trash2, Image as ImageIcon, FileText } from 'lucide-react';
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
          <p className="text-xl mb-4">{t('tradeNotFound')}</p>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))} className={`border-2 font-bold ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>{t('backToDashboard')}</Button>
        </div>
      </div>
    );
  }

  const weeklyScore = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + 
    (trade.w_candlestick ? 10 : 0) + (trade.w_psp_rejection ? 10 : 0) + 
    (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + 
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
            <Button onClick={() => navigate(createPageUrl('Checklist') + `?id=${tradeId}`)} className={`gap-1 sm:gap-2 h-8 sm:h-9 md:h-10 px-3 sm:px-4 text-xs sm:text-sm font-bold border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('edit')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Trade Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-widest mb-1 sm:mb-2 truncate">{trade.pair}</h1>
              <p className={`${theme.textSecondary} text-xs sm:text-sm`}>{format(new Date(trade.created_date), 'dd.MM.yyyy HH:mm')}</p>
            </div>
            <div className={cn("px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl text-sm sm:text-xl md:text-2xl font-bold whitespace-nowrap flex-shrink-0",
              trade.direction === 'long' ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white')}>
              {trade.direction === 'long' ? '↑ LONG' : '↓ SHORT'}
            </div>
          </div>
        </motion.div>

        {/* Live Market Data */}
        <div className="grid gap-3 sm:gap-4 mb-4 sm:mb-6">
          <LivePriceDisplay pair={trade.pair} darkMode={darkMode} />
          <MarketChart pair={trade.pair} darkMode={darkMode} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Left Column - Screenshots */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
            {/* Screenshots Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <h2 className="text-sm sm:text-lg md:text-xl tracking-widest flex items-center gap-1.5 sm:gap-2">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">{t('screenshots')}</span>
                  <span className="xs:hidden">{t('screenshots')}</span>
                </h2>
                <label className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all text-xs sm:text-sm font-bold ${
                  darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  {uploading ? t('uploading') : t('uploadCharts')}
                </label>
              </div>
              
              {trade.screenshots && trade.screenshots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  {trade.screenshots.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Screenshot ${index + 1}`} className={`w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg sm:rounded-xl border-2 ${theme.border}`} />
                      <button onClick={() => handleDeleteImage(url)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 md:p-2 bg-rose-600 text-white rounded-md sm:rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`border-2 border-dashed ${theme.border} rounded-lg sm:rounded-xl p-6 sm:p-8 md:p-12 text-center`}>
                  <ImageIcon className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 ${theme.textSecondary}`} />
                  <p className={`${theme.textSecondary} text-xs sm:text-sm`}>{t('noScreenshots')}</p>
                </div>
              )}
            </motion.div>

            {/* Trade Outcome */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <h2 className="text-sm sm:text-lg md:text-xl tracking-widest">{t('result')}</h2>
                {!editing && (
                  <Button onClick={() => setEditing(true)} className={`gap-1 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-bold border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t('edit')}</span>
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className={`block text-xs sm:text-sm ${theme.textSecondary} mb-1.5 sm:mb-2 tracking-wider`}>{t('result')}</label>
                    <Select value={editData.outcome} onValueChange={(v) => setEditData({...editData, outcome: v})}>
                      <SelectTrigger className={theme.border}>
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
                    <label className={`block text-xs sm:text-sm ${theme.textSecondary} mb-1.5 sm:mb-2 tracking-wider`}>{t('pnl')} ($)</label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={editData.actual_pnl} 
                      onChange={(e) => setEditData({...editData, actual_pnl: e.target.value})}
                      placeholder="z.B. 250.50"
                      className={`${theme.border} h-10 sm:h-11`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs sm:text-sm ${theme.textSecondary} mb-1.5 sm:mb-2 tracking-wider`}>{t('date')}</label>
                    <Input 
                      type="date"
                      value={editData.exit_date} 
                      onChange={(e) => setEditData({...editData, exit_date: e.target.value})}
                      className={`${theme.border} h-10 sm:h-11`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs sm:text-sm ${theme.textSecondary} mb-1.5 sm:mb-2 tracking-wider`}>{t('notes')}</label>
                    <Textarea 
                      value={editData.notes} 
                      onChange={(e) => setEditData({...editData, notes: e.target.value})}
                      placeholder={t('tradeNotes')}
                      className={`${theme.border} min-h-[80px] sm:min-h-[100px] text-sm`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveOutcome} className={`flex-1 h-10 sm:h-11 text-xs sm:text-sm font-bold border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {t('save')}
                    </Button>
                    <Button onClick={() => setEditing(false)} variant="outline" className={`h-10 sm:h-11 border-2 ${theme.border}`}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <div className={`flex items-center justify-between p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border-2 ${
                    trade.outcome === 'win' ? 'bg-teal-600 border-teal-500 text-white' :
                    trade.outcome === 'loss' ? 'bg-rose-600 border-rose-500 text-white' :
                    trade.outcome === 'breakeven' ? 'bg-amber-500 border-amber-400 text-white' :
                    `${theme.border} ${theme.bgCard}`
                  }`}>
                    <span className="tracking-wider text-xs sm:text-sm">{t('status')}</span>
                    <span className="font-bold text-sm sm:text-base md:text-lg">{
                      trade.outcome === 'win' ? t('win') :
                      trade.outcome === 'loss' ? t('loss') :
                      trade.outcome === 'breakeven' ? t('breakeven') :
                      t('pending')
                    }</span>
                  </div>

                  {trade.actual_pnl && (
                    <div className={`p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border-2 ${theme.border}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`${theme.textSecondary} text-xs sm:text-sm`}>{t('pnl')}</span>
                        <span className={cn("text-lg sm:text-xl md:text-2xl font-bold",
                          parseFloat(trade.actual_pnl) > 0 ? 'text-teal-600' :
                          parseFloat(trade.actual_pnl) < 0 ? 'text-rose-600' : theme.text)}>
                          {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                        </span>
                      </div>
                    </div>
                  )}

                  {trade.exit_date && (
                    <div className={`p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border-2 ${theme.border}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`${theme.textSecondary} text-xs sm:text-sm`}>{t('exit')}</span>
                        <span className={`${theme.text} text-xs sm:text-sm`}>{format(new Date(trade.exit_date), 'dd.MM.yyyy')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Trade Details */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Score Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 ${theme.bgCard} text-center`}>
              <div className="text-3xl sm:text-4xl md:text-5xl font-light mb-1 sm:mb-2">{totalScore}%</div>
              <div className={`text-xs sm:text-sm ${theme.textSecondary} tracking-widest mb-3 sm:mb-4`}>{t('avgScore')}</div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className={theme.textSecondary}>Weekly</span>
                  <span className={theme.text}>{weeklyScore}/60</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className={theme.textSecondary}>Daily</span>
                  <span className={theme.text}>{dailyScore}/60</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className={theme.textSecondary}>4H</span>
                  <span className={theme.text}>{h4Score}/35</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className={theme.textSecondary}>Entry</span>
                  <span className={theme.text}>{entryScore}/25</span>
                </div>
              </div>
            </motion.div>

            {/* Trade Setup */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 ${theme.bgCard}`}>
              <h3 className="text-sm sm:text-base md:text-lg tracking-widest mb-3 sm:mb-4">{t('setup')}</h3>
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                {trade.entry_price && (
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-xs sm:text-sm`}>{t('entry')}</span>
                    <span className={`${theme.text} text-xs sm:text-sm font-mono`}>{trade.entry_price}</span>
                  </div>
                )}
                {trade.stop_loss && (
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-xs sm:text-sm`}>{t('sl')}</span>
                    <span className="text-rose-600 text-xs sm:text-sm font-mono">{trade.stop_loss}</span>
                  </div>
                )}
                {trade.take_profit && (
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-xs sm:text-sm`}>{t('tp')}</span>
                    <span className="text-teal-600 text-xs sm:text-sm font-mono">{trade.take_profit}</span>
                  </div>
                )}
                {trade.account_size && (
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-xs sm:text-sm`}>{t('account')}</span>
                    <span className={`${theme.text} text-xs sm:text-sm font-mono`}>${trade.account_size}</span>
                  </div>
                )}
                {trade.risk_percent && (
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-xs sm:text-sm`}>{t('risk')}</span>
                    <span className={`${theme.text} text-xs sm:text-sm font-mono`}>{trade.risk_percent}%</span>
                  </div>
                )}
                {trade.leverage && (
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-xs sm:text-sm`}>{t('leverage')}</span>
                    <span className={`${theme.text} text-xs sm:text-sm font-mono`}>1:{trade.leverage}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Notes */}
            {trade.notes && !editing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 ${theme.bgCard}`}>
                <h3 className="text-sm sm:text-base md:text-lg tracking-widest mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('notes')}
                </h3>
                <p className={`text-xs sm:text-sm ${theme.text} leading-relaxed font-sans whitespace-pre-wrap`}>{trade.notes}</p>
              </motion.div>
            )}

            {/* Share Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <TradeShareCard trade={trade} darkMode={darkMode} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}