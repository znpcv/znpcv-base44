import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BarChart3, ClipboardCheck, TrendingUp, Shield, Target,
  Lock, ShieldCheck, Globe, Zap, ArrowUp, ChevronRight, CheckCircle2,
  Activity, Award
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
                className="h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity invert"
              />
            </button>
            
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <div className="text-right text-white">
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
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 text-zinc-400 text-sm whitespace-nowrap">
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
                      <div className="text-xs text-zinc-500">{session.name}</div>
                      <div className={`text-sm font-mono font-bold ${isOpen ? 'text-white' : 'text-zinc-600'}`}>
                        {times[session.name] || '--:--:--'}
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-white text-sm mb-8">
            <Zap className="w-4 h-4" />
            <span className="tracking-widest">THE ULTIMATE TRADING TOOL</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-wider mb-6 font-light">
            ZNPCV
          </h1>
          <h2 className="text-2xl md:text-3xl tracking-widest text-zinc-400 mb-6">
            {t('ultimateChecklist')}
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto leading-relaxed font-sans">
            {t('heroSubtitle')}
          </p>
        </motion.div>

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-20"
        >
          <button
            onClick={() => navigate(createPageUrl('Checklist'))}
            className="group p-10 bg-white text-black rounded-2xl hover:bg-zinc-100 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <ClipboardCheck className="w-12 h-12 mb-6" />
            <h2 className="text-3xl tracking-wider mb-3">{t('newAnalysis')}</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-sans">
              {t('newAnalysisDesc')}
            </p>
            <div className="flex items-center gap-2 text-black text-sm font-bold tracking-widest">
              <span>{t('startNow')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="group p-10 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <BarChart3 className="w-12 h-12 text-white mb-6" />
            <h2 className="text-3xl tracking-wider mb-3">{t('dashboard')}</h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-sans">
              {t('dashboardDesc')}
            </p>
            <div className="flex items-center gap-2 text-white text-sm font-bold tracking-widest">
              <span>{t('openDashboard')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* Trading Quote */}
        <div className="mb-20">
          <TradingQuote />
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl tracking-widest mb-2">ZNPCV STANDARD</h3>
            <p className="text-zinc-500">Only A+++ Trades • 85%+ Completion</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, titleKey: 'preciseAnalysis', descKey: 'preciseAnalysisDesc' },
              { icon: Shield, titleKey: 'riskManagement', descKey: 'riskManagementDesc' },
              { icon: TrendingUp, titleKey: 'performanceTracking', descKey: 'performanceTrackingDesc' },
            ].map((item, index) => (
              <motion.div 
                key={item.titleKey} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-8 bg-zinc-950 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all group"
              >
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-xl tracking-wider mb-3">{t(item.titleKey)}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-sans">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-6 mb-20"
        >
          {[
            { value: '85%+', label: 'ZNPCV Standard', icon: Award },
            { value: '7', label: 'Step Checklist', icon: CheckCircle2 },
            { value: '4', label: 'Chart Patterns', icon: Activity },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center p-8 border border-zinc-800/50 rounded-2xl bg-zinc-950">
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-white" />
              <div className="text-4xl font-light mb-2">{stat.value}</div>
              <div className="text-xs text-zinc-500 tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-12 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-5">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/d3c7f1a34_schwa.png" 
                alt="ZNPCV" 
                className="h-16 w-auto invert mb-6"
              />
              <p className="text-zinc-500 text-sm font-sans leading-relaxed max-w-sm mb-8">
                {t('footerDesc')}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <Lock className="w-4 h-4 text-white" />
                  <span className="text-xs text-white tracking-wider">SSL</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span className="text-xs text-white tracking-wider">SECURE</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <Globe className="w-4 h-4 text-white" />
                  <span className="text-xs text-white tracking-wider">24/7</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-3">
              <h4 className="text-white text-sm tracking-widest mb-6">NAVIGATION</h4>
              <ul className="space-y-4">
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

            {/* Contact */}
            <div className="md:col-span-4">
              <h4 className="text-white text-sm tracking-widest mb-6">{t('contact')}</h4>
              <a href="mailto:support@znpcv.com" className="flex items-center gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-black text-lg">@</span>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1 tracking-wider">EMAIL</div>
                  <div className="text-white group-hover:text-zinc-300 transition-colors">support@znpcv.com</div>
                </div>
              </a>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
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
            className="fixed bottom-6 right-6 w-12 h-12 bg-white text-black flex items-center justify-center shadow-lg hover:bg-zinc-200 transition-colors z-50 rounded-full"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}