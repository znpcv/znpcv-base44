import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

const IMPACT = {
  high:   { label: 'HOCH',   color: 'text-rose-400',   bg: 'bg-rose-500',   pill: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
  medium: { label: 'MITTEL', color: 'text-amber-400',  bg: 'bg-amber-400',  pill: 'bg-amber-400/15 text-amber-400 border border-amber-400/30' },
  low:    { label: 'GERING', color: 'text-zinc-500',   bg: 'bg-zinc-600',   pill: 'bg-zinc-800 text-zinc-500 border border-zinc-700' },
};

const CURRENCY_COLORS = {
  USD: 'text-blue-400',   EUR: 'text-yellow-400', GBP: 'text-purple-400',
  JPY: 'text-red-400',    AUD: 'text-green-400',  CAD: 'text-orange-400',
  CHF: 'text-pink-400',   NZD: 'text-teal-400',   CNY: 'text-rose-400',
};

const CACHE_KEY = 'znpcv_forex_calendar';
const CACHE_TTL = 5 * 60 * 1000;

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
  } catch { /* ignore */ }
  return null;
}

function isLiveNow(timeStr, dateStr) {
  if (!timeStr || timeStr === '--:--') return false;
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr !== todayStr) return false;
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const diff = h * 60 + m - (now.getHours() * 60 + now.getMinutes());
  return diff >= -15 && diff <= 60; // within 15min past or 60min future
}

function buildDays(today, weekOffset) {
  const anchor = addDays(today, weekOffset * 7);
  const days = [];
  for (let i = -2; i <= 9; i++) days.push(addDays(anchor, i));
  return days;
}

export default function ForexCalendar({ darkMode = true }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const cached = getCached();
  const [allEvents, setAllEvents]       = useState(cached || []);
  const [loading, setLoading]           = useState(!cached);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [lastUpdate, setLastUpdate]     = useState(cached ? new Date() : null);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [impactFilter, setImpactFilter] = useState('all');
  const [weekOffset, setWeekOffset]     = useState(0);
  const [expandedId, setExpandedId]     = useState(null);

  const days = buildDays(today, weekOffset);

  const fetchEvents = useCallback(async (background = false) => {
    background ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('forexCalendar', {});
      const data = res.data?.data || [];
      setAllEvents(data);
      setLastUpdate(new Date());
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { /* ignore */ }
    } catch {
      if (!background) setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(!!cached);
    const iv = setInterval(() => fetchEvents(true), 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // Auto-fallback: if selected filter yields nothing, show all
  const eventsForDay = allEvents.filter(e => e.date === selectedDate);
  const filtered = eventsForDay.filter(e => impactFilter === 'all' || e.impact === impactFilter);
  const visibleEvents = filtered.length > 0 ? filtered : eventsForDay;

  const getDay = (d) => {
    const ds = d.toISOString().split('T')[0];
    const evts = allEvents.filter(e => e.date === ds);
    return { ds, total: evts.length, high: evts.filter(e => e.impact === 'high').length, med: evts.filter(e => e.impact === 'medium').length };
  };

  // theme
  const th = {
    bg:     darkMode ? 'bg-zinc-950' : 'bg-white',
    bgAlt:  darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text:   darkMode ? 'text-white'   : 'text-zinc-900',
    muted:  darkMode ? 'text-zinc-500' : 'text-zinc-400',
    sub:    darkMode ? 'text-zinc-400' : 'text-zinc-600',
    hover:  darkMode ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-100',
  };

  return (
    <div className={cn('rounded-2xl overflow-hidden border', th.border, th.bg)}>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className={cn('flex items-center justify-between px-4 py-3 border-b', th.border, darkMode ? 'bg-black' : 'bg-zinc-100')}>
        <div className="flex items-center gap-2.5">
          <Calendar className={cn('w-4 h-4', th.sub)} />
          <span className={cn('text-xs font-black tracking-[0.15em]', th.text)}>ECONOMIC CALENDAR</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[9px] font-bold text-teal-500 tracking-widest">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className={cn('text-[10px] tabular-nums', th.muted)}>
              {lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={() => fetchEvents(false)} disabled={loading}
            className={cn('p-1.5 rounded-lg border transition-all', th.border, th.muted, th.hover, loading && 'opacity-40')}>
            <RefreshCw className={cn('w-3.5 h-3.5', (loading || refreshing) && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* refresh bar */}
      <AnimatePresence>
        {refreshing && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
            style={{ transformOrigin: 'left' }} className="h-0.5 bg-teal-500 w-full" />
        )}
      </AnimatePresence>

      {/* ── WEEK NAV ───────────────────────────────────────────────── */}
      <div className={cn('border-b', th.border)}>
        {/* Week label + arrows */}
        <div className={cn('flex items-center justify-between px-4 py-2', darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50')}>
          <button onClick={() => setWeekOffset(w => w - 1)}
            className={cn('p-1 rounded-md transition-colors', th.muted, th.hover)}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => { setWeekOffset(0); setSelectedDate(todayStr); }}
            className={cn('text-[10px] font-black tracking-widest transition-colors', th.sub, th.hover, 'px-3 py-1 rounded-md')}>
            {weekOffset === 0 ? 'DIESE WOCHE' : weekOffset === 1 ? 'NÄCHSTE WOCHE' : weekOffset > 0 ? `+${weekOffset} WOCHEN` : `${weekOffset} WOCHEN`}
          </button>
          <button onClick={() => setWeekOffset(w => w + 1)}
            className={cn('p-1 rounded-md transition-colors', th.muted, th.hover)}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day pills */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide px-3 pb-3 pt-1">
          {days.map(day => {
            const { ds, total, high, med } = getDay(day);
            const isTd  = ds === todayStr;
            const isSel = ds === selectedDate;
            const dow   = format(day, 'EEE', { locale: de }).toUpperCase().slice(0, 2);
            const dom   = format(day, 'd');

            return (
              <button key={ds} onClick={() => setSelectedDate(ds)}
                className={cn(
                  'flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border min-w-[46px] flex-shrink-0 transition-all',
                  isSel
                    ? darkMode ? 'bg-white border-white' : 'bg-zinc-900 border-zinc-900'
                    : isTd
                      ? 'border-teal-500/60 bg-teal-500/8'
                      : cn(th.border, th.bgAlt, th.hover)
                )}>
                <span className={cn('text-[9px] font-bold tracking-wider',
                  isSel ? (darkMode ? 'text-black' : 'text-white') : isTd ? 'text-teal-400' : th.muted)}>
                  {dow}
                </span>
                <span className={cn('text-base font-black leading-none',
                  isSel ? (darkMode ? 'text-black' : 'text-white') : isTd ? 'text-teal-400' : th.text)}>
                  {dom}
                </span>
                {/* impact dots */}
                <div className="flex gap-0.5">
                  {high > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title={`${high} high`} />}
                  {med  > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title={`${med} medium`} />}
                  {total === 0 && <span className={cn('text-[8px]', th.muted)}>–</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── IMPACT FILTER TABS ─────────────────────────────────────── */}
      <div className={cn('flex items-center gap-1 px-4 py-2 border-b', th.border)}>
        {[
          { key: 'high',   label: '🔴 Hoch' },
          { key: 'medium', label: '🟡 Mittel' },
          { key: 'all',    label: 'Alle' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setImpactFilter(key)}
            className={cn(
              'px-3 py-1 rounded-lg text-[10px] font-black tracking-wider transition-all',
              impactFilter === key
                ? darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'
                : cn(th.muted, th.hover, 'border', th.border)
            )}>
            {label}
          </button>
        ))}
        <span className={cn('ml-auto text-[10px] font-bold', th.muted)}>
          {visibleEvents.length} Event{visibleEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── EVENT TABLE ────────────────────────────────────────────── */}
      <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-teal-500"
                  animate={{ y: [0,-8,0] }} transition={{ duration: 0.6, delay: i*0.15, repeat: Infinity }} />
              ))}
            </div>
            <span className={cn('text-[10px] tracking-widest font-bold', th.muted)}>LADE DATEN…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
            <AlertTriangle className={cn('w-7 h-7', th.muted)} />
            <p className={cn('text-sm', th.muted)}>Daten konnten nicht geladen werden.</p>
            <button onClick={() => fetchEvents(false)} className="text-teal-500 text-xs font-bold hover:underline">Erneut versuchen</button>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14">
            <span className="text-3xl">📅</span>
            <p className={cn('text-sm font-bold', th.sub)}>Keine Events an diesem Tag</p>
            <p className={cn('text-[11px]', th.muted)}>Anderen Tag wählen oder Filter ändern</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className={cn('grid grid-cols-[56px_1fr_90px] gap-0 border-b px-4 py-1.5', th.border, darkMode ? 'bg-zinc-900/40' : 'bg-zinc-50')}>
              <span className={cn('text-[9px] font-black tracking-widest', th.muted)}>ZEIT</span>
              <span className={cn('text-[9px] font-black tracking-widest', th.muted)}>EVENT</span>
              <span className={cn('text-[9px] font-black tracking-widest text-right', th.muted)}>IST / PRO / VOR</span>
            </div>

            {visibleEvents.map((evt, idx) => {
              const imp    = IMPACT[evt.impact] || IMPACT.low;
              const live   = isLiveNow(evt.time, evt.date);
              const curClr = CURRENCY_COLORS[evt.currency] || th.sub;
              const hasRes = evt.actual !== null && evt.actual !== undefined && evt.actual !== '';
              const numA   = parseFloat(evt.actual);
              const numF   = parseFloat(evt.forecast);
              const beat   = hasRes && !isNaN(numA) && !isNaN(numF) && numA > numF;
              const miss   = hasRes && !isNaN(numA) && !isNaN(numF) && numA < numF;
              const isOpen = expandedId === evt.id;

              return (
                <motion.div key={evt.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.015, 0.3) }}
                  onClick={() => setExpandedId(isOpen ? null : evt.id)}
                  className={cn(
                    'border-b last:border-b-0 cursor-pointer transition-colors',
                    th.border,
                    live ? (darkMode ? 'bg-teal-950/40 border-l-2 border-l-teal-500' : 'bg-teal-50 border-l-2 border-l-teal-500')
                         : (isOpen ? th.bgAlt : th.hover)
                  )}>

                  {/* Main row */}
                  <div className="grid grid-cols-[56px_1fr_90px] gap-0 px-4 py-2.5 items-center">

                    {/* TIME + IMPACT */}
                    <div className="flex flex-col items-start gap-1">
                      <span className={cn('text-xs font-black tabular-nums', live ? 'text-teal-400' : th.sub)}>
                        {evt.time || '–'}
                      </span>
                      <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black', imp.pill)}>
                        <span className={cn('w-1 h-1 rounded-full inline-block', imp.bg)} />
                        {imp.label}
                      </div>
                      {live && <span className="text-[8px] font-black text-teal-400 tracking-wider animate-pulse">● LIVE</span>}
                    </div>

                    {/* CURRENCY + EVENT NAME */}
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={cn('text-xs font-black', curClr)}>{evt.currency}</span>
                      </div>
                      <p className={cn('text-sm font-semibold leading-snug truncate', th.text)}>{evt.event}</p>
                    </div>

                    {/* VALUES */}
                    <div className="text-right">
                      {hasRes ? (
                        <span className={cn('text-sm font-black tabular-nums block',
                          beat ? 'text-teal-400' : miss ? 'text-rose-400' : th.text)}>
                          {evt.actual}{beat ? '▲' : miss ? '▼' : ''}
                        </span>
                      ) : (
                        <span className={cn('text-sm font-black', th.muted)}>–</span>
                      )}
                      {evt.forecast && (
                        <span className={cn('text-[10px] tabular-nums block', th.muted)}>
                          <span className="opacity-60">P</span> {evt.forecast}
                        </span>
                      )}
                      {evt.previous && (
                        <span className={cn('text-[9px] tabular-nums block', th.muted, 'opacity-60')}>
                          <span>V</span> {evt.previous}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                        className="overflow-hidden">
                        <div className={cn('mx-4 mb-3 rounded-xl border grid grid-cols-3 divide-x', th.border,
                          darkMode ? 'bg-zinc-900 divide-zinc-800' : 'bg-zinc-100 divide-zinc-200')}>
                          {[
                            { label: 'AKTUELL', val: evt.actual, color: beat ? 'text-teal-400' : miss ? 'text-rose-400' : th.text },
                            { label: 'PROGNOSE', val: evt.forecast, color: th.sub },
                            { label: 'VORHERIG', val: evt.previous, color: th.muted },
                          ].map(({ label, val, color }) => (
                            <div key={label} className="flex flex-col items-center py-3 gap-1">
                              <span className={cn('text-[9px] font-black tracking-widest', th.muted)}>{label}</span>
                              <span className={cn('text-base font-black tabular-nums', color)}>{val || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* ── FOOTER LEGEND ──────────────────────────────────────────── */}
      <div className={cn('flex items-center justify-between px-4 py-2 border-t', th.border, darkMode ? 'bg-black/50' : 'bg-zinc-50')}>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> <span className={cn('text-[9px] font-bold', th.muted)}>Hoch</span>
          <span className="w-2 h-2 rounded-full bg-amber-400" /> <span className={cn('text-[9px] font-bold', th.muted)}>Mittel</span>
          <span className="w-2 h-2 rounded-full bg-zinc-600" /> <span className={cn('text-[9px] font-bold', th.muted)}>Gering</span>
        </div>
        <span className={cn('text-[9px]', th.muted)}>
          P = Prognose · V = Vorherig
        </span>
      </div>
    </div>
  );
}