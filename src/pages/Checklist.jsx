import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertTriangle, TrendingUp, TrendingDown, Check, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from "@/lib/utils";

// Forex Pairs
const FOREX_PAIRS = [
  { pair: 'EUR/USD', flag: '🇪🇺🇺🇸' },
  { pair: 'GBP/USD', flag: '🇬🇧🇺🇸' },
  { pair: 'USD/JPY', flag: '🇺🇸🇯🇵' },
  { pair: 'USD/CHF', flag: '🇺🇸🇨🇭' },
  { pair: 'AUD/USD', flag: '🇦🇺🇺🇸' },
  { pair: 'USD/CAD', flag: '🇺🇸🇨🇦' },
  { pair: 'NZD/USD', flag: '🇳🇿🇺🇸' },
  { pair: 'EUR/GBP', flag: '🇪🇺🇬🇧' },
  { pair: 'EUR/JPY', flag: '🇪🇺🇯🇵' },
  { pair: 'GBP/JPY', flag: '🇬🇧🇯🇵' },
  { pair: 'EUR/AUD', flag: '🇪🇺🇦🇺' },
  { pair: 'GBP/AUD', flag: '🇬🇧🇦🇺' },
];

const PATTERNS = [
  { key: 'head_shoulders', label: 'Head & Shoulders', icon: '👤' },
  { key: 'inv_head_shoulders', label: 'Inv. H&S', icon: '🙃' },
  { key: 'double_top', label: 'Double Top', icon: '⛰️' },
  { key: 'double_bottom', label: 'Double Bottom', icon: '🏔️' },
  { key: 'triangle', label: 'Triangle', icon: '📐' },
  { key: 'flag', label: 'Flag', icon: '🚩' },
  { key: 'wedge', label: 'Wedge', icon: '◢' },
  { key: 'channel', label: 'Channel', icon: '═' },
];

const STEPS = [
  { key: 'pair', label: 'Pair', icon: '💱' },
  { key: 'trend', label: 'Trend', icon: '📊' },
  { key: 'aoi', label: 'AOI', icon: '🎯' },
  { key: 'pattern', label: 'Pattern', icon: '📐' },
  { key: 'entry', label: 'Entry', icon: '✅' },
];

