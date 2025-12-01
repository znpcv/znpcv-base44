import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Check, ChevronRight, ChevronLeft, Home, ArrowUp, AlertTriangle, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import AssetSelector from '@/components/AssetSelector';
import { useLanguage, LanguageToggle } from '@/components/LanguageContext';
import TradingQuote from '@/components/TradingQuote';

const STEPS = ['pair', 'trend', 'aoi', 'structure', 'patterns', 'entry', 'final'];

export default function ChecklistPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const checklistId = searchParams.get('id');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!checklistId);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
    total++; if (checklist.pair) completed++;
    total += 3;
    if (checklist.weekly_trend) completed++;
    if (checklist.daily_trend) completed++;
    if (checklist.h4_trend) completed++;
    total += 2;
    if (checklist.aoi_identified) completed++;
    if (checklist.price_in_aoi) completed++;
    total += 2;
    if (checklist.pss_rejected) completed++;
    if (checklist.ema_respected) completed++;
    total += 2;
    if (checklist.pattern_type) completed++;
    if (checklist.pattern_confirmed) completed++;
    total += 2;
    if (checklist.mss_confirmed) completed++;
    if (checklist.engulfing_confirmed) completed++;
    total += 2;
    if (checklist.not_buying_resistance) completed++;
    if (checklist.not_selling_support) completed++;
    return Math.round((completed / total) * 100);
  };

  const handleSave = async () => {
    setSaving(true);
    const progress = calculateProgress();
    const direction = suggestedDirection || '';
    const data = { 
      ...checklist, 
      direction, 
      completion_percentage: progress, 
      status: progress === 100 ? 'ready_to_trade' : 'in_progress',
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
  const isReady = progress === 100;

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
        <div className="text-white text-2xl tracking-widest">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-white">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(createPageUrl('Home'))} className="text-black hover:opacity-70">
                <Home className="w-6 h-6" />
              </button>
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className="text-black hover:opacity-70">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" 
                alt="ZNPCV" 
                className="h-10 w-auto cursor-pointer hover:opacity-80"
              />
            </button>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              <div className={cn("text-2xl font-bold", isReady ? "text-emerald-600" : "text-black")}>{progress}%</div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-zinc-200">
          <motion.div className={cn("h-full", isReady ? "bg-emerald-500" : "bg-black")} initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Steps */}
      <div className="bg-slate-900 border-b border-slate-800 overflow-x-auto">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-1">
          {STEPS.map((step, index) => (
            <button
              key={step}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "px-4 py-2 text-sm tracking-widest whitespace-nowrap transition-all rounded",
                currentStep === index ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              )}
            >
              {stepLabels[step]}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* STEP 0: Asset */}
          {currentStep === 0 && (
            <motion.div key="pair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader title={t('selectAsset')} subtitle={t('selectAssetDesc')} />
              <AssetSelector selectedPair={checklist.pair} onSelect={(pair) => update('pair', pair)} />
            </motion.div>
          )}

          {/* STEP 1: Trend */}
          {currentStep === 1 && (
            <motion.div key="trend" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader title={t('trendAnalysis')} subtitle={t('trendAnalysisDesc')} />
              
              {[
                { key: 'weekly_trend', label: t('weekly'), desc: t('mainTrend') },
                { key: 'daily_trend', label: t('daily'), desc: t('midTerm') },
                { key: 'h4_trend', label: t('fourHour'), desc: t('shortTerm') },
              ].map((tf) => (
                <div key={tf.key} className="border border-slate-800 rounded-xl p-6 bg-slate-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl tracking-widest">{tf.label}</span>
                      <span className="text-zinc-500 ml-2 text-sm">{tf.desc}</span>
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
              <StepHeader title={t('aoi')} subtitle={t('aoiDesc')} />
              
              <CheckItem checked={checklist.aoi_identified} onChange={() => update('aoi_identified', !checklist.aoi_identified)} label={t('aoiDrawn')} description={t('aoiDrawnDesc')} />

              {checklist.aoi_identified && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <CheckItem checked={checklist.price_in_aoi} onChange={() => update('price_in_aoi', !checklist.price_in_aoi)} label={t('priceInAoi')} description={t('priceInAoiDesc')} />

                  <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/50">
                    <label className="text-zinc-500 text-sm tracking-widest mb-4 block">{t('pricePosition')}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <AOIButton selected={checklist.aoi_position === 'above'} onClick={() => update('aoi_position', 'above')} type="short" labels={{ main: t('aboveAoi'), sub: t('shortSetup') }} />
                      <AOIButton selected={checklist.aoi_position === 'below'} onClick={() => update('aoi_position', 'below')} type="long" labels={{ main: t('belowAoi'), sub: t('longSetup') }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Structure */}
          {currentStep === 3 && (
            <motion.div key="structure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <StepHeader title={t('structureCheck')} subtitle={t('structureCheckDesc')} />
              
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
              <StepHeader title={t('patterns')} subtitle={t('patternsDesc')} />
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'head_shoulders', label: t('headShoulders'), icon: '📉' },
                  { key: 'inv_head_shoulders', label: t('invHeadShoulders'), icon: '📈' },
                  { key: 'double_top', label: t('doubleTop'), icon: '🔻' },
                  { key: 'double_bottom', label: t('doubleBottom'), icon: '🔺' },
                ].map((pattern) => (
                  <button
                    key={pattern.key}
                    onClick={() => update('pattern_type', pattern.key)}
                    className={cn(
                      "py-6 border rounded-xl text-center transition-all",
                      checklist.pattern_type === pattern.key
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "border-slate-800 text-zinc-400 hover:border-slate-600 bg-slate-900/50"
                    )}
                  >
                    <div className="text-3xl mb-2">{pattern.icon}</div>
                    <div className="text-sm tracking-wider">{pattern.label}</div>
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
              <StepHeader title={t('entryConfirmation')} subtitle={t('entryConfirmationDesc')} />

              <CheckItem checked={checklist.mss_confirmed} onChange={() => update('mss_confirmed', !checklist.mss_confirmed)} label={t('mssConfirmed')} description={t('mssConfirmedDesc')} />

              <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/50">
                <label className="text-zinc-500 text-sm tracking-widest mb-2 block">{t('engulfingAfterPullback')}</label>
                <p className="text-zinc-400 text-sm mb-4 font-sans">{t('engulfingQuestion')}</p>
                
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
              <StepHeader title={t('finalCheck')} subtitle={t('finalCheckDesc')} />

              <div className="border border-yellow-500/50 bg-yellow-500/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <span className="text-yellow-500 font-bold tracking-widest">{t('importantRules')}</span>
                </div>
                
                <CheckItem checked={checklist.not_buying_resistance} onChange={() => update('not_buying_resistance', !checklist.not_buying_resistance)} label={t('notBuyingResistance')} description={t('notBuyingResistanceDesc')} color="yellow" />
                <div className="mt-4">
                  <CheckItem checked={checklist.not_selling_support} onChange={() => update('not_selling_support', !checklist.not_selling_support)} label={t('notSellingSupport')} description={t('notSellingSupportDesc')} color="yellow" />
                </div>
              </div>

              {/* Summary */}
              <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/50 space-y-4">
                <h3 className="text-xl tracking-widest mb-4">{t('summary')}</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <SummaryItem label={t('pair')} value={checklist.pair || '-'} />
                  <SummaryItem label={t('trend')} value={trendsAlign ? checklist.weekly_trend?.toUpperCase() : t('mixed')} color={trendsAlign ? 'text-emerald-400' : 'text-yellow-400'} />
                  <SummaryItem label={t('aoi')} value={checklist.price_in_aoi ? `✓ ${t('inAoi')}` : '✗'} />
                  <SummaryItem label={t('entry')} value={checklist.engulfing_confirmed ? `${checklist.engulfing_color?.toUpperCase()} ENGULFING` : '-'} color={checklist.engulfing_color === 'blue' ? 'text-blue-400' : checklist.engulfing_color === 'red' ? 'text-red-400' : ''} />
                </div>

                {isDailyH4Sync && <SyncIndicator t={t} />}
              </div>

              <div>
                <label className="block text-zinc-500 tracking-widest mb-2">{t('notes')}</label>
                <Textarea
                  value={checklist.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder={t('notesPlaceholder')}
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-zinc-600 min-h-[100px] rounded-xl font-sans focus:border-emerald-500"
                />
              </div>

              {isReady && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-emerald-500 text-black text-center rounded-xl">
                  <div className="text-4xl tracking-widest mb-2">✓ {t('readyToTrade')}</div>
                  <div className="text-lg font-sans">{t('allConfirmed')}</div>
                </motion.div>
              )}

              <TradingQuote variant="minimal" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex gap-3">
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(prev => prev - 1)} variant="outline" className="border-slate-700 text-white hover:bg-slate-800 rounded-xl tracking-widest">
              <ChevronLeft className="w-4 h-4 mr-2" /> {t('back')}
            </Button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} className="flex-1 bg-slate-800 hover:bg-slate-700 rounded-xl tracking-widest text-lg py-6">
              {t('next')} <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="flex-1 flex gap-3">
              {checklistId && (
                <Button onClick={handleDelete} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving || !checklist.pair}
                className={cn("flex-1 rounded-xl tracking-widest text-lg py-6",
                  isReady ? "bg-emerald-500 hover:bg-emerald-600 text-black" : "bg-slate-800 hover:bg-slate-700")}>
                <Save className="w-5 h-5 mr-2" /> {saving ? t('saving') : t('save')}
              </Button>
            </div>
          )}
        </div>
      </main>

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
function StepHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-4xl tracking-widest mb-2">{title}</h2>
      <p className="text-zinc-500 text-lg tracking-widest">{subtitle}</p>
    </div>
  );
}

function CheckItem({ checked, onChange, label, description, color = 'emerald' }) {
  const colors = {
    emerald: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', check: 'border-emerald-500 bg-emerald-500' },
    yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', check: 'border-yellow-500 bg-yellow-500' },
  };
  const c = colors[color];
  
  return (
    <button onClick={onChange} className={cn(
      "w-full p-5 border rounded-xl flex items-center gap-4 transition-all text-left",
      checked ? `${c.border} ${c.bg}` : 'border-slate-800 hover:border-slate-600 bg-slate-900/50'
    )}>
      <div className={cn("w-8 h-8 border-2 flex items-center justify-center flex-shrink-0 rounded", checked ? c.check : 'border-zinc-600')}>
        {checked && <Check className="w-5 h-5 text-black" />}
      </div>
      <div>
        <span className="text-lg tracking-wider block">{label}</span>
        {description && <span className="text-sm text-zinc-500 font-sans">{description}</span>}
      </div>
    </button>
  );
}

function TrendButton({ selected, onClick, type, label }) {
  return (
    <button onClick={onClick} className={cn(
      "py-4 border rounded-xl text-lg tracking-wider transition-all",
      selected
        ? type === 'bullish' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-red-500 border-red-500 text-white'
        : 'border-slate-700 text-zinc-400 hover:border-slate-500'
    )}>
      {type === 'bullish' ? '↑' : '↓'} {label}
    </button>
  );
}

function AOIButton({ selected, onClick, type, labels }) {
  return (
    <button onClick={onClick} className={cn(
      "py-6 border rounded-xl text-center transition-all",
      selected
        ? type === 'long' ? "bg-emerald-500 border-emerald-500 text-black" : "bg-red-500 border-red-500 text-white"
        : "border-slate-800 hover:border-slate-500 bg-slate-900/50"
    )}>
      <div className="text-3xl mb-2">{type === 'long' ? '↑' : '↓'}</div>
      <div className="text-lg tracking-wider">{labels.main}</div>
      <div className="text-sm text-zinc-400 mt-1">{labels.sub}</div>
    </button>
  );
}

function EngulfingButton({ selected, onClick, type, labels }) {
  return (
    <button onClick={onClick} className={cn(
      "py-6 border rounded-xl text-center transition-all",
      selected
        ? type === 'blue' ? "bg-blue-500 border-blue-500 text-white" : "bg-red-500 border-red-500 text-white"
        : "border-slate-800 hover:border-slate-500 bg-slate-900/50"
    )}>
      <div className="text-2xl mb-2">{type === 'blue' ? '🟦' : '🟥'}</div>
      <div className="text-lg tracking-wider">{labels.main}</div>
      <div className="text-sm text-zinc-400 mt-1">{labels.sub}</div>
    </button>
  );
}

function ConfluenceBox({ trendsAlign, trend, t, checklist }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={cn("p-6 border rounded-xl text-center", trendsAlign ? "border-emerald-500 bg-emerald-500/10" : "border-yellow-500 bg-yellow-500/10")}>
      {trendsAlign ? (
        <>
          <div className="text-emerald-400 text-2xl tracking-widest mb-2">✓ {t('confluence')}</div>
          <div className="text-zinc-400 font-sans">{t('allTimeframes')} {trend?.toUpperCase()}</div>
        </>
      ) : (
        <>
          <div className="text-yellow-400 text-2xl tracking-widest mb-2">⚠ {t('noConfluence')}</div>
          <div className="text-zinc-400 font-sans">W: {checklist.weekly_trend?.toUpperCase()} | D: {checklist.daily_trend?.toUpperCase()} | 4H: {checklist.h4_trend?.toUpperCase()}</div>
        </>
      )}
    </motion.div>
  );
}

function SyncIndicator({ t }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-blue-500 bg-blue-500/10 rounded-xl flex items-center gap-3">
      <Zap className="w-6 h-6 text-blue-400" />
      <div>
        <div className="text-blue-400 font-bold tracking-wider">{t('dailyH4Sync')}</div>
        <div className="text-sm text-zinc-400 font-sans">{t('higherProbability')}</div>
      </div>
    </motion.div>
  );
}

function SuccessBox({ text }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-emerald-500 bg-emerald-500/10 rounded-xl">
      <div className="text-emerald-400 font-bold tracking-wider text-center">✓ {text}</div>
    </motion.div>
  );
}

function SummaryItem({ label, value, color = 'text-white' }) {
  return (
    <div className="p-3 bg-slate-800/50 rounded-lg">
      <span className="text-zinc-500">{label}:</span>
      <span className={cn("ml-2", color)}>{value}</span>
    </div>
  );
}