import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, ChevronRight, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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
  };

  const recentChecklists = checklists.slice(0, 8);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* White Header with Logo */}
      <header className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/2f200c537_PNGZNPCVLOGOwei.png" 
              alt="ZNPCV" 
              className="h-24 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Black Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl tracking-wider mb-2">TRADING CHECKLIST</h1>
          <p className="text-zinc-500 text-xl tracking-widest">TRADE SMARTER. PERFECTION ONLY.</p>
        </motion.div>

        {/* New Analysis Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Button
            onClick={() => navigate(createPageUrl('Checklist'))}
            className="w-full py-8 bg-white hover:bg-zinc-100 text-black text-2xl tracking-widest rounded-none"
          >
            <Plus className="w-6 h-6 mr-3" />
            NEUE ANALYSE STARTEN
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {[
            { label: 'TOTAL', value: stats.total },
            { label: 'READY', value: stats.ready },
            { label: 'IN PROGRESS', value: stats.inProgress },
          ].map((stat) => (
            <div key={stat.label} className="border border-zinc-800 p-6 text-center">
              <div className="text-4xl md:text-5xl text-white mb-2">{stat.value}</div>
              <div className="text-sm text-zinc-500 tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Recent Checklists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl tracking-widest mb-6 border-b border-zinc-800 pb-4">LETZTE ANALYSEN</h2>
          
          {isLoading ? (
            <div className="text-center py-12 text-zinc-500">LADEN...</div>
          ) : recentChecklists.length === 0 ? (
            <div className="text-center py-12 border border-zinc-800">
              <p className="text-zinc-500 text-xl tracking-wider">KEINE ANALYSEN VORHANDEN</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentChecklists.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => navigate(createPageUrl('Checklist') + `?id=${item.id}`)}
                  className="border border-zinc-800 p-4 hover:bg-zinc-900 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Direction */}
                      <div className={`w-12 h-12 flex items-center justify-center border ${
                        item.direction === 'long' ? 'border-green-500 text-green-500' : 
                        item.direction === 'short' ? 'border-red-500 text-red-500' : 'border-zinc-700 text-zinc-500'
                      }`}>
                        {item.direction === 'long' ? <TrendingUp className="w-6 h-6" /> : 
                         item.direction === 'short' ? <TrendingDown className="w-6 h-6" /> : '—'}
                      </div>

                      <div>
                        <div className="text-2xl tracking-wider">{item.pair || 'KEIN PAAR'}</div>
                        <div className="flex items-center gap-3 text-sm text-zinc-500">
                          <span>{item.trade_date ? format(new Date(item.trade_date), 'dd.MM.yyyy') : format(new Date(item.created_date), 'dd.MM.yyyy')}</span>
                          <span>•</span>
                          <span>{Math.round(item.completion_percentage || 0)}%</span>
                          {item.status === 'ready_to_trade' && (
                            <>
                              <span>•</span>
                              <span className="text-green-500">READY</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-600 text-sm tracking-widest">WWW.ZNPCV.COM</p>
        </footer>
      </main>
    </div>
  );
}