import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';

import ZNPCVLogo from '../components/ZNPCVLogo';
import ForexClock from '../components/checklist/ForexClock';
import MiniCalendar from '../components/checklist/MiniCalendar';
import PairSelector from '../components/checklist/PairSelector';
import TrendAnalysis from '../components/checklist/TrendAnalysis';
import AOIAnalysis from '../components/checklist/AOIAnalysis';
import PatternSelector from '../components/checklist/PatternSelector';
import EntryChecklist from '../components/checklist/EntryChecklist';
import ProgressRing from '../components/checklist/ProgressRing';

export default function ChecklistPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checklistId = searchParams.get('id');
  
  const [checklist, setChecklist] = useState({
    pair: '',
    direction: '',
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
    status: 'in_progress'
  });
  
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!checklistId);
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    { key: 'setup', label: 'Setup' },
    { key: 'analysis', label: 'Analyse' },
    { key: 'aoi', label: 'AOI' },
    { key: 'patterns', label: 'Patterns' },
    { key: 'entry', label: 'Entry' },
  ];

  useEffect(() => {
    if (checklistId) {
      loadChecklist();
    }
  }, [checklistId]);

  const loadChecklist = async () => {
    const data = await base44.entities.TradeChecklist.filter({ id: checklistId });
    if (data.length > 0) {
      setChecklist(data[0]);
    }
    setIsLoading(false);
  };

  const calculateProgress = () => {
    let total = 0;
    let completed = 0;

    // Step 1: Setup (pair, date)
    total += 2;
    if (checklist.pair) completed++;
    if (checklist.trade_date) completed++;

    // Step 2: Trend Analysis
    total += 3;
    if (checklist.weekly_trend) completed++;
    if (checklist.daily_trend) completed++;
    if (checklist.h4_trend) completed++;

    // Step 3: AOI
    total += 2;
    if (checklist.aoi_identified) completed++;
    if (checklist.aoi_position) completed++;

    // Step 4: Patterns
    total += 2;
    if (checklist.patterns?.length > 0) completed++;
    if (checklist.pattern_confirmed) completed++;

    // Step 5: Entry (6 items)
    total += 6;
    if (checklist.sos_confirmed) completed++;
    if (checklist.engulfing_confirmed) completed++;
    if (checklist.fvg_ob_confirmed) completed++;
    if (checklist.risk_reward) completed++;
    if (checklist.sl_placed) completed++;
    if (checklist.tp_placed) completed++;

    return (completed / total) * 100;
  };

  const updateChecklist = (key, value) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const handleTrendChange = (timeframe, value) => {
    const key = timeframe === 'weekly' ? 'weekly_trend' : timeframe === 'daily' ? 'daily_trend' : 'h4_trend';
    updateChecklist(key, value);
  };

  const handlePatternToggle = (patternKey) => {
    setChecklist(prev => {
      const patterns = prev.patterns || [];
      if (patterns.includes(patternKey)) {
        return { ...prev, patterns: patterns.filter(p => p !== patternKey) };
      } else {
        return { ...prev, patterns: [...patterns, patternKey] };
      }
    });
  };

  const handleEntryCheckChange = (key, value) => {
    updateChecklist(key, value);
  };

  const handleSave = async () => {
    setSaving(true);
    const progress = calculateProgress();
    const status = progress === 100 ? 'ready_to_trade' : 'in_progress';
    
    // Determine direction based on analysis
    let direction = checklist.direction;
    if (checklist.aoi_position === 'below') direction = 'long';
    if (checklist.aoi_position === 'above') direction = 'short';
    
    const data = {
      ...checklist,
      direction,
      completion_percentage: progress,
      status
    };
    
    if (checklistId) {
      await base44.entities.TradeChecklist.update(checklistId, data);
    } else {
      await base44.entities.TradeChecklist.create(data);
    }
    
    setSaving(false);
    navigate(createPageUrl('Home'));
  };

  const handleDelete = async () => {
    if (checklistId) {
      await base44.entities.TradeChecklist.delete(checklistId);
    }
    navigate(createPageUrl('Home'));
  };

  const progress = calculateProgress();
  const isReady = progress === 100;

  // Check confluence
  const hasConfluence = checklist.weekly_trend && 
                        checklist.daily_trend && 
                        checklist.h4_trend &&
                        checklist.weekly_trend === checklist.daily_trend && 
                        checklist.daily_trend === checklist.h4_trend;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse">
          <ZNPCVLogo className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(createPageUrl('Home'))}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm tracking-wider hidden sm:inline">ZURÜCK</span>
            </button>
            
            <ZNPCVLogo size="small" className="text-white" />
            
            <div className="flex items-center gap-2">
              <ProgressRing percentage={progress} size={40} />
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
            {STEPS.map((step, index) => (
              <button
                key={step.key}
                onClick={() => setCurrentStep(index)}
                className={`
                  px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all whitespace-nowrap
                  ${currentStep === index 
                    ? 'bg-[#4A5D23] text-white' 
                    : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
                  }
                `}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Step 0: Setup */}
          {currentStep === 0 && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Clock & Calendar Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <ForexClock />
                <MiniCalendar 
                  selectedDate={checklist.trade_date}
                  onDateSelect={(date) => updateChecklist('trade_date', date)}
                />
              </div>

              {/* Pair Selection */}
              <PairSelector 
                selectedPair={checklist.pair}
                onSelect={(pair) => updateChecklist('pair', pair)}
              />
            </motion.div>
          )}

          {/* Step 1: Analysis */}
          {currentStep === 1 && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <TrendAnalysis 
                trends={{
                  weekly: checklist.weekly_trend,
                  daily: checklist.daily_trend,
                  h4: checklist.h4_trend
                }}
                onTrendChange={handleTrendChange}
              />
            </motion.div>
          )}

          {/* Step 2: AOI */}
          {currentStep === 2 && (
            <motion.div
              key="aoi"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <AOIAnalysis 
                aoiIdentified={checklist.aoi_identified}
                onAOIIdentifiedChange={(value) => updateChecklist('aoi_identified', value)}
                aoiPosition={checklist.aoi_position}
                onAOIChange={(position) => updateChecklist('aoi_position', position)}
              />

              {/* Direction Preview */}
              {checklist.aoi_position && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border flex items-center gap-3 ${
                    checklist.aoi_position === 'below' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  {checklist.aoi_position === 'below' ? (
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  )}
                  <div>
                    <span className={`font-bold ${checklist.aoi_position === 'below' ? 'text-green-500' : 'text-red-500'}`}>
                      {checklist.aoi_position === 'below' ? 'LONG' : 'SHORT'} Setup
                    </span>
                    <p className="text-xs text-zinc-500">
                      {checklist.pair || 'Währungspaar auswählen'}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Patterns */}
          {currentStep === 3 && (
            <motion.div
              key="patterns"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <PatternSelector 
                selectedPatterns={checklist.patterns || []}
                onPatternToggle={handlePatternToggle}
                patternConfirmed={checklist.pattern_confirmed}
                onPatternConfirmedChange={(value) => updateChecklist('pattern_confirmed', value)}
              />
            </motion.div>
          )}

          {/* Step 4: Entry */}
          {currentStep === 4 && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <EntryChecklist 
                entryChecks={{
                  sos_confirmed: checklist.sos_confirmed,
                  engulfing_confirmed: checklist.engulfing_confirmed,
                  fvg_ob_confirmed: checklist.fvg_ob_confirmed,
                  risk_reward: checklist.risk_reward,
                  sl_placed: checklist.sl_placed,
                  tp_placed: checklist.tp_placed
                }}
                onEntryCheckChange={handleEntryCheckChange}
              />

              {/* Notes */}
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Notizen
                </label>
                <Textarea
                  value={checklist.notes}
                  onChange={(e) => updateChecklist('notes', e.target.value)}
                  placeholder="Trade Notizen..."
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 min-h-[100px] focus:border-[#4A5D23] focus:ring-[#4A5D23]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warnings */}
        {!hasConfluence && checklist.weekly_trend && checklist.daily_trend && checklist.h4_trend && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-500 font-medium text-sm">Keine Confluence</p>
                <p className="text-zinc-500 text-xs mt-1">
                  Die Timeframes zeigen unterschiedliche Trends. Warte auf Alignment.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation & Actions */}
        <div className="mt-8 flex flex-col gap-4">
          {/* Step Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="border-zinc-800 text-zinc-400 hover:bg-zinc-900"
              >
                Zurück
              </Button>
            )}
            {currentStep < STEPS.length - 1 && (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700"
              >
                Weiter
              </Button>
            )}
          </div>

          {/* Save/Delete Actions */}
          <div className="flex gap-3">
            {checklistId && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Löschen
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || !checklist.pair}
              className={`flex-1 ${isReady ? 'bg-[#4A5D23] hover:bg-[#5A6D33]' : 'bg-zinc-800 hover:bg-zinc-700'} text-white`}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Speichern...' : isReady ? 'Trade Ready - Speichern' : 'Speichern'}
            </Button>
          </div>
        </div>

        {/* Footer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center pb-8"
        >
          <p className="text-zinc-600 text-xs tracking-[0.2em] uppercase">
            "The chart doesn't move against you - it moves beyond your understanding"
          </p>
        </motion.div>
      </div>
    </div>
  );
}