import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, ClipboardCheck, Shield, Target,
  ArrowUp, CheckCircle2, Activity, History, LineChart,
  HelpCircle, Lock, ShieldCheck, Globe, ChevronRight,
  TrendingUp, Filter, BookOpen, BarChart2, Layers
} from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

const MODULES = [
  {
    icon: Layers,
    title: 'Multi-Timeframe Analyse',
    desc: 'Wöchentlich, täglich, 4H und Entry-Ebene. Jede Zeiteinheit hat ihren definierten Beitrag zum Gesamtscore.',
  },
  {
    icon: Filter,
    title: 'Konfluenz & Score',
    desc: 'Nur wenn alle relevanten Ebenen übereinstimmen, wird ein Trade freigegeben. Kein Score unter 85% — kein Trade.',
  },
  {
    icon: Shield,
    title: 'Risikomanagement',
    desc: 'Positionsgröße, SL/TP und R:R-Verhältnis werden direkt in der Analyse berechnet.',
  },
  {
    icon: BookOpen,
    title: 'Trade Journal',
    desc: 'Jeder Trade wird mit Setup, Ergebnis und Screenshots dokumentiert. Kein Lernen ohne Rückblick.',
  },
  {
    icon: BarChart2,
    title: 'Performance Review',
    desc: 'Winrate, Profit Factor, durchschnittliches R:R und Konsistenz über Zeit — messbar und transparent.',
  },
  {
    icon: TrendingUp,
    title: 'GO / NO-GO Entscheid',
    desc: 'Das System gibt eine klare Empfehlung. Nicht auf Basis von Bauchgefühl, sondern auf Basis von Regelwerk.',
  },
];

