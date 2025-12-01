import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, ClipboardCheck, TrendingUp, Shield, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      {/* Header with Logo */}
      <header className="bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/2f200c537_PNGZNPCVLOGOwei.png" 
              alt="ZNPCV" 
              className="h-24 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl tracking-wider mb-4 font-light">
            PROFESSIONAL <span className="text-emerald-400">TRADING</span> SUITE
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Strukturierte Analyse. Maximale Disziplin. Bessere Entscheidungen.
          </p>
        </motion.div>

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-16"
        >
          <button
            onClick={() => navigate(createPageUrl('Checklist'))}
            className="group p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl hover:border-emerald-400/50 transition-all text-left"
          >
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-all">
              <ClipboardCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl tracking-wider mb-2">NEUE ANALYSE</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Starte eine strukturierte Analyse mit unserer professionellen Checkliste
            </p>
            <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm">
              <span>Jetzt starten</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="group p-8 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-2xl hover:border-blue-400/50 transition-all text-left"
          >
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all">
              <BarChart3 className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-2xl tracking-wider mb-2">DASHBOARD</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Übersicht deiner Analysen, Performance und Trading-Statistiken
            </p>
            <div className="flex items-center gap-2 mt-4 text-blue-400 text-sm">
              <span>Öffnen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { label: 'FOREX', count: '27+', color: 'text-blue-400' },
            { label: 'KRYPTO', count: '24+', color: 'text-orange-400' },
            { label: 'STOCKS', count: '35+', color: 'text-green-400' },
            { label: 'COMMODITIES', count: '14+', color: 'text-yellow-400' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center"
            >
              <div className={`text-2xl md:text-3xl ${item.color} mb-1`}>{item.count}</div>
              <div className="text-xs text-slate-500 tracking-widest">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: Target, title: 'PRÄZISE ANALYSE', desc: 'Multi-Timeframe Confluence mit klaren Kriterien', color: 'emerald' },
            { icon: Shield, title: 'RISIKO MANAGEMENT', desc: 'Integrierte R:R Bewertung und SL/TP Planung', color: 'blue' },
            { icon: TrendingUp, title: 'PERFORMANCE', desc: 'Tracking deiner Analysen und Erfolgsquote', color: 'purple' },
          ].map((item, index) => (
            <div key={item.title} className="p-6 bg-slate-800/20 border border-slate-700/30 rounded-xl">
              <item.icon className={`w-8 h-8 text-${item.color}-400 mb-4`} />
              <h3 className="text-lg tracking-wider mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-slate-800/50">
        <p className="text-slate-600 text-sm tracking-widest">WWW.ZNPCV.COM</p>
      </footer>
    </div>
  );
}