import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';

export default function PaywallGuard({ children }) {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check if user has paid
        if (currentUser.payment_status !== 'paid') {
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Access check error:', error);
      }
      setLoading(false);
    };

    checkAccess();
  }, []);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className={theme.textSecondary}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show paywall if not paid
  if (!user || user.payment_status !== 'paid') {
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

        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
              <Lock className={`w-10 h-10 ${darkMode ? 'text-black' : 'text-white'}`} />
            </div>

            <h1 className="text-4xl md:text-5xl tracking-widest mb-4">ACCESS REQUIRED</h1>
            <p className={`text-lg ${theme.textSecondary} mb-8 max-w-2xl mx-auto`}>
              Get full access to the ultimate trading checklist system. One-time payment, lifetime access.
            </p>

            <div className={`inline-flex items-center gap-3 px-8 py-6 rounded-2xl border ${theme.border} bg-gradient-to-br ${darkMode ? 'from-zinc-950 to-zinc-900' : 'from-zinc-100 to-zinc-50'} mb-8`}>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-light">$99</span>
                  <span className={theme.textSecondary}>USD</span>
                </div>
                <p className={`text-sm ${theme.textSecondary} mt-1`}>One-time payment • No subscription</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              {[
                { icon: CheckCircle, title: 'Full Access', desc: 'All features unlocked' },
                { icon: CreditCard, title: 'Secure Payment', desc: 'Card, Apple Pay, Google Pay' },
                { icon: Lock, title: 'Lifetime Updates', desc: 'Forever yours' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`p-6 rounded-2xl border ${theme.border} ${darkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}
                >
                  <item.icon className={`w-8 h-8 mx-auto mb-3 ${theme.text}`} />
                  <h3 className="text-lg tracking-wider mb-2">{item.title}</h3>
                  <p className={`text-sm ${theme.textSecondary}`}>{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <Button 
              onClick={() => navigate(createPageUrl('Payment'))}
              className={`px-12 py-4 text-lg tracking-widest font-bold rounded-xl ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
            >
              GET ACCESS NOW
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className={`text-xs ${theme.textSecondary} mt-6`}>
              100% sicherer Checkout • Digitales Produkt - Sofortiger Zugang
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  // User has paid, show content
  return <>{children}</>;
}