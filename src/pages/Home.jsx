import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, CheckCircle2, ListChecks } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

import ZNPCVLogo from '../components/ZNPCVLogo';
import TradeCard from '../components/home/TradeCard';
import PrincipleCard from '../components/home/PrincipleCard';

const PRINCIPLES = [
  { title: "Patience Beats Action", subtitle: "Wait for perfect Setup. Impatience costs Money." },
  { title: "Follow The Plan", subtitle: "No impulse entries. Patience = Precision." },
  { title: "Stay Disciplined", subtitle: "Ego kills, rules save. Trade smart, No guesses." },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => base44.entities.TradeChecklist.list('-created_date', 50),
  });

  const filteredChecklists = checklists.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'ready') return c.status === 'ready_to_trade';
    if (filter === 'progress') return c.status === 'in_progress';
    return true;
  });

  const stats = {
    total: checklists.length,
    ready: checklists.filter(c => c.status === 'ready_to_trade').length,
    inProgress: checklists.filter(c => c.status === 'in_progress').length,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A5D23]/10 to-transparent" />
        
        <div className="relative max-w-2xl mx-auto px-4 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ZNPCVLogo size="large" className="text-white mb-4" />
            <p className="text-zinc-500 text-sm tracking-[0.3em] uppercase">
              Start Trading Right
            </p>
            <p className="text-zinc-600 text-xs mt-2 italic">
              You're running out of time...
            </p>
          </motion.div>

          {/* New Checklist Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Button
              onClick={() => navigate(createPageUrl('Checklist'))}
              className="w-full bg-[#4A5D23] hover:bg-[#5A6D33] text-white py-6 text-lg font-bold tracking-wider"
            >
              <Plus className="w-5 h-5 mr-2" />
              NEUE CHECKLISTE
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Principles */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {PRINCIPLES.map((principle, index) => (
            <PrincipleCard
              key={principle.title}
              title={principle.title}
              subtitle={principle.subtitle}
              index={index}
            />
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-6"
        >
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Total</div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#4A5D23]">{stats.ready}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Ready</div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-400">{stats.inProgress}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">In Progress</div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 mb-6"
        >
          {[
            { key: 'all', label: 'Alle', icon: ListChecks },
            { key: 'ready', label: 'Ready', icon: CheckCircle2 },
            { key: 'progress', label: 'In Progress', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === tab.key 
                  ? 'bg-[#4A5D23] text-white' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Checklists */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <ZNPCVLogo size="small" className="text-zinc-600 mx-auto" />
              </div>
            </div>
          ) : filteredChecklists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-zinc-600 mb-4">Keine Checklisten vorhanden</p>
              <p className="text-zinc-700 text-sm italic">
                "The chart doesn't move against you - it moves beyond your understanding"
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredChecklists.map((trade, index) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  index={index}
                  onClick={() => navigate(createPageUrl('Checklist') + `?id=${trade.id}`)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center border-t border-zinc-900 pt-8"
        >
          <ZNPCVLogo size="small" className="text-zinc-700 mx-auto mb-2" />
          <a 
            href="https://www.znpcv.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-600 text-xs hover:text-[#4A5D23] transition-colors"
          >
            www.znpcv.com
          </a>
        </motion.div>
      </div>
    </div>
  );
}