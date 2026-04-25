import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';

export default function AGBPage() {
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
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            <div className="w-[84px] sm:w-[92px]" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-16">
        <div className={`${theme.bgHero} rounded-2xl p-6 sm:p-8 md:p-10 mb-8 border-2 ${theme.border}`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-widest mb-2 text-center">ALLGEMEINE GESCHÄFTSBEDINGUNGEN</h1>
          <p className={`text-center text-xs sm:text-sm ${theme.textSecondary}`}>ZNPCV Ltd. — Stand: Januar 2025</p>
        </div>

        <div className={`space-y-4 sm:space-y-6 ${theme.textSecondary} font-sans leading-relaxed text-sm sm:text-base`}>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 1 Geltungsbereich und Vertragsparteien</h2>
            <p className="mb-3">
              (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") der ZNPCV Ltd. (nachfolgend „Anbieter") gelten für alle Verträge, die zwischen dem Anbieter und natürlichen oder juristischen Personen (nachfolgend „Nutzer") über die Nutzung der webbasierten Trading-Analyse-Plattform ZNPCV (nachfolgend „Plattform") geschlossen werden.
            </p>
            <p className="mb-3">
              (2) Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Nutzers werden selbst bei Kenntnis nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich schriftlich zugestimmt.
            </p>
            <p>
              (3) Die Plattform richtet sich ausschließlich an volljährige Personen. Die Nutzung durch Minderjährige ist untersagt.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 2 Vertragsschluss und Leistungsbeschreibung</h2>
            <p className="mb-3">
              (1) Der Vertrag zwischen dem Anbieter und dem Nutzer kommt durch die Registrierung auf der Plattform und die Bestätigung der AGB zustande. Mit Abschluss der Registrierung nimmt der Nutzer das Angebot des Anbieters auf Abschluss eines Nutzungsvertrages an.
            </p>
            <p className="mb-3">
              (2) Gegenstand des Vertrages ist die Bereitstellung einer webbasierten Analyse- und Dokumentationsplattform für Trading-Aktivitäten. Der Anbieter stellt dem Nutzer im Rahmen der gebuchten Zugangsebene folgende Funktionalitäten zur Verfügung:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>Multi-Timeframe-Analysewerkzeuge zur strukturierten Marktbeurteilung</li>
              <li>Digitale Trading-Checklisten zur Dokumentation und Selbstdisziplinierung</li>
              <li>Dashboard zur Leistungsverfolgung und statistischen Auswertung eigener Trades</li>
              <li>Digitales Trade-Journal zur Archivierung und Analyse vergangener Handelsentscheidungen</li>
              <li>Risikorechner zur Positionsgrößenbestimmung</li>
            </ul>
            <p>
              (3) Der Anbieter ist berechtigt, den Funktionsumfang der Plattform weiterzuentwickeln, zu erweitern oder technisch anzupassen, sofern dies die vertraglich geschuldeten Kernfunktionalitäten nicht wesentlich beeinträchtigt.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 3 Nutzungsrechte und Nutzungsbeschränkungen</h2>
            <p className="mb-3">
              (1) Der Anbieter räumt dem Nutzer für die Dauer des Vertragsverhältnisses ein nicht-exklusives, nicht übertragbares und nicht unterlizenzierbares Recht zur Nutzung der Plattform für eigene, private Handelszwecke ein.
            </p>
            <p className="mb-3">
              (2) Dem Nutzer ist untersagt:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>Die Plattform oder Teile davon zu vervielfältigen, zu verbreiten, öffentlich zugänglich zu machen oder kommerziell zu verwerten</li>
              <li>Zugangsdaten an Dritte weiterzugeben oder das Nutzerkonto mit Dritten zu teilen (Single-User-Lizenz)</li>
              <li>Automatisierte Abfragen (Bots, Crawler, Scraper) einzusetzen</li>
              <li>Technische Schutzmaßnahmen zu umgehen oder die Plattform-Integrität zu gefährden</li>
              <li>Die Plattform für rechtswidrige Zwecke zu nutzen</li>
            </ul>
            <p>
              (3) Bei Verstoß gegen die vorstehenden Beschränkungen ist der Anbieter berechtigt, den Zugang des Nutzers ohne Vorankündigung und fristlos zu sperren. Schadensersatzansprüche bleiben vorbehalten.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 4 Entgelt und Zahlungsbedingungen</h2>
            <p className="mb-3">
              (1) Die Nutzung kostenpflichtiger Funktionen der Plattform setzt den Abschluss eines Abonnements voraus. Die jeweils aktuellen Preise sind der Preisübersicht auf der Plattform zu entnehmen.
            </p>
            <p className="mb-3">
              (2) Die Zahlungsabwicklung erfolgt ausschließlich über den zertifizierten Zahlungsdienstleister Stripe, Inc. Die Zahlung ist mit Abschluss des Bestellvorgangs fällig. Bei Lastschrift oder Kreditkartenzahlung erfolgt die Belastung unmittelbar nach Vertragsschluss.
            </p>
            <p>
              (3) Alle angegebenen Preise verstehen sich inklusive der gesetzlichen Umsatzsteuer, sofern nicht anders angegeben.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 5 Widerrufsrecht für Verbraucher</h2>
            <p className="mb-3">
              (1) Verbrauchern steht gemäß §§ 312g, 355 BGB grundsätzlich ein Widerrufsrecht zu.
            </p>
            <p className="mb-3">
              (2) Das Widerrufsrecht erlischt vorzeitig, wenn der Anbieter mit der Ausführung der Dienstleistung (Bereitstellung des Plattformzugangs) begonnen hat und der Nutzer ausdrücklich zugestimmt hat, dass der Anbieter mit der Ausführung vor Ablauf der Widerrufsfrist beginnt, und er seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn der Ausführung sein Widerrufsrecht verliert (§ 356 Abs. 5 BGB).
            </p>
            <p>
              (3) Im Falle eines wirksamen Widerrufs werden bereits geleistete Zahlungen innerhalb von 14 Tagen zurückerstattet, sofern das Widerrufsrecht noch besteht.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 6 Haftungsausschluss und Risikohinweis</h2>
            <p className="mb-3">
              (1) <strong className={theme.text}>Keine Anlageberatung:</strong> Sämtliche auf der Plattform bereitgestellten Inhalte, Werkzeuge und Analysefunktionen dienen ausschließlich der persönlichen Dokumentation und strukturierten Analyse des Nutzers. Sie stellen ausdrücklich keine Anlageberatung, Finanzanalyse, Vermögensverwaltung, Handelsempfehlung oder sonstige Finanzdienstleistung im Sinne des Wertpapierhandelsgesetzes (WpHG), der MiFID II oder vergleichbarer Regelwerke dar. Die Nutzung der Plattform ersetzt keine professionelle Finanzberatung.
            </p>
            <p className="mb-3">
              (2) <strong className={theme.text}>Risikohinweis:</strong> Der Handel mit Devisen (Forex), Kryptowährungen, Aktien, Rohstoffen, Derivaten, CFDs und sonstigen Finanzinstrumenten ist mit erheblichen Risiken verbunden. Es besteht das Risiko des vollständigen Verlustes des eingesetzten Kapitals sowie eines darüber hinausgehenden Verlustes. Vergangene Wertentwicklungen bieten keine Gewähr für zukünftige Ergebnisse. Jeder Nutzer trägt die alleinige und uneingeschränkte Verantwortung für seine eigenen Handelsentscheidungen.
            </p>
            <p className="mb-3">
              (3) <strong className={theme.text}>Haftungsbeschränkung:</strong> Die Haftung des Anbieters ist — soweit gesetzlich zulässig — ausgeschlossen. Insbesondere haftet der Anbieter nicht für mittelbare Schäden, entgangene Gewinne, Handelsverluste oder sonstige Folgeschäden, die aus der Nutzung der Plattform oder aus Handelsentscheidungen des Nutzers entstehen. Diese Haftungsbeschränkung gilt nicht für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für grob fahrlässige oder vorsätzliche Pflichtverletzungen des Anbieters.
            </p>
            <p>
              (4) <strong className={theme.text}>Verfügbarkeit:</strong> Der Anbieter ist bemüht, eine möglichst hohe Verfügbarkeit der Plattform zu gewährleisten, übernimmt jedoch keine Garantie für eine ununterbrochene Verfügbarkeit. Wartungsbedingte Ausfälle werden nach Möglichkeit rechtzeitig angekündigt.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 7 Pflichten des Nutzers</h2>
            <p className="mb-3">Der Nutzer ist verpflichtet:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bei der Registrierung ausschließlich wahrheitsgemäße und vollständige Angaben zu machen und diese aktuell zu halten</li>
              <li>Seine Zugangsdaten sorgfältig zu verwahren und vor dem Zugriff Dritter zu schützen; bei Verdacht auf Missbrauch ist der Anbieter unverzüglich zu informieren</li>
              <li>Die Plattform nicht missbräuchlich, rechtswidrig oder in einer Weise zu nutzen, die Rechte Dritter verletzt</li>
              <li>Keine Inhalte einzustellen, die gegen geltendes Recht, die guten Sitten oder Rechte Dritter verstoßen</li>
              <li>Technische Maßnahmen zu unterlassen, die die Stabilität, Sicherheit oder Funktionsfähigkeit der Plattform gefährden</li>
            </ul>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 8 Vertragsdauer und Kündigung</h2>
            <p className="mb-3">
              (1) Das Nutzungsverhältnis wird auf unbestimmte Zeit geschlossen, sofern keine abweichende Laufzeit vereinbart wurde.
            </p>
            <p className="mb-3">
              (2) Der Nutzer kann das Nutzungsverhältnis jederzeit durch schriftliche Mitteilung an <a href="mailto:support@znpcv.com" className="text-emerald-600 hover:underline">support@znpcv.com</a> kündigen. Kostenpflichtige Abonnements können zum Ende des jeweiligen Abrechnungszeitraums gekündigt werden.
            </p>
            <p className="mb-3">
              (3) Der Anbieter ist berechtigt, das Nutzungsverhältnis mit einer Frist von 30 Tagen ordentlich zu kündigen. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt insbesondere vor bei schwerwiegenden oder wiederholten Verstößen gegen diese AGB.
            </p>
            <p>
              (4) Im Falle der Kündigung werden alle vom Nutzer gespeicherten Daten nach Ablauf der gesetzlichen Aufbewahrungsfristen unwiderruflich gelöscht.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 9 Datenschutz</h2>
            <p>
              Die Verarbeitung personenbezogener Daten erfolgt ausschließlich gemäß der geltenden Datenschutzerklärung des Anbieters, die integraler Bestandteil dieser AGB ist, sowie den Bestimmungen der Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG). Die Datenschutzerklärung ist jederzeit unter dem entsprechenden Link auf der Plattform abrufbar.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 10 Änderungen der AGB</h2>
            <p className="mb-3">
              (1) Der Anbieter behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern, soweit dies unter Berücksichtigung der Interessen des Anbieters für den Nutzer zumutbar ist.
            </p>
            <p>
              (2) Änderungen werden dem Nutzer per E-Mail spätestens 30 Tage vor Inkrafttreten mitgeteilt. Widerspricht der Nutzer nicht innerhalb von 30 Tagen nach Zugang der Änderungsmitteilung, gelten die geänderten AGB als angenommen. Auf diese Folge wird in der Änderungsmitteilung ausdrücklich hingewiesen.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 11 Urheberrecht und geistiges Eigentum</h2>
            <p>
              Alle Inhalte der Plattform — insbesondere Texte, Grafiken, Logos, Softwarecode, Methodiken und Konzepte — sind urheberrechtlich geschützt und stehen im Eigentum des Anbieters oder wurden mit Genehmigung der Rechteinhaber verwendet. Eine Vervielfältigung, Bearbeitung oder Verwertung außerhalb der vertraglich eingeräumten Nutzungsrechte ist ohne ausdrückliche schriftliche Genehmigung des Anbieters unzulässig und kann straf- und zivilrechtlich verfolgt werden.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>§ 12 Schlussbestimmungen</h2>
            <p className="mb-3">
              (1) <strong className={theme.text}>Anwendbares Recht:</strong> Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG) und unter Ausschluss der Kollisionsnormen des internationalen Privatrechts.
            </p>
            <p className="mb-3">
              (2) <strong className={theme.text}>Gerichtsstand:</strong> Sofern der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertragsverhältnis der Sitz des Anbieters.
            </p>
            <p className="mb-3">
              (3) <strong className={theme.text}>Salvatorische Klausel:</strong> Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam oder undurchführbar sein oder werden, so wird dadurch die Wirksamkeit der übrigen Bestimmungen nicht berührt. Anstelle der unwirksamen Bestimmung gilt diejenige rechtlich wirksame Regelung als vereinbart, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
            </p>
            <p>
              (4) <strong className={theme.text}>Kontakt:</strong> ZNPCV Ltd. — <a href="mailto:support@znpcv.com" className="text-emerald-600 hover:underline">support@znpcv.com</a>
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