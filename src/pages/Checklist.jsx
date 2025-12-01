import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Check, ChevronRight, ChevronLeft, Home, ArrowUp, AlertTriangle, XOctagon, Calculator, TrendingUp, TrendingDown, Shield, Target, DollarSign, Percent } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import AssetSelector from '@/components/AssetSelector';
import { useLanguage, LanguageToggle } from '@/components/LanguageContext';
import TradingQuote from '@/components/TradingQuote';

const STEPS = ['pair', 'weekly_daily', 'h4', 'entry', 'risk', 'final'];

export default function ChecklistPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const checklistId = searchParams.get('id');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!checklistId);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const [checklist, setChecklist] = useState({
    pair: '',
    trade_date: format(new Date(), 'yyyy-MM-dd'),
    direction: '',
    
    // Weekly/Daily Checklist (max 50%)
    wd_at_aoi: false,           // 10%
    wd_ema_touch: false,        // 5%
    wd_candlestick: false,      // 10%
    wd_psp_rejection: false,    // 10%
    wd_round_level: false,      // 5%
    wd_pattern: '',             // 10%
    
    // 4H Checklist (max 30%)
    h4_ema_touch: false,        // 5%
    h4_candlestick: false,      // 10%
    h4_psp_rejection: false,    // 5%
    h4_pattern: '',             // 10%
    
    // Entry Checklist (max 25%)
    entry_sos: false,           // 10%
    entry_engulfing: false,     // 10%
    entry_pattern: '',          // 5%
    entry_type: '',
    
    // Risk Management
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    account_size: '',
    risk_percent: '1',
    
    // Final Rules
    confirms_rule: false,
    notes: '',
    status: 'in_progress',
    completion_percentage: 0
  });

  useEffect(() => {
    if (checklistId) loadChecklist();
  }, [checklistId]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadChecklist = async () => {
    const data = await base44.entities.TradeChecklist.filter({ id: checklistId });
    if (data.length > 0) setChecklist(prev => ({ ...prev, ...data[0] }));
    setIsLoading(false);
  };

  const update = (key, value) => setChecklist(prev => ({ ...prev, [key]: value }));
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Calculate scores
  const wdScore = (checklist.wd_at_aoi ? 10 : 0) + (checklist.wd_ema_touch ? 5 : 0) + 
    (checklist.wd_candlestick ? 10 : 0) + (checklist.wd_psp_rejection ? 10 : 0) + 
    (checklist.wd_round_level ? 5 : 0) + (checklist.wd_pattern && checklist.wd_pattern !== 'none' ? 10 : 0);
  
  const h4Score = (checklist.h4_ema_touch ? 5 : 0) + (checklist.h4_candlestick ? 10 : 0) + 
    (checklist.h4_psp_rejection ? 5 : 0) + (checklist.h4_pattern && checklist.h4_pattern !== 'none' ? 10 : 0);
  
  const entryScore = (checklist.entry_sos ? 10 : 0) + (checklist.entry_engulfing ? 10 : 0) + 
    (checklist.entry_pattern && checklist.entry_pattern !== 'none' ? 5 : 0);

  const progress = wdScore + h4Score + entryScore;

  // Risk calculations
  const calculateRisk = () => {
    const entry = parseFloat(checklist.entry_price) || 0;
    const sl = parseFloat(checklist.stop_loss) || 0;
    const tp = parseFloat(checklist.take_profit) || 0;
    const account = parseFloat(checklist.account_size) || 0;
    const riskPct = parseFloat(checklist.risk_percent) || 1;
    
    if (!entry || !sl || !tp) return null;
    
    const isLong = checklist.direction === 'long';
    const slDistance = isLong ? entry - sl : sl - entry;
    const tpDistance = isLong ? tp - entry : entry - tp;
    
    if (slDistance <= 0 || tpDistance <= 0) return null;
    
    const rr = tpDistance / slDistance;
    const riskAmount = account * (riskPct / 100);
    const slPips = Math.abs(entry - sl) * 10000;
    const tpPips = Math.abs(tp - entry) * 10000;
    
    return {
      rr: rr.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      slPips: slPips.toFixed(1),
      tpPips: tpPips.toFixed(1),
      potentialProfit: (riskAmount * rr).toFixed(2)
    };
  };

  const riskCalc = calculateRisk();

  const handleSave = async (force = false) => {
    if (progress < 85 && !force && currentStep === STEPS.length - 1) {
      setShowWarning(true);
      return;
    }
    
    setSaving(true);
    const data = { 
      ...checklist, 
      completion_percentage: progress, 
      status: progress >= 85 ? 'ready_to_trade' : 'in_progress'
    };
    
    if (checklistId) await base44.entities.TradeChecklist.update(checklistId, data);
    else await base44.entities.TradeChecklist.create(data);
    
    setSaving(false);
    navigate(createPageUrl('Dashboard'));
  };

  const handleDelete = async () => {
    if (checklistId) await base44.entities.TradeChecklist.delete(checklistId);
    navigate(createPageUrl('Dashboard'));
  };

  const getGrade = (p) => {
    if (p >= 100) return { grade: 'A+++', color: 'bg-emerald-500', border: 'border-emerald-500' };
    if (p >= 90) return { grade: 'A++', color: 'bg-emerald-400', border: 'border-emerald-400' };
    if (p >= 85) return { grade: 'A+', color: 'bg-blue-500', border: 'border-blue-500' };
    if (p >= 70) return { grade: 'OK', color: 'bg-yellow-500', border: 'border-yellow-500' };
    return { grade: 'NO TRADE', color: 'bg-red-500', border: 'border-red-500' };
  };
  
  const gradeInfo = getGrade(progress);
  const isReady = progress >= 85;

  const stepLabels = {
    pair: 'ASSET',
    weekly_daily: 'W / D',
    h4: '4H',
    entry: 'ENTRY',
    risk: 'RISK',
    final: 'FINAL'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-xl tracking-widest">LADEN...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-black border-b border-zinc-800/50 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(createPageUrl('Home'))} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-900">
                <Home className="w-5 h-5" />
              </button>
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" alt="ZNPCV" className="h-8 w-auto cursor-pointer hover:opacity-80 invert" />
            </button>

            <div className="flex items-center gap-2">
              <LanguageToggle />
              <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold", gradeInfo.color, 
                progress >= 85 ? "text-black" : "text-white")}>
                <span>{progress}%</span>
                <span className="text-xs opacity-80">{gradeInfo.grade}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-zinc-900">
          <motion.div className={cn("h-full", gradeInfo.color)} initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.5 }} />
        </div>
      </header>

      {/* Steps Navigation */}
      <div className="bg-zinc-950 border-b border-zinc-800/50 overflow-x-auto">
        <div className="max-w-3xl mx-auto px-4 py-2 flex gap-1">
          {STEPS.map((step, index) => (
            <button key={step} onClick={() => setCurrentStep(index)}
              className={cn("px-3 py-1.5 text-xs tracking-widest whitespace-nowrap transition-all rounded-lg flex-1",
                currentStep === index ? 'bg-white text-black font-bold' : 'text-zinc-600 hover:text-white hover:bg-zinc-900')}>
              {index + 1}. {stepLabels[step]}
            </button>
          ))}
        </div>
      </div>

      {/* Score Overview Bar */}
      <div className="bg-zinc-900/50 border-b border-zinc-800/30">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-zinc-500">W/D: <span className={wdScore > 0 ? "text-white font-bold" : "text-zinc-600"}>{wdScore}/50</span></span>
            <span className="text-zinc-500">4H: <span className={h4Score > 0 ? "text-white font-bold" : "text-zinc-600"}>{h4Score}/30</span></span>
            <span className="text-zinc-500">Entry: <span className={entryScore > 0 ? "text-white font-bold" : "text-zinc-600"}>{entryScore}/25</span></span>
          </div>
          <span className="text-zinc-400">MAX: 105%</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: Asset & Direction */}
          {currentStep === 0 && (
            <motion.div key="pair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="01" title="ASSET & RICHTUNG" subtitle="Wähle dein Handelspaar und die Trade-Richtung" />
              
              <AssetSelector selectedPair={checklist.pair} onSelect={(pair) => update('pair', pair)} />
              
              {checklist.pair && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  
                  {/* ZNPCV Rules Box */}
                  <div className="p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-white" />
                      <span className="text-white font-bold tracking-widest">ZNPCV GOLDENE REGELN</span>
                    </div>
                    <div className="space-y-3 text-sm font-sans">
                      <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-emerald-400 font-bold">LONG / KAUFEN:</span>
                          <span className="text-zinc-300 ml-2">Wir kaufen IM AOI oder ÜBER dem AOI (Support)</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <TrendingDown className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-red-400 font-bold">SHORT / VERKAUFEN:</span>
                          <span className="text-zinc-300 ml-2">Wir verkaufen IM AOI oder UNTER dem AOI (Resistance)</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                        <span className="text-white font-bold tracking-wider">⚠️ NIE AM BODEN VERKAUFEN! NIE AM TOP KAUFEN! ⚠️</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Direction Selection */}
                  <label className="text-zinc-500 text-sm tracking-widest block">WÄHLE DEINE RICHTUNG</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => update('direction', 'long')}
                      className={cn("p-6 border-2 rounded-2xl text-center transition-all",
                        checklist.direction === 'long' 
                          ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20" 
                          : "border-zinc-800 hover:border-emerald-500/50 bg-zinc-950 hover:bg-emerald-500/5")}>
                      <TrendingUp className={cn("w-12 h-12 mx-auto mb-3", checklist.direction === 'long' ? "text-white" : "text-emerald-500")} />
                      <div className={cn("text-xl tracking-wider font-bold", checklist.direction === 'long' ? "text-white" : "text-white")}>LONG</div>
                      <div className={cn("text-sm mt-1", checklist.direction === 'long' ? "text-emerald-100" : "text-zinc-500")}>
                        Kaufen im/über AOI
                      </div>
                    </button>
                    <button onClick={() => update('direction', 'short')}
                      className={cn("p-6 border-2 rounded-2xl text-center transition-all",
                        checklist.direction === 'short' 
                          ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" 
                          : "border-zinc-800 hover:border-red-500/50 bg-zinc-950 hover:bg-red-500/5")}>
                      <TrendingDown className={cn("w-12 h-12 mx-auto mb-3", checklist.direction === 'short' ? "text-white" : "text-red-500")} />
                      <div className={cn("text-xl tracking-wider font-bold", checklist.direction === 'short' ? "text-white" : "text-white")}>SHORT</div>
                      <div className={cn("text-sm mt-1", checklist.direction === 'short' ? "text-red-100" : "text-zinc-500")}>
                        Verkaufen im/unter AOI
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 1: Weekly/Daily */}
          {currentStep === 1 && (
            <motion.div key="weekly_daily" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <StepHeader number="02" title="WEEKLY / DAILY ANALYSE" subtitle="Higher Timeframe Confirmations (max 50%)" />
              
              {/* Info Box */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="text-xs text-zinc-500 tracking-widest mb-2">REJECTION CONFIRMATIONS REIHENFOLGE</div>
                <div className="flex items-center gap-2 text-white font-bold tracking-wider text-sm flex-wrap">
                  <span className="px-2 py-1 bg-zinc-800 rounded">AOI</span>
                  <span className="text-zinc-600">→</span>
                  <span className="px-2 py-1 bg-zinc-800 rounded">EMA</span>
                  <span className="text-zinc-600">→</span>
                  <span className="px-2 py-1 bg-zinc-800 rounded">PSP</span>
                  <span className="text-zinc-600">→</span>
                  <span className="px-2 py-1 bg-zinc-800 rounded">Candlestick</span>
                  <span className="text-zinc-600">→</span>
                  <span className="px-2 py-1 bg-zinc-800 rounded">RPN</span>
                </div>
              </div>

              {/* Current Score */}
              <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-zinc-500 text-sm">W/D SCORE</span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-2xl font-bold", wdScore >= 35 ? "text-emerald-500" : wdScore >= 20 ? "text-yellow-500" : "text-white")}>{wdScore}</span>
                  <span className="text-zinc-600">/50%</span>
                </div>
              </div>
              
              <ChecklistItem checked={checklist.wd_at_aoi} onChange={() => update('wd_at_aoi', !checklist.wd_at_aoi)} 
                label="AT AOI / REJECTED" score={10} 
                description="Preis befindet sich am Area of Interest und zeigt Ablehnung" />
              
              <ChecklistItem checked={checklist.wd_ema_touch} onChange={() => update('wd_ema_touch', !checklist.wd_ema_touch)} 
                label="EMA BERÜHRT / ABGELEHNT" score={5} 
                description="Preis berührt den EMA und wird abgelehnt (Touching/Rejecting)" />
              
              <ChecklistItem checked={checklist.wd_candlestick} onChange={() => update('wd_candlestick', !checklist.wd_candlestick)} 
                label="CANDLESTICK REJECTION" score={10} 
                description="Klare Ablehnungskerze sichtbar (Pinbar, Doji, Hammer, etc.)" />
              
              <ChecklistItem checked={checklist.wd_psp_rejection} onChange={() => update('wd_psp_rejection', !checklist.wd_psp_rejection)} 
                label="PSP REJECTION" score={10} 
                description="Rejection from Previous Structure Point (früheres Hoch/Tief)" />
              
              <ChecklistItem checked={checklist.wd_round_level} onChange={() => update('wd_round_level', !checklist.wd_round_level)} 
                label="ROUND PSYCH LEVEL (RPN)" score={5} 
                description="Preis an runder psychologischer Zahl (z.B. 1.1000, 1.0500)" />
              
              <PatternSelector 
                value={checklist.wd_pattern} 
                onChange={(v) => update('wd_pattern', v)} 
                score={10}
                label="CHART PATTERN (W/D)"
                description="Double Top/Bottom, Head & Shoulders, Inverse H&S"
              />
            </motion.div>
          )}

          {/* STEP 2: 4H */}
          {currentStep === 2 && (
            <motion.div key="h4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <StepHeader number="03" title="4H ANALYSE" subtitle="Lower Timeframe Confirmation (max 30%)" />
              
              {/* Current Score */}
              <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-zinc-500 text-sm">4H SCORE</span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-2xl font-bold", h4Score >= 20 ? "text-emerald-500" : h4Score >= 10 ? "text-yellow-500" : "text-white")}>{h4Score}</span>
                  <span className="text-zinc-600">/30%</span>
                </div>
              </div>
              
              <ChecklistItem checked={checklist.h4_ema_touch} onChange={() => update('h4_ema_touch', !checklist.h4_ema_touch)} 
                label="EMA BERÜHRT" score={5} 
                description="Preis berührt den EMA auf dem 4H Chart (Touching EMA)" />
              
              <ChecklistItem checked={checklist.h4_candlestick} onChange={() => update('h4_candlestick', !checklist.h4_candlestick)} 
                label="CANDLESTICK REJECTION" score={10} 
                description="Klare Ablehnungskerze auf dem 4H Timeframe sichtbar" />
              
              <ChecklistItem checked={checklist.h4_psp_rejection} onChange={() => update('h4_psp_rejection', !checklist.h4_psp_rejection)} 
                label="PSP REJECTION" score={5} 
                description="Rejection from Previous Structure Point auf 4H" />
              
              <PatternSelector 
                value={checklist.h4_pattern} 
                onChange={(v) => update('h4_pattern', v)} 
                score={10}
                label="CHART PATTERN (4H)"
                description="Patterns auf dem 4H Timeframe"
              />
            </motion.div>
          )}

          {/* STEP 3: Entry */}
          {currentStep === 3 && (
            <motion.div key="entry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <StepHeader number="04" title="ENTRY CHECKLIST" subtitle="Entry Confirmations (max 25%)" />
              
              {/* Timeframe Info */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-blue-400 font-bold tracking-wider text-sm">ENTRY TIMEFRAME</div>
                    <div className="text-zinc-400 text-sm">30 Minuten bis 1 Stunde (30min - 1H)</div>
                  </div>
                </div>
              </div>

              {/* Current Score */}
              <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-zinc-500 text-sm">ENTRY SCORE</span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-2xl font-bold", entryScore >= 20 ? "text-emerald-500" : entryScore >= 10 ? "text-yellow-500" : "text-white")}>{entryScore}</span>
                  <span className="text-zinc-600">/25%</span>
                </div>
              </div>
              
              <ChecklistItem checked={checklist.entry_sos} onChange={() => update('entry_sos', !checklist.entry_sos)} 
                label="SOS - SIGN OF STRENGTH" score={10} 
                description="Marktstrukturwechsel bestätigt (MSS/SOS usually on 30min)" />
              
              <ChecklistItem checked={checklist.entry_engulfing} onChange={() => update('entry_engulfing', !checklist.entry_engulfing)} 
                label="ENGULFING CANDLESTICK" score={10} 
                description="Engulfing Kerze nach Pullback sichtbar (Reversal Confirmation)" />
              
              <PatternSelector 
                value={checklist.entry_pattern} 
                onChange={(v) => update('entry_pattern', v)} 
                score={5}
                label="ENTRY PATTERN"
                description="Pattern auf Entry Timeframe"
              />
              
              {/* Entry Type */}
              <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950">
                <label className="text-zinc-500 text-sm tracking-widest mb-4 block">ENTRY TRIGGER TYP</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => update('entry_type', 'pinbar')}
                    className={cn("p-4 border-2 rounded-xl text-center transition-all",
                      checklist.entry_type === 'pinbar' 
                        ? "bg-white border-white text-black" 
                        : "border-zinc-800 hover:border-zinc-600 bg-zinc-900 text-white")}>
                    <div className="text-2xl mb-2">📍</div>
                    <div className="font-bold tracking-wider text-sm">PINBAR REJECTION</div>
                  </button>
                  <button onClick={() => update('entry_type', 'engulfing')}
                    className={cn("p-4 border-2 rounded-xl text-center transition-all",
                      checklist.entry_type === 'engulfing' 
                        ? "bg-white border-white text-black" 
                        : "border-zinc-800 hover:border-zinc-600 bg-zinc-900 text-white")}>
                    <div className="text-2xl mb-2">🕯️</div>
                    <div className="font-bold tracking-wider text-sm">ENGULFING</div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Risk Management */}
          {currentStep === 4 && (
            <motion.div key="risk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <StepHeader number="05" title="RISK MANAGEMENT" subtitle="SL, TP & Position Sizing" />
              
              {/* Account & Risk */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-zinc-500 text-sm tracking-widest mb-2">
                    <DollarSign className="w-4 h-4" />
                    ACCOUNT SIZE
                  </label>
                  <Input type="number" value={checklist.account_size} onChange={(e) => update('account_size', e.target.value)}
                    placeholder="10000" className="bg-zinc-900 border-zinc-800 text-white text-lg h-12 rounded-xl focus:border-white" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-zinc-500 text-sm tracking-widest mb-2">
                    <Percent className="w-4 h-4" />
                    RISIKO %
                  </label>
                  <Input type="number" value={checklist.risk_percent} onChange={(e) => update('risk_percent', e.target.value)}
                    placeholder="1" className="bg-zinc-900 border-zinc-800 text-white text-lg h-12 rounded-xl focus:border-white" />
                </div>
              </div>
              
              {/* Trade Levels */}
              <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950 space-y-4">
                <h4 className="text-white font-bold tracking-widest text-sm">TRADE LEVELS</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-600 text-xs tracking-widest mb-1.5 block">ENTRY PREIS</label>
                    <Input type="number" step="0.00001" value={checklist.entry_price} onChange={(e) => update('entry_price', e.target.value)}
                      placeholder="1.08500" className="bg-zinc-900 border-zinc-800 text-white h-11 rounded-lg text-center focus:border-white" />
                  </div>
                  <div>
                    <label className="text-red-400 text-xs tracking-widest mb-1.5 block">STOP LOSS</label>
                    <Input type="number" step="0.00001" value={checklist.stop_loss} onChange={(e) => update('stop_loss', e.target.value)}
                      placeholder="1.08200" className="bg-red-500/10 border-red-500/30 text-white h-11 rounded-lg text-center focus:border-red-500" />
                  </div>
                  <div>
                    <label className="text-emerald-400 text-xs tracking-widest mb-1.5 block">TAKE PROFIT</label>
                    <Input type="number" step="0.00001" value={checklist.take_profit} onChange={(e) => update('take_profit', e.target.value)}
                      placeholder="1.09200" className="bg-emerald-500/10 border-emerald-500/30 text-white h-11 rounded-lg text-center focus:border-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Risk Calculator Results */}
              {riskCalc && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="border border-zinc-800 bg-zinc-900 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-white" />
                    <span className="font-bold tracking-widest text-sm text-white">RISK CALCULATOR</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <div className="text-xs text-zinc-500 mb-1">R:R RATIO</div>
                      <div className={cn("text-2xl font-bold", 
                        parseFloat(riskCalc.rr) >= 3 ? "text-emerald-400" : 
                        parseFloat(riskCalc.rr) >= 2 ? "text-emerald-500" : 
                        parseFloat(riskCalc.rr) >= 1 ? "text-yellow-500" : "text-red-500")}>
                        1:{riskCalc.rr}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <div className="text-xs text-zinc-500 mb-1">RISIKO $</div>
                      <div className="text-2xl font-bold text-red-400">${riskCalc.riskAmount}</div>
                    </div>
                    <div className="text-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <div className="text-xs text-zinc-500 mb-1">SL PIPS</div>
                      <div className="text-2xl font-bold text-zinc-300">{riskCalc.slPips}</div>
                    </div>
                    <div className="text-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <div className="text-xs text-zinc-500 mb-1">POTENTIAL $</div>
                      <div className="text-2xl font-bold text-emerald-400">${riskCalc.potentialProfit}</div>
                    </div>
                  </div>
                  
                  {parseFloat(riskCalc.rr) < 2 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-400 text-sm">ZNPCV empfiehlt mindestens 1:2 R:R</span>
                    </div>
                  )}
                  
                  {parseFloat(riskCalc.rr) >= 2 && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-400 text-sm">Gutes Risk:Reward Verhältnis!</span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 5: Final */}
          {currentStep === 5 && (
            <motion.div key="final" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <StepHeader number="06" title="FINAL CHECK" subtitle="Letzte Bestätigung vor dem Trade" />

              {/* Final Rule Confirmation */}
              <div className="border-2 border-white/20 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-white" />
                  <span className="text-white font-bold tracking-widest">BESTÄTIGE DIE ZNPCV REGEL</span>
                </div>
                
                {checklist.direction === 'long' && (
                  <button onClick={() => update('confirms_rule', !checklist.confirms_rule)}
                    className={cn("w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all text-left",
                      checklist.confirms_rule 
                        ? "bg-emerald-500 border-emerald-400 text-white" 
                        : "border-zinc-700 hover:border-emerald-500/50 bg-zinc-900")}>
                    <div className={cn("w-7 h-7 border-2 flex items-center justify-center rounded-lg",
                      checklist.confirms_rule ? "border-white bg-white" : "border-zinc-600")}>
                      {checklist.confirms_rule && <Check className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div>
                      <div className={cn("font-bold tracking-wider", checklist.confirms_rule ? "text-white" : "text-white")}>
                        ICH KAUFE IM ODER ÜBER DEM AOI
                      </div>
                      <div className={cn("text-sm", checklist.confirms_rule ? "text-emerald-100" : "text-zinc-500")}>
                        Ich kaufe NICHT am Widerstand / Top
                      </div>
                    </div>
                  </button>
                )}
                
                {checklist.direction === 'short' && (
                  <button onClick={() => update('confirms_rule', !checklist.confirms_rule)}
                    className={cn("w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all text-left",
                      checklist.confirms_rule 
                        ? "bg-red-500 border-red-400 text-white" 
                        : "border-zinc-700 hover:border-red-500/50 bg-zinc-900")}>
                    <div className={cn("w-7 h-7 border-2 flex items-center justify-center rounded-lg",
                      checklist.confirms_rule ? "border-white bg-white" : "border-zinc-600")}>
                      {checklist.confirms_rule && <Check className="w-4 h-4 text-red-500" />}
                    </div>
                    <div>
                      <div className={cn("font-bold tracking-wider", checklist.confirms_rule ? "text-white" : "text-white")}>
                        ICH VERKAUFE IM ODER UNTER DEM AOI
                      </div>
                      <div className={cn("text-sm", checklist.confirms_rule ? "text-red-100" : "text-zinc-500")}>
                        Ich verkaufe NICHT an der Unterstützung / Boden
                      </div>
                    </div>
                  </button>
                )}

                {!checklist.direction && (
                  <div className="text-zinc-500 text-center py-4 font-sans">
                    Wähle zuerst eine Richtung im ersten Schritt
                  </div>
                )}
              </div>

              {/* Trade Summary */}
              <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950">
                <h3 className="text-white font-bold tracking-widest mb-4">TRADE ZUSAMMENFASSUNG</h3>
                
                <div className="space-y-2">
                  <SummaryRow label="PAAR" value={checklist.pair || '-'} />
                  <SummaryRow label="RICHTUNG" 
                    value={checklist.direction === 'long' ? '↑ LONG' : checklist.direction === 'short' ? '↓ SHORT' : '-'} 
                    color={checklist.direction === 'long' ? 'emerald' : checklist.direction === 'short' ? 'red' : null} />
                  <div className="border-t border-zinc-800 my-3" />
                  <SummaryRow label="W/D SCORE" value={`${wdScore}/50%`} color={wdScore >= 35 ? 'emerald' : wdScore >= 20 ? 'yellow' : null} />
                  <SummaryRow label="4H SCORE" value={`${h4Score}/30%`} color={h4Score >= 20 ? 'emerald' : h4Score >= 10 ? 'yellow' : null} />
                  <SummaryRow label="ENTRY SCORE" value={`${entryScore}/25%`} color={entryScore >= 20 ? 'emerald' : entryScore >= 10 ? 'yellow' : null} />
                  {riskCalc && (
                    <>
                      <div className="border-t border-zinc-800 my-3" />
                      <SummaryRow label="R:R RATIO" value={`1:${riskCalc.rr}`} color={parseFloat(riskCalc.rr) >= 2 ? 'emerald' : 'yellow'} />
                      <SummaryRow label="RISIKO" value={`$${riskCalc.riskAmount} (${checklist.risk_percent}%)`} color="red" />
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-zinc-500 tracking-widest text-sm mb-2">NOTIZEN (OPTIONAL)</label>
                <Textarea value={checklist.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Trade Notizen, Beobachtungen..."
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-700 min-h-[80px] rounded-xl font-sans focus:border-white" />
              </div>

              {/* Final Grade */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={cn("p-8 text-center rounded-2xl border-2",
                  progress >= 100 ? "bg-emerald-500 border-emerald-400" :
                  progress >= 90 ? "bg-emerald-400 border-emerald-300" :
                  progress >= 85 ? "bg-blue-500 border-blue-400" :
                  progress >= 70 ? "bg-yellow-500 border-yellow-400" :
                  "bg-zinc-900 border-red-500")}>
                <div className={cn("text-5xl font-bold mb-1", progress >= 70 ? "text-black" : "text-white")}>{gradeInfo.grade}</div>
                <div className={cn("text-3xl tracking-widest mb-2", progress >= 70 ? "text-black/80" : "text-white")}>{progress}%</div>
                {progress >= 85 ? (
                  <div className={cn("text-sm font-sans", progress >= 70 ? "text-black/60" : "text-white/60")}>✓ BEREIT ZUM HANDELN</div>
                ) : (
                  <div className="text-sm font-sans text-white/80">
                    ZNPCV empfiehlt NICHT zu traden (min. 85%)
                  </div>
                )}
              </motion.div>

              {/* Score Breakdown */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                <div className="text-xs text-zinc-600 tracking-widest mb-3 text-center">PUNKTE BREAKDOWN</div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    <div className="text-zinc-500 text-xs">W/D</div>
                    <div className="text-white font-bold">{wdScore}/50</div>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    <div className="text-zinc-500 text-xs">4H</div>
                    <div className="text-white font-bold">{h4Score}/30</div>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    <div className="text-zinc-500 text-xs">ENTRY</div>
                    <div className="text-white font-bold">{entryScore}/25</div>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-white text-black rounded-lg text-center font-bold">
                  GESAMT: {progress}/105%
                </div>
              </div>

              <TradingQuote variant="minimal" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-10 flex gap-3">
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(prev => prev - 1)} variant="outline" 
              className="border-zinc-800 text-white hover:bg-zinc-900 hover:text-white rounded-xl tracking-widest px-5 h-12">
              <ChevronLeft className="w-4 h-4 mr-1" /> ZURÜCK
            </Button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} 
              className="flex-1 bg-white hover:bg-zinc-200 text-black rounded-xl tracking-widest text-base h-12 font-bold">
              WEITER <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex-1 flex gap-2">
              {checklistId && (
                <Button onClick={handleDelete} variant="outline" 
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl px-4 h-12">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={() => handleSave(false)} disabled={saving || !checklist.pair}
                className={cn("flex-1 rounded-xl tracking-widest text-base h-12 font-bold",
                  isReady 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                    : "bg-zinc-800 hover:bg-zinc-700 text-white")}>
                <Save className="w-4 h-4 mr-2" /> {saving ? 'SPEICHERN...' : 'TRADE SPEICHERN'}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center">
              <XOctagon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl tracking-widest mb-3 text-white">WARNUNG</h2>
              <p className="text-zinc-400 font-sans mb-6 text-sm leading-relaxed">
                Dein Score ist unter 85%. Nach ZNPCV Standard solltest du diesen Trade NICHT eingehen.
              </p>
              
              <div className={cn("rounded-xl p-5 mb-6", gradeInfo.color)}>
                <div className="text-4xl font-bold text-black mb-1">{progress}%</div>
                <div className="text-lg font-bold text-black/80">{gradeInfo.grade}</div>
              </div>

              <div className="space-y-3">
                <Button onClick={() => { setShowWarning(false); navigate(createPageUrl('Dashboard')); }}
                  className="w-full bg-white hover:bg-zinc-200 text-black rounded-xl h-11 tracking-widest font-bold">
                  TRADE NICHT EINGEHEN
                </Button>
                <Button onClick={() => { setShowWarning(false); handleSave(true); }} variant="ghost"
                  className="w-full text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900 rounded-xl h-10 text-sm">
                  Trotzdem speichern
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop} className="fixed bottom-6 right-6 w-11 h-11 bg-white text-black flex items-center justify-center shadow-lg hover:bg-zinc-200 transition-colors z-50 rounded-full">
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
function StepHeader({ number, title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <div className="text-5xl font-light text-zinc-800 mb-1">{number}</div>
      <h2 className="text-2xl md:text-3xl tracking-widest mb-1 text-white">{title}</h2>
      <p className="text-zinc-600 text-sm tracking-wider">{subtitle}</p>
    </div>
  );
}

function ChecklistItem({ checked, onChange, label, score, description }) {
  return (
    <button onClick={onChange} className={cn(
      "w-full p-4 flex items-center gap-4 transition-all text-left rounded-xl border-2",
      checked 
        ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/10" 
        : "border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900"
    )}>
      <div className={cn(
        "w-7 h-7 border-2 flex items-center justify-center flex-shrink-0 rounded-lg transition-all",
        checked ? "border-white bg-white" : "border-zinc-700"
      )}>
        {checked && <Check className="w-4 h-4 text-emerald-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn("text-sm tracking-wider block font-bold", checked ? "text-white" : "text-white")}>{label}</span>
        {description && <span className={cn("text-xs font-sans block mt-0.5 truncate", checked ? "text-emerald-100" : "text-zinc-600")}>{description}</span>}
      </div>
      <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0", 
        checked ? "bg-white text-emerald-600" : "bg-zinc-800 text-zinc-500")}>
        +{score}%
      </div>
    </button>
  );
}

function PatternSelector({ value, onChange, score, label, description }) {
  const patterns = [
    { key: 'double_top', label: 'DOUBLE TOP', icon: '📉' },
    { key: 'double_bottom', label: 'DOUBLE BTM', icon: '📈' },
    { key: 'head_shoulders', label: 'H&S', icon: '🔻' },
    { key: 'inv_head_shoulders', label: 'INV H&S', icon: '🔺' },
    { key: 'none', label: 'KEIN', icon: '✕' },
  ];

  return (
    <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950">
      <div className="flex items-center justify-between mb-3">
        <div>
          <label className="text-zinc-400 text-xs tracking-widest block">{label}</label>
          {description && <span className="text-zinc-600 text-xs">{description}</span>}
        </div>
        {value && value !== 'none' && (
          <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">+{score}%</div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {patterns.map((pattern) => (
          <button key={pattern.key} onClick={() => onChange(pattern.key)}
            className={cn("p-2 border rounded-lg text-center transition-all",
              value === pattern.key
                ? pattern.key === 'none' 
                  ? "bg-zinc-700 border-zinc-600 text-white" 
                  : "bg-emerald-500 border-emerald-400 text-white"
                : "border-zinc-800 text-zinc-600 hover:border-zinc-700 bg-zinc-900 hover:text-white")}>
            <div className="text-lg mb-0.5">{pattern.icon}</div>
            <div className="text-[9px] tracking-wider font-bold leading-tight">{pattern.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }) {
  const colorClasses = {
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400'
  };
  
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-zinc-600 text-xs tracking-wider">{label}</span>
      <span className={cn("font-bold text-sm", color ? colorClasses[color] : "text-white")}>{value}</span>
    </div>
  );
}