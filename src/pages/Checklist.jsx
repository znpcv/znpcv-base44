import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Check, ChevronRight, ChevronLeft, Home, ArrowUp, AlertTriangle, XOctagon, Calculator, TrendingUp, TrendingDown, Shield, Target, DollarSign, Percent, Info, Layers, Upload, Image as ImageIcon, X as XIcon } from 'lucide-react';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { sanitizeFormData, validateText, LIMITS } from '@/lib/inputValidation';
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
import LivePriceChart from '@/components/LivePriceChart';
import NoTradeSkills from '@/components/checklist/NoTradeSkills';
import ProductPaywall from '@/components/ProductPaywall';

const STEPS = ['pair', 'weekly', 'daily', 'h4', 'entry', 'risk', 'final'];

export default function ChecklistPage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const [searchParams] = useSearchParams();
  const checklistId = searchParams.get('id');

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasStrategyAccess, setHasStrategyAccess] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const DRAFT_KEY = 'znpcv_checklist_draft';

  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    pair: '',
    trade_date: format(new Date(), 'yyyy-MM-dd'),
    direction: '',

    // Weekly Checklist (max 60%)
    w_trend: '', // bullish/bearish
    w_at_aoi: false, // 10%
    w_ema_touch: false, // 5%
    w_candlestick: false, // 10%
    w_psp_rejection: false, // 10%
    w_round_level: false, // 5%
    w_swing: false, // 10%
    w_pattern: '', // 10%

    // Daily Checklist (max 60%)
    d_trend: '', // bullish/bearish
    d_at_aoi: false, // 10%
    d_ema_touch: false, // 5%
    d_candlestick: false, // 10%
    d_psp_rejection: false, // 10%
    d_round_level: false, // 5%
    d_swing: false, // 10%
    d_pattern: '', // 10%

    // 4H Checklist (max 35%)
    h4_trend: '', // bullish/bearish
    h4_at_aoi: false, // 5%
    h4_candlestick: false, // 10%
    h4_psp_rejection: false, // 5%
    h4_swing: false, // 5%
    h4_pattern: '', // 10%

    // Entry Checklist (max 25%)
    entry_sos: false, // 10%
    entry_engulfing: false, // 10%
    entry_pattern: '', // 5%
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
    const init = async () => {
      try {
        const user = await base44.auth.me();
        const checklistOk = !!user.checklist_lifetime_access || !!user.stripe_subscription_active || user.role === 'admin';
        const strategyOk = !!user.strategy_access || user.role === 'admin';
        if (checklistOk) setHasAccess(true);
        setHasStrategyAccess(strategyOk);
      } catch {}
      if (checklistId) {
        await loadChecklist();
      } else {
        // Try to restore draft for new checklists
        try {
          const saved = localStorage.getItem(DRAFT_KEY);
          if (saved) {
            const draft = JSON.parse(saved);
            if (draft && draft.pair) {
              setFormData((prev) => ({ ...prev, ...draft }));
              setDraftRestored(true);
              setTimeout(() => setDraftRestored(false), 4000);
            }
          }
        } catch {}
        await loadDefaults();
        setIsLoading(false);
      }
    };
    init();
  }, [checklistId]);

  const loadDefaults = async () => {
    try {
      const user = await base44.auth.me();
      if (user.default_leverage) update('leverage', user.default_leverage);
      if (user.default_risk_percent) update('risk_percent', user.default_risk_percent);
    } catch (error) {
      console.error('Load defaults failed:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadChecklist = async () => {
    try {
      const data = await base44.entities.TradeChecklist.filter({ id: checklistId });
      if (data.length > 0) setFormData((prev) => ({ ...prev, ...data[0] }));
    } catch (error) {
      console.error('Load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const update = (key, value) => {
    // Enforce field-level length limits on free-text fields
    if (key === 'pair' && typeof value === 'string' && value.length > LIMITS.PAIR) return;
    if (key === 'notes' && typeof value === 'string' && value.length > LIMITS.NOTES) return;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Calculate scores - FINAL CORRECTED (MOVED BEFORE EFFECTS)
  const weeklyScore = (formData.w_at_aoi ? 10 : 0) + (formData.w_ema_touch ? 5 : 0) + (
  formData.w_candlestick ? 10 : 0) + (formData.w_psp_rejection ? 10 : 0) + (
  formData.w_round_level ? 5 : 0) + (formData.w_swing ? 10 : 0) + (
  formData.w_pattern && formData.w_pattern !== 'none' ? 10 : 0);

  const dailyScore = (formData.d_at_aoi ? 10 : 0) + (formData.d_ema_touch ? 5 : 0) + (
  formData.d_candlestick ? 10 : 0) + (formData.d_psp_rejection ? 10 : 0) + (
  formData.d_round_level ? 5 : 0) + (formData.d_swing ? 5 : 0) + (
  formData.d_pattern && formData.d_pattern !== 'none' ? 10 : 0);

  const h4Score = (formData.h4_at_aoi ? 5 : 0) + (formData.h4_candlestick ? 10 : 0) + (
  formData.h4_psp_rejection ? 5 : 0) + (formData.h4_swing ? 5 : 0) + (
  formData.h4_pattern && formData.h4_pattern !== 'none' ? 10 : 0);

  const entryScore = (formData.entry_sos ? 10 : 0) + (formData.entry_engulfing ? 10 : 0) + (
  formData.entry_pattern && formData.entry_pattern !== 'none' ? 5 : 0);

  const progress = weeklyScore + dailyScore + h4Score + entryScore;

  // Check for confluence (all trends in same direction)
  const hasConfluence = formData.w_trend && formData.d_trend && formData.h4_trend &&
  formData.w_trend === formData.d_trend && formData.d_trend === formData.h4_trend;

  // Auto-Save: persists to backend for existing checklists, to localStorage for new ones
  useEffect(() => {
    if (!formData.pair) return;

    const timer = setTimeout(async () => {
      if (checklistId) {
        // Existing trade → save to backend
        try {
          const sanitized = sanitizeFormData(formData);
          const data = {
            ...sanitized,
            trade_date: sanitized.trade_date || format(new Date(), 'yyyy-MM-dd'),
            completion_percentage: progress,
            status: progress >= 85 ? 'ready_to_trade' : 'in_progress'
          };
          await base44.entities.TradeChecklist.update(checklistId, data);
          setSaveError(null);
          if (window.queryClient) {
            window.queryClient.invalidateQueries({ queryKey: ['checklists'] });
          }
        } catch (error) {
          if (error?.status === 403 || error?.status === 401) {
            setSaveError('Keine Berechtigung. Diese Analyse gehört nicht deinem Account.');
          } else {
            setSaveError('Automatisches Speichern fehlgeschlagen. Bitte manuell speichern.');
          }
        }
      } else {
        // New trade → save draft to localStorage
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        } catch {}
      }
    }, 1500);

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
    const tpDistance = tp ? isLong ? tp - entry : entry - tp : 0;

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

  const handleNoTrade = async (conditions) => {
    try {
      const confluenceCount = [
        formData.w_trend === formData.direction,
        formData.d_trend === formData.direction,
        formData.h4_trend === formData.direction
      ].filter(Boolean).length;

      const primaryReason = conditions.find(c => c.severity === 'high')?.id || conditions[0]?.id;

      await base44.entities.NoTradeLog.create({
        pair: formData.pair,
        direction: formData.direction,
        reason: primaryReason,
        score: progress,
        confluence_count: confluenceCount,
        rr_ratio: riskCalc?.rr || '0',
        notes: `No-Trade: ${conditions.map(c => c.title).join(', ')}`,
        avoided_date: format(new Date(), 'yyyy-MM-dd')
      });

      // Invalidate queries
      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['noTradeLogs'] });
      }

      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Log no-trade failed:', error);
    }
  };

  const handleSave = async (force = false) => {
    if (progress < 85 && !force && currentStep === STEPS.length - 1) {
      setShowWarning(true);
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      const sanitized = sanitizeFormData(formData);
      const data = {
        ...sanitized,
        trade_date: sanitized.trade_date || format(new Date(), 'yyyy-MM-dd'),
        completion_percentage: progress,
        status: progress >= 85 ? 'ready_to_trade' : 'in_progress'
      };

      if (checklistId) await base44.entities.TradeChecklist.update(checklistId, data);
      else await base44.entities.TradeChecklist.create(data);

      // Clear draft after successful save
      try { localStorage.removeItem(DRAFT_KEY); } catch {}

      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['checklists'] });
      }

      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      if (error?.status === 403 || error?.status === 401) {
        setSaveError('Keine Berechtigung. Diese Analyse gehört nicht deinem Account.');
      } else {
        setSaveError('Speichern fehlgeschlagen. Bitte erneut versuchen.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    try {
      if (checklistId) {
        await base44.entities.TradeChecklist.update(checklistId, {
          deleted: true,
          deleted_date: new Date().toISOString()
        });
      }
      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['checklists'] });
      }
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      if (error?.status === 403 || error?.status === 401) {
        setSaveError('Keine Berechtigung. Diese Analyse kann nicht gelöscht werden.');
      } else {
        setSaveError('Löschen fehlgeschlagen. Bitte erneut versuchen.');
      }
    }
  };

  const getGrade = (p) => {
    if (p >= 100) return { grade: 'A+++', color: 'bg-emerald-700', border: 'border-emerald-700' };
    if (p >= 90) return { grade: 'A++', color: 'bg-teal-500', border: 'border-emerald-600' };
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
    scoreBg: darkMode ? 'bg-zinc-900/50' : 'bg-zinc-100/50'
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className={`w-16 h-16 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <div className={`${theme.text} text-xl tracking-widest`}>{t('loading')}</div>
        </motion.div>
      </div>);
  }

  // Guard — Zugang zur Checkliste benötigt checklist_lifetime_access (oder Legacy stripe_subscription_active)
  // strategy_access ist NICHT erforderlich für den Checklisten-Einstieg
  if (!hasAccess) {
    return <ProductPaywall darkMode={darkMode} mode="checklist" />;
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-3xl mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(createPageUrl('Dashboard'))} className={`p-1.5 sm:p-2 ${theme.textMuted} hover:${theme.text} transition-colors rounded-lg ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-200'}`}>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img src={darkMode ?
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png" :
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              } alt="ZNPCV" className="h-8 sm:h-10 md:h-12 w-auto cursor-pointer hover:opacity-80" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2">
              <DarkModeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
        
        {/* Draft Restored Banner */}
        {draftRestored && (
          <div className="bg-emerald-700 text-white text-xs font-bold tracking-wider text-center py-2 px-4 font-sans flex items-center justify-center gap-2">
            <span>Entwurf wiederhergestellt</span>
            <button
              onClick={() => {
                try { localStorage.removeItem(DRAFT_KEY); } catch {}
                setFormData((prev) => ({ ...prev, pair: '', direction: '', w_trend: '', d_trend: '', h4_trend: '' }));
                setDraftRestored(false);
              }}
              className="underline opacity-80 hover:opacity-100"
            >Verwerfen</button>
          </div>
        )}

        {/* Save Error Banner */}
        {saveError && (
          <div className="bg-rose-600 text-white text-xs font-bold tracking-wider text-center py-2 px-4 font-sans">
            {saveError}
          </div>
        )}

        {/* Progress Bar */}
        <div className={theme.progressBg}>
          <motion.div className={cn("h-1", gradeInfo.color)} initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.5 }} />
        </div>
      </header>

      {/* Steps Navigation */}
      <div className={`${theme.navBg} border-b ${theme.border} overflow-x-auto scrollbar-hide`}>
        <div className="max-w-3xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex gap-0.5 sm:gap-1">
          {STEPS.map((step, index) =>
          <button key={step} onClick={() => setCurrentStep(index)}
          className={cn("px-1.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs tracking-wider sm:tracking-widest whitespace-nowrap transition-all rounded-md sm:rounded-lg flex-1 min-w-0",
          currentStep === index ?
          darkMode ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-white font-bold' :
          `${theme.textDimmed} ${darkMode ? 'hover:text-white hover:bg-zinc-900' : 'hover:text-black hover:bg-zinc-200'}`)}>
              <span className="hidden sm:inline">{index + 1}. </span>{stepLabels[step]}
            </button>
          )}
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
              {hasConfluence &&
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-700 text-white text-[9px] sm:text-[10px] font-bold animate-pulse">
                  <Layers className="w-3 h-3" />
                  CONFLUENCE
                </div>
              }
            </div>
            <span className={`${theme.textMuted} text-xs`}>MAX: 180%</span>
          </div>
          
          {/* Score Details */}
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
            <span className={theme.textMuted}>W:<span className={weeklyScore > 0 ? `${theme.text} font-bold ml-0.5` : `${theme.textDimmed} ml-0.5`}>{weeklyScore}/60</span></span>
            <span className={theme.textMuted}>D:<span className={dailyScore > 0 ? `${theme.text} font-bold ml-0.5` : `${theme.textDimmed} ml-0.5`}>{dailyScore}/60</span></span>
            <span className={theme.textMuted}>4H:<span className={h4Score > 0 ? `${theme.text} font-bold ml-0.5` : `${theme.textDimmed} ml-0.5`}>{h4Score}/35</span></span>
            <span className={theme.textMuted}>E:<span className={entryScore > 0 ? `${theme.text} font-bold ml-0.5` : `${theme.textDimmed} ml-0.5`}>{entryScore}/25</span></span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-5 md:py-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: Asset & Direction */}
          {currentStep === 0 &&
          <motion.div key="pair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.1 }} className="space-y-3">
              <StepHeader number="01" title={t('assetDirection')} subtitle={t('selectPairDirection')} />

              <AssetSelector selectedPair={formData.pair} onSelect={(pair) => update('pair', pair)} />

              {formData.pair &&
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}>
                  <LivePriceChart pair={formData.pair} darkMode={darkMode} />
                </motion.div>
            }
              
              {formData.pair &&
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="space-y-3">
                  {/* Trade Date Input */}
                  <div className={`border ${theme.borderCard} rounded-xl p-3 ${theme.bgSecondary}`}>
                    <label className={`${theme.textMuted} text-[10px] tracking-widest block mb-2`}>HANDELSDATUM</label>
                    <Input
                      type="date"
                      value={formData.trade_date}
                      onChange={(e) => update('trade_date', e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      className={`${darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black'} rounded-lg text-sm font-mono h-11`}
                    />
                  </div>
                  
                  {/* Direction Selection */}
                  <label className={`${theme.textMuted} text-[10px] tracking-widest block`}>{t('selectDirection')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                  type="button"
                  onClick={() => update('direction', 'long')}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className={cn("py-4 px-3 rounded-xl border-2 transition-all font-bold tracking-wider relative overflow-hidden text-sm",
                  formData.direction === 'long' ? "bg-emerald-700 text-white border-emerald-700" : `${theme.borderCard} ${theme.text}`)}>
                      {formData.direction === 'long' &&
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                  }
                      <TrendingUp className="w-6 h-6 mx-auto mb-1.5" />
                      LONG / BUY
                      <div className="text-[10px] font-normal mt-1 opacity-80">{t('buyInAoi')}</div>
                    </motion.button>
                    <motion.button
                  type="button"
                  onClick={() => update('direction', 'short')}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className={cn("py-4 px-3 rounded-xl border-2 transition-all font-bold tracking-wider relative overflow-hidden text-sm",
                  formData.direction === 'short' ? "bg-rose-600 text-white border-rose-600" : `${theme.borderCard} ${theme.text}`)}>
                      {formData.direction === 'short' &&
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                  }
                      <TrendingDown className="w-6 h-6 mx-auto mb-1.5" />
                      SHORT / SELL
                      <div className="text-[10px] font-normal mt-1 opacity-80">{t('sellInAoi')}</div>
                    </motion.button>
                  </div>
                </motion.div>
            }
            </motion.div>
          }

          {/* STEP 1: Weekly */}
          {currentStep === 1 &&
          <motion.div key="weekly" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.1 }} className="space-y-3">
              <StepHeader number="02" title={t('weeklyAnalysis')} subtitle={t('weeklyConfirm')} />
              
              <SectionProgressBar current={weeklyScore} max={60} label={t('weeklyScore')} darkMode={darkMode} />

              <div className={`border ${theme.borderCard} rounded-xl p-3 ${theme.bgSecondary}`}>
                <label className={`${theme.textMuted} text-[10px] tracking-widest mb-2 block`}>{t('weeklyTrend')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['bullish', 'bearish'].map((trend) =>
                <motion.button
                  key={trend}
                  type="button"
                  onClick={() => update('w_trend', trend)}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className={cn("py-3.5 rounded-xl border-2 transition-all font-bold text-sm relative overflow-hidden",
                  formData.w_trend === trend ?
                  trend === 'bullish' ? "bg-emerald-700 text-white border-emerald-700" : "bg-rose-600 text-white border-rose-600" :
                  `${theme.borderCard} ${theme.text}`)}>
                      {formData.w_trend === trend &&
                  <div className="absolute inset-0 bg-white/10" />
                  }
                      {trend === 'bullish' ? <TrendingUp className="w-5 h-5 mx-auto mb-1" /> : <TrendingDown className="w-5 h-5 mx-auto mb-1" />}
                      {trend.toUpperCase()}
                    </motion.button>
                )}
                </div>
              </div>
              
              <ChecklistItemWithTooltip
              checked={formData.w_at_aoi}
              onChange={(checked) => update('w_at_aoi', checked)}
              label={t('atAoiRejected')}
              weight={10}
              description={t('atAoiDesc')}
              tooltip={t('tooltipAoiWeekly')}
              darkMode={darkMode}
              show={formData.w_trend !== ''} />

              
              <ChecklistItemWithTooltip
              checked={formData.w_ema_touch}
              onChange={(checked) => update('w_ema_touch', checked)}
              label={t('touchingEma')}
              weight={5}
              description={t('touchingEmaDesc')}
              tooltip={t('tooltipEmaWeekly')}
              darkMode={darkMode}
              show={formData.w_at_aoi} />

              
              <ChecklistItemWithTooltip
              checked={formData.w_candlestick}
              onChange={(checked) => update('w_candlestick', checked)}
              label={t('candlestickRejection')}
              weight={10}
              description={t('candlestickDesc')}
              tooltip={t('tooltipCandlestickWeekly')}
              darkMode={darkMode}
              show={formData.w_trend !== ''} />

              
              <ChecklistItemWithTooltip
              checked={formData.w_psp_rejection}
              onChange={(checked) => update('w_psp_rejection', checked)}
              label={t('rejectionPsp')}
              weight={10}
              description={t('rejectionPspDesc')}
              tooltip={t('tooltipPspWeekly')}
              darkMode={darkMode}
              show={formData.w_candlestick || formData.w_at_aoi} />

              
              <ChecklistItemWithTooltip
              checked={formData.w_round_level}
              onChange={(checked) => update('w_round_level', checked)}
              label={t('roundLevel')}
              weight={5}
              description={t('roundLevelDesc')}
              tooltip={t('tooltipRoundWeekly')}
              darkMode={darkMode}
              show={formData.w_trend !== ''} />

              
              <ChecklistItemWithTooltip
              checked={formData.w_swing}
              onChange={(checked) => update('w_swing', checked)}
              label={t('swingHighLow')}
              weight={5}
              description={t('swingDesc')}
              tooltip={t('tooltipSwingWeekly')}
              darkMode={darkMode}
              show={formData.w_trend !== ''} />

              
              <PatternSelector
              value={formData.w_pattern}
              onChange={(v) => update('w_pattern', v)}
              score={10}
              label={t('patternWeekly')}
              description={t('patternDesc')} />

            </motion.div>
          }

          {/* STEP 2: Daily */}
          {currentStep === 2 &&
          <motion.div key="daily" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.1 }} className="space-y-3">
              <StepHeader number="03" title={t('dailyAnalysis')} subtitle={t('dailyConfirm')} />
              
              <SectionProgressBar current={dailyScore} max={60} label={t('dailyScore')} darkMode={darkMode} />

              {formData.w_trend && formData.d_trend && formData.h4_trend && formData.w_trend === formData.d_trend && formData.d_trend === formData.h4_trend &&
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
            className={`p-3 rounded-xl border-2 ${darkMode ? 'bg-emerald-700/10 border-emerald-700/30' : 'bg-teal-500/10 border-emerald-600/30'}`}>
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-emerald-600 font-bold text-xs tracking-wider">CONFLUENCE CONFIRMED</div>
                      <div className={`${darkMode ? 'text-zinc-400' : 'text-zinc-600'} text-[10px] font-sans`}>W•D•4H aligned!</div>
                    </div>
                  </div>
                </motion.div>
            }

              <div className={`border ${theme.borderCard} rounded-xl p-3 ${theme.bgSecondary}`}>
                <label className={`${theme.textMuted} text-[10px] tracking-widest mb-2 block`}>{t('dailyTrend')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['bullish', 'bearish'].map((trend) =>
                <motion.button
                  key={trend}
                  type="button"
                  onClick={() => update('d_trend', trend)}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className={cn("py-3.5 rounded-xl border-2 transition-all font-bold text-sm relative overflow-hidden",
                  formData.d_trend === trend ?
                  trend === 'bullish' ? "bg-emerald-700 text-white border-emerald-700" : "bg-rose-600 text-white border-rose-600" :
                  `${theme.borderCard} ${theme.text}`)}>
                      {formData.d_trend === trend &&
                  <div className="absolute inset-0 bg-white/10" />
                  }
                      {trend === 'bullish' ? <TrendingUp className="w-5 h-5 mx-auto mb-1" /> : <TrendingDown className="w-5 h-5 mx-auto mb-1" />}
                      {trend.toUpperCase()}
                    </motion.button>
                )}
                </div>
              </div>
              
              <ChecklistItemWithTooltip
              checked={formData.d_at_aoi}
              onChange={(checked) => update('d_at_aoi', checked)}
              label={t('atAoiRejected')}
              weight={10}
              description={t('atAoiDesc')}
              tooltip={t('tooltipAoiDaily')}
              darkMode={darkMode}
              show={formData.d_trend !== ''} />

              
              <ChecklistItemWithTooltip
              checked={formData.d_ema_touch}
              onChange={(checked) => update('d_ema_touch', checked)}
              label={t('touchingEma')}
              weight={5}
              description={t('touchingEmaDesc')}
              tooltip={t('tooltipEmaDaily')}
              darkMode={darkMode}
              show={formData.d_at_aoi} />

              
              <ChecklistItemWithTooltip
              checked={formData.d_candlestick}
              onChange={(checked) => update('d_candlestick', checked)}
              label={t('candlestickRejection')}
              weight={10}
              description={t('candlestickDesc')}
              tooltip={t('tooltipCandlestickDaily')}
              darkMode={darkMode}
              show={formData.d_trend !== ''} />

              
              <ChecklistItemWithTooltip
              checked={formData.d_psp_rejection}
              onChange={(checked) => update('d_psp_rejection', checked)}
              label={t('rejectionPsp')}
              weight={10}
              description={t('rejectionPspDesc')}
              tooltip={t('tooltipPspDaily')}
              darkMode={darkMode}
              show={formData.d_candlestick || formData.d_at_aoi} />

              
              <ChecklistItemWithTooltip
              checked={formData.d_round_level}
              onChange={(checked) => update('d_round_level', checked)}
              label={t('roundLevel')}
              weight={5}
              description={t('roundLevelDesc')}
              tooltip={t('tooltipRoundDaily')}
              darkMode={darkMode}
              show={formData.d_trend !== ''} />

              
              <ChecklistItemWithTooltip
              checked={formData.d_swing}
              onChange={(checked) => update('d_swing', checked)}
              label={t('swingHighLow')}
              weight={5}
              description={t('swingDesc')}
              tooltip={t('tooltipSwingDaily')}
              darkMode={darkMode}
              show={formData.d_trend !== ''} />

              
              <PatternSelector
              value={formData.d_pattern}
              onChange={(v) => update('d_pattern', v)}
              score={10}
              label="PATTERN (DAILY)"
              description={t('patternDesc')} />

            </motion.div>
          }

          {/* STEP 3: 4H */}
          {currentStep === 3 &&
          <motion.div key="h4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.1 }} className="space-y-3">
              <StepHeader number="04" title={t('h4Analysis')} subtitle={t('h4Confirm')} />
              
              <SectionProgressBar current={h4Score} max={35} label={t('h4Score')} darkMode={darkMode} />

              <div className={`border ${theme.borderCard} rounded-xl p-3 ${theme.bgSecondary}`}>
                <label className={`${theme.textMuted} text-[10px] tracking-widest mb-2 block`}>{t('h4Trend')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['bullish', 'bearish'].map((trend) =>
                <motion.button
                  key={trend}
                  type="button"
                  onClick={() => update('h4_trend', trend)}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className={cn("py-3.5 rounded-xl border-2 transition-all font-bold text-sm relative overflow-hidden",
                  formData.h4_trend === trend ?
                  trend === 'bullish' ? "bg-emerald-700 text-white border-emerald-700" : "bg-rose-600 text-white border-rose-600" :
                  `${theme.borderCard} ${theme.text}`)}>
                      {formData.h4_trend === trend &&
                  <div className="absolute inset-0 bg-white/10" />
                  }
                      {trend === 'bullish' ? <TrendingUp className="w-5 h-5 mx-auto mb-1" /> : <TrendingDown className="w-5 h-5 mx-auto mb-1" />}
                      {trend.toUpperCase()}
                    </motion.button>
                )}
                </div>
              </div>
              
              <ChecklistItemWithTooltip
              checked={formData.h4_at_aoi}
              onChange={(checked) => update('h4_at_aoi', checked)}
              label={t('atAoiRejected')}
              weight={5}
              description={t('atAoiDesc')}
              tooltip={t('tooltipAoi4H')}
              darkMode={darkMode}
              show={formData.h4_trend !== ''} />

              
              <ChecklistItemWithTooltip
              checked={formData.h4_candlestick}
              onChange={(checked) => update('h4_candlestick', checked)}
              label={t('candlestickRejection')}
              weight={10}
              description={t('candlestickDesc')}
              tooltip={t('tooltipCandlestick4H')}
              darkMode={darkMode}
              show={formData.h4_trend !== ''} />

              
              <ChecklistItemWithTooltip
              checked={formData.h4_psp_rejection}
              onChange={(checked) => update('h4_psp_rejection', checked)}
              label={t('rejectionPsp')}
              weight={5}
              description={t('rejectionPspDesc')}
              tooltip={t('tooltipPsp4H')}
              darkMode={darkMode}
              show={formData.h4_candlestick || formData.h4_at_aoi} />

              
              <ChecklistItemWithTooltip
              checked={formData.h4_swing}
              onChange={(checked) => update('h4_swing', checked)}
              label={t('swingHighLow')}
              weight={5}
              description={t('swingDesc')}
              tooltip={t('tooltipSwing4H')}
              darkMode={darkMode}
              show={formData.h4_trend !== ''} />

              
              <PatternSelector
              value={formData.h4_pattern}
              onChange={(v) => update('h4_pattern', v)}
              score={10}
              label="PATTERN (4H)"
              description="4H Timeframe" />

            </motion.div>
          }

          {/* STEP 4: Entry */}
          {currentStep === 4 &&
          <motion.div key="entry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.1 }} className="space-y-3">
              <StepHeader number="05" title={t('entryChecklist')} subtitle={t('entryConfirm')} />
              
              <div className={`p-3 rounded-xl border ${darkMode ? 'bg-blue-600/10 border-blue-600/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="text-blue-400 font-bold tracking-wider text-xs">{t('entryTimeframe')}</div>
                    <div className={`text-[10px] ${darkMode ? 'text-zinc-400' : 'text-zinc-600'} font-sans mt-0.5`}>30min oder 1H TF</div>
                  </div>
                </div>
              </div>

              <SectionProgressBar current={entryScore} max={25} label={t('entryScoreLabel')} darkMode={darkMode} />
              
              <ChecklistItemWithTooltip
              checked={formData.entry_sos}
              onChange={(checked) => update('entry_sos', checked)}
              label={t('mssShift')}
              weight={10}
              description={t('mssDesc')}
              tooltip={t('tooltipMssEntry')}
              darkMode={darkMode} />

              
              <ChecklistItemWithTooltip
              checked={formData.entry_engulfing}
              onChange={(checked) => update('entry_engulfing', checked)}
              label={t('engulfingCandle')}
              weight={10}
              description={t('engulfingDesc')}
              tooltip={t('tooltipEngulfingEntry')}
              darkMode={darkMode}
              show={formData.entry_sos} />

              
              <PatternSelector
              value={formData.entry_pattern}
              onChange={(v) => update('entry_pattern', v)}
              score={5}
              label={t('patternIfAny')}
              description={t('patternIfAnyDesc')} />

              
              <div className={`border ${theme.borderCard} rounded-xl p-3 ${theme.bgSecondary}`}>
                <label className={`${theme.textMuted} text-[10px] tracking-widest mb-2 block`}>{t('entryTrigger')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => update('entry_type', 'pinbar')}
                className={cn("py-4 px-3 border-2 rounded-xl text-center transition-all",
                formData.entry_type === 'pinbar' ?
                darkMode ? "bg-white border-white text-black" : "bg-black border-black text-white" :
                darkMode ? "border-zinc-800 bg-zinc-900 text-white" : "border-zinc-300 bg-zinc-50 text-black")}>
                    <div className="text-2xl mb-1.5">📍</div>
                    <div className="font-bold tracking-wider text-xs">PINBAR</div>
                    <div className={cn("text-[9px] mt-0.5 font-sans", formData.entry_type === 'pinbar' ? 'opacity-70' : 'opacity-50')}>Rejection</div>
                  </button>
                  <button type="button" onClick={() => update('entry_type', 'engulfing')}
                className={cn("py-4 px-3 border-2 rounded-xl text-center transition-all",
                formData.entry_type === 'engulfing' ?
                darkMode ? "bg-white border-white text-black" : "bg-black border-black text-white" :
                darkMode ? "border-zinc-800 bg-zinc-900 text-white" : "border-zinc-300 bg-zinc-50 text-black")}>
                    <div className="text-2xl mb-1.5">🕯️</div>
                    <div className="font-bold tracking-wider text-xs">ENGULFING</div>
                    <div className={cn("text-[9px] mt-0.5 font-sans", formData.entry_type === 'engulfing' ? 'opacity-70' : 'opacity-50')}>Reversal</div>
                  </button>
                </div>
              </div>
            </motion.div>
          }

          {/* STEP 5: Risk Management */}
          {currentStep === 5 &&
          <motion.div key="risk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.1 }} className="space-y-3">
          <StepHeader number="06" title={t('riskManagementTitle')} subtitle={t('riskManagementSubtitle')} />

          {formData.pair &&
            <div className={`border-2 rounded-xl p-3 ${darkMode ? 'border-emerald-700 bg-emerald-700/10' : 'border-emerald-600 bg-teal-500/10'}`}>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-emerald-600 tracking-wider">PAIR</div>
                  <div className={`text-xl font-bold tracking-wider ${theme.text}`}>{formData.pair}</div>
                </div>
              </div>
            </div>
            }

          {formData.pair &&
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}>
              <LivePriceChart pair={formData.pair} darkMode={darkMode} />
            </motion.div>
            }

          {riskCalc && parseFloat(riskCalc.rr) < 2.5 && formData.entry_price && formData.stop_loss && formData.take_profit &&
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
            className={`p-3 rounded-xl border-2 ${darkMode ? 'bg-amber-600/10 border-amber-600/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div>
                  <div className="text-amber-500 font-bold text-xs tracking-wider">LOW R:R</div>
                  <div className={`${darkMode ? 'text-zinc-400' : 'text-zinc-600'} text-[10px] font-sans`}>Min. 1:2.5 empfohlen</div>
                </div>
              </div>
            </motion.div>
            }

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
                leverage: formData.leverage
              }}
              darkMode={darkMode} />

          </motion.div>
          }

          {/* STEP 6: Final */}
          {currentStep === 6 &&
          <motion.div key="final" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.1 }} className="space-y-3">
              <StepHeader number="07" title={t('finalCheckTitle')} subtitle={t('finalCheckSubtitle')} />

              {/* 1. NO-TRADE ANALYSIS - Erste Priorität */}
              <NoTradeSkills
                formData={formData}
                weeklyScore={weeklyScore}
                dailyScore={dailyScore}
                h4Score={h4Score}
                entryScore={entryScore}
                riskCalc={riskCalc}
                darkMode={darkMode}
                onNoTrade={handleNoTrade}
              />

              {/* 2. CONFLUENCE STATUS - Zweite Priorität */}
              {hasConfluence &&
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.1 }}
                  className="p-2.5 sm:p-3 rounded-lg border-2 bg-gradient-to-r from-emerald-700 to-emerald-800 border-emerald-600 text-white">
                  <div className="flex items-center justify-center gap-2">
                    <Layers className="w-4 h-4" />
                    <div className="text-xs sm:text-sm font-bold tracking-wider">FULL CONFLUENCE</div>
                    <div className="text-[9px] sm:text-[10px] font-sans opacity-80">W•D•4H {formData.w_trend?.toUpperCase()}</div>
                  </div>
                </motion.div>
              }

              {/* 3. FINAL GRADE - Hauptanzeige */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.1 }}
                className={cn("p-3 sm:p-4 text-center rounded-xl border-2 relative",
                  progress >= 100 ? "bg-emerald-700 border-emerald-700" :
                  progress >= 90 ? "bg-teal-500 border-emerald-600" :
                  progress >= 85 ? "bg-blue-500 border-blue-500" :
                  progress >= 70 ? "bg-amber-500 border-amber-500" :
                  darkMode ? "bg-zinc-900 border-rose-600" : "bg-zinc-100 border-rose-600")}>

                {hasConfluence && progress >= 85 &&
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[8px] font-bold text-white flex items-center gap-0.5">
                    <Layers className="w-2.5 h-2.5" />
                    CONFL
                  </div>
                }

                <div className={cn("text-3xl sm:text-4xl md:text-5xl font-bold mb-1.5", progress >= 70 ? "text-white" : darkMode ? "text-white" : "text-black")}>{gradeInfo.grade}</div>
                <div className={cn("text-xl sm:text-2xl md:text-3xl tracking-widest mb-1", progress >= 70 ? "text-white/80" : darkMode ? "text-white/70" : "text-black/70")}>{progress}%</div>
                <div className={cn("text-[10px] sm:text-xs font-sans mb-2", progress >= 70 ? "text-white/70" : darkMode ? "text-white/60" : "text-black/60")}>
                  {progress >= 85 ? `✓ ${t('readyToTradeLabel')}` : t('notRecommended')}
                </div>

                {/* Score Breakdown Compact */}
                <div className={cn("flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs", progress >= 70 ? "text-white/80" : darkMode ? "text-white/70" : "text-black/70")}>
                  <span>W:<strong>{weeklyScore}</strong></span>
                  <span>D:<strong>{dailyScore}</strong></span>
                  <span>4H:<strong>{h4Score}</strong></span>
                  <span>E:<strong>{entryScore}</strong></span>
                  {riskCalc && <span>R:R:<strong>{riskCalc.rr}</strong></span>}
                </div>
              </motion.div>

              {/* 4. GOLDEN RULE CONFIRMATION */}
              <div className={`border-2 rounded-xl p-3 ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-zinc-900'}`} />
                  <div className={`${theme.text} font-bold tracking-widest text-xs`}>{t('confirmRule')}</div>
                </div>

                {formData.direction === 'long' &&
                  <button type="button" onClick={() => update('confirms_rule', !formData.confirms_rule)}
                    className={cn("w-full p-3 border-2 rounded-xl flex items-center gap-3 transition-all text-left",
                      formData.confirms_rule ?
                      "bg-emerald-700 border-emerald-700 text-white" :
                      darkMode ? "border-zinc-800 bg-zinc-950" : "border-zinc-300 bg-white")}>
                    <div className={cn("w-7 h-7 border-2 flex items-center justify-center rounded-lg flex-shrink-0",
                      formData.confirms_rule ? "border-white bg-white" : darkMode ? "border-zinc-700" : "border-zinc-400")}>
                      {formData.confirms_rule && <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-bold tracking-wider text-xs", formData.confirms_rule ? "text-white" : theme.text)}>
                        {t('buyInAboveAoi')}
                      </div>
                      <div className={cn("text-[10px] font-sans mt-0.5", formData.confirms_rule ? "text-emerald-100" : theme.textMuted)}>
                        ✓ {t('notBuyResistance')}
                      </div>
                    </div>
                  </button>
                }

                {formData.direction === 'short' &&
                  <button type="button" onClick={() => update('confirms_rule', !formData.confirms_rule)}
                    className={cn("w-full p-3 border-2 rounded-xl flex items-center gap-3 transition-all text-left",
                      formData.confirms_rule ?
                      "bg-rose-600 border-rose-600 text-white" :
                      darkMode ? "border-zinc-800 bg-zinc-950" : "border-zinc-300 bg-white")}>
                    <div className={cn("w-7 h-7 border-2 flex items-center justify-center rounded-lg flex-shrink-0",
                      formData.confirms_rule ? "border-white bg-white" : darkMode ? "border-zinc-700" : "border-zinc-400")}>
                      {formData.confirms_rule && <Check className="w-4 h-4 text-rose-600" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-bold tracking-wider text-xs", formData.confirms_rule ? "text-white" : theme.text)}>
                        {t('sellInBelowAoi')}
                      </div>
                      <div className={cn("text-[10px] font-sans mt-0.5", formData.confirms_rule ? "text-rose-100" : theme.textMuted)}>
                        ✓ {t('notSellSupport')}
                      </div>
                    </div>
                  </button>
                }

                {!formData.direction &&
                  <div className={`${theme.textMuted} text-center py-4 font-sans`}>
                    <Shield className={`w-6 h-6 mx-auto mb-1 ${theme.textMuted}`} />
                    <div className="text-[10px]">{t('selectDirFirst')}</div>
                  </div>
                }
              </div>

              {/* 5. TRADE SUMMARY */}
              <div className={`border ${theme.borderCard} rounded-xl p-3 ${theme.bgSecondary}`}>
                <h3 className={`${theme.text} font-bold tracking-widest text-xs mb-2`}>{t('tradeSummary')}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <SummaryRow label="PAIR" value={formData.pair || '-'} />
                  <SummaryRow label="DIR" value={formData.direction === 'long' ? '↑ LONG' : formData.direction === 'short' ? '↓ SHORT' : '-'} 
                    color={formData.direction === 'long' ? 'teal' : formData.direction === 'short' ? 'rose' : null} />
                  <SummaryRow label="W" value={`${weeklyScore}/60`} color={weeklyScore >= 40 ? 'teal' : null} />
                  <SummaryRow label="D" value={`${dailyScore}/60`} color={dailyScore >= 40 ? 'teal' : null} />
                  <SummaryRow label="4H" value={`${h4Score}/35`} color={h4Score >= 25 ? 'teal' : null} />
                  <SummaryRow label="E" value={`${entryScore}/25`} color={entryScore >= 20 ? 'teal' : null} />
                  {riskCalc && (
                    <>
                      <SummaryRow label="R:R" value={`1:${riskCalc.rr}`} color={parseFloat(riskCalc.rr) >= 2.5 ? 'teal' : 'amber'} />
                      <SummaryRow label="RISK" value={`$${riskCalc.riskAmount}`} color="rose" />
                    </>
                  )}
                </div>
              </div>

              {/* 6. SCREENSHOTS */}
              <div className="grid grid-cols-2 gap-2">
                <ScreenshotUpload label="SETUP" description="Before Entry" screenshots={formData.screenshots_before || []}
                  onUpload={async (files) => {
                    const results = await Promise.all(files.map(file => base44.integrations.Core.UploadFile({ file })));
                    update('screenshots_before', [...(formData.screenshots_before || []), ...results.map(r => r.file_url)]);
                  }}
                  onDelete={(url) => update('screenshots_before', (formData.screenshots_before || []).filter(s => s !== url))}
                  darkMode={darkMode} variant="before" />
                <ScreenshotUpload label="RESULT" description="After Exit" screenshots={formData.screenshots_after || []}
                  onUpload={async (files) => {
                    const results = await Promise.all(files.map(file => base44.integrations.Core.UploadFile({ file })));
                    update('screenshots_after', [...(formData.screenshots_after || []), ...results.map(r => r.file_url)]);
                  }}
                  onDelete={(url) => update('screenshots_after', (formData.screenshots_after || []).filter(s => s !== url))}
                  darkMode={darkMode} variant="after" />
              </div>

              {/* 7. NOTES */}
              <div className={`border ${theme.borderCard} rounded-xl p-3 ${theme.bgSecondary}`}>
                <label className={`block ${theme.textMuted} tracking-widest text-[10px] mb-2`}>{t('notesOptional')}</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw.length <= LIMITS.NOTES) update('notes', raw);
                  }}
                  placeholder={t('notesPlaceholderLong')}
                  maxLength={LIMITS.NOTES}
                  className={`${darkMode ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700' : 'bg-white border-zinc-300 text-black placeholder:text-zinc-400'} min-h-[100px] rounded-xl font-sans text-sm`}
                />
                <div className={`text-right text-[10px] font-sans mt-1 ${(formData.notes?.length || 0) >= LIMITS.NOTES * 0.9 ? 'text-amber-500' : darkMode ? 'text-zinc-700' : 'text-zinc-400'}`}>
                  {formData.notes?.length || 0}/{LIMITS.NOTES}
                </div>
              </div>

              <TradingQuote variant="minimal" />

              <div className="flex justify-center py-3 opacity-20">
                <img src={darkMode ?
                  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png" :
                  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"}
                  alt="ZNPCV" className="h-12 sm:h-14 w-auto" />
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-5 flex gap-2 pb-4">
          {currentStep > 0 &&
          <button onClick={() => setCurrentStep((prev) => prev - 1)} className={cn("flex items-center justify-center gap-1 px-5 h-12 rounded-xl border-2 font-bold text-sm tracking-widest transition-all", darkMode ? "border-zinc-700 text-zinc-300 bg-zinc-900" : "border-zinc-300 text-zinc-600 bg-zinc-50")}>





            <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">{t('back')}</span>
          </button>
          }
          
          {currentStep < STEPS.length - 1 ?
          <button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={currentStep === 0 && !formData.pair}
            className={cn("flex-1 flex items-center justify-center gap-1 h-12 rounded-xl font-bold text-sm tracking-widest border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
            darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')}>
              {t('next')} <ChevronRight className="w-4 h-4" />
            </button> :

          <div className="flex-1 flex gap-2">
              {checklistId &&
            <button onClick={() => setShowDeleteModal(true)}
            className={cn("flex items-center justify-center px-4 h-12 rounded-xl border-2 transition-all",
            darkMode ? 'border-rose-600 text-rose-400' : 'border-red-600 text-red-600')}>
                  <Trash2 className="w-4 h-4" />
                </button>
            }
              <button onClick={() => handleSave(false)} disabled={saving || !formData.pair}
            className={cn("flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm tracking-widest border-2 transition-all disabled:opacity-40",
            isReady ?
            "bg-emerald-700 text-white border-emerald-700" :
            darkMode ? "bg-white text-black border-white" : "bg-black text-white border-black")}>
                <Save className="w-4 h-4" /> {saving ? t('saving') : t('saveTrade')}
              </button>
            </div>
          }
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        darkMode={darkMode}
      />

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning &&
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}
        className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.1 }}
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
                <Button onClick={() => {setShowWarning(false);navigate(createPageUrl('Dashboard'));}}
              className="w-full bg-white hover:bg-zinc-200 text-black rounded-xl h-11 tracking-widest font-bold border-2 border-white">
                  {t('doNotEnter')}
                </Button>
                <Button onClick={() => {setShowWarning(false);handleSave(true);}} variant="ghost"
              className="w-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl h-10 text-sm">
                  {t('saveAnyway')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop &&
        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.1 }}
        onClick={scrollToTop} className={`fixed bottom-6 right-6 w-11 h-11 flex items-center justify-center shadow-lg transition-colors z-50 rounded-full ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        }
      </AnimatePresence>
    </div>);

}

// Sub-components  
function StepHeader({ number, title, subtitle }) {
  const { darkMode } = useLanguage();
  return (
    <div className="text-center mb-3">
      <div className={`text-2xl font-light mb-0.5 ${darkMode ? 'text-zinc-800' : 'text-zinc-300'}`}>{number}</div>
      <h2 className={`text-base sm:text-lg tracking-widest mb-0.5 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
      <p className={`text-[10px] tracking-wider ${darkMode ? 'text-zinc-600' : 'text-zinc-500'} px-2`}>{subtitle}</p>
    </div>);

}



