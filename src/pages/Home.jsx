import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BarChart3, ClipboardCheck, TrendingUp, Shield, Target,
  Lock, ShieldCheck, Globe, Zap, ArrowUp
} from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, LanguageToggle } from '@/components/LanguageContext';
import { HelpCircle } from 'lucide-react';
import TradingQuote from '@/components/TradingQuote';

const SESSIONS = [
  { name: 'TOKYO', timezone: 'Asia/Tokyo', emoji: '🇯🇵', openHour: 9, closeHour: 18 },
  { name: 'LONDON', timezone: 'Europe/London', emoji: '🇬🇧', openHour: 8, closeHour: 17 },
  { name: 'NEW YORK', timezone: 'America/New_York', emoji: '🇺🇸', openHour: 9, closeHour: 17 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [times, setTimes] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [onlineUsers, setOnlineUsers] = useState(247);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
    
    const userInterval = setInterval(() => {
      setOnlineUsers(prev => Math.max(200, prev + Math.floor(Math.random() * 5) - 2));
    }, 5000);

    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(interval);
      clearInterval(userInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const isSessionOpen = (session) => {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: session.timezone }));
    const hour = localTime.getHours();
    const day = localTime.getDay();
    if (day === 0 || day === 6) return false;
    return hour >= session.openHour && hour < session.closeHour;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-black border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{onlineUsers} {t('online')}</span>
              </div>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" 
                alt="ZNPCV" 
                className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity invert"
              />
            </button>
            
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <div className="text-right text-white">
                <div className="text-xs text-zinc-400">{t('localTime')}</div>
                <div className="text-lg font-mono font-bold">
                  {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Market Sessions Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 text-zinc-300 text-sm whitespace-nowrap">
              <Globe className="w-4 h-4" />
              <span>{t('marketSessions')}</span>
            </div>
            <div className="flex items-center gap-6">
              {SESSIONS.map((session) => {
                const isOpen = isSessionOpen(session);
                return (
                  <div key={session.name} className="flex items-center gap-3 whitespace-nowrap">
                    <span className="text-lg">{session.emoji}</span>
                    <div>
                      <div className="text-xs text-zinc-400">{session.name}</div>
                      <div className={`text-sm font-mono font-bold ${isOpen ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {times[session.name] || '--:--:--'}
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
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
            ZNPCV <span className="text-emerald-400">{t('ultimateChecklist')}</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-2">
            {t('heroSubtitle')}
          </p>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            {t('heroDesc')}
          </p>
        </motion.div>

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          <button
            onClick={() => navigate(createPageUrl('Checklist'))}
            className="group p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl hover:border-emerald-400/50 hover:from-emerald-500/20 transition-all text-left"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-all">
              <ClipboardCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl tracking-wider mb-2">{t('newAnalysis')}</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 font-sans">
              {t('newAnalysisDesc')}
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <span>{t('startNow')}</span>
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
            <h2 className="text-2xl tracking-wider mb-2">{t('dashboard')}</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 font-sans">
              {t('dashboardDesc')}
            </p>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
              <span>{t('openDashboard')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* Trading Quote */}
        <TradingQuote />

        {/* Asset Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 my-12"
        >
          {[
            { key: 'forex', count: '27+', color: '#3b82f6' },
            { key: 'crypto', count: '24+', color: '#f97316' },
            { key: 'stocks', count: '35+', color: '#22c55e' },
            { key: 'commodities', count: '14+', color: '#eab308' },
            { key: 'indices', count: '12+', color: '#a855f7' },
          ].map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="p-4 rounded-xl text-center border transition-all hover:scale-105"
              style={{
                background: `rgba(${item.color === '#3b82f6' ? '59,130,246' : item.color === '#f97316' ? '249,115,22' : item.color === '#22c55e' ? '34,197,94' : item.color === '#eab308' ? '234,179,8' : '168,85,247'}, 0.05)`,
                borderColor: `rgba(${item.color === '#3b82f6' ? '59,130,246' : item.color === '#f97316' ? '249,115,22' : item.color === '#22c55e' ? '34,197,94' : item.color === '#eab308' ? '234,179,8' : '168,85,247'}, 0.2)`
              }}
            >
              <div className="text-2xl md:text-3xl mb-1" style={{ color: item.color }}>{item.count}</div>
              <div className="text-xs text-slate-500 tracking-widest">{t(item.key).toUpperCase()}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: Target, titleKey: 'preciseAnalysis', descKey: 'preciseAnalysisDesc', color: 'text-emerald-400' },
            { icon: Shield, titleKey: 'riskManagement', descKey: 'riskManagementDesc', color: 'text-blue-400' },
            { icon: TrendingUp, titleKey: 'performanceTracking', descKey: 'performanceTrackingDesc', color: 'text-purple-400' },
          ].map((item) => (
            <div key={item.titleKey} className="p-6 bg-slate-800/20 border border-slate-700/30 rounded-xl hover:border-slate-600/50 transition-all">
              <item.icon className={`w-10 h-10 ${item.color} mb-4`} />
              <h3 className="text-lg tracking-wider mb-2">{t(item.titleKey)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">{t(item.descKey)}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8 pb-8 border-b border-slate-800">
            {[
              { icon: Lock, key: 'sslEncrypted' },
              { icon: ShieldCheck, key: 'dataProtection' },
              { icon: Globe, key: 'worldwide' },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-slate-400">
                <item.icon className="w-5 h-5 text-emerald-500" />
                <span className="text-sm">{t(item.key)}</span>
              </div>
            ))}
          </div>

          {/* Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" 
                alt="ZNPCV" 
                className="h-10 w-auto invert"
              />
              <p className="text-slate-500 text-sm font-sans max-w-md">
                {t('footerDesc')}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="mailto:support@znpcv.com" className="text-slate-400 hover:text-white text-sm transition-colors">
                {t('contact')}: support@znpcv.com
              </a>
              <button className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                {t('faqHelp')}
              </button>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">
              © {new Date().getFullYear()} ZNPCV. {t('allRights')}
            </p>
            <p className="text-slate-700 text-xs font-sans">
              {t('riskWarning')}
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-emerald-500 text-black flex items-center justify-center shadow-lg hover:bg-emerald-400 transition-colors z-50 rounded-full"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}