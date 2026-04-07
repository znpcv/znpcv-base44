/**
 * Landing.jsx — Öffentliche ZNPCV Website
 * Vollständig frei zugänglich. Kein Login erforderlich.
 * Trennt klar: public website ↔ protected app.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, Shield, Target, Activity,
  BarChart3, ClipboardCheck, History, Lock, Zap, ChevronDown,
  Globe, Star, TrendingUp, Award
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: 'Strukturierte Analyse',
    desc: 'Multi-Timeframe Checkliste — Weekly, Daily, 4H und Entry. Kein Schritt wird übersprungen.'
  },
  {
    icon: Target,
    title: 'Präzise Einstiegspunkte',
    desc: 'AOI, EMA, PSP, Swing Levels — jeder Faktor wird systematisch bewertet, bevor ein Trade möglich ist.'
  },
  {
    icon: Shield,
    title: 'Integriertes Risiko-Management',
    desc: 'Positionsrechner, R:R-Bewertung und SL/TP-Planung direkt im Analyse-Workflow.'
  },
  {
    icon: BarChart3,
    title: 'Performance Dashboard',
    desc: 'Vollständige Trade-Historie, Gewinnstatistiken, Drawdown-Analyse und Kalenderansicht.'
  },
  {
    icon: Activity,
    title: 'No-Trade Skill',
    desc: 'Strukturierte Dokumentation von bewusst gemiedenen Trades. Disziplin als messbarer Vorteil.'
  },
  {
    icon: History,
    title: 'Trade Journal',
    desc: 'Charts vor und nach dem Trade, Notizen, Outcome-Tracking und vollständige Auswertung.'
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Asset wählen', desc: 'Wähle dein Währungspaar oder Asset und die Richtung deiner Analyse.' },
  { step: '02', title: 'Timeframes analysieren', desc: 'Weekly → Daily → 4H. Jede Ebene wird systematisch nach definierten Kriterien bewertet.' },
  { step: '03', title: 'Score berechnen', desc: 'Das System berechnet einen Confluence-Score. Erst ab 85 % ist ein Trade im ZNPCV-Standard.' },
  { step: '04', title: 'Entry bestätigen', desc: 'MSS, Engulfing, Risiko-Management — der letzte Check vor der Ausführung.' },
  { step: '05', title: 'Dokumentieren', desc: 'Jeder Trade wird vollständig gespeichert und ausgewertet. Deine Performance wird messbar.' },
];

const FAQ_ITEMS = [
  {
    q: 'Für wen ist ZNPCV?',
    a: 'Für Trader, die mit strukturierten Entscheidungen arbeiten wollen. Ob Forex, Crypto, Aktien oder Indizes — das System funktioniert überall dort, wo technische Multi-Timeframe Analyse Sinn ergibt.'
  },
  {
    q: 'Was ist das Prinzip hinter dem System?',
    a: 'ZNPCV basiert auf dem Prinzip der kontrollierten Entscheidung: Ein Trade darf nur dann eingegangen werden, wenn alle relevanten Zeitrahmen eine klare Übereinstimmung (Confluence) zeigen. Das eliminiert impulsive Fehler strukturell.'
  },
  {
    q: 'Was bedeutet die 85%-Regel?',
    a: 'Der ZNPCV-Score fasst alle Analyse-Kriterien zu einer Zahl zusammen. Trades werden nur dann als A+++-Setup klassifiziert, wenn der Score 85 % oder mehr beträgt — also wenn wirklich alle wesentlichen Faktoren bestätigt sind.'
  },
  {
    q: 'Ist das ein Abo?',
    a: 'Nein. Einmalige Zahlung, dauerhafter Zugriff. Keine Verlängerungen, keine Gebühren, keine Überraschungen.'
  },
  {
    q: 'Welche Zahlungsmethoden werden akzeptiert?',
    a: 'Kreditkarte, SEPA-Lastschrift, Apple Pay, Google Pay. Die Abwicklung erfolgt sicher über Stripe.'
  },
  {
    q: 'Was passiert nach dem Kauf?',
    a: 'Der Zugang ist sofort aktiv. Einloggen, Dashboard öffnen, erste Analyse starten. Kein Warten, keine Aktivierung.'
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(async (authed) => {
        if (authed) {
          const me = await base44.auth.me().catch(() => null);
          setUser(me);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  // If user is authenticated and entitled → redirect to app home
  useEffect(() => {
    if (!checkingAuth && user) {
      // Check entitlement via sessionStorage cache first
      try {
        const raw = sessionStorage.getItem('znpcv_entitlement_cache');
        if (raw) {
          const { data, expires } = JSON.parse(raw);
          if (Date.now() < expires && (data.entitled || data.isAdmin)) {
            navigate(createPageUrl('Home'), { replace: true });
          }
        }
      } catch { /* ignore */ }
    }
  }, [checkingAuth, user, navigate]);

  const handleAppAccess = () => {
    navigate(createPageUrl('Access'));
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    borderCard: darkMode ? 'border-zinc-800' : 'border-zinc-300',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>

      {/* ── HEADER ── */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <DarkModeToggle />
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src={darkMode
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-8 sm:h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </button>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={handleAppAccess}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold tracking-widest transition-all border-2',
                darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
              )}
            >
              ZUGANG
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-700/10 border border-emerald-600/30 rounded-full text-emerald-600 text-xs mb-6 tracking-widest">
            <Zap className="w-3 h-3" />
            PROFESSIONELLES ANALYSE-SYSTEM
          </div>

          <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider mb-4 font-light ${theme.text}`}>
            ZNPCV
          </h1>

          <p className={`text-lg sm:text-xl md:text-2xl font-sans font-light max-w-2xl mx-auto mb-3 ${theme.textSecondary}`}>
            Die ultimative Trading-Checkliste für strukturierte, disziplinierte Handelsentscheidungen.
          </p>

          <p className={`text-sm sm:text-base font-sans italic max-w-xl mx-auto mb-10 ${theme.textMuted}`}>
            „Disziplin schlägt Talent. Jeden einzelnen Tag."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleAppAccess}
              className={cn(
                'group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold tracking-widest text-sm transition-all',
                darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'
              )}
            >
              ZUGANG STARTEN
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('wie-es-funktioniert')?.scrollIntoView({ behavior: 'smooth' })}
              className={cn(
                'flex items-center gap-2 px-8 py-4 rounded-2xl font-bold tracking-widest text-sm transition-all border-2',
                darkMode ? 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white' : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'
              )}
            >
              WIE ES FUNKTIONIERT
            </button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 sm:gap-6 mt-16 sm:mt-20 max-w-2xl mx-auto"
        >
          {[
            { value: '85%+', label: 'ZNPCV Standard' },
            { value: '7', label: 'Analyse-Schritte' },
            { value: '4', label: 'Chart-Muster' },
          ].map(({ value, label }) => (
            <div key={label} className={cn('text-center p-4 rounded-2xl border', theme.borderCard, theme.bgCard)}>
              <div className={`text-2xl sm:text-3xl font-light mb-1 ${theme.text}`}>{value}</div>
              <div className={`text-[10px] sm:text-xs tracking-widest ${theme.textMuted}`}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className={`${theme.bgSecondary} border-y ${theme.border} py-16 sm:py-20`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className={`text-xs tracking-widest mb-3 ${theme.textMuted}`}>DAS SYSTEM</div>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl tracking-wider ${theme.text}`}>Was ZNPCV bietet</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  'p-6 rounded-2xl border transition-all hover:border-emerald-600/40 group',
                  darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform',
                  darkMode ? 'bg-white' : 'bg-zinc-900'
                )}>
                  <Icon className={`w-5 h-5 ${darkMode ? 'text-black' : 'text-white'}`} />
                </div>
                <h3 className={`text-sm sm:text-base tracking-wider mb-2 ${theme.text}`}>{title}</h3>
                <p className={`text-sm font-sans leading-relaxed ${theme.textMuted}`}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="wie-es-funktioniert" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className={`text-xs tracking-widest mb-3 ${theme.textMuted}`}>ABLAUF</div>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl tracking-wider ${theme.text}`}>So funktioniert ZNPCV</h2>
          </div>
          <div className="space-y-4">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'flex items-start gap-5 p-5 sm:p-6 rounded-2xl border',
                  darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                )}
              >
                <div className={cn(
                  'text-2xl sm:text-3xl font-light flex-shrink-0 w-10 text-right',
                  darkMode ? 'text-zinc-700' : 'text-zinc-300'
                )}>
                  {step}
                </div>
                <div>
                  <h3 className={`text-sm sm:text-base tracking-wider mb-1 ${theme.text}`}>{title}</h3>
                  <p className={`text-sm font-sans leading-relaxed ${theme.textMuted}`}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRINCIPLES ── */}
      <section className={`${theme.bgSecondary} border-y ${theme.border} py-16 sm:py-20`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className={`text-xs tracking-widest mb-3 ${theme.textMuted}`}>PHILOSOPHIE</div>
            <h2 className={`text-2xl sm:text-3xl tracking-wider mb-4 ${theme.text}`}>Die ZNPCV Goldene Regel</h2>
            <p className={`text-sm sm:text-base font-sans max-w-2xl mx-auto leading-relaxed ${theme.textSecondary}`}>
              Nie kaufen in Resistance. Nie verkaufen in Support. Ein Long-Trade wird nur ausgeführt,
              wenn der Preis im oder über dem AOI ist. Ein Short-Trade nur im oder unter dem AOI.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, label: 'LONG', desc: 'Im oder über dem AOI. Niemals am Top kaufen.' },
              { icon: Shield, label: 'RISIKO', desc: 'Nie mehr als 1–2 % pro Trade. Positionsrechner inklusive.' },
              { icon: Award, label: 'STANDARD', desc: 'Nur A+++‑Setups ausführen. 85 % Confluence als Mindestanforderung.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className={cn('p-5 rounded-2xl border text-center', theme.borderCard, darkMode ? 'bg-zinc-900' : 'bg-white')}>
                <Icon className={`w-6 h-6 mx-auto mb-3 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`} />
                <div className={`text-xs tracking-widest mb-2 ${theme.text}`}>{label}</div>
                <p className={`text-xs font-sans leading-relaxed ${theme.textMuted}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className={`text-xs tracking-widest mb-3 ${theme.textMuted}`}>ZUGANG</div>
            <h2 className={`text-2xl sm:text-3xl tracking-wider ${theme.text}`}>Einmaliger Kauf. Dauerhafter Zugriff.</h2>
          </div>

          <div className={cn(
            'rounded-2xl border-2 p-7 sm:p-9 relative overflow-hidden',
            darkMode ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900'
          )}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 bg-black -translate-y-24 translate-x-24" />
            <div className="relative z-10">
              <div className={`text-xs tracking-widest mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>EINMALIGE ZAHLUNG</div>
              <div className="text-5xl sm:text-6xl font-bold mb-1">99 €</div>
              <div className={`text-sm mb-7 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>einmalig — kein Abo, kein Ablaufdatum</div>

              <div className="space-y-3 mb-7">
                {[
                  'Multi-Timeframe Analyse — W, D, 4H',
                  'Trading Dashboard und Performance-Tracking',
                  'Trade Journal mit vollständiger Historie',
                  'Positionsrechner und Risiko-Management',
                  'No-Trade Skill und strukturiertes Scoring',
                  'Alle künftigen Updates ohne Aufpreis',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0', darkMode ? 'bg-black' : 'bg-white')}>
                      <CheckCircle2 className={`w-3 h-3 ${darkMode ? 'text-white' : 'text-black'}`} />
                    </div>
                    <span className={`text-sm font-sans ${darkMode ? 'text-zinc-600' : 'text-zinc-300'}`}>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAppAccess}
                className={cn(
                  'w-full py-4 rounded-xl font-bold tracking-widest text-sm transition-all flex items-center justify-center gap-2 group',
                  darkMode ? 'bg-black text-white hover:bg-zinc-900' : 'bg-white text-black hover:bg-zinc-100'
                )}
              >
                ZUGANG AKTIVIEREN
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className={cn('text-center text-xs font-sans mt-3', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>
                Sichere Zahlung via Stripe · SSL verschlüsselt
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: Lock, label: 'Kein Abo' },
              { icon: Shield, label: 'SSL gesichert' },
              { icon: Star, label: 'Dauerhaft' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className={cn('p-3 rounded-xl border text-center', theme.borderCard, theme.bgCard)}>
                <Icon className={`w-4 h-4 mx-auto mb-1 ${theme.textMuted}`} />
                <div className={`text-[10px] tracking-widest ${theme.textMuted}`}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={`${theme.bgSecondary} border-t ${theme.border} py-16 sm:py-20`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className={`text-xs tracking-widest mb-3 ${theme.textMuted}`}>FAQ</div>
            <h2 className={`text-2xl sm:text-3xl tracking-wider ${theme.text}`}>Häufige Fragen</h2>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map(({ q, a }, i) => (
              <div
                key={i}
                className={cn('rounded-xl border overflow-hidden', darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className={cn(
                    'w-full flex items-center justify-between gap-4 p-5 text-left transition-colors',
                    darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50'
                  )}
                >
                  <span className={`text-sm sm:text-base font-bold tracking-wider ${theme.text}`}>{q}</span>
                  <ChevronDown className={cn(
                    'w-4 h-4 flex-shrink-0 transition-transform',
                    openFaq === i ? 'rotate-180' : '',
                    theme.textMuted
                  )} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={cn('border-t', theme.border)}
                    >
                      <p className={cn('p-5 text-sm font-sans leading-relaxed', theme.textSecondary)}>{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className={`text-sm font-sans mb-3 ${theme.textMuted}`}>Weitere Fragen?</p>
            <a
              href="mailto:support@znpcv.com"
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-widest transition-all border',
                darkMode ? 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white' : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'
              )}
            >
              support@znpcv.com
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`border-t ${theme.border} py-10`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 mb-6">
            <img
              src={darkMode
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-12 w-auto opacity-40"
            />
            <p className={`text-xs tracking-widest ${theme.textMuted}`}>© {new Date().getFullYear()} ZNPCV · Alle Rechte vorbehalten.</p>
            <p className={`text-xs font-sans max-w-md text-center leading-relaxed ${theme.textMuted}`}>
              Trading birgt Risiken. Vergangene Ergebnisse garantieren keine zukünftigen Gewinne.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => navigate(createPageUrl('Impressum'))}
              className={cn('transition-colors', darkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-700')}
            >
              Impressum
            </button>
            <span className={theme.textMuted}>·</span>
            <button
              onClick={() => navigate(createPageUrl('Datenschutz'))}
              className={cn('transition-colors', darkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-700')}
            >
              Datenschutz
            </button>
            <span className={theme.textMuted}>·</span>
            <button
              onClick={() => navigate(createPageUrl('AGB'))}
              className={cn('transition-colors', darkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-700')}
            >
              AGB
            </button>
            <span className={theme.textMuted}>·</span>
            <button
              onClick={() => navigate(createPageUrl('FAQ'))}
              className={cn('transition-colors', darkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-700')}
            >
              FAQ
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}