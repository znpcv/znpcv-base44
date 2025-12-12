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
    (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + 
    (trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);
  
  const dailyScore = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + 
    (trade.d_candlestick ? 10 : 0) + (trade.d_psp_rejection ? 10 : 0) + 
    (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 10 : 0) + 
    (trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);
  
  const h4Score = (trade.h4_ema_touch ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + 
    (trade.h4_psp_rejection ? 5 : 0) + (trade.h4_swing ? 5 : 0) + 
    (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);
  
  const entryScore = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + 
    (trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);

  const totalScore = weeklyScore + dailyScore + h4Score + entryScore;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Trade Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Screenshots */}
          <div className="lg:col-span-2 space-y-6">
            {/* Screenshots Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-2xl p-6 ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  SCREENSHOTS
                </h2>
                <label className={`px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                  darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  <Upload className="w-4 h-4 inline mr-2" />
                  {uploading ? 'HOCHLADEN...' : 'HOCHLADEN'}
                </label>
              </div>
              
              {trade.screenshots && trade.screenshots.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {trade.screenshots.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-48 object-cover rounded-xl border-2 border-zinc-800" />
                      <button onClick={() => handleDeleteImage(url)}
                        className="absolute top-2 right-2 p-2 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`border-2 border-dashed ${theme.border} rounded-xl p-12 text-center`}>
                  <ImageIcon className={`w-12 h-12 mx-auto mb-3 ${theme.textSecondary}`} />
                  <p className={theme.textSecondary}>Keine Screenshots hochgeladen</p>
                </div>
              )}
            </motion.div>

            {/* Trade Outcome */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-2xl p-6 ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl tracking-widest">TRADE ERGEBNIS</h2>
                {!editing && (
                  <Button onClick={() => setEditing(true)} variant="outline" className={theme.border}>
                    <Edit className="w-4 h-4 mr-2" />
                    BEARBEITEN
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm ${theme.textSecondary} mb-2`}>ERGEBNIS</label>
                    <Select value={editData.outcome} onValueChange={(v) => setEditData({...editData, outcome: v})}>
                      <SelectTrigger className={theme.border}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Ausstehend</SelectItem>
                        <SelectItem value="win">Gewinn</SelectItem>
                        <SelectItem value="loss">Verlust</SelectItem>
                        <SelectItem value="breakeven">Breakeven</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className={`block text-sm ${theme.textSecondary} mb-2`}>TATSÄCHLICHER P&L ($)</label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={editData.actual_pnl} 
                      onChange={(e) => setEditData({...editData, actual_pnl: e.target.value})}
                      placeholder="z.B. 250.50 oder -150.00"
                      className={theme.border}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm ${theme.textSecondary} mb-2`}>AUSSTIEGSDATUM</label>
                    <Input 
                      type="date"
                      value={editData.exit_date} 
                      onChange={(e) => setEditData({...editData, exit_date: e.target.value})}
                      className={theme.border}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm ${theme.textSecondary} mb-2`}>NOTIZEN</label>
                    <Textarea 
                      value={editData.notes} 
                      onChange={(e) => setEditData({...editData, notes: e.target.value})}
                      placeholder="Zusätzliche Notizen zum Trade..."
                      className={`${theme.border} min-h-[100px]`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveOutcome} className={`flex-1 ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                      <Save className="w-4 h-4 mr-2" />
                      SPEICHERN
                    </Button>
                    <Button onClick={() => setEditing(false)} variant="outline" className={theme.border}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                    trade.outcome === 'win' ? 'bg-teal-600 border-teal-500 text-white' :
                    trade.outcome === 'loss' ? 'bg-rose-600 border-rose-500 text-white' :
                    trade.outcome === 'breakeven' ? 'bg-amber-500 border-amber-400 text-white' :
                    `${theme.border} ${theme.bgCard}`
                  }`}>
                    <span className="tracking-wider">STATUS</span>
                    <span className="font-bold text-lg">{
                      trade.outcome === 'win' ? 'GEWINN' :
                      trade.outcome === 'loss' ? 'VERLUST' :
                      trade.outcome === 'breakeven' ? 'BREAKEVEN' :
                      'AUSSTEHEND'
                    }</span>
                  </div>

                  {trade.actual_pnl && (
                    <div className={`p-4 rounded-xl border-2 ${theme.border}`}>
                      <div className="flex items-center justify-between">
                        <span className={theme.textSecondary}>TATSÄCHLICHER P&L</span>
                        <span className={cn("text-2xl font-bold",
                          parseFloat(trade.actual_pnl) > 0 ? 'text-teal-600' :
                          parseFloat(trade.actual_pnl) < 0 ? 'text-rose-600' : theme.text)}>
                          {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                        </span>
                      </div>
                    </div>
                  )}

                  {trade.exit_date && (
                    <div className={`p-4 rounded-xl border-2 ${theme.border}`}>
                      <div className="flex items-center justify-between">
                        <span className={theme.textSecondary}>AUSSTIEGSDATUM</span>
                        <span className={theme.text}>{format(new Date(trade.exit_date), 'dd.MM.yyyy')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Trade Details */}
          <div className="space-y-6">
            {/* Score Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-2xl p-6 ${theme.bgCard} text-center`}>
              <div className="text-5xl font-light mb-2">{totalScore}%</div>
              <div className={`text-sm ${theme.textSecondary} tracking-widest mb-4`}>GESAMT SCORE</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Weekly</span>
                  <span className={theme.text}>{weeklyScore}/60</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Daily</span>
                  <span className={theme.text}>{dailyScore}/60</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>4H</span>
                  <span className={theme.text}>{h4Score}/35</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Entry</span>
                  <span className={theme.text}>{entryScore}/25</span>
                </div>
              </div>
            </motion.div>

            {/* Trade Setup */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-2xl p-6 ${theme.bgCard}`}>
              <h3 className="text-lg tracking-widest mb-4">TRADE SETUP</h3>
              <div className="space-y-3">
                {trade.entry_price && (
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Entry</span>
                    <span className={theme.text}>{trade.entry_price}</span>
                  </div>
                )}
                {trade.stop_loss && (
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Stop Loss</span>
                    <span className="text-rose-600">{trade.stop_loss}</span>
                  </div>
                )}
                {trade.take_profit && (
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Take Profit</span>
                    <span className="text-teal-600">{trade.take_profit}</span>
                  </div>
                )}
                {trade.account_size && (
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Account Size</span>
                    <span className={theme.text}>${trade.account_size}</span>
                  </div>
                )}
                {trade.risk_percent && (
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Risiko</span>
                    <span className={theme.text}>{trade.risk_percent}%</span>
                  </div>
                )}
                {trade.leverage && (
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Hebel</span>
                    <span className={theme.text}>1:{trade.leverage}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Notes */}
            {trade.notes && !editing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`border-2 ${theme.border} rounded-2xl p-6 ${theme.bgCard}`}>
                <h3 className="text-lg tracking-widest mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  NOTIZEN
                </h3>
                <p className={`text-sm ${theme.text} leading-relaxed font-sans whitespace-pre-wrap`}>{trade.notes}</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}