import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';

export default function DatenschutzPage() {
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-widest mb-2 text-center">DATENSCHUTZERKLÄRUNG</h1>
          <p className={`text-center text-xs sm:text-sm ${theme.textSecondary}`}>Gemäß Art. 13, 14 DSGVO — Stand: Januar 2025</p>
        </div>

        <div className={`space-y-4 sm:space-y-6 ${theme.textSecondary} font-sans leading-relaxed text-sm sm:text-base`}>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>1. Verantwortlicher im Sinne der DSGVO</h2>
            <p className="mb-3">
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und sonstiger datenschutzrechtlicher Vorschriften ist:
            </p>
            <p className={`${theme.text} font-semibold`}>ZNPCV Ltd.</p>
            <p>Vertreten durch: Armin Zainali</p>
            <p>E-Mail: <a href="mailto:support@znpcv.com" className="text-emerald-600 hover:underline">support@znpcv.com</a></p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>2. Allgemeine Grundsätze der Datenverarbeitung</h2>
            <p className="mb-3">
              Wir nehmen den Schutz Ihrer personenbezogenen Daten sehr ernst und behandeln diese vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung. Die Erhebung und Verarbeitung Ihrer personenbezogenen Daten erfolgt stets nach den Grundsätzen der Rechtmäßigkeit, Transparenz und Zweckbindung gemäß Art. 5 DSGVO. Wir erheben ausschließlich diejenigen Daten, die zur Erfüllung des Vertragszwecks oder zur Wahrung berechtigter Interessen unbedingt erforderlich sind (Grundsatz der Datensparsamkeit, Art. 5 Abs. 1 lit. c DSGVO).
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>3. Erhobene Datenkategorien und Zwecke der Verarbeitung</h2>

            <h3 className={`font-semibold ${theme.text} mb-2`}>3.1 Registrierungs- und Kontodaten</h3>
            <p className="mb-4">
              Bei der Registrierung werden Ihre E-Mail-Adresse sowie ein von Ihnen gewählter Anzeigename erhoben. Diese Daten sind zur Vertragserfüllung gemäß Art. 6 Abs. 1 lit. b DSGVO erforderlich und dienen ausschließlich der Bereitstellung des Nutzerkontos sowie der Kommunikation im Rahmen der Vertragsbeziehung.
            </p>

            <h3 className={`font-semibold ${theme.text} mb-2`}>3.2 Nutzungsdaten und Trading-Inhalte</h3>
            <p className="mb-4">
              Im Rahmen der Nutzung der Plattform erfassen und speichern wir die von Ihnen selbst eingegebenen Trading-Analysen, Checklisten, Notizen und Konfigurationsdaten. Diese Inhalte werden ausschließlich zur Bereitstellung der vertraglich geschuldeten Funktionalität verarbeitet (Art. 6 Abs. 1 lit. b DSGVO) und nicht für Werbezwecke, Profilbildung oder die Weitergabe an Dritte genutzt.
            </p>

            <h3 className={`font-semibold ${theme.text} mb-2`}>3.3 Zahlungsdaten</h3>
            <p className="mb-4">
              Die Abwicklung kostenpflichtiger Dienste erfolgt über den Zahlungsdienstleister Stripe, Inc. (354 Oyster Point Blvd, South San Francisco, CA 94080, USA). Stripe verarbeitet Ihre Zahlungsdaten gemäß eigenem Datenschutzstandard. Wir erhalten von Stripe ausschließlich einen anonymisierten Transaktionsstatus sowie eine Kunden-Identifikationsnummer zur Zuordnung des Abonnements. Vollständige Zahlungsdaten (Kreditkartendaten, Bankverbindungen etc.) werden zu keinem Zeitpunkt durch uns gespeichert, verarbeitet oder eingesehen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
            </p>

            <h3 className={`font-semibold ${theme.text} mb-2`}>3.4 Technische Protokolldaten</h3>
            <p>
              Beim Zugriff auf unsere Plattform werden durch unseren Hosting-Anbieter technische Protokolldaten automatisch erfasst (IP-Adresse, Browsertyp, Betriebssystem, Zugriffszeit, aufgerufene Seiten). Diese Daten werden ausschließlich zur Gewährleistung des sicheren und stabilen Betriebs der Plattform verarbeitet und nach spätestens 30 Tagen gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der IT-Sicherheit).
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>4. Rechtsgrundlagen der Verarbeitung</h2>
            <p className="mb-3">Die Verarbeitung personenbezogener Daten erfolgt auf folgenden Rechtsgrundlagen:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className={theme.text}>Art. 6 Abs. 1 lit. a DSGVO</strong> — soweit Sie eine ausdrückliche Einwilligung erteilt haben (z. B. Newsletter, Push-Benachrichtigungen)</li>
              <li><strong className={theme.text}>Art. 6 Abs. 1 lit. b DSGVO</strong> — zur Erfüllung des zwischen Ihnen und uns geschlossenen Nutzungsvertrages</li>
              <li><strong className={theme.text}>Art. 6 Abs. 1 lit. c DSGVO</strong> — zur Erfüllung gesetzlicher Verpflichtungen (z. B. steuerrechtliche Aufbewahrungspflichten)</li>
              <li><strong className={theme.text}>Art. 6 Abs. 1 lit. f DSGVO</strong> — zur Wahrung unserer berechtigten Interessen (z. B. IT-Sicherheit, Missbrauchsprävention)</li>
            </ul>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>5. Weitergabe personenbezogener Daten an Dritte</h2>
            <p className="mb-3">
              Eine Weitergabe Ihrer personenbezogenen Daten an Dritte erfolgt grundsätzlich nicht, es sei denn:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sie haben gemäß Art. 6 Abs. 1 lit. a DSGVO ausdrücklich eingewilligt</li>
              <li>die Weitergabe ist gemäß Art. 6 Abs. 1 lit. b DSGVO zur Vertragserfüllung erforderlich</li>
              <li>für die Weitergabe besteht eine gesetzliche Verpflichtung gemäß Art. 6 Abs. 1 lit. c DSGVO</li>
              <li>die Weitergabe ist gemäß Art. 6 Abs. 1 lit. f DSGVO zur Wahrung berechtigter Interessen zulässig und es bestehen keine überwiegenden Interessen des Betroffenen</li>
            </ul>
            <p className="mt-3">
              Wir setzen technische Auftragsverarbeiter ein (Hosting, Infrastruktur), die ausschließlich auf unsere Weisung handeln und vertraglich zur Einhaltung der DSGVO verpflichtet sind (Art. 28 DSGVO). Eine kommerzielle Verwertung Ihrer Daten durch Dritte findet zu keinem Zeitpunkt statt.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>6. Speicherdauer und Löschfristen</h2>
            <p className="mb-3">
              Ihre personenbezogenen Daten werden nur solange gespeichert, wie es für die Erfüllung des Vertragszwecks erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Nach Beendigung des Nutzungsverhältnisses bzw. auf Ihren ausdrücklichen Antrag hin werden Ihre Daten unverzüglich und unwiderruflich gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten (z. B. § 257 HGB, § 147 AO) dem entgegenstehen. In diesem Fall werden die betreffenden Daten für die Dauer der gesetzlichen Aufbewahrungsfrist gesperrt.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>7. Ihre Rechte als betroffene Person</h2>
            <p className="mb-3">Ihnen stehen nach der DSGVO folgende Rechte zu, die Sie jederzeit gegenüber uns geltend machen können:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className={theme.text}>Auskunftsrecht</strong> gemäß Art. 15 DSGVO: Recht auf Bestätigung und Auskunft über Ihre verarbeiteten personenbezogenen Daten</li>
              <li><strong className={theme.text}>Berichtigungsrecht</strong> gemäß Art. 16 DSGVO: Recht auf unverzügliche Berichtigung unrichtiger oder Vervollständigung unvollständiger Daten</li>
              <li><strong className={theme.text}>Recht auf Löschung</strong> gemäß Art. 17 DSGVO: Recht auf unverzügliche Löschung Ihrer Daten, soweit keine Rechtspflicht zur Aufbewahrung besteht</li>
              <li><strong className={theme.text}>Recht auf Einschränkung der Verarbeitung</strong> gemäß Art. 18 DSGVO</li>
              <li><strong className={theme.text}>Recht auf Datenübertragbarkeit</strong> gemäß Art. 20 DSGVO: Recht auf Übermittlung Ihrer Daten in einem strukturierten, maschinenlesbaren Format</li>
              <li><strong className={theme.text}>Widerspruchsrecht</strong> gemäß Art. 21 DSGVO: Recht auf Widerspruch gegen die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO</li>
              <li><strong className={theme.text}>Widerrufsrecht</strong> gemäß Art. 7 Abs. 3 DSGVO: Recht auf jederzeitigen Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft</li>
              <li><strong className={theme.text}>Beschwerderecht</strong> gemäß Art. 77 DSGVO: Recht auf Beschwerde bei der zuständigen Datenschutzaufsichtsbehörde</li>
            </ul>
            <p className="mt-3">
              Zur Geltendmachung Ihrer Rechte wenden Sie sich bitte an: <a href="mailto:support@znpcv.com" className="text-emerald-600 hover:underline">support@znpcv.com</a>
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>8. Datensicherheit</h2>
            <p>
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre personenbezogenen Daten gegen zufällige oder vorsätzliche Manipulation, Verlust, Zerstörung oder den Zugriff unberechtigter Personen zu schützen. Sämtliche Datenübertragungen zwischen Ihrem Endgerät und unseren Servern erfolgen ausschließlich über eine verschlüsselte Verbindung (TLS/SSL, mindestens TLS 1.2). Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung fortlaufend verbessert.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>9. Cookies und Tracking</h2>
            <p>
              Unsere Plattform verwendet ausschließlich technisch notwendige Cookies, die für den sicheren und fehlerfreien Betrieb der Plattform unerlässlich sind (z. B. Session-Management, Authentifizierung). Diese Cookies werden nicht für Werbezwecke eingesetzt. Tracking-Cookies, Analyse-Cookies oder Cookies von Drittanbietern zu Werbezwecken werden nicht verwendet. Die Speicherung dieser technisch notwendigen Cookies erfolgt auf Grundlage von § 25 Abs. 2 TTDSG i. V. m. Art. 6 Abs. 1 lit. b, f DSGVO.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>10. Push-Benachrichtigungen</h2>
            <p>
              Sofern Sie der Nutzung von Browser-Push-Benachrichtigungen ausdrücklich zugestimmt haben (Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 Abs. 1 TTDSG), werden für die Zustellung technische Kanalidentifikatoren (Push-Tokens) verarbeitet. Diese Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden, indem Sie die Benachrichtigungen in Ihren Browser-Einstellungen deaktivieren oder das entsprechende Feature in Ihrem Nutzerkonto abschalten.
            </p>
          </section>

          <section className={`${theme.bgCard} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-4`}>11. Aktualität und Änderung dieser Datenschutzerklärung</h2>
            <p>
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Januar 2025. Durch die Weiterentwicklung unserer Plattform oder aufgrund geänderter gesetzlicher bzw. behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern. Die jeweils aktuelle Version ist stets unter diesem Link abrufbar. Wir empfehlen, diese Datenschutzerklärung regelmäßig zu lesen.
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