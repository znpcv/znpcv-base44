import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, HelpCircle, ChevronDown, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';

const FAQ_DATA = [
  {
    category: 'GRUNDLAGEN',
    questions: [
      {
        q: 'Was ist ZNPCV?',
        a: 'ZNPCV ist eine professionelle Trading-Checkliste, die dich zwingt, strukturiert und diszipliniert zu analysieren. Keine emotionalen Trades mehr – nur A+++ Setups mit Multi-Timeframe Confluence!'
      },
      {
        q: 'Für wen ist ZNPCV?',
        a: 'Für Trader die fertig sind mit impulsiven, emotionalen Entscheidungen. Ob du Forex, Crypto, Stocks, Commodities oder Indices tradest - ZNPCV zwingt Disziplin, Struktur und Konsistenz in jeden einzelnen Trade.'
      },
      {
        q: 'Welche Assets kann ich analysieren?',
        a: 'ZNPCV unterstützt alle Major Forex Paare, aber die Methodik funktioniert auch für Crypto, Stocks, Commodities und Indices.'
      },

      {
        q: 'Wie funktioniert die 85% Regel?',
        a: 'ZNPCV empfiehlt nur Trades mit mindestens 85% Score. Das entspricht einem A+++ Setup mit maximaler Confluence über alle Timeframes (Weekly, Daily, 4H und Entry).'
      }
    ]
  },
  {
    category: 'TRADING KONZEPTE',
    questions: [
      {
        q: 'Was ist AOI (Area of Interest)?',
        a: 'AOI (Area of Interest) ist die zentrale Preiszone wo du einsteigen möchtest. Es kombiniert Support/Resistance, Struktur und Confluence und ist der EINZIGE Bereich wo ein Trade erlaubt ist.'
      },
      {
        q: 'Was ist RPL (Round Psych Level)?',
        a: 'RPL (Round Psych Level) ist ein rundes Zahlen-Level (wie 1.1000, 1.2000, 2000, 50000) das viele Trader und Algorithmen beobachten. Diese psychologischen Levels dienen oft als starker Support oder Resistance.'
      },
      {
        q: 'Was ist eine EMA?',
        a: 'Eine EMA (Exponential Moving Average) ist ein gleitender Durchschnitt der mehr Gewicht auf aktuelle Preisdaten legt. Sie wird verwendet um Trend-Richtung und dynamische Support/Resistance zu definieren.'
      },
      {
        q: 'Was ist MSS / SOS?',
        a: 'MSS (Market Structure Shift) oder SOS (Shift of Structure) bedeutet die Trendstruktur hat sich geändert - zum Beispiel von höheren Highs/höheren Lows zu tieferen Highs/tieferen Lows, oft vor einem größeren Reversal.'
      },
      {
        q: 'Was sind Swing High und Swing Low?',
        a: 'Ein Swing High ist ein lokaler Peak wo der Preis abgelehnt wird und nach unten dreht. Ein Swing Low ist ein lokaler Bottom wo der Preis abgelehnt wird und nach oben dreht. Sie markieren wichtige Wendepunkte.'
      }
    ]
  },
  {
    category: 'CHART PATTERNS',
    questions: [
      {
        q: 'Was ist eine Engulfing Candle?',
        a: 'Eine Engulfing Candle ist ein starkes Reversal Pattern wo der Body der aktuellen Kerze den Body der vorherigen Kerze komplett umschließt, signalisiert aggressive Kontrolle durch Käufer oder Verkäufer.'
      },
      {
        q: 'Was ist ein Head and Shoulders Pattern?',
        a: 'Ein Head and Shoulders ist ein Reversal Pattern mit drei Peaks: ein linker Shoulder, ein höherer Head, und ein rechter Shoulder, signalisiert oft das Ende eines Uptrends. Ein Inverse Head and Shoulders ist die bullish Mirror Version am Bottom.'
      },
      {
        q: 'Was ist ein Double Top und Double Bottom?',
        a: 'Ein Double Top bildet sich wenn der Preis das gleiche Resistance Level zweimal testet und scheitert, oft signalisiert bearish Reversal. Ein Double Bottom ist die bullish Version am Support, wo der Preis das gleiche Low zweimal ablehnt bevor es steigt.'
      },
      {
        q: 'Welche Patterns werden unterstützt?',
        a: 'ZNPCV unterstützt vier Chart Patterns: Double Top, Double Bottom, Head & Shoulders (H&S) und Inverted Head & Shoulders (INV H&S). Diese müssen auf Weekly, Daily oder 4H Timeframe erscheinen.'
      }
    ]
  },
  {
    category: 'GOLDENE REGELN',
    questions: [
      {
        q: 'Was bedeuten die goldenen Regeln?',
        a: 'Die ZNPCV Goldenen Regeln sind: 1) Wir kaufen IM oder ÜBER dem AOI (Support), 2) Wir verkaufen IM oder UNTER dem AOI (Resistance), 3) NIE am Boden verkaufen, NIE am Top kaufen! Diese Regeln schützen dich vor emotionalen Fehlentscheidungen.'
      },
      {
        q: 'Warum nie am Top kaufen / Boden verkaufen?',
        a: 'Am Top zu kaufen bedeutet du kaufst in Resistance (hohe Wahrscheinlichkeit für Reversal). Am Boden zu verkaufen bedeutet du verkaufst in Support (hohe Wahrscheinlichkeit für Bounce). Beides verstößt gegen die AOI Logik und führt zu schlechten Entries.'
      }
    ]
  },
  {
    category: 'RISIKOMANAGEMENT',
    questions: [
      {
        q: 'Wie berechne ich meine Lot Size?',
        a: 'Der integrierte Lot Size Calculator berechnet automatisch deine optimale Position basierend auf Account Size, Risk %, Entry, Stop Loss und dem gewählten Pair. Gib einfach deine Daten ein!'
      },
      {
        q: 'Was ist ein gutes R:R Verhältnis?',
        a: 'ZNPCV empfiehlt mindestens 1:2.5 Risk:Reward. Das bedeutet, für jeden Dollar den du riskierst, solltest du mindestens 2.50$ Profit-Potential haben. Bei schlechterem R:R wird eine Warnung angezeigt.'
      },
      {
        q: 'Wie viel sollte ich pro Trade riskieren?',
        a: 'Die goldene Regel: Nie mehr als 1-2% deines Accounts pro Trade. Der ZNPCV Calculator hilft dir, die exakte Lot Size zu berechnen basierend auf deinem individuellen Risk %.'
      }
    ]
  },
  {
    category: 'FEATURES & FUNKTIONEN',
    questions: [
      {
        q: 'Was ist die Multi-Timeframe Analyse?',
        a: 'ZNPCV analysiert Weekly (max 60%), Daily (max 60%), 4H (max 35%) und Entry (max 25%) Timeframes systematisch. Nur wenn alle übereinstimmen (Confluence), hast du ein A+++ Setup mit 85%+ Score.'
      },
      {
        q: 'Kann ich meine Trades speichern?',
        a: 'Ja! Alle deine Analysen werden automatisch gespeichert. Du kannst sie jederzeit im Dashboard aufrufen, bearbeiten oder löschen. Jede Analyse bekommt einen eindeutigen Status (In Progress / Ready to Trade).'
      },
      {
        q: 'Gibt es einen Performance Tracker?',
        a: 'Ja, das Dashboard zeigt alle deine Analysen, Stats, Win/Loss Ratio, durchschnittliche Completion, historische Performance mit Chart, und einen integrierten Kalender für deine Trades.'
      },
      {
        q: 'Was ist der Economic Calendar?',
        a: 'Der Economic Calendar zeigt wichtige Wirtschafts-Events (High/Medium/Low Impact) die Marktbewegungen verursachen können. Plane deine Trades rund um diese Events für bessere Ergebnisse.'
      }
    ]
  },
  {
    category: 'ACCOUNT & SICHERHEIT',
    questions: [
      {
        q: 'Wie erstelle ich einen Account?',
        a: 'Klicke auf "Login" und folge den Anweisungen. Die Registrierung ist schnell und sicher über Base44 Authentication. Keine Kreditkarte nötig.'
      },
      {
        q: 'Sind meine Daten sicher?',
        a: 'Ja! ZNPCV nutzt SSL-Verschlüsselung, sichere Datenbanken und ist DSGVO-konform. Alle Daten werden verschlüsselt gespeichert und niemals an Dritte weitergegeben.'
      },
      {
        q: 'Kann ich meinen Account löschen?',
        a: 'Ja, kontaktiere uns einfach per E-Mail an support@znpcv.com und wir löschen deinen Account und alle Daten sofort gemäß DSGVO-Richtlinien.'
      }
    ]
  }
];