function PatternSelector({ value, onChange, score, label, description }) {
  const { t, darkMode } = useLanguage();
  const patterns = [
  { key: 'double_top', label: t('dblTop'), icon: 'double_top', desc: 'Bearish Reversal' },
  { key: 'double_bottom', label: t('dblBtm'), icon: 'double_bottom', desc: 'Bullish Reversal' },
  { key: 'head_shoulders', label: t('hs'), icon: 'hs', desc: 'Bearish Pattern' },
  { key: 'inv_head_shoulders', label: t('invHs'), icon: 'inv_hs', desc: 'Bullish Pattern' },
  { key: 'none', label: t('none'), icon: 'none', desc: 'Kein Pattern' }];


  const theme = {
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    bgCard: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    textMuted: darkMode ? 'text-zinc-600' : 'text-zinc-500'
  };

  const PatternIcon = ({ type, className }) => {
    const baseClass = cn("w-full h-full", className);

    if (type === 'double_top') {
      return (
        <svg viewBox="0 0 24 16" className={baseClass}>
          <path d="M2 14 L6 4 L10 10 L14 4 L18 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>);

    }
    if (type === 'double_bottom') {
      return (
        <svg viewBox="0 0 24 16" className={baseClass}>
          <path d="M2 2 L6 12 L10 6 L14 12 L18 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>);

    }
    if (type === 'hs') {
      return (
        <svg viewBox="0 0 24 16" className={baseClass}>
          <path d="M2 12 L5 8 L8 10 L12 2 L16 10 L19 8 L22 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>);

    }
    if (type === 'inv_hs') {
      return (
        <svg viewBox="0 0 24 16" className={baseClass}>
          <path d="M2 4 L5 8 L8 6 L12 14 L16 6 L19 8 L22 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>);

    }
    return (
      <svg viewBox="0 0 24 16" className={baseClass}>
        <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>);

  };

  return (
    <div className={`border rounded-xl p-3 ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0 flex-1">
          <label className={`text-[10px] tracking-widest block ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{label}</label>
        </div>
        {value && value !== 'none' &&
        <div className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white flex-shrink-0">+{score}%</div>
        }
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {patterns.map((pattern) =>
        <button key={pattern.key} type="button" onClick={() => onChange(pattern.key)}
        className={cn("py-2.5 px-1 border-2 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-1 group relative",
        value === pattern.key ?
        pattern.key === 'none' ?
        darkMode ? "bg-zinc-700 border-zinc-600 text-white" : "bg-zinc-400 border-zinc-400 text-white" :
        "bg-emerald-700 border-emerald-600 text-white" :
        darkMode ?
        "border-zinc-800 text-zinc-500 bg-zinc-900" :
        "border-zinc-300 text-zinc-600 bg-zinc-50")}>
            {value === pattern.key && pattern.key !== 'none' &&
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <Check className="w-2 h-2 text-emerald-600" strokeWidth={4} />
              </div>
          }
            <div className="w-6 h-4">
              <PatternIcon type={pattern.icon} />
            </div>
            <div className="text-[8px] tracking-wider font-bold leading-tight">{pattern.label}</div>
          </button>
        )}
      </div>
    </div>);

}

function SummaryRow({ label, value, color }) {
  const { darkMode } = useLanguage();
  const colorClasses = {
    teal: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-500',
    blue: 'text-blue-400'
  };

  return (
    <div className="flex justify-between items-center py-1.5">
      <span className={`text-[10px] tracking-wider ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>{label}</span>
      <span className={cn("font-bold text-xs", color ? colorClasses[color] : darkMode ? "text-white" : "text-black")}>{value}</span>
    </div>);

}

function ScreenshotUpload({ label, description, screenshots, onUpload, onDelete, darkMode, variant }) {
  const [uploadingLocal, setUploadingLocal] = useState(false);

  const theme = {
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600'
  };

  const variantColors = {
    before: darkMode ? 'border-blue-600/50 bg-blue-600/5' : 'border-blue-500/50 bg-blue-500/5',
    after: darkMode ? 'border-emerald-700/50 bg-emerald-700/5' : 'border-emerald-600/50 bg-teal-500/5'
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
    <div className={cn("border rounded-xl p-2.5",
    variant ? variantColors[variant] : darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100')}>
      
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold tracking-wider">
          {label}
          {description && <span className={`${theme.textSecondary} text-[9px] font-sans ml-1`}>• {description}</span>}
        </div>
        {screenshots && screenshots.length > 0 &&
        <div className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
        variant === 'before' ? 'bg-blue-600 text-white' : 'bg-emerald-700 text-white'}`
        }>
            {screenshots.length}
          </div>
        }
      </div>
      
      {screenshots && screenshots.length > 0 &&
      <div className="grid grid-cols-3 gap-1.5 mb-2">
          {screenshots.map((url, index) =>
        <div key={index} className="relative group aspect-square">
              <img src={url} alt={`${index + 1}`} className={`w-full h-full object-cover rounded-lg border ${theme.border}`} />
              <button
            onClick={() => onDelete(url)}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <XIcon className="w-4 h-4 text-white" />
              </button>
            </div>
        )}
        </div>
      }

      <label className={cn("flex items-center justify-center gap-2 p-2.5 border border-dashed rounded-xl cursor-pointer transition-all",
      uploadingLocal ? "opacity-50 cursor-not-allowed" : darkMode ? "border-zinc-700 bg-zinc-900/50" : "border-zinc-400 bg-white/50")}>
        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploadingLocal} />
        {uploadingLocal ?
        <>
            <div className={`animate-spin w-3.5 h-3.5 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full`} />
            <span className={`text-[10px] ${theme.textSecondary} font-sans`}>Uploading...</span>
          </> :
        <>
            <Upload className={`w-3.5 h-3.5 ${theme.textSecondary}`} />
            <span className={`text-[10px] tracking-wider ${theme.text}`}>UPLOAD</span>
          </>
        }
      </label>
    </div>);

}