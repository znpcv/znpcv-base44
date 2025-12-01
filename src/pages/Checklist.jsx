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

const STEPS = [
  { key: 'pair', label: 'ASSET' },
  { key: 'trend', label: 'TREND' },
  { key: 'aoi', label: 'AOI' },
  { key: 'structure', label: 'STRUKTUR' },
  { key: 'entry', label: 'ENTRY' },
  { key: 'final', label: 'FINAL' },
];

export default function ChecklistPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checklistId = searchParams.get('id');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!checklistId);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [checklist, setChecklist] = useState({
    pair: '',
    trade_date: format(new Date(), 'yyyy-MM-dd'),
    // Trend Analysis
    weekly_trend: '',
    daily_trend: '',
    h4_trend: '',
    // AOI
    aoi_identified: false,
    price_in_aoi: false,
    aoi_position: '',
    // Structure
    pss_rejected: false, // Previous Structure Support/Resistance rejected
    ema_respected: false,
    // Entry Confirmations
    mss_confirmed: false, // Market Structure Shift
    engulfing_confirmed: false,
    engulfing_color: '', // 'blue' for long, 'red' for short
    // Rules
    not_buying_resistance: false,
    not_selling_support: false,
    // Sync
    daily_4h_sync: false,
    // Direction
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

  // Check if all trends align
  const trendsAlign = checklist.weekly_trend && checklist.daily_trend && checklist.h4_trend &&
    checklist.weekly_trend === checklist.daily_trend && checklist.daily_trend === checklist.h4_trend;

  // Check if Daily and 4H are in sync
  const isDailyH4Sync = checklist.daily_trend && checklist.h4_trend && 
    checklist.daily_trend === checklist.h4_trend;

  // Determine trade direction based on trend
  const suggestedDirection = trendsAlign ? checklist.weekly_trend : null;

  const calculateProgress = () => {
    let total = 0, completed = 0;
    
    // Pair selection
    total++; if (checklist.pair) completed++;
    
    // Trend analysis (3 timeframes)
    total += 3;
    if (checklist.weekly_trend) completed++;
    if (checklist.daily_trend) completed++;
    if (checklist.h4_trend) completed++;
    
    // AOI checks
    total += 2;
    if (checklist.aoi_identified) completed++;
    if (checklist.price_in_aoi) completed++;
    
    // Structure checks
    total += 2;
    if (checklist.pss_rejected) completed++;
    if (checklist.ema_respected) completed++;
    
    // Entry confirmations
    total += 2;
    if (checklist.mss_confirmed) completed++;
    if (checklist.engulfing_confirmed) completed++;
    
    // Rules
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl tracking-widest">LADEN...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* White Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(createPageUrl('Home'))} className="text-black hover:opacity-70 transition-opacity">
                <Home className="w-6 h-6" />
              </button>
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className="text-black hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" 
                alt="ZNPCV" 
                className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>

            <div className="text-right text-black">
              <div className="text-3xl">{progress}%</div>
            </div>
          </div>
        </div>
        
        <div className="h-1 bg-zinc-200">
          <motion.div 
            className={cn("h-full", isReady ? "bg-emerald-500" : "bg-black")} 
            initial={{ width: 0 }} 
            animate={{ width: `${progress}%` }} 
          />
        </div>
      </header>

      {/* Step Navigation */}
      <div className="bg-zinc-950 border-b border-zinc-800 overflow-x-auto">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-1">
          {STEPS.map((step, index) => (
            <button
              key={step.key}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "px-4 py-2 text-sm tracking-widest whitespace-nowrap transition-all",
                currentStep === index ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              )}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* STEP 0: Asset Selection */}
          {currentStep === 0 && (
            <motion.div key="pair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">ASSET AUSWÄHLEN</h2>
                <p className="text-zinc-500 text-lg tracking-widest">WELCHES PAAR WILLST DU TRADEN?</p>
              </div>
              <AssetSelector selectedPair={checklist.pair} onSelect={(pair) => update('pair', pair)} />
            </motion.div>
          )}

          {/* STEP 1: Trend Analysis (W/D/4H) */}
          {currentStep === 1 && (
            <motion.div key="trend" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">TREND ANALYSE</h2>
                <p className="text-zinc-500 text-lg tracking-widest">PRÜFE ALLE 3 TIMEFRAMES</p>
              </div>

              {/* Timeframe Trend Selection */}
              {[
                { key: 'weekly_trend', label: 'WEEKLY', desc: 'Haupttrend' },
                { key: 'daily_trend', label: 'DAILY', desc: 'Mittelfristig' },
                { key: 'h4_trend', label: '4H', desc: 'Kurzfristig' },
              ].map((tf) => (
                <div key={tf.key} className="border border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl tracking-widest">{tf.label}</span>
                      <span className="text-zinc-500 ml-2 text-sm">{tf.desc}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => update(tf.key, 'bullish')}
                      className={cn(
                        "py-4 border text-lg tracking-wider transition-all",
                        checklist[tf.key] === 'bullish'
                          ? 'bg-emerald-500 border-emerald-500 text-black'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      )}
                    >
                      ↑ BULLISH
                    </button>
                    <button
                      onClick={() => update(tf.key, 'bearish')}
                      className={cn(
                        "py-4 border text-lg tracking-wider transition-all",
                        checklist[tf.key] === 'bearish'
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      )}
                    >
                      ↓ BEARISH
                    </button>
                  </div>
                </div>
              ))}

              {/* Confluence Indicator */}
              {checklist.weekly_trend && checklist.daily_trend && checklist.h4_trend && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-6 border text-center",
                    trendsAlign ? "border-emerald-500 bg-emerald-500/10" : "border-yellow-500 bg-yellow-500/10"
                  )}
                >
                  {trendsAlign ? (
                    <>
                      <div className="text-emerald-400 text-2xl tracking-widest mb-2">✓ CONFLUENCE</div>
                      <div className="text-zinc-400">Alle Timeframes sind {checklist.weekly_trend.toUpperCase()}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-yellow-400 text-2xl tracking-widest mb-2">⚠ KEINE CONFLUENCE</div>
                      <div className="text-zinc-400">W: {checklist.weekly_trend?.toUpperCase()} | D: {checklist.daily_trend?.toUpperCase()} | 4H: {checklist.h4_trend?.toUpperCase()}</div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Daily & 4H Sync Indicator */}
              {isDailyH4Sync && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border border-blue-500 bg-blue-500/10 flex items-center gap-3"
                >
                  <Zap className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-blue-400 font-bold tracking-wider">DAILY & 4H SYNC</div>
                    <div className="text-sm text-zinc-400">Höhere Wahrscheinlichkeit für erfolgreichen Trade!</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 2: AOI Check */}
          {currentStep === 2 && (
            <motion.div key="aoi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">AREA OF INTEREST</h2>
                <p className="text-zinc-500 text-lg tracking-widest">AOI ZONE PRÜFEN</p>
              </div>

              <CheckItem
                checked={checklist.aoi_identified}
                onChange={() => update('aoi_identified', !checklist.aoi_identified)}
                label="AOI EINGEZEICHNET"
                description="Hast du deine Area of Interest im Chart markiert?"
              />

              {checklist.aoi_identified && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <CheckItem
                    checked={checklist.price_in_aoi}
                    onChange={() => update('price_in_aoi', !checklist.price_in_aoi)}
                    label="PREIS IN AOI ANGEKOMMEN"
                    description="Ist der aktuelle Preis in deiner AOI Box?"
                  />

                  <div className="border border-zinc-800 p-6">
                    <label className="text-zinc-500 text-sm tracking-widest mb-4 block">PREIS POSITION ZUM AOI</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => update('aoi_position', 'above')}
                        className={cn(
                          "py-6 border text-center transition-all",
                          checklist.aoi_position === 'above' ? "bg-red-500 border-red-500 text-white" : "border-zinc-800 hover:border-zinc-500"
                        )}
                      >
                        <div className="text-3xl mb-2">↓</div>
                        <div className="text-lg tracking-wider">ÜBER AOI</div>
                        <div className="text-sm text-zinc-400 mt-1">= SHORT Setup</div>
                      </button>
                      <button
                        onClick={() => update('aoi_position', 'below')}
                        className={cn(
                          "py-6 border text-center transition-all",
                          checklist.aoi_position === 'below' ? "bg-emerald-500 border-emerald-500 text-black" : "border-zinc-800 hover:border-zinc-500"
                        )}
                      >
                        <div className="text-3xl mb-2">↑</div>
                        <div className="text-lg tracking-wider">UNTER AOI</div>
                        <div className="text-sm text-zinc-400 mt-1">= LONG Setup</div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Structure Check */}
          {currentStep === 3 && (
            <motion.div key="structure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">STRUKTUR CHECK</h2>
                <p className="text-zinc-500 text-lg tracking-widest">PSS & EMA PRÜFEN</p>
              </div>

              <CheckItem
                checked={checklist.pss_rejected}
                onChange={() => update('pss_rejected', !checklist.pss_rejected)}
                label="PSS ABGELEHNT"
                description="Previous Structure Support/Resistance wurde respektiert und abgelehnt"
              />

              <CheckItem
                checked={checklist.ema_respected}
                onChange={() => update('ema_respected', !checklist.ema_respected)}
                label="EMA RESPEKTIERT"
                description="Der Preis hat die EMA respektiert"
              />

              {checklist.pss_rejected && checklist.ema_respected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border border-emerald-500 bg-emerald-500/10"
                >
                  <div className="text-emerald-400 font-bold tracking-wider text-center">
                    ✓ STRUKTUR BESTÄTIGT
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 4: Entry Confirmations */}
          {currentStep === 4 && (
            <motion.div key="entry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">ENTRY BESTÄTIGUNG</h2>
                <p className="text-zinc-500 text-lg tracking-widest">MSS & ENGULFING (30MIN - 1HR)</p>
              </div>

              <CheckItem
                checked={checklist.mss_confirmed}
                onChange={() => update('mss_confirmed', !checklist.mss_confirmed)}
                label="MSS / SOS BESTÄTIGT"
                description="Market Structure Shift - Preis hat gedreht (Bullish → Bearish oder umgekehrt)"
              />

              <div className="border border-zinc-800 p-6">
                <label className="text-zinc-500 text-sm tracking-widest mb-4 block">ENGULFING NACH PULLBACK</label>
                <p className="text-zinc-400 text-sm mb-4">Wird die Kerze nach dem Pullback engulfed?</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => {
                      update('engulfing_confirmed', true);
                      update('engulfing_color', 'blue');
                    }}
                    className={cn(
                      "py-6 border text-center transition-all",
                      checklist.engulfing_color === 'blue' && checklist.engulfing_confirmed
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-zinc-800 hover:border-zinc-500"
                    )}
                  >
                    <div className="text-2xl mb-2">🟦</div>
                    <div className="text-lg tracking-wider">BLAUE ENGULFING</div>
                    <div className="text-sm text-zinc-400 mt-1">= LONG Entry</div>
                  </button>
                  <button
                    onClick={() => {
                      update('engulfing_confirmed', true);
                      update('engulfing_color', 'red');
                    }}
                    className={cn(
                      "py-6 border text-center transition-all",
                      checklist.engulfing_color === 'red' && checklist.engulfing_confirmed
                        ? "bg-red-500 border-red-500 text-white"
                        : "border-zinc-800 hover:border-zinc-500"
                    )}
                  >
                    <div className="text-2xl mb-2">🟥</div>
                    <div className="text-lg tracking-wider">ROTE ENGULFING</div>
                    <div className="text-sm text-zinc-400 mt-1">= SHORT Entry</div>
                  </button>
                </div>

                {!checklist.engulfing_confirmed && (
                  <button
                    onClick={() => {
                      update('engulfing_confirmed', false);
                      update('engulfing_color', '');
                    }}
                    className="w-full py-3 border border-zinc-700 text-zinc-500 text-sm tracking-wider"
                  >
                    KEINE ENGULFING
                  </button>
                )}
              </div>

              {checklist.mss_confirmed && checklist.engulfing_confirmed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border border-emerald-500 bg-emerald-500/10"
                >
                  <div className="text-emerald-400 font-bold tracking-wider text-center">
                    ✓ ENTRY SIGNAL BESTÄTIGT
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 5: Final Rules & Summary */}
          {currentStep === 5 && (
            <motion.div key="final" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl tracking-widest mb-2">FINALE PRÜFUNG</h2>
                <p className="text-zinc-500 text-lg tracking-widest">WICHTIGE REGELN</p>
              </div>

              {/* Important Rules */}
              <div className="border border-yellow-500/50 bg-yellow-500/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <span className="text-yellow-500 font-bold tracking-widest">WICHTIGE REGELN</span>
                </div>
                
                <CheckItem
                  checked={checklist.not_buying_resistance}
                  onChange={() => update('not_buying_resistance', !checklist.not_buying_resistance)}
                  label="NICHT BEIM WIDERSTAND KAUFEN"
                  description="Ich kaufe NICHT beim Widerstand (Resistance)"
                  color="yellow"
                />

                <div className="mt-4">
                  <CheckItem
                    checked={checklist.not_selling_support}
                    onChange={() => update('not_selling_support', !checklist.not_selling_support)}
                    label="NICHT BEIM SUPPORT VERKAUFEN"
                    description="Ich verkaufe NICHT beim Support"
                    color="yellow"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="border border-zinc-800 p-6 space-y-4">
                <h3 className="text-xl tracking-widest mb-4">ZUSAMMENFASSUNG</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-zinc-900">
                    <span className="text-zinc-500">PAIR:</span>
                    <span className="ml-2 text-white">{checklist.pair || '-'}</span>
                  </div>
                  <div className="p-3 bg-zinc-900">
                    <span className="text-zinc-500">TREND:</span>
                    <span className={cn("ml-2", trendsAlign ? "text-emerald-400" : "text-yellow-400")}>
                      {trendsAlign ? checklist.weekly_trend?.toUpperCase() : 'MIXED'}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-900">
                    <span className="text-zinc-500">AOI:</span>
                    <span className="ml-2 text-white">{checklist.price_in_aoi ? '✓ IM AOI' : '✗'}</span>
                  </div>
                  <div className="p-3 bg-zinc-900">
                    <span className="text-zinc-500">ENTRY:</span>
                    <span className={cn("ml-2", checklist.engulfing_color === 'blue' ? 'text-blue-400' : checklist.engulfing_color === 'red' ? 'text-red-400' : 'text-zinc-500')}>
                      {checklist.engulfing_confirmed ? `${checklist.engulfing_color?.toUpperCase()} ENGULFING` : '-'}
                    </span>
                  </div>
                </div>

                {isDailyH4Sync && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 text-sm">DAILY & 4H SYNC = HÖHERE WAHRSCHEINLICHKEIT</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-zinc-500 tracking-widest mb-2">NOTIZEN</label>
                <Textarea
                  value={checklist.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Trade Notizen..."
                  className="bg-black border-zinc-800 text-white placeholder:text-zinc-600 min-h-[100px] rounded-none tracking-wider focus:border-white"
                />
              </div>

              {/* Ready Status */}
              {isReady && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-emerald-500 text-black text-center"
                >
                  <div className="text-4xl tracking-widest mb-2">✓ READY TO TRADE</div>
                  <div className="text-lg">Alle Bestätigungen erfüllt!</div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex gap-3">
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(prev => prev - 1)} variant="outline" 
              className="border-zinc-800 text-white hover:bg-zinc-900 rounded-none tracking-widest">
              <ChevronLeft className="w-4 h-4 mr-2" /> ZURÜCK
            </Button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} 
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-none tracking-widest text-lg py-6">
              WEITER <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="flex-1 flex gap-3">
              {checklistId && (
                <Button onClick={handleDelete} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 rounded-none">
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving || !checklist.pair}
                className={cn("flex-1 rounded-none tracking-widest text-lg py-6",
                  isReady ? "bg-emerald-500 hover:bg-emerald-600 text-black" : "bg-zinc-800 hover:bg-zinc-700")}>
                <Save className="w-5 h-5 mr-2" /> {saving ? 'SPEICHERN...' : 'SPEICHERN'}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-white text-black flex items-center justify-center shadow-lg hover:bg-zinc-200 transition-colors z-50"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Check Item Component
function CheckItem({ checked, onChange, label, description, color = 'emerald' }) {
  const colors = {
    emerald: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', check: 'border-emerald-500 bg-emerald-500' },
    yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', check: 'border-yellow-500 bg-yellow-500' },
  };
  const c = colors[color];
  
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-full p-5 border flex items-center gap-4 transition-all text-left",
        checked ? `${c.border} ${c.bg}` : 'border-zinc-800 hover:border-zinc-600'
      )}
    >
      <div className={cn(
        "w-8 h-8 border-2 flex items-center justify-center flex-shrink-0",
        checked ? c.check : 'border-zinc-600'
      )}>
        {checked && <Check className="w-5 h-5 text-black" />}
      </div>
      <div>
        <span className="text-lg tracking-wider block">{label}</span>
        {description && <span className="text-sm text-zinc-500">{description}</span>}
      </div>
    </button>
  );
}