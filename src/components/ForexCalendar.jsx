import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { 
  Calendar, RefreshCw, AlertTriangle, Clock, 
  Globe, Zap, Filter
} from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const IMPACT_CONFIG = {
  high:   { label: 'HIGH', color: 'bg-rose-500',  text: 'text-rose-500',  border: 'border-rose-500/40',  bg: 'bg-rose-500/10'  },
  medium: { label: 'MED',  color: 'bg-amber-400', text: 'text-amber-400', border: 'border-amber-400/40', bg: 'bg-amber-400/10' },
  low:    { label: 'LOW',  color: 'bg-zinc-500',  text: 'text-zinc-400',  border: 'border-zinc-600',     bg: 'bg-zinc-800/50'  },
};

const CURRENCY_COLORS = {
  USD: 'bg-blue-600 text-white',
  EUR: 'bg-yellow-600 text-black',
  GBP: 'bg-purple-600 text-white',
  JPY: 'bg-red-700 text-white',
  AUD: 'bg-green-600 text-white',
  CAD: 'bg-red-800 text-white',
  CHF: 'bg-pink-600 text-white',
  NZD: 'bg-teal-600 text-white',
  CNY: 'bg-red-600 text-white',
};

function getDayRange() {
  const today = new Date();
  const days = [];
  for (let i = -1; i <= 5; i++) {
    days.push(addDays(today, i));
  }
  return days;
}

function isNow(timeStr, dateStr) {
  if (!timeStr || timeStr === 'All Day' || timeStr === '--:--') return false;
  const now = new Date();
  const nowDate = now.toISOString().split('T')[0];
  if (dateStr !== nowDate) return false;
  const [h, m] = timeStr.split(':').map(Number);
  const eventMin = h * 60 + m;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return Math.abs(eventMin - nowMin) <= 30;
}