export default function ChecklistPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checklistId = searchParams.get('id');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!checklistId);

  const [checklist, setChecklist] = useState({
    pair: '',
    trade_date: format(new Date(), 'yyyy-MM-dd'),
    weekly_trend: '',
    daily_trend: '',
    h4_trend: '',
    aoi_identified: false,
    aoi_position: '',
    patterns: [],
    pattern_confirmed: false,
    sos_confirmed: false,
    engulfing_confirmed: false,
    fvg_ob_confirmed: false,
    risk_reward: false,
    sl_placed: false,
    tp_placed: false,
    notes: '',
    status: 'in_progress',
    direction: ''
  });

  useEffect(() => {
    if (checklistId) {
      loadChecklist();
    }
  }, [checklistId]);

  const loadChecklist = async () => {
    const data = await base44.entities.TradeChecklist.filter({ id: checklistId });
    if (data.length > 0) setChecklist(data[0]);
    setIsLoading(false);
  };

  const update = (key, value) => setChecklist(prev => ({ ...prev, [key]: value }));

  const togglePattern = (key) => {
    setChecklist(prev => ({
      ...prev,
      patterns: prev.patterns?.includes(key) 
        ? prev.patterns.filter(p => p !== key)
        : [...(prev.patterns || []), key]
    }));
  };

  const calculateProgress = () => {
    let total = 15, completed = 0;
    if (checklist.pair) completed++;
    if (checklist.trade_date) completed++;
    if (checklist.weekly_trend) completed++;
    if (checklist.daily_trend) completed++;
    if (checklist.h4_trend) completed++;
    if (checklist.aoi_identified) completed++;
    if (checklist.aoi_position) completed++;
    if (checklist.patterns?.length > 0) completed++;
    if (checklist.pattern_confirmed) completed++;
    if (checklist.sos_confirmed) completed++;
    if (checklist.engulfing_confirmed) completed++;
    if (checklist.fvg_ob_confirmed) completed++;
    if (checklist.risk_reward) completed++;
    if (checklist.sl_placed) completed++;
    if (checklist.tp_placed) completed++;
    return (completed / total) * 100;
  };

  const handleSave = async () => {
    setSaving(true);
    const progress = calculateProgress();
    const direction = checklist.aoi_position === 'below' ? 'long' : checklist.aoi_position === 'above' ? 'short' : '';
    const data = { ...checklist, direction, completion_percentage: progress, status: progress === 100 ? 'ready_to_trade' : 'in_progress' };
    
    if (checklistId) await base44.entities.TradeChecklist.update(checklistId, data);
    else await base44.entities.TradeChecklist.create(data);
    
    setSaving(false);
    navigate(createPageUrl('Home'));
  };

  const handleDelete = async () => {
    if (checklistId) await base44.entities.TradeChecklist.delete(checklistId);
    navigate(createPageUrl('Home'));
  };

  const progress = calculateProgress();
  const isReady = progress === 100;
  const hasConfluence = checklist.weekly_trend && checklist.daily_trend && checklist.h4_trend &&
                        checklist.weekly_trend === checklist.daily_trend && checklist.daily_trend === checklist.h4_trend;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="animate-pulse text-emerald-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(createPageUrl('Home'))} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Zurück</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold tracking-wider">ZNPCV</span>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-emerald-500">{Math.round(progress)}%</div>
              <div className="text-xs text-slate-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step Navigation */}
          <div className="flex gap-1 mt-4">
            {STEPS.map((step, index) => (
              <button
                key={step.key}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1",
                  currentStep === index 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700/50'
                )}
              >
                <span>{step.icon}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        <AnimatePresence mode="wait">
          {/* Step 0: Pair Selection */}
          {currentStep === 0 && (
            <motion.div key="pair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black mb-2">Währungspaar wählen</h2>
                <p className="text-slate-500 text-sm">Wähle das Forex-Paar für deine Analyse</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {FOREX_PAIRS.map((item) => (
                  <motion.button
                    key={item.pair}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => update('pair', item.pair)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all text-center",
                      checklist.pair === item.pair
                        ? "bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                        : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                    )}
                  >
                    <div className="text-2xl mb-1">{item.flag}</div>
                    <div className={cn("font-bold text-sm", checklist.pair === item.pair ? "text-emerald-400" : "text-white")}>
                      {item.pair}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Trend Analysis */}
          {currentStep === 1 && (
            <motion.div key="trend" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black mb-2">Trend Analyse</h2>
                <p className="text-slate-500 text-sm">Weekly → Daily → 4H Confluence prüfen</p>
              </div>

              {[
                { key: 'weekly_trend', label: 'Weekly', desc: 'Haupttrend' },
                { key: 'daily_trend', label: 'Daily', desc: 'Mittelfristig' },
                { key: 'h4_trend', label: '4H', desc: 'Einstieg' },
              ].map((tf) => (
                <div key={tf.key} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-white">{tf.label}</span>
                      <span className="text-xs text-slate-500 ml-2">{tf.desc}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'bullish', label: 'Bullish', icon: TrendingUp, color: 'emerald' },
                      { value: 'bearish', label: 'Bearish', icon: TrendingDown, color: 'red' },
                      { value: 'neutral', label: 'Neutral', icon: null, color: 'amber' },
                    ].map((trend) => (
                      <button
                        key={trend.value}
                        onClick={() => update(tf.key, trend.value)}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex items-center justify-center gap-2",
                          checklist[tf.key] === trend.value
                            ? trend.color === 'emerald' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : trend.color === 'red' ? 'bg-red-500/20 border-red-500/50 text-red-400'
                            : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'
                        )}
                      >
                        {trend.icon && <trend.icon className="w-4 h-4" />}
                        <span className="text-sm font-medium">{trend.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Confluence Indicator */}
              {checklist.weekly_trend && checklist.daily_trend && checklist.h4_trend && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("p-4 rounded-2xl border text-center", hasConfluence ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30")}>
                  {hasConfluence ? (
                    <span className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> CONFLUENCE - Alle Timeframes {checklist.weekly_trend}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center justify-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Mixed Signals - Keine Confluence
                    </span>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2: AOI */}
          {currentStep === 2 && (
            <motion.div key="aoi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black mb-2">Area of Interest</h2>
                <p className="text-slate-500 text-sm">AOI identifizieren & Position bestimmen</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => update('aoi_identified', !checklist.aoi_identified)}
                className={cn(
                  "w-full p-6 rounded-2xl border transition-all flex items-center gap-4",
                  checklist.aoi_identified ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                )}
              >
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-lg", checklist.aoi_identified ? "bg-emerald-500" : "bg-slate-700")}>
                  {checklist.aoi_identified ? <Check className="w-5 h-5 text-white" /> : '🎯'}
                </div>
                <div className="text-left">
                  <div className={cn("font-bold", checklist.aoi_identified ? "text-emerald-400" : "text-white")}>AOI identifiziert</div>
                  <div className="text-xs text-slate-500">W-Daily & 4hr Confluence Zone</div>
                </div>
              </motion.button>

              {checklist.aoi_identified && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => update('aoi_position', 'above')}
                    className={cn(
                      "p-6 rounded-2xl border transition-all text-center",
                      checklist.aoi_position === 'above' ? "bg-red-500/10 border-red-500/50" : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                    )}
                  >
                    <TrendingDown className={cn("w-10 h-10 mx-auto mb-2", checklist.aoi_position === 'above' ? "text-red-500" : "text-slate-500")} />
                    <div className={cn("font-bold", checklist.aoi_position === 'above' ? "text-red-400" : "text-white")}>ÜBER AOI</div>
                    <div className="text-xs text-slate-500 mt-1">Short Setup</div>
                  </button>
                  <button
                    onClick={() => update('aoi_position', 'below')}
                    className={cn(
                      "p-6 rounded-2xl border transition-all text-center",
                      checklist.aoi_position === 'below' ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                    )}
                  >
                    <TrendingUp className={cn("w-10 h-10 mx-auto mb-2", checklist.aoi_position === 'below' ? "text-emerald-500" : "text-slate-500")} />
                    <div className={cn("font-bold", checklist.aoi_position === 'below' ? "text-emerald-400" : "text-white")}>UNTER AOI</div>
                    <div className="text-xs text-slate-500 mt-1">Long Setup</div>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Patterns */}
          {currentStep === 3 && (
            <motion.div key="pattern" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black mb-2">Chart Patterns</h2>
                <p className="text-slate-500 text-sm">Erkannte Patterns auswählen</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PATTERNS.map((pattern) => (
                  <motion.button
                    key={pattern.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => togglePattern(pattern.key)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center gap-3",
                      checklist.patterns?.includes(pattern.key) ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                    )}
                  >
                    <span className="text-2xl">{pattern.icon}</span>
                    <span className={cn("font-medium text-sm", checklist.patterns?.includes(pattern.key) ? "text-emerald-400" : "text-white")}>
                      {pattern.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {checklist.patterns?.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => update('pattern_confirmed', !checklist.pattern_confirmed)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-3",
                    checklist.pattern_confirmed ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-800/30 border-slate-700/50"
                  )}
                >
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", checklist.pattern_confirmed ? "bg-emerald-500" : "bg-slate-700")}>
                    {checklist.pattern_confirmed && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={cn("font-medium", checklist.pattern_confirmed ? "text-emerald-400" : "text-white")}>Pattern bestätigt & valide</span>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Step 4: Entry */}
          {currentStep === 4 && (
            <motion.div key="entry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black mb-2">Entry Checklist</h2>
                <p className="text-slate-500 text-sm">Finale Bestätigungen vor dem Trade</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'sos_confirmed', label: 'SOS bestätigt', desc: 'Sign of Strength (30m-1hr)' },
                  { key: 'engulfing_confirmed', label: 'Engulfing Candle', desc: 'Engulfing Pattern (30m-1hr)' },
                  { key: 'fvg_ob_confirmed', label: 'FVG / Order Block', desc: 'Fair Value Gap oder OB Entry' },
                  { key: 'risk_reward', label: 'Risk/Reward ≥ 1:2', desc: 'Minimum RR Ratio erfüllt' },
                  { key: 'sl_placed', label: 'Stop Loss platziert', desc: 'SL auf strukturellem Level' },
                  { key: 'tp_placed', label: 'Take Profit definiert', desc: 'TP Ziele festgelegt' },
                ].map((item, index) => (
                  <motion.button
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => update(item.key, !checklist[item.key])}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all flex items-center gap-4",
                      checklist[item.key] ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                    )}
                  >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all", checklist[item.key] ? "bg-emerald-500" : "bg-slate-700")}>
                      {checklist[item.key] && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="text-left flex-1">
                      <div className={cn("font-medium", checklist[item.key] ? "text-slate-400 line-through" : "text-white")}>{item.label}</div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Notizen</label>
                <Textarea
                  value={checklist.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Trade Notizen..."
                  className="bg-slate-800/30 border-slate-700/50 text-white placeholder:text-slate-600 min-h-[80px] rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>

              {isReady && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-center">
                  <div className="text-3xl mb-2">🚀</div>
                  <span className="text-white font-black text-xl tracking-wider">READY TO TRADE</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(prev => prev - 1)} variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800">
              <ChevronLeft className="w-4 h-4 mr-1" /> Zurück
            </Button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} className="flex-1 bg-slate-700 hover:bg-slate-600">
              Weiter <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex-1 flex gap-3">
              {checklistId && (
                <Button onClick={handleDelete} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving || !checklist.pair}
                className={cn("flex-1", isReady ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700" : "bg-slate-700 hover:bg-slate-600")}>
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}