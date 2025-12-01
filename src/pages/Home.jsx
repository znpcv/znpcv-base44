import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BarChart3, ClipboardCheck, TrendingUp, Shield, Target,
  Lock, ShieldCheck, Globe, Zap, ArrowUp, ChevronRight, CheckCircle2,
  Activity, Award, AlertTriangle, HelpCircle
} from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, LanguageToggle } from '@/components/LanguageContext';
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
    <div className={`min-h-screen bg-black text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-black border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
                className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity invert"
              />
            </button>
            
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <div className="text-right text-white hidden sm:block">
                <div className="text-xs text-zinc-500">{t('localTime')}</div>
                <div className="text-lg font-mono font-bold">
                  {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Market Sessions Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-2.5">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 text-zinc-400 text-sm whitespace-nowrap">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{t('marketSessions')}</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              {SESSIONS.map((session) => {
                const isOpen = isSessionOpen(session);
                return (
                  <div key={session.name} className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-base">{session.emoji}</span>
                    <div>
                      <div className="text-[10px] text-zinc-600">{session.name}</div>
                      <div className={`text-xs font-mono font-bold ${isOpen ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {times[session.name] || '--:--:--'}
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span className="tracking-widest">THE ULTIMATE TRADING TOOL</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-wider mb-4 font-light">
            ZNPCV
          </h1>
          <h2 className="text-xl md:text-2xl tracking-widest text-zinc-400 mb-4">
            {t('ultimateChecklist')}
          </h2>
          <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans">
            {t('heroSubtitle')}
          </p>
        </motion.div>

        {/* Main Actions - PROMINENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 mb-16"
        >
          {/* New Analysis - PRIMARY */}
          <button
            onClick={() => navigate(createPageUrl('Checklist'))}
            className="group p-8 bg-white text-black rounded-2xl hover:bg-zinc-100 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white text-xs rounded-full">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              START
            </div>
            <ClipboardCheck className="w-10 h-10 mb-4" />
            <h2 className="text-2xl tracking-wider mb-2">{t('newAnalysis')}</h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-4 font-sans">
              {t('newAnalysisDesc')}
            </p>
            <div className="flex items-center gap-2 text-black text-sm font-bold tracking-widest">
              <span>{t('startNow')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>

          {/* Dashboard */}
          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="group p-8 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              LIVE
            </div>
            <BarChart3 className="w-10 h-10 text-white mb-4" />
            <h2 className="text-2xl tracking-wider mb-2">{t('dashboard')}</h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-4 font-sans">
              {t('dashboardDesc')}
            </p>
            <div className="flex items-center gap-2 text-white text-sm font-bold tracking-widest">
              <span>{t('openDashboard')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* ZNPCV Principles - NEW SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl tracking-widest mb-2">ZNPCV PRINZIPIEN</h3>
            <p className="text-zinc-600 text-sm">Die goldenen Regeln für A+++ Trades</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-white tracking-wider mb-1">{t('notBuyingResistance')}</h4>
                  <p className="text-zinc-500 text-sm font-sans">{t('notBuyingResistanceDesc')}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-white tracking-wider mb-1">{t('notSellingSupport')}</h4>
                  <p className="text-zinc-500 text-sm font-sans">{t('notSellingSupportDesc')}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white tracking-wider mb-1">NUR A+++ TRADES</h4>
                  <p className="text-zinc-500 text-sm font-sans">Minimum 85% Checkliste erfüllt</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white tracking-wider mb-1">{t('confluence')}</h4>
                  <p className="text-zinc-500 text-sm font-sans">W-D-4H müssen übereinstimmen</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trading Quote */}
        <div className="mb-16">
          <TradingQuote />
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl tracking-widest mb-2">FEATURES</h3>
            <p className="text-zinc-600 text-sm">Professionelle Trading-Werkzeuge</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Target, titleKey: 'preciseAnalysis', descKey: 'preciseAnalysisDesc' },
              { icon: Shield, titleKey: 'riskManagement', descKey: 'riskManagementDesc' },
              { icon: Activity, titleKey: 'performanceTracking', descKey: 'performanceTrackingDesc' },
            ].map((item, index) => (
              <motion.div 
                key={item.titleKey} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg tracking-wider mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-sans">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3 md:gap-4"
        >
          {[
            { value: '85%+', label: 'ZNPCV Standard', icon: Award },
            { value: '7', label: 'Step Checklist', icon: CheckCircle2 },
            { value: '4', label: 'Chart Patterns', icon: Activity },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-5 md:p-6 border border-zinc-800/50 rounded-2xl bg-zinc-950">
              <stat.icon className="w-6 h-6 mx-auto mb-3 text-white" />
              <div className="text-2xl md:text-3xl font-light mb-1">{stat.value}</div>
              <div className="text-[10px] md:text-xs text-zinc-600 tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 mb-10">
            {/* Brand */}
            <div className="md:col-span-5">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" 
                alt="ZNPCV" 
                className="h-14 w-auto invert mb-5"
              />
              <p className="text-zinc-500 text-sm font-sans leading-relaxed max-w-sm mb-6">
                {t('footerDesc')}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-white">SSL</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-white">SECURE</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-white">24/7</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-3">
              <h4 className="text-white text-sm tracking-widest mb-5">NAVIGATION</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => navigate(createPageUrl('Checklist'))} className="text-zinc-400 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    {t('newAnalysis')}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate(createPageUrl('Dashboard'))} className="text-zinc-400 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    {t('dashboard')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div className="md:col-span-4">
              <h4 className="text-white text-sm tracking-widest mb-5">{t('contact')}</h4>
              <div className="space-y-3">
                <a href="mailto:support@znpcv.com" className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group">
                  <div className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400">@</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-zinc-600 tracking-wider">EMAIL</div>
                    <div className="text-white text-sm group-hover:text-emerald-400 transition-colors">support@znpcv.com</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-[10px]">LIVE</span>
                  </div>
                </a>
                <button className="w-full flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[10px] text-zinc-600 tracking-wider">SUPPORT</div>
                    <div className="text-white text-sm group-hover:text-blue-400 transition-colors">{t('faqHelp')}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-blue-400 text-[10px]">24/7</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-6 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="text-white text-sm">© {new Date().getFullYear()} ZNPCV</p>
              <span className="text-zinc-800">|</span>
              <p className="text-zinc-600 text-sm">{t('allRights')}</p>
            </div>
            <p className="text-zinc-700 text-xs font-sans text-center md:text-right max-w-md">
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
            className="fixed bottom-6 right-6 w-11 h-11 bg-white text-black flex items-center justify-center shadow-lg hover:bg-zinc-200 transition-colors z-50 rounded-full"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}