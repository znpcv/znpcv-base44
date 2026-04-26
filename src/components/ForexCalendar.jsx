import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import {
  RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, Calendar,
  Timer, TrendingUp, TrendingDown, Bell, BellOff, BarChart2, List, LayoutList
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { de, enUS, fr, es, zhCN, ar, ja, pt, hi } from 'date-fns/locale';
import { useLanguage } from '@/components/LanguageContext';

// ── Calendar i18n translations ───────────────────────────────────
const CAL_T = {
  de: {
    loading: 'LADE DATEN…', error: 'Daten konnten nicht geladen werden.',
    retry: 'Erneut versuchen', noEvents: 'Keine Events an diesem Tag',
    noEventsHint: 'Anderen Tag wählen oder Filter ändern',
    timeCol: 'ZEIT', eventCol: 'EVENT', valCol: 'IST / PRO / VOR',
    high: 'Hoch', medium: 'Mittel', low: 'Gering',
    highFilter: '🔴 Hoch', medFilter: '🟡 Mittel', allFilter: 'Alle',
    pairBtn: '⚡ PAAR', heatmap: 'WÄHRUNGS-HEATMAP', hideHeatmap: '✕',
    showHeatmap: 'Heatmap anzeigen', nextHigh: 'NEXT HIGH',
    thisWeek: 'DIESE WOCHE', nextWeek: 'NÄCHSTE WOCHE',
    weekOverviewTitle: 'HIGH EVENTS — NÄCHSTE 7 TAGE', today: '● HEUTE',
    forecastLbl: 'PROGNOSE', previousLbl: 'VORHERIG', actualLbl: 'AKTUELL',
    forecast: 'P', previous: 'V', footerPV: 'P = Prognose · V = Vorherig',
    events: 'Event', eventsPlural: 'Events',
    live: 'LIVE', allPairs: 'Alle',
    notifBody: (diff, time) => `Startet in ${diff} Minuten (${time} Uhr)`,
    nowLabel: 'JETZT',
  },
  en: {
    loading: 'LOADING DATA…', error: 'Could not load data.',
    retry: 'Try again', noEvents: 'No events on this day',
    noEventsHint: 'Choose another day or change filter',
    timeCol: 'TIME', eventCol: 'EVENT', valCol: 'ACT / FCT / PRV',
    high: 'High', medium: 'Medium', low: 'Low',
    highFilter: '🔴 High', medFilter: '🟡 Medium', allFilter: 'All',
    pairBtn: '⚡ PAIR', heatmap: 'CURRENCY HEATMAP', hideHeatmap: '✕',
    showHeatmap: 'Show Heatmap', nextHigh: 'NEXT HIGH',
    thisWeek: 'THIS WEEK', nextWeek: 'NEXT WEEK',
    weekOverviewTitle: 'HIGH EVENTS — NEXT 7 DAYS', today: '● TODAY',
    forecastLbl: 'FORECAST', previousLbl: 'PREVIOUS', actualLbl: 'ACTUAL',
    forecast: 'F', previous: 'P', footerPV: 'F = Forecast · P = Previous',
    events: 'Event', eventsPlural: 'Events',
    live: 'LIVE', allPairs: 'All',
    notifBody: (diff, time) => `Starts in ${diff} minutes (${time})`,
    nowLabel: 'NOW',
  },
  es: {
    loading: 'CARGANDO DATOS…', error: 'No se pudieron cargar los datos.',
    retry: 'Reintentar', noEvents: 'Sin eventos este día',
    noEventsHint: 'Elige otro día o cambia el filtro',
    timeCol: 'HORA', eventCol: 'EVENTO', valCol: 'ACT / PRO / ANT',
    high: 'Alto', medium: 'Medio', low: 'Bajo',
    highFilter: '🔴 Alto', medFilter: '🟡 Medio', allFilter: 'Todos',
    pairBtn: '⚡ PAR', heatmap: 'MAPA DE CALOR DIVISA', hideHeatmap: '✕',
    showHeatmap: 'Mostrar mapa de calor', nextHigh: 'PRÓXIMO ALTO',
    thisWeek: 'ESTA SEMANA', nextWeek: 'PRÓXIMA SEMANA',
    weekOverviewTitle: 'EVENTOS ALTOS — PRÓXIMOS 7 DÍAS', today: '● HOY',
    forecastLbl: 'PRONÓSTICO', previousLbl: 'ANTERIOR', actualLbl: 'ACTUAL',
    forecast: 'P', previous: 'A', footerPV: 'P = Pronóstico · A = Anterior',
    events: 'Evento', eventsPlural: 'Eventos',
    live: 'VIVO', allPairs: 'Todos',
    notifBody: (diff, time) => `Empieza en ${diff} minutos (${time})`,
    nowLabel: 'AHORA',
  },
  fr: {
    loading: 'CHARGEMENT…', error: 'Impossible de charger les données.',
    retry: 'Réessayer', noEvents: 'Aucun événement ce jour',
    noEventsHint: 'Choisir un autre jour ou changer le filtre',
    timeCol: 'HEURE', eventCol: 'ÉVÉNEMENT', valCol: 'ACT / PRÉ / PRÉ',
    high: 'Élevé', medium: 'Moyen', low: 'Faible',
    highFilter: '🔴 Élevé', medFilter: '🟡 Moyen', allFilter: 'Tous',
    pairBtn: '⚡ PAIRE', heatmap: 'CARTE THERMIQUE DEVISE', hideHeatmap: '✕',
    showHeatmap: 'Afficher la carte thermique', nextHigh: 'PROCHAIN ÉLEVÉ',
    thisWeek: 'CETTE SEMAINE', nextWeek: 'SEMAINE PROCHAINE',
    weekOverviewTitle: 'ÉVÉNEMENTS ÉLEVÉS — 7 PROCHAINS JOURS', today: '● AUJOURD\'HUI',
    forecastLbl: 'PRÉVISION', previousLbl: 'PRÉCÉDENT', actualLbl: 'ACTUEL',
    forecast: 'P', previous: 'A', footerPV: 'P = Prévision · A = Antérieur',
    events: 'Événement', eventsPlural: 'Événements',
    live: 'EN DIRECT', allPairs: 'Tous',
    notifBody: (diff, time) => `Commence dans ${diff} minutes (${time})`,
    nowLabel: 'MAINTENANT',
  },
  zh: {
    loading: '加载数据中…', error: '无法加载数据。',
    retry: '重试', noEvents: '当天无事件',
    noEventsHint: '选择其他日期或更改筛选条件',
    timeCol: '时间', eventCol: '事件', valCol: '实际 / 预测 / 前值',
    high: '高', medium: '中', low: '低',
    highFilter: '🔴 高', medFilter: '🟡 中', allFilter: '全部',
    pairBtn: '⚡ 货币对', heatmap: '货币热力图', hideHeatmap: '✕',
    showHeatmap: '显示热力图', nextHigh: '下一个高影响',
    thisWeek: '本周', nextWeek: '下周',
    weekOverviewTitle: '高影响事件 — 未来7天', today: '● 今天',
    forecastLbl: '预测', previousLbl: '前值', actualLbl: '实际',
    forecast: '预', previous: '前', footerPV: '预 = 预测 · 前 = 前值',
    events: '事件', eventsPlural: '事件',
    live: '直播', allPairs: '全部',
    notifBody: (diff, time) => `${diff}分钟后开始 (${time})`,
    nowLabel: '现在',
  },
  ar: {
    loading: 'جارٍ التحميل…', error: 'تعذّر تحميل البيانات.',
    retry: 'إعادة المحاولة', noEvents: 'لا توجد أحداث في هذا اليوم',
    noEventsHint: 'اختر يومًا آخر أو غيّر الفلتر',
    timeCol: 'الوقت', eventCol: 'الحدث', valCol: 'فعلي / توقع / سابق',
    high: 'مرتفع', medium: 'متوسط', low: 'منخفض',
    highFilter: '🔴 مرتفع', medFilter: '🟡 متوسط', allFilter: 'الكل',
    pairBtn: '⚡ الزوج', heatmap: 'خريطة حرارة العملات', hideHeatmap: '✕',
    showHeatmap: 'إظهار الخريطة الحرارية', nextHigh: 'التالي عالي التأثير',
    thisWeek: 'هذا الأسبوع', nextWeek: 'الأسبوع القادم',
    weekOverviewTitle: 'أحداث عالية التأثير — 7 أيام القادمة', today: '● اليوم',
    forecastLbl: 'التوقع', previousLbl: 'السابق', actualLbl: 'الفعلي',
    forecast: 'ت', previous: 'س', footerPV: 'ت = التوقع · س = السابق',
    events: 'حدث', eventsPlural: 'أحداث',
    live: 'مباشر', allPairs: 'الكل',
    notifBody: (diff, time) => `يبدأ خلال ${diff} دقيقة (${time})`,
    nowLabel: 'الآن',
  },
  ja: {
    loading: 'データ読み込み中…', error: 'データを読み込めませんでした。',
    retry: '再試行', noEvents: 'この日のイベントなし',
    noEventsHint: '別の日を選ぶかフィルターを変更',
    timeCol: '時刻', eventCol: 'イベント', valCol: '実績 / 予測 / 前回',
    high: '高', medium: '中', low: '低',
    highFilter: '🔴 高', medFilter: '🟡 中', allFilter: '全て',
    pairBtn: '⚡ ペア', heatmap: '通貨ヒートマップ', hideHeatmap: '✕',
    showHeatmap: 'ヒートマップ表示', nextHigh: '次の高影響イベント',
    thisWeek: '今週', nextWeek: '来週',
    weekOverviewTitle: '高影響イベント — 今後7日間', today: '● 今日',
    forecastLbl: '予測', previousLbl: '前回', actualLbl: '実績',
    forecast: '予', previous: '前', footerPV: '予 = 予測 · 前 = 前回',
    events: 'イベント', eventsPlural: 'イベント',
    live: 'ライブ', allPairs: '全て',
    notifBody: (diff, time) => `${diff}分後に開始 (${time})`,
    nowLabel: '今',
  },
  pt: {
    loading: 'CARREGANDO DADOS…', error: 'Não foi possível carregar os dados.',
    retry: 'Tentar novamente', noEvents: 'Nenhum evento neste dia',
    noEventsHint: 'Escolha outro dia ou mude o filtro',
    timeCol: 'HORA', eventCol: 'EVENTO', valCol: 'REAL / PREV / ANT',
    high: 'Alto', medium: 'Médio', low: 'Baixo',
    highFilter: '🔴 Alto', medFilter: '🟡 Médio', allFilter: 'Todos',
    pairBtn: '⚡ PAR', heatmap: 'MAPA DE CALOR MOEDA', hideHeatmap: '✕',
    showHeatmap: 'Mostrar mapa de calor', nextHigh: 'PRÓXIMO ALTO',
    thisWeek: 'ESTA SEMANA', nextWeek: 'PRÓXIMA SEMANA',
    weekOverviewTitle: 'EVENTOS ALTOS — PRÓXIMOS 7 DIAS', today: '● HOJE',
    forecastLbl: 'PREVISÃO', previousLbl: 'ANTERIOR', actualLbl: 'REAL',
    forecast: 'P', previous: 'A', footerPV: 'P = Previsão · A = Anterior',
    events: 'Evento', eventsPlural: 'Eventos',
    live: 'AO VIVO', allPairs: 'Todos',
    notifBody: (diff, time) => `Começa em ${diff} minutos (${time})`,
    nowLabel: 'AGORA',
  },
  hi: {
    loading: 'डेटा लोड हो रहा है…', error: 'डेटा लोड नहीं हो सका।',
    retry: 'पुनः प्रयास', noEvents: 'इस दिन कोई इवेंट नहीं',
    noEventsHint: 'दूसरा दिन चुनें या फ़िल्टर बदलें',
    timeCol: 'समय', eventCol: 'इवेंट', valCol: 'वास्तविक / अनुमान / पूर्व',
    high: 'उच्च', medium: 'मध्यम', low: 'कम',
    highFilter: '🔴 उच्च', medFilter: '🟡 मध्यम', allFilter: 'सभी',
    pairBtn: '⚡ जोड़ी', heatmap: 'मुद्रा हीटमैप', hideHeatmap: '✕',
    showHeatmap: 'हीटमैप दिखाएं', nextHigh: 'अगला उच्च प्रभाव',
    thisWeek: 'इस सप्ताह', nextWeek: 'अगले सप्ताह',
    weekOverviewTitle: 'उच्च प्रभाव इवेंट — अगले 7 दिन', today: '● आज',
    forecastLbl: 'अनुमान', previousLbl: 'पूर्व', actualLbl: 'वास्तविक',
    forecast: 'अ', previous: 'पू', footerPV: 'अ = अनुमान · पू = पूर्व',
    events: 'इवेंट', eventsPlural: 'इवेंट',
    live: 'लाइव', allPairs: 'सभी',
    notifBody: (diff, time) => `${diff} मिनट में शुरू (${time})`,
    nowLabel: 'अभी',
  },
  fa: {
    loading: 'در حال بارگذاری…', error: 'بارگذاری داده‌ها امکان‌پذیر نبود.',
    retry: 'تلاش مجدد', noEvents: 'رویدادی در این روز وجود ندارد',
    noEventsHint: 'روز دیگری انتخاب کنید یا فیلتر را تغییر دهید',
    timeCol: 'زمان', eventCol: 'رویداد', valCol: 'واقعی / پیش‌بینی / قبلی',
    high: 'بالا', medium: 'متوسط', low: 'پایین',
    highFilter: '🔴 بالا', medFilter: '🟡 متوسط', allFilter: 'همه',
    pairBtn: '⚡ جفت', heatmap: 'نقشه حرارتی ارز', hideHeatmap: '✕',
    showHeatmap: 'نمایش نقشه حرارتی', nextHigh: 'رویداد بالا بعدی',
    thisWeek: 'این هفته', nextWeek: 'هفته آینده',
    weekOverviewTitle: 'رویدادهای با تأثیر بالا — ۷ روز آینده', today: '● امروز',
    forecastLbl: 'پیش‌بینی', previousLbl: 'قبلی', actualLbl: 'واقعی',
    forecast: 'پ', previous: 'ق', footerPV: 'پ = پیش‌بینی · ق = قبلی',
    events: 'رویداد', eventsPlural: 'رویداد',
    live: 'زنده', allPairs: 'همه',
    notifBody: (diff, time) => `در ${diff} دقیقه شروع می‌شود (${time})`,
    nowLabel: 'اکنون',
  },
};

// date-fns locale map
const DATE_LOCALES = { de, en: enUS, es, fr, zh: zhCN, ar, ja, pt, hi, fa: enUS };

function getCalT(lang) {
  return CAL_T[lang] || CAL_T.en;
}

// ── Constants ────────────────────────────────────────────────────
function getImpact(ct) {
  return {
    high:   { label: ct.high.toUpperCase(),   bg: 'bg-rose-500',   pill: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
    medium: { label: ct.medium.toUpperCase(), bg: 'bg-amber-400',  pill: 'bg-amber-400/15 text-amber-400 border border-amber-400/30' },
    low:    { label: ct.low.toUpperCase(),    bg: 'bg-zinc-600',   pill: 'bg-zinc-800 text-zinc-500 border border-zinc-700' },
  };
}

const CURRENCY_COLORS = {
  USD: 'text-blue-400',   EUR: 'text-yellow-400', GBP: 'text-purple-400',
  JPY: 'text-red-400',    AUD: 'text-green-400',  CAD: 'text-orange-400',
  CHF: 'text-pink-400',   NZD: 'text-teal-400',   CNY: 'text-rose-400',
};

// Historical average pip moves per event keyword (rough estimates)
const AVG_PIPS = {
  'Non-Farm':     85, 'NFP':          85, 'CPI':          65, 'Inflation':    55,
  'GDP':          45, 'Interest Rate':80, 'FOMC':         90, 'ECB':          75,
  'BOE':          70, 'BOJ':          60, 'Unemployment': 50, 'PMI':          35,
  'Retail Sales': 40, 'Trade Balance':30, 'ISM':          35, 'PPI':          35,
  'Consumer':     30, 'Manufacturing':30, 'Housing':      25,
};

function getAvgPips(eventName) {
  if (!eventName) return null;
  for (const [key, pips] of Object.entries(AVG_PIPS)) {
    if (eventName.includes(key)) return pips;
  }
  return null;
}

const PAIR_CURRENCIES = {
  'EUR/USD': ['EUR','USD'], 'GBP/USD': ['GBP','USD'], 'USD/JPY': ['USD','JPY'],
  'USD/CHF': ['USD','CHF'], 'AUD/USD': ['AUD','USD'], 'USD/CAD': ['USD','CAD'],
  'NZD/USD': ['NZD','USD'], 'EUR/GBP': ['EUR','GBP'], 'EUR/JPY': ['EUR','JPY'],
  'EUR/CHF': ['EUR','CHF'], 'GBP/JPY': ['GBP','JPY'], 'AUD/JPY': ['AUD','JPY'],
  'XAU/USD': ['XAU','USD'], 'BTC/USD': ['USD'], 'US30': ['USD'], 'US500': ['USD'],
};
const PAIRS = ['Alle', ...Object.keys(PAIR_CURRENCIES)];

const CACHE_KEY = 'znpcv_forex_calendar';
const CACHE_TTL = 5 * 60 * 1000;
const NOTIF_ALERTED_KEY = 'znpcv_cal_alerted';

// ── Utils ────────────────────────────────────────────────────────
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

function isLiveNow(timeStr, dateStr) {
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr !== todayStr) return false;
  const evtMin = getEventMinutes(timeStr);
  if (evtMin === null) return false;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const diff = evtMin - nowMin;
  return diff >= -15 && diff <= 60;
}

function getMinutesUntil(timeStr, dateStr) {
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr !== todayStr) return null;
  const evtMin = getEventMinutes(timeStr);
  if (evtMin === null) return null;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return evtMin - nowMin;
}

function formatCountdown(minutes, nowLabel = 'NOW') {
  if (minutes === null || minutes < 0) return null;
  if (minutes === 0) return nowLabel;
  if (minutes < 60) return `in ${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `in ${h}h ${m}min` : `in ${h}h`;
}

function getSurprise(actual, forecast) {
  if (!actual || !forecast) return null;
  const a = parseFloat(actual);
  const f = parseFloat(forecast);
  if (isNaN(a) || isNaN(f)) return null;
  const diff = a - f;
  if (Math.abs(diff) < 0.001) return null;
  return { beat: diff > 0, pct: Math.abs(diff).toFixed(2) };
}

function buildDays(today, weekOffset) {
  const anchor = addDays(today, weekOffset * 7);
  const days = [];
  for (let i = -2; i <= 9; i++) days.push(addDays(anchor, i));
  return days;
}

function getAlerted() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIF_ALERTED_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveAlerted(set) {
  try { localStorage.setItem(NOTIF_ALERTED_KEY, JSON.stringify([...set])); } catch { /* ignore */ }
}

// ── Sub-components ───────────────────────────────────────────────
function CountdownBadge({ timeStr, dateStr, nowLabel = 'NOW' }) {
  const [mins, setMins] = useState(() => getMinutesUntil(timeStr, dateStr));
  useEffect(() => {
    const iv = setInterval(() => setMins(getMinutesUntil(timeStr, dateStr)), 30000);
    return () => clearInterval(iv);
  }, [timeStr, dateStr]);
  if (mins === null || mins < 0 || mins > 180) return null;
  const urgent = mins <= 15;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider',
      urgent ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-teal-500/15 text-teal-400'
    )}>
      <Timer className="w-2.5 h-2.5" />{formatCountdown(mins, nowLabel)}
    </span>
  );
}

function SurpriseBadge({ actual, forecast }) {
  const s = getSurprise(actual, forecast);
  if (!s) return null;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider',
      s.beat ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'
    )}>
      {s.beat ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {s.beat ? 'BEAT' : 'MISS'} {s.pct}
    </span>
  );
}

function AvgPipsBadge({ eventName, darkMode }) {
  const pips = getAvgPips(eventName);
  if (!pips) return null;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider',
      darkMode ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-600'
    )}>
      <BarChart2 className="w-2.5 h-2.5" />
      Ø {pips} Pips
    </span>
  );
}

// ── Week Overview Panel ──────────────────────────────────────────
function WeekOverview({ allEvents, todayStr, onSelectDate, darkMode, ct, dateLocale }) {
  // Get next 7 days of HIGH events
  const upcoming = [];
  for (let i = 0; i <= 7; i++) {
    const d = addDays(new Date(), i);
    const ds = d.toISOString().split('T')[0];
    const evts = allEvents.filter(e => e.date === ds && e.impact === 'high');
    if (evts.length > 0) upcoming.push({ ds, day: format(d, 'EEE d.M.', { locale: dateLocale }), evts });
  }

  const th = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    muted: darkMode ? 'text-zinc-500' : 'text-zinc-400',
    sub: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    hover: darkMode ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-100',
    bgAlt: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
  };

  if (upcoming.length === 0) return null;

  return (
    <div className={cn('border rounded-xl overflow-hidden', th.border, th.bg)}>
      <div className={cn('px-3 py-2 border-b flex items-center gap-2', th.border, darkMode ? 'bg-zinc-900/60' : 'bg-zinc-50')}>
        <LayoutList className={cn('w-3.5 h-3.5', th.muted)} />
        <span className={cn('text-[10px] font-black tracking-widest', th.sub)}>{ct.weekOverviewTitle}</span>
      </div>
      <div className="divide-y" style={{ borderColor: darkMode ? '#27272a' : '#e4e4e7' }}>
        {upcoming.map(({ ds, day, evts }) => (
          <div key={ds}>
            <div className={cn('px-3 py-1.5', darkMode ? 'bg-zinc-900/30' : 'bg-zinc-50/80')}>
              <span className={cn('text-[9px] font-black tracking-widest', ds === todayStr ? 'text-teal-400' : th.muted)}>
                {ds === todayStr ? ct.today : day.toUpperCase()}
              </span>
            </div>
            {evts.map(e => (
              <button key={e.id} onClick={() => onSelectDate(ds)}
                className={cn('w-full flex items-center gap-2 px-3 py-2 text-left transition-colors', th.hover)}>
                <span className={cn('text-[10px] font-black tabular-nums w-10 flex-shrink-0', th.muted)}>{e.time}</span>
                <span className={cn('text-[10px] font-black flex-shrink-0', CURRENCY_COLORS[e.currency] || th.sub)}>{e.currency}</span>
                <span className={cn('text-[10px] truncate flex-1', th.text)}>{e.event}</span>
                <CountdownBadge timeStr={e.time} dateStr={e.date} />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Currency Heatmap ─────────────────────────────────────────────
function CurrencyHeatmap({ events, darkMode }) {
  const counts = {};
  events.forEach(e => {
    if (!e.currency) return;
    if (!counts[e.currency]) counts[e.currency] = { high: 0, medium: 0, low: 0 };
    counts[e.currency][e.impact] = (counts[e.currency][e.impact] || 0) + 1;
  });

  const currencies = Object.entries(counts)
    .map(([cur, c]) => ({ cur, score: c.high * 3 + c.medium * 1, ...c }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (currencies.length === 0) return null;
  const maxScore = currencies[0]?.score || 1;

  return (
    <div className="flex flex-wrap gap-1 px-3 py-1.5">
      {currencies.map(({ cur, score, high, medium }) => {
        const intensity = score / maxScore;
        const color = CURRENCY_COLORS[cur] || (darkMode ? 'text-zinc-400' : 'text-zinc-600');
        return (
          <div key={cur} className={cn(
            'flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-black',
            darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'
          )}>
            <span className={color}>{cur}</span>
            {high > 0 && <span className="text-rose-400">{high}🔴</span>}
            {medium > 0 && <span className="text-amber-400">{medium}🟡</span>}
            <div className={cn('w-6 h-1 rounded-full overflow-hidden', darkMode ? 'bg-zinc-800' : 'bg-zinc-200')}>
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
                style={{ width: `${Math.round(intensity * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function ForexCalendar({ darkMode = true }) {
  const { language } = useLanguage();
  const ct = getCalT(language);
  const dateLocale = DATE_LOCALES[language] || enUS;
  const IMPACT = getImpact(ct);

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
  const [selectedPair, setSelectedPair] = useState('Alle');
  const [pairPickerOpen, setPairPickerOpen] = useState(false);
  const [weekOffset, setWeekOffset]     = useState(0);
  const [expandedId, setExpandedId]     = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showWeekOverview, setShowWeekOverview] = useState(false);
  const [showHeatmap, setShowHeatmap]   = useState(true);
  const alertedRef = useRef(getAlerted());

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

  // ── Notification alert check ─────────────────────────────────
  useEffect(() => {
    if (!notifEnabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const check = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      allEvents
        .filter(e => e.date === todayStr && e.impact === 'high')
        .forEach(e => {
          const evtMin = getEventMinutes(e.time);
          if (evtMin === null) return;
          const diff = evtMin - nowMin;
          if (diff === 5 || diff === 15) {
            const key = `${e.id}-${diff}`;
            if (!alertedRef.current.has(key)) {
              alertedRef.current.add(key);
              saveAlerted(alertedRef.current);
              new Notification(`⚡ ${e.currency} — ${e.event}`, {
                        body: ct.notifBody(diff, e.time),
                        icon: '/favicon.ico',
                      });
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

  // Pair & impact filter
  const relevantCurrencies = selectedPair !== 'Alle' ? (PAIR_CURRENCIES[selectedPair] || []) : null;
  const eventsForDay = allEvents.filter(e => e.date === selectedDate);
  const afterImpact  = eventsForDay.filter(e => impactFilter === 'all' || e.impact === impactFilter);
  const afterPair    = relevantCurrencies
    ? afterImpact.filter(e => relevantCurrencies.includes(e.currency))
    : afterImpact;
  const visibleEvents = afterPair.length > 0 ? afterPair : (afterImpact.length > 0 ? afterImpact : eventsForDay);

  // Next upcoming high event today
  const nextHighEvent = allEvents
    .filter(e => e.date === todayStr && e.impact === 'high')
    .map(e => ({ ...e, mins: getMinutesUntil(e.time, e.date) }))
    .filter(e => e.mins !== null && e.mins >= 0 && e.mins <= 120)
    .sort((a, b) => a.mins - b.mins)[0];

  const getDay = (d) => {
    const ds = d.toISOString().split('T')[0];
    const evts = allEvents.filter(e => e.date === ds);
    return { ds, total: evts.length, high: evts.filter(e => e.impact === 'high').length, med: evts.filter(e => e.impact === 'medium').length };
  };

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
    <div className="space-y-3">
      <div className={cn('rounded-2xl overflow-hidden border', th.border, th.bg)}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className={cn('flex items-center justify-between px-4 py-3 border-b', th.border, darkMode ? 'bg-black' : 'bg-zinc-100')}>
          <div className="flex items-center gap-2">
            <Calendar className={cn('w-4 h-4', th.sub)} />
            <span className={cn('text-sm font-black tracking-[0.12em]', th.text)}>ECON CALENDAR</span>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowWeekOverview(v => !v)}
              className={cn('p-2 rounded-lg border transition-all', th.border,
                showWeekOverview ? (darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white') : cn(th.muted, th.hover))}>
              <List className="w-4 h-4" />
            </button>
            {'Notification' in window && (
              <button onClick={toggleNotifications}
                className={cn('p-2 rounded-lg border transition-all', th.border,
                  notifEnabled ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : cn(th.muted, th.hover))}>
                {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
            )}
            {lastUpdate && (
              <span className={cn('text-xs tabular-nums hidden sm:inline', th.muted)}>
                {lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={() => fetchEvents(false)} disabled={loading}
              className={cn('p-2 rounded-lg border transition-all', th.border, th.muted, th.hover, loading && 'opacity-40')}>
              <RefreshCw className={cn('w-4 h-4', (loading || refreshing) && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Refresh bar */}
        <AnimatePresence>
          {refreshing && (
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
              style={{ transformOrigin: 'left' }} className="h-0.5 bg-teal-500 w-full" />
          )}
        </AnimatePresence>

        {/* ── NEXT HIGH EVENT COUNTDOWN BANNER ─────────────────── */}
        <AnimatePresence>
          {nextHighEvent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className={cn('border-b', th.border, 'bg-rose-500/10')}>
              <div className="flex items-center gap-3 px-4 py-2">
                <Timer className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="text-rose-400 text-xs font-black tracking-widest hidden sm:inline">{ct.nextHigh}</span>
                <span className={cn('text-xs font-semibold truncate flex-1', th.sub)}>
                  <span className={cn('font-black', CURRENCY_COLORS[nextHighEvent.currency] || th.sub)}>{nextHighEvent.currency}</span>
                  {' '}{nextHighEvent.event}
                </span>
                <span className="text-rose-400 text-sm font-black tabular-nums flex-shrink-0 animate-pulse">
                  {formatCountdown(nextHighEvent.mins)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CURRENCY HEATMAP ─────────────────────────────────── */}
        <AnimatePresence>
          {showHeatmap && eventsForDay.length > 0 && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className={cn('overflow-hidden border-b', th.border, darkMode ? 'bg-zinc-900/40' : 'bg-zinc-50')}>
              <div className="flex items-center justify-between px-4 pt-2 pb-0">
                <span className={cn('text-xs font-black tracking-widest', th.muted)}>{ct.heatmap}</span>
                <button onClick={() => setShowHeatmap(false)}
                  className={cn('text-xs', th.muted, 'hover:underline')}>{ct.hideHeatmap}</button>
              </div>
              <CurrencyHeatmap events={eventsForDay} darkMode={darkMode} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── WEEK NAV ─────────────────────────────────────────── */}
        <div className={cn('border-b', th.border)}>
          <div className={cn('flex items-center justify-between px-4 py-2', darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50')}>
            <button onClick={() => setWeekOffset(w => w - 1)}
              className={cn('p-1.5 rounded-lg transition-colors', th.muted, th.hover)}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => { setWeekOffset(0); setSelectedDate(todayStr); }}
              className={cn('text-sm font-black tracking-widest transition-colors px-3 py-1 rounded-lg', th.sub, th.hover)}>
              {weekOffset === 0 ? ct.thisWeek : weekOffset === 1 ? ct.nextWeek : weekOffset > 0 ? `+${weekOffset}W` : `${weekOffset}W`}
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)}
              className={cn('p-1.5 rounded-lg transition-colors', th.muted, th.hover)}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3 pt-2">
            {days.map(day => {
              const { ds, total, high, med } = getDay(day);
              const isTd  = ds === todayStr;
              const isSel = ds === selectedDate;
              const dow   = format(day, 'EEE', { locale: dateLocale }).toUpperCase().slice(0, 2);
              const dom   = format(day, 'd');
              return (
                <button key={ds} onClick={() => setSelectedDate(ds)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[52px] flex-shrink-0 transition-all',
                    isSel
                      ? darkMode ? 'bg-white border-white' : 'bg-zinc-900 border-zinc-900'
                      : isTd ? 'border-teal-500/60 bg-teal-500/10'
                      : cn(th.border, th.bgAlt, th.hover)
                  )}>
                  <span className={cn('text-[10px] font-bold tracking-wider leading-none',
                    isSel ? (darkMode ? 'text-black' : 'text-white') : isTd ? 'text-teal-400' : th.muted)}>
                    {dow}
                  </span>
                  <span className={cn('text-base font-black leading-none',
                    isSel ? (darkMode ? 'text-black' : 'text-white') : isTd ? 'text-teal-400' : th.text)}>
                    {dom}
                  </span>
                  <div className="flex gap-0.5">
                    {high > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    {med  > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    {total === 0 && <span className={cn('text-[8px]', th.muted)}>·</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FILTER BAR ───────────────────────────────────────── */}
        <div className={cn('flex items-center gap-2 px-4 py-2.5 border-b flex-wrap', th.border)}>
          {[
            { key: 'high',   label: ct.highFilter },
            { key: 'medium', label: ct.medFilter },
            { key: 'all',    label: ct.allFilter },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setImpactFilter(key)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-black tracking-wider transition-all',
                impactFilter === key
                  ? darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'
                  : cn(th.muted, th.hover, 'border', th.border)
              )}>
              {label}
            </button>
          ))}

          <span className={cn('w-px h-4 self-center', darkMode ? 'bg-zinc-700' : 'bg-zinc-300')} />

          {/* Pair filter */}
          <div className="relative">
            <button
              onClick={() => setPairPickerOpen(p => !p)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-black tracking-wider transition-all border',
                selectedPair !== 'Alle'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : cn(th.muted, th.hover, th.border)
              )}>
              {selectedPair === 'Alle' ? ct.pairBtn : `⚡ ${selectedPair}`}
            </button>
            <AnimatePresence>
              {pairPickerOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setPairPickerOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className={cn(
                      'absolute left-0 top-full mt-1 z-30 rounded-xl border shadow-2xl overflow-hidden',
                      th.border, darkMode ? 'bg-zinc-900' : 'bg-white'
                    )}
                    style={{ minWidth: 160 }}>
                    <div className="grid grid-cols-2 gap-0.5 p-1.5 max-h-60 overflow-y-auto scrollbar-hide">
                      {PAIRS.map(p => (
                        <button key={p}
                          onClick={() => { setSelectedPair(p); setPairPickerOpen(false); }}
                          className={cn(
                            'px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all text-left',
                            selectedPair === p
                              ? darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'
                              : cn(th.muted, th.hover)
                          )}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <span className={cn('ml-auto text-sm font-bold', th.muted)}>
            {visibleEvents.length} {visibleEvents.length !== 1 ? ct.eventsPlural : ct.events}
          </span>
        </div>

        {/* ── EVENT TABLE ──────────────────────────────────────── */}
        <div className="overflow-y-auto" style={{ maxHeight: 600 }}>
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-14">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-teal-500"
                    animate={{ y: [0,-8,0] }} transition={{ duration: 0.6, delay: i*0.15, repeat: Infinity }} />
                ))}
              </div>
              <span className={cn('text-[10px] tracking-widest font-bold', th.muted)}>{ct.loading}</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <AlertTriangle className={cn('w-7 h-7', th.muted)} />
              <p className={cn('text-sm', th.muted)}>{ct.error}</p>
              <button onClick={() => fetchEvents(false)} className="text-teal-500 text-xs font-bold hover:underline">{ct.retry}</button>
            </div>
          ) : visibleEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14">
              <span className="text-3xl">📅</span>
              <p className={cn('text-sm font-bold', th.sub)}>{ct.noEvents}</p>
              <p className={cn('text-[11px]', th.muted)}>{ct.noEventsHint}</p>
            </div>
          ) : (
            <>
              <div className={cn('grid grid-cols-[80px_1fr_120px] border-b px-5 py-2', th.border, darkMode ? 'bg-zinc-900/40' : 'bg-zinc-50')}>
                <span className={cn('text-xs font-black tracking-widest', th.muted)}>{ct.timeCol}</span>
                <span className={cn('text-xs font-black tracking-widest', th.muted)}>{ct.eventCol}</span>
                <span className={cn('text-xs font-black tracking-widest text-right', th.muted)}>{ct.valCol}</span>
              </div>

              {visibleEvents.map((evt, idx) => {
                const imp      = IMPACT[evt.impact] || IMPACT.low;
                const live     = isLiveNow(evt.time, evt.date);
                const curClr   = CURRENCY_COLORS[evt.currency] || th.sub;
                const hasRes   = evt.actual !== null && evt.actual !== undefined && evt.actual !== '';
                const numA     = parseFloat(evt.actual);
                const numF     = parseFloat(evt.forecast);
                const beat     = hasRes && !isNaN(numA) && !isNaN(numF) && numA > numF;
                const miss     = hasRes && !isNaN(numA) && !isNaN(numF) && numA < numF;
                const isOpen   = expandedId === evt.id;
                const isRelevant = relevantCurrencies ? relevantCurrencies.includes(evt.currency) : false;
                const avgPips  = getAvgPips(evt.event);

                return (
                  <motion.div key={evt.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.015, 0.3) }}
                    onClick={() => setExpandedId(isOpen ? null : evt.id)}
                    className={cn(
                      'border-b last:border-b-0 cursor-pointer transition-colors',
                      th.border,
                      live
                        ? (darkMode ? 'bg-teal-950/40 border-l-2 border-l-teal-500' : 'bg-teal-50 border-l-2 border-l-teal-500')
                        : isRelevant
                          ? (darkMode ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : 'bg-blue-50 border-l-2 border-l-blue-400')
                          : (isOpen ? th.bgAlt : th.hover)
                    )}>

                    <div className="grid grid-cols-[80px_1fr_120px] px-5 py-3 items-start">

                      {/* TIME + IMPACT + COUNTDOWN */}
                      <div className="flex flex-col items-start gap-1">
                        <span className={cn('text-sm font-black tabular-nums leading-none', live ? 'text-teal-400' : th.sub)}>
                          {evt.time || '–'}
                        </span>
                        <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black', imp.pill)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full inline-block flex-shrink-0', imp.bg)} />
                          {imp.label}
                        </div>
                        {live
                          ? <span className="text-[9px] font-black text-teal-400 animate-pulse">● {ct.live}</span>
                          : <CountdownBadge timeStr={evt.time} dateStr={evt.date} nowLabel={ct.nowLabel} />
                        }
                      </div>

                      {/* CURRENCY + EVENT + BADGES */}
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={cn('text-sm font-black', curClr)}>{evt.currency}</span>
                          {hasRes && <SurpriseBadge actual={evt.actual} forecast={evt.forecast} />}
                          {!hasRes && evt.impact === 'high' && <AvgPipsBadge eventName={evt.event} darkMode={darkMode} />}
                        </div>
                        <p className={cn('text-sm font-semibold leading-snug', th.text)}>{evt.event}</p>
                      </div>

                      {/* VALUES */}
                      <div className="text-right">
                        {hasRes ? (
                          <span className={cn('text-base font-black tabular-nums block',
                            beat ? 'text-teal-400' : miss ? 'text-rose-400' : th.text)}>
                            {evt.actual}{beat ? '▲' : miss ? '▼' : ''}
                          </span>
                        ) : (
                          <span className={cn('text-base font-black', th.muted)}>–</span>
                        )}
                        {evt.forecast && (
                          <span className={cn('text-xs tabular-nums block', th.muted)}>
                            {ct.forecast} {evt.forecast}
                          </span>
                        )}
                        {evt.previous && (
                          <span className={cn('text-xs tabular-nums block opacity-60', th.muted)}>
                            {ct.previous} {evt.previous}
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
                          <div className={cn('mx-4 mb-2 rounded-xl border grid grid-cols-3 divide-x', th.border,
                            darkMode ? 'bg-zinc-900 divide-zinc-800' : 'bg-zinc-100 divide-zinc-200')}>
                            {[
                              { label: ct.actualLbl, val: evt.actual, color: beat ? 'text-teal-400' : miss ? 'text-rose-400' : th.text },
                              { label: ct.forecastLbl, val: evt.forecast, color: th.sub },
                              { label: ct.previousLbl, val: evt.previous, color: th.muted },
                            ].map(({ label, val, color }) => (
                              <div key={label} className="flex flex-col items-center py-3 gap-1">
                                <span className={cn('text-[9px] font-black tracking-widest', th.muted)}>{label}</span>
                                <span className={cn('text-base font-black tabular-nums', color)}>{val || '—'}</span>
                              </div>
                            ))}
                          </div>
                          {/* Extra info row */}
                          <div className="flex gap-2 px-4 pb-3 flex-wrap">
                            {hasRes && <SurpriseBadge actual={evt.actual} forecast={evt.forecast} />}
                            {avgPips && <AvgPipsBadge eventName={evt.event} darkMode={darkMode} />}
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

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <div className={cn('flex items-center justify-between px-4 py-2.5 border-t', th.border, darkMode ? 'bg-black/50' : 'bg-zinc-50')}>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className={cn('text-xs font-bold', th.muted)}>{ct.high}</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className={cn('text-xs font-bold', th.muted)}>{ct.medium}</span>
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className={cn('text-xs font-bold', th.muted)}>{ct.low}</span>
          </div>
          <div className="flex items-center gap-3">
            {!showHeatmap && (
              <button onClick={() => setShowHeatmap(true)}
                className={cn('text-xs font-bold', th.muted, 'hover:underline')}>{ct.showHeatmap}</button>
            )}
            <span className={cn('text-xs', th.muted)}>{ct.footerPV}</span>
          </div>
        </div>
      </div>

      {/* ── WEEK OVERVIEW PANEL ──────────────────────────────────── */}
      <AnimatePresence>
        {showWeekOverview && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}>
            <WeekOverview
              allEvents={allEvents}
              todayStr={todayStr}
              onSelectDate={(ds) => { setSelectedDate(ds); setShowWeekOverview(false); setWeekOffset(0); }}
              darkMode={darkMode}
              ct={ct}
              dateLocale={dateLocale}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}