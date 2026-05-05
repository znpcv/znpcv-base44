import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';

export default function ImpressumPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    bgCard: darkMode ? 'bg-zinc-900/30' : 'bg-white',
    bgHero: darkMode ? 'bg-zinc-900/50' : 'bg-zinc-100/50',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button
                onClick={() => navigate(createPageUrl('Home'))}
                className={`${darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400'} border-2 rounded-lg sm:rounded-xl p-2 sm:p-2.5 transition-all group`}>
                <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.text} group-hover:-translate-x-1 transition-transform`} />
              </button>
            </div>
            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img
                src={darkMode
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV"
                className="h-12 sm:h-12 md:h-14 lg:h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            <div className="w-[84px] sm:w-[92px]" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-16">
        <div className={`${theme.bgHero} rounded-2xl p-6 sm:p-8 md:p-10 mb-8 border-2 ${theme.border}`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-widest mb-2 text-center">IMPRESSUM</h1>
          <p className={`text-center text-xs sm:text-sm ${theme.textSecondary}`}>Angaben gemäß § 5 TMG</p>
        </div>

        <div className={`space-y-4 sm:space-y-6 ${theme.textSecondary} font-sans leading-relaxed text-sm sm:text-base`}>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>Diensteanbieter</h2>
            <p className={`${theme.text} font-semibold mb-1`}>ZNPCV Ltd.</p>
            <p>Betreiber der Plattform ZNPCV</p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>Kontakt</h2>
            <p>E-Mail: <a href="mailto:support@znpcv.com" className="text-emerald-600 hover:underline">support@znpcv.com</a></p>
            <p>Website: <a href="https://www.znpcv.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">www.znpcv.com</a></p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>Umsatzsteuer-Identifikationsnummer</h2>
            <p>Gemäß § 27a Umsatzsteuergesetz wird die USt-IdNr. auf schriftliche Anfrage mitgeteilt.</p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>Verantwortlich für den Inhalt gemäß § 55 Abs. 2 RStV</h2>
            <p className={`${theme.text} font-semibold`}>ZNPCV Ltd.</p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>Haftungsausschluss (Disclaimer)</h2>

            <h3 className={`font-semibold ${theme.text} mb-2`}>Haftung für Inhalte</h3>
            <p className="mb-4">
              Die Inhalte dieser Plattform wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
            </p>

            <h3 className={`font-semibold ${theme.text} mb-2`}>Haftung für Links</h3>
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>

            <h3 className={`font-semibold ${theme.text} mb-2`}>Risikohinweis für Finanzinstrumente</h3>
            <p>
              ZNPCV ist ausschließlich ein Analyse- und Dokumentationswerkzeug für private Trader. Die auf dieser Plattform bereitgestellten Inhalte stellen keine Anlageberatung, keine Finanzanalyse und keine Empfehlung zum Kauf oder Verkauf von Finanzinstrumenten im Sinne des Wertpapierhandelsgesetzes (WpHG) dar. Der Handel mit Devisen, Kryptowährungen, Aktien, Rohstoffen und Derivaten ist mit erheblichen Risiken verbunden und kann zum vollständigen Verlust des eingesetzten Kapitals führen. Vergangene Wertentwicklungen bieten keine Garantie für zukünftige Ergebnisse. Jeder Nutzer trägt die alleinige und vollständige Verantwortung für seine Handelsentscheidungen.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>Urheberrecht</h2>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>Streitschlichtung</h2>
            <p className="mb-3">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">https://ec.europa.eu/consumers/odr/</a>
            </p>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

        </div>
      </main>

      <footer className={`mt-12 border-t ${theme.border}`}>
        <div className="py-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <img src={darkMode
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            } alt="ZNPCV" className="h-12 w-auto opacity-40" />
            <p className={`${theme.textSecondary} text-xs tracking-widest`}>© {new Date().getFullYear()} ZNPCV — ZNPCV Ltd.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <button onClick={() => navigate(createPageUrl('Impressum'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>Impressum</button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>Datenschutz</button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>AGB</button>
          </div>
        </div>
      </footer>
    </div>
  );
}