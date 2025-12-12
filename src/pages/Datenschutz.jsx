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
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
                <DarkModeToggle />
                <Button onClick={() => navigate(-1)} variant="outline" size="sm" className={`${theme.border} gap-2`}>
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Zurück</span>
                </Button>
              </div>
            <img 
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV" 
              className="h-10 w-auto"
            />
            <div className="w-12" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <h1 className="text-4xl tracking-widest mb-8">DATENSCHUTZERKLÄRUNG</h1>
        
        <div className={`space-y-6 ${theme.textSecondary} font-sans leading-relaxed`}>
          <p className="text-sm">Stand: Dezember 2024</p>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>1. Datenschutz auf einen Blick</h2>
            <h3 className={`text-lg ${theme.text} mb-2`}>Allgemeine Hinweise</h3>
            <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Software nutzen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>2. Verantwortliche Stelle</h2>
            <p>Verantwortlich für die Datenverarbeitung ist:</p>
            <p className="mt-2"><strong>Zainspective Group</strong><br/>
            Betreiber von ZNPCV<br/>
            E-Mail: support@znpcv.com<br/>
            Website: www.znpcv.com</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>3. Datenerfassung</h2>
            <h3 className={`text-lg ${theme.text} mb-2`}>Welche Daten erfassen wir?</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Registrierungsdaten:</strong> Name, E-Mail-Adresse, Passwort (verschlüsselt)</li>
              <li><strong>Zahlungsdaten:</strong> Verarbeitet über Stripe (Kreditkartendaten werden nicht auf unseren Servern gespeichert)</li>
              <li><strong>Nutzungsdaten:</strong> Trading-Analysen, Checklisten, Notizen, Dashboard-Statistiken</li>
              <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Typ, Zugriffszeiten</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>4. Zweck der Datenverarbeitung</h2>
            <p>Ihre Daten werden verarbeitet für:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Bereitstellung und Betrieb der Software</li>
              <li>Verwaltung Ihres Benutzerkontos</li>
              <li>Abwicklung der Zahlung</li>
              <li>Speicherung Ihrer Trading-Analysen</li>
              <li>Technische Verbesserungen und Fehlerbehebung</li>
              <li>Kommunikation mit Ihnen (z.B. Support, Updates)</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>5. Rechtsgrundlage</h2>
            <p>Die Verarbeitung erfolgt auf Grundlage von:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
              <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
              <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, sofern erteilt)</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>6. Datenweitergabe</h2>
            <p>Ihre Daten werden nur weitergegeben an:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Stripe:</strong> Zur Abwicklung von Zahlungen (Stripe ist PCI-DSS zertifiziert)</li>
              <li><strong>Hosting-Provider:</strong> Zum Betrieb der Software-Infrastruktur</li>
            </ul>
            <p className="mt-2">Eine darüber hinausgehende Weitergabe erfolgt nicht, es sei denn, wir sind gesetzlich dazu verpflichtet.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>7. Speicherdauer</h2>
            <p>Ihre Daten werden gespeichert, solange Sie ein aktives Benutzerkonto haben. Nach Löschung Ihres Kontos werden Ihre personenbezogenen Daten innerhalb von 30 Tagen gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>8. Ihre Rechte</h2>
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

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>9. Datensicherheit</h2>
            <p>Wir verwenden SSL/TLS-Verschlüsselung für die Datenübertragung. Passwörter werden mit modernen Hashing-Verfahren gespeichert. Unsere Server sind gegen unbefugten Zugriff geschützt.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>10. Cookies und Tracking</h2>
            <p>Unsere Software verwendet technisch notwendige Cookies für die Funktionalität (z.B. Session-Management, Login). Marketing- oder Tracking-Cookies setzen wir nicht ein.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>11. Stripe-Zahlungsabwicklung</h2>
            <p>Für die Zahlungsabwicklung nutzen wir Stripe. Bei der Zahlung werden Ihre Daten direkt an Stripe übermittelt. Die Datenschutzerklärung von Stripe finden Sie unter: <a href="https://stripe.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>12. Änderungen der Datenschutzerklärung</h2>
            <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslage oder Änderungen unserer Leistungen anzupassen. Für neue Besuche gilt dann die neue Datenschutzerklärung.</p>
          </section>

          <section className={`pt-6 border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <p className="font-bold">Kontakt Datenschutz:</p>
            <p><strong>Zainspective Group</strong><br/>
            Betreiber von ZNPCV<br/>
            Bei Fragen zum Datenschutz wenden Sie sich bitte an:<br/>
            E-Mail: support@znpcv.com</p>
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