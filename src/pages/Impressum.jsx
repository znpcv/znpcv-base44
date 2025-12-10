import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Mail } from 'lucide-react';
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
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => navigate(createPageUrl('Home'))} className={theme.textSecondary}>
            <Home className="w-6 h-6" />
          </button>
          <img 
            src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            }
            alt="ZNPCV" 
            className="h-10 w-auto"
          />
          <DarkModeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl tracking-widest mb-8">IMPRESSUM</h1>
        
        <div className={`space-y-6 ${theme.textSecondary} font-sans leading-relaxed`}>
          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>Angaben gemäß § 5 TMG</h2>
            <p>ZNPCV<br/>
            [Ihre vollständige Firmenbezeichnung]<br/>
            [Straße und Hausnummer]<br/>
            [PLZ und Ort]<br/>
            Deutschland</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>Vertreten durch</h2>
            <p>[Name des Geschäftsführers/Inhabers]</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>Kontakt</h2>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <a href="mailto:support@znpcv.com" className="underline">support@znpcv.com</a>
            </div>
            <p className="mt-2">Website: <a href="https://www.znpcv.com" className="underline">www.znpcv.com</a></p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>Umsatzsteuer-ID</h2>
            <p>Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br/>
            [Ihre USt-IdNr.]</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>EU-Streitschlichtung</h2>
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br/>
            <a href="https://ec.europa.eu/consumers/odr" className="underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a><br/>
            Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>Haftung für Inhalte</h2>
            <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
            <p className="mt-2">Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>Haftung für Links</h2>
            <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
          </section>

          <section>
            <h2 className={`text-xl tracking-wider ${theme.text} mb-3`}>Urheberrecht</h2>
            <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
          </section>

          <section className="pt-6 border-t border-zinc-800">
            <p className="text-sm">Quelle: Erstellt mit dem Impressum-Generator von eRecht24.</p>
          </section>
        </div>
      </main>
    </div>
  );
}