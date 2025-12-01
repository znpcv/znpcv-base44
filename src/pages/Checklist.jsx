import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from "@/utils";

import ZNPCVLogo from '../components/ZNPCVLogo';
import ChecklistItem from '../components/checklist/ChecklistItem';
import ChecklistSection from '../components/checklist/ChecklistSection';
import ProgressRing from '../components/checklist/ProgressRing';

const CHECKLIST_CONFIG = [
  {
    title: "Market Analysis",
    subtitle: "Perfection only. Every trade must make visual sense.",
    items: [
      { key: "market_structure", label: "Clean, Structured Market", description: "Find only clean, structured markets" },
      { key: "no_choppy", label: "No Choppy Markets", description: "Avoid choppy, unclear markets" },
      { key: "no_xau_btc_stocks", label: "No XAU, BTC & Stocks", description: "Avoid volatile assets" },
    ]
  },
  {
    title: "Area of Interest",
    subtitle: "Daily & 4hr sync >70%",
    items: [
      { key: "aoi_found", label: "AOI Found", description: "Area of Interest identified" },
      { key: "w_daily_4hr_confluence", label: "W - Daily & 4hr Confluence", description: "Multi-timeframe alignment" },
      { key: "alarms_set", label: "Alarms Set", description: "Price alerts configured" },
      { key: "daily_4hr_sync", label: "Daily & 4hr Sync >70%", description: "Timeframe synchronization confirmed" },
    ]
  },
  {
    title: "Entry Confirmation",
    subtitle: "Wait for perfect setup. Patience = Precision.",
    items: [
      { key: "sos_confirmed", label: "SOS Confirmed (30m-1hr)", description: "Sign of Strength visible" },
      { key: "engulfing_confirmed", label: "Engulfing (30m-1hr)", description: "Engulfing candle pattern" },
      { key: "entry_fvg_ob", label: "Entry + Engulfing + FVG/OB", description: "Full confirmation" },
    ]
  }
];

export default function ChecklistPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checklistId = searchParams.get('id');
  
  const [checklist, setChecklist] = useState({
    pair: '',
    direction: '',
    market_structure: false,
    no_choppy: false,
    no_xau_btc_stocks: false,
    aoi_found: false,
    w_daily_4hr_confluence: false,
    alarms_set: false,
    daily_4hr_sync: false,
    sos_confirmed: false,
    engulfing_confirmed: false,
    entry_fvg_ob: false,
    notes: '',
    status: 'in_progress'
  });
  
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!checklistId);

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
    const checkItems = CHECKLIST_CONFIG.flatMap(s => s.items.map(i => i.key));
    const checked = checkItems.filter(key => checklist[key]).length;
    return (checked / checkItems.length) * 100;
  };

  const updateChecklist = (key, value) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const progress = calculateProgress();
    const status = progress === 100 ? 'ready_to_trade' : 'in_progress';
    
    const data = {
      ...checklist,
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
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(createPageUrl('Home'))}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm tracking-wider">ZURÜCK</span>
            </button>
            <ZNPCVLogo size="small" className="text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <ProgressRing percentage={progress} />
          
          <AnimatePresence mode="wait">
            {isReady ? (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A5D23] rounded-full">
                  <span className="text-sm font-bold tracking-wider text-white">READY TO TRADE</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="progress"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 text-center"
              >
                <p className="text-zinc-500 text-sm italic">
                  "Patience beats action"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trade Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Trading Pair
              </label>
              <Input
                value={checklist.pair}
                onChange={(e) => updateChecklist('pair', e.target.value.toUpperCase())}
                placeholder="EUR/USD"
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-[#4A5D23] focus:ring-[#4A5D23]"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Direction
              </label>
              <Select
                value={checklist.direction}
                onValueChange={(value) => updateChecklist('direction', value)}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white focus:ring-[#4A5D23]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="long" className="text-white hover:bg-zinc-800">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Long
                    </span>
                  </SelectItem>
                  <SelectItem value="short" className="text-white hover:bg-zinc-800">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      Short
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Checklist Sections */}
        {CHECKLIST_CONFIG.map((section, sectionIndex) => (
          <ChecklistSection
            key={section.title}
            title={section.title}
            subtitle={section.subtitle}
            index={sectionIndex}
          >
            {section.items.map((item, itemIndex) => (
              <ChecklistItem
                key={item.key}
                label={item.label}
                description={item.description}
                checked={checklist[item.key]}
                onChange={(value) => updateChecklist(item.key, value)}
                index={itemIndex}
              />
            ))}
          </ChecklistSection>
        ))}

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2 px-4">
            Notes
          </label>
          <Textarea
            value={checklist.notes}
            onChange={(e) => updateChecklist('notes', e.target.value)}
            placeholder="Trade notes..."
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 min-h-[100px] focus:border-[#4A5D23] focus:ring-[#4A5D23]"
          />
        </motion.div>

        {/* Warning if not ready */}
        {!isReady && checklist.pair && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-500 font-medium text-sm">Checklist unvollständig</p>
                <p className="text-zinc-500 text-xs mt-1">
                  "The chart doesn't move against you - it moves beyond your understanding."
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
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
            {saving ? 'Speichern...' : 'Speichern'}
          </Button>
        </motion.div>

        {/* Principle Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center pb-8"
        >
          <p className="text-zinc-600 text-xs tracking-[0.2em] uppercase">
            Follow the plan • Stay disciplined
          </p>
        </motion.div>
      </div>
    </div>
  );
}