export default function ForexCalendar({ darkMode = true }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [impactFilter, setImpactFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [error, setError] = useState(null);

  const days = getDayRange();
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('forexCalendar', {});
      const data = response.data?.data || [];
      setAllEvents(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Kalender konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  useEffect(() => {
    let filtered = allEvents.filter(e => e.date === selectedDate);
    if (impactFilter !== 'all') filtered = filtered.filter(e => e.impact === impactFilter);
    if (currencyFilter !== 'all') filtered = filtered.filter(e => e.currency === currencyFilter);
    setEvents(filtered);
  }, [allEvents, selectedDate, impactFilter, currencyFilter]);

  const getCountForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allEvents.filter(e => e.date === dateStr);
  };

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textDim: darkMode ? 'text-zinc-600' : 'text-zinc-400',
  };

  const availableCurrencies = [...new Set(allEvents.map(e => e.currency).filter(Boolean))].sort();
  const todayHighImpact = allEvents.filter(e => e.date === todayStr && e.impact === 'high');

  return (
    <div className={cn("rounded-xl sm:rounded-2xl border-2 overflow-hidden", theme.border, theme.bg)}>

      {/* Header */}
      <div className={cn("flex items-center justify-between px-4 sm:px-5 py-3 border-b", theme.border,
        darkMode ? 'bg-zinc-900' : 'bg-zinc-100')}>
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",
            darkMode ? 'bg-white' : 'bg-zinc-900')}>
            <Calendar className={cn("w-5 h-5", darkMode ? 'text-black' : 'text-white')} />
          </div>
          <div>
            <div className={cn("font-bold tracking-wider text-sm", theme.text)}>ECONOMIC CALENDAR</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-[9px] tracking-widest font-bold text-teal-500">FOREX FACTORY LIVE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className={cn("text-[9px] font-sans hidden sm:block", theme.textDim)}>
              {lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={fetchEvents} disabled={loading}
            className={cn("p-1.5 rounded-lg border transition-colors", theme.border,
              darkMode ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-black hover:bg-zinc-200',
              loading && 'opacity-50 cursor-wait')}>
            <RefreshCw className={cn("w-3.5 h-3.5", loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Today's High Impact Alert */}
      {todayHighImpact.length > 0 && (
        <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/30 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
          <span className="text-[10px] font-bold tracking-wider text-rose-500">
            {todayHighImpact.length} HIGH IMPACT EVENT{todayHighImpact.length > 1 ? 'S' : ''} HEUTE
          </span>
          <div className="ml-auto flex gap-1">
            {todayHighImpact.slice(0, 3).map((e, i) => (
              <span key={i} className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold",
                CURRENCY_COLORS[e.currency] || 'bg-zinc-700 text-white')}>
                {e.currency}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Day Selector Strip */}
      <div className={cn("px-3 py-3 border-b overflow-x-auto scrollbar-hide", theme.border)}>
        <div className="flex gap-2 min-w-max">
          {days.map(day => {
            const dateStr = day.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const dayEvents = getCountForDay(day);
            const highCount = dayEvents.filter(e => e.impact === 'high').length;
            const totalCount = dayEvents.length;
            const dayName = format(day, 'EEE', { locale: de }).toUpperCase();

            return (
              <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all min-w-[56px]",
                  isSelected
                    ? darkMode ? 'bg-white border-white text-black' : 'bg-zinc-900 border-zinc-900 text-white'
                    : isToday
                      ? darkMode ? 'border-teal-500/50 bg-teal-500/10' : 'border-teal-500/50 bg-teal-50'
                      : cn(theme.border, darkMode ? 'bg-zinc-900/50 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100')
                )}>
                <span className={cn("text-[9px] font-bold tracking-wider",
                  isSelected ? (darkMode ? 'text-black' : 'text-white') : theme.textMuted)}>
                  {dayName}
                </span>
                <span className={cn("text-base font-black",
                  isSelected ? (darkMode ? 'text-black' : 'text-white') : isToday ? 'text-teal-500' : theme.text)}>
                  {format(day, 'd')}
                </span>
                {totalCount > 0 ? (
                  <div className="flex items-center gap-0.5">
                    {highCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    <span className={cn("text-[9px] font-bold",
                      isSelected ? (darkMode ? 'text-black/60' : 'text-white/60') : theme.textDim)}>
                      {totalCount}
                    </span>
                  </div>
                ) : (
                  <span className={cn("text-[9px]", theme.textDim)}>—</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className={cn("px-4 py-2 border-b flex items-center gap-2 flex-wrap", theme.border)}>
        <Filter className={cn("w-3 h-3 flex-shrink-0", theme.textDim)} />
        {['all', 'high', 'medium', 'low'].map(f => (
          <button key={f} onClick={() => setImpactFilter(f)}
            className={cn("px-2 py-1 text-[10px] font-bold tracking-wider rounded-lg border transition-all",
              impactFilter === f
                ? f === 'high' ? 'bg-rose-500 border-rose-500 text-white'
                  : f === 'medium' ? 'bg-amber-400 border-amber-400 text-black'
                  : f === 'low' ? 'bg-zinc-600 border-zinc-600 text-white'
                  : darkMode ? 'bg-white border-white text-black' : 'bg-zinc-900 border-zinc-900 text-white'
                : cn(theme.border, theme.textMuted, darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'))}>
            {f === 'all' ? 'ALLE' : f.toUpperCase()}
          </button>
        ))}
        {availableCurrencies.length > 0 && (
          <>
            <div className={cn("w-px h-4 mx-1", darkMode ? 'bg-zinc-700' : 'bg-zinc-300')} />
            <select value={currencyFilter} onChange={e => setCurrencyFilter(e.target.value)}
              className={cn("text-[10px] font-bold rounded-lg border px-2 py-1 outline-none cursor-pointer",
                theme.border, darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black')}>
              <option value="all">ALLE WÄHRUNGEN</option>
              {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Events List */}
      <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            <span className={cn("text-[10px] tracking-widest", theme.textMuted)}>LADE EVENTS...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className={cn("w-8 h-8 mx-auto mb-3", theme.textMuted)} />
            <p className={cn("text-sm font-sans", theme.textMuted)}>{error}</p>
            <button onClick={fetchEvents} className="mt-3 text-teal-500 text-xs font-bold hover:underline">
              Erneut versuchen
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <Globe className={cn("w-8 h-8 mx-auto mb-3", theme.textDim)} />
            <p className={cn("text-sm font-sans", theme.textMuted)}>Keine Events für diesen Tag</p>
            <p className={cn("text-[10px] mt-1", theme.textDim)}>
              {allEvents.length === 0 ? 'Kalender lädt...' : 'Wähle einen anderen Tag'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map((event, idx) => {
              const impact = IMPACT_CONFIG[event.impact] || IMPACT_CONFIG.low;
              const isLive = isNow(event.time, event.date);
              const currencyColor = CURRENCY_COLORS[event.currency] || 'bg-zinc-700 text-white';
              const hasResult = event.actual !== null && event.actual !== undefined && event.actual !== '';
              const beatForecast = hasResult && event.forecast && parseFloat(event.actual) > parseFloat(event.forecast);
              const missedForecast = hasResult && event.forecast && parseFloat(event.actual) < parseFloat(event.forecast);

              return (
                <motion.div key={event.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn("border-b last:border-b-0 px-4 py-3 transition-colors relative",
                    theme.border,
                    isLive
                      ? darkMode ? 'bg-teal-500/10 border-l-4 border-l-teal-500' : 'bg-teal-50 border-l-4 border-l-teal-500'
                      : darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50')}>

                  {isLive && (
                    <div className="absolute top-2 right-3 flex items-center gap-1 px-2 py-0.5 bg-teal-500 text-black text-[9px] font-bold rounded-full">
                      <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1.5 min-w-[44px]">
                      <span className={cn("font-mono text-xs font-bold",
                        isLive ? 'text-teal-500' : theme.textMuted)}>
                        {event.time || '--:--'}
                      </span>
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", impact.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0", currencyColor)}>
                          {event.currency}
                        </span>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border",
                          impact.border, impact.bg, impact.text)}>
                          {impact.label}
                        </span>
                      </div>
                      <div className={cn("text-xs sm:text-sm font-bold leading-tight", theme.text)}>
                        {event.event}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-right min-w-[80px]">
                      {hasResult ? (
                        <div className={cn("font-mono font-black text-sm",
                          beatForecast ? 'text-teal-500' : missedForecast ? 'text-rose-500' : theme.text)}>
                          {event.actual}
                          {beatForecast && <span className="text-[10px] ml-1">↑</span>}
                          {missedForecast && <span className="text-[10px] ml-1">↓</span>}
                        </div>
                      ) : (
                        <span className={cn("font-mono text-xs", theme.textDim)}>—</span>
                      )}
                      {event.forecast && (
                        <div className="flex items-center gap-1">
                          <span className={cn("text-[9px]", theme.textDim)}>F:</span>
                          <span className={cn("font-mono text-[10px]", theme.textMuted)}>{event.forecast}</span>
                        </div>
                      )}
                      {event.previous && (
                        <div className="flex items-center gap-1">
                          <span className={cn("text-[9px]", theme.textDim)}>P:</span>
                          <span className={cn("font-mono text-[9px]", theme.textDim)}>{event.previous}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className={cn("px-4 py-2 border-t flex items-center justify-between", theme.border,
        darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50')}>
        <span className={cn("text-[9px] font-bold tracking-wider", theme.textDim)}>
          {events.length} EVENT{events.length !== 1 ? 'S' : ''} • {selectedDate === todayStr ? 'HEUTE' : selectedDate}
        </span>
        <div className="flex items-center gap-3 text-[9px]">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className={theme.textDim}>HIGH</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className={theme.textDim}>MED</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span className={theme.textDim}>LOW</span>
          </div>
        </div>
      </div>
    </div>
  );
}