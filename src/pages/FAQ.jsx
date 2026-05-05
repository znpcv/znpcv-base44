import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, HelpCircle, ChevronDown, Mail, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';

export default function FAQPage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const FAQ_DATA = [
    {
      categoryKey: 'faqBasics',
      questions: [
        {
          qKey: 'faqWhatIsZNPCV',
          aKey: 'faqWhatIsZNPCVAnswer'
        },
        {
          qKey: 'faqWhoIsZNPCVFor',
          aKey: 'faqWhoIsZNPCVForAnswer'
        },
        {
          qKey: 'faqWhichAssets',
          aKey: 'faqWhichAssetsAnswer'
        },
        {
          qKey: 'faqHow85Rule',
          aKey: 'faqHow85RuleAnswer'
        }
      ]
    },
    {
      categoryKey: 'faqTradingConcepts',
      questions: [
        {
          qKey: 'faqWhatIsAOI',
          aKey: 'faqWhatIsAOIAnswer'
        },
        {
          qKey: 'faqWhatIsRPL',
          aKey: 'faqWhatIsRPLAnswer'
        },
        {
          qKey: 'faqWhatIsEMA',
          aKey: 'faqWhatIsEMAAnswer'
        },
        {
          qKey: 'faqWhatIsMSS',
          aKey: 'faqWhatIsMSSAnswer'
        },
        {
          qKey: 'faqSwingHighLow',
          aKey: 'faqSwingHighLowAnswer'
        }
      ]
    },
    {
      categoryKey: 'faqChartPatterns',
      questions: [
        {
          qKey: 'faqEngulfing',
          aKey: 'faqEngulfingAnswer'
        },
        {
          qKey: 'faqHeadShoulders',
          aKey: 'faqHeadShouldersAnswer'
        },
        {
          qKey: 'faqDoubleTopBottom',
          aKey: 'faqDoubleTopBottomAnswer'
        },
        {
          qKey: 'faqSupportedPatterns',
          aKey: 'faqSupportedPatternsAnswer'
        }
      ]
    },
    {
      categoryKey: 'faqGoldenRules',
      questions: [
        {
          qKey: 'faqGoldenRulesMeaning',
          aKey: 'faqGoldenRulesMeaningAnswer'
        },
        {
          qKey: 'faqWhyNotTopBottom',
          aKey: 'faqWhyNotTopBottomAnswer'
        }
      ]
    },
    {
      categoryKey: 'faqRiskManagement',
      questions: [
        {
          qKey: 'faqHowCalculateLot',
          aKey: 'faqHowCalculateLotAnswer'
        },
        {
          qKey: 'faqGoodRR',
          aKey: 'faqGoodRRAnswer'
        },
        {
          qKey: 'faqHowMuchRisk',
          aKey: 'faqHowMuchRiskAnswer'
        }
      ]
    },
    {
      categoryKey: 'faqFeatures',
      questions: [
        {
          qKey: 'faqMultiTimeframe',
          aKey: 'faqMultiTimeframeAnswer'
        },
        {
          qKey: 'faqCanSaveTrades',
          aKey: 'faqCanSaveTradesAnswer'
        },
        {
          qKey: 'faqPerformanceTracker',
          aKey: 'faqPerformanceTrackerAnswer'
        },
        {
          qKey: 'faqEconomicCalendar',
          aKey: 'faqEconomicCalendarAnswer'
        }
      ]
    },
    {
      categoryKey: 'faqAccountSecurity',
      questions: [
        {
          qKey: 'faqCreateAccount',
          aKey: 'faqCreateAccountAnswer'
        },
        {
          qKey: 'faqDataSafe',
          aKey: 'faqDataSafeAnswer'
        },
        {
          qKey: 'faqDeleteAccount',
          aKey: 'faqDeleteAccountAnswer'
        }
      ]
    }
  ];

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
      {/* Modern Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50 backdrop-blur-sm`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button 
                onClick={() => navigate(createPageUrl('Home'))}
                className={`p-2 rounded-lg sm:rounded-xl ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'} transition-all`}>
                <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.text}`} />
              </button>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img 
                src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV" 
                className="h-12 sm:h-12 md:h-14 lg:h-16 w-auto hover:opacity-80 transition-opacity"
              />
            </button>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 lg:py-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-100/50'} rounded-2xl p-6 sm:p-8 md:p-10 mb-8 sm:mb-10 md:mb-12 border ${theme.border}`}>
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
              <HelpCircle className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${darkMode ? 'text-black' : 'text-white'}`} />
            </div>
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-widest mb-3 sm:mb-4 text-center ${theme.text}`}>
            {t('faqHelp')}
          </h1>
          <p className={`text-center text-xs sm:text-sm md:text-base ${theme.textSecondary} font-sans max-w-2xl mx-auto`}>
            {t('contactUs')}
          </p>
        </motion.div>

        {/* FAQ Categories */}
        {FAQ_DATA.map((category, catIndex) => (
          <motion.div 
            key={catIndex} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: catIndex * 0.05 }}
            className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
              <div className={`w-1 h-6 sm:h-7 md:h-8 rounded-full ${darkMode ? 'bg-white' : 'bg-zinc-900'}`} />
              <h2 className={`text-sm sm:text-base md:text-lg lg:text-xl tracking-widest ${theme.text}`}>
                {t(category.categoryKey)}
              </h2>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {category.questions.map((item, qIndex) => {
                const index = `${catIndex}-${qIndex}`;
                const isOpen = openIndex === index;
                return (
                  <motion.div 
                    key={qIndex} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qIndex * 0.03 }}
                    className={`border ${theme.border} rounded-xl sm:rounded-2xl overflow-hidden ${darkMode ? 'bg-zinc-900/50' : 'bg-white'}`}>
                    <button 
                      type="button" 
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className={`w-full p-3 sm:p-4 md:p-5 lg:p-6 flex items-center justify-between gap-3 ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'} transition-colors`}>
                      <span className={`text-left font-bold tracking-wider text-xs sm:text-sm md:text-base ${theme.text}`}>
                        {t(item.qKey)}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0", isOpen && "rotate-180", theme.textMuted)} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className={`border-t ${theme.border}`}>
                          <div className={`p-3 sm:p-4 md:p-5 lg:p-6 ${theme.textSecondary} text-xs sm:text-sm md:text-base font-sans leading-relaxed`}>
                            {t(item.aKey)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Contact Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className={`mt-8 sm:mt-12 md:mt-16 p-6 sm:p-8 md:p-10 border-2 ${darkMode ? 'border-emerald-600/30 bg-emerald-700/10' : 'border-teal-500/30 bg-teal-500/10'} rounded-2xl text-center`}>
          <h3 className={`text-lg sm:text-xl md:text-2xl tracking-widest mb-3 sm:mb-4 ${theme.text}`}>
            {t('furtherQuestions')}
          </h3>
          <p className={`${theme.textMuted} mb-5 sm:mb-6 md:mb-8 text-sm sm:text-base font-sans max-w-xl mx-auto`}>
            {t('contactUs')}
          </p>
          <div className="flex justify-center">
            <a 
              href="mailto:support@znpcv.com" 
              className={`inline-flex items-center gap-2 sm:gap-3 ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} rounded-xl px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 text-sm sm:text-base font-bold transition-colors border-2 ${darkMode ? 'border-white' : 'border-zinc-900'}`}>
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