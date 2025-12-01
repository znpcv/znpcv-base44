import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BarChart3, ClipboardCheck, TrendingUp, Shield, Target,
  Users, Clock, Lock, ShieldCheck, Globe, Zap
} from 'lucide-react';
import { createPageUrl } from "@/utils";

const SESSIONS = [
  { name: 'TOKYO', timezone: 'Asia/Tokyo', emoji: '🇯🇵', openHour: 9, closeHour: 18 },
  { name: 'LONDON', timezone: 'Europe/London', emoji: '🇬🇧', openHour: 8, closeHour: 17 },
  { name: 'NEW YORK', timezone: 'America/New_York', emoji: '🇺🇸', openHour: 9, closeHour: 17 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [times, setTimes] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [onlineUsers, setOnlineUsers] = useState(247);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setCurrentTime(now);
      const newTimes = {};
      SESSIONS.forEach(session => {
        newTimes[session.name] = now.toLocaleTimeString('de-DE', {
          timeZone: session.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      });
      setTimes(newTimes);
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    
    // Simulate online users fluctuation
    const userInterval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(userInterval);
    };
  }, []);

  const isSessionOpen = (session) => {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: session.timezone }));
    const hour = localTime.getHours();
    const day = localTime.getDay();
    if (day === 0 || day === 6) return false;
    return hour >= session.openHour && hour < session.closeHour;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      {/* Header with Logo */}
      <header className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{onlineUsers} ONLINE</span>
              </div>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" 
                alt="ZNPCV" 
                className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            
            <div className="text-right text-black">
              <div className="text-xs text-slate-500">LOKALZEIT</div>
              <div className="text-lg font-mono font-bold">
                {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Live Market Sessions Bar */}
      <div className="bg-slate-900/80 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 text-slate-400 text-sm whitespace-nowrap">
              <Globe className="w-4 h-4" />
              <span>MARKET SESSIONS</span>
            </div>
            <div className="flex items-center gap-6">
              {SESSIONS.map((session) => {
                const isOpen = isSessionOpen(session);
                return (
                  <div key={session.name} className="flex items-center gap-3 whitespace-nowrap">
                    <span className="text-lg">{session.emoji}</span>
                    <div>
                      <div className="text-xs text-slate-500">{session.name}</div>
                      <div className={`text-sm font-mono font-bold ${isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {times[session.name] || '--:--:--'}
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-6">
            <Zap className="w-4 h-4" />
            <span>THE ULTIMATE TRADING TOOL</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-wider mb-4 font-light">
            ZNPCV <span className="text-emerald-400">ULTIMATE</span> CHECKLIST
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-2">
            Die ultimative Trading-Checkliste die es je gegeben hat.
          </p>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Professionelle Multi-Timeframe Analyse • Strukturierte Entscheidungsfindung • Maximale Disziplin
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
            className="group p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl hover:border-emerald-400/50 hover:from-emerald-500/20 transition-all text-left"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-all">
              <ClipboardCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl tracking-wider mb-2">NEUE ANALYSE STARTEN</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Starte deine professionelle Multi-Timeframe Analyse mit der ultimativen ZNPCV Checkliste
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <span>Jetzt starten</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="group p-8 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-2xl hover:border-blue-400/50 hover:from-blue-500/20 transition-all text-left"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl tracking-wider mb-2">TRADING DASHBOARD</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Übersicht deiner Analysen, Performance-Tracking und detaillierte Statistiken
            </p>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
              <span>Dashboard öffnen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* Asset Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-16"
        >
          {[
            { label: 'FOREX', count: '27+', color: 'blue' },
            { label: 'KRYPTO', count: '24+', color: 'orange' },
            { label: 'STOCKS', count: '35+', color: 'green' },
            { label: 'COMMODITIES', count: '14+', color: 'yellow' },
            { label: 'INDICES', count: '12+', color: 'purple' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className={`p-4 bg-${item.color}-500/5 border border-${item.color}-500/20 rounded-xl text-center hover:border-${item.color}-500/40 transition-all`}
              style={{
                background: `rgba(${item.color === 'blue' ? '59,130,246' : item.color === 'orange' ? '249,115,22' : item.color === 'green' ? '34,197,94' : item.color === 'yellow' ? '234,179,8' : '168,85,247'}, 0.05)`,
                borderColor: `rgba(${item.color === 'blue' ? '59,130,246' : item.color === 'orange' ? '249,115,22' : item.color === 'green' ? '34,197,94' : item.color === 'yellow' ? '234,179,8' : '168,85,247'}, 0.2)`
              }}
            >
              <div className={`text-2xl md:text-3xl mb-1`} style={{
                color: item.color === 'blue' ? '#60a5fa' : item.color === 'orange' ? '#fb923c' : item.color === 'green' ? '#4ade80' : item.color === 'yellow' ? '#facc15' : '#c084fc'
              }}>{item.count}</div>
              <div className="text-xs text-slate-500 tracking-widest">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { icon: Target, title: 'PRÄZISE ANALYSE', desc: 'W-D-4H Confluence System für maximale Genauigkeit', color: 'text-emerald-400' },
            { icon: Shield, title: 'RISIKO MANAGEMENT', desc: 'Integrierte R:R Bewertung und SL/TP Planung', color: 'text-blue-400' },
            { icon: TrendingUp, title: 'PERFORMANCE TRACKING', desc: 'Detaillierte Statistiken und Erfolgsquoten', color: 'text-purple-400' },
          ].map((item) => (
            <div key={item.title} className="p-6 bg-slate-800/20 border border-slate-700/30 rounded-xl hover:border-slate-600/50 transition-all">
              <item.icon className={`w-10 h-10 ${item.color} mb-4`} />
              <h3 className="text-lg tracking-wider mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Professional Footer */}
      <footer className="bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Lock className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">SSL VERSCHLÜSSELT</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">DSGVO KONFORM</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">DATENSCHUTZ</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">WELTWEIT VERFÜGBAR</span>
            </div>
          </div>

          {/* Footer Content */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" 
                alt="ZNPCV" 
                className="h-12 w-auto mb-4 invert"
              />
              <p className="text-slate-500 text-sm leading-relaxed">
                Die ultimative Trading-Checkliste für professionelle Trader. Entwickelt für maximale Disziplin und konsistente Ergebnisse.
              </p>
            </div>
            <div>
              <h4 className="text-sm tracking-widest mb-4 text-white">RECHTLICHES</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="hover:text-slate-300 cursor-pointer">Impressum</li>
                <li className="hover:text-slate-300 cursor-pointer">Datenschutzerklärung</li>
                <li className="hover:text-slate-300 cursor-pointer">Nutzungsbedingungen</li>
                <li className="hover:text-slate-300 cursor-pointer">Cookie-Richtlinie</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm tracking-widest mb-4 text-white">KONTAKT</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>support@znpcv.com</li>
                <li className="hover:text-slate-300 cursor-pointer">FAQ & Hilfe</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">
              © {new Date().getFullYear()} ZNPCV. Alle Rechte vorbehalten.
            </p>
            <p className="text-slate-700 text-xs">
              Trading birgt Risiken. Vergangene Ergebnisse sind keine Garantie für zukünftige Gewinne.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}