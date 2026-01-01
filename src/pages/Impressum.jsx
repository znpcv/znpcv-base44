import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';

export default function ImpressumPage() {
  const navigate = useNavigate();
  const { darkMode, t } = useLanguage();

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
          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-widest mb-4 text-center">{t('impressumTitle')}</h1>
          <p className={`text-center text-xs sm:text-sm ${theme.textSecondary}`}>{t('effectiveDate')}</p>
        </div>
        
        <div className={`space-y-4 sm:space-y-6 ${theme.textSecondary} font-sans leading-relaxed text-sm sm:text-base`}>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>{t('companyInfo')}</h2>
            <p><strong>{t('operator')}:</strong><br/>
            <strong>Zainspective Group</strong><br/>
            {t('operator')} von ZNPCV</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>{t('contactInfo')}</h2>
            <p>E-Mail: support@znpcv.com<br/>
            Website: www.znpcv.com</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>{t('disclaimer')}</h2>
            <p>{t('disclaimerContent')}</p>
            <p className="mt-2">{t('liabilityContent')}</p>
          </section>

          <section className={`${darkMode ? 'bg-zinc-900/30' : 'bg-white'} rounded-xl p-5 sm:p-6 md:p-8 border ${theme.border}`}>
            <h2 className={`text-base sm:text-lg md:text-xl tracking-wider ${theme.text} mb-3 sm:mb-4`}>{t('copyright')}</h2>
            <p>{t('copyrightContent')}</p>
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
            <p className={`${theme.textSecondary} text-xs sm:text-sm tracking-widest`}>© {new Date().getFullYear()} ZNPCV</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <button onClick={() => navigate(createPageUrl('Impressum'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
              {t('impressumTitle')}
            </button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
              {t('privacyTitle')}
            </button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
              {t('termsTitle')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}