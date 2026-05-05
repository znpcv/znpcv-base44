import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import {
  RefreshCw, ChevronLeft, ChevronRight, AlertTriangle,
  Bell, BellOff, Timer, TrendingUp, TrendingDown, Zap
} from 'lucide-react';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { de, enUS, fr, es, zhCN, ar, ja, pt, hi } from 'date-fns/locale';
import { useLanguage } from '@/components/LanguageContext';

// ── i18n ──────────────────────────────────────────────────────────
const CAL_T = {
  de: {
    loading: 'LADE DATEN…', error: 'Daten konnten nicht geladen werden.',
    retry: 'Erneut versuchen', noEvents: 'Keine Events an diesem Tag',
    noEventsHint: 'Anderen Tag wählen oder Filter ändern',
    colTime: 'ZEIT', colCurrency: 'WÄHRUNG', colEvent: 'EVENT',
    colImpact: 'IMPACT', colForecast: 'PROGNOSE', colPrevious: 'VORHERIG', colActual: 'AKTUELL',
    high: 'HIGH', medium: 'MED', low: 'LOW', all: 'ALLE',
    live: 'LIVE', nowLabel: 'JETZT', nextHigh: 'NÄCHSTES HIGH EVENT',
    beat: 'BESSER', miss: 'SCHLECHTER', inline: 'INLINE',
    notifBody: (diff, time) => `Startet in ${diff} Minuten (${time} Uhr)`,
    today: 'HEUTE', tomorrow: 'MORGEN',
    eventsCount: (n) => `${n} Event${n !== 1 ? 's' : ''}`,
    legendHigh: 'Hoch', legendMed: 'Mittel', legendLow: 'Gering',
    legendBeat: 'Besser als erwartet', legendMiss: 'Schlechter als erwartet',
  },
  en: {
    loading: 'LOADING…', error: 'Could not load data.',
    retry: 'Try again', noEvents: 'No events on this day',
    noEventsHint: 'Choose another day or change filter',
    colTime: 'TIME', colCurrency: 'CURRENCY', colEvent: 'EVENT',
    colImpact: 'IMPACT', colForecast: 'FORECAST', colPrevious: 'PREVIOUS', colActual: 'ACTUAL',
    high: 'HIGH', medium: 'MED', low: 'LOW', all: 'ALL',
    live: 'LIVE', nowLabel: 'NOW', nextHigh: 'NEXT HIGH EVENT',
    beat: 'BEAT', miss: 'MISS', inline: 'INLINE',
    notifBody: (diff, time) => `Starts in ${diff} minutes (${time})`,
    today: 'TODAY', tomorrow: 'TOMORROW',
    eventsCount: (n) => `${n} Event${n !== 1 ? 's' : ''}`,
    legendHigh: 'High', legendMed: 'Medium', legendLow: 'Low',
    legendBeat: 'Better than expected', legendMiss: 'Worse than expected',
  },
  es: {
    loading: 'CARGANDO…', error: 'No se pudieron cargar los datos.',
    retry: 'Reintentar', noEvents: 'Sin eventos este día',
    noEventsHint: 'Elige otro día o cambia el filtro',
    colTime: 'HORA', colCurrency: 'DIVISA', colEvent: 'EVENTO',
    colImpact: 'IMPACTO', colForecast: 'PRONÓSTICO', colPrevious: 'ANTERIOR', colActual: 'ACTUAL',
    high: 'ALTO', medium: 'MED', low: 'BAJO', all: 'TODOS',
    live: 'VIVO', nowLabel: 'AHORA', nextHigh: 'PRÓXIMO ALTO',
    beat: 'MEJOR', miss: 'PEOR', inline: 'IGUAL',
    notifBody: (diff, time) => `Empieza en ${diff} minutos (${time})`,
    today: 'HOY', tomorrow: 'MAÑANA',
    eventsCount: (n) => `${n} Evento${n !== 1 ? 's' : ''}`,
    legendHigh: 'Alto', legendMed: 'Medio', legendLow: 'Bajo',
    legendBeat: 'Mejor de lo esperado', legendMiss: 'Peor de lo esperado',
  },
  fr: {
    loading: 'CHARGEMENT…', error: 'Impossible de charger les données.',
    retry: 'Réessayer', noEvents: 'Aucun événement ce jour',
    noEventsHint: 'Choisir un autre jour ou changer le filtre',
    colTime: 'HEURE', colCurrency: 'DEVISE', colEvent: 'ÉVÉNEMENT',
    colImpact: 'IMPACT', colForecast: 'PRÉVISION', colPrevious: 'PRÉCÉDENT', colActual: 'ACTUEL',
    high: 'ÉLEVÉ', medium: 'MOY', low: 'FAIBLE', all: 'TOUS',
    live: 'EN DIRECT', nowLabel: 'MAINTENANT', nextHigh: 'PROCHAIN ÉLEVÉ',
    beat: 'MIEUX', miss: 'MOINS', inline: 'ÉGAL',
    notifBody: (diff, time) => `Commence dans ${diff} minutes (${time})`,
    today: "AUJOURD'HUI", tomorrow: 'DEMAIN',
    eventsCount: (n) => `${n} Événement${n !== 1 ? 's' : ''}`,
    legendHigh: 'Élevé', legendMed: 'Moyen', legendLow: 'Faible',
    legendBeat: 'Mieux que prévu', legendMiss: 'Moins bien que prévu',
  },
  zh: {
    loading: '加载中…', error: '无法加载数据。',
    retry: '重试', noEvents: '当天无事件', noEventsHint: '选择其他日期或更改筛选',
    colTime: '时间', colCurrency: '货币', colEvent: '事件',
    colImpact: '影响', colForecast: '预测', colPrevious: '前值', colActual: '实际',
    high: '高', medium: '中', low: '低', all: '全部',
    live: '直播', nowLabel: '现在', nextHigh: '下一个高影响',
    beat: '超预期', miss: '低预期', inline: '符合',
    notifBody: (diff, time) => `${diff}分钟后开始 (${time})`,
    today: '今天', tomorrow: '明天',
    eventsCount: (n) => `${n}个事件`,
    legendHigh: '高', legendMed: '中', legendLow: '低',
    legendBeat: '优于预期', legendMiss: '劣于预期',
  },
  ar: {
    loading: 'جارٍ التحميل…', error: 'تعذّر تحميل البيانات.',
    retry: 'إعادة المحاولة', noEvents: 'لا توجد أحداث', noEventsHint: 'اختر يومًا آخر أو غيّر الفلتر',
    colTime: 'الوقت', colCurrency: 'العملة', colEvent: 'الحدث',
    colImpact: 'التأثير', colForecast: 'التوقع', colPrevious: 'السابق', colActual: 'الفعلي',
    high: 'مرتفع', medium: 'متوسط', low: 'منخفض', all: 'الكل',
    live: 'مباشر', nowLabel: 'الآن', nextHigh: 'التالي عالي التأثير',
    beat: 'أفضل', miss: 'أسوأ', inline: 'مطابق',
    notifBody: (diff, time) => `يبدأ خلال ${diff} دقيقة (${time})`,
    today: 'اليوم', tomorrow: 'غداً',
    eventsCount: (n) => `${n} حدث`,
    legendHigh: 'مرتفع', legendMed: 'متوسط', legendLow: 'منخفض',
    legendBeat: 'أفضل من المتوقع', legendMiss: 'أسوأ من المتوقع',
  },
  ja: {
    loading: '読み込み中…', error: 'データを読み込めませんでした。',
    retry: '再試行', noEvents: 'この日のイベントなし', noEventsHint: '別の日を選ぶかフィルターを変更',
    colTime: '時刻', colCurrency: '通貨', colEvent: 'イベント',
    colImpact: '影響', colForecast: '予測', colPrevious: '前回', colActual: '実績',
    high: '高', medium: '中', low: '低', all: '全て',
    live: 'ライブ', nowLabel: '今', nextHigh: '次の高影響イベント',
    beat: '上回る', miss: '下回る', inline: '一致',
    notifBody: (diff, time) => `${diff}分後に開始 (${time})`,
    today: '今日', tomorrow: '明日',
    eventsCount: (n) => `${n}件`,
    legendHigh: '高', legendMed: '中', legendLow: '低',
    legendBeat: '予測を上回る', legendMiss: '予測を下回る',
  },
  pt: {
    loading: 'CARREGANDO…', error: 'Não foi possível carregar os dados.',
    retry: 'Tentar novamente', noEvents: 'Nenhum evento neste dia', noEventsHint: 'Escolha outro dia ou mude o filtro',
    colTime: 'HORA', colCurrency: 'MOEDA', colEvent: 'EVENTO',
    colImpact: 'IMPACTO', colForecast: 'PREVISÃO', colPrevious: 'ANTERIOR', colActual: 'REAL',
    high: 'ALTO', medium: 'MED', low: 'BAIXO', all: 'TODOS',
    live: 'AO VIVO', nowLabel: 'AGORA', nextHigh: 'PRÓXIMO ALTO',
    beat: 'MELHOR', miss: 'PIOR', inline: 'IGUAL',
    notifBody: (diff, time) => `Começa em ${diff} minutos (${time})`,
    today: 'HOJE', tomorrow: 'AMANHÃ',
    eventsCount: (n) => `${n} Evento${n !== 1 ? 's' : ''}`,
    legendHigh: 'Alto', legendMed: 'Médio', legendLow: 'Baixo',
    legendBeat: 'Melhor que o esperado', legendMiss: 'Pior que o esperado',
  },
  hi: {
    loading: 'लोड हो रहा है…', error: 'डेटा लोड नहीं हो सका।',
    retry: 'पुनः प्रयास', noEvents: 'इस दिन कोई इवेंट नहीं', noEventsHint: 'दूसरा दिन चुनें या फ़िल्टर बदलें',
    colTime: 'समय', colCurrency: 'मुद्रा', colEvent: 'इवेंट',
    colImpact: 'प्रभाव', colForecast: 'अनुमान', colPrevious: 'पूर्व', colActual: 'वास्तविक',
    high: 'उच्च', medium: 'मध्यम', low: 'कम', all: 'सभी',
    live: 'लाइव', nowLabel: 'अभी', nextHigh: 'अगला उच्च प्रभाव',
    beat: 'बेहतर', miss: 'कम', inline: 'बराबर',
    notifBody: (diff, time) => `${diff} मिनट में शुरू (${time})`,
    today: 'आज', tomorrow: 'कल',
    eventsCount: (n) => `${n} इवेंट`,
    legendHigh: 'उच्च', legendMed: 'मध्यम', legendLow: 'कम',
    legendBeat: 'अनुमान से बेहतर', legendMiss: 'अनुमान से कम',
  },
  fa: {
    loading: 'در حال بارگذاری…', error: 'بارگذاری داده‌ها امکان‌پذیر نبود.',
    retry: 'تلاش مجدد', noEvents: 'رویدادی در این روز وجود ندارد', noEventsHint: 'روز دیگری انتخاب کنید',
    colTime: 'زمان', colCurrency: 'ارز', colEvent: 'رویداد',
    colImpact: 'تأثیر', colForecast: 'پیش‌بینی', colPrevious: 'قبلی', colActual: 'واقعی',
    high: 'بالا', medium: 'متوسط', low: 'پایین', all: 'همه',
    live: 'زنده', nowLabel: 'اکنون', nextHigh: 'رویداد بالا بعدی',
    beat: 'بهتر', miss: 'بدتر', inline: 'برابر',
    notifBody: (diff, time) => `در ${diff} دقیقه شروع می‌شود (${time})`,
    today: 'امروز', tomorrow: 'فردا',
    eventsCount: (n) => `${n} رویداد`,
    legendHigh: 'بالا', legendMed: 'متوسط', legendLow: 'پایین',
    legendBeat: 'بهتر از پیش‌بینی', legendMiss: 'بدتر از پیش‌بینی',
  },
};

const DATE_LOCALES = { de, en: enUS, es, fr, zh: zhCN, ar, ja, pt, hi, fa: enUS };
function getCalT(lang) { return CAL_T[lang] || CAL_T.en; }

// ── Currency flags ─────────────────────────────────────────────────
const CURRENCY_FLAG = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺',
  CAD: '🇨🇦', CHF: '🇨🇭', NZD: '🇳🇿', CNY: '🇨🇳', CNH: '🇨🇳',
  SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰', SGD: '🇸🇬', HKD: '🇭🇰',
  MXN: '🇲🇽', BRL: '🇧🇷', INR: '🇮🇳', KRW: '🇰🇷', ZAR: '🇿🇦',
  XAU: '🥇', BTC: '₿',
};

// ── Impact styles ──────────────────────────────────────────────────
const IMPACT_CFG = {
  high:   { bg: 'bg-rose-900/70',   text: 'text-rose-300',   border: 'border-rose-700/50',   dot: 'bg-rose-500',   barW: 'w-full' },
  medium: { bg: 'bg-amber-900/60',  text: 'text-amber-300',  border: 'border-amber-700/50',  dot: 'bg-amber-400',  barW: 'w-2/3'  },
  low:    { bg: 'bg-zinc-800/80',   text: 'text-zinc-400',   border: 'border-zinc-700/50',   dot: 'bg-zinc-500',   barW: 'w-1/3'  },
};

// ── Cache & utils ──────────────────────────────────────────────────
const CACHE_KEY = 'znpcv_forex_calendar_v2';
const CACHE_TTL = 5 * 60 * 1000;
const NOTIF_KEY = 'znpcv_cal_alerted';

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    return Date.now() - ts < CACHE_TTL ? data : null;
  } catch { return null; }
}
function getEventMinutes(t) {
  if (!t || t === '--:--') return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function nowMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}
function getMinutesUntil(timeStr, dateStr) {
  if (dateStr !== new Date().toISOString().split('T')[0]) return null;
  const em = getEventMinutes(timeStr);
  if (em === null) return null;
  return em - nowMinutes();
}
function isLiveNow(timeStr, dateStr) {
  const m = getMinutesUntil(timeStr, dateStr);
  return m !== null && m >= -15 && m <= 60;
}
function getSurprise(actual, forecast) {
  if (actual == null || actual === '' || !forecast) return null;
  const a = parseFloat(actual), f = parseFloat(forecast);
  if (isNaN(a) || isNaN(f)) return null;
  const d = a - f;
  if (Math.abs(d) < 0.0001) return 'inline';
  return d > 0 ? 'beat' : 'miss';
}
function buildWeek(today, weekOffset) {
  // Build Mon–Sun of the target week
  const anchor = addDays(today, weekOffset * 7);
  const dow = anchor.getDay(); // 0=Sun
  const monday = addDays(anchor, dow === 0 ? -6 : 1 - dow);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
function getAlerted() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveAlerted(s) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify([...s])); } catch {}
}

// ── CountdownBadge ─────────────────────────────────────────────────
function CountdownBadge({ timeStr, dateStr, nowLabel }) {
  const [mins, setMins] = useState(() => getMinutesUntil(timeStr, dateStr));
  useEffect(() => {
    const iv = setInterval(() => setMins(getMinutesUntil(timeStr, dateStr)), 30000);
    return () => clearInterval(iv);
  }, [timeStr, dateStr]);
  if (mins === null || mins < 0 || mins > 240) return null;
  const label = mins === 0 ? nowLabel : mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}`;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider',
      mins <= 15 ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-teal-500/15 text-teal-400'
    )}>
      <Timer className="w-2.5 h-2.5" />{label}
    </span>
  );
}

// ── ImpactPill ─────────────────────────────────────────────────────
function ImpactPill({ impact, label }) {
  const cfg = IMPACT_CFG[impact] || IMPACT_CFG.low;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider border',
      cfg.bg, cfg.text, cfg.border
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {label}
    </span>
  );
}

// ── SurpriseBadge ──────────────────────────────────────────────────
function SurpriseBadge({ type, beatLabel, missLabel, inlineLabel }) {
  if (!type || type === 'inline') return null;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider',
      type === 'beat' ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'
    )}>
      {type === 'beat' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {type === 'beat' ? beatLabel : missLabel}
    </span>
  );
}

// ── NextHighBanner ─────────────────────────────────────────────────
function NextHighBanner({ allEvents, todayStr, ct, darkMode }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => tick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  const next = allEvents
    .filter(e => e.date === todayStr && e.impact === 'high')
    .map(e => ({ ...e, m: getMinutesUntil(e.time, e.date) }))
    .filter(e => e.m !== null && e.m >= 0 && e.m <= 180)
    .sort((a, b) => a.m - b.m)[0];

  if (!next) return null;
  const label = next.m === 0 ? ct.nowLabel : next.m < 60 ? `in ${next.m}min` : `in ${Math.floor(next.m / 60)}h${next.m % 60 ? ` ${next.m % 60}m` : ''}`;
  const flag = CURRENCY_FLAG[next.currency] || '🌐';

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2 border-b',
      darkMode ? 'bg-rose-950/40 border-rose-900/40' : 'bg-rose-50 border-rose-200'
    )}>
      <Zap className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
      <span className="text-rose-400 text-[10px] font-black tracking-widest hidden sm:inline flex-shrink-0">{ct.nextHigh}</span>
      <span className="text-[10px] flex-shrink-0">{flag}</span>
      <span className={cn('text-xs font-bold truncate flex-1', darkMode ? 'text-zinc-300' : 'text-zinc-700')}>
        {next.currency} — {next.event}
      </span>
      <span className="text-rose-400 text-xs font-black tabular-nums flex-shrink-0 animate-pulse">{label}</span>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────
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

  const days = buildWeek(today, weekOffset);

  const fetchEvents = useCallback(async (bg = false) => {
    bg ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('forexCalendar', {});
      const data = res.data?.data || [];
      setAllEvents(data);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
    } catch {
      if (!bg) setError(true);
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

  // Notifications
  useEffect(() => {
    if (!notifEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    const check = () => {
      const nm = nowMinutes();
      allEvents.filter(e => e.date === todayStr && e.impact === 'high').forEach(e => {
        const em = getEventMinutes(e.time);
        if (!em) return;
        const diff = em - nm;
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

  const toggleNotif = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      const p = await Notification.requestPermission();
      if (p === 'granted') setNotifEnabled(true);
    } else if (Notification.permission === 'granted') {
      setNotifEnabled(n => !n);
    }
  };

  // Filtered events
  const eventsForDay = allEvents.filter(e => e.date === selectedDate);
  const visibleEvents = impactFilter === 'all'
    ? eventsForDay
    : eventsForDay.filter(e => e.impact === impactFilter);

  // Date label
  const selDateObj = new Date(selectedDate + 'T00:00:00');
  const isSelToday = isToday(selDateObj);
  const isSelTomorrow = isTomorrow(selDateObj);
  const dateLabel = format(selDateObj, 'EEEE · d. MMMM yyyy', { locale: dateLocale }).toUpperCase();

  // Theme tokens
  const t = {
    bg:      darkMode ? 'bg-[#191919]' : 'bg-white',
    bgHead:  darkMode ? 'bg-[#111111]' : 'bg-zinc-100',
    bgTabs:  darkMode ? 'bg-[#131313]' : 'bg-zinc-50',
    bgColH:  darkMode ? 'bg-[#111111]' : 'bg-zinc-100',
    border:  darkMode ? 'border-zinc-800' : 'border-zinc-200',
    rowSep:  darkMode ? 'border-zinc-800/50' : 'border-zinc-100',
    text:    darkMode ? 'text-white' : 'text-zinc-900',
    muted:   darkMode ? 'text-zinc-500' : 'text-zinc-400',
    sub:     darkMode ? 'text-zinc-400' : 'text-zinc-600',
    hover:   darkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50',
  };

  const filterOpts = [
    { key: 'high',   label: ct.high,   active: 'bg-rose-600 text-white border-rose-600' },
    { key: 'medium', label: ct.medium, active: 'bg-amber-600 text-white border-amber-600' },
    { key: 'low',    label: ct.low,    active: 'bg-zinc-600 text-white border-zinc-600' },
    { key: 'all',    label: ct.all,    active: darkMode ? 'bg-zinc-700 text-white border-zinc-700' : 'bg-zinc-800 text-white border-zinc-800' },
  ];

  const colClass = 'grid-cols-[72px_96px_1fr_100px_100px_90px_100px]';

  return (
    <div className={cn('rounded-xl overflow-hidden border', t.border, t.bg)}>

      {/* ── HEADER: Date + Filters + Actions ── */}
      <div className={cn('border-b', t.border, t.bgHead)}>
        {/* Top row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn('text-[11px] font-black tracking-widest truncate', t.muted)}>
              {dateLabel}
            </span>
            {isSelToday && (
              <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[9px] font-black tracking-wider flex-shrink-0">
                {ct.today}
              </span>
            )}
            {isSelTomorrow && (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-black tracking-wider flex-shrink-0">
                {ct.tomorrow}
              </span>
            )}
            <span className={cn('text-[10px] font-bold flex-shrink-0', t.muted)}>
              · {ct.eventsCount(eventsForDay.length)}
            </span>
          </div>


          <div className="flex items-center gap-1 flex-shrink-0">
            {'Notification' in window && (
              <button onClick={toggleNotif}
                title={notifEnabled ? 'Benachrichtigungen aus' : 'Benachrichtigungen an'}
                className={cn(
                  'p-1.5 rounded-lg border transition-all text-[10px]',
                  notifEnabled
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : cn('border-transparent', t.muted, t.hover)
                )}>
                {notifEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              </button>
            )}
            <button onClick={() => fetchEvents(false)} disabled={loading}
              className={cn('p-1.5 rounded-lg border border-transparent transition-all', t.muted, t.hover, loading && 'opacity-40')}>
              <RefreshCw className={cn('w-3.5 h-3.5', (loading || refreshing) && 'animate-spin')} />
            </button>
          </div>
        </div>


      </div>

      {/* ── DAY TABS ── */}
      <div className={cn('border-b overflow-x-auto scrollbar-hide', t.border, t.bgTabs)}>
        <div className="flex">
          <button onClick={() => setWeekOffset(w => w - 1)}
            className={cn('flex items-center justify-center px-3 py-3 flex-shrink-0 transition-colors', t.muted, t.hover)}>
            <ChevronLeft className="w-4 h-4" />
          </button>

          {days.map(day => {
            const ds    = day.toISOString().split('T')[0];
            const isTd  = ds === todayStr;
            const isSel = ds === selectedDate;
            const high  = allEvents.filter(e => e.date === ds && e.impact === 'high').length;
            const med   = allEvents.filter(e => e.date === ds && e.impact === 'medium').length;
            const total = allEvents.filter(e => e.date === ds).length;
            const dow   = format(day, 'EEE', { locale: dateLocale }).toUpperCase().slice(0, 2);
            const dom   = format(day, 'd');
            return (
              <button key={ds} onClick={() => setSelectedDate(ds)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2.5 flex-shrink-0 min-w-[54px] transition-all relative',
                  isSel
                    ? darkMode ? 'bg-zinc-800/80' : 'bg-zinc-200/80'
                    : cn(t.hover)
                )}>
                {/* selected indicator */}
                {isSel && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-white" />}
                <span className={cn('text-[9px] font-bold tracking-wider',
                  isSel ? (darkMode ? 'text-zinc-400' : 'text-zinc-500')
                         : isTd ? 'text-teal-400' : t.muted)}>
                  {dow}
                </span>
                <span className={cn('text-sm font-black leading-none',
                  isSel ? (darkMode ? 'text-white' : 'text-zinc-900')
                         : isTd ? (darkMode ? 'text-teal-400' : 'text-teal-600')
                         : t.sub)}>
                  {dom}
                </span>
                {/* dot indicators */}
                <div className="flex gap-0.5 h-1.5 items-center">
                  {high > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                  {med  > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  {total === 0 && <span className={cn('w-1 h-1 rounded-full', darkMode ? 'bg-zinc-700' : 'bg-zinc-300')} />}
                </div>
              </button>
            );
          })}

          <button onClick={() => setWeekOffset(w => w + 1)}
            className={cn('flex items-center justify-center px-3 py-3 flex-shrink-0 transition-colors', t.muted, t.hover)}>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Filter buttons — desktop: right side of day tabs row */}
          <div className="hidden md:flex items-center gap-1.5 ml-auto px-4 flex-shrink-0">
            {filterOpts.map(({ key, label, active }) => (
              <button key={key} onClick={() => setImpactFilter(key)}
                className={cn(
                  'px-3 py-1 rounded-full text-[11px] font-black tracking-wider border transition-all',
                  impactFilter === key
                    ? active
                    : darkMode
                      ? 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                      : 'bg-transparent border-zinc-300 text-zinc-500 hover:border-zinc-400'
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Refresh progress bar */}
      <AnimatePresence>
        {refreshing && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
            style={{ transformOrigin: 'left' }} className="h-0.5 bg-rose-500 w-full" />
        )}
      </AnimatePresence>

      {/* ── NEXT HIGH EVENT BANNER ── */}
      <NextHighBanner allEvents={allEvents} todayStr={todayStr} ct={ct} darkMode={darkMode} />

      {/* Filter buttons — mobile only */}
      <div className="flex md:hidden items-center gap-1.5 px-4 py-2 border-b" style={{borderColor: 'inherit'}}>
        {filterOpts.map(({ key, label, active }) => (
          <button key={key} onClick={() => setImpactFilter(key)}
            className={cn(
              'px-3 py-1 rounded-full text-[11px] font-black tracking-wider border transition-all',
              impactFilter === key
                ? active
                : darkMode
                  ? 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                  : 'bg-transparent border-zinc-300 text-zinc-500 hover:border-zinc-400'
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* ── COLUMN HEADERS ── */}
      {!loading && !error && visibleEvents.length > 0 && (
        <div className={cn('hidden md:grid px-5 py-2 border-b', colClass, t.border, t.bgColH)}>
          {[ct.colTime, ct.colCurrency, ct.colEvent, ct.colImpact, ct.colForecast, ct.colPrevious, ct.colActual].map((col, i) => (
            <span key={i} className={cn('text-[10px] font-black tracking-widest', t.muted, i >= 4 ? 'text-right' : '')}>
              {col}
            </span>
          ))}
        </div>
      )}

      {/* ── EVENT ROWS ── */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-rose-500"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
              ))}
            </div>
            <span className={cn('text-[10px] tracking-widest font-bold', t.muted)}>{ct.loading}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
            <AlertTriangle className={cn('w-6 h-6', t.muted)} />
            <p className={cn('text-sm', t.muted)}>{ct.error}</p>
            <button onClick={() => fetchEvents(false)}
              className="text-rose-400 text-xs font-bold hover:underline">{ct.retry}</button>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14">
            <span className="text-3xl">📅</span>
            <p className={cn('text-sm font-bold', t.sub)}>{ct.noEvents}</p>
            <p className={cn('text-[11px]', t.muted)}>{ct.noEventsHint}</p>
          </div>
        ) : (
          <>
            {visibleEvents.map((evt, idx) => {
              const cfg    = IMPACT_CFG[evt.impact] || IMPACT_CFG.low;
              const live   = isLiveNow(evt.time, evt.date);
              const hasRes = evt.actual != null && evt.actual !== '';
              const surp   = getSurprise(evt.actual, evt.forecast);
              const flag   = CURRENCY_FLAG[evt.currency] || '🌐';
              const impLabel = evt.impact === 'high' ? ct.high : evt.impact === 'medium' ? ct.medium : ct.low;

              return (
                <motion.div key={evt.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.025, 0.4) }}
                  className={cn(
                    'border-b last:border-0 transition-colors',
                    t.rowSep,
                    live
                      ? (darkMode ? 'bg-teal-950/40 border-l-[3px] border-l-teal-500' : 'bg-teal-50 border-l-[3px] border-l-teal-500')
                      : t.hover
                  )}>

                  {/* Desktop row */}
                  <div className={cn('hidden md:grid items-center px-5 py-3.5', colClass)}>

                    {/* TIME */}
                    <div className="flex flex-col gap-0.5">
                      <span className={cn('text-[13px] font-bold tabular-nums', live ? 'text-teal-400' : t.text)}>
                        {evt.time || '–'}
                      </span>
                      {live
                        ? <span className="text-[9px] font-black text-teal-400 animate-pulse tracking-wider">● {ct.live}</span>
                        : <CountdownBadge timeStr={evt.time} dateStr={evt.date} nowLabel={ct.nowLabel} />
                      }
                    </div>

                    {/* CURRENCY */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg leading-none">{flag}</span>
                      <span className={cn('text-xs font-black tracking-widest', t.text)}>{evt.currency}</span>
                    </div>

                    {/* EVENT */}
                    <div className="pr-4">
                      <span className={cn('text-sm leading-snug', t.text)}>{evt.event}</span>
                      {hasRes && surp && (
                        <div className="mt-0.5">
                          <SurpriseBadge type={surp} beatLabel={ct.beat} missLabel={ct.miss} inlineLabel={ct.inline} />
                        </div>
                      )}
                    </div>

                    {/* IMPACT */}
                    <div>
                      <ImpactPill impact={evt.impact} label={impLabel} />
                    </div>

                    {/* FORECAST */}
                    <span className={cn('text-sm text-right tabular-nums', t.sub)}>
                      {evt.forecast || <span className={t.muted}>—</span>}
                    </span>

                    {/* PREVIOUS */}
                    <span className={cn('text-sm text-right tabular-nums', t.muted)}>
                      {evt.previous || '—'}
                    </span>

                    {/* ACTUAL */}
                    <span className={cn(
                      'text-sm text-right tabular-nums font-bold',
                      !hasRes ? t.muted
                        : surp === 'beat' ? 'text-teal-400'
                        : surp === 'miss' ? 'text-rose-400'
                        : t.text
                    )}>
                      {hasRes ? evt.actual : <span className={t.muted}>—</span>}
                    </span>
                  </div>

                  {/* Mobile row */}
                  <div className="flex md:hidden items-start gap-3 px-4 py-3">
                    <div className="flex flex-col gap-0.5 w-12 flex-shrink-0">
                      <span className={cn('text-xs font-bold tabular-nums', live ? 'text-teal-400' : t.text)}>
                        {evt.time || '–'}
                      </span>
                      {live
                        ? <span className="text-[8px] text-teal-400 animate-pulse font-bold">● {ct.live}</span>
                        : <CountdownBadge timeStr={evt.time} dateStr={evt.date} nowLabel={ct.nowLabel} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-base leading-none">{flag}</span>
                        <span className={cn('text-xs font-black', t.text)}>{evt.currency}</span>
                        <ImpactPill impact={evt.impact} label={impLabel} />
                      </div>
                      <p className={cn('text-sm', t.text)}>{evt.event}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                      {hasRes ? (
                        <span className={cn('text-sm font-bold tabular-nums',
                          surp === 'beat' ? 'text-teal-400' : surp === 'miss' ? 'text-rose-400' : t.text)}>
                          {evt.actual}
                        </span>
                      ) : (
                        <span className={cn('text-xs', t.muted)}>{evt.forecast || '—'}</span>
                      )}
                      {hasRes && surp && (
                        <SurpriseBadge type={surp} beatLabel={ct.beat} missLabel={ct.miss} inlineLabel={ct.inline} />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* ── LEGEND ── */}
            <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-3 border-t', t.border, t.bgHead)}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className={cn('text-[10px] font-bold', t.muted)}>{ct.legendHigh}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className={cn('text-[10px] font-bold', t.muted)}>{ct.legendMed}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                <span className={cn('text-[10px] font-bold', t.muted)}>{ct.legendLow}</span>
              </div>
              <span className={cn('w-px h-3 self-center', darkMode ? 'bg-zinc-700' : 'bg-zinc-300')} />
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-teal-400" />
                <span className={cn('text-[10px] font-bold', t.muted)}>{ct.legendBeat}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3 h-3 text-rose-400" />
                <span className={cn('text-[10px] font-bold', t.muted)}>{ct.legendMiss}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}