import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Home, User, Mail, Calendar, LogOut, Edit2, Save, X, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import { format } from 'date-fns';

export default function AccountPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFullName(userData.full_name || '');
    } catch (err) {
      navigate(createPageUrl('Home'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: fullName });
      await loadUser();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl('Home'));
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>
                <Home className="w-6 h-6" />
              </button>
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
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl tracking-widest mb-8">MEIN ACCOUNT</h1>

          {/* Profile Card */}
          <div className={`border-2 ${theme.border} rounded-2xl p-6 sm:p-8 mb-6 ${theme.bgCard}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
                  <User className={`w-8 h-8 ${darkMode ? 'text-black' : 'text-white'}`} />
                </div>
                <div>
                  <div className={`text-xs tracking-wider ${theme.textSecondary} mb-1`}>VOLLSTÄNDIGER NAME</div>
                  {editing ? (
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`font-bold text-lg ${theme.border}`}
                      placeholder="Dein Name"
                    />
                  ) : (
                    <div className={`text-xl font-bold ${theme.text}`}>{user.full_name || '-'}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving} className={`${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'SPEICHERN...' : 'SPEICHERN'}
                    </Button>
                    <Button onClick={() => { setEditing(false); setFullName(user.full_name); }} variant="outline" className={`${theme.border}`}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)} variant="outline" className={`${theme.border}`}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    BEARBEITEN
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 border ${theme.border} rounded-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <Mail className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>E-MAIL</span>
                </div>
                <div className={`text-base ${theme.text}`}>{user.email}</div>
              </div>

              <div className={`p-4 border ${theme.border} rounded-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>ROLLE</span>
                </div>
                <div className={`text-base ${theme.text} uppercase`}>{user.role}</div>
              </div>

              <div className={`p-4 border ${theme.border} rounded-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>REGISTRIERT SEIT</span>
                </div>
                <div className={`text-base ${theme.text}`}>
                  {format(new Date(user.created_date), 'dd.MM.yyyy')}
                </div>
              </div>

              <div className={`p-4 border ${theme.border} rounded-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <User className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>USER ID</span>
                </div>
                <div className={`text-base ${theme.text} font-mono text-xs`}>
                  {user.id.substring(0, 8)}...
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate(createPageUrl('Dashboard'))} 
              variant="outline" 
              className={`h-14 text-base tracking-widest ${theme.border}`}
            >
              DASHBOARD
            </Button>
            <Button 
              onClick={handleLogout} 
              className={`h-14 text-base tracking-widest bg-red-500 hover:bg-red-600 text-white`}
            >
              <LogOut className="w-5 h-5 mr-2" />
              AUSLOGGEN
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className={`mt-16 pt-8 border-t ${theme.border}`}>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
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
        </footer>
      </main>
    </div>
  );
}