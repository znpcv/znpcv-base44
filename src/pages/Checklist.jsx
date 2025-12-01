import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Check, ChevronRight, ChevronLeft, Home, ArrowUp, AlertTriangle, XOctagon, Calculator, Target, ShieldAlert } from 'lucide-react';
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
    direction: '', // 'long' or 'short'
    
    // Weekly/Daily Checklist (50%)
    wd_at_aoi: false,           // 10%
    wd_ema_touch: false,        // 5%
    wd_candlestick: false,      // 10%
    wd_psp_rejection: false,    // 10%
    wd_round_level: false,      // 5%
    wd_pattern: '',             // 10% (or 'none')
    
    // 4H Checklist (30%)
    h4_ema_touch: false,        // 5%
    h4_candlestick: false,      // 10%
    h4_psp_rejection: false,    // 5%
    h4_pattern: '',             // 10% (or 'none')
    
    // Entry Checklist (25%)
    entry_sos: false,           // 10%
    entry_engulfing: false,     // 10%
    entry_pattern: '',          // 5% (or 'none')
    entry_type: '',             // 'pinbar' or 'engulfing'
    
    // Risk Management
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    account_size: '',
    risk_percent: '1',
    
    // Final
    not_buying_resistance: false,
    not_selling_support: false,
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

  // Calculate progress based on ZNPCV scoring
  const calculateProgress = () => {
    let score = 0;
    
    // Weekly/Daily (max 50%)
    if (checklist.wd_at_aoi) score += 10;
    if (checklist.wd_ema_touch) score += 5;
    if (checklist.wd_candlestick) score += 10;
    if (checklist.wd_psp_rejection) score += 10;
    if (checklist.wd_round_level) score += 5;
    if (checklist.wd_pattern && checklist.wd_pattern !== 'none') score += 10;
    
    // 4H (max 30%)
    if (checklist.h4_ema_touch) score += 5;
    if (checklist.h4_candlestick) score += 10;
    if (checklist.h4_psp_rejection) score += 5;
    if (checklist.h4_pattern && checklist.h4_pattern !== 'none') score += 10;
    
    // Entry (max 25%)
    if (checklist.entry_sos) score += 10;
    if (checklist.entry_engulfing) score += 10;
    if (checklist.entry_pattern && checklist.entry_pattern !== 'none') score += 5;
    
    return score;
  };

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
    const positionSize = riskAmount / slDistance;
    
    return {
      rr: rr.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      positionSize: positionSize.toFixed(4),
      slPips: slDistance.toFixed(4),
      tpPips: tpDistance.toFixed(4)
    };
  };

  const riskCalc = calculateRisk();

  const handleSave = async (force = false) => {
    const progress = calculateProgress();
    
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

  const progress = calculateProgress();
  
  const getGrade = (p) => {
    if (p >= 105) return { grade: 'A+++', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
    if (p >= 95) return { grade: 'A++', color: 'bg-emerald-400', textColor: 'text-emerald-400' };
    if (p >= 85) return { grade: 'A+', color: 'bg-blue-500', textColor: 'text-blue-500' };
    if (p >= 70) return { grade: 'OK', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    return { grade: 'NO TRADE', color: 'bg-red-500', textColor: 'text-red-500' };
  };
  
  const gradeInfo = getGrade(progress);
  const isReady = progress >= 85;

  const stepLabels = {
    pair: 'ASSET & RICHTUNG',
    weekly_daily: 'WEEKLY / DAILY',
    h4: '4H ANALYSE',
    entry: 'ENTRY',
    risk: 'RISIKO',
    final: 'ABSCHLUSS'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-xl tracking-widest">{t('loading')}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-black border-b border-zinc-800/50 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(createPageUrl('Home'))} className="text-zinc-500 hover:text-white transition-colors">
                <Home className="w-6 h-6" />
              </button>
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className="text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" alt="ZNPCV" className="h-10 w-auto cursor-pointer hover:opacity-80 invert" />
            </button>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full font-bold", gradeInfo.color, "text-black")}>
                <div className="w-2 h-2 rounded-full animate-pulse bg-black" />
                <span className="text-lg">{progress}%</span>
                <span className="text-xs font-bold">{gradeInfo.grade}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-zinc-900">
          <motion.div className={cn("h-full", gradeInfo.color)} initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.5 }} />
        </div>
      </header>

      {/* Steps Navigation */}
      <div className="bg-zinc-950 border-b border-zinc-800/50 overflow-x-auto">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2">
          {STEPS.map((step, index) => (
            <button key={step} onClick={() => setCurrentStep(index)}
              className={cn("px-4 py-2 text-sm tracking-widest whitespace-nowrap transition-all rounded-xl",
                currentStep === index ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-900')}>
              {index + 1}. {stepLabels[step]}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: Asset & Direction */}
          {currentStep === 0 && (
            <motion.div key="pair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <StepHeader number="01" title="ASSET & RICHTUNG" subtitle="Wähle Paar und Trade-Richtung" />
              
              <AssetSelector selectedPair={checklist.pair} onSelect={(pair) => update('pair', pair)} />
              
              {checklist.pair && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <label className="text-zinc-500 text-sm tracking-widest block">TRADE RICHTUNG</label>
                  
                  {/* Warning Box */}
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl mb-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-red-400 font-bold tracking-wider mb-1">ZNPCV REGEL</div>
                        <div className="text-sm text-zinc-400 font-sans">
                          WIR VERKAUFEN IM ODER UNTER DEM AOI (Widerstand)<br/>
                          WIR KAUFEN IM ODER ÜBER DEM AOI (Unterstützung)<br/><br/>
                          <span className="text-red-400 font-bold">NIE AM BODEN VERKAUFEN! NIE AM TOP KAUFEN!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => update('direction', 'long')}
                      className={cn("p-8 border rounded-2xl text-center transition-all",
                        checklist.direction === 'long' ? "bg-emerald-500 border-emerald-500 text-black" : "border-zinc-800/50 hover:border-zinc-600 bg-zinc-950")}>
                      <div className="text-5xl mb-3">↑</div>
                      <div className="text-xl tracking-wider font-bold">LONG / KAUFEN</div>
                      <div className={cn("text-sm mt-2", checklist.direction === 'long' ? "text-emerald-900" : "text-zinc-600")}>
                        Im oder ÜBER dem AOI
                      </div>
                    </button>
                    <button onClick={() => update('direction', 'short')}
                      className={cn("p-8 border rounded-2xl text-center transition-all",
                        checklist.direction === 'short' ? "bg-red-500 border-red-500 text-white" : "border-zinc-800/50 hover:border-zinc-600 bg-zinc-950")}>
                      <div className="text-5xl mb-3">↓</div>
                      <div className="text-xl tracking-wider font-bold">SHORT / VERKAUFEN</div>
                      <div className={cn("text-sm mt-2", checklist.direction === 'short' ? "text-red-200" : "text-zinc-600")}>
                        Im oder UNTER dem AOI
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 1: Weekly/Daily */}
          {currentStep === 1 && (
            <motion.div key="weekly_daily" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="02" title="WEEKLY / DAILY" subtitle="Higher Timeframe Analyse (max 50%)" />
              
              <div className="p-4 bg-zinc-900 rounded-xl mb-4">
                <div className="text-xs text-zinc-500 tracking-widest mb-2">REJECTION REIHENFOLGE</div>
                <div className="text-white font-bold tracking-wider">AOI → EMA → PSP → Candlestick → RPN</div>
              </div>
              
              <ScoreItem checked={checklist.wd_at_aoi} onChange={() => update('wd_at_aoi', !checklist.wd_at_aoi)} 
                label="AT AOI / REJECTED" score={10} description="Preis ist am AOI und wurde abgelehnt" />
              
              <ScoreItem checked={checklist.wd_ema_touch} onChange={() => update('wd_ema_touch', !checklist.wd_ema_touch)} 
                label="EMA BERÜHRT / ABGELEHNT" score={5} description="Preis berührt oder wird vom EMA abgelehnt" />
              
              <ScoreItem checked={checklist.wd_candlestick} onChange={() => update('wd_candlestick', !checklist.wd_candlestick)} 
                label="CANDLESTICK REJECTION" score={10} description="Ablehnungskerze sichtbar (Pinbar, Doji, etc.)" />
              
              <ScoreItem checked={checklist.wd_psp_rejection} onChange={() => update('wd_psp_rejection', !checklist.wd_psp_rejection)} 
                label="PSP REJECTION" score={10} description="Ablehnung von Previous Structure Point" />
              
              <ScoreItem checked={checklist.wd_round_level} onChange={() => update('wd_round_level', !checklist.wd_round_level)} 
                label="ROUND PSYCH LEVEL (RPN)" score={5} description="Preis an runder psychologischer Zahl (z.B. 1.1000)" />
              
              <PatternSelector 
                value={checklist.wd_pattern} 
                onChange={(v) => update('wd_pattern', v)} 
                score={10}
                label="PATTERN (W/D)"
              />
            </motion.div>
          )}

          {/* STEP 2: 4H */}
          {currentStep === 2 && (
            <motion.div key="h4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="03" title="4H ANALYSE" subtitle="Lower Timeframe Bestätigung (max 30%)" />
              
              <ScoreItem checked={checklist.h4_ema_touch} onChange={() => update('h4_ema_touch', !checklist.h4_ema_touch)} 
                label="EMA BERÜHRT" score={5} description="Preis berührt den EMA auf 4H" />
              
              <ScoreItem checked={checklist.h4_candlestick} onChange={() => update('h4_candlestick', !checklist.h4_candlestick)} 
                label="CANDLESTICK REJECTION" score={10} description="Ablehnungskerze auf 4H sichtbar" />
              
              <ScoreItem checked={checklist.h4_psp_rejection} onChange={() => update('h4_psp_rejection', !checklist.h4_psp_rejection)} 
                label="PSP REJECTION" score={5} description="Ablehnung von Previous Structure Point auf 4H" />
              
              <PatternSelector 
                value={checklist.h4_pattern} 
                onChange={(v) => update('h4_pattern', v)} 
                score={10}
                label="PATTERN (4H)"
              />
            </motion.div>
          )}

          {/* STEP 3: Entry */}
          {currentStep === 3 && (
            <motion.div key="entry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="04" title="ENTRY CHECKLIST" subtitle="Einstiegsbestätigung (max 25%)" />
              
              <div className="p-4 bg-zinc-900 rounded-xl mb-4">
                <div className="text-xs text-zinc-500 tracking-widest mb-2">ENTRY TIMEFRAME</div>
                <div className="text-white font-bold tracking-wider">30 Minuten - 1 Stunde</div>
              </div>
              
              <ScoreItem checked={checklist.entry_sos} onChange={() => update('entry_sos', !checklist.entry_sos)} 
                label="SOS (SIGN OF STRENGTH)" score={10} description="Marktstrukturwechsel bestätigt (30min)" />
              
              <ScoreItem checked={checklist.entry_engulfing} onChange={() => update('entry_engulfing', !checklist.entry_engulfing)} 
                label="ENGULFING CANDLESTICK" score={10} description="Engulfing Kerze nach Pullback" />
              
              <PatternSelector 
                value={checklist.entry_pattern} 
                onChange={(v) => update('entry_pattern', v)} 
                score={5}
                label="ENTRY PATTERN"
              />
              
              <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-950">
                <label className="text-zinc-500 text-sm tracking-widest mb-4 block">ENTRY TYP</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => update('entry_type', 'pinbar')}
                    className={cn("p-6 border rounded-xl text-center transition-all",
                      checklist.entry_type === 'pinbar' ? "bg-white border-white text-black" : "border-zinc-800/50 hover:border-zinc-600 bg-zinc-950")}>
                    <div className="text-3xl mb-2">📍</div>
                    <div className="font-bold tracking-wider">PINBAR</div>
                    <div className={cn("text-xs mt-1", checklist.entry_type === 'pinbar' ? "text-zinc-600" : "text-zinc-600")}>Rejection Candle</div>
                  </button>
                  <button onClick={() => update('entry_type', 'engulfing')}
                    className={cn("p-6 border rounded-xl text-center transition-all",
                      checklist.entry_type === 'engulfing' ? "bg-white border-white text-black" : "border-zinc-800/50 hover:border-zinc-600 bg-zinc-950")}>
                    <div className="text-3xl mb-2">🕯️</div>
                    <div className="font-bold tracking-wider">ENGULFING</div>
                    <div className={cn("text-xs mt-1", checklist.entry_type === 'engulfing' ? "text-zinc-600" : "text-zinc-600")}>Reversal Candle</div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Risk */}
          {currentStep === 4 && (
            <motion.div key="risk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="05" title="RISIKO MANAGEMENT" subtitle="SL, TP & Position Size" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-500 text-sm tracking-widest mb-2 block">ACCOUNT GRÖSSE ($)</label>
                  <Input type="number" value={checklist.account_size} onChange={(e) => update('account_size', e.target.value)}
                    placeholder="10000" className="bg-zinc-950 border-zinc-800 text-white text-lg h-14 rounded-xl" />
                </div>
                <div>
                  <label className="text-zinc-500 text-sm tracking-widest mb-2 block">RISIKO (%)</label>
                  <Input type="number" value={checklist.risk_percent} onChange={(e) => update('risk_percent', e.target.value)}
                    placeholder="1" className="bg-zinc-950 border-zinc-800 text-white text-lg h-14 rounded-xl" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-zinc-500 text-sm tracking-widest mb-2 block">ENTRY PREIS</label>
                  <Input type="number" step="0.00001" value={checklist.entry_price} onChange={(e) => update('entry_price', e.target.value)}
                    placeholder="1.08500" className="bg-zinc-950 border-zinc-800 text-white text-lg h-14 rounded-xl" />
                </div>
                <div>
                  <label className="text-zinc-500 text-sm tracking-widest mb-2 block">STOP LOSS</label>
                  <Input type="number" step="0.00001" value={checklist.stop_loss} onChange={(e) => update('stop_loss', e.target.value)}
                    placeholder="1.08200" className="bg-zinc-950 border-zinc-800 text-white text-lg h-14 rounded-xl" />
                </div>
                <div>
                  <label className="text-zinc-500 text-sm tracking-widest mb-2 block">TAKE PROFIT</label>
                  <Input type="number" step="0.00001" value={checklist.take_profit} onChange={(e) => update('take_profit', e.target.value)}
                    placeholder="1.09200" className="bg-zinc-950 border-zinc-800 text-white text-lg h-14 rounded-xl" />
                </div>
              </div>

              {riskCalc && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-white bg-white text-black rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calculator className="w-6 h-6" />
                    <span className="font-bold tracking-widest text-lg">RISK CALCULATOR</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-black/5 rounded-xl">
                      <div className="text-xs text-zinc-600 mb-1">RISK:REWARD</div>
                      <div className={cn("text-3xl font-bold", parseFloat(riskCalc.rr) >= 2 ? "text-emerald-600" : parseFloat(riskCalc.rr) >= 1 ? "text-yellow-600" : "text-red-600")}>
                        1:{riskCalc.rr}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-black/5 rounded-xl">
                      <div className="text-xs text-zinc-600 mb-1">RISIKO ($)</div>
                      <div className="text-3xl font-bold">${riskCalc.riskAmount}</div>
                    </div>
                    <div className="text-center p-4 bg-black/5 rounded-xl">
                      <div className="text-xs text-zinc-600 mb-1">SL DISTANZ</div>
                      <div className="text-3xl font-bold">{riskCalc.slPips}</div>
                    </div>
                    <div className="text-center p-4 bg-black/5 rounded-xl">
                      <div className="text-xs text-zinc-600 mb-1">TP DISTANZ</div>
                      <div className="text-3xl font-bold">{riskCalc.tpPips}</div>
                    </div>
                  </div>
                  
                  {parseFloat(riskCalc.rr) < 2 && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-800 text-sm font-sans">ZNPCV empfiehlt mindestens 1:2 R:R</span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 5: Final */}
          {currentStep === 5 && (
            <motion.div key="final" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="06" title="ABSCHLUSS" subtitle="Letzte Bestätigung" />

              <div className="border-2 border-red-500/50 bg-red-500/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <XOctagon className="w-6 h-6 text-red-500" />
                  <span className="text-red-400 font-bold tracking-widest">WICHTIGE REGELN</span>
                </div>
                
                {checklist.direction === 'long' && (
                  <ScoreItem checked={checklist.not_buying_resistance} onChange={() => update('not_buying_resistance', !checklist.not_buying_resistance)} 
                    label="ICH KAUFE NICHT AM WIDERSTAND" description="Ich kaufe im oder über dem AOI (Support)" noBorder />
                )}
                
                {checklist.direction === 'short' && (
                  <ScoreItem checked={checklist.not_selling_support} onChange={() => update('not_selling_support', !checklist.not_selling_support)} 
                    label="ICH VERKAUFE NICHT AN UNTERSTÜTZUNG" description="Ich verkaufe im oder unter dem AOI (Resistance)" noBorder />
                )}

                {!checklist.direction && (
                  <div className="text-zinc-500 text-center py-4 font-sans">
                    Wähle zuerst eine Richtung im ersten Schritt
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-950">
                <h3 className="text-xl tracking-widest mb-4">ZUSAMMENFASSUNG</h3>
                
                <div className="space-y-3">
                  <SummaryRow label="PAAR" value={checklist.pair || '-'} />
                  <SummaryRow label="RICHTUNG" value={checklist.direction === 'long' ? '↑ LONG' : checklist.direction === 'short' ? '↓ SHORT' : '-'} 
                    highlight={checklist.direction === 'long' ? 'green' : checklist.direction === 'short' ? 'red' : null} />
                  <SummaryRow label="W/D SCORE" value={`${(checklist.wd_at_aoi ? 10 : 0) + (checklist.wd_ema_touch ? 5 : 0) + (checklist.wd_candlestick ? 10 : 0) + (checklist.wd_psp_rejection ? 10 : 0) + (checklist.wd_round_level ? 5 : 0) + (checklist.wd_pattern && checklist.wd_pattern !== 'none' ? 10 : 0)}%`} />
                  <SummaryRow label="4H SCORE" value={`${(checklist.h4_ema_touch ? 5 : 0) + (checklist.h4_candlestick ? 10 : 0) + (checklist.h4_psp_rejection ? 5 : 0) + (checklist.h4_pattern && checklist.h4_pattern !== 'none' ? 10 : 0)}%`} />
                  <SummaryRow label="ENTRY SCORE" value={`${(checklist.entry_sos ? 10 : 0) + (checklist.entry_engulfing ? 10 : 0) + (checklist.entry_pattern && checklist.entry_pattern !== 'none' ? 5 : 0)}%`} />
                  {riskCalc && <SummaryRow label="R:R" value={`1:${riskCalc.rr}`} highlight={parseFloat(riskCalc.rr) >= 2 ? 'green' : 'yellow'} />}
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 tracking-widest mb-2">NOTIZEN</label>
                <Textarea value={checklist.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Trade Notizen..."
                  className="bg-zinc-950 border-zinc-800/50 text-white placeholder:text-zinc-700 min-h-[100px] rounded-xl font-sans focus:border-white focus:ring-0" />
              </div>

              {/* Grade Display */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={cn("p-10 text-center rounded-2xl border-2",
                  progress >= 105 ? "bg-emerald-500 border-emerald-500 text-black" :
                  progress >= 95 ? "bg-emerald-400 border-emerald-400 text-black" :
                  progress >= 85 ? "bg-blue-500 border-blue-500 text-white" :
                  progress >= 70 ? "bg-yellow-500 border-yellow-500 text-black" :
                  "bg-red-500/10 border-red-500 text-white")}>
                <div className="text-6xl font-bold mb-2">{gradeInfo.grade}</div>
                <div className="text-4xl tracking-widest mb-2">{progress}%</div>
                {progress >= 85 ? (
                  <div className="text-lg font-sans opacity-80">BEREIT ZUM HANDELN</div>
                ) : (
                  <div className="text-lg font-sans">
                    <span className="font-bold">ZNPCV empfiehlt NICHT zu traden!</span>
                    <br /><span className="text-sm opacity-80">Minimum 85% erforderlich</span>
                  </div>
                )}
              </motion.div>

              {/* Score Breakdown */}
              <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-2xl">
                <h4 className="text-center text-sm tracking-widest text-zinc-500 mb-4">PUNKTE ÜBERSICHT</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-zinc-900 rounded-lg">
                    <span className="text-zinc-400">Weekly/Daily (max 50%)</span>
                    <span className="text-white font-bold">{(checklist.wd_at_aoi ? 10 : 0) + (checklist.wd_ema_touch ? 5 : 0) + (checklist.wd_candlestick ? 10 : 0) + (checklist.wd_psp_rejection ? 10 : 0) + (checklist.wd_round_level ? 5 : 0) + (checklist.wd_pattern && checklist.wd_pattern !== 'none' ? 10 : 0)}%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-zinc-900 rounded-lg">
                    <span className="text-zinc-400">4H Analyse (max 30%)</span>
                    <span className="text-white font-bold">{(checklist.h4_ema_touch ? 5 : 0) + (checklist.h4_candlestick ? 10 : 0) + (checklist.h4_psp_rejection ? 5 : 0) + (checklist.h4_pattern && checklist.h4_pattern !== 'none' ? 10 : 0)}%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-zinc-900 rounded-lg">
                    <span className="text-zinc-400">Entry (max 25%)</span>
                    <span className="text-white font-bold">{(checklist.entry_sos ? 10 : 0) + (checklist.entry_engulfing ? 10 : 0) + (checklist.entry_pattern && checklist.entry_pattern !== 'none' ? 5 : 0)}%</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white text-black rounded-lg font-bold">
                    <span>GESAMT</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </div>

              <TradingQuote variant="minimal" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex gap-4">
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(prev => prev - 1)} variant="outline" className="border-zinc-800 text-white hover:bg-zinc-900 rounded-xl tracking-widest px-6">
              <ChevronLeft className="w-4 h-4 mr-2" /> ZURÜCK
            </Button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} className="flex-1 bg-white hover:bg-zinc-200 text-black rounded-xl tracking-widest text-lg py-6">
              WEITER <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <div className="flex-1 flex gap-3">
              {checklistId && (
                <Button onClick={handleDelete} variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-900 rounded-xl px-4">
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <Button onClick={() => handleSave(false)} disabled={saving || !checklist.pair}
                className={cn("flex-1 rounded-xl tracking-widest text-lg py-6",
                  isReady ? "bg-white hover:bg-zinc-200 text-black" : "bg-zinc-800 hover:bg-zinc-700 text-white")}>
                <Save className="w-5 h-5 mr-2" /> {saving ? 'SPEICHERN...' : 'SPEICHERN'}
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
              className="bg-zinc-950 border-2 border-white rounded-2xl p-10 max-w-md w-full text-center">
              <XOctagon className="w-24 h-24 text-white mx-auto mb-6" />
              <h2 className="text-3xl tracking-widest mb-4">WARNUNG</h2>
              <p className="text-zinc-400 font-sans mb-8 leading-relaxed">
                Dein Score ist unter 85%. Nach ZNPCV Standard solltest du diesen Trade NICHT eingehen.
              </p>
              
              <div className={cn("rounded-xl p-6 mb-8", gradeInfo.color)}>
                <div className="text-6xl font-bold text-black mb-1">{progress}%</div>
                <div className="text-2xl font-bold text-black mb-2">{gradeInfo.grade}</div>
                <div className="text-sm text-black/60 tracking-widest">ZNPCV STANDARD: 85%+</div>
              </div>

              <div className="space-y-4">
                <Button onClick={() => { setShowWarning(false); navigate(createPageUrl('Dashboard')); }}
                  className="w-full bg-white hover:bg-zinc-200 text-black rounded-xl py-4 text-lg tracking-widest">
                  TRADE NICHT EINGEHEN
                </Button>
                <Button onClick={() => { setShowWarning(false); handleSave(true); }} variant="outline"
                  className="w-full border-zinc-800 text-zinc-500 hover:bg-zinc-900 rounded-xl py-3">
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
            onClick={scrollToTop} className="fixed bottom-6 right-6 w-12 h-12 bg-white text-black flex items-center justify-center shadow-lg hover:bg-zinc-200 transition-colors z-50 rounded-full">
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
    <div className="text-center mb-10">
      <div className="text-6xl font-light text-zinc-800 mb-2">{number}</div>
      <h2 className="text-3xl md:text-4xl tracking-widest mb-2">{title}</h2>
      <p className="text-zinc-600 text-lg tracking-wider">{subtitle}</p>
    </div>
  );
}

function ScoreItem({ checked, onChange, label, score, description, noBorder = false }) {
  return (
    <button onClick={onChange} className={cn(
      "w-full p-5 flex items-center gap-4 transition-all text-left rounded-2xl",
      noBorder ? "" : "border",
      checked ? 'bg-white border-white text-black' : 'border-zinc-800/50 hover:border-zinc-600 bg-zinc-950'
    )}>
      <div className={cn(
        "w-8 h-8 border-2 flex items-center justify-center flex-shrink-0 rounded-lg transition-all",
        checked ? 'border-black bg-black' : 'border-zinc-700'
      )}>
        {checked && <Check className="w-5 h-5 text-white" />}
      </div>
      <div className="flex-1">
        <span className={cn("text-lg tracking-wider block", checked ? "text-black" : "text-white")}>{label}</span>
        {description && <span className={cn("text-sm font-sans", checked ? "text-zinc-600" : "text-zinc-600")}>{description}</span>}
      </div>
      {score && (
        <div className={cn("px-3 py-1 rounded-full text-sm font-bold", 
          checked ? "bg-black text-white" : "bg-zinc-800 text-zinc-400")}>
          +{score}%
        </div>
      )}
    </button>
  );
}

function PatternSelector({ value, onChange, score, label }) {
  const patterns = [
    { key: 'double_top', label: 'DOUBLE TOP', icon: '🔻' },
    { key: 'double_bottom', label: 'DOUBLE BOTTOM', icon: '🔺' },
    { key: 'head_shoulders', label: 'HEAD & SHOULDERS', icon: '📉' },
    { key: 'inv_head_shoulders', label: 'INV. H&S', icon: '📈' },
    { key: 'none', label: 'KEIN MUSTER', icon: '✕' },
  ];

  return (
    <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-950">
      <div className="flex items-center justify-between mb-4">
        <label className="text-zinc-500 text-sm tracking-widest">{label}</label>
        {value && value !== 'none' && (
          <div className="px-3 py-1 rounded-full text-sm font-bold bg-white text-black">+{score}%</div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {patterns.map((pattern) => (
          <button key={pattern.key} onClick={() => onChange(pattern.key)}
            className={cn("p-3 border rounded-xl text-center transition-all",
              value === pattern.key
                ? pattern.key === 'none' ? "bg-zinc-700 border-zinc-700 text-white" : "bg-white border-white text-black"
                : "border-zinc-800/50 text-zinc-500 hover:border-zinc-600 bg-zinc-950")}>
            <div className="text-2xl mb-1">{pattern.icon}</div>
            <div className="text-[10px] tracking-wider font-bold leading-tight">{pattern.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className={cn("flex justify-between items-center p-3 rounded-xl",
      highlight === 'green' ? 'bg-emerald-500/20' : highlight === 'red' ? 'bg-red-500/20' : highlight === 'yellow' ? 'bg-yellow-500/20' : 'bg-zinc-900')}>
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className={cn("font-bold", 
        highlight === 'green' ? 'text-emerald-400' : highlight === 'red' ? 'text-red-400' : highlight === 'yellow' ? 'text-yellow-400' : 'text-white')}>{value}</span>
    </div>
  );
}