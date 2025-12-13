import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { Button } from "@/components/ui/button";

export default function AGBPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <DarkModeToggle />
            <button 
              onClick={() => navigate(-1)}
              className={`${darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400'} border-2 rounded-lg sm:rounded-xl p-2 sm:p-2.5 transition-all flex-shrink-0 group`}>
              <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.text} group-hover:-translate-x-1 transition-transform`} />
            </button>
            <button onClick={() => navigate(createPageUrl('Home'))} className="mx-auto">
              <img 
                src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV" 
                className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <h1 className="text-4xl tracking-widest mb-8">ALLGEMEINE GESCHÄFTSBEDINGUNGEN (AGB)</h1>
        
        <div className={`space-y-6 ${theme.textSecondary} font-sans leading-relaxed`}>
          <p className="text-sm">Stand: Dezember 2024</p>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>1. Geltungsbereich</h2>
            <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der Zainspective Group (Betreiber von ZNPCV) und den Nutzern über die Nutzung der Trading-Checklisten-Software. Die Software wird als digitales Produkt bereitgestellt.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>2. Vertragsschluss</h2>
            <p>Der Vertrag kommt durch die Registrierung und die einmalige Zahlung von 99 USD zustande. Mit der Zahlung erwirbt der Nutzer eine lebenslange, nicht übertragbare Lizenz zur Nutzung der Software.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>3. Leistungsumfang</h2>
            <p>Die Zainspective Group stellt über ZNPCV eine webbasierte Trading-Checklisten-Software zur Verfügung, die folgende Funktionen umfasst:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Multi-Timeframe Analyse-Tools</li>
              <li>Strukturierte Trading-Checklisten</li>
              <li>Performance-Tracking und Dashboard</li>
              <li>Datenspeicherung und Historie</li>
              <li>Regelmäßige Updates und Verbesserungen</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>4. Zahlung und Preise</h2>
            <p>Die Nutzung der Software erfordert eine einmalige Zahlung von 99 USD. Die Zahlung erfolgt über Stripe und kann per Kreditkarte, Apple Pay oder Google Pay getätigt werden. Der Preis versteht sich als Endpreis.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>5. Widerrufsrecht</h2>
            <p><strong>Da es sich um digitale Inhalte handelt, die sofort nach Zahlung freigeschaltet werden, erlischt das Widerrufsrecht gemäß § 356 Abs. 5 BGB mit Beginn der Vertragserfüllung.</strong> Mit der Registrierung und Zahlung erklärt der Nutzer sich ausdrücklich damit einverstanden, dass die Leistung sofort beginnt und nimmt zur Kenntnis, dass er dadurch sein Widerrufsrecht verliert.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>6. Nutzungsrechte</h2>
            <p>Der Nutzer erhält ein nicht-exklusives, nicht übertragbares, zeitlich unbegrenztes Recht zur Nutzung der Software für persönliche Trading-Zwecke. Die Weitergabe der Zugangsdaten an Dritte ist untersagt.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>7. Pflichten des Nutzers</h2>
            <p>Der Nutzer ist verpflichtet:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Wahrheitsgemäße Angaben bei der Registrierung zu machen</li>
              <li>Die Zugangsdaten vertraulich zu behandeln</li>
              <li>Die Software nicht missbräuchlich zu nutzen</li>
              <li>Keine Inhalte hochzuladen, die gegen geltendes Recht verstoßen</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>8. Haftung</h2>
            <p>Die Zainspective Group haftet nicht für Verluste oder Schäden, die durch Trading-Entscheidungen entstehen. Die Software dient ausschließlich als Analyse-Tool. Trading birgt erhebliche Risiken und kann zum Totalverlust führen. Der Nutzer trägt die volle Verantwortung für seine Trading-Entscheidungen.</p>
            <p className="mt-2">Bei Vorsatz und grober Fahrlässigkeit haftet die Zainspective Group uneingeschränkt. Bei leichter Fahrlässigkeit haftet die Zainspective Group nur bei Verletzung wesentlicher Vertragspflichten. In diesem Fall ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>9. Datenschutz</h2>
            <p>Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung der Zainspective Group und den Bestimmungen der DSGVO.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>10. Sperrung und Kündigung</h2>
            <p>Die Zainspective Group behält sich das Recht vor, Nutzerkonten bei Verstößen gegen diese AGB zu sperren. Eine Rückerstattung erfolgt in diesem Fall nicht. Der Nutzer kann sein Konto jederzeit per E-Mail kündigen.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>11. Änderungen der AGB</h2>
            <p>Die Zainspective Group behält sich vor, diese AGB jederzeit zu ändern. Nutzer werden per E-Mail über Änderungen informiert. Widerspricht der Nutzer nicht innerhalb von 4 Wochen, gelten die Änderungen als angenommen.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>12. Schlussbestimmungen</h2>
            <p>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
          </section>

          <section className={`pt-6 border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <p className="font-bold">Kontakt:</p>
            <p><strong>Zainspective Group</strong><br/>
            Betreiber von ZNPCV<br/>
            E-Mail: support@znpcv.com<br/>
            Website: www.znpcv.com</p>
          </section>
          </div>
          </main>

          {/* Footer */}
          <footer className={`mt-12 sm:mt-16 border-t ${theme.border}`}>
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
            <button type="button" onClick={() => navigate(createPageUrl('Impressum'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
              Impressum
            </button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button type="button" onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
              Datenschutz
            </button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button type="button" onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
              AGB
            </button>
          </div>
          </div>
          </footer>
          </div>
          );
          }