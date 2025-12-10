import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate(createPageUrl('Home'));
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <img 
            src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            }
            alt="ZNPCV" 
            className="h-12 w-auto"
          />
          <DarkModeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-5xl tracking-widest mb-4">PAYMENT SUCCESSFUL!</h1>
          <p className={`text-xl ${theme.textSecondary} mb-12`}>
            Welcome to ZNPCV! You now have full lifetime access.
          </p>

          <div className={`p-8 rounded-2xl border ${theme.border} ${darkMode ? 'bg-zinc-950' : 'bg-zinc-50'} mb-8`}>
            <h2 className="text-2xl tracking-widest mb-4">WHAT'S NEXT?</h2>
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className={theme.textSecondary}>Start your first analysis with the ZNPCV checklist</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className={theme.textSecondary}>Explore all features and trading tools</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className={theme.textSecondary}>Track your performance in the dashboard</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => navigate(createPageUrl('Home'))}
            className={`px-12 py-4 text-lg tracking-widest font-bold rounded-xl ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
          >
            START TRADING
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className={`text-sm ${theme.textSecondary} mt-6`}>
            Redirecting to dashboard in 5 seconds...
          </p>
        </motion.div>
      </main>
    </div>
  );
}