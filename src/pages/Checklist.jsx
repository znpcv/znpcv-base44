import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 
  'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP',
  'EUR/JPY', 'GBP/JPY', 'EUR/AUD', 'GBP/AUD',
];

const TIMEFRAMES = [
  { key: 'weekly', label: 'WEEKLY', desc: 'HAUPTTREND' },
  { key: 'daily', label: 'DAILY', desc: 'MITTELFRISTIG' },
  { key: 'h4', label: '4H', desc: 'EINSTIEG' },
];

const TIMEFRAME_CHECKS = [
  { key: 'trend', label: 'TREND IDENTIFIZIERT', options: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
  { key: 'structure', label: 'MARKTSTRUKTUR KLAR' },
  { key: 'key_levels', label: 'KEY LEVELS MARKIERT' },
  { key: 'liquidity', label: 'LIQUIDITY ZONES ERKANNT' },
];

const PATTERNS = [
  'HEAD & SHOULDERS', 'INV. HEAD & SHOULDERS', 
  'DOUBLE TOP', 'DOUBLE BOTTOM',
  'TRIANGLE', 'FLAG', 'WEDGE', 'CHANNEL'
];

const ENTRY_CHECKS = [
  { key: 'sos_confirmed', label: 'SOS BESTÄTIGT (30M-1HR)' },
  { key: 'engulfing_confirmed', label: 'ENGULFING CANDLE (30M-1HR)' },
  { key: 'fvg_ob_confirmed', label: 'FVG / ORDER BLOCK ENTRY' },
  { key: 'risk_reward', label: 'RISK/REWARD ≥ 1:2' },
  { key: 'sl_placed', label: 'STOP LOSS PLATZIERT' },
  { key: 'tp_placed', label: 'TAKE PROFIT DEFINIERT' },
];

const STEPS = [
  { key: 'pair', label: 'PAIR' },
  { key: 'weekly', label: 'WEEKLY' },
  { key: 'daily', label: 'DAILY' },
  { key: 'h4', label: '4H' },
  { key: 'aoi', label: 'AOI' },
  { key: 'pattern', label: 'PATTERN' },
  { key: 'entry', label: 'ENTRY' },
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
    // Weekly checks
    weekly_trend: '',
    weekly_structure: false,
    weekly_key_levels: false,
    weekly_liquidity: false,
    // Daily checks
    daily_trend: '',
    daily_structure: false,
    daily_key_levels: false,
    daily_liquidity: false,
    // 4H checks
    h4_trend: '',
    h4_structure: false,
    h4_key_levels: false,
    h4_liquidity: false,
    // AOI
    aoi_identified: false,
    aoi_position: '',
    // Patterns
    patterns: [],
    pattern_confirmed: false,
    // Entry
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
    if (checklistId) loadChecklist();
  }, [checklistId]);

  const loadChecklist = async () => {
    const data = await base44.entities.TradeChecklist.filter({ id: checklistId });
    if (data.length > 0) setChecklist(data[0]);
    setIsLoading(false);
  };

  const update = (key, value) => setChecklist(prev => ({ ...prev, [key]: value }));

  const togglePattern = (pattern) => {
    setChecklist(prev => ({
      ...prev,
      patterns: prev.patterns?.includes(pattern) 
        ? prev.patterns.filter(p => p !== pattern)
        : [...(prev.patterns || []), pattern]
    }));
  };

  const calculateProgress = () => {
    let total = 0, completed = 0;
    
    // Pair
    total++; if (checklist.pair) completed++;
    
    // Weekly (4 checks)
    total += 4;
    if (checklist.weekly_trend) completed++;
    if (checklist.weekly_structure) completed++;
    if (checklist.weekly_key_levels) completed++;
    if (checklist.weekly_liquidity) completed++;
    
    // Daily (4 checks)
    total += 4;
    if (checklist.daily_trend) completed++;
    if (checklist.daily_structure) completed++;
    if (checklist.daily_key_levels) completed++;
    if (checklist.daily_liquidity) completed++;
    
    // 4H (4 checks)
    total += 4;
    if (checklist.h4_trend) completed++;
    if (checklist.h4_structure) completed++;
    if (checklist.h4_key_levels) completed++;
    if (checklist.h4_liquidity) completed++;
    
    // AOI (2 checks)
    total += 2;
    if (checklist.aoi_identified) completed++;
    if (checklist.aoi_position) completed++;
    
    // Patterns (2 checks)
    total += 2;
    if (checklist.patterns?.length > 0) completed++;
    if (checklist.pattern_confirmed) completed++;
    
    // Entry (6 checks)
    total += 6;
    if (checklist.sos_confirmed) completed++;
    if (checklist.engulfing_confirmed) completed++;
    if (checklist.fvg_ob_confirmed) completed++;
    if (checklist.risk_reward) completed++;
    if (checklist.sl_placed) completed++;
    if (checklist.tp_placed) completed++;
    
    return Math.round((completed / total) * 100);
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

  // Check if all timeframes have same trend
  const hasConfluence = checklist.weekly_trend && checklist.daily_trend && checklist.h4_trend &&
    checklist.weekly_trend === checklist.daily_trend && checklist.daily_trend === checklist.h4_trend;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl tracking-widest">LADEN...</div>
      </div>
    );
  }

  const renderTimeframeStep = (tf) => {
    const prefix = tf.key;
    return (
      <motion.div key={tf.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl tracking-widest mb-2">{tf.label} ANALYSE</h2>
          <p className="text-zinc-500 text-lg tracking-widest">{tf.desc}</p>
        </div>

        {/* Trend Selection */}
        <div className="border border-zinc-800 p-6">
          <h3 className="text-xl tracking-widest mb-4 text-zinc-400">TREND</h3>
          <div className="grid grid-cols-3 gap-3">
            {['BULLISH', 'BEARISH', 'NEUTRAL'].map((trend) => (
              <button
                key={trend}
                onClick={() => update(`${prefix}_trend`, trend.toLowerCase())}
                className={cn(
                  "py-4 border text-lg tracking-wider transition-all",
                  checklist[`${prefix}_trend`] === trend.toLowerCase()
                    ? trend === 'BULLISH' ? 'bg-green-500 border-green-500 text-black'
                    : trend === 'BEARISH' ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-yellow-500 border-yellow-500 text-black'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                )}
              >
                {trend}
              </button>
            ))}
          </div>
        </div>

        {/* Other Checks */}
        <div className="space-y-3">
          {[
            { key: `${prefix}_structure`, label: 'MARKTSTRUKTUR KLAR' },
            { key: `${prefix}_key_levels`, label: 'KEY LEVELS MARKIERT' },
            { key: `${prefix}_liquidity`, label: 'LIQUIDITY ZONES ERKANNT' },
          ].map((check) => (
            <button
              key={check.key}
              onClick={() => update(check.key, !checklist[check.key])}
              className={cn(
                "w-full p-5 border flex items-center gap-4 transition-all text-left",
                checklist[check.key] ? 'border-white bg-white text-black' : 'border-zinc-800 hover:border-zinc-600'
              )}
            >
              <div className={cn(
                "w-8 h-8 border-2 flex items-center justify-center",
                checklist[check.key] ? 'border-black bg-black' : 'border-zinc-600'
              )}>
                {checklist[check.key] && <Check className="w-5 h-5 text-white" />}
              </div>
              <span className="text-xl tracking-wider">{check.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* White Header with Logo */}
      <header className="bg-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(createPageUrl('Home'))} className="text-black hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/2f200c537_PNGZNPCVLOGOwei.png" 
              alt="ZNPCV" 
              className="h-14 w-auto"
            />

            <div className="text-right text-black">
              <div className="text-3xl">{progress}%</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-zinc-200">
          <motion.div
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </header>

      {/* Step Navigation */}
      <div className="bg-zinc-950 border-b border-zinc-800 overflow-x-auto">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-1">
          {STEPS.map((step, index) => (
            <button
              key={step.key}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "px-4 py-2 text-sm tracking-widest whitespace-nowrap transition-all",
                currentStep === index 
                  ? 'bg-white text-black' 
                  : 'text-zinc-500 hover:text-white'
              )}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 0: Pair Selection */}
          {currentStep === 0 && (
            <motion.div key="pair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">WÄHRUNGSPAAR</h2>
                <p className="text-zinc-500 text-lg tracking-widest">WÄHLE DAS FOREX-PAAR</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {FOREX_PAIRS.map((pair) => (
                  <button
                    key={pair}
                    onClick={() => update('pair', pair)}
                    className={cn(
                      "py-6 border text-xl tracking-wider transition-all",
                      checklist.pair === pair
                        ? "bg-white border-white text-black"
                        : "border-zinc-800 hover:border-zinc-500"
                    )}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Steps 1-3: Timeframe Analysis */}
          {currentStep === 1 && renderTimeframeStep(TIMEFRAMES[0])}
          {currentStep === 2 && renderTimeframeStep(TIMEFRAMES[1])}
          {currentStep === 3 && renderTimeframeStep(TIMEFRAMES[2])}

          {/* Step 4: AOI */}
          {currentStep === 4 && (
            <motion.div key="aoi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">AREA OF INTEREST</h2>
                <p className="text-zinc-500 text-lg tracking-widest">CONFLUENCE ZONE PRÜFEN</p>
              </div>

              {/* Confluence Status */}
              {checklist.weekly_trend && checklist.daily_trend && checklist.h4_trend && (
                <div className={cn(
                  "p-6 border text-center mb-6",
                  hasConfluence ? "border-green-500 bg-green-500/10" : "border-yellow-500 bg-yellow-500/10"
                )}>
                  <div className={cn("text-2xl tracking-widest", hasConfluence ? "text-green-500" : "text-yellow-500")}>
                    {hasConfluence ? '✓ CONFLUENCE BESTÄTIGT' : '⚠ KEINE CONFLUENCE'}
                  </div>
                  <div className="text-zinc-400 mt-2 tracking-wider">
                    W: {checklist.weekly_trend?.toUpperCase()} | D: {checklist.daily_trend?.toUpperCase()} | 4H: {checklist.h4_trend?.toUpperCase()}
                  </div>
                </div>
              )}

              <button
                onClick={() => update('aoi_identified', !checklist.aoi_identified)}
                className={cn(
                  "w-full p-6 border flex items-center gap-4 transition-all",
                  checklist.aoi_identified ? 'border-white bg-white text-black' : 'border-zinc-800 hover:border-zinc-600'
                )}
              >
                <div className={cn(
                  "w-8 h-8 border-2 flex items-center justify-center",
                  checklist.aoi_identified ? 'border-black bg-black' : 'border-zinc-600'
                )}>
                  {checklist.aoi_identified && <Check className="w-5 h-5 text-white" />}
                </div>
                <span className="text-xl tracking-wider">AOI IDENTIFIZIERT</span>
              </button>

              {checklist.aoi_identified && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => update('aoi_position', 'above')}
                    className={cn(
                      "py-8 border text-center transition-all",
                      checklist.aoi_position === 'above' ? "bg-red-500 border-red-500 text-white" : "border-zinc-800 hover:border-zinc-500"
                    )}
                  >
                    <div className="text-3xl mb-2">↓</div>
                    <div className="text-xl tracking-wider">ÜBER AOI</div>
                    <div className="text-sm text-zinc-400 mt-1">SHORT SETUP</div>
                  </button>
                  <button
                    onClick={() => update('aoi_position', 'below')}
                    className={cn(
                      "py-8 border text-center transition-all",
                      checklist.aoi_position === 'below' ? "bg-green-500 border-green-500 text-black" : "border-zinc-800 hover:border-zinc-500"
                    )}
                  >
                    <div className="text-3xl mb-2">↑</div>
                    <div className="text-xl tracking-wider">UNTER AOI</div>
                    <div className="text-sm text-zinc-400 mt-1">LONG SETUP</div>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 5: Patterns */}
          {currentStep === 5 && (
            <motion.div key="pattern" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">CHART PATTERNS</h2>
                <p className="text-zinc-500 text-lg tracking-widest">ERKANNTE PATTERNS AUSWÄHLEN</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PATTERNS.map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => togglePattern(pattern)}
                    className={cn(
                      "py-5 border text-lg tracking-wider transition-all",
                      checklist.patterns?.includes(pattern)
                        ? "bg-white border-white text-black"
                        : "border-zinc-800 hover:border-zinc-500"
                    )}
                  >
                    {pattern}
                  </button>
                ))}
              </div>

              {checklist.patterns?.length > 0 && (
                <button
                  onClick={() => update('pattern_confirmed', !checklist.pattern_confirmed)}
                  className={cn(
                    "w-full p-5 border flex items-center gap-4 transition-all mt-6",
                    checklist.pattern_confirmed ? 'border-white bg-white text-black' : 'border-zinc-800 hover:border-zinc-600'
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 border-2 flex items-center justify-center",
                    checklist.pattern_confirmed ? 'border-black bg-black' : 'border-zinc-600'
                  )}>
                    {checklist.pattern_confirmed && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <span className="text-xl tracking-wider">PATTERN BESTÄTIGT & VALIDE</span>
                </button>
              )}
            </motion.div>
          )}

          {/* Step 6: Entry */}
          {currentStep === 6 && (
            <motion.div key="entry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">ENTRY CHECKLIST</h2>
                <p className="text-zinc-500 text-lg tracking-widest">FINALE BESTÄTIGUNGEN</p>
              </div>

              <div className="space-y-3">
                {ENTRY_CHECKS.map((check) => (
                  <button
                    key={check.key}
                    onClick={() => update(check.key, !checklist[check.key])}
                    className={cn(
                      "w-full p-5 border flex items-center gap-4 transition-all text-left",
                      checklist[check.key] ? 'border-white bg-white text-black' : 'border-zinc-800 hover:border-zinc-600'
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 border-2 flex items-center justify-center flex-shrink-0",
                      checklist[check.key] ? 'border-black bg-black' : 'border-zinc-600'
                    )}>
                      {checklist[check.key] && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <span className="text-xl tracking-wider">{check.label}</span>
                  </button>
                ))}
              </div>

              {/* Notes */}
              <div className="mt-8">
                <label className="block text-zinc-500 tracking-widest mb-2">NOTIZEN</label>
                <Textarea
                  value={checklist.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="TRADE NOTIZEN..."
                  className="bg-black border-zinc-800 text-white placeholder:text-zinc-600 min-h-[100px] rounded-none tracking-wider focus:border-white"
                />
              </div>

              {isReady && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-white text-black text-center"
                >
                  <div className="text-4xl tracking-widest">✓ READY TO TRADE</div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex gap-3">
          {currentStep > 0 && (
            <Button 
              onClick={() => setCurrentStep(prev => prev - 1)} 
              variant="outline" 
              className="border-zinc-800 text-white hover:bg-zinc-900 rounded-none tracking-widest"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> ZURÜCK
            </Button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <Button 
              onClick={() => setCurrentStep(prev => prev + 1)} 
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-none tracking-widest text-lg py-6"
            >
              WEITER <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="flex-1 flex gap-3">
              {checklistId && (
                <Button 
                  onClick={handleDelete} 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500/10 rounded-none"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={saving || !checklist.pair}
                className={cn(
                  "flex-1 rounded-none tracking-widest text-lg py-6",
                  isReady ? "bg-white hover:bg-zinc-100 text-black" : "bg-zinc-800 hover:bg-zinc-700"
                )}
              >
                <Save className="w-5 h-5 mr-2" /> {saving ? 'SPEICHERN...' : 'SPEICHERN'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}