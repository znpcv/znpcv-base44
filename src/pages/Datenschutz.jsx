import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { Button } from "@/components/ui/button";

export default function DatenschutzPage() {
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
        <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-100/50'} rounded-2xl p-6 sm:p-8 md:p-10 mb-8 border-2 ${theme.border}`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-widest mb-4 text-center">DATENSCHUTZ</h1>
          <p className={`text-center text-xs sm:text-sm ${theme.textSecondary}`}>Stand: Januar 2025</p>
        </div>
        
        <div className={`space-y-4 sm:space-y-6 ${theme.textSecondary} font-sans leading-relaxed text-sm sm:text-base`}>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>1. Datenschutz auf einen Blick</h2>
            <h3 className={`text-lg ${theme.text} mb-2`}>Allgemeine Hinweise</h3>
            <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Software nutzen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>2. Verantwortliche Stelle</h2>
            <p>Verantwortlich für die Datenverarbeitung ist:</p>
            <p className="mt-2"><strong>Zainspective Group</strong><br/>
            Betreiber von ZNPCV<br/>
            E-Mail: support@znpcv.com<br/>
            Website: www.znpcv.com</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>3. Datenerfassung</h2>
            <h3 className={`text-lg ${theme.text} mb-2`}>Welche Daten erfassen wir?</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Registrierungsdaten:</strong> Name, E-Mail-Adresse, Passwort (verschlüsselt)</li>
              <li><strong>Nutzungsdaten:</strong> Trading-Analysen, Checklisten, Notizen, Dashboard-Statistiken</li>
              <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Typ, Zugriffszeiten</li>
            </ul>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>4. Zweck der Datenverarbeitung</h2>
            <p>Ihre Daten werden verarbeitet für:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Bereitstellung und Betrieb der Software</li>
              <li>Verwaltung Ihres Benutzerkontos</li>
              <li>Speicherung Ihrer Trading-Analysen</li>
              <li>Technische Verbesserungen und Fehlerbehebung</li>
              <li>Kommunikation mit Ihnen (z.B. Support, Updates)</li>
            </ul>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>5. Rechtsgrundlage</h2>
            <p>Die Verarbeitung erfolgt auf Grundlage von:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
              <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
              <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, sofern erteilt)</li>
            </ul>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>6. Datenweitergabe</h2>
            <p>Ihre Daten werden nur weitergegeben an:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Hosting-Provider:</strong> Zum Betrieb der Software-Infrastruktur</li>
            </ul>
            <p className="mt-2">Eine darüber hinausgehende Weitergabe erfolgt nicht, es sei denn, wir sind gesetzlich dazu verpflichtet.</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>7. Speicherdauer</h2>
            <p>Ihre Daten werden gespeichert, solange Sie ein aktives Benutzerkonto haben. Nach Löschung Ihres Kontos werden Ihre personenbezogenen Daten innerhalb von 30 Tagen gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>8. Ihre Rechte</h2>
            <p>Sie haben folgende Rechte:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Auskunft:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
              <li><strong>Berichtigung:</strong> Sie können die Berichtigung unrichtiger Daten verlangen</li>
              <li><strong>Löschung:</strong> Sie können die Löschung Ihrer Daten verlangen</li>
              <li><strong>Einschränkung:</strong> Sie können die Einschränkung der Verarbeitung verlangen</li>
              <li><strong>Datenübertragbarkeit:</strong> Sie können Ihre Daten in einem gängigen Format erhalten</li>
              <li><strong>Widerspruch:</strong> Sie können der Verarbeitung widersprechen</li>
              <li><strong>Beschwerde:</strong> Sie können sich bei einer Datenschutzbehörde beschweren</li>
            </ul>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>9. Datensicherheit</h2>
            <p>Wir verwenden SSL/TLS-Verschlüsselung für die Datenübertragung. Passwörter werden mit modernen Hashing-Verfahren gespeichert. Unsere Server sind gegen unbefugten Zugriff geschützt.</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>10. Cookies und Tracking</h2>
            <p>Unsere Software verwendet technisch notwendige Cookies für die Funktionalität (z.B. Session-Management, Login). Marketing- oder Tracking-Cookies setzen wir nicht ein.</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>11. Änderungen der Datenschutzerklärung</h2>
            <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslage oder Änderungen unserer Leistungen anzupassen. Für neue Besuche gilt dann die neue Datenschutzerklärung.</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <p className="font-bold mb-3">Kontakt Datenschutz:</p>
            <p><strong>Zainspective Group</strong><br/>
            Betreiber von ZNPCV<br/>
            Bei Fragen zum Datenschutz wenden Sie sich bitte an:<br/>
            E-Mail: support@znpcv.com</p>
          </section>
          </div>
          </main>

          {/* Footer */}
          <footer className={`mt-12 sm:mt-16 md:mt-20 lg:mt-24 border-t ${theme.border}`}>
            <div className="py-6 sm:py-8 md:py-10">
              <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
                <img src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                } alt="ZNPCV" className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto opacity-40" />
                <p className={`${theme.textDimmed} text-xs sm:text-sm tracking-widest`}>© {new Date().getFullYear()} ZNPCV</p>
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