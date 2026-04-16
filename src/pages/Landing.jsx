/**
 * ZNPCV Landing Page — znpcv.com
 * Öffentliche Hauptseite / Brand- und Informationsseite.
 * Enthält keine proprietären Strategie-Inhalte.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ArrowRight, CheckCircle2, Shield, Target,
  Layers, BarChart3, Lock, Globe, Zap, ArrowUp, Mail,
  BookOpen, Sliders, Star, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage, DarkModeToggle, LanguageToggle } from '@/components/LanguageContext';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Im Preview (localhost / base44.app) öffnet goToApp() dieselbe App mit dem Pfad,
// damit alle Links testbar bleiben. Auf znpcv.com wird zu znpcv.de geleitet.
const APP_URL = (() => {
  const host = window.location.hostname;
  if (host === 'znpcv.com' || host === 'www.znpcv.com') return 'https://znpcv.de';
  // Preview / Staging: selbe Origin, andere Route
  return window.location.origin;
})();

// ─── FAQ DATA — keine Strategie-Inhalte ───────────────────────────────────────
const FAQ = [
  {
    category: 'GRUNDLAGEN',
    questions: [
      {
        q: 'Was ist ZNPCV?',
        a: 'ZNPCV ist ein strukturiertes Entscheidungs-Framework für Trader. Es hilft dabei, Trading-Entscheidungen regelbasiert, diszipliniert und nachvollziehbar zu treffen — anstatt impulsiv oder emotional zu handeln. ZNPCV steht für Klarheit, Struktur und Kontrolle.'
      },
      {
        q: 'Für wen ist ZNPCV geeignet?',
        a: 'Für Trader, die ihre Entscheidungsprozesse strukturieren möchten. Unabhängig von Markt, Stil oder Erfahrungsstand. ZNPCV ist kein Signal-Service und keine Empfehlung — es ist ein Framework zur eigenen strukturierten Analyse.'
      },
      {
        q: 'Welche Märkte kann ich mit ZNPCV analysieren?',
        a: 'Die ZNPCV Checkliste ist marktunabhängig und individuell konfigurierbar. Du kannst eigene Kriterien für Forex, Kryptowährungen, Aktien, Rohstoffe oder Indizes einrichten.'
      },
    ]
  },
  {
    category: 'ZNPCV CHECKLISTE',
    questions: [
      {
        q: 'Was ist die ZNPCV Checkliste?',
        a: 'Die ZNPCV Checkliste ist ein frei konfigurierbares Entscheidungs-Framework. Du baust dir deine eigene Struktur aus Sektionen und Kriterien — und erhältst für jeden Trade eine klare GO / NO-GO Bewertung auf Basis deiner eigenen Regeln.'
      },
      {
        q: 'Was kann ich mit der Checkliste machen?',
        a: 'Du kannst eigene Sektionen erstellen, eigene Kriterien definieren, kritische Pflichtkriterien markieren, Notizen und Learnings erfassen, Trades dokumentieren und deinen Entscheidungsprozess langfristig nachvollziehbar machen.'
      },
      {
        q: 'Ist die Checkliste frei anpassbar?',
        a: 'Ja. Du kannst Sektionen hinzufügen, umbenennen und entfernen. Kriterien sind individuell definierbar. Es gibt keine festen Vorgaben, die du übernehmen musst. Du baust das Framework nach deiner eigenen Logik auf.'
      },
      {
        q: 'Was bekomme ich für 99 USD?',
        a: 'Lebenslangen Zugang zur ZNPCV Checkliste. Frei konfigurierbar, individuell anpassbar, mit Trade-Dokumentation, GO/NO-GO Bewertung, Verlauf und Notiz-Funktion. Einmalige Zahlung — kein Abo.'
      },
      {
        q: 'Kann ich meine eigene Strategie-Logik in der Checkliste abbilden?',
        a: 'Ja. Die Checkliste ist genau dafür gedacht. Du definierst deine Kriterien selbst — ob technische Signale, strukturelle Bedingungen oder persönliche Regeln. ZNPCV gibt dir das Framework, die Logik kommt von dir.'
      },
    ]
  },
  {
    category: 'PRODUKTTRENNUNG',
    questions: [
      {
        q: 'Was ist der Unterschied zwischen Checkliste und Strategie?',
        a: 'Die ZNPCV Checkliste (99 USD) ist ein frei konfigurierbares Framework — du bringst deine eigene Logik mit. Die ZNPCV Strategie (2.499 USD) ist ein separates proprietäres Produkt mit eigenen, nicht öffentlich zugänglichen Regeln und Entscheidungsstrukturen. Beide Produkte sind vollständig getrennt.'
      },
      {
        q: 'Muss ich die ZNPCV Strategie nutzen, um die Checkliste sinnvoll einzusetzen?',
        a: 'Nein. Die Checkliste funktioniert vollständig unabhängig von der Strategie. Du kannst sie mit deiner eigenen Logik nutzen, ohne das Strategie-Produkt zu kennen oder zu besitzen.'
      },
      {
        q: 'Warum sind Checkliste und Strategie getrennte Produkte?',
        a: 'Weil sie fundamental unterschiedliche Dinge sind. Die Checkliste ist ein offenes, konfigurierbares Framework. Die Strategie ist ein proprietäres, geschlossenes System mit eigenen Regeln. Eine Vermischung würde keinem der beiden Produkte gerecht werden.'
      },
      {
        q: 'Was ist das Strategie-Produkt für 2.499 USD?',
        a: 'Die ZNPCV Strategie ist ein exklusives, proprietäres Produkt. Die konkreten Inhalte — Regeln, Entscheidungsstrukturen, Kriterien — sind nicht öffentlich zugänglich und werden nur an Käufer dieses Produkts weitergegeben. Es ist ein optionales, eigenständiges Produkt.'
      },
    ]
  },
  {
    category: 'ZUGANG & KAUF',
    questions: [
      {
        q: 'Wo kaufe ich die Produkte?',
        a: 'Der Kauf und Zugang erfolgt auf znpcv.de — dem geschützten Produkt- und Anwendungsbereich von ZNPCV. Dort findest du Login, Kauf und Nutzung beider Produkte.'
      },
      {
        q: 'Sind meine Daten sicher?',
        a: 'Ja. Alle Daten werden verschlüsselt übertragen und gespeichert. Zahlungsabwicklung erfolgt ausschließlich über Stripe — wir haben keinen Zugriff auf Zahlungsdaten.'
      },
      {
        q: 'Gibt es Abonnements?',
        a: 'Nein. Beide Produkte sind Einmalkäufe mit lebenslangem Zugang. Kein Abo, keine laufenden Gebühren.'
      },
    ]
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { darkMode } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    textDimmed: darkMode ? 'text-zinc-600' : 'text-zinc-400',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    borderCard: darkMode ? 'border-zinc-800' : 'border-zinc-300',
  };

  const goToApp = (path = '') => {
    window.open(`${APP_URL}${path}`, '_blank', 'noopener');
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>

      {/* ── HEADER ── */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <img
            src={darkMode
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            }
            alt="ZNPCV"
            className="h-8 sm:h-10 md:h-12 w-auto"
          />
          <div className="flex items-center gap-2 sm:gap-3">
            <DarkModeToggle />
            <LanguageToggle />
            <button
              onClick={() => goToApp()}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border-2 text-xs sm:text-sm font-bold tracking-widest transition-all',
                darkMode
                  ? 'bg-white text-black border-white hover:bg-zinc-200'
                  : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
              )}
            >
              <span className="hidden sm:inline">ZUR APP</span>
              <span className="sm:hidden">APP</span>
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className={`${theme.bgSecondary} border-b ${theme.border}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-28 lg:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-700/10 border border-emerald-700/30 rounded-full text-emerald-600 text-[11px] sm:text-xs tracking-widest mb-6 sm:mb-8">
              <Zap className="w-3 h-3" />
              STRUKTURIERTES TRADING-FRAMEWORK
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider font-light mb-4 sm:mb-6">
              ZNPCV
            </h1>
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl tracking-widest ${theme.textSecondary} mb-4 sm:mb-6`}>
              Klarheit. Struktur. Disziplin.
            </p>
            <p className={`text-sm sm:text-base md:text-lg font-sans leading-relaxed max-w-2xl mx-auto ${darkMode ? 'text-zinc-300' : 'text-zinc-600'} mb-8 sm:mb-10 md:mb-12`}>
              ZNPCV ist ein Entscheidungs-Framework für Trader, die aufgehört haben zu raten.
              Regelbasiert. Nachvollziehbar. Konsequent.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => goToApp()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl sm:rounded-2xl font-bold tracking-widest text-sm transition-all"
              >
                JETZT STARTEN
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#produkte"
                className={cn(
                  'w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold tracking-widest text-sm border-2 transition-all',
                  darkMode
                    ? 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                    : 'border-zinc-300 text-zinc-700 hover:border-zinc-500'
                )}
              >
                PRODUKTE
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WOFÜR ZNPCV STEHT ── */}
      <section className={`py-16 sm:py-20 md:py-24 border-b ${theme.border}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-3">WOFÜR ZNPCV STEHT</h2>
              <p className={`text-sm sm:text-base font-sans ${theme.textMuted} max-w-xl mx-auto`}>
                Vier Prinzipien, die jede Entscheidung im System leiten.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                { icon: Target, title: 'KLARHEIT', desc: 'Jede Entscheidung basiert auf klaren, vorher definierten Kriterien. Kein Interpretationsspielraum im entscheidenden Moment.' },
                { icon: Layers, title: 'STRUKTUR', desc: 'Dein Entscheidungsprozess folgt einem festen Framework — nicht dem Bauchgefühl des Augenblicks.' },
                { icon: Shield, title: 'DISZIPLIN', desc: 'Regeln gelten immer. Nicht nur dann, wenn es bequem ist. Disziplin ist keine Eigenschaft, sie ist ein System.' },
                { icon: BarChart3, title: 'KONTROLLE', desc: 'Dokumentierte Entscheidungen. Nachvollziehbarer Prozess. Lerneffekte, die sich im Laufe der Zeit summieren.' },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`p-5 sm:p-6 rounded-2xl border-2 ${theme.borderCard} ${theme.bgCard}`}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', darkMode ? 'bg-white' : 'bg-zinc-900')}>
                    <item.icon className={cn('w-5 h-5', darkMode ? 'text-black' : 'text-white')} />
                  </div>
                  <h3 className={`text-xs sm:text-sm tracking-widest font-bold mb-2 ${theme.text}`}>{item.title}</h3>
                  <p className={`text-xs sm:text-sm font-sans leading-relaxed ${theme.textMuted}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SO FUNKTIONIERT ZNPCV ── */}
      <section className={`py-16 sm:py-20 md:py-24 border-b ${theme.border} ${theme.bgSecondary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-3">SO FUNKTIONIERT ZNPCV</h2>
              <p className={`text-sm sm:text-base font-sans ${theme.textMuted} max-w-2xl mx-auto`}>
                Der Ablauf ist einfach. Die Wirkung entsteht durch Konsequenz.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {[
                {
                  step: '01',
                  title: 'Checkliste aufbauen',
                  desc: 'Du definierst deine eigenen Kriterien und Sektionen. Was muss erfüllt sein, bevor du handelst? Du bringst deine eigene Logik mit — ZNPCV gibt dir das Framework dafür.'
                },
                {
                  step: '02',
                  title: 'Trade analysieren',
                  desc: 'Vor jedem Trade gehst du deine Checkliste durch. Punkt für Punkt. Keine Ausnahmen. Der Prozess ist identisch — unabhängig von Marktbedingungen oder Stimmung.'
                },
                {
                  step: '03',
                  title: 'GO / NO-GO entscheiden',
                  desc: 'ZNPCV berechnet eine klare Bewertung. Alle kritischen Kriterien erfüllt? GO. Kritische Punkte offen? NO GO. Die Entscheidung folgt dem System, nicht dem Moment.'
                },
                {
                  step: '04',
                  title: 'Dokumentieren & lernen',
                  desc: 'Alle Entscheidungen werden gespeichert. Notizen, Learnings, Verlauf. Über Zeit entsteht ein klares Bild — was funktioniert, was nicht und warum.'
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={cn('flex gap-5 sm:gap-6 p-5 sm:p-6 rounded-2xl border-2', theme.borderCard, theme.bg)}
                >
                  <div className={`text-2xl sm:text-3xl font-light flex-shrink-0 ${theme.textDimmed}`}>{item.step}</div>
                  <div>
                    <h3 className={`text-sm sm:text-base tracking-widest font-bold mb-1.5 ${theme.text}`}>{item.title.toUpperCase()}</h3>
                    <p className={`text-xs sm:text-sm font-sans leading-relaxed ${theme.textMuted}`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRODUKTE ── */}
      <section id="produkte" className={`py-16 sm:py-20 md:py-24 border-b ${theme.border}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-3">ZWEI PRODUKTE. KLAR GETRENNT.</h2>
              <p className={`text-sm sm:text-base font-sans ${theme.textMuted} max-w-2xl mx-auto`}>
                ZNPCV besteht aus zwei vollständig eigenständigen Produkten, die nichts miteinander vermischen.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">

              {/* Checkliste */}
              <div className={cn('border-2 rounded-2xl p-6 sm:p-8 flex flex-col', theme.borderCard, theme.bgCard)}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', darkMode ? 'bg-white' : 'bg-zinc-900')}>
                    <Sliders className={cn('w-5 h-5', darkMode ? 'text-black' : 'text-white')} />
                  </div>
                  <div>
                    <div className={`text-[10px] tracking-widest ${theme.textMuted}`}>PRODUKT 1</div>
                    <h3 className={`text-sm sm:text-base tracking-wider font-bold ${theme.text}`}>ZNPCV CHECKLISTE</h3>
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-light mb-1">$99</div>
                <div className={`text-xs font-sans mb-5 ${theme.textMuted}`}>einmalig · Lifetime</div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {[
                    'Frei konfigurierbares Entscheidungs-Framework',
                    'Eigene Sektionen, Kriterien und Regeln',
                    'GO / NO-GO Bewertung nach eigener Logik',
                    'Trade-Dokumentation mit Notizen und Verlauf',
                    'Vollständig unabhängig von der ZNPCV Strategie',
                    'Lebenslanger Zugang — einmalige Zahlung',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className={`text-xs sm:text-sm font-sans ${theme.textSecondary}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => goToApp('/FreeChecklist')}
                  className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold tracking-widest text-xs border-2 border-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  ZUGANG STARTEN
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Strategie */}
              <div className={cn(
                'border-2 rounded-2xl p-6 sm:p-8 flex flex-col',
                darkMode ? 'border-amber-600/30 bg-amber-950/10' : 'border-amber-400/30 bg-amber-50/50'
              )}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', 'bg-amber-600')}>
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className={`text-[10px] tracking-widest ${theme.textMuted}`}>PRODUKT 2</div>
                    <h3 className={`text-sm sm:text-base tracking-wider font-bold ${theme.text}`}>ZNPCV STRATEGIE</h3>
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-light mb-1">$2.499</div>
                <div className={`text-xs font-sans mb-5 ${theme.textMuted}`}>einmalig · optional</div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {[
                    'Separates, proprietäres Produkt',
                    'Eigene, nicht öffentliche Regeln und Strukturen',
                    'Unabhängig von der freien Checkliste',
                    'Zugang nur für Käufer dieses Produkts',
                    'Kein Abo, kein Support-Zuschlag',
                    'Lebenslanger Zugang — einmalige Zahlung',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className={`text-xs sm:text-sm font-sans ${theme.textSecondary}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => goToApp('/Checklist')}
                  className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-widest text-xs border-2 border-amber-600 transition-all flex items-center justify-center gap-2"
                >
                  MEHR ERFAHREN
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Produkttrennung Hinweis */}
            <div className={cn('mt-5 p-4 sm:p-5 rounded-xl border text-center', theme.border, theme.bgSecondary)}>
              <p className={`text-xs sm:text-sm font-sans ${theme.textMuted} leading-relaxed`}>
                Die ZNPCV Checkliste und die ZNPCV Strategie sind zwei vollständig eigenständige Produkte.
                Die Checkliste ist kein vereinfachtes Abbild der Strategie.
                Die Strategie enthält keine öffentlich zugänglichen Inhalte aus der Checkliste.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CHECKLISTE IM DETAIL ── */}
      <section className={`py-16 sm:py-20 md:py-24 border-b ${theme.border} ${theme.bgSecondary}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-3">DIE CHECKLISTE IM DETAIL</h2>
              <p className={`text-sm sm:text-base font-sans ${theme.textMuted} max-w-2xl mx-auto`}>
                Ein professionelles Framework für strukturierte Entscheidungen — vollständig auf deine Arbeitsweise ausgerichtet.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[
                {
                  icon: Sliders,
                  title: 'VOLLSTÄNDIG KONFIGURIERBAR',
                  desc: 'Sektionen, Kriterien und Regeln sind frei definierbar. Du baust das Framework nach deiner eigenen Logik — nicht umgekehrt.'
                },
                {
                  icon: CheckCircle2,
                  title: 'GO / NO-GO SYSTEM',
                  desc: 'Kritische Kriterien können als Pflichtpunkte markiert werden. Ein offener Pflichtpunkt ergibt automatisch NO GO — unabhängig von der Gesamtbewertung.'
                },
                {
                  icon: BookOpen,
                  title: 'TRADE-DOKUMENTATION',
                  desc: 'Alle Entscheidungen werden gespeichert. Notizen und Learnings direkt im Eintrag. Vollständiger Verlauf über alle Instrumente und Zeiträume.'
                },
                {
                  icon: Star,
                  title: 'KRITISCHE KRITERIEN',
                  desc: 'Einzelne Punkte können als absolut notwendig definiert werden. Ein Trade ohne erfüllte Pflichtpunkte ist kein Trade.'
                },
                {
                  icon: Layers,
                  title: 'VORLAGEN-SYSTEM',
                  desc: 'Starte mit einer der mitgelieferten Basis-Vorlagen oder baue alles von Grund auf. Die Vorlage ist ein Startpunkt, kein Limit.'
                },
                {
                  icon: Globe,
                  title: 'MARKTUNABHÄNGIG',
                  desc: 'Forex, Krypto, Aktien, Rohstoffe — die Checkliste ist nicht an einen Markt gebunden. Du definierst, wofür sie gilt.'
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={cn('p-5 rounded-2xl border-2', theme.borderCard, theme.bg)}
                >
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', darkMode ? 'bg-zinc-800' : 'bg-zinc-200')}>
                    <item.icon className={cn('w-4 h-4', theme.text)} />
                  </div>
                  <h3 className={`text-[10px] sm:text-xs tracking-widest font-bold mb-2 ${theme.text}`}>{item.title}</h3>
                  <p className={`text-xs font-sans leading-relaxed ${theme.textMuted}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`py-16 sm:py-20 md:py-24 border-b ${theme.border}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-3">HÄUFIGE FRAGEN</h2>
              <p className={`text-sm sm:text-base font-sans ${theme.textMuted}`}>
                Antworten auf die wichtigsten Fragen zu ZNPCV.
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {FAQ.map((cat, ci) => (
                <div key={ci}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-1 h-5 rounded-full ${darkMode ? 'bg-white' : 'bg-zinc-900'}`} />
                    <span className={`text-[10px] sm:text-xs tracking-widest font-bold ${theme.textMuted}`}>{cat.category}</span>
                  </div>
                  <div className="space-y-2.5">
                    {cat.questions.map((item, qi) => {
                      const key = `${ci}-${qi}`;
                      const isOpen = openFaq === key;
                      return (
                        <div
                          key={key}
                          className={cn('border rounded-xl overflow-hidden', theme.border, darkMode ? 'bg-zinc-900/50' : 'bg-white')}
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : key)}
                            className={cn(
                              'w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left transition-colors',
                              darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'
                            )}
                          >
                            <span className={`text-xs sm:text-sm font-bold tracking-wider ${theme.text}`}>{item.q}</span>
                            <ChevronDown className={cn('w-4 h-4 flex-shrink-0 transition-transform', theme.textMuted, isOpen && 'rotate-180')} />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={`border-t ${theme.border}`}
                              >
                                <div className={`p-4 sm:p-5 text-xs sm:text-sm font-sans leading-relaxed ${theme.textSecondary}`}>
                                  {item.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`py-16 sm:py-20 md:py-24 border-b ${theme.border} ${theme.bgSecondary}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl sm:text-2xl md:text-3xl tracking-widest mb-4">BEREIT ZU STARTEN?</h2>
            <p className={`text-sm sm:text-base font-sans leading-relaxed max-w-xl mx-auto mb-8 sm:mb-10 ${theme.textMuted}`}>
              Der Zugang zu beiden Produkten erfolgt über znpcv.de — den geschützten Produkt- und Anwendungsbereich von ZNPCV.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => goToApp()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold tracking-widest text-sm transition-all"
              >
                ZU ZNPCV.DE
                <ExternalLink className="w-4 h-4" />
              </button>
              <a
                href="mailto:support@znpcv.com"
                className={cn(
                  'w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold tracking-widest text-sm border-2 transition-all',
                  darkMode
                    ? 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                    : 'border-zinc-300 text-zinc-700 hover:border-zinc-500'
                )}
              >
                <Mail className="w-4 h-4" />
                KONTAKT
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`py-10 sm:py-12 border-t ${theme.border}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">

            {/* Brand */}
            <div>
              <img
                src={darkMode
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV"
                className="h-12 w-auto mb-4 opacity-80"
              />
              <p className={`text-xs font-sans leading-relaxed ${theme.textMuted} max-w-xs`}>
                Strukturiertes Entscheidungs-Framework für Trader.
                Klarheit. Struktur. Disziplin.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <div className={`text-[10px] tracking-widest font-bold mb-3 ${theme.textMuted}`}>BEREICHE</div>
              <div className="space-y-2">
                {[
                  { label: 'Zur App (znpcv.de)', path: '' },
                  { label: 'ZNPCV Checkliste', path: '/FreeChecklist' },
                  { label: 'ZNPCV Strategie', path: '/Checklist' },
                ].map(link => (
                  <button
                    key={link.label}
                    onClick={() => goToApp(link.path)}
                    className={`flex items-center gap-2 text-xs font-sans transition-colors ${theme.textMuted} hover:text-emerald-600`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kontakt */}
            <div>
              <div className={`text-[10px] tracking-widest font-bold mb-3 ${theme.textMuted}`}>KONTAKT</div>
              <a
                href="mailto:support@znpcv.com"
                className={`flex items-center gap-2 text-xs font-sans transition-colors ${theme.textMuted} hover:text-emerald-600`}
              >
                <Mail className="w-3 h-3" />
                support@znpcv.com
              </a>
            </div>

          </div>

          <div className={`pt-6 border-t ${theme.border} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <p className={`text-xs ${theme.textMuted}`}>© {new Date().getFullYear()} ZNPCV — Zainspective Group</p>
            <div className="flex items-center gap-4 text-xs">
              <a href={`${APP_URL}/Impressum`} target="_blank" rel="noopener" className={`${theme.textMuted} hover:text-emerald-600 transition-colors`}>Impressum</a>
              <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              <a href={`${APP_URL}/Datenschutz`} target="_blank" rel="noopener" className={`${theme.textMuted} hover:text-emerald-600 transition-colors`}>Datenschutz</a>
              <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              <a href={`${APP_URL}/AGB`} target="_blank" rel="noopener" className={`${theme.textMuted} hover:text-emerald-600 transition-colors`}>AGB</a>
            </div>
            <p className={`text-[10px] font-sans ${theme.textDimmed} text-center sm:text-right max-w-md`}>
              Trading birgt Risiken. Vergangene Ergebnisse sind keine Garantie für zukünftige Gewinne.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
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