export default function FAQPage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button onClick={() => navigate(createPageUrl('Home'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors p-2 sm:p-2.5`}>
                <Home className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img 
                src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV" 
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-16">
        <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-100/50'} rounded-2xl p-6 sm:p-8 md:p-10 mb-8 sm:mb-10 md:mb-12 border-2 ${theme.border}`}>
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
            <HelpCircle className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${theme.text}`} />
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl tracking-widest mb-3 sm:mb-4 text-center ${theme.text}`}>FAQ</h1>
          <p className={`text-center text-xs sm:text-sm ${theme.textSecondary}`}>Häufig gestellte Fragen zu ZNPCV</p>
        </div>

        {FAQ_DATA.map((category, catIndex) => (
          <motion.div key={catIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIndex * 0.1 }}
            className="mb-6 sm:mb-8">
            <h2 className={`text-base sm:text-lg md:text-xl tracking-widest mb-3 sm:mb-4 ${theme.text} pl-2`}>{category.category}</h2>
            <div className="space-y-3 sm:space-y-4">
              {category.questions.map((item, qIndex) => {
                const index = `${catIndex}-${qIndex}`;
                const isOpen = openIndex === index;
                return (
                  <div key={qIndex} className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl overflow-hidden ${darkMode ? 'bg-zinc-900/30' : 'bg-white'}`}>
                    <button type="button" onClick={() => setOpenIndex(isOpen ? null : index)}
                      className={`w-full p-4 sm:p-5 md:p-6 flex items-center justify-between gap-3 ${darkMode ? 'hover:bg-zinc-900/70' : 'hover:bg-zinc-100'} transition-colors`}>
                      <span className={`text-left font-bold tracking-wider text-sm sm:text-base md:text-lg ${theme.text}`}>{item.q}</span>
                      <ChevronDown className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-transform flex-shrink-0", isOpen && "rotate-180", theme.textMuted)} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className={`border-t-2 ${theme.border}`}>
                          <div className={`p-4 sm:p-5 md:p-6 ${theme.textSecondary} text-sm sm:text-base font-sans leading-relaxed`}>
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Contact Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className={`mt-8 sm:mt-12 md:mt-16 p-6 sm:p-8 md:p-10 border-2 ${theme.border} rounded-2xl ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-100/50'} text-center`}>
          <h3 className={`text-lg sm:text-xl md:text-2xl tracking-widest mb-3 sm:mb-4 ${theme.text}`}>WEITERE FRAGEN?</h3>
          <p className={`${theme.textMuted} mb-5 sm:mb-6 md:mb-8 text-sm sm:text-base font-sans`}>
            Kontaktiere uns direkt per E-Mail
          </p>
          <div className="flex justify-center">
            <a href="mailto:support@znpcv.com" className={`inline-flex items-center gap-2 sm:gap-3 ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} rounded-xl px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 text-sm sm:text-base font-bold transition-colors border-2 ${darkMode ? 'border-white' : 'border-zinc-900'}`}>
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              support@znpcv.com
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`mt-12 sm:mt-16 md:mt-20 lg:mt-24 border-t ${theme.border}`}>
        <div className="py-6 sm:py-8 md:py-10">
          <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
            <img src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            } alt="ZNPCV" className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto opacity-40" />
            <p className={`${theme.textMuted} text-xs sm:text-sm tracking-widest`}>© {new Date().getFullYear()} ZNPCV</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <button onClick={() => navigate(createPageUrl('Impressum'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
              Impressum
            </button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
              Datenschutz
            </button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
              AGB
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}