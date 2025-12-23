import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Check, ChevronRight, ChevronLeft, Home, ArrowUp, AlertTriangle, XOctagon, Calculator, TrendingUp, TrendingDown, Shield, Target, DollarSign, Percent, Info, Layers, Upload, Image as ImageIcon, X as XIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import AssetSelector from '@/components/AssetSelector';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import TradingQuote from '@/components/TradingQuote';
import AdvancedLotCalculator from '@/components/advanced/AdvancedLotCalculator';
import ChecklistItem from '@/components/checklist/ChecklistItem';
import ChecklistItemWithTooltip from '@/components/checklist/ChecklistItemWithTooltip';
import SectionProgressBar from '@/components/checklist/SectionProgressBar';
import LivePriceDisplay from '@/components/LivePriceDisplay';
import MarketChart from '@/components/MarketChart';

const STEPS = ['pair', 'weekly', 'daily', 'h4', 'entry', 'risk', 'final'];

export default function ChecklistPage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const [searchParams] = useSearchParams();
  const checklistId = searchParams.get('id');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!checklistId);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    pair: '',
    trade_date: format(new Date(), 'yyyy-MM-dd'),
    direction: '',
    
    // Weekly Checklist (max 60%)
    w_trend: '',               // bullish/bearish
    w_at_aoi: false,           // 10%
    w_ema_touch: false,        // 5%
    w_candlestick: false,      // 10%
    w_psp_rejection: false,    // 10%
    w_round_level: false,      // 5%
    w_swing: false,            // 10%
    w_pattern: '',             // 10%
    
    // Daily Checklist (max 60%)
    d_trend: '',               // bullish/bearish
    d_at_aoi: false,           // 10%
    d_ema_touch: false,        // 5%
    d_candlestick: false,      // 10%
    d_psp_rejection: false,    // 10%
    d_round_level: false,      // 5%
    d_swing: false,            // 10%
    d_pattern: '',             // 10%
    
    // 4H Checklist (max 35%)
    h4_trend: '',              // bullish/bearish
    h4_at_aoi: false,          // 5%
    h4_candlestick: false,     // 10%
    h4_psp_rejection: false,   // 5%
    h4_swing: false,           // 5%
    h4_pattern: '',            // 10%
    
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
    leverage: '100',
    screenshots: [],
    screenshots_before: [],
    screenshots_after: [],
    
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
    if (data.length > 0) setFormData(prev => ({ ...prev, ...data[0] }));
    setIsLoading(false);
  };

  const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Calculate scores - FINAL CORRECTED (MOVED BEFORE EFFECTS)
  const weeklyScore = (formData.w_at_aoi ? 10 : 0) + (formData.w_ema_touch ? 5 : 0) + 
    (formData.w_candlestick ? 10 : 0) + (formData.w_psp_rejection ? 10 : 0) + 
    (formData.w_round_level ? 5 : 0) + (formData.w_swing ? 10 : 0) + 
    (formData.w_pattern && formData.w_pattern !== 'none' ? 10 : 0);
  
  const dailyScore = (formData.d_at_aoi ? 10 : 0) + (formData.d_ema_touch ? 5 : 0) + 
    (formData.d_candlestick ? 10 : 0) + (formData.d_psp_rejection ? 10 : 0) + 
    (formData.d_round_level ? 5 : 0) + (formData.d_swing ? 5 : 0) + 
    (formData.d_pattern && formData.d_pattern !== 'none' ? 10 : 0);
  
  const h4Score = (formData.h4_at_aoi ? 5 : 0) + (formData.h4_candlestick ? 10 : 0) + 
    (formData.h4_psp_rejection ? 5 : 0) + (formData.h4_swing ? 5 : 0) + 
    (formData.h4_pattern && formData.h4_pattern !== 'none' ? 10 : 0);
  
  const entryScore = (formData.entry_sos ? 10 : 0) + (formData.entry_engulfing ? 10 : 0) + 
    (formData.entry_pattern && formData.entry_pattern !== 'none' ? 5 : 0);

  const progress = weeklyScore + dailyScore + h4Score + entryScore;
  
  // Check for confluence (all trends in same direction)
  const hasConfluence = formData.w_trend && formData.d_trend && formData.h4_trend &&
    formData.w_trend === formData.d_trend && formData.d_trend === formData.h4_trend;

  // Auto-Save Feature - saves every 3 seconds after changes
  useEffect(() => {
    if (!formData.pair || !checklistId) return; // Only auto-save existing checklists
    
    const timer = setTimeout(async () => {
      const data = { 
        ...formData, 
        completion_percentage: progress, 
        status: progress >= 85 ? 'ready_to_trade' : 'in_progress'
      };
      await base44.entities.TradeChecklist.update(checklistId, data);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [formData, progress, checklistId]);

  // Risk calculations with Lot Size
  const calculateRisk = () => {
    const entry = parseFloat(formData.entry_price) || 0;
    const sl = parseFloat(formData.stop_loss) || 0;
    const tp = parseFloat(formData.take_profit) || 0;
    const account = parseFloat(formData.account_size) || 0;
    const riskPct = parseFloat(formData.risk_percent) || 1;
    
    if (!entry || !sl) return null;
    
    const isLong = formData.direction === 'long';
    const slDistance = isLong ? entry - sl : sl - entry;
    const tpDistance = tp ? (isLong ? tp - entry : entry - tp) : 0;
    
    if (slDistance <= 0) return null;
    
    // Calculate pips based on pair type
    const pair = formData.pair?.toUpperCase() || '';
    const isJPY = pair.includes('JPY');
    const isGold = pair.includes('XAU') || pair.includes('GOLD');
    const isCrypto = pair.includes('BTC') || pair.includes('ETH');
    
    let pipMultiplier = 10000; // Standard forex
    let pipValue = 10; // $10 per pip for 1 standard lot
    
    if (isJPY) {
      pipMultiplier = 100;
      pipValue = 1000 / entry; // Approximate for JPY pairs
    } else if (isGold) {
      pipMultiplier = 10;
      pipValue = 10; // $10 per pip for gold
    } else if (isCrypto) {
      pipMultiplier = 1;
      pipValue = 1;
    }
    
    const slPips = Math.abs(entry - sl) * pipMultiplier;
    const tpPips = tp ? Math.abs(tp - entry) * pipMultiplier : 0;
    
    // Risk amount in account currency
    const riskAmount = account * (riskPct / 100);
    
    // Lot size calculation
    // Formula: Lot Size = Risk Amount / (SL in Pips × Pip Value)
    const lotSize = riskAmount / (slPips * pipValue);
    
    // Round to appropriate decimal places
    const standardLots = lotSize;
    const miniLots = lotSize * 10;
    const microLots = lotSize * 100;
    
    // R:R calculation
    const rr = tpDistance > 0 ? tpDistance / slDistance : 0;
    
    // Position value
    const positionValue = standardLots * 100000 * entry;
    
    return {
      rr: rr.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      slPips: slPips.toFixed(1),
      tpPips: tpPips.toFixed(1),
      potentialProfit: (riskAmount * rr).toFixed(2),
      standardLots: standardLots.toFixed(2),
      miniLots: miniLots.toFixed(2),
      microLots: microLots.toFixed(0),
      positionValue: positionValue.toFixed(0),
      pipValue: pipValue.toFixed(2),
      isJPY,
      isGold,
      isCrypto
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
      ...formData, 
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
    if (p >= 100) return { grade: 'A+++', color: 'bg-teal-600', border: 'border-teal-600' };
    if (p >= 90) return { grade: 'A++', color: 'bg-teal-500', border: 'border-teal-500' };
    if (p >= 85) return { grade: 'A+', color: 'bg-blue-500', border: 'border-blue-500' };
    if (p >= 70) return { grade: 'OK', color: 'bg-amber-500', border: 'border-amber-500' };
    return { grade: 'NO TRADE', color: 'bg-rose-600', border: 'border-rose-600' };
  };
  
  const gradeInfo = getGrade(progress);
  const isReady = progress >= 85;

  const stepLabels = {
    pair: 'ASSET',
    weekly: 'WEEKLY',
    daily: 'DAILY',
    h4: '4H',
    entry: 'ENTRY',
    risk: 'RISK',
    final: 'FINAL'
  };

  // Theme classes
  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    textDimmed: darkMode ? 'text-zinc-600' : 'text-zinc-400',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
    borderCard: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    progressBg: darkMode ? 'bg-zinc-900' : 'bg-zinc-200',
    navBg: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    scoreBg: darkMode ? 'bg-zinc-900/50' : 'bg-zinc-100/50',
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className={`w-16 h-16 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <div className={`${theme.text} text-xl tracking-widest`}>{t('loading')}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => navigate(createPageUrl('Home'))} className={`p-1.5 sm:p-2 ${theme.textMuted} hover:${theme.text} transition-colors rounded-lg ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-200'}`}>
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className={`p-1.5 sm:p-2 ${theme.textMuted} hover:${theme.text} transition-colors rounded-lg ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-200'}`}>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            } alt="ZNPCV" className="h-8 sm:h-10 md:h-12 w-auto cursor-pointer hover:opacity-80" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2">
              <DarkModeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className={theme.progressBg}>
          <motion.div className={cn("h-1", gradeInfo.color)} initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.5 }} />
        </div>
      </header>

      {/* Steps Navigation */}
      <div className={`${theme.navBg} border-b ${theme.border} overflow-x-auto scrollbar-hide`}>
        <div className="max-w-3xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex gap-0.5 sm:gap-1">
          {STEPS.map((step, index) => (
            <button key={step} onClick={() => setCurrentStep(index)}
              className={cn("px-1.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs tracking-wider sm:tracking-widest whitespace-nowrap transition-all rounded-md sm:rounded-lg flex-1 min-w-0",
                currentStep === index 
                  ? darkMode ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-white font-bold'
                  : `${theme.textDimmed} ${darkMode ? 'hover:text-white hover:bg-zinc-900' : 'hover:text-black hover:bg-zinc-200'}`)}>
              <span className="hidden sm:inline">{index + 1}. </span>{stepLabels[step]}
            </button>
          ))}
        </div>
      </div>

      {/* Score Overview Bar with Progress */}
      <div className={`${theme.scoreBg} border-b ${darkMode ? 'border-zinc-800/30' : 'border-zinc-200/50'}`}>
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
          {/* Score Badge - Prominent */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold", gradeInfo.color, 
                progress >= 70 ? "text-white" : darkMode ? "text-white" : "text-black")}>
                <span className="text-base sm:text-lg">{progress}%</span>
                <span className="text-xs opacity-80">{gradeInfo.grade}</span>
              </div>
              {hasConfluence && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-600 text-white text-[9px] sm:text-[10px] font-bold animate-pulse">
                  <Layers className="w-3 h-3" />
                  CONFLUENCE
                </div>
              )}
            </div>
            <span className={`${theme.textMuted} text-xs`}>MAX: 180%</span>
          </div>
          
          {/* Score Details */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs flex-wrap">
            <span className={theme.textMuted}>W: <span className={weeklyScore > 0 ? `${theme.text} font-bold` : theme.textDimmed}>{weeklyScore}/60</span></span>
            <span className={theme.textMuted}>D: <span className={dailyScore > 0 ? `${theme.text} font-bold` : theme.textDimmed}>{dailyScore}/60</span></span>
            <span className={theme.textMuted}>4H: <span className={h4Score > 0 ? `${theme.text} font-bold` : theme.textDimmed}>{h4Score}/35</span></span>
            <span className={theme.textMuted}>E: <span className={entryScore > 0 ? `${theme.text} font-bold` : theme.textDimmed}>{entryScore}/25</span></span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: Asset & Direction */}
          {currentStep === 0 && (
            <motion.div key="pair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 sm:space-y-4">
              <StepHeader number="01" title={t('assetDirection')} subtitle={t('selectPairDirection')} />

              <AssetSelector selectedPair={formData.pair} onSelect={(pair) => update('pair', pair)} />

              {formData.pair && (
                <div className="grid gap-2 sm:gap-3">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <LivePriceDisplay pair={formData.pair} darkMode={darkMode} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <MarketChart pair={formData.pair} darkMode={darkMode} />
                  </motion.div>
                </div>
              )}
              
              {formData.pair && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 sm:space-y-3">
                  
                  {/* Direction Selection */}
                  <label className={`${theme.textMuted} text-[10px] sm:text-xs tracking-widest block`}>{t('selectDirection')}</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <motion.button 
                      type="button" 
                      onClick={() => update('direction', 'long')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn("p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all font-bold tracking-wider relative overflow-hidden text-xs sm:text-sm",
                        formData.direction === 'long' ? "bg-teal-600 text-white border-teal-600" : `${theme.border} ${theme.text} hover:border-teal-600/50`)}>
                      {formData.direction === 'long' && (
                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      )}
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-1" />
                      LONG / BUY
                      <div className="text-[9px] sm:text-[10px] font-normal mt-0.5 opacity-80">{t('buyInAoi')}</div>
                    </motion.button>
                    <motion.button 
                      type="button" 
                      onClick={() => update('direction', 'short')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn("p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all font-bold tracking-wider relative overflow-hidden text-xs sm:text-sm",
                        formData.direction === 'short' ? "bg-rose-600 text-white border-rose-600" : `${theme.border} ${theme.text} hover:border-rose-600/50`)}>
                      {formData.direction === 'short' && (
                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      )}
                      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-1" />
                      SHORT / SELL
                      <div className="text-[9px] sm:text-[10px] font-normal mt-0.5 opacity-80">{t('sellInAoi')}</div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 1: Weekly */}
          {currentStep === 1 && (
            <motion.div key="weekly" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2 sm:space-y-3">
              <StepHeader number="02" title={t('weeklyAnalysis')} subtitle={t('weeklyConfirm')} />
              
              {/* Progress Bar */}
              <SectionProgressBar current={weeklyScore} max={60} label={t('weeklyScore')} darkMode={darkMode} />

              {/* Trend Selection - Compact */}
              <div className={`border ${theme.borderCard} rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 ${theme.bgSecondary}`}>
                <label className={`${theme.textMuted} text-[10px] sm:text-xs tracking-widest mb-2 block`}>{t('weeklyTrend')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['bullish', 'bearish'].map((trend) => (
                    <motion.button 
                      key={trend} 
                      type="button" 
                      onClick={() => update('w_trend', trend)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn("py-2 sm:py-2.5 md:py-3 rounded-lg border-2 transition-all font-bold text-xs sm:text-sm relative overflow-hidden",
                        formData.w_trend === trend 
                          ? trend === 'bullish' ? "bg-teal-600 text-white border-teal-600" : "bg-rose-600 text-white border-rose-600"
                          : `${theme.border} ${theme.text} hover:border-teal-600/50`)}>
                      {formData.w_trend === trend && (
                        <div className="absolute inset-0 bg-white/10" />
                      )}
                      {trend === 'bullish' ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5" />}
                      {trend.toUpperCase()}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <ChecklistItemWithTooltip 
                checked={formData.w_at_aoi} 
                onChange={(checked) => update('w_at_aoi', checked)} 
                label={t('atAoiRejected')} 
                weight={10} 
                description={t('atAoiDesc')}
                tooltip="Price must be at or rejecting your marked Area of Interest (support for LONG, resistance for SHORT)"
                darkMode={darkMode}
                show={formData.w_trend !== ''}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.w_ema_touch} 
                onChange={(checked) => update('w_ema_touch', checked)} 
                label={t('touchingEma')} 
                weight={5} 
                description={t('touchingEmaDesc')}
                tooltip="Candles are touching or rejecting the Exponential Moving Average on weekly chart"
                darkMode={darkMode}
                show={formData.w_at_aoi}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.w_candlestick} 
                onChange={(checked) => update('w_candlestick', checked)} 
                label={t('candlestickRejection')} 
                weight={10} 
                description={t('candlestickDesc')}
                tooltip="Look for Pinbar, Doji, or Hammer patterns showing clear price rejection"
                darkMode={darkMode}
                show={formData.w_trend !== ''}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.w_psp_rejection} 
                onChange={(checked) => update('w_psp_rejection', checked)} 
                label={t('rejectionPsp')} 
                weight={10} 
                description={t('rejectionPspDesc')}
                tooltip="Price rejecting from Previous Structure Point (old support/resistance level)"
                darkMode={darkMode}
                show={formData.w_candlestick || formData.w_at_aoi}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.w_round_level} 
                onChange={(checked) => update('w_round_level', checked)} 
                label={t('roundLevel')} 
                weight={5} 
                description={t('roundLevelDesc')}
                tooltip="Price at or rejecting psychological round numbers (e.g., 1.10000, 1.20000)"
                darkMode={darkMode}
                show={formData.w_trend !== ''}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.w_swing} 
                onChange={(checked) => update('w_swing', checked)} 
                label={t('swingHighLow')} 
                weight={5} 
                description={t('swingDesc')}
                tooltip="Price has reached a significant swing high (for SHORT) or swing low (for LONG)"
                darkMode={darkMode}
                show={formData.w_trend !== ''}
              />
              
              <PatternSelector 
                value={formData.w_pattern} 
                onChange={(v) => update('w_pattern', v)} 
                score={10}
                label={t('patternWeekly')}
                description={t('patternDesc')}
              />
            </motion.div>
          )}

          {/* STEP 2: Daily */}
          {currentStep === 2 && (
            <motion.div key="daily" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2 sm:space-y-3">
              <StepHeader number="03" title={t('dailyAnalysis')} subtitle={t('dailyConfirm')} />
              
              {/* Progress Bar */}
              <SectionProgressBar current={dailyScore} max={60} label={t('dailyScore')} darkMode={darkMode} />

              {/* Confluence Alert */}
              {formData.w_trend && formData.d_trend && formData.h4_trend && formData.w_trend === formData.d_trend && formData.d_trend === formData.h4_trend && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 ${darkMode ? 'bg-teal-600/10 border-teal-600/30' : 'bg-teal-500/10 border-teal-500/30'}`}>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                    <div>
                      <div className="text-teal-600 font-bold text-[10px] sm:text-xs tracking-wider">CONFLUENCE CONFIRMED</div>
                      <div className={`${darkMode ? 'text-zinc-400' : 'text-zinc-600'} text-[9px] sm:text-[10px] font-sans`}>W•D•4H aligned!</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Trend Selection - Compact */}
              <div className={`border ${theme.borderCard} rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 ${theme.bgSecondary}`}>
                <label className={`${theme.textMuted} text-[10px] sm:text-xs tracking-widest mb-2 block`}>{t('dailyTrend')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['bullish', 'bearish'].map((trend) => (
                    <motion.button 
                      key={trend} 
                      type="button" 
                      onClick={() => update('d_trend', trend)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn("py-2 sm:py-2.5 md:py-3 rounded-lg border-2 transition-all font-bold text-xs sm:text-sm relative overflow-hidden",
                        formData.d_trend === trend 
                          ? trend === 'bullish' ? "bg-teal-600 text-white border-teal-600" : "bg-rose-600 text-white border-rose-600"
                          : `${theme.border} ${theme.text} hover:border-teal-600/50`)}>
                      {formData.d_trend === trend && (
                        <div className="absolute inset-0 bg-white/10" />
                      )}
                      {trend === 'bullish' ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5" />}
                      {trend.toUpperCase()}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <ChecklistItemWithTooltip 
                checked={formData.d_at_aoi} 
                onChange={(checked) => update('d_at_aoi', checked)} 
                label={t('atAoiRejected')} 
                weight={10} 
                description={t('atAoiDesc')}
                tooltip="Daily timeframe confirms price at AOI zone"
                darkMode={darkMode}
                show={formData.d_trend !== ''}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.d_ema_touch} 
                onChange={(checked) => update('d_ema_touch', checked)} 
                label={t('touchingEma')} 
                weight={5} 
                description={t('touchingEmaDesc')}
                tooltip="Daily candles touching or rejecting EMA"
                darkMode={darkMode}
                show={formData.d_at_aoi}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.d_candlestick} 
                onChange={(checked) => update('d_candlestick', checked)} 
                label={t('candlestickRejection')} 
                weight={10} 
                description={t('candlestickDesc')}
                tooltip="Clear rejection candle (Pinbar, Doji, Hammer) on daily chart"
                darkMode={darkMode}
                show={formData.d_trend !== ''}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.d_psp_rejection} 
                onChange={(checked) => update('d_psp_rejection', checked)} 
                label={t('rejectionPsp')} 
                weight={10} 
                description={t('rejectionPspDesc')}
                tooltip="Rejection from previous structure point on daily"
                darkMode={darkMode}
                show={formData.d_candlestick || formData.d_at_aoi}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.d_round_level} 
                onChange={(checked) => update('d_round_level', checked)} 
                label={t('roundLevel')} 
                weight={5} 
                description={t('roundLevelDesc')}
                tooltip="Psychological round number on daily chart"
                darkMode={darkMode}
                show={formData.d_trend !== ''}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.d_swing} 
                onChange={(checked) => update('d_swing', checked)} 
                label={t('swingHighLow')} 
                weight={5} 
                description={t('swingDesc')}
                tooltip="Daily swing high/low reached"
                darkMode={darkMode}
                show={formData.d_trend !== ''}
              />
              
              <PatternSelector 
                value={formData.d_pattern} 
                onChange={(v) => update('d_pattern', v)} 
                score={10}
                label="PATTERN (DAILY)"
                description={t('patternDesc')}
              />
            </motion.div>
          )}

          {/* STEP 3: 4H */}
          {currentStep === 3 && (
            <motion.div key="h4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2 sm:space-y-3">
              <StepHeader number="04" title={t('h4Analysis')} subtitle={t('h4Confirm')} />
              
              {/* Progress Bar */}
              <SectionProgressBar current={h4Score} max={35} label={t('h4Score')} darkMode={darkMode} />

              {/* Trend Selection - Compact */}
              <div className={`border ${theme.borderCard} rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 ${theme.bgSecondary}`}>
                <label className={`${theme.textMuted} text-[10px] sm:text-xs tracking-widest mb-2 block`}>{t('h4Trend')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['bullish', 'bearish'].map((trend) => (
                    <motion.button 
                      key={trend} 
                      type="button" 
                      onClick={() => update('h4_trend', trend)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn("py-2 sm:py-2.5 md:py-3 rounded-lg border-2 transition-all font-bold text-xs sm:text-sm relative overflow-hidden",
                        formData.h4_trend === trend 
                          ? trend === 'bullish' ? "bg-teal-600 text-white border-teal-600" : "bg-rose-600 text-white border-rose-600"
                          : `${theme.border} ${theme.text} hover:border-teal-600/50`)}>
                      {formData.h4_trend === trend && (
                        <div className="absolute inset-0 bg-white/10" />
                      )}
                      {trend === 'bullish' ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5" />}
                      {trend.toUpperCase()}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <ChecklistItemWithTooltip 
                checked={formData.h4_at_aoi} 
                onChange={(checked) => update('h4_at_aoi', checked)} 
                label={t('atAoiRejected')} 
                weight={5} 
                description={t('atAoiDesc')}
                tooltip="4H price confirmation at AOI zone"
                darkMode={darkMode}
                show={formData.h4_trend !== ''}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.h4_candlestick} 
                onChange={(checked) => update('h4_candlestick', checked)} 
                label={t('candlestickRejection')} 
                weight={10} 
                description={t('candlestickDesc')}
                tooltip="4H rejection candle pattern visible"
                darkMode={darkMode}
                show={formData.h4_trend !== ''}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.h4_psp_rejection} 
                onChange={(checked) => update('h4_psp_rejection', checked)} 
                label={t('rejectionPsp')} 
                weight={5} 
                description={t('rejectionPspDesc')}
                tooltip="4H rejection from previous structure"
                darkMode={darkMode}
                show={formData.h4_candlestick || formData.h4_at_aoi}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.h4_swing} 
                onChange={(checked) => update('h4_swing', checked)} 
                label={t('swingHighLow')} 
                weight={5} 
                description={t('swingDesc')}
                tooltip="4H swing high/low confirmation"
                darkMode={darkMode}
                show={formData.h4_trend !== ''}
              />
              
              <PatternSelector 
                value={formData.h4_pattern} 
                onChange={(v) => update('h4_pattern', v)} 
                score={10}
                label="PATTERN (4H)"
                description="4H Timeframe"
              />
            </motion.div>
          )}

          {/* STEP 4: Entry */}
          {currentStep === 4 && (
            <motion.div key="entry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2 sm:space-y-3">
              <StepHeader number="05" title={t('entryChecklist')} subtitle={t('entryConfirm')} />
              
              {/* Entry Timeframe Info - Compact */}
              <div className={`p-2 sm:p-2.5 rounded-lg border ${darkMode ? 'bg-blue-600/10 border-blue-600/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-blue-400 font-bold tracking-wider text-[10px] sm:text-xs">{t('entryTimeframe')}</div>
                    <div className={`text-[9px] sm:text-[10px] ${darkMode ? 'text-zinc-400' : 'text-zinc-600'} font-sans leading-tight mt-0.5`}>30min oder 1H TF</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <SectionProgressBar current={entryScore} max={25} label={t('entryScoreLabel')} darkMode={darkMode} />
              
              <ChecklistItemWithTooltip 
                checked={formData.entry_sos} 
                onChange={(checked) => update('entry_sos', checked)} 
                label={t('mssShift')} 
                weight={10} 
                description={t('mssDesc')}
                tooltip="Market Structure Shift confirmed - price has reversed direction (30min-1H chart)"
                darkMode={darkMode}
              />
              
              <ChecklistItemWithTooltip 
                checked={formData.entry_engulfing} 
                onChange={(checked) => update('entry_engulfing', checked)} 
                label={t('engulfingCandle')} 
                weight={10} 
                description={t('engulfingDesc')}
                tooltip="Engulfing candle visible after pullback - strong reversal confirmation"
                darkMode={darkMode}
                show={formData.entry_sos}
              />
              
              <PatternSelector 
                value={formData.entry_pattern} 
                onChange={(v) => update('entry_pattern', v)} 
                score={5}
                label={t('patternIfAny')}
                description={t('patternIfAnyDesc')}
              />
              
              {/* Entry Type - Compact */}
              <div className={`border ${theme.borderCard} rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 ${theme.bgSecondary}`}>
                <label className={`${theme.textMuted} text-[10px] sm:text-xs tracking-widest mb-2 block`}>{t('entryTrigger')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => update('entry_type', 'pinbar')}
                    className={cn("p-2.5 sm:p-3 md:p-4 border-2 rounded-lg text-center transition-all",
                      formData.entry_type === 'pinbar' 
                        ? darkMode ? "bg-white border-white text-black" : "bg-black border-black text-white"
                        : darkMode ? "border-zinc-800 hover:border-zinc-600 bg-zinc-900 text-white" : "border-zinc-300 hover:border-zinc-400 bg-zinc-50 text-black")}>
                    <div className="text-lg sm:text-xl md:text-2xl mb-1">📍</div>
                    <div className="font-bold tracking-wider text-[10px] sm:text-xs">PINBAR</div>
                    <div className={cn("text-[8px] sm:text-[9px] mt-0.5 font-sans", formData.entry_type === 'pinbar' ? 'opacity-70' : 'opacity-50')}>Rejection</div>
                  </button>
                  <button type="button" onClick={() => update('entry_type', 'engulfing')}
                    className={cn("p-2.5 sm:p-3 md:p-4 border-2 rounded-lg text-center transition-all",
                      formData.entry_type === 'engulfing' 
                        ? darkMode ? "bg-white border-white text-black" : "bg-black border-black text-white"
                        : darkMode ? "border-zinc-800 hover:border-zinc-600 bg-zinc-900 text-white" : "border-zinc-300 hover:border-zinc-400 bg-zinc-50 text-black")}>
                    <div className="text-lg sm:text-xl md:text-2xl mb-1">🕯️</div>
                    <div className="font-bold tracking-wider text-[10px] sm:text-xs">ENGULFING</div>
                    <div className={cn("text-[8px] sm:text-[9px] mt-0.5 font-sans", formData.entry_type === 'engulfing' ? 'opacity-70' : 'opacity-50')}>Reversal</div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Risk Management */}
          {currentStep === 5 && (
          <motion.div key="risk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2 sm:space-y-3">
          <StepHeader number="06" title={t('riskManagementTitle')} subtitle={t('riskManagementSubtitle')} />

          {/* Selected Pair Display - Compact */}
          {formData.pair && (
            <div className={`border-2 rounded-lg sm:rounded-xl p-2 sm:p-2.5 ${darkMode ? 'border-teal-600 bg-teal-600/10' : 'border-teal-500 bg-teal-500/10'}`}>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <div className="text-[9px] sm:text-[10px] text-teal-600 tracking-wider">PAIR</div>
                  <div className={`text-base sm:text-lg md:text-xl font-bold tracking-wider ${theme.text}`}>{formData.pair}</div>
                </div>
              </div>
            </div>
          )}

          {/* Live Market Data - Compact */}
          {formData.pair && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <LivePriceDisplay pair={formData.pair} darkMode={darkMode} />
            </motion.div>
          )}

          {/* R:R Warning */}
          {riskCalc && parseFloat(riskCalc.rr) < 2.5 && formData.entry_price && formData.stop_loss && formData.take_profit && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 ${darkMode ? 'bg-amber-600/10 border-amber-600/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div>
                  <div className="text-amber-500 font-bold text-[10px] sm:text-xs tracking-wider">LOW R:R</div>
                  <div className={`${darkMode ? 'text-zinc-400' : 'text-zinc-600'} text-[9px] sm:text-[10px] font-sans`}>Min. 1:2.5 empfohlen</div>
                </div>
              </div>
            </motion.div>
          )}

          <AdvancedLotCalculator
            pair={formData.pair}
            direction={formData.direction}
            onDataChange={(data) => {
              if (data.account_size !== undefined) update('account_size', data.account_size);
              if (data.risk_percent !== undefined) update('risk_percent', data.risk_percent);
              if (data.leverage !== undefined) update('leverage', data.leverage);
              if (data.entry_price !== undefined) update('entry_price', data.entry_price);
              if (data.stop_loss !== undefined) update('stop_loss', data.stop_loss);
              if (data.take_profit !== undefined) update('take_profit', data.take_profit);
            }}
            initialData={{
              account_size: formData.account_size,
              risk_percent: formData.risk_percent,
              entry_price: formData.entry_price,
              stop_loss: formData.stop_loss,
              take_profit: formData.take_profit,
              leverage: formData.leverage,
            }}
            darkMode={darkMode}
          />
          </motion.div>
          )}

          {/* STEP 6: Final */}
          {currentStep === 6 && (
            <motion.div key="final" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2 sm:space-y-3">
              <StepHeader number="07" title={t('finalCheckTitle')} subtitle={t('finalCheckSubtitle')} />

              {/* Confluence Banner */}
              {hasConfluence && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 bg-gradient-to-r from-teal-600 to-teal-700 border-teal-500 text-white">
                  <div className="flex items-center justify-center gap-2">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                    <div className="text-sm sm:text-base font-bold tracking-wider">FULL CONFLUENCE</div>
                    <div className="text-[10px] sm:text-xs font-sans opacity-80">W•D•4H {formData.w_trend?.toUpperCase()}</div>
                  </div>
                </motion.div>
              )}

              {/* ZNPCV Rule Confirmation */}
              <div className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
                    <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-black' : 'text-white'}`} />
                  </div>
                  <div>
                    <div className={`${theme.text} font-bold tracking-widest text-xs sm:text-sm`}>{t('confirmRule')}</div>
                    <div className={`${theme.textMuted} text-[10px] sm:text-xs font-sans`}>Golden Rule</div>
                  </div>
                </div>
                
                {formData.direction === 'long' && (
                  <button type="button" onClick={() => update('confirms_rule', !formData.confirms_rule)}
                    className={cn("w-full p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 transition-all text-left",
                      formData.confirms_rule 
                        ? "bg-teal-600 border-teal-600 text-white" 
                        : darkMode ? "border-zinc-800 hover:border-teal-600/50 bg-zinc-950" : "border-zinc-300 hover:border-teal-600/50 bg-white")}>
                    <div className={cn("w-7 h-7 sm:w-8 sm:h-8 border-2 flex items-center justify-center rounded-lg transition-all flex-shrink-0",
                      formData.confirms_rule ? "border-white bg-white scale-110" : darkMode ? "border-zinc-700" : "border-zinc-400")}>
                      {formData.confirms_rule && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-bold tracking-wider text-xs sm:text-sm mb-0.5", formData.confirms_rule ? "text-white" : darkMode ? "text-white" : "text-black")}>
                        {t('buyInAboveAoi')}
                      </div>
                      <div className={cn("text-[10px] sm:text-xs font-sans", formData.confirms_rule ? "text-teal-100" : theme.textMuted)}>
                        ✓ {t('notBuyResistance')}
                      </div>
                    </div>
                  </button>
                )}
                
                {formData.direction === 'short' && (
                  <button type="button" onClick={() => update('confirms_rule', !formData.confirms_rule)}
                    className={cn("w-full p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 transition-all text-left",
                      formData.confirms_rule 
                        ? "bg-rose-600 border-rose-600 text-white" 
                        : darkMode ? "border-zinc-800 hover:border-rose-600/50 bg-zinc-950" : "border-zinc-300 hover:border-rose-600/50 bg-white")}>
                    <div className={cn("w-7 h-7 sm:w-8 sm:h-8 border-2 flex items-center justify-center rounded-lg transition-all flex-shrink-0",
                      formData.confirms_rule ? "border-white bg-white scale-110" : darkMode ? "border-zinc-700" : "border-zinc-400")}>
                      {formData.confirms_rule && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-bold tracking-wider text-xs sm:text-sm mb-0.5", formData.confirms_rule ? "text-white" : darkMode ? "text-white" : "text-black")}>
                        {t('sellInBelowAoi')}
                      </div>
                      <div className={cn("text-[10px] sm:text-xs font-sans", formData.confirms_rule ? "text-rose-100" : theme.textMuted)}>
                        ✓ {t('notSellSupport')}
                      </div>
                    </div>
                  </button>
                )}

                {!formData.direction && (
                  <div className={`${theme.textMuted} text-center py-6 font-sans`}>
                    <Shield className={`w-8 h-8 mx-auto mb-2 ${theme.textMuted}`} />
                    <div className="text-xs">{t('selectDirFirst')}</div>
                  </div>
                )}
              </div>

              {/* Trade Summary + Notes Grid */}
              <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                <div className={`border ${theme.borderCard} rounded-lg sm:rounded-xl p-3 sm:p-4 ${theme.bgSecondary}`}>
                  <h3 className={`${theme.text} font-bold tracking-widest text-xs mb-2 sm:mb-3`}>{t('tradeSummary')}</h3>
                  <div className="space-y-1">
                    <SummaryRow label="PAIR" value={formData.pair || '-'} />
                    <SummaryRow label="DIR" 
                      value={formData.direction === 'long' ? '↑ LONG' : formData.direction === 'short' ? '↓ SHORT' : '-'} 
                      color={formData.direction === 'long' ? 'teal' : formData.direction === 'short' ? 'rose' : null} />
                    <div className={`border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-300'} my-1.5`} />
                    <SummaryRow label="W" value={`${weeklyScore}/60`} color={weeklyScore >= 40 ? 'teal' : weeklyScore >= 25 ? 'amber' : null} />
                    <SummaryRow label="D" value={`${dailyScore}/60`} color={dailyScore >= 40 ? 'teal' : dailyScore >= 25 ? 'amber' : null} />
                    <SummaryRow label="4H" value={`${h4Score}/35`} color={h4Score >= 25 ? 'teal' : h4Score >= 15 ? 'amber' : null} />
                    <SummaryRow label="E" value={`${entryScore}/25`} color={entryScore >= 20 ? 'teal' : entryScore >= 10 ? 'amber' : null} />
                    {riskCalc && (
                      <>
                        <div className={`border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-300'} my-1.5`} />
                        <SummaryRow label="R:R" value={`1:${riskCalc.rr}`} color={parseFloat(riskCalc.rr) >= 2.5 ? 'teal' : 'amber'} />
                        <SummaryRow label="RISK" value={`$${riskCalc.riskAmount}`} color="rose" />
                      </>
                    )}
                  </div>
                </div>

                <div className={`border ${theme.borderCard} rounded-lg sm:rounded-xl p-3 sm:p-4 ${theme.bgSecondary}`}>
                  <label className={`block ${theme.textMuted} tracking-widest text-xs mb-2`}>{t('notesOptional')}</label>
                  <Textarea value={formData.notes} onChange={(e) => update('notes', e.target.value)} placeholder={t('notesPlaceholderLong')}
                    className={`${darkMode ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-white' : 'bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus:border-black'} min-h-[140px] rounded-lg font-sans text-xs`} />
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                <ScreenshotUpload 
                  label="SETUP"
                  description="Before Entry"
                  screenshots={formData.screenshots_before || []} 
                  onUpload={async (files) => {
                    const uploadPromises = files.map(file => 
                      base44.integrations.Core.UploadFile({ file })
                    );
                    const results = await Promise.all(uploadPromises);
                    const newUrls = results.map(r => r.file_url);
                    update('screenshots_before', [...(formData.screenshots_before || []), ...newUrls]);
                  }}
                  onDelete={(url) => {
                    update('screenshots_before', (formData.screenshots_before || []).filter(s => s !== url));
                  }}
                  darkMode={darkMode}
                  variant="before"
                />
                
                <ScreenshotUpload 
                  label="RESULT"
                  description="After Exit"
                  screenshots={formData.screenshots_after || []} 
                  onUpload={async (files) => {
                    const uploadPromises = files.map(file => 
                      base44.integrations.Core.UploadFile({ file })
                    );
                    const results = await Promise.all(uploadPromises);
                    const newUrls = results.map(r => r.file_url);
                    update('screenshots_after', [...(formData.screenshots_after || []), ...newUrls]);
                  }}
                  onDelete={(url) => {
                    update('screenshots_after', (formData.screenshots_after || []).filter(s => s !== url));
                  }}
                  darkMode={darkMode}
                  variant="after"
                />
              </div>

              {/* Final Grade + Breakdown Combined */}
              <div className="grid md:grid-cols-3 gap-2">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className={cn("md:col-span-2 p-4 sm:p-5 text-center rounded-lg sm:rounded-xl border-2 relative",
                    progress >= 100 ? "bg-teal-600 border-teal-600" :
                    progress >= 90 ? "bg-teal-500 border-teal-500" :
                    progress >= 85 ? "bg-blue-500 border-blue-500" :
                    progress >= 70 ? "bg-amber-500 border-amber-500" :
                    darkMode ? "bg-zinc-900 border-rose-600" : "bg-zinc-100 border-rose-600")}>
                  
                  {hasConfluence && progress >= 85 && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[8px] font-bold text-white flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      CONFL
                    </div>
                  )}
                  
                  <div className={cn("text-3xl sm:text-4xl md:text-5xl font-bold mb-1", progress >= 70 ? "text-white" : darkMode ? "text-white" : "text-black")}>{gradeInfo.grade}</div>
                  <div className={cn("text-xl sm:text-2xl md:text-3xl tracking-widest mb-1", progress >= 70 ? "text-white/80" : darkMode ? "text-white/70" : "text-black/70")}>{progress}%</div>
                  <div className={cn("text-[10px] sm:text-xs font-sans", progress >= 70 ? "text-white/60" : darkMode ? "text-white/60" : "text-black/60")}>
                    {progress >= 85 ? `✓ ${t('readyToTradeLabel')}` : t('notRecommended')}
                  </div>
                  {riskCalc && parseFloat(riskCalc.rr) >= 2.5 && (
                    <div className={cn("mt-2 pt-2 border-t text-[9px] font-sans", progress >= 70 ? "border-white/20 text-white/60" : darkMode ? "border-zinc-800 text-white/50" : "border-zinc-300 text-black/50")}>
                      R:R 1:{riskCalc.rr} ✓
                    </div>
                  )}
                </motion.div>

                <div className={`p-3 ${theme.bgSecondary} border ${theme.borderCard} rounded-lg sm:rounded-xl`}>
                  <div className={`text-[10px] ${theme.textMuted} tracking-widest mb-2 text-center`}>{t('pointsBreakdown')}</div>
                  <div className="space-y-1">
                    {[
                      { label: 'W', score: weeklyScore, max: 60 },
                      { label: 'D', score: dailyScore, max: 60 },
                      { label: '4H', score: h4Score, max: 35 },
                      { label: 'E', score: entryScore, max: 25 }
                    ].map((item) => (
                      <div key={item.label} className={`flex justify-between items-center p-1.5 rounded ${darkMode ? 'bg-zinc-950' : 'bg-zinc-200'}`}>
                        <span className={`${theme.textMuted} text-[10px]`}>{item.label}</span>
                        <span className={`${theme.text} font-bold text-xs`}>{item.score}/{item.max}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-2 p-1.5 rounded text-center font-bold text-xs ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    {progress}/180
                  </div>
                </div>
              </div>

              <TradingQuote variant="minimal" />

              <div className="flex justify-center py-4">
                <img 
                  src={darkMode 
                    ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                    : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                  }
                  alt="ZNPCV" 
                  className="h-14 sm:h-16 md:h-20 w-auto opacity-20"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons - Compact */}
        <div className="mt-4 sm:mt-6 md:mt-8 flex gap-1.5 sm:gap-2 md:gap-3">
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(prev => prev - 1)} variant="outline" 
              className={`rounded-lg sm:rounded-xl tracking-widest px-3 sm:px-4 md:px-5 h-10 sm:h-11 md:h-12 border-2 text-xs sm:text-sm md:text-base ${
                darkMode 
                  ? 'border-zinc-800 text-white hover:bg-zinc-900 hover:border-zinc-700' 
                  : 'border-zinc-300 text-black hover:bg-zinc-200 hover:border-zinc-400'
              }`}>
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /> <span className="hidden sm:inline">{t('back')}</span>
            </Button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <Button 
              onClick={() => setCurrentStep(prev => prev + 1)} 
              disabled={currentStep === 0 && !formData.pair}
              className={`flex-1 rounded-lg sm:rounded-xl tracking-widest text-xs sm:text-sm md:text-base h-10 sm:h-11 md:h-12 font-bold border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode 
                  ? 'bg-white hover:bg-zinc-200 text-black border-white' 
                  : 'bg-black hover:bg-zinc-800 text-white border-black'
              }`}>
              {t('next')} <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex-1 flex gap-1.5 sm:gap-2">
              {checklistId && (
                <Button onClick={handleDelete} variant="outline" 
                  className={`rounded-lg sm:rounded-xl px-2.5 sm:px-3 md:px-4 h-10 sm:h-11 md:h-12 border-2 ${
                    darkMode 
                      ? 'border-rose-600 text-rose-400 hover:bg-rose-600/10' 
                      : 'border-red-600 text-red-600 hover:bg-red-50'
                  }`}>
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
              <Button onClick={() => handleSave(false)} disabled={saving || !formData.pair}
                className={cn("flex-1 rounded-lg sm:rounded-xl tracking-widest text-xs sm:text-sm md:text-base h-10 sm:h-11 md:h-12 font-bold border-2",
                  isReady 
                    ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600" 
                    : darkMode 
                      ? "bg-white hover:bg-zinc-200 text-black border-white" 
                      : "bg-black hover:bg-zinc-800 text-white border-black")}>
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {saving ? t('saving') : t('saveTrade')}
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
                {t('warningScore')}
              </p>
              
              <div className={cn("rounded-xl p-5 mb-6", gradeInfo.color)}>
                <div className="text-4xl font-bold text-black mb-1">{progress}%</div>
                <div className="text-lg font-bold text-black/80">{gradeInfo.grade}</div>
              </div>

              <div className="space-y-3">
                <Button onClick={() => { setShowWarning(false); navigate(createPageUrl('Dashboard')); }}
                  className="w-full bg-white hover:bg-zinc-200 text-black rounded-xl h-11 tracking-widest font-bold border-2 border-white">
                  {t('doNotEnter')}
                </Button>
                <Button onClick={() => { setShowWarning(false); handleSave(true); }} variant="ghost"
                  className="w-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl h-10 text-sm">
                  {t('saveAnyway')}
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
            onClick={scrollToTop} className={`fixed bottom-6 right-6 w-11 h-11 flex items-center justify-center shadow-lg transition-colors z-50 rounded-full ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components  
function StepHeader({ number, title, subtitle }) {
  const { darkMode } = useLanguage();
  return (
    <div className="text-center mb-2 sm:mb-3 md:mb-4">
      <div className={`text-xl sm:text-2xl md:text-3xl font-light mb-0.5 ${darkMode ? 'text-zinc-800' : 'text-zinc-300'}`}>{number}</div>
      <h2 className={`text-sm sm:text-base md:text-lg lg:text-xl tracking-widest mb-0.5 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
      <p className={`text-[9px] sm:text-[10px] md:text-xs tracking-wider ${darkMode ? 'text-zinc-600' : 'text-zinc-500'} px-2`}>{subtitle}</p>
    </div>
  );
}



function PatternSelector({ value, onChange, score, label, description }) {
  const { t, darkMode } = useLanguage();
  const patterns = [
    { key: 'double_top', label: t('dblTop'), icon: 'double_top', desc: 'Bearish Reversal' },
    { key: 'double_bottom', label: t('dblBtm'), icon: 'double_bottom', desc: 'Bullish Reversal' },
    { key: 'head_shoulders', label: t('hs'), icon: 'hs', desc: 'Bearish Pattern' },
    { key: 'inv_head_shoulders', label: t('invHs'), icon: 'inv_hs', desc: 'Bullish Pattern' },
    { key: 'none', label: t('none'), icon: 'none', desc: 'Kein Pattern' },
  ];

  const theme = {
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    bgCard: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    textMuted: darkMode ? 'text-zinc-600' : 'text-zinc-500',
  };

  const PatternIcon = ({ type, className }) => {
    const baseClass = cn("w-full h-full", className);
    
    if (type === 'double_top') {
      return (
        <svg viewBox="0 0 24 16" className={baseClass}>
          <path d="M2 14 L6 4 L10 10 L14 4 L18 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (type === 'double_bottom') {
      return (
        <svg viewBox="0 0 24 16" className={baseClass}>
          <path d="M2 2 L6 12 L10 6 L14 12 L18 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (type === 'hs') {
      return (
        <svg viewBox="0 0 24 16" className={baseClass}>
          <path d="M2 12 L5 8 L8 10 L12 2 L16 10 L19 8 L22 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (type === 'inv_hs') {
      return (
        <svg viewBox="0 0 24 16" className={baseClass}>
          <path d="M2 4 L5 8 L8 6 L12 14 L16 6 L19 8 L22 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 16" className={baseClass}>
        <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  };

  return (
    <div className={`border rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0 flex-1">
          <label className={`text-[10px] sm:text-xs tracking-widest block ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{label}</label>
          {description && <span className={`text-[9px] sm:text-[10px] hidden sm:block ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>{description}</span>}
        </div>
        {value && value !== 'none' && (
        <div className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-teal-600 text-white flex-shrink-0">+{score}%</div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
        {patterns.map((pattern) => (
          <button key={pattern.key} type="button" onClick={() => onChange(pattern.key)}
            className={cn("p-1.5 sm:p-2 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center gap-0.5 sm:gap-1 group relative",
              value === pattern.key
                ? pattern.key === 'none' 
                  ? darkMode ? "bg-zinc-700 border-zinc-600 text-white" : "bg-zinc-400 border-zinc-400 text-white"
                  : "bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-600/20"
                : darkMode 
                  ? "border-zinc-800 text-zinc-500 hover:border-zinc-700 bg-zinc-900 hover:text-white"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400 bg-zinc-50 hover:text-black")}>
            {value === pattern.key && pattern.key !== 'none' && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                <Check className="w-1.5 h-1.5 text-teal-600" strokeWidth={4} />
              </div>
            )}
            <div className="w-5 h-3.5 sm:w-6 sm:h-4 md:w-7 md:h-5">
              <PatternIcon type={pattern.icon} />
            </div>
            <div className="text-[7px] sm:text-[8px] md:text-[9px] tracking-wider font-bold leading-tight">{pattern.label}</div>
            <div className={cn("text-[6px] sm:text-[7px] opacity-70 font-sans leading-tight", value === pattern.key && pattern.key !== 'none' ? 'text-white' : theme.textMuted)}>
              {pattern.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }) {
  const { darkMode } = useLanguage();
  const colorClasses = {
    teal: 'text-teal-600',
    rose: 'text-rose-600',
    amber: 'text-amber-500',
    blue: 'text-blue-400'
  };
  
  return (
    <div className="flex justify-between items-center py-1 sm:py-1.5 md:py-2">
      <span className={`text-[10px] sm:text-xs tracking-wider ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>{label}</span>
      <span className={cn("font-bold text-xs sm:text-sm", color ? colorClasses[color] : darkMode ? "text-white" : "text-black")}>{value}</span>
    </div>
  );
}

function ScreenshotUpload({ label, description, screenshots, onUpload, onDelete, darkMode, variant }) {
  const [uploadingLocal, setUploadingLocal] = useState(false);

  const theme = {
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
  };

  const variantColors = {
    before: darkMode ? 'border-blue-600/50 bg-blue-600/5' : 'border-blue-500/50 bg-blue-500/5',
    after: darkMode ? 'border-teal-600/50 bg-teal-600/5' : 'border-teal-500/50 bg-teal-500/5',
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setUploadingLocal(true);
    try {
      await onUpload(files);
    } finally {
      setUploadingLocal(false);
      e.target.value = '';
    }
  };

  return (
    <div className={cn("border rounded-lg p-2 sm:p-2.5", 
      variant ? variantColors[variant] : darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100')}>
      
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] sm:text-xs font-bold tracking-wider">
          {label}
          {description && <span className={`${theme.textSecondary} text-[9px] font-sans ml-1`}>• {description}</span>}
        </div>
        {screenshots && screenshots.length > 0 && (
          <div className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
            variant === 'before' ? 'bg-blue-600 text-white' : 'bg-teal-600 text-white'
          }`}>
            {screenshots.length}
          </div>
        )}
      </div>
      
      {screenshots && screenshots.length > 0 && (
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mb-1.5">
          {screenshots.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={url} alt={`${index + 1}`} className={`w-full h-full object-cover rounded border ${theme.border}`} />
              <button 
                onClick={() => onDelete(url)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <XIcon className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className={cn("flex items-center justify-center gap-1.5 p-1.5 sm:p-2 border border-dashed rounded cursor-pointer transition-all",
        uploadingLocal ? "opacity-50 cursor-not-allowed" : darkMode ? "border-zinc-700 hover:border-zinc-600 bg-zinc-900/50" : "border-zinc-400 hover:border-zinc-500 bg-white/50")}>
        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploadingLocal} />
        {uploadingLocal ? (
          <>
            <div className={`animate-spin w-3 h-3 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full`} />
            <span className={`text-[9px] ${theme.textSecondary} font-sans`}>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className={`w-3 h-3 ${theme.textSecondary}`} />
            <span className={`text-[9px] sm:text-[10px] tracking-wider ${theme.text}`}>UPLOAD</span>
          </>
        )}
      </label>
    </div>
  );
}