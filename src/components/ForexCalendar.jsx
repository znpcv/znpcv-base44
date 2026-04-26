import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { RefreshCw, Zap, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

const IMPACT = {
  high:   { label: 'HIGH',   dot: 'bg-rose-500',   badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',   bar: 'bg-rose-500'   },
  medium: { label: 'MED',    dot: 'bg-amber-400',   badge: 'bg-amber-400/15 text-amber-400 border-amber-400/30', bar: 'bg-amber-400'  },
  low:    { label: 'LOW',    dot: 'bg-zinc-600',    badge: 'bg-zinc-800 text-zinc-500 border-zinc-700',          bar: 'bg-zinc-600'   },
};

const CURRENCY_COLORS = {
  USD: 'bg-blue-500/20 text-blue-400',
  EUR: 'bg-yellow-500/20 text-yellow-400',
  GBP: 'bg-purple-500/20 text-purple-400',
  JPY: 'bg-red-500/20 text-red-400',
  AUD: 'bg-green-500/20 text-green-400',
  CAD: 'bg-orange-500/20 text-orange-400',
  CHF: 'bg-pink-500/20 text-pink-400',
  NZD: 'bg-teal-500/20 text-teal-400',
  CNY: 'bg-rose-500/20 text-rose-400',
};

function isLiveNow(timeStr, dateStr) {
  if (!timeStr || timeStr === '--:--') return false;
  const today = new Date().toISOString().split('T')[0];
  if (dateStr !== today) return false;
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const diff = Math.abs(h * 60 + m - (now.getHours() * 60 + now.getMinutes()));
  return diff <= 30;
}

function buildWeekDays(anchor) {
  const days = [];
  for (let i = -2; i <= 9; i++) days.push(addDays(anchor, i));
  return days;
}

export default function ForexCalendar({ darkMode = true }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const CACHE_KEY = 'znpcv_forex_calendar';
  const CACHE_TTL = 5 * 60 * 1000;

  // Load from localStorage immediately for instant display
  const getCached = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL) return data;
    } catch { /* ignore */ }
    return null;
  };

  const cached = getCached();
  const [allEvents, setAllEvents]       = useState(cached || []);
  const [loading, setLoading]           = useState(!cached);   // only show loader if no cache
  const [refreshing, setRefreshing]     = useState(false);      // subtle background refresh
  const [error, setError]               = useState(null);
  const [lastUpdate, setLastUpdate]     = useState(cached ? new Date() : null);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [impactFilter, setImpactFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [weekOffset, setWeekOffset]     = useState(0);
  const [expandedId, setExpandedId]     = useState(null);

  const anchor = addDays(today, weekOffset * 7);
  const days   = buildWeekDays(anchor);

  const fetchEvents = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('forexCalendar', {});
      const data = res.data?.data || [];
      setAllEvents(data);
      setLastUpdate(new Date());
      // Cache in localStorage
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { /* ignore */ }
    } catch {
      if (!background) setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // If we have cached data, do a silent background refresh; otherwise full load
    fetchEvents(!!cached);
    const iv = setInterval(() => fetchEvents(true), 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const visibleEvents = allEvents
    .filter(e => e.date === selectedDate)
    .filter(e => impactFilter === 'all' || e.impact === impactFilter)
    .filter(e => currencyFilter === 'all' || e.currency === currencyFilter);

  const getCountsForDay = (d) => {
    const ds = d.toISOString().split('T')[0];
    const evts = allEvents.filter(e => e.date === ds);
    return { total: evts.length, high: evts.filter(e => e.impact === 'high').length };
  };

  const currencies = [...new Set(allEvents.map(e => e.currency).filter(Boolean))].sort();

  const todayHighCount = allEvents.filter(e => e.date === todayStr && e.impact === 'high').length;

  // ── theme helpers ──────────────────────────────────────────────────────────
  const bg     = darkMode ? 'bg-black'        : 'bg-white';
  const bgCard = darkMode ? 'bg-zinc-900/80'  : 'bg-zinc-50';
  const border = darkMode ? 'border-zinc-800' : 'border-zinc-200';
  const text   = darkMode ? 'text-white'      : 'text-zinc-900';
  const muted  = darkMode ? 'text-zinc-500'   : 'text-zinc-400';
  const subtle = darkMode ? 'text-zinc-400'   : 'text-zinc-600';

  return (
    <div className={cn('flex flex-col gap-0 rounded-2xl overflow-hidden border-2', border, bg)}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className={cn('flex items-center justify-between px-4 py-3 border-b', border, darkMode ? 'bg-zinc-950' : 'bg-zinc-100')}>
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', darkMode ? 'bg-white' : 'bg-zinc-900')}>
            <Zap className={cn('w-4 h-4', darkMode ? 'text-black' : 'text-white')} />
          </div>
          <div>
            <p className={cn('text-xs font-black tracking-[0.2em]', text)}>ECONOMIC CALENDAR</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[9px] tracking-widest font-bold text-teal-500">FOREXFACTORY + TRADING ECONOMICS</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className={cn('text-[9px] font-bold tabular-nums hidden sm:block', muted)}>
              {lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={() => fetchEvents(false)} disabled={loading}
            className={cn('p-1.5 rounded-lg border transition-colors', border,
              darkMode ? 'text-zinc-600 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-black hover:bg-zinc-200',
              loading && 'opacity-40 cursor-wait')}>
            <RefreshCw className={cn('w-3.5 h-3.5', (loading || refreshing) && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── BACKGROUND REFRESH INDICATOR ────────────────────────────────── */}
      <AnimatePresence>
        {refreshing && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
            style={{ transformOrigin: 'left' }}
            className="h-0.5 bg-teal-500/70 w-full" />
        )}
      </AnimatePresence>

      {/* ── TODAY HIGH-IMPACT BANNER ─────────────────────────────────────── */}
      <AnimatePresence>
        {todayHighCount > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-black tracking-widest text-rose-400">
              {todayHighCount} HIGH IMPACT EVENT{todayHighCount > 1 ? 'S' : ''} TODAY
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WEEK NAVIGATION + DAY STRIP ─────────────────────────────────── */}
      <div className={cn('px-3 py-3 border-b', border)}>
        {/* Week nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setWeekOffset(w => w - 1)}
            className={cn('p-1 rounded-lg transition-colors', darkMode ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-black hover:bg-zinc-200')}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className={cn('text-[10px] font-black tracking-widest', subtle)}>
            {weekOffset === 0 ? 'THIS WEEK' : weekOffset === 1 ? 'NEXT WEEK' : weekOffset > 0 ? `+${weekOffset} WEEKS` : `${weekOffset} WEEKS`}
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)}
            className={cn('p-1 rounded-lg transition-colors', darkMode ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-black hover:bg-zinc-200')}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {days.map(day => {
            const ds      = day.toISOString().split('T')[0];
            const isToday = ds === todayStr;
            const isSel   = ds === selectedDate;
            const { total, high } = getCountsForDay(day);
            const dayLabel = format(day, 'EEE', { locale: de }).toUpperCase();

            return (
              <button key={ds} onClick={() => setSelectedDate(ds)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border-2 min-w-[52px] transition-all flex-shrink-0',
                  isSel
                    ? darkMode ? 'bg-white border-white text-black' : 'bg-zinc-900 border-zinc-900 text-white'
                    : isToday
                      ? 'border-teal-500/50 bg-teal-500/5 text-teal-400'
                      : cn(border, darkMode ? 'bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100')
                )}>
                <span className={cn('text-[9px] font-black tracking-widest', isSel ? (darkMode ? 'text-black' : 'text-white') : '')}>
                  {dayLabel}
                </span>
                <span className={cn('text-lg font-black leading-none', isSel ? (darkMode ? 'text-black' : 'text-white') : isToday ? 'text-teal-400' : '')}>
                  {format(day, 'd')}
                </span>
                {total > 0 ? (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {high > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    <span className={cn('text-[9px] font-bold', isSel ? (darkMode ? 'text-black/60' : 'text-white/60') : muted)}>
                      {total}
                    </span>
                  </div>
                ) : (
                  <span className={cn('text-[9px]', muted)}>–</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTERS ─────────────────────────────────────────────────────── */}
      <div className={cn('flex items-center gap-2 px-4 py-2 border-b overflow-x-auto scrollbar-hide', border)}>
        {/* Impact filters */}
        {['all', 'high', 'medium', 'low'].map(f => (
          <button key={f} onClick={() => setImpactFilter(f)}
            className={cn('px-2.5 py-1 text-[10px] font-black tracking-widest rounded-lg border flex-shrink-0 transition-all',
              impactFilter === f
                ? f === 'high'   ? 'bg-rose-500 border-rose-500 text-white'
                : f === 'medium' ? 'bg-amber-400 border-amber-400 text-black'
                : f === 'low'    ? 'bg-zinc-600 border-zinc-600 text-white'
                : darkMode       ? 'bg-white border-white text-black' : 'bg-zinc-900 border-zinc-900 text-white'
                : cn(border, muted, darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')
            )}>
            {f === 'all' ? 'ALL' : f.toUpperCase()}
          </button>
        ))}

        {currencies.length > 0 && (
          <>
            <div className={cn('w-px h-4 flex-shrink-0', darkMode ? 'bg-zinc-800' : 'bg-zinc-300')} />
            <select value={currencyFilter} onChange={e => setCurrencyFilter(e.target.value)}
              className={cn('text-[10px] font-black rounded-lg border px-2 py-1 outline-none cursor-pointer flex-shrink-0',
                border, darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black')}>
              <option value="all">ALL CURRENCIES</option>
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </>
        )}
      </div>

      {/* ── EVENT LIST ──────────────────────────────────────────────────── */}
      <div className="overflow-y-auto max-h-[520px] scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-teal-500"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
              ))}
            </div>
            <span className={cn('text-[10px] tracking-widest font-bold', muted)}>LOADING LIVE DATA…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
            <AlertTriangle className={cn('w-8 h-8', muted)} />
            <p className={cn('text-sm font-sans', muted)}>Could not load calendar data.</p>
            <button onClick={fetchEvents} className="text-teal-500 text-xs font-bold hover:underline">Retry</button>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <span className="text-3xl">📅</span>
            <p className={cn('text-sm font-bold', subtle)}>No events for this day</p>
            <p className={cn('text-[11px]', muted)}>Select another date or change filters</p>
          </div>
        ) : (
          <div>
            {visibleEvents.map((evt, idx) => {
              const imp    = IMPACT[evt.impact] || IMPACT.low;
              const isLive = isLiveNow(evt.time, evt.date);
              const curClr = CURRENCY_COLORS[evt.currency] || 'bg-zinc-800 text-zinc-400';
              const hasRes = evt.actual !== null && evt.actual !== '';
              const beat   = hasRes && evt.forecast && parseFloat(evt.actual) > parseFloat(evt.forecast);
              const miss   = hasRes && evt.forecast && parseFloat(evt.actual) < parseFloat(evt.forecast);
              const isOpen = expandedId === evt.id;

              return (
                <motion.div key={evt.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className={cn(
                    'border-b last:border-b-0 transition-colors cursor-pointer',
                    border,
                    isLive
                      ? 'bg-teal-500/8 border-l-4 border-l-teal-500'
                      : darkMode ? 'hover:bg-zinc-900/60' : 'hover:bg-zinc-50',
                    isOpen && (darkMode ? 'bg-zinc-900/80' : 'bg-zinc-100/80')
                  )}
                  onClick={() => setExpandedId(isOpen ? null : evt.id)}>

                  {/* Main row */}
                  <div className="flex items-start gap-3 px-4 py-3">
                    {/* Time col */}
                    <div className="flex flex-col items-center gap-2 min-w-[42px] pt-0.5">
                      <span className={cn('text-xs font-black tabular-nums', isLive ? 'text-teal-400' : subtle)}>
                        {evt.time || '--:--'}
                      </span>
                      {/* Impact bar */}
                      <div className={cn('w-1 rounded-full', imp.bar, isLive ? 'h-4' : 'h-3')} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md', curClr)}>
                          {evt.currency}
                        </span>
                        <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded-md border', imp.badge)}>
                          {imp.label}
                        </span>
                        {isLive && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-teal-500 text-black animate-pulse">
                            LIVE
                          </span>
                        )}
                        {evt.source === 'te' && (
                          <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded border', border, muted)}>TE</span>
                        )}
                      </div>
                      <p className={cn('text-sm font-bold leading-snug', text)}>{evt.event}</p>
                    </div>

                    {/* Values col */}
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-right min-w-[72px]">
                      {hasRes ? (
                        <span className={cn('text-sm font-black tabular-nums',
                          beat ? 'text-teal-400' : miss ? 'text-rose-400' : text)}>
                          {evt.actual}{beat ? ' ▲' : miss ? ' ▼' : ''}
                        </span>
                      ) : (
                        <span className={cn('text-xs font-bold', muted)}>—</span>
                      )}
                      {evt.forecast && (
                        <div className="flex items-center gap-1">
                          <span className={cn('text-[9px]', muted)}>F</span>
                          <span className={cn('text-[10px] font-bold tabular-nums', subtle)}>{evt.forecast}</span>
                        </div>
                      )}
                      {evt.previous && (
                        <div className="flex items-center gap-1">
                          <span className={cn('text-[9px]', muted)}>P</span>
                          <span className={cn('text-[9px] tabular-nums', muted)}>{evt.previous}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className={cn('mx-4 mb-3 rounded-xl border p-3 grid grid-cols-3 gap-3', border, bgCard)}>
                          {[
                            { label: 'ACTUAL',   val: evt.actual,   color: beat ? 'text-teal-400' : miss ? 'text-rose-400' : text },
                            { label: 'FORECAST', val: evt.forecast, color: subtle },
                            { label: 'PREVIOUS', val: evt.previous, color: muted },
                          ].map(({ label, val, color }) => (
                            <div key={label} className="text-center">
                              <p className={cn('text-[9px] font-black tracking-widest mb-1', muted)}>{label}</p>
                              <p className={cn('text-sm font-black tabular-nums', color)}>{val || '—'}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <div className={cn('flex items-center justify-between px-4 py-2 border-t', border, darkMode ? 'bg-zinc-950' : 'bg-zinc-100')}>
        <span className={cn('text-[9px] font-bold tracking-widest', muted)}>
          {visibleEvents.length} EVENT{visibleEvents.length !== 1 ? 'S' : ''} · {allEvents.length} TOTAL
        </span>
        <div className="flex items-center gap-3">
          {['high', 'medium', 'low'].map(k => (
            <div key={k} className="flex items-center gap-1">
              <span className={cn('w-1.5 h-1.5 rounded-full', IMPACT[k].dot)} />
              <span className={cn('text-[9px] font-bold', muted)}>{IMPACT[k].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}