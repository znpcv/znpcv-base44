import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Check, ChevronRight, ChevronLeft, Home, ArrowUp, AlertTriangle, Zap, XOctagon, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import AssetSelector from '@/components/AssetSelector';
import { useLanguage, LanguageToggle } from '@/components/LanguageContext';
import TradingQuote from '@/components/TradingQuote';
import ConflTooltip from '@/components/ConflTooltip';

const STEPS = ['pair', 'trend', 'aoi', 'structure', 'patterns', 'entry', 'final'];

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
    weekly_trend: '',
    daily_trend: '',
    h4_trend: '',
    aoi_identified: false,
    price_in_aoi: false,
    aoi_position: '',
    pss_rejected: false,
    ema_respected: false,
    pattern_type: '',
    pattern_confirmed: false,
    mss_confirmed: false,
    engulfing_confirmed: false,
    engulfing_color: '',
    not_buying_resistance: false,
    not_selling_support: false,
    direction: '',
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
    if (data.length > 0) setChecklist(data[0]);
    setIsLoading(false);
  };

  const update = (key, value) => setChecklist(prev => ({ ...prev, [key]: value }));
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const trendsAlign = checklist.weekly_trend && checklist.daily_trend && checklist.h4_trend &&
    checklist.weekly_trend === checklist.daily_trend && checklist.daily_trend === checklist.h4_trend;

  const isDailyH4Sync = checklist.daily_trend && checklist.h4_trend && 
    checklist.daily_trend === checklist.h4_trend;

  const suggestedDirection = trendsAlign ? checklist.weekly_trend : null;

  const calculateProgress = () => {
    let total = 0, completed = 0;
    
    // Step 1: Pair
    total++; if (checklist.pair) completed++;
    
    // Step 2: Trends (3 items)
    total += 3;
    if (checklist.weekly_trend) completed++;
    if (checklist.daily_trend) completed++;
    if (checklist.h4_trend) completed++;
    
    // Step 3: AOI (3 items - identified, price in aoi, direction)
    total += 3;
    if (checklist.aoi_identified) completed++;
    if (checklist.price_in_aoi) completed++;
    if (checklist.aoi_position) completed++;
    
    // Step 4: Structure (2 items)
    total += 2;
    if (checklist.pss_rejected) completed++;
    if (checklist.ema_respected) completed++;
    
    // Step 5: Patterns (2 items)
    total += 2;
    if (checklist.pattern_type) completed++;
    if (checklist.pattern_confirmed) completed++;
    
    // Step 6: Entry (2 items)
    total += 2;
    if (checklist.mss_confirmed) completed++;
    if (checklist.engulfing_confirmed) completed++;
    
    // Step 7: Final Rule - ONLY ONE based on direction
    total += 1;
    if (checklist.aoi_position === 'long' && checklist.not_buying_resistance) completed++;
    if (checklist.aoi_position === 'short' && checklist.not_selling_support) completed++;
    
    // Base percentage (max 100%)
    const basePercent = Math.round((completed / total) * 100);
    
    // Bonus points for extra confirmations (can go above 100%)
    let bonus = 0;
    
    // Bonus for confluence (all trends align)
    if (trendsAlign) bonus += 10;
    
    // Bonus for Daily & 4H sync
    if (isDailyH4Sync && !trendsAlign) bonus += 5;
    
    // Bonus for engulfing matching direction
    if (checklist.aoi_position === 'long' && checklist.engulfing_color === 'blue') bonus += 5;
    if (checklist.aoi_position === 'short' && checklist.engulfing_color === 'red') bonus += 5;
    
    // Bonus for pattern confirmed
    if (checklist.pattern_confirmed) bonus += 5;
    
    return basePercent + bonus;
  };

  const handleSave = async (force = false) => {
    const progress = calculateProgress();
    
    if (progress < 85 && !force && currentStep === STEPS.length - 1) {
      setShowWarning(true);
      return;
    }
    
    setSaving(true);
    const direction = suggestedDirection || '';
    const data = { 
      ...checklist, 
      direction, 
      completion_percentage: progress, 
      status: progress >= 85 ? 'ready_to_trade' : 'in_progress',
      daily_4h_sync: isDailyH4Sync
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
  
  // Grade calculation based on ZNPCV standard
  const getGrade = (p) => {
    if (p >= 120) return { grade: 'A+++', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
    if (p >= 110) return { grade: 'A++', color: 'bg-emerald-400', textColor: 'text-emerald-400' };
    if (p >= 100) return { grade: 'A+', color: 'bg-blue-500', textColor: 'text-blue-500' };
    if (p >= 85) return { grade: 'OK', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    return { grade: 'NO TRADE', color: 'bg-red-500', textColor: 'text-red-500' };
  };
  
  const gradeInfo = getGrade(progress);
  const isReady = progress >= 85;

  const stepLabels = {
    pair: t('selectAsset'),
    trend: t('trendAnalysis'),
    aoi: t('aoi'),
    structure: t('structureCheck'),
    patterns: t('patterns'),
    entry: t('entryConfirmation'),
    final: t('finalCheck')
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
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
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" 
                alt="ZNPCV" 
                className="h-10 w-auto cursor-pointer hover:opacity-80 invert"
              />
            </button>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-bold",
                gradeInfo.color, "text-black"
              )}>
                <div className="w-2 h-2 rounded-full animate-pulse bg-black" />
                <span className="text-lg">{progress}%</span>
                <span className="text-xs font-bold">{gradeInfo.grade}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 bg-zinc-900">
          <motion.div 
            className={cn("h-full", gradeInfo.color)} 
            initial={{ width: 0 }} 
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </header>

      {/* Steps Navigation */}
      <div className="bg-zinc-950 border-b border-zinc-800/50 overflow-x-auto">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2">
          {STEPS.map((step, index) => (
            <button
              key={step}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "px-4 py-2 text-sm tracking-widest whitespace-nowrap transition-all rounded-xl",
                currentStep === index 
                  ? 'bg-white text-black' 
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              )}
            >
              {index + 1}. {stepLabels[step]}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          {/* STEP 0: Asset */}
          {currentStep === 0 && (
            <motion.div key="pair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <StepHeader number="01" title={t('selectAsset')} subtitle={t('selectAssetDesc')} />
              <AssetSelector selectedPair={checklist.pair} onSelect={(pair) => update('pair', pair)} />
            </motion.div>
          )}

          {/* STEP 1: Trend */}
          {currentStep === 1 && (
            <motion.div key="trend" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="02" title={t('trendAnalysis')} subtitle={t('trendAnalysisDesc')} />
              
              {[
                { key: 'weekly_trend', label: t('weekly'), desc: t('mainTrend') },
                { key: 'daily_trend', label: t('daily'), desc: t('midTerm') },
                { key: 'h4_trend', label: t('fourHour'), desc: t('shortTerm') },
              ].map((tf) => (
                <div key={tf.key} className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-950">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl tracking-widest">{tf.label}</span>
                      <span className="text-zinc-600 ml-3 text-sm">{tf.desc}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <TrendButton selected={checklist[tf.key] === 'bullish'} onClick={() => update(tf.key, 'bullish')} type="bullish" label={t('bullish')} />
                    <TrendButton selected={checklist[tf.key] === 'bearish'} onClick={() => update(tf.key, 'bearish')} type="bearish" label={t('bearish')} />
                  </div>
                </div>
              ))}

              {checklist.weekly_trend && checklist.daily_trend && checklist.h4_trend && (
                <ConfluenceBox trendsAlign={trendsAlign} trend={checklist.weekly_trend} t={t} checklist={checklist} />
              )}

              {isDailyH4Sync && <SyncIndicator t={t} />}
            </motion.div>
          )}

          {/* STEP 2: AOI */}
          {currentStep === 2 && (
            <motion.div key="aoi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="03" title={t('aoi')} subtitle={t('aoiDesc')} />
              
              <CheckItem checked={checklist.aoi_identified} onChange={() => update('aoi_identified', !checklist.aoi_identified)} label={t('aoiDrawn')} description={t('aoiDrawnDesc')} />

              {checklist.aoi_identified && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <CheckItem checked={checklist.price_in_aoi} onChange={() => update('price_in_aoi', !checklist.price_in_aoi)} label="IST DER PREIS IM AOI?" description="Der Preis muss sich im oder nahe am AOI befinden" />

                  <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-950">
                    <label className="text-zinc-500 text-sm tracking-widest mb-4 block">WAS WILLST DU MACHEN?</label>
                    <div className="grid grid-cols-2 gap-4">
                      <DirectionButton 
                        selected={checklist.aoi_position === 'long'} 
                        onClick={() => update('aoi_position', 'long')} 
                        type="long" 
                        labels={{ main: 'KAUFEN (LONG)', sub: 'Im AOI oder ÜBER AOI' }} 
                      />
                      <DirectionButton 
                        selected={checklist.aoi_position === 'short'} 
                        onClick={() => update('aoi_position', 'short')} 
                        type="short" 
                        labels={{ main: 'VERKAUFEN (SHORT)', sub: 'Im AOI oder UNTER AOI' }} 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Structure */}
          {currentStep === 3 && (
            <motion.div key="structure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="04" title={t('structureCheck')} subtitle={t('structureCheckDesc')} />
              
              <CheckItem checked={checklist.pss_rejected} onChange={() => update('pss_rejected', !checklist.pss_rejected)} label={t('pssRejected')} description={t('pssRejectedDesc')} />
              <CheckItem checked={checklist.ema_respected} onChange={() => update('ema_respected', !checklist.ema_respected)} label={t('emaRespected')} description={t('emaRespectedDesc')} />

              {checklist.pss_rejected && checklist.ema_respected && (
                <SuccessBox text={t('structureConfirmed')} />
              )}
            </motion.div>
          )}

          {/* STEP 4: Patterns */}
          {currentStep === 4 && (
            <motion.div key="patterns" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="05" title={t('patterns')} subtitle={t('patternsDesc')} />
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'head_shoulders', label: t('headShoulders'), icon: '📉', desc: 'Reversal' },
                  { key: 'inv_head_shoulders', label: t('invHeadShoulders'), icon: '📈', desc: 'Reversal' },
                  { key: 'double_top', label: t('doubleTop'), icon: '🔻', desc: 'Bearish' },
                  { key: 'double_bottom', label: t('doubleBottom'), icon: '🔺', desc: 'Bullish' },
                ].map((pattern) => (
                  <button
                    key={pattern.key}
                    onClick={() => update('pattern_type', pattern.key)}
                    className={cn(
                      "p-6 border rounded-2xl text-center transition-all",
                      checklist.pattern_type === pattern.key
                        ? "bg-white border-white text-black"
                        : "border-zinc-800/50 text-zinc-400 hover:border-zinc-600 bg-zinc-950"
                    )}
                  >
                    <div className="text-4xl mb-3">{pattern.icon}</div>
                    <div className="text-sm tracking-wider font-bold mb-1">{pattern.label}</div>
                    <div className={cn("text-xs", checklist.pattern_type === pattern.key ? "text-zinc-600" : "text-zinc-600")}>{pattern.desc}</div>
                  </button>
                ))}
              </div>

              {checklist.pattern_type && (
                <CheckItem checked={checklist.pattern_confirmed} onChange={() => update('pattern_confirmed', !checklist.pattern_confirmed)} label={t('patternConfirmed')} description={t('patternConfirmedDesc')} />
              )}
            </motion.div>
          )}

          {/* STEP 5: Entry */}
          {currentStep === 5 && (
            <motion.div key="entry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="06" title={t('entryConfirmation')} subtitle={t('entryConfirmationDesc')} />

              <CheckItem checked={checklist.mss_confirmed} onChange={() => update('mss_confirmed', !checklist.mss_confirmed)} label={t('mssConfirmed')} description={t('mssConfirmedDesc')} />

              <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-950">
                <label className="text-zinc-500 text-sm tracking-widest mb-2 block">{t('engulfingAfterPullback')}</label>
                <p className="text-zinc-600 text-sm mb-4 font-sans">{t('engulfingQuestion')}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <EngulfingButton 
                    selected={checklist.engulfing_color === 'blue' && checklist.engulfing_confirmed}
                    onClick={() => { update('engulfing_confirmed', true); update('engulfing_color', 'blue'); }}
                    type="blue"
                    labels={{ main: t('blueEngulfing'), sub: t('longEntry') }}
                  />
                  <EngulfingButton 
                    selected={checklist.engulfing_color === 'red' && checklist.engulfing_confirmed}
                    onClick={() => { update('engulfing_confirmed', true); update('engulfing_color', 'red'); }}
                    type="red"
                    labels={{ main: t('redEngulfing'), sub: t('shortEntry') }}
                  />
                </div>
              </div>

              {checklist.mss_confirmed && checklist.engulfing_confirmed && (
                <SuccessBox text={t('entrySignalConfirmed')} />
              )}
            </motion.div>
          )}

          {/* STEP 6: Final */}
          {currentStep === 6 && (
            <motion.div key="final" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader number="07" title={t('finalCheck')} subtitle={t('finalCheckDesc')} />

              <div className="border-2 border-zinc-700 bg-zinc-950 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-white" />
                  <span className="text-white font-bold tracking-widest">{t('importantRules')}</span>
                </div>
                
                {/* Show only relevant rule based on trade direction */}
                {checklist.aoi_position === 'long' && (
                  <CheckItem 
                    checked={checklist.not_buying_resistance} 
                    onChange={() => update('not_buying_resistance', !checklist.not_buying_resistance)} 
                    label={t('notBuyingResistance')} 
                    description={t('notBuyingResistanceDesc')} 
                  />
                )}
                
                {checklist.aoi_position === 'short' && (
                  <CheckItem 
                    checked={checklist.not_selling_support} 
                    onChange={() => update('not_selling_support', !checklist.not_selling_support)} 
                    label={t('notSellingSupport')} 
                    description={t('notSellingSupportDesc')} 
                  />
                )}

                {!checklist.aoi_position && (
                  <div className="text-zinc-500 text-center py-4 font-sans">
                    Wähle zuerst im AOI-Schritt ob du KAUFEN oder VERKAUFEN willst
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-950 space-y-4">
                <h3 className="text-xl tracking-widest mb-4">{t('summary')}</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <SummaryItem label={t('pair')} value={checklist.pair || '-'} />
                  <SummaryItem label={t('trend')} value={trendsAlign ? checklist.weekly_trend?.toUpperCase() : t('mixed')} highlight={trendsAlign} />
                  <SummaryItem label={t('aoi')} value={checklist.price_in_aoi ? `✓ ${t('inAoi')}` : '✗'} />
                  <SummaryItem label={t('entry')} value={checklist.engulfing_confirmed ? `${checklist.engulfing_color?.toUpperCase()} ENGULFING` : '-'} />
                </div>

                {isDailyH4Sync && <SyncIndicator t={t} />}
              </div>

              <div>
                <label className="block text-zinc-500 tracking-widest mb-2">{t('notes')}</label>
                <Textarea
                  value={checklist.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder={t('notesPlaceholder')}
                  className="bg-zinc-950 border-zinc-800/50 text-white placeholder:text-zinc-700 min-h-[100px] rounded-xl font-sans focus:border-white focus:ring-0"
                />
              </div>

              {/* Grade Display */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-10 text-center rounded-2xl border-2",
                  progress >= 120 ? "bg-emerald-500 border-emerald-500 text-black" :
                  progress >= 110 ? "bg-emerald-400 border-emerald-400 text-black" :
                  progress >= 100 ? "bg-blue-500 border-blue-500 text-white" :
                  progress >= 85 ? "bg-yellow-500 border-yellow-500 text-black" :
                  "bg-red-500/10 border-red-500 text-white"
                )}>
                <div className="text-6xl font-bold mb-2">{gradeInfo.grade}</div>
                <div className="text-4xl tracking-widest mb-2">{progress}%</div>
                {progress >= 85 ? (
                  <div className="text-lg font-sans opacity-80">{t('readyToTrade')}</div>
                ) : (
                  <div className="text-lg font-sans">
                    <span className="font-bold">ZNPCV empfiehlt NICHT zu traden!</span>
                    <br />
                    <span className="text-sm opacity-80">Minimum 85% erforderlich</span>
                  </div>
                )}
              </motion.div>

              {/* Grade Scale Info */}
              <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-2xl">
                <h4 className="text-center text-sm tracking-widest text-zinc-500 mb-4">ZNPCV BEWERTUNGSSKALA</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10">
                    <span className="text-emerald-400 font-bold">A+++</span>
                    <span className="text-zinc-500 text-sm">120%+</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-400/10">
                    <span className="text-emerald-300 font-bold">A++</span>
                    <span className="text-zinc-500 text-sm">110-119%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10">
                    <span className="text-blue-400 font-bold">A+</span>
                    <span className="text-zinc-500 text-sm">100-109%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10">
                    <span className="text-yellow-400 font-bold">OK</span>
                    <span className="text-zinc-500 text-sm">85-99%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10">
                    <span className="text-red-400 font-bold">NO TRADE</span>
                    <span className="text-zinc-500 text-sm">&lt;85%</span>
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
              <ChevronLeft className="w-4 h-4 mr-2" /> {t('back')}
            </Button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} className="flex-1 bg-white hover:bg-zinc-200 text-black rounded-xl tracking-widest text-lg py-6">
              {t('next')} <ChevronRight className="w-5 h-5 ml-2" />
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
                <Save className="w-5 h-5 mr-2" /> {saving ? t('saving') : t('save')}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-950 border-2 border-white rounded-2xl p-10 max-w-md w-full text-center"
            >
              <XOctagon className="w-24 h-24 text-white mx-auto mb-6" />
              <h2 className="text-3xl tracking-widest mb-4">{t('warningTitle')}</h2>
              <p className="text-zinc-400 font-sans mb-8 leading-relaxed">{t('warningDesc')}</p>
              
              <div className={cn("rounded-xl p-6 mb-8", gradeInfo.color)}>
                <div className="text-6xl font-bold text-black mb-1">{progress}%</div>
                <div className="text-2xl font-bold text-black mb-2">{gradeInfo.grade}</div>
                <div className="text-sm text-black/60 tracking-widest">ZNPCV STANDARD: 85%+</div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => { setShowWarning(false); navigate(createPageUrl('Dashboard')); }}
                  className="w-full bg-white hover:bg-zinc-200 text-black rounded-xl py-4 text-lg tracking-widest"
                >
                  {t('warningButton')}
                </Button>
                <Button 
                  onClick={() => { setShowWarning(false); handleSave(true); }}
                  variant="outline"
                  className="w-full border-zinc-800 text-zinc-500 hover:bg-zinc-900 rounded-xl py-3"
                >
                  {t('proceedAnyway')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-white text-black flex items-center justify-center shadow-lg hover:bg-zinc-200 transition-colors z-50 rounded-full"
          >
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

function CheckItem({ checked, onChange, label, description, color = 'white' }) {
  return (
    <button onClick={onChange} className={cn(
      "w-full p-5 border rounded-2xl flex items-center gap-4 transition-all text-left",
      checked ? 'bg-white border-white text-black' : 'border-zinc-800/50 hover:border-zinc-600 bg-zinc-950'
    )}>
      <div className={cn(
        "w-8 h-8 border-2 flex items-center justify-center flex-shrink-0 rounded-lg transition-all",
        checked ? 'border-black bg-black' : 'border-zinc-700'
      )}>
        {checked && <Check className="w-5 h-5 text-white" />}
      </div>
      <div>
        <span className={cn("text-lg tracking-wider block", checked ? "text-black" : "text-white")}>{label}</span>
        {description && <span className={cn("text-sm font-sans", checked ? "text-zinc-600" : "text-zinc-600")}>{description}</span>}
      </div>
    </button>
  );
}

function TrendButton({ selected, onClick, type, label }) {
  return (
    <button onClick={onClick} className={cn(
      "py-5 border rounded-xl text-lg tracking-wider transition-all font-bold",
      selected
        ? type === 'bullish' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-red-500 border-red-500 text-white'
        : 'border-zinc-800/50 text-zinc-500 hover:border-zinc-600 bg-zinc-950'
    )}>
      {type === 'bullish' ? '↑' : '↓'} {label}
    </button>
  );
}

function DirectionButton({ selected, onClick, type, labels }) {
  return (
    <button onClick={onClick} className={cn(
      "py-8 border rounded-2xl text-center transition-all",
      selected
        ? type === 'long' ? "bg-white border-white text-black" : "bg-zinc-600 border-zinc-600 text-white"
        : "border-zinc-800/50 hover:border-zinc-600 bg-zinc-950"
    )}>
      <div className="text-4xl mb-2">{type === 'long' ? '↑' : '↓'}</div>
      <div className="text-lg tracking-wider font-bold">{labels.main}</div>
      <div className={cn("text-sm mt-1", selected ? (type === 'long' ? "text-zinc-600" : "text-zinc-300") : "text-zinc-600")}>{labels.sub}</div>
    </button>
  );
}

function EngulfingButton({ selected, onClick, type, labels }) {
  return (
    <button onClick={onClick} className={cn(
      "py-8 border rounded-2xl text-center transition-all",
      selected
        ? type === 'blue' ? "bg-white border-white text-black" : "bg-zinc-600 border-zinc-600 text-white"
        : "border-zinc-800/50 hover:border-zinc-600 bg-zinc-950"
    )}>
      <div className="text-3xl mb-2">{type === 'blue' ? '🟦' : '🟥'}</div>
      <div className="text-lg tracking-wider font-bold">{labels.main}</div>
      <div className={cn("text-sm mt-1", selected ? (type === 'blue' ? "text-zinc-600" : "text-zinc-300") : "text-zinc-600")}>{labels.sub}</div>
    </button>
  );
}

function ConfluenceBox({ trendsAlign, trend, t, checklist }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={cn("p-8 border-2 rounded-2xl text-center", trendsAlign ? "border-white bg-white text-black" : "border-zinc-700 bg-zinc-950")}>
      {trendsAlign ? (
        <>
          <div className="text-3xl tracking-widest mb-2 flex items-center justify-center gap-2">
            ✓ {t('confluence')}
            <ConflTooltip />
          </div>
          <div className="text-zinc-600 font-sans">{t('allTimeframes')} {trend?.toUpperCase()}</div>
        </>
      ) : (
        <>
          <div className="text-2xl tracking-widest mb-2 flex items-center justify-center gap-2 text-zinc-400">
            ⚠ {t('noConfluence')}
            <ConflTooltip />
          </div>
          <div className="text-zinc-600 font-sans">W: {checklist.weekly_trend?.toUpperCase()} | D: {checklist.daily_trend?.toUpperCase()} | 4H: {checklist.h4_trend?.toUpperCase()}</div>
        </>
      )}
    </motion.div>
  );
}

function SyncIndicator({ t }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border border-zinc-700 bg-zinc-950 rounded-2xl flex items-center gap-4">
      <Zap className="w-8 h-8 text-white" />
      <div>
        <div className="text-white font-bold tracking-wider">{t('dailyH4Sync')}</div>
        <div className="text-sm text-zinc-500 font-sans">{t('higherProbability')}</div>
      </div>
    </motion.div>
  );
}

function SuccessBox({ text }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border-2 border-white bg-white rounded-2xl">
      <div className="text-black font-bold tracking-wider text-center text-lg">✓ {text}</div>
    </motion.div>
  );
}

function SummaryItem({ label, value, highlight = false }) {
  return (
    <div className={cn("p-4 rounded-xl", highlight ? "bg-white text-black" : "bg-zinc-900")}>
      <span className={cn("text-sm", highlight ? "text-zinc-600" : "text-zinc-600")}>{label}:</span>
      <span className={cn("ml-2 font-bold", highlight ? "text-black" : "text-white")}>{value}</span>
    </div>
  );
}