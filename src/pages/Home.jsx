import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BarChart3, ClipboardCheck, TrendingUp, Shield, Target,
  Lock, ShieldCheck, Globe, Zap, ArrowUp, ChevronRight, CheckCircle2,
  Activity, Award, HelpCircle, Calendar, History
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from "@/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';
import { cn } from "@/lib/utils";

const SESSIONS = [
  { name: 'SYDNEY', timezone: 'Australia/Sydney', emoji: '🇦🇺', openHour: 7, closeHour: 16 },
  { name: 'TOKYO', timezone: 'Asia/Tokyo', emoji: '🇯🇵', openHour: 9, closeHour: 18 },
  { name: 'LONDON', timezone: 'Europe/London', emoji: '🇬🇧', openHour: 8, closeHour: 17 },
  { name: 'NEW YORK', timezone: 'America/New_York', emoji: '🇺🇸', openHour: 9, closeHour: 17 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const [times, setTimes] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [localTime, setLocalTime] = useState(new Date());
  const [serverStatus, setServerStatus] = useState('operational');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setCurrentTime(now);
      setLocalTime(now);
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

    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(interval);
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

  // Theme classes
  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    textDimmed: darkMode ? 'text-zinc-600' : 'text-zinc-400',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
    borderCard: darkMode ? 'border-zinc-800' : 'border-zinc-300',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header - Ultra Compact */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <DarkModeToggle />
            </div>

              <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img 
                src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV" 
                className="h-7 sm:h-8 md:h-10 lg:h-12 xl:h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
              </button>

              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              <LanguageToggle />
              <AccountButton />
              </div>
          </div>
        </div>
      </header>

      {/* Market Sessions Bar - Compact */}
      <div className={`${theme.bgSecondary} border-b ${theme.border}`}>
        <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-6 py-2 sm:py-2.5 md:py-3">
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide">
            <Globe className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 flex-shrink-0 ${theme.textMuted}`} />
            {SESSIONS.map((session) => {
              const isOpen = isSessionOpen(session);
              return (
                <div key={session.name} className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                  <span className="text-sm sm:text-base md:text-base">{session.emoji}</span>
                  <div className={`text-xs sm:text-sm md:text-sm lg:text-sm font-mono font-bold ${isOpen ? 'text-teal-600' : theme.textMuted}`}>
                    {times[session.name]?.slice(0, 5) || '--:--'}
                  </div>
                  <div className={`w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 rounded-full ${isOpen ? 'bg-teal-600 animate-pulse' : darkMode ? 'bg-zinc-700' : 'bg-zinc-400'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Section - Animated Background */}
      <main className="max-w-6xl mx-auto px-2 sm:px-3 md:px-6 py-3 sm:py-4 md:py-8 lg:py-12 relative">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 -left-4 w-72 h-72 ${darkMode ? 'bg-teal-600/10' : 'bg-teal-600/20'} rounded-full mix-blend-multiply filter blur-3xl animate-blob`} />
          <div className={`absolute top-0 -right-4 w-72 h-72 ${darkMode ? 'bg-purple-600/10' : 'bg-purple-600/20'} rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000`} />
          <div className={`absolute -bottom-8 left-20 w-72 h-72 ${darkMode ? 'bg-blue-600/10' : 'bg-blue-600/20'} rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000`} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-6 md:mb-10 relative z-10"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 bg-teal-600/10 border border-teal-600/30 rounded-full text-teal-600 text-[10px] sm:text-xs mb-2 sm:mb-3 md:mb-5 backdrop-blur-sm">
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 animate-pulse" />
            <span className="tracking-widest">{t('tradingTools')}</span>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-wider mb-1.5 sm:mb-2 md:mb-3 font-light">
            ZNPCV
          </motion.h1>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-sm sm:text-base md:text-lg lg:text-xl tracking-widest ${theme.textSecondary} mb-2 sm:mb-3 md:mb-5`}>
            {t('ultimateChecklist')}
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`${darkMode ? 'text-zinc-300' : 'text-zinc-700'} text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-sans italic px-3`}>
            "{t('disciplineQuote')}"
          </motion.p>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`${theme.textDimmed} text-[10px] sm:text-xs md:text-sm mt-1.5 sm:mt-2 tracking-widest`}>— {t('philosophy')}</motion.p>
        </motion.div>

        {/* Main Actions - 2+1 Layout */}
        <div className="mb-4 sm:mb-6 md:mb-10 lg:mb-14 space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-2 sm:gap-2.5 md:gap-4 lg:gap-6"
          >
          {/* New Analysis - Compact */}
          <button
            onClick={() => navigate(createPageUrl('Checklist'))}
            className={cn("group relative p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl hover:shadow-2xl transition-all text-left overflow-hidden",
              darkMode ? "bg-white text-black" : "bg-black text-white")}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-black/5 rounded-full -translate-y-12 sm:-translate-y-16 md:-translate-y-20 translate-x-12 sm:translate-x-16 md:translate-x-20" />
            <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-black/5 rounded-full translate-y-10 sm:translate-y-12 md:translate-y-16 -translate-x-10 sm:-translate-x-12 md:-translate-x-16" />

            <div className="relative z-10">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
                <div className={cn("w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center",
                  darkMode ? "bg-black" : "bg-white")}>
                  <ClipboardCheck className={cn("w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6", darkMode ? "text-white" : "text-black")} />
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-teal-600 text-white text-[10px] sm:text-xs rounded-full ml-auto">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                  START
                </div>
              </div>

              <h2 className={cn("text-xl sm:text-2xl md:text-3xl tracking-wider mb-2 sm:mb-3 font-bold", darkMode ? "text-black" : "text-white")}>{t('newAnalysis')}</h2>
              <p className={cn("text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 md:mb-6 font-sans max-w-xs", darkMode ? "text-zinc-600" : "text-zinc-300")}>
                {t('newAnalysisDesc')}
              </p>

              <div className={cn("flex items-center gap-2 sm:gap-3 font-bold tracking-widest", darkMode ? "text-black" : "text-white")}>
                <span className="text-sm sm:text-base md:text-lg">{t('startNow')}</span>
                <div className={cn("w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:translate-x-2 transition-transform",
                  darkMode ? "bg-black text-white" : "bg-white text-black")}>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          </button>

          {/* Dashboard - Compact */}
          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className={cn("group relative p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl hover:shadow-2xl transition-all text-left overflow-hidden border-2",
              darkMode ? "bg-black text-white border-zinc-800" : "bg-white text-black border-zinc-300")}
          >
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
                <div className={cn("w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center",
                  darkMode ? "bg-white" : "bg-black")}>
                  <BarChart3 className={cn("w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6", darkMode ? "text-black" : "text-white")} />
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-zinc-800 text-zinc-300 text-[10px] sm:text-xs rounded-full ml-auto">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" />
                  LIVE
                </div>
              </div>

              <h2 className={cn("text-xl sm:text-2xl md:text-3xl tracking-wider mb-2 sm:mb-3 font-bold", darkMode ? "text-white" : "text-black")}>{t('dashboard')}</h2>
              <p className={cn("text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 md:mb-6 font-sans max-w-xs", darkMode ? "text-zinc-400" : "text-zinc-600")}>
                {t('dashboardDesc')}
              </p>

              <div className={cn("flex items-center gap-2 sm:gap-3 font-bold tracking-widest", darkMode ? "text-white" : "text-black")}>
                <span className="text-sm sm:text-base md:text-lg">{t('openDashboard')}</span>
                <div className={cn("w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:translate-x-2 transition-transform",
                  darkMode ? "bg-white text-black" : "bg-black text-white")}>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Trade History - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate(createPageUrl('TradeHistory'))}
            className={cn("group relative p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl hover:shadow-2xl transition-all text-left overflow-hidden border-2",
              darkMode ? "bg-zinc-900 text-white border-zinc-800" : "bg-zinc-100 text-black border-zinc-300")}
          >
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{backgroundImage: 'linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor), linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px'}} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
                <div className={cn("w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center",
                  darkMode ? "bg-white" : "bg-black")}>
                  <History className={cn("w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6", darkMode ? "text-black" : "text-white")} />
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-purple-600 text-white text-[10px] sm:text-xs rounded-full ml-auto">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                  LOG
                </div>
              </div>

              <h2 className={cn("text-xl sm:text-2xl md:text-3xl tracking-wider mb-2 sm:mb-3 font-bold", darkMode ? "text-white" : "text-black")}>{t('tradeHistory')}</h2>
              <p className={cn("text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 md:mb-6 font-sans max-w-xs", darkMode ? "text-zinc-400" : "text-zinc-600")}>
                {t('performanceAnalytics')}
              </p>

              <div className={cn("flex items-center gap-2 sm:gap-3 font-bold tracking-widest", darkMode ? "text-white" : "text-black")}>
                <span className="text-sm sm:text-base md:text-lg">{t('openDashboard')}</span>
                <div className={cn("w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:translate-x-2 transition-transform",
                  darkMode ? "bg-white text-black" : "bg-black text-white")}>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          </button>
        </motion.div>
        </div>

        {/* How It Works - 3 Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 sm:mb-12 md:mb-16 lg:mb-20"
        >
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-2 sm:mb-3">WIE ES FUNKTIONIERT</h3>
            <p className={`${theme.textDimmed} text-xs sm:text-sm md:text-base`}>3 Einfache Schritte zum Trading-Erfolg</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { num: '01', title: 'ANALYSIERE', desc: 'Nutze die W-D-4H Methode für Multi-Timeframe Analyse', icon: Target },
              { num: '02', title: 'VALIDIERE', desc: 'Checke alle Confluences und erreiche 85%+ Score', icon: CheckCircle2 },
              { num: '03', title: 'TRADE', desc: 'Führe deinen perfekt geplanten Trade mit Disziplin aus', icon: TrendingUp },
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className={`relative p-6 sm:p-8 rounded-2xl border-2 ${theme.border} ${theme.bgSecondary} overflow-hidden group hover:border-teal-600 transition-all`}
              >
                <div className={`absolute top-0 right-0 text-8xl sm:text-9xl font-black opacity-5 ${theme.text} -mr-4 -mt-8`}>
                  {step.num}
                </div>
                <div className="relative z-10">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 ${darkMode ? 'bg-white' : 'bg-black'} group-hover:scale-110 transition-transform`}>
                    <step.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${darkMode ? 'text-black' : 'text-white'}`} />
                  </div>
                  <h4 className={`text-lg sm:text-xl tracking-wider mb-2 sm:mb-3 ${theme.text}`}>{step.title}</h4>
                  <p className={`${theme.textMuted} text-sm sm:text-base leading-relaxed font-sans`}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8 sm:mb-12 md:mb-16 lg:mb-20"
        >
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-2 sm:mb-3">PRICING</h3>
            <p className={`${theme.textDimmed} text-xs sm:text-sm md:text-base`}>Einmalzahlung • Lifetime Access • Keine versteckten Kosten</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={cn("relative p-8 sm:p-10 md:p-12 rounded-3xl border-4 overflow-hidden",
                darkMode ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border-teal-600" : "bg-gradient-to-br from-white to-zinc-50 border-teal-600")}
            >
              <div className="absolute top-0 right-0 px-4 py-1 bg-teal-600 text-white text-xs font-bold tracking-widest rounded-bl-xl">
                LIFETIME
              </div>

              <div className="text-center mb-6">
                <div className={`text-5xl sm:text-6xl md:text-7xl font-black mb-2 ${theme.text}`}>
                  $99
                </div>
                <div className={`${theme.textMuted} text-sm sm:text-base tracking-widest`}>EINMALZAHLUNG</div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-8">
                {[
                  'Multi-Timeframe Analyse Tools',
                  'ZNPCV Checklist System',
                  'Performance Dashboard',
                  'Trade History & Analytics',
                  'Lifetime Updates',
                  'Premium Support',
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <span className={`${theme.text} text-sm sm:text-base`}>{feature}</span>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl text-base sm:text-lg tracking-widest transition-all transform hover:scale-105"
              >
                JETZT STARTEN
              </button>

              <p className={`text-center ${theme.textDimmed} text-xs sm:text-sm mt-4`}>
                🔒 Sichere Zahlung via Stripe • 14 Tage Geld-zurück-Garantie
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Screenshot Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 sm:mb-12 md:mb-16 lg:mb-20"
        >
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-2 sm:mb-3">SCREENSHOTS</h3>
            <p className={`${theme.textDimmed} text-xs sm:text-sm md:text-base`}>Erlebe die Power der ZNPCV Checkliste</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl border-2 ${theme.border} overflow-hidden ${theme.bgSecondary} p-4`}
            >
              <div className={`aspect-video rounded-xl ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center`}>
                <div className="text-center">
                  <ClipboardCheck className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 ${theme.textMuted}`} />
                  <p className={`${theme.textMuted} text-sm sm:text-base tracking-wider`}>CHECKLIST PREVIEW</p>
                </div>
              </div>
              <p className={`${theme.text} text-sm sm:text-base mt-3 text-center tracking-wider`}>Multi-Timeframe Analyse</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl border-2 ${theme.border} overflow-hidden ${theme.bgSecondary} p-4`}
            >
              <div className={`aspect-video rounded-xl ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center`}>
                <div className="text-center">
                  <BarChart3 className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 ${theme.textMuted}`} />
                  <p className={`${theme.textMuted} text-sm sm:text-base tracking-wider`}>DASHBOARD PREVIEW</p>
                </div>
              </div>
              <p className={`${theme.text} text-sm sm:text-base mt-3 text-center tracking-wider`}>Performance Analytics</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Social Proof Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8 sm:mb-12 md:mb-16 lg:mb-20"
        >
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-2 sm:mb-3">WAS TRADER SAGEN</h3>
            <p className={`${theme.textDimmed} text-xs sm:text-sm md:text-base`}>Echte Ergebnisse von echten Tradern</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: 'Michael K.', role: 'Day Trader', text: 'ZNPCV hat meine Trading-Disziplin komplett verändert. Endlich trade ich nach einem System!', rating: 5 },
              { name: 'Sarah L.', role: 'Swing Trader', text: 'Die Multi-Timeframe Analyse ist genial. Seitdem ich ZNPCV nutze, sind meine Trades deutlich profitabler.', rating: 5 },
              { name: 'Thomas M.', role: 'Forex Trader', text: 'Beste 99$ die ich je investiert habe. Das Tool hat sich nach 2 Trades bezahlt gemacht.', rating: 5 },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className={`p-6 sm:p-8 rounded-2xl border-2 ${theme.border} ${theme.bgSecondary}`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-lg">★</span>
                  ))}
                </div>
                <p className={`${theme.text} text-sm sm:text-base mb-4 font-sans italic leading-relaxed`}>
                  "{testimonial.text}"
                </p>
                <div>
                  <p className={`${theme.text} font-bold text-sm sm:text-base`}>{testimonial.name}</p>
                  <p className={`${theme.textMuted} text-xs sm:text-sm`}>{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4 sm:mb-6 md:mb-10 lg:mb-14"
        >
          <div className="text-center mb-3 sm:mb-4 md:mb-6">
            <h3 className="text-sm sm:text-base md:text-lg tracking-widest mb-1 sm:mb-1.5">{t('features')}</h3>
            <p className={`${theme.textDimmed} text-[10px] sm:text-xs md:text-sm`}>{t('featuresDesc')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
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
                className={`p-3 sm:p-4 md:p-5 lg:p-6 ${theme.bgSecondary} border ${theme.border} rounded-xl sm:rounded-2xl hover:border-teal-600/50 transition-all group`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${darkMode ? 'text-black' : 'text-white'}`} />
                </div>
                <h3 className={`text-sm sm:text-base md:text-lg tracking-wider mb-1 sm:mb-2 ${theme.text}`}>{t(item.titleKey)}</h3>
                <p className={`text-xs sm:text-sm ${theme.textMuted} leading-relaxed font-sans`}>{t(item.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4"
        >
          {[
            { value: '85%+', labelKey: 'znpcvStandard', icon: Award },
            { value: '7', labelKey: 'stepChecklist', icon: CheckCircle2 },
            { value: '4', labelKey: 'chartPatterns', icon: Activity },
          ].map((stat) => (
            <div key={stat.labelKey} className={`text-center p-2.5 sm:p-3 md:p-4 lg:p-5 border ${theme.border} rounded-lg sm:rounded-xl md:rounded-2xl ${theme.bgSecondary}`}>
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-1.5 sm:mb-2 md:mb-3 ${theme.text}`} />
              <div className={`text-lg sm:text-xl md:text-2xl font-light mb-0.5 sm:mb-1 ${theme.text}`}>{stat.value}</div>
              <div className={`text-[9px] sm:text-[10px] md:text-xs ${theme.textDimmed} tracking-widest`}>{t(stat.labelKey)}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`${theme.bgSecondary} border-t ${theme.border}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8 md:mb-10">

            {/* Brand & Description */}
            <div className="md:col-span-4 text-center md:text-left">
              <img 
                src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV" 
                className="h-14 sm:h-16 md:h-20 w-auto mb-3 sm:mb-4 mx-auto md:mx-0"
              />
              <p className={`${theme.textMuted} text-xs sm:text-sm font-sans leading-relaxed mb-4 sm:mb-5`}>
                {t('footerDesc')}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 mb-5">
                <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}>
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-pulse" />
                  <Lock className="w-3 h-3 text-teal-600" />
                  <span className={`text-[9px] sm:text-[10px] ${theme.text} font-bold`}>SSL ENCRYPTED</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}>
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  <span className={`text-[9px] sm:text-[10px] ${theme.text} font-bold`}>DSGVO</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}>
                  <Globe className="w-3 h-3 text-teal-600" />
                  <span className={`text-[9px] sm:text-[10px] ${theme.text} font-bold`}>CLOUD BACKUP</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}>
                  <Award className="w-3 h-3 text-teal-600" />
                  <span className={`text-[9px] sm:text-[10px] ${theme.text} font-bold`}>PREMIUM</span>
                </div>
              </div>

              </div>

            {/* Navigation */}
            <div className="md:col-span-3">
              <h4 className={`${theme.text} text-xs tracking-widest mb-3 sm:mb-4 flex items-center gap-2 justify-center md:justify-start`}>
                <div className={`w-1 h-3 sm:h-4 rounded-full ${darkMode ? 'bg-white' : 'bg-zinc-900'}`} />
                NAVIGATION
              </h4>
              <div className="space-y-2">
                <button onClick={() => navigate(createPageUrl('Checklist'))} 
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group ${darkMode ? 'bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900' : 'bg-zinc-200/50 border border-zinc-300/50 hover:border-zinc-400 hover:bg-zinc-200'}`}>
                  <ClipboardCheck className={`w-4 h-4 ${theme.textMuted} group-hover:text-teal-600 transition-colors`} />
                  <span className={`${theme.textSecondary} group-hover:${theme.text} text-sm transition-colors`}>{t('newAnalysis')}</span>
                  <ChevronRight className={`w-3 h-3 ${theme.textDimmed} ml-auto group-hover:translate-x-1 transition-transform`} />
                </button>
                <button onClick={() => navigate(createPageUrl('Dashboard'))} 
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group ${darkMode ? 'bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900' : 'bg-zinc-200/50 border border-zinc-300/50 hover:border-zinc-400 hover:bg-zinc-200'}`}>
                  <BarChart3 className={`w-4 h-4 ${theme.textMuted} group-hover:text-teal-600 transition-colors`} />
                  <span className={`${theme.textSecondary} group-hover:${theme.text} text-sm transition-colors`}>{t('dashboard')}</span>
                  <ChevronRight className={`w-3 h-3 ${theme.textDimmed} ml-auto group-hover:translate-x-1 transition-transform`} />
                </button>
                <button onClick={() => navigate(createPageUrl('TradeHistory'))} 
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group ${darkMode ? 'bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900' : 'bg-zinc-200/50 border border-zinc-300/50 hover:border-zinc-400 hover:bg-zinc-200'}`}>
                  <History className={`w-4 h-4 ${theme.textMuted} group-hover:text-teal-600 transition-colors`} />
                  <span className={`${theme.textSecondary} group-hover:${theme.text} text-sm transition-colors`}>Trade History</span>
                  <ChevronRight className={`w-3 h-3 ${theme.textDimmed} ml-auto group-hover:translate-x-1 transition-transform`} />
                </button>
                <button onClick={() => navigate(createPageUrl('FAQ'))} 
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group ${darkMode ? 'bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900' : 'bg-zinc-200/50 border border-zinc-300/50 hover:border-zinc-400 hover:bg-zinc-200'}`}>
                  <HelpCircle className={`w-4 h-4 ${theme.textMuted} group-hover:text-teal-600 transition-colors`} />
                  <span className={`${theme.textSecondary} group-hover:${theme.text} text-sm transition-colors`}>FAQ & Help</span>
                  <ChevronRight className={`w-3 h-3 ${theme.textDimmed} ml-auto group-hover:translate-x-1 transition-transform`} />
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="md:col-span-5">
              <h4 className={`${theme.text} text-xs tracking-widest mb-3 sm:mb-4 flex items-center gap-2 justify-center md:justify-start`}>
                <div className={`w-1 h-3 sm:h-4 rounded-full ${darkMode ? 'bg-white' : 'bg-zinc-900'}`} />
                {t('contact')}
              </h4>
              <div className="space-y-2">
                <a href="mailto:support@znpcv.com" className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-colors group ${darkMode ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700' : 'bg-zinc-200 border border-zinc-300 hover:border-zinc-400'}`}>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-600 text-xs sm:text-sm">@</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[9px] sm:text-[10px] ${theme.textDimmed} tracking-wider`}>EMAIL</div>
                    <div className={`${theme.text} text-xs sm:text-sm group-hover:text-teal-600 transition-colors truncate`}>support@znpcv.com</div>
                  </div>
                </a>
                <button onClick={() => navigate(createPageUrl('FAQ'))} className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-colors group ${darkMode ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700' : 'bg-zinc-200 border border-zinc-300 hover:border-zinc-400'}`}>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`text-[9px] sm:text-[10px] ${theme.textDimmed} tracking-wider`}>SUPPORT</div>
                    <div className={`${theme.text} text-xs sm:text-sm group-hover:text-blue-500 transition-colors`}>{t('faqHelp')}</div>
                  </div>
                </button>
                </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`pt-6 sm:pt-8 border-t ${theme.border}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <img 
                  src={darkMode 
                    ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                    : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                  }
                  alt="ZNPCV" 
                  className="h-8 sm:h-10 w-auto opacity-50"
                />
                <div className={`h-4 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
                <p className={`${theme.textMuted} text-xs`}>© {new Date().getFullYear()} ZNPCV</p>
                <div className={`h-4 w-px hidden sm:block ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
                <p className={`${theme.textDimmed} text-xs hidden sm:block`}>{t('allRights')}</p>
              </div>
              <p className={`${theme.textDimmed} text-[10px] font-sans text-center md:text-right max-w-md leading-relaxed`}>
                {t('riskWarning')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
              <button type="button" onClick={() => navigate(createPageUrl('Impressum'))} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
                Impressum
              </button>
              <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              <button type="button" onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
                Datenschutz
              </button>
              <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              <button type="button" onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
                AGB
              </button>
            </div>
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
            className={`fixed bottom-6 right-6 w-11 h-11 flex items-center justify-center shadow-lg transition-colors z-50 rounded-full ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}