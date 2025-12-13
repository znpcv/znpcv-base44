import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BarChart3, ClipboardCheck, TrendingUp, Shield, Target,
  Lock, ShieldCheck, Globe, Zap, ArrowUp, ChevronRight, CheckCircle2,
  Activity, Award, HelpCircle, Calendar, History
} from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import TradingQuote from '@/components/TradingQuote';
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
              <div className={`flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 rounded-md sm:rounded-lg md:rounded-xl border-2 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-300'}`}>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-teal-600 rounded-full animate-pulse" />
                <span className={`text-[9px] sm:text-[10px] md:text-xs font-bold tracking-widest font-mono ${theme.text}`}>
                  {localTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
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

      {/* Hero Section - Compact for Mobile */}
      <main className="max-w-6xl mx-auto px-2 sm:px-3 md:px-6 py-3 sm:py-4 md:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-6 md:mb-10"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 bg-teal-600/10 border border-teal-600/30 rounded-full text-teal-600 text-[10px] sm:text-xs mb-2 sm:mb-3 md:mb-5">
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
            <span className="tracking-widest">{t('tradingTools')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-wider mb-1.5 sm:mb-2 md:mb-3 font-light">
            ZNPCV
          </h1>
          <h2 className={`text-sm sm:text-base md:text-lg lg:text-xl tracking-widest ${theme.textSecondary} mb-2 sm:mb-3 md:mb-5`}>
            {t('ultimateChecklist')}
          </h2>
          <p className={`${darkMode ? 'text-zinc-300' : 'text-zinc-700'} text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-sans italic px-3`}>
            "{t('disciplineQuote')}"
          </p>
          <p className={`${theme.textDimmed} text-[10px] sm:text-xs md:text-sm mt-1.5 sm:mt-2 tracking-widest`}>— {t('philosophy')}</p>
        </motion.div>

        {/* Main Actions - Ultra Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-10"
        >
          {/* New Analysis - Minimal */}
          <button
            onClick={() => navigate(createPageUrl('Checklist'))}
            className={cn("group relative p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all text-center",
              darkMode ? "bg-white text-black" : "bg-black text-white")}
          >
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3",
              darkMode ? "bg-black" : "bg-white")}>
              <ClipboardCheck className={cn("w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7", darkMode ? "text-white" : "text-black")} />
            </div>
            <h2 className={cn("text-sm sm:text-base md:text-lg tracking-wider font-bold", darkMode ? "text-black" : "text-white")}>{t('newAnalysis')}</h2>
          </button>

          {/* Dashboard - Minimal */}
          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className={cn("group relative p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all text-center border-2",
              darkMode ? "bg-black text-white border-zinc-800" : "bg-white text-black border-zinc-300")}
          >
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3",
              darkMode ? "bg-white" : "bg-black")}>
              <BarChart3 className={cn("w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7", darkMode ? "text-black" : "text-white")} />
            </div>
            <h2 className={cn("text-sm sm:text-base md:text-lg tracking-wider font-bold", darkMode ? "text-white" : "text-black")}>{t('dashboard')}</h2>
          </button>
        </motion.div>

        {/* Trading Quote */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <TradingQuote />
        </div>

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
                  <span className={`text-[9px] sm:text-[10px] ${theme.text} font-bold`}>SSL</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}>
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  <span className={`text-[9px] sm:text-[10px] ${theme.text} font-bold`}>SECURE</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}>
                  <Globe className="w-3 h-3 text-teal-600" />
                  <span className={`text-[9px] sm:text-[10px] ${theme.text} font-bold`}>24/7</span>
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