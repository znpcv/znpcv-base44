import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, Bell, BellOff, Timer, TrendingUp, TrendingDown } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { de, enUS, fr, es, zhCN, ar, ja, pt, hi } from 'date-fns/locale';
import { useLanguage } from '@/components/LanguageContext';

// ── i18n ──────────────────────────────────────────────────────────
const CAL_T = {
  de: {
    loading: 'LADE DATEN…', error: 'Daten konnten nicht geladen werden.',
    retry: 'Erneut versuchen', noEvents: 'Keine Events an diesem Tag',
    noEventsHint: 'Anderen Tag wählen oder Filter ändern',
    colTime: 'ZEIT', colCountry: 'WÄHRUNG', colEvent: 'EVENT',
    colImpact: 'IMPACT', colForecast: 'PROGNOSE', colActual: 'AKTUELL',
    high: 'HIGH', medium: 'MED', low: 'LOW',
    live: 'LIVE', nowLabel: 'JETZT',
    notifBody: (diff, time) => `Startet in ${diff} Minuten (${time} Uhr)`,
  },
  en: {
    loading: 'LOADING…', error: 'Could not load data.',
    retry: 'Try again', noEvents: 'No events on this day',
    noEventsHint: 'Choose another day or change filter',
    colTime: 'TIME', colCountry: 'CURRENCY', colEvent: 'EVENT',
    colImpact: 'IMPACT', colForecast: 'FORECAST', colActual: 'ACTUAL',
    high: 'HIGH', medium: 'MED', low: 'LOW',
    live: 'LIVE', nowLabel: 'NOW',
    notifBody: (diff, time) => `Starts in ${diff} minutes (${time})`,
  },
  es: {
    loading: 'CARGANDO…', error: 'No se pudieron cargar los datos.',
    retry: 'Reintentar', noEvents: 'Sin eventos este día',
    noEventsHint: 'Elige otro día o cambia el filtro',
    colTime: 'HORA', colCountry: 'DIVISA', colEvent: 'EVENTO',
    colImpact: 'IMPACTO', colForecast: 'PRONÓSTICO', colActual: 'ACTUAL',
    high: 'ALTO', medium: 'MED', low: 'BAJO',
    live: 'VIVO', nowLabel: 'AHORA',
    notifBody: (diff, time) => `Empieza en ${diff} minutos (${time})`,
  },
  fr: {
    loading: 'CHARGEMENT…', error: 'Impossible de charger les données.',
    retry: 'Réessayer', noEvents: 'Aucun événement ce jour',
    noEventsHint: 'Choisir un autre jour ou changer le filtre',
    colTime: 'HEURE', colCountry: 'DEVISE', colEvent: 'ÉVÉNEMENT',
    colImpact: 'IMPACT', colForecast: 'PRÉVISION', colActual: 'ACTUEL',
    high: 'ÉLEVÉ', medium: 'MOY', low: 'BAS',
    live: 'EN DIRECT', nowLabel: 'MAINTENANT',
    notifBody: (diff, time) => `Commence dans ${diff} minutes (${time})`,
  },
  zh: {
    loading: '加载中…', error: '无法加载数据。',
    retry: '重试', noEvents: '当天无事件', noEventsHint: '选择其他日期',
    colTime: '时间', colCountry: '货币', colEvent: '事件',
    colImpact: '影响', colForecast: '预测', colActual: '实际',
    high: '高', medium: '中', low: '低',
    live: '直播', nowLabel: '现在',
    notifBody: (diff, time) => `${diff}分钟后开始 (${time})`,
  },
  ar: {
    loading: 'جارٍ التحميل…', error: 'تعذّر تحميل البيانات.',
    retry: 'إعادة المحاولة', noEvents: 'لا توجد أحداث', noEventsHint: 'اختر يومًا آخر',
    colTime: 'الوقت', colCountry: 'العملة', colEvent: 'الحدث',
    colImpact: 'التأثير', colForecast: 'التوقع', colActual: 'الفعلي',
    high: 'مرتفع', medium: 'متوسط', low: 'منخفض',
    live: 'مباشر', nowLabel: 'الآن',
    notifBody: (diff, time) => `يبدأ خلال ${diff} دقيقة (${time})`,
  },
  ja: {
    loading: '読み込み中…', error: 'データを読み込めませんでした。',
    retry: '再試行', noEvents: 'この日のイベントなし', noEventsHint: '別の日を選ぶ',
    colTime: '時刻', colCountry: '通貨', colEvent: 'イベント',
    colImpact: '影響', colForecast: '予測', colActual: '実績',
    high: '高', medium: '中', low: '低',
    live: 'ライブ', nowLabel: '今',
    notifBody: (diff, time) => `${diff}分後に開始 (${time})`,
  },
  pt: {
    loading: 'CARREGANDO…', error: 'Não foi possível carregar os dados.',
    retry: 'Tentar novamente', noEvents: 'Nenhum evento neste dia', noEventsHint: 'Escolha outro dia',
    colTime: 'HORA', colCountry: 'MOEDA', colEvent: 'EVENTO',
    colImpact: 'IMPACTO', colForecast: 'PREVISÃO', colActual: 'REAL',
    high: 'ALTO', medium: 'MED', low: 'BAIXO',
    live: 'AO VIVO', nowLabel: 'AGORA',
    notifBody: (diff, time) => `Começa em ${diff} minutos (${time})`,
  },
  hi: {
    loading: 'लोड हो रहा है…', error: 'डेटा लोड नहीं हो सका।',
    retry: 'पुनः प्रयास', noEvents: 'इस दिन कोई इवेंट नहीं', noEventsHint: 'दूसरा दिन चुनें',
    colTime: 'समय', colCountry: 'मुद्रा', colEvent: 'इवेंट',
    colImpact: 'प्रभाव', colForecast: 'अनुमान', colActual: 'वास्तविक',
    high: 'उच्च', medium: 'मध्यम', low: 'कम',
    live: 'लाइव', nowLabel: 'अभी',
    notifBody: (diff, time) => `${diff} मिनट में शुरू (${time})`,
  },
  fa: {
    loading: 'در حال بارگذاری…', error: 'بارگذاری داده‌ها امکان‌پذیر نبود.',
    retry: 'تلاش مجدد', noEvents: 'رویدادی در این روز وجود ندارد', noEventsHint: 'روز دیگری انتخاب کنید',
    colTime: 'زمان', colCountry: 'ارز', colEvent: 'رویداد',
    colImpact: 'تأثیر', colForecast: 'پیش‌بینی', colActual: 'واقعی',
    high: 'بالا', medium: 'متوسط', low: 'پایین',
    live: 'زنده', nowLabel: 'اکنون',
    notifBody: (diff, time) => `در ${diff} دقیقه شروع می‌شود (${time})`,
  },
};

const DATE_LOCALES = { de, en: enUS, es, fr, zh: zhCN, ar, ja, pt, hi, fa: enUS };
function getCalT(lang) { return CAL_T[lang] || CAL_T.en; }

// ── Currency flags & colors ───────────────────────────────────────
const CURRENCY_FLAG = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺',
  CAD: '🇨🇦', CHF: '🇨🇭', NZD: '🇳🇿', CNY: '🇨🇳', CNH: '🇨🇳',
  SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰', SGD: '🇸🇬', HKD: '🇭🇰',
  MXN: '🇲🇽', BRL: '🇧🇷', INR: '🇮🇳', KRW: '🇰🇷', ZAR: '🇿🇦', XAU: '🥇',
};

// ── Impact pill styles ────────────────────────────────────────────
const IMPACT_STYLE = {
  high:   { bg: 'bg-rose-900/80',   text: 'text-rose-300',   border: 'border-rose-700/50' },
  medium: { bg: 'bg-yellow-900/60', text: 'text-yellow-300', border: 'border-yellow-700/50' },
  low:    { bg: 'bg-zinc-800',      text: 'text-zinc-400',   border: 'border-zinc-700' },
};
const IMPACT_STYLE_LIGHT = {
  high:   { bg: 'bg-rose-100',   text: 'text-rose-700',   border: 'border-rose-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  low:    { bg: 'bg-zinc-100',   text: 'text-zinc-500',   border: 'border-zinc-200' },
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
  const now = new Date();
  return evtMin - (now.getHours() * 60 + now.getMinutes());
}
function isLiveNow(timeStr, dateStr) {
  const mins = getMinutesUntil(timeStr, dateStr);
  return mins !== null && mins >= -15 && mins <= 60;
}
function getSurprise(actual, forecast) {
  if (!actual || !forecast) return null;
  const a = parseFloat(actual), f = parseFloat(forecast);
  if (isNaN(a) || isNaN(f) || Math.abs(a - f) < 0.0001) return null;
  return { beat: a > f };
}
function getAlerted() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIF_ALERTED_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveAlerted(set) {
  try { localStorage.setItem(NOTIF_ALERTED_KEY, JSON.stringify([...set])); } catch { /**/ }
}

// ── Week days (Mon–Sun) ───────────────────────────────────────────
function buildWeekDays(today, weekOffset) {
  const mon = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

// ── Countdown badge ───────────────────────────────────────────────
function CountdownBadge({ timeStr, dateStr, nowLabel }) {
  const [mins, setMins] = useState(() => getMinutesUntil(timeStr, dateStr));
  useEffect(() => {
    const iv = setInterval(() => setMins(getMinutesUntil(timeStr, dateStr)), 30000);
    return () => clearInterval(iv);
  }, [timeStr, dateStr]);
  if (mins === null || mins < 0 || mins > 180) return null;
  const label = mins === 0 ? nowLabel : mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}`;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide',
      mins <= 15 ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-teal-500/15 text-teal-400'
    )}>
      <Timer className="w-2.5 h-2.5" />{label}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────
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

  const days = buildWeekDays(today, weekOffset);

  const fetchEvents = useCallback(async (background = false) => {
    background ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('forexCalendar', {});
      const data = res.data?.data || [];
      setAllEvents(data);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { /**/ }
    } catch {
      if (!background) setError(true);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchEvents(!!cached);
    const iv = setInterval(() => fetchEvents(true), 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // Notifications
  useEffect(() => {
    if (!notifEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    const check = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
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

  const eventsForDay = allEvents.filter(e => e.date === selectedDate);
  const visibleEvents = impactFilter === 'all'
    ? eventsForDay
    : eventsForDay.filter(e => e.impact === impactFilter);

  const selDateObj = new Date(selectedDate + 'T00:00:00');
  const dateLabel = format(selDateObj, 'EEEE · d. MMMM yyyy', { locale: dateLocale }).toUpperCase();

  const impStyles = darkMode ? IMPACT_STYLE : IMPACT_STYLE_LIGHT;

  // Theme tokens
  const bg       = darkMode ? '#111111' : '#ffffff';
  const bgCard   = darkMode ? '#1a1a1a' : '#f9f9f9';
  const bgRow    = darkMode ? '#161616' : '#fafafa';
  const bgRowHov = darkMode ? '#1e1e1e' : '#f4f4f5';
  const borderC  = darkMode ? '#2a2a2a' : '#e4e4e7';
  const textPrim = darkMode ? '#f0f0f0' : '#111111';
  const textSub  = darkMode ? '#888888' : '#6b7280';
  const textMut  = darkMode ? '#555555' : '#9ca3af';

  const FILTERS = [
    { key: 'high',   label: ct.high },
    { key: 'medium', label: ct.medium },
    { key: 'low',    label: ct.low },
  ];

  return (
    <div style={{ background: bgCard, border: `1px solid ${borderC}`, borderRadius: 12, overflow: 'hidden' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: `1px solid ${borderC}`, background: bg,
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: textSub }}>
          {dateLabel}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {FILTERS.map(({ key, label }) => {
            const active = impactFilter === key;
            const activeColors = {
              high:   { bg: '#3b82f6', text: '#fff' },
              medium: { bg: '#4b5563', text: '#fff' },
              low:    { bg: '#374151', text: '#d1d5db' },
            };
            return (
              <button key={key}
                onClick={() => setImpactFilter(active ? 'all' : key)}
                style={{
                  padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 800,
                  letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? activeColors[key].bg : (darkMode ? '#2a2a2a' : '#e4e4e7'),
                  color: active ? activeColors[key].text : textSub,
                  border: `1px solid ${active ? 'transparent' : borderC}`,
                }}>
                {label}
              </button>
            );
          })}
          <div style={{ width: 1, height: 16, background: borderC, margin: '0 4px' }} />
          {'Notification' in window && (
            <button onClick={toggleNotifications} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6,
              color: notifEnabled ? '#f59e0b' : textMut, display: 'flex', alignItems: 'center',
            }}>
              {notifEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            </button>
          )}
          <button onClick={() => fetchEvents(false)} disabled={loading} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6,
            color: textMut, display: 'flex', alignItems: 'center', opacity: loading ? 0.4 : 1,
          }}>
            <RefreshCw size={14} className={loading || refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Refresh bar */}
      <AnimatePresence>
        {refreshing && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
            style={{ transformOrigin: 'left', height: 2, background: '#3b82f6', width: '100%' }} />
        )}
      </AnimatePresence>

      {/* ── DAY TABS ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch', borderBottom: `1px solid ${borderC}`,
        background: bg, overflowX: 'auto',
      }}>
        {days.map(day => {
          const ds   = day.toISOString().split('T')[0];
          const isTd = ds === todayStr;
          const isSel = ds === selectedDate;
          const highCount = allEvents.filter(e => e.date === ds && e.impact === 'high').length;
          const medCount  = allEvents.filter(e => e.date === ds && e.impact === 'medium').length;
          const dow = format(day, 'EEE', { locale: dateLocale }).toUpperCase().slice(0, 2);
          const dom = format(day, 'd');
          return (
            <button key={ds} onClick={() => setSelectedDate(ds)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '10px 18px', minWidth: 56, flexShrink: 0, cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: isSel ? `2px solid ${darkMode ? '#e0e0e0' : '#111'}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                color: isSel ? (darkMode ? '#aaa' : '#555') : textMut }}>
                {dow}
              </span>
              <span style={{ fontSize: 15, fontWeight: 900, lineHeight: 1,
                color: isSel ? textPrim : isTd ? (darkMode ? '#ccc' : '#444') : textSub }}>
                {dom}
              </span>
              <div style={{ display: 'flex', gap: 3, height: 5, alignItems: 'center' }}>
                {highCount > 0 && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444' }} />}
                {medCount  > 0 && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b' }} />}
              </div>
            </button>
          );
        })}
        {/* Week navigation */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', paddingRight: 8, gap: 2 }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px',
            color: textMut, display: 'flex', alignItems: 'center', borderRadius: 6,
          }}><ChevronLeft size={16} /></button>
          <button onClick={() => { setWeekOffset(0); setSelectedDate(todayStr); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
            color: textMut, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', borderRadius: 6,
          }}>
            {weekOffset === 0 ? '●' : weekOffset > 0 ? `+${weekOffset}W` : `${weekOffset}W`}
          </button>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px',
            color: textMut, display: 'flex', alignItems: 'center', borderRadius: 6,
          }}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* ── TABLE HEADER ── */}
      {!loading && !error && visibleEvents.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '72px 110px 1fr 100px 110px 110px',
          padding: '8px 24px', borderBottom: `1px solid ${borderC}`,
          background: bg,
        }}>
          {[ct.colTime, ct.colCountry, ct.colEvent, ct.colImpact, ct.colForecast, ct.colActual].map((col, i) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: textMut,
              textAlign: i >= 4 ? 'right' : 'left',
            }}>{col}</span>
          ))}
        </div>
      )}

      {/* ── ROWS ── */}
      <div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '56px 0' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0,1,2].map(i => (
                <motion.div key={i}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
              ))}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: textMut }}>
              {ct.loading}
            </span>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 24px', textAlign: 'center' }}>
            <AlertTriangle size={28} style={{ color: textMut }} />
            <p style={{ fontSize: 13, color: textSub, margin: 0 }}>{ct.error}</p>
            <button onClick={() => fetchEvents(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6',
              fontSize: 12, fontWeight: 700,
            }}>{ct.retry}</button>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 0' }}>
            <span style={{ fontSize: 28 }}>📅</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: textSub, margin: 0 }}>{ct.noEvents}</p>
            <p style={{ fontSize: 11, color: textMut, margin: 0 }}>{ct.noEventsHint}</p>
          </div>
        ) : (
          visibleEvents.map((evt, idx) => {
            const imp    = impStyles[evt.impact] || impStyles.low;
            const impLbl = { high: ct.high, medium: ct.medium, low: ct.low }[evt.impact] || ct.low;
            const live   = isLiveNow(evt.time, evt.date);
            const hasRes = evt.actual !== null && evt.actual !== undefined && evt.actual !== '';
            const surp   = getSurprise(evt.actual, evt.forecast);
            const flag   = CURRENCY_FLAG[evt.currency] || '🌐';

            const actualColor = !hasRes ? textMut
              : surp?.beat ? '#34d399'
              : surp ? '#f87171'
              : textPrim;

            return (
              <motion.div key={evt.id}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.025, 0.4), duration: 0.2 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 110px 1fr 100px 110px 110px',
                  padding: '14px 24px',
                  borderBottom: `1px solid ${borderC}`,
                  alignItems: 'center',
                  background: live
                    ? (darkMode ? 'rgba(20,83,45,0.25)' : 'rgba(209,250,229,0.4)')
                    : bgRow,
                  borderLeft: live ? '2px solid #34d399' : `2px solid transparent`,
                  cursor: 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = live ? (darkMode ? 'rgba(20,83,45,0.35)' : 'rgba(209,250,229,0.6)') : bgRowHov; }}
                onMouseLeave={e => { e.currentTarget.style.background = live ? (darkMode ? 'rgba(20,83,45,0.25)' : 'rgba(209,250,229,0.4)') : bgRow; }}
              >
                {/* TIME */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: live ? '#34d399' : textPrim, letterSpacing: '0.02em' }}>
                    {evt.time || '–'}
                  </span>
                  {live
                    ? <span style={{ fontSize: 9, fontWeight: 900, color: '#34d399', letterSpacing: '0.12em' }}>
                        ● {ct.live}
                      </span>
                    : <CountdownBadge timeStr={evt.time} dateStr={evt.date} nowLabel={ct.nowLabel} />
                  }
                </div>

                {/* CURRENCY */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{flag}</span>
                  <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', color: textPrim }}>
                    {evt.currency}
                  </span>
                </div>

                {/* EVENT NAME */}
                <span style={{ fontSize: 13, color: textPrim, paddingRight: 16, fontWeight: 400 }}>
                  {evt.event}
                </span>

                {/* IMPACT PILL */}
                <div>
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider border', imp.bg, imp.text, imp.border)}>
                    {impLbl}
                  </span>
                </div>

                {/* FORECAST */}
                <span style={{
                  fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                  color: textSub, fontWeight: 400,
                }}>
                  {evt.forecast || '—'}
                </span>

                {/* ACTUAL */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                  {hasRes && surp && (
                    surp.beat
                      ? <TrendingUp size={12} style={{ color: '#34d399' }} />
                      : <TrendingDown size={12} style={{ color: '#f87171' }} />
                  )}
                  <span style={{
                    fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                    fontWeight: hasRes ? 700 : 400, color: actualColor,
                  }}>
                    {hasRes ? evt.actual : '—'}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', borderTop: `1px solid ${borderC}`, background: bg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {[
            { dot: '#ef4444', label: ct.high },
            { dot: '#f59e0b', label: ct.medium },
            { dot: '#6b7280', label: ct.low },
          ].map(({ dot, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: textMut }}>{label}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 10, color: textMut, fontWeight: 600 }}>
          {visibleEvents.length} {visibleEvents.length === 1 ? 'Event' : 'Events'}
        </span>
      </div>
    </div>
  );
}