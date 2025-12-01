import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Clock, CheckCircle2, Target, Zap, ChevronRight, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import ForexClock from '../components/checklist/ForexClock';

export default function HomePage() {
  const navigate = useNavigate();

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => base44.entities.TradeChecklist.list('-created_date', 50),
  });

  const stats = {
    total: checklists.length,
    ready: checklists.filter(c => c.status === 'ready_to_trade').length,
    inProgress: checklists.filter(c => c.status === 'in_progress').length,
    executed: checklists.filter(c => c.status === 'executed').length,
  };

  const recentChecklists = checklists.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Gradient Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-wider">ZNPCV</h1>
                  <p className="text-xs text-slate-500 tracking-widest">TRADING CHECKLIST</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button
                  onClick={() => navigate(createPageUrl('Checklist'))}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold px-6 shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Neue Analyse
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Trade <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Smarter</span>
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Perfection only. Every trade must make visual sense.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Total', value: stats.total, icon: Target, color: 'slate' },
              { label: 'Ready', value: stats.ready, icon: CheckCircle2, color: 'emerald' },
              { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'amber' },
              { label: 'Executed', value: stats.executed, icon: Zap, color: 'blue' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color === 'emerald' ? 'text-emerald-500' : stat.color === 'amber' ? 'text-amber-500' : stat.color === 'blue' ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Trades */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Letzte Analysen</h3>
                  <span className="text-xs text-slate-500">{recentChecklists.length} von {stats.total}</span>
                </div>

                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-pulse text-slate-500">Laden...</div>
                  </div>
                ) : recentChecklists.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-500 mb-4">Keine Analysen vorhanden</p>
                    <Button
                      onClick={() => navigate(createPageUrl('Checklist'))}
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                    >
                      Erste Analyse starten
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/30">
                    {recentChecklists.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        onClick={() => navigate(createPageUrl('Checklist') + `?id=${item.id}`)}
                        className="p-4 hover:bg-slate-700/20 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Direction Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            item.direction === 'long' 
                              ? 'bg-emerald-500/10' 
                              : item.direction === 'short'
                              ? 'bg-red-500/10'
                              : 'bg-slate-700/50'
                          }`}>
                            {item.direction === 'long' ? (
                              <TrendingUp className="w-6 h-6 text-emerald-500" />
                            ) : item.direction === 'short' ? (
                              <TrendingDown className="w-6 h-6 text-red-500" />
                            ) : (
                              <Target className="w-6 h-6 text-slate-500" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white">{item.pair || 'Kein Paar'}</span>
                              {item.status === 'ready_to_trade' && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
                                  READY
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {item.trade_date ? format(new Date(item.trade_date), 'dd. MMM', { locale: de }) : format(new Date(item.created_date), 'dd. MMM', { locale: de })}
                              </span>
                              <span>•</span>
                              <span>{Math.round(item.completion_percentage || 0)}% complete</span>
                            </div>
                          </div>

                          {/* Progress Circle */}
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 -rotate-90">
                              <circle cx="24" cy="24" r="20" fill="none" stroke="#1e293b" strokeWidth="4" />
                              <circle 
                                cx="24" cy="24" r="20" fill="none" 
                                stroke={item.status === 'ready_to_trade' ? '#10b981' : '#64748b'}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${(item.completion_percentage || 0) * 1.26} 126`}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                              {Math.round(item.completion_percentage || 0)}
                            </span>
                          </div>

                          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Market Sessions */}
              <ForexClock />

              {/* Quick Actions */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
                <h3 className="font-bold mb-4">Quick Start</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(createPageUrl('Checklist'))}
                    className="w-full justify-start bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Neue Analyse
                  </Button>
                </div>
              </div>

              {/* Principles Card */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="font-bold">Trading Principles</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { title: 'Patience', desc: 'Wait for perfect setup' },
                    { title: 'Plan', desc: 'No impulse entries' },
                    { title: 'Discipline', desc: 'Ego kills, rules save' },
                  ].map((principle, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                      <div>
                        <div className="text-sm font-medium text-white">{principle.title}</div>
                        <div className="text-xs text-slate-500">{principle.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 text-sm">ZNPCV</span>
                <span className="text-slate-700">•</span>
                <a href="https://www.znpcv.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 text-sm hover:text-emerald-500 transition-colors">
                  www.znpcv.com
                </a>
              </div>
              <p className="text-slate-700 text-xs italic">
                "Start Trading Right"
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}