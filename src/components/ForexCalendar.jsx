import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, Bell, BellOff, Timer } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { de, enUS, fr, es, zhCN, ar, ja, pt, hi } from 'date-fns/locale';
import { useLanguage } from '@/components/LanguageContext';

// ── i18n ─────────────────────────────────────────────────────────
const CAL_T = {
  de: {
    loading: 'LADE DATEN…', error: 'Daten konnten nicht geladen werden.',
    retry: 'Erneut versuchen', noEvents: 'Keine Events an diesem Tag',
    noEventsHint: 'Anderen Tag wählen oder Filter ändern',
    colTime: 'ZEIT', colCountry: 'LAND', colEvent: 'EVENT',
    colImpact: 'IMPACT', colForecast: 'FORECAST', colActual: 'ACTUAL',
    high: 'HIGH', medium: 'MED', low: 'LOW',
    allFilter: 'ALLE', events: 'Event', eventsPlural: 'Events',
    live: 'LIVE', nowLabel: 'JETZT',
    notifBody: (diff, time) => `Startet in ${diff} Minuten (${time} Uhr)`,
    prevWeek: '‹', nextWeekBtn: '›', today: 'HEUTE',
  },
  en: {
    loading: 'LOADING…', error: 'Could not load data.',
    retry: 'Try again', noEvents: 'No events on this day',
    noEventsHint: 'Choose another day or change filter',
    colTime: 'TIME', colCountry: 'COUNTRY', colEvent: 'EVENT',
    colImpact: 'IMPACT', colForecast: 'FORECAST', colActual: 'ACTUAL',
    high: 'HIGH', medium: 'MED', low: 'LOW',
    allFilter: 'ALL', events: 'Event', eventsPlural: 'Events',
    live: 'LIVE', nowLabel: 'NOW',
    notifBody: (diff, time) => `Starts in ${diff} minutes (${time})`,
    prevWeek: '‹', nextWeekBtn: '›', today: 'TODAY',
  },
  es: {
    loading: 'CARGANDO…', error: 'No se pudieron cargar los datos.',
    retry: 'Reintentar', noEvents: 'Sin eventos este día',
    noEventsHint: 'Elige otro día o cambia el filtro',
    colTime: 'HORA', colCountry: 'PAÍS', colEvent: 'EVENTO',
    colImpact: 'IMPACTO', colForecast: 'PRONÓSTICO', colActual: 'ACTUAL',
    high: 'ALTO', medium: 'MED', low: 'BAJO',
    allFilter: 'TODOS', events: 'Evento', eventsPlural: 'Eventos',
    live: 'VIVO', nowLabel: 'AHORA',
    notifBody: (diff, time) => `Empieza en ${diff} minutos (${time})`,
    prevWeek: '‹', nextWeekBtn: '›', today: 'HOY',
  },
  fr: {
    loading: 'CHARGEMENT…', error: 'Impossible de charger les données.',
    retry: 'Réessayer', noEvents: 'Aucun événement ce jour',
    noEventsHint: 'Choisir un autre jour ou changer le filtre',
    colTime: 'HEURE', colCountry: 'PAYS', colEvent: 'ÉVÉNEMENT',
    colImpact: 'IMPACT', colForecast: 'PRÉVISION', colActual: 'ACTUEL',
    high: 'ÉLEVÉ', medium: 'MOY', low: 'FAIBLE',
    allFilter: 'TOUS', events: 'Événement', eventsPlural: 'Événements',
    live: 'EN DIRECT', nowLabel: 'MAINTENANT',
    notifBody: (diff, time) => `Commence dans ${diff} minutes (${time})`,
    prevWeek: '‹', nextWeekBtn: '›', today: "AUJOURD'HUI",
  },
  zh: {
    loading: '加载中…', error: '无法加载数据。',
    retry: '重试', noEvents: '当天无事件',
    noEventsHint: '选择其他日期或更改筛选',
    colTime: '时间', colCountry: '国家', colEvent: '事件',
    colImpact: '影响', colForecast: '预测', colActual: '实际',
    high: '高', medium: '中', low: '低',
    allFilter: '全部', events: '事件', eventsPlural: '事件',
    live: '直播', nowLabel: '现在',
    notifBody: (diff, time) => `${diff}分钟后开始 (${time})`,
    prevWeek: '‹', nextWeekBtn: '›', today: '今天',
  },
  ar: {
    loading: 'جارٍ التحميل…', error: 'تعذّر تحميل البيانات.',
    retry: 'إعادة المحاولة', noEvents: 'لا توجد أحداث',
    noEventsHint: 'اختر يومًا آخر أو غيّر الفلتر',
    colTime: 'الوقت', colCountry: 'البلد', colEvent: 'الحدث',
    colImpact: 'التأثير', colForecast: 'التوقع', colActual: 'الفعلي',
    high: 'مرتفع', medium: 'متوسط', low: 'منخفض',
    allFilter: 'الكل', events: 'حدث', eventsPlural: 'أحداث',
    live: 'مباشر', nowLabel: 'الآن',
    notifBody: (diff, time) => `يبدأ خلال ${diff} دقيقة (${time})`,
    prevWeek: '‹', nextWeekBtn: '›', today: 'اليوم',
  },
  ja: {
    loading: '読み込み中…', error: 'データを読み込めませんでした。',
    retry: '再試行', noEvents: 'この日のイベントなし',
    noEventsHint: '別の日を選ぶかフィルターを変更',
    colTime: '時刻', colCountry: '国', colEvent: 'イベント',
    colImpact: '影響', colForecast: '予測', colActual: '実績',
    high: '高', medium: '中', low: '低',
    allFilter: '全て', events: 'イベント', eventsPlural: 'イベント',
    live: 'ライブ', nowLabel: '今',
    notifBody: (diff, time) => `${diff}分後に開始 (${time})`,
    prevWeek: '‹', nextWeekBtn: '›', today: '今日',
  },
  pt: {
    loading: 'CARREGANDO…', error: 'Não foi possível carregar os dados.',
    retry: 'Tentar novamente', noEvents: 'Nenhum evento neste dia',
    noEventsHint: 'Escolha outro dia ou mude o filtro',
    colTime: 'HORA', colCountry: 'PAÍS', colEvent: 'EVENTO',
    colImpact: 'IMPACTO', colForecast: 'PREVISÃO', colActual: 'REAL',
    high: 'ALTO', medium: 'MED', low: 'BAIXO',
    allFilter: 'TODOS', events: 'Evento', eventsPlural: 'Eventos',
    live: 'AO VIVO', nowLabel: 'AGORA',
    notifBody: (diff, time) => `Começa em ${diff} minutos (${time})`,
    prevWeek: '‹', nextWeekBtn: '›', today: 'HOJE',
  },
  hi: {
    loading: 'लोड हो रहा है…', error: 'डेटा लोड नहीं हो सका।',
    retry: 'पुनः प्रयास', noEvents: 'इस दिन कोई इवेंट नहीं',
    noEventsHint: 'दूसरा दिन चुनें या फ़िल्टर बदलें',
    colTime: 'समय', colCountry: 'देश', colEvent: 'इवेंट',
    colImpact: 'प्रभाव', colForecast: 'अनुमान', colActual: 'वास्तविक',
    high: 'उच्च', medium: 'मध्यम', low: 'कम',
    allFilter: 'सभी', events: 'इवेंट', eventsPlural: 'इवेंट',
    live: 'लाइव', nowLabel: 'अभी',
    notifBody: (diff, time) => `${diff} मिनट में शुरू (${time})`,
    prevWeek: '‹', nextWeekBtn: '›', today: 'आज',
  },
  fa: {
    loading: 'در حال بارگذاری…', error: 'بارگذاری داده‌ها امکان‌پذیر نبود.',
    retry: 'تلاش مجدد', noEvents: 'رویدادی در این روز وجود ندارد',
    noEventsHint: 'روز دیگری انتخاب کنید یا فیلتر را تغییر دهید',
    colTime: 'زمان', colCountry: 'کشور', colEvent: 'رویداد',
    colImpact: 'تأثیر', colForecast: 'پیش‌بینی', colActual: 'واقعی',
    high: 'بالا', medium: 'متوسط', low: 'پایین',
    allFilter: 'همه', events: 'رویداد', eventsPlural: 'رویداد',
    live: 'زنده', nowLabel: 'اکنون',
    notifBody: (diff, time) => `در ${diff} دقیقه شروع می‌شود (${time})`,
    prevWeek: '‹', nextWeekBtn: '›', today: 'امروز',
  },
};

const DATE_LOCALES = { de, en: enUS, es, fr, zh: zhCN, ar, ja, pt, hi, fa: enUS };
function getCalT(lang) { return CAL_T[lang] || CAL_T.en; }

// ── Currency flags ────────────────────────────────────────────────
const CURRENCY_FLAG = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺',
  CAD: '🇨🇦', CHF: '🇨🇭', NZD: '🇳🇿', CNY: '🇨🇳', CNH: '🇨🇳',
  SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰', SGD: '🇸🇬', HKD: '🇭🇰',
  MXN: '🇲🇽', BRL: '🇧🇷', INR: '🇮🇳', KRW: '🇰🇷', ZAR: '🇿🇦',
  XAU: '🥇',
};

// ── Constants ─────────────────────────────────────────────────────
const CACHE_KEY = 'znpcv_forex_calendar';
const CACHE_TTL = 5 * 60 * 1000;
const NOTIF_ALERTED_KEY = 'znpcv_cal_alerted';

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
  } catch { /* ignore */ }
  return null;
}

function getEventMinutes(timeStr) {
  if (!timeStr || timeStr === '--:--') return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function getMinutesUntil(timeStr, dateStr) {
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr !== todayStr) return null;
  const evtMin = getEventMinutes(timeStr);
  if (evtMin === null) return null;
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  return evtMin - nowMin;
}

function isLiveNow(timeStr, dateStr) {
  const mins = getMinutesUntil(timeStr, dateStr);
  if (mins === null) return false;
  return mins >= -15 && mins <= 60;
}

function buildDays(today, weekOffset) {
  const anchor = addDays(today, weekOffset * 7);
  const days = [];
  for (let i = 0; i <= 6; i++) {
    const d = addDays(anchor, i - anchor.getDay() + 1); // Mon-Sun
    days.push(d);
  }
  return days;
}

function getSurprise(actual, forecast) {
  if (!actual || !forecast) return null;
  const a = parseFloat(actual);
  const f = parseFloat(forecast);
  if (isNaN(a) || isNaN(f)) return null;
  const diff = a - f;
  if (Math.abs(diff) < 0.0001) return null;
  return { beat: diff > 0 };
}

function getAlerted() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIF_ALERTED_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveAlerted(set) {
  try { localStorage.setItem(NOTIF_ALERTED_KEY, JSON.stringify([...set])); } catch { /* ignore */ }
}

// ── Impact config ─────────────────────────────────────────────────
const IMPACT_STYLE = {
  high:   { label: 'HIGH', bg: 'bg-rose-800',   text: 'text-rose-200',   dot: 'bg-rose-500' },
  medium: { label: 'MED',  bg: 'bg-yellow-800', text: 'text-yellow-200', dot: 'bg-yellow-400' },
  low:    { label: 'LOW',  bg: 'bg-zinc-700',   text: 'text-zinc-300',   dot: 'bg-zinc-500' },
};

// ── Countdown badge ───────────────────────────────────────────────
function CountdownBadge({ timeStr, dateStr, nowLabel }) {
  const [mins, setMins] = useState(() => getMinutesUntil(timeStr, dateStr));
  useEffect(() => {
    const iv = setInterval(() => setMins(getMinutesUntil(timeStr, dateStr)), 30000);
    return () => clearInterval(iv);
  }, [timeStr, dateStr]);
  if (mins === null || mins < 0 || mins > 180) return null;
  const label = mins === 0 ? nowLabel : mins < 60 ? `${mins}min` : `${Math.floor(mins / 60)}h`;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold',
      mins <= 15 ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-teal-500/15 text-teal-400'
    )}>
      <Timer className="w-2.5 h-2.5" />{label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function ForexCalendar({ darkMode = true }) {
  const { language } = useLanguage();
  const ct = getCalT(language);
  const dateLocale = DATE_LOCALES[language] || enUS;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const cached = getCached();
  const [allEvents, setAllEvents]       = useState(cached || []);
  const [loading, setLoading]           = useState(!cached);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [impactFilter, setImpactFilter] = useState('high');
  const [weekOffset, setWeekOffset]     = useState(0);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const alertedRef = useRef(getAlerted());

  const days = buildDays(today, weekOffset);

  const fetchEvents = useCallback(async (background = false) => {
    background ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('forexCalendar', {});
      const data = res.data?.data || [];
      setAllEvents(data);
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

  // Notification check
  useEffect(() => {
    if (!notifEnabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const check = () => {
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
      allEvents.filter(e => e.date === todayStr && e.impact === 'high').forEach(e => {
        const evtMin = getEventMinutes(e.time);
        if (evtMin === null) return;
        const diff = evtMin - nowMin;
        if (diff === 5 || diff === 15) {
          const key = `${e.id}-${diff}`;
          if (!alertedRef.current.has(key)) {
            alertedRef.current.add(key);
            saveAlerted(alertedRef.current);
            new Notification(`⚡ ${e.currency} — ${e.event}`, { body: ct.notifBody(diff, e.time), icon: '/favicon.ico' });
          }
        }
      });
    };
    check();
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, [notifEnabled, allEvents, todayStr]);

  const toggleNotifications = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') setNotifEnabled(true);
    } else if (Notification.permission === 'granted') {
      setNotifEnabled(n => !n);
    }
  };

  // Filter events
  const eventsForDay = allEvents.filter(e => e.date === selectedDate);
  const visibleEvents = impactFilter === 'all'
    ? eventsForDay
    : eventsForDay.filter(e => e.impact === impactFilter);

  // Selected date label
  const selDateObj = new Date(selectedDate + 'T00:00:00');
  const dateLabel = format(selDateObj, 'EEEE · d. MMMM yyyy', { locale: dateLocale }).toUpperCase();

  const th = {
    bg:     darkMode ? 'bg-[#1a1a1a]' : 'bg-white',
    bgRow:  darkMode ? 'bg-[#222]' : 'bg-zinc-50',
    bgHead: darkMode ? 'bg-[#1a1a1a]' : 'bg-zinc-100',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text:   darkMode ? 'text-white'   : 'text-zinc-900',
    muted:  darkMode ? 'text-zinc-500' : 'text-zinc-400',
    sub:    darkMode ? 'text-zinc-400' : 'text-zinc-600',
    hover:  darkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-100',
    rowSep: darkMode ? 'border-zinc-800/60' : 'border-zinc-100',
  };

  const filterButtons = [
    { key: 'high',   label: ct.high },
    { key: 'medium', label: ct.medium },
    { key: 'low',    label: ct.low },
  ];

  return (
    <div className={cn('rounded-xl overflow-hidden', th.bg, 'border', th.border)}>

      {/* ── TOP BAR: Date + Filters ── */}
      <div className={cn('flex items-center justify-between px-4 py-3', th.bgHead)}>
        <span className={cn('text-xs font-bold tracking-widest', th.muted)}>{dateLabel}</span>
        <div className="flex items-center gap-2">
          {filterButtons.map(({ key, label }) => {
            const imp = IMPACT_STYLE[key];
            const active = impactFilter === key;
            return (
              <button key={key} onClick={() => setImpactFilter(active ? 'all' : key)}
                className={cn(
                  'px-3 py-1 rounded-full text-[11px] font-black tracking-wider transition-all',
                  active
                    ? key === 'high'   ? 'bg-blue-500 text-white'
                    : key === 'medium' ? 'bg-zinc-600 text-white'
                    : 'bg-zinc-700 text-white'
                    : darkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                               : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300'
                )}>
                {label}
              </button>
            );
          })}
          {'Notification' in window && (
            <button onClick={toggleNotifications}
              className={cn('p-1.5 rounded-full transition-all ml-1',
                notifEnabled ? 'text-amber-400' : cn(th.muted, th.hover))}>
              {notifEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            </button>
          )}
          <button onClick={() => fetchEvents(false)} disabled={loading}
            className={cn('p-1.5 rounded-full transition-all', th.muted, th.hover, loading && 'opacity-40')}>
            <RefreshCw className={cn('w-3.5 h-3.5', (loading || refreshing) && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── DAY TABS ── */}
      <div className={cn('flex border-b overflow-x-auto scrollbar-hide', th.border, darkMode ? 'bg-[#161616]' : 'bg-zinc-50')}>
        {days.map(day => {
          const ds = day.toISOString().split('T')[0];
          const isTd  = ds === todayStr;
          const isSel = ds === selectedDate;
          const high  = allEvents.filter(e => e.date === ds && e.impact === 'high').length;
          const med   = allEvents.filter(e => e.date === ds && e.impact === 'medium').length;
          const dow   = format(day, 'EEE', { locale: dateLocale }).toUpperCase().slice(0, 2);
          const dom   = format(day, 'd');
          return (
            <button key={ds} onClick={() => { setSelectedDate(ds); if (Math.floor((day - today) / 86400000) < -3 || Math.floor((day - today) / 86400000) > 3) setWeekOffset(0); }}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-2.5 flex-shrink-0 transition-all border-b-2 min-w-[52px]',
                isSel
                  ? 'border-b-white text-white'
                  : isTd
                    ? cn('border-b-transparent', th.muted)
                    : cn('border-b-transparent', th.muted, th.hover)
              )}>
              <span className={cn('text-[9px] font-bold tracking-widest',
                isSel ? (darkMode ? 'text-zinc-400' : 'text-zinc-500') : th.muted)}>{dow}</span>
              <span className={cn('text-sm font-black',
                isSel ? (darkMode ? 'text-white' : 'text-zinc-900') : isTd ? (darkMode ? 'text-zinc-300' : 'text-zinc-700') : th.sub)}>
                {dom}
              </span>
              <div className="flex gap-0.5 h-1.5">
                {high > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                {med  > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </div>
            </button>
          );
        })}
        {/* Week nav arrows */}
        <button onClick={() => setWeekOffset(w => w - 1)}
          className={cn('flex items-center justify-center px-3 flex-shrink-0', th.muted, th.hover)}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className={cn('flex items-center justify-center px-3 flex-shrink-0', th.muted, th.hover)}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Refresh bar */}
      <AnimatePresence>
        {refreshing && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
            style={{ transformOrigin: 'left' }} className="h-0.5 bg-blue-500 w-full" />
        )}
      </AnimatePresence>

      {/* ── TABLE HEADER ── */}
      {!loading && !error && visibleEvents.length > 0 && (
        <div className={cn(
          'grid px-5 py-2 border-b',
          'grid-cols-[70px_90px_1fr_90px_100px_100px]',
          th.border, darkMode ? 'bg-[#161616]' : 'bg-zinc-100'
        )}>
          {[ct.colTime, ct.colCountry, ct.colEvent, ct.colImpact, ct.colForecast, ct.colActual].map((col, i) => (
            <span key={i} className={cn('text-[10px] font-black tracking-widest', th.muted,
              i >= 4 ? 'text-right' : '')}>{col}</span>
          ))}
        </div>
      )}

      {/* ── EVENT ROWS ── */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{ y: [0,-8,0] }} transition={{ duration: 0.6, delay: i*0.15, repeat: Infinity }} />
              ))}
            </div>
            <span className={cn('text-[10px] tracking-widest font-bold', th.muted)}>{ct.loading}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
            <AlertTriangle className={cn('w-7 h-7', th.muted)} />
            <p className={cn('text-sm', th.muted)}>{ct.error}</p>
            <button onClick={() => fetchEvents(false)} className="text-blue-400 text-xs font-bold hover:underline">{ct.retry}</button>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <span className="text-3xl">📅</span>
            <p className={cn('text-sm font-bold', th.sub)}>{ct.noEvents}</p>
            <p className={cn('text-[11px]', th.muted)}>{ct.noEventsHint}</p>
          </div>
        ) : (
          visibleEvents.map((evt, idx) => {
            const imp    = IMPACT_STYLE[evt.impact] || IMPACT_STYLE.low;
            const live   = isLiveNow(evt.time, evt.date);
            const hasRes = evt.actual !== null && evt.actual !== undefined && evt.actual !== '';
            const surp   = getSurprise(evt.actual, evt.forecast);
            const flag   = CURRENCY_FLAG[evt.currency] || '🌐';

            return (
              <motion.div key={evt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                className={cn(
                  'grid px-5 py-3.5 border-b items-center',
                  'grid-cols-[70px_90px_1fr_90px_100px_100px]',
                  th.rowSep,
                  live
                    ? (darkMode ? 'bg-teal-950/30 border-l-2 border-l-teal-500' : 'bg-teal-50')
                    : (darkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-zinc-50'),
                  'transition-colors'
                )}>

                {/* TIME */}
                <div className="flex flex-col gap-0.5">
                  <span className={cn('text-sm font-bold tabular-nums', live ? 'text-teal-400' : th.text)}>
                    {evt.time || '–'}
                  </span>
                  {live && (
                    <span className="text-[9px] font-black text-teal-400 animate-pulse">● {ct.live}</span>
                  )}
                  {!live && <CountdownBadge timeStr={evt.time} dateStr={evt.date} nowLabel={ct.nowLabel} />}
                </div>

                {/* COUNTRY / CURRENCY */}
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{flag}</span>
                  <span className={cn('text-xs font-black tracking-wider', th.text)}>{evt.currency}</span>
                </div>

                {/* EVENT */}
                <span className={cn('text-sm pr-4', th.text)}>{evt.event}</span>

                {/* IMPACT PILL */}
                <div>
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider',
                    imp.bg, imp.text
                  )}>
                    {imp.label}
                  </span>
                </div>

                {/* FORECAST */}
                <span className={cn('text-sm text-right tabular-nums', th.muted)}>
                  {evt.forecast || '—'}
                </span>

                {/* ACTUAL */}
                <span className={cn(
                  'text-sm text-right tabular-nums font-bold',
                  !hasRes ? th.muted
                    : surp?.beat ? 'text-teal-400'
                    : surp ? 'text-rose-400'
                    : th.text
                )}>
                  {hasRes ? evt.actual : '—'}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}