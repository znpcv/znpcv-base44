import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, TrendingUp, AlertCircle, ChevronRight, RefreshCw, Filter, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';

export default function EconomicCalendarPage() {
  const navigate = useNavigate();
  const { language, isRTL, darkMode } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchEconomicEvents();
  }, [selectedDate]);

  const fetchEconomicEvents = async () => {
    setLoading(true);
    
    try {
      // HINWEIS: Forex Factory hat keine öffentliche API
      // Für Production brauchst du:
      // 1. Backend Function mit Web Scraping
      // 2. Alternative API (Trading Economics, Investing.com)
      // 3. RSS Feed Parser
      
      // Demo: Fetch from backend function
      // const response = await base44.functions.fetchForexFactoryCalendar({ 
      //   date: format(selectedDate, 'yyyy-MM-dd') 
      // });
      
      // Mock Daten mit realistischer Struktur
      setTimeout(() => {
        const mockEvents = [
        {
          time: '12:00',
          currency: 'USD',
          impact: 'high',
          event: 'FOMC Press Conference',
          actual: null,
          forecast: null,
          previous: null
        },
        {
          time: '13:30',
          currency: 'USD',
          impact: 'high',
          event: 'Non-Farm Payrolls',
          actual: '199K',
          forecast: '200K',
          previous: '150K'
        },
        {
          time: '08:30',
          currency: 'EUR',
          impact: 'medium',
          event: 'German Manufacturing PMI',
          actual: '45.2',
          forecast: '45.5',
          previous: '45.0'
        },
        {
          time: '14:00',
          currency: 'GBP',
          impact: 'medium',
          event: 'GDP Growth Rate',
          actual: '0.2%',
          forecast: '0.3%',
          previous: '0.1%'
        },
        {
          time: '01:30',
          currency: 'JPY',
          impact: 'low',
          event: 'Industrial Production',
          actual: '-0.5%',
          forecast: '-0.3%',
          previous: '0.2%'
        },
        {
          time: '10:00',
          currency: 'EUR',
          impact: 'high',
          event: 'ECB Interest Rate Decision',
          actual: null,
          forecast: '4.50%',
          previous: '4.50%'
        },
        {
          time: '15:30',
          currency: 'USD',
          impact: 'medium',
          event: 'Crude Oil Inventories',
          actual: '-2.5M',
          forecast: '-1.0M',
          previous: '-3.0M'
        }
      ];
        setEvents(mockEvents);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Calendar fetch error:', error);
      setEvents([]);
      setLoading(false);
    }
  };

  const getImpactColor = (impact) => {
    if (impact === 'high') return darkMode ? 'text-red-400 bg-red-500/10' : 'text-red-600 bg-red-500/10';
    if (impact === 'medium') return darkMode ? 'text-yellow-400 bg-yellow-500/10' : 'text-yellow-600 bg-yellow-500/10';
    return darkMode ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-500/10';
  };

  const getCurrencyFlag = (currency) => {
    const flags = {
      'USD': '🇺🇸',
      'EUR': '🇪🇺',
      'GBP': '🇬🇧',
      'JPY': '🇯🇵',
      'AUD': '🇦🇺',
      'NZD': '🇳🇿',
      'CAD': '🇨🇦',
      'CHF': '🇨🇭'
    };
    return flags[currency] || '🌍';
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.impact === filter);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(createPageUrl('Home'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
                <Home className="w-6 h-6" />
              </button>
              <button onClick={() => navigate(createPageUrl('Home'))}>
                <img src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                } alt="ZNPCV" className="h-10 sm:h-12 md:h-14 w-auto cursor-pointer hover:opacity-80" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Calendar className={`w-8 h-8 ${theme.text}`} />
            <h1 className={`text-3xl md:text-4xl tracking-widest ${theme.text}`}>ECONOMIC CALENDAR</h1>
          </div>
          <p className={`${theme.textMuted} tracking-wider`}>Live Forex Factory Events & News</p>
        </motion.div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className={`p-4 border ${theme.border} rounded-xl ${theme.bgCard}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme.textMuted} tracking-widest`}>DATE</span>
              <Clock className={`w-4 h-4 ${theme.textMuted}`} />
            </div>
            <div className={`text-2xl tracking-wider ${theme.text}`}>
              {format(selectedDate, 'EEEE, dd MMM yyyy', { locale: language === 'de' ? de : enUS })}
            </div>
          </div>

          <div className={`p-4 border ${theme.border} rounded-xl ${theme.bgCard} flex items-center gap-3`}>
            <Filter className={`w-5 h-5 ${theme.textMuted}`} />
            <div className="flex gap-2 flex-1">
              {['all', 'high', 'medium', 'low'].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn("px-3 py-1.5 text-xs tracking-wider rounded-lg transition-all",
                    filter === f 
                      ? darkMode ? "bg-white text-black" : "bg-zinc-900 text-white"
                      : darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600")}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={fetchEconomicEvents} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'}`}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Events Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`border ${theme.border} rounded-2xl overflow-hidden ${theme.bgCard}`}>
          
          {/* Header */}
          <div className={`grid grid-cols-12 gap-2 p-4 border-b ${theme.border} ${theme.bgSecondary} text-xs tracking-widest ${theme.textMuted}`}>
            <div className="col-span-1">TIME</div>
            <div className="col-span-1">CCY</div>
            <div className="col-span-1">IMPACT</div>
            <div className="col-span-4">EVENT</div>
            <div className="col-span-1 text-right">ACTUAL</div>
            <div className="col-span-2 text-right">FORECAST</div>
            <div className="col-span-2 text-right">PREVIOUS</div>
          </div>

          {/* Events */}
          <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'}`}>
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className={`w-8 h-8 mx-auto mb-2 animate-spin ${theme.textMuted}`} />
                <p className={theme.textMuted}>Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center">
                <p className={theme.textMuted}>No events found</p>
              </div>
            ) : (
              filteredEvents.map((event, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-12 gap-2 p-4 ${darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-200/50'} transition-colors cursor-pointer`}>
                  <div className={`col-span-1 font-mono text-sm ${theme.text}`}>{event.time}</div>
                  <div className="col-span-1 flex items-center gap-1">
                    <span className="text-lg">{getCurrencyFlag(event.currency)}</span>
                    <span className={`text-xs ${theme.textMuted}`}>{event.currency}</span>
                  </div>
                  <div className="col-span-1">
                    <span className={cn("px-2 py-1 rounded text-xs font-bold", getImpactColor(event.impact))}>
                      {event.impact === 'high' ? '🔴' : event.impact === 'medium' ? '🟡' : '🟢'}
                    </span>
                  </div>
                  <div className={`col-span-4 ${theme.text} text-sm font-sans`}>{event.event}</div>
                  <div className={`col-span-1 text-right text-sm font-mono ${event.actual ? 'text-emerald-500 font-bold' : theme.textMuted}`}>
                    {event.actual || '-'}
                  </div>
                  <div className={`col-span-2 text-right text-sm font-mono ${theme.textMuted}`}>
                    {event.forecast || '-'}
                  </div>
                  <div className={`col-span-2 text-right text-sm font-mono ${theme.textMuted}`}>
                    {event.previous || '-'}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Info & Legend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`mt-6 p-5 border-2 border-yellow-500/30 rounded-xl bg-yellow-500/5`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm tracking-widest text-yellow-600 dark:text-yellow-400 font-bold">WICHTIGER HINWEIS</span>
          </div>
          <p className={`text-sm ${theme.textSecondary} mb-4 font-sans`}>
            <strong>Live-Daten Integration:</strong> Forex Factory erlaubt keine direkte API-Nutzung. Für echte Live-Daten benötigst du eine Backend-Integration mit Web Scraping oder alternative APIs wie Trading Economics, Investing.com oder FXStreet. Aktuell werden Demo-Daten angezeigt.
          </p>
          <div className="flex flex-wrap gap-4 text-sm mt-4 pt-4 border-t border-yellow-500/30">
            <div className="flex items-center gap-2">
              <span className="text-red-500">🔴</span>
              <span className={theme.textSecondary}>HIGH - Starke Bewegung</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">🟡</span>
              <span className={theme.textSecondary}>MEDIUM - Moderate Bewegung</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🟢</span>
              <span className={theme.textSecondary}>LOW - Geringe Bewegung</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}