const PRINCIPLES = [
  { label: 'Kein Trade ohne Konfluenz.' },
  { label: 'Kein Einstieg an Resistance, kein Verkauf an Support.' },
  { label: 'Jeder Trade folgt einem definierten Regelwerk.' },
  { label: 'Disziplin wird durch Struktur erzwungen, nicht durch Willenskraft.' },
  { label: 'Performance entsteht durch Wiederholbarkeit, nicht durch Glück.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDailyQuote, setShowDailyQuote] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);

    const checkUserSettings = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setShowDailyQuote(userData.show_daily_quote_in_app || false);
        }
      } catch {}
    };
    checkUserSettings();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSub: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSec: darkMode ? 'text-zinc-400' : 'text-zinc-500',
    textDim: darkMode ? 'text-zinc-600' : 'text-zinc-400',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    borderSub: darkMode ? 'border-zinc-800/60' : 'border-zinc-200',
  };

  const logoSrc = darkMode
    ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
    : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png";

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>

      {/* ── HEADER ── */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50 backdrop-blur-sm`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
          </div>

          {/* Center — Logo */}
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <img
              src={logoSrc}
              alt="ZNPCV"
              className="h-8 sm:h-9 md:h-10 w-auto hover:opacity-75 transition-opacity"
            />
          </button>

          {/* Right */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <AccountButton />
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className={`${theme.bg} border-b ${theme.borderSub}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Hero Copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs tracking-widest mb-8 font-sans ${darkMode ? 'border-zinc-700 text-zinc-400 bg-zinc-900' : 'border-zinc-300 text-zinc-500 bg-zinc-100'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                TRADING DECISION SYSTEM
              </div>

              <h1 className={`text-4xl sm:text-5xl md:text-6xl tracking-wider leading-tight mb-6 ${theme.text}`}>
                Regelbasierte<br />
                Entscheidungen.<br />
                <span className={theme.textSec}>Jeder Trade.</span>
              </h1>

              <p className={`text-base sm:text-lg font-sans leading-relaxed mb-3 max-w-xl ${theme.textSec}`}>
                ZNPCV ist ein strukturiertes Analyse- und Entscheidungssystem für disziplinierte Trader. Keine Signale, keine Spekulation. Konfluenz, Regelwerk, GO / NO-GO.
              </p>

              <p className={`text-sm font-sans leading-relaxed mb-10 max-w-xl ${theme.textDim}`}>
                Multi-Timeframe Analyse · Konfluenz-Score · Risikomanagement · Trade Journal · Performance Review
              </p>

              {/* Trust Points */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-10">
                {[
                  'Mindestens 85% Konfluenz',
                  'W · D · 4H · Entry',
                  'GO / NO-GO Entscheid',
                  'Integriertes Journaling',
                ].map(p => (
                  <div key={p} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className={`text-xs font-sans ${theme.textSec}`}>{p}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(createPageUrl('Checklist'))}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold tracking-widest text-sm transition-all group",
                    darkMode ? "bg-white text-black hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-800"
                  )}
                >
                  Analyse starten
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate(createPageUrl('Dashboard'))}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold tracking-widest text-sm transition-all border",
                    darkMode ? "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white" : "border-zinc-300 text-zinc-600 hover:border-zinc-500 hover:text-zinc-900"
                  )}
                >
                  Dashboard öffnen
                </button>
              </div>
            </motion.div>

            {/* Hero Visual — Product Window */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden lg:block"
            >
              <div className={cn(
                "rounded-2xl border overflow-hidden shadow-2xl",
                darkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                {/* Window chrome */}
                <div className={cn("flex items-center gap-2 px-4 py-3 border-b", darkMode ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-zinc-100")}>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <span className={`ml-3 text-xs font-sans tracking-wider ${theme.textDim}`}>ZNPCV · Analyse · EUR/USD</span>
                </div>

                {/* Mock content */}
                <div className="p-5 space-y-4">
                  {/* Pair + direction */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xl tracking-wider ${theme.text}`}>EUR/USD</div>
                      <div className={`text-xs font-sans mt-0.5 ${theme.textDim}`}>LONG · Weekly Bullish</div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 border border-emerald-600/40 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-500 font-sans font-bold tracking-wider">GO</span>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="space-y-2.5">
                    {[
                      { label: 'Weekly', score: 55, max: 60 },
                      { label: 'Daily', score: 50, max: 60 },
                      { label: '4H', score: 30, max: 35 },
                      { label: 'Entry', score: 20, max: 25 },
                    ].map(row => (
                      <div key={row.label} className="flex items-center gap-3">
                        <span className={`text-xs font-sans w-12 flex-shrink-0 ${theme.textDim}`}>{row.label}</span>
                        <div className={cn("flex-1 h-1.5 rounded-full overflow-hidden", darkMode ? "bg-zinc-800" : "bg-zinc-200")}>
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${(row.score / row.max) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono w-14 text-right flex-shrink-0 ${theme.textSec}`}>
                          {row.score}/{row.max}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total score */}
                  <div className={cn("flex items-center justify-between px-4 py-3 rounded-xl border", darkMode ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white")}>
                    <span className={`text-xs tracking-widest ${theme.textDim}`}>GESAMTSCORE</span>
                    <span className="text-2xl tracking-wider text-emerald-500">89%</span>
                  </div>

                  {/* Risk row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'SL', value: '1.0820' },
                      { label: 'TP', value: '1.1120' },
                      { label: 'R:R', value: '1 : 3.0' },
                    ].map(r => (
                      <div key={r.label} className={cn("px-3 py-2.5 rounded-lg border text-center", darkMode ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white")}>
                        <div className={`text-[10px] tracking-widest mb-1 ${theme.textDim}`}>{r.label}</div>
                        <div className={`text-sm font-mono ${theme.text}`}>{r.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={`${theme.bgSub} border-b ${theme.borderSub}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <div className={`text-xs tracking-widest mb-4 ${theme.textDim}`}>DER PROZESS</div>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl tracking-wider ${theme.text}`}>
              Struktur statt Impuls
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 md:gap-8 relative">
            {/* Connector line (desktop) */}
            <div className={cn("hidden sm:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px", darkMode ? "bg-zinc-800" : "bg-zinc-200")} />

            {[
              {
                step: '01',
                title: 'Markt strukturieren',
                desc: 'Zeitrahmen analysieren, Trend bestimmen, AOI definieren. Klares Bild vor jedem Schritt.',
              },
              {
                step: '02',
                title: 'Regelwerk prüfen',
                desc: 'Konfluenz auf Weekly, Daily, 4H und Entry-Ebene. Jedes Kriterium zählt zum Score.',
              },
              {
                step: '03',
                title: 'GO oder NO-GO',
                desc: 'Erst bei mindestens 85% Konfluenz wird ein Trade freigegeben. Darunter: kein Trade.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-lg tracking-wider border relative z-10",
                  darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
                )}>
                  {s.step}
                </div>
                <h3 className={`text-base sm:text-lg tracking-wider mb-2 ${theme.text}`}>{s.title}</h3>
                <p className={`text-sm font-sans leading-relaxed max-w-xs mx-auto ${theme.textSec}`}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className={`${theme.bg} border-b ${theme.borderSub}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
            <div>
              <div className={`text-xs tracking-widest mb-4 ${theme.textDim}`}>KERNMODULE</div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl tracking-wider ${theme.text}`}>
                Ein vollständiges System
              </h2>
            </div>
            <p className={`text-sm font-sans max-w-sm ${theme.textSec}`}>
              Analyse, Entscheidung, Risiko, Dokumentation und Review — in einer konsistenten Plattform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  "p-6 rounded-2xl border transition-colors group",
                  darkMode
                    ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-colors",
                  darkMode ? "bg-zinc-800 group-hover:bg-zinc-700" : "bg-zinc-200 group-hover:bg-zinc-300"
                )}>
                  <mod.icon className={`w-5 h-5 ${theme.text}`} />
                </div>
                <h3 className={`text-base tracking-wider mb-2 ${theme.text}`}>{mod.title}</h3>
                <p className={`text-sm font-sans leading-relaxed ${theme.textSec}`}>{mod.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRINCIPLES ── */}
      <section className={`${theme.bgSub} border-b ${theme.borderSub}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className={`text-xs tracking-widest mb-4 ${theme.textDim}`}>ZNPCV PRINZIPIEN</div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl tracking-wider mb-6 ${theme.text}`}>
                Disziplin ist kein Charakter.<br />
                <span className={theme.textSec}>Sie ist ein Prozess.</span>
              </h2>
              <p className={`text-sm font-sans leading-relaxed max-w-md ${theme.textSec}`}>
                ZNPCV ist kein Signal-Tool. Kein Indikator-Set. Es ist ein Entscheidungssystem, das impulsives Handeln durch definierte Struktur ersetzt.
              </p>
            </div>
            <div className="space-y-3">
              {PRINCIPLES.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-xl border",
                    darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                  )}
                >
                  <div className="w-1 h-6 rounded-full bg-emerald-600 flex-shrink-0" />
                  <span className={`text-sm font-sans ${theme.text}`}>{p.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={`${theme.bg} border-b ${theme.borderSub}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '85%+', label: 'Mindest-Konfluenz für einen Trade' },
              { value: 'W · D · 4H', label: 'Analysierte Zeitrahmen vor Entry' },
              { value: '7', label: 'Schritte im strukturierten Prozess' },
              { value: '4', label: 'Erkannte Chart-Muster im System' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className={`text-3xl sm:text-4xl tracking-wider mb-2 ${theme.text}`}>{s.value}</div>
                <div className={`text-xs font-sans leading-snug ${theme.textDim}`}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`${theme.bgSub} border-b ${theme.borderSub}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={`text-xs tracking-widest mb-6 ${theme.textDim}`}>BEREIT ZU BEGINNEN</div>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl tracking-wider mb-5 ${theme.text}`}>
              Strukturierte Analyse.<br />
              <span className={theme.textSec}>Ab dem ersten Trade.</span>
            </h2>
            <p className={`text-sm font-sans mb-10 max-w-md mx-auto leading-relaxed ${theme.textSec}`}>
              Kein Setup. Keine Lernkurve für das Grundprinzip. Starte die erste Analyse und folge dem Regelwerk.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate(createPageUrl('Checklist'))}
                className={cn(
                  "flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold tracking-widest text-sm transition-all group",
                  darkMode ? "bg-white text-black hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}
              >
                Erste Analyse starten
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate(createPageUrl('FAQ'))}
                className={cn(
                  "flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold tracking-widest text-sm transition-all border",
                  darkMode ? "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white" : "border-zinc-300 text-zinc-600 hover:border-zinc-500 hover:text-zinc-900"
                )}
              >
                Mehr erfahren
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`${theme.bg} border-t ${theme.border}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10 md:mb-12">

            {/* Brand */}
            <div className="md:col-span-4">
              <img src={logoSrc} alt="ZNPCV" className="h-10 w-auto mb-4" />
              <p className={`text-sm font-sans leading-relaxed mb-6 max-w-xs ${theme.textSec}`}>
                Ein regelbasiertes Trading-Entscheidungssystem. Entwickelt für Trader, die Klarheit und Struktur über Impuls und Zufall stellen.
              </p>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-sans ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-500'}`}>
                  <Lock className="w-3 h-3" />
                  SSL
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-sans ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-500'}`}>
                  <ShieldCheck className="w-3 h-3" />
                  DSGVO
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="md:col-span-4">
              <h4 className={`text-xs tracking-widest mb-5 ${theme.textDim}`}>BEREICHE</h4>
              <div className="space-y-3">
                {[
                  { label: 'Analyse starten', page: 'Checklist', icon: ClipboardCheck },
                  { label: 'Dashboard', page: 'Dashboard', icon: BarChart3 },
                  { label: 'Trade History', page: 'TradeHistory', icon: History },
                  { label: 'Live Charts', page: 'Charts', icon: LineChart },
                  { label: 'FAQ', page: 'FAQ', icon: HelpCircle },
                ].map(item => (
                  <button
                    key={item.page}
                    onClick={() => navigate(createPageUrl(item.page))}
                    className={`flex items-center gap-3 text-sm font-sans transition-colors group ${theme.textSec} hover:${theme.text}`}
                  >
                    <item.icon className={`w-4 h-4 ${theme.textDim} group-hover:text-emerald-600 transition-colors`} />
                    {item.label}
                    <ChevronRight className={`w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${theme.textDim}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="md:col-span-4">
              <h4 className={`text-xs tracking-widest mb-5 ${theme.textDim}`}>KONTAKT</h4>
              <a
                href="mailto:support@znpcv.com"
                className={`block text-sm font-sans mb-2 transition-colors hover:text-emerald-600 ${theme.textSec}`}
              >
                support@znpcv.com
              </a>
              <p className={`text-xs font-sans leading-relaxed mt-6 ${theme.textDim}`}>
                Fragen zum System, zur Analyse-Methodik oder zum Zugang beantwortet unser Support.
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className={`pt-8 border-t ${theme.border} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
              <span className={theme.textDim}>© {new Date().getFullYear()} ZNPCV</span>
              <span className={theme.textDim}>·</span>
              <button onClick={() => navigate(createPageUrl('Impressum'))} className={`transition-colors hover:text-emerald-600 ${theme.textDim}`}>Impressum</button>
              <span className={theme.textDim}>·</span>
              <button onClick={() => navigate(createPageUrl('Datenschutz'))} className={`transition-colors hover:text-emerald-600 ${theme.textDim}`}>Datenschutz</button>
              <span className={theme.textDim}>·</span>
              <button onClick={() => navigate(createPageUrl('AGB'))} className={`transition-colors hover:text-emerald-600 ${theme.textDim}`}>Nutzungsbedingungen</button>
            </div>
            <p className={`text-xs font-sans ${theme.textDim} text-center sm:text-right max-w-sm`}>
              Trading birgt Risiken. Vergangene Ergebnisse sind keine Garantie für zukünftige Gewinne.
            </p>
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
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-50 transition-colors ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}