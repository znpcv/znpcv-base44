import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        navigate(createPageUrl('Home'));
      }
    };
    checkAuth();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('Bitte akzeptieren Sie die AGB und Datenschutzerklärung');
      setLoading(false);
      return;
    }

    try {
      await base44.auth.register(email, password, fullName);
      navigate(createPageUrl('Payment'));
    } catch (err) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    bgCard: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => navigate(createPageUrl('Home'))}>
            <img 
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV" 
              className="h-12 w-auto cursor-pointer"
            />
          </button>
          <DarkModeToggle />
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl tracking-widest mb-2 text-center">REGISTRIEREN</h1>
          <p className={`${theme.textSecondary} text-center mb-8`}>
            Erstelle deinen ZNPCV Account
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className={`block text-sm tracking-wider mb-2 ${theme.text}`}>NAME</label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textSecondary}`} />
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dein Name"
                  className={`pl-12 h-12 rounded-xl border-2 ${theme.border}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm tracking-wider mb-2 ${theme.text}`}>E-MAIL</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textSecondary}`} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.com"
                  className={`pl-12 h-12 rounded-xl border-2 ${theme.border}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm tracking-wider mb-2 ${theme.text}`}>PASSWORT</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textSecondary}`} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  className={`pl-12 h-12 rounded-xl border-2 ${theme.border}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm tracking-wider mb-2 ${theme.text}`}>PASSWORT BESTÄTIGEN</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textSecondary}`} />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className={`pl-12 h-12 rounded-xl border-2 ${theme.border}`}
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className={`text-sm ${theme.textSecondary}`}>
                Ich akzeptiere die{' '}
                <button type="button" onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.text} underline`}>AGB</button>
                {' '}und{' '}
                <button type="button" onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.text} underline`}>Datenschutzerklärung</button>
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg tracking-widest font-bold rounded-xl ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
            >
              {loading ? 'REGISTRIERUNG...' : 'JETZT REGISTRIEREN'}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className={theme.textSecondary}>
              Bereits registriert?{' '}
              <button 
                onClick={() => navigate(createPageUrl('Login'))}
                className={`${theme.text} font-bold hover:underline`}
              >
                Jetzt anmelden
              </button>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}