import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Edit2, X, Phone, MapPin, Settings, LogOut, Home as HomeIcon, BarChart3, Zap, Percent, AlertTriangle, Trash2, Calendar, Bell, Clock, Check, Shield, Lock, Mail, BellOff, LineChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import CountrySelect, { COUNTRIES } from '@/components/CountrySelect';
import { format } from 'date-fns';
import PushNotificationManager from '@/components/PushNotificationManager';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import NotificationHistory from '@/components/notifications/NotificationHistory';

export default function AccountPage() {
  const navigate = useNavigate();
  const { t, darkMode } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    phone_country_code: '+49',
    bio: '',
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_country: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        phone_country_code: userData.phone_country_code || '+49',
        bio: userData.bio || '',
        address_street: userData.address_street || '',
        address_city: userData.address_city || '',
        address_postal_code: userData.address_postal_code || '',
        address_country: userData.address_country || ''
      });
      setTwoFactorEnabled(userData.two_factor_enabled || false);
    } catch (err) {
      console.error('Load user failed:', err);
      navigate(createPageUrl('Home'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await base44.auth.updateMe(formData);
      await loadUser();
      setEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_image: file_url });
      await loadUser();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl('Home'));
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('confirmDeleteAccount'))) {
      if (window.confirm(t('confirmDeleteFinal'))) {
        try {
          await base44.asServiceRole.entities.User.delete(user.id);
          await base44.auth.logout();
          navigate(createPageUrl('Home'));
        } catch (err) {
          alert(t('deleteError'));
        }
      }
    }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200'
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`animate-spin w-12 h-12 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <DarkModeToggle />
            </div>

            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img 
                src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV" 
                className="h-7 sm:h-8 md:h-10 lg:h-12 xl:h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-5 md:px-8 py-5 sm:py-7 md:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
          
          {/* Profile Card */}
          <div className={`relative overflow-hidden border-2 ${theme.border} rounded-2xl`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${darkMode ? 'from-zinc-900 via-black to-black' : 'from-zinc-100 via-white to-white'}`} />
            <div className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Profile Image */}
                <div className="relative group flex-shrink-0">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white border-zinc-700' : 'bg-zinc-900 border-zinc-300'}`}>
                    {user.profile_image ?
                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" /> :
                    <User className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'text-black' : 'text-white'}`} />
                    }
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    {uploading ?
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> :
                    <Camera className="w-5 h-5 text-white" />
                    }
                  </label>
                </div>

                {/* User Info - Inline */}
                <div className="flex-1 min-w-0">
                  {editing ?
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className={`font-bold text-base sm:text-lg ${theme.border} mb-2 h-10 sm:h-11 rounded-xl`}
                    placeholder={t('yourName')} /> :
                  <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme.text} mb-1.5 truncate`}>{user.full_name || '-'}</h1>
                  }
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex items-center gap-1 text-xs ${theme.textSecondary} font-mono`}>
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[160px] sm:max-w-[240px]">{user.email}</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold ${darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'}`}>
                      {user.role?.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
            {/* Contact & Address Info */}
            <div className={`border-2 ${theme.border} rounded-2xl p-4 sm:p-5 md:p-6`}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className={`w-5 h-5 ${theme.textSecondary}`} />
                <span className={`text-xs tracking-wider ${theme.textSecondary} font-bold`}>KONTAKT & ADRESSE</span>
              </div>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className={`text-xs ${theme.textMuted} mb-2 block tracking-wider font-bold`}>ADRESSE</label>
                    <div className="space-y-2">
                      <Input
                        value={formData.address_street}
                        onChange={(e) => setFormData({...formData, address_street: e.target.value})}
                        placeholder="Straße 123"
                        className={`${theme.border} h-10 text-sm rounded-lg`} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={formData.address_postal_code}
                          onChange={(e) => setFormData({...formData, address_postal_code: e.target.value})}
                          placeholder="PLZ"
                          className={`${theme.border} h-10 text-sm rounded-lg`} />
                        <Input
                          value={formData.address_city}
                          onChange={(e) => setFormData({...formData, address_city: e.target.value})}
                          placeholder="Stadt"
                          className={`${theme.border} h-10 text-sm rounded-lg`} />
                      </div>
                      <CountrySelect
                        value={formData.address_country}
                        onChange={(v) => setFormData({...formData, address_country: v})}
                        className={`${theme.border} h-10 text-sm rounded-lg`} />
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs ${theme.textMuted} mb-2 block tracking-wider font-bold`}>TELEFON</label>
                    <div className="flex gap-2">
                      <Select value={formData.phone_country_code} onValueChange={(v) => setFormData({...formData, phone_country_code: v})}>
                        <SelectTrigger className={`w-24 ${theme.border} h-10 text-sm rounded-lg`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {COUNTRIES.map((c) =>
                          <SelectItem key={c.dial} value={c.dial} className="text-sm">{c.dial}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})}
                        placeholder="123456789"
                        className={`flex-1 ${theme.border} h-10 text-sm rounded-lg`} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className={`text-xs ${theme.textMuted} mb-2 tracking-wider font-bold`}>ADRESSE</div>
                    <div className={`text-sm ${theme.text} p-3 border ${theme.border} rounded-xl ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'} space-y-1`}>
                      <div>{user.address_street || '-'}</div>
                      <div>{user.address_postal_code && user.address_city ? `${user.address_postal_code} ${user.address_city}` : '-'}</div>
                      <div className="text-xs">{COUNTRIES.find((c) => c.code === user.address_country)?.name || '-'}</div>
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs ${theme.textMuted} mb-2 tracking-wider font-bold`}>TELEFON</div>
                    <div className={`text-sm ${theme.text} font-mono p-3 border ${theme.border} rounded-xl ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
                      {user.phone_country_code && user.phone ? `${user.phone_country_code} ${user.phone}` : '-'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security & Notifications */}
            <div className="space-y-4">
              {/* Security */}
              <div className={`border-2 ${theme.border} rounded-2xl p-5 md:p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary} font-bold`}>SECURITY</span>
                </div>
                <div className={`flex items-center justify-between p-3 border ${theme.border} rounded-xl ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
                  <div className="flex items-center gap-3">
                    <Lock className={`w-4 h-4 ${twoFactorEnabled ? 'text-emerald-700' : theme.textSecondary}`} />
                    <div>
                      <div className={`text-sm font-bold ${theme.text}`}>2FA</div>
                      <div className={`text-xs ${theme.textMuted} font-sans`}>Two-Factor Auth</div>
                    </div>
                  </div>
                  {editing ? (
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-all ${twoFactorEnabled ? 'bg-emerald-700' : darkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`}
                    >
                      <div className={`absolute top-0.5 ${twoFactorEnabled ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-white rounded-full transition-all`} />
                    </button>
                  ) : (
                    <span className={`text-sm font-bold ${twoFactorEnabled ? 'text-emerald-700' : theme.textMuted}`}>
                      {twoFactorEnabled ? 'ON' : 'OFF'}
                    </span>
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className={`border-2 ${theme.border} rounded-2xl p-5 md:p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary} font-bold`}>NOTIFICATIONS</span>
                </div>
                <div className={`p-3 border ${theme.border} rounded-xl ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
                  {user.browser_notifications_enabled ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Check className="w-4 h-4" />
                        <span className="font-bold text-sm">Push aktiv</span>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            if ('serviceWorker' in navigator) {
                              const reg = await navigator.serviceWorker.ready;
                              const sub = await reg.pushManager.getSubscription();
                              if (sub) await sub.unsubscribe();
                            }
                            await base44.auth.updateMe({ browser_notifications_enabled: false, push_topics: [] });
                            base44.analytics.track({ eventName: 'push_unsubscribed' });
                            await loadUser();
                          } catch (err) { console.error(err); }
                        }}
                        className={`flex items-center gap-2 text-xs font-bold tracking-wider border-2 rounded-lg px-3 py-2 transition-colors ${darkMode ? 'border-zinc-700 text-zinc-400 hover:border-rose-600 hover:text-rose-400' : 'border-zinc-300 text-zinc-500 hover:border-red-500 hover:text-red-500'}`}
                      >
                        <BellOff className="w-4 h-4" /> ABBESTELLEN
                      </button>
                    </div>
                  ) : (
                    <span className={`${theme.textSecondary} text-sm`}>Deaktiviert</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {editing ? (
              <>
                <Button 
                  onClick={async () => {
                    await handleSave();
                    if (twoFactorEnabled !== user.two_factor_enabled) {
                      await base44.auth.updateMe({ two_factor_enabled: twoFactorEnabled });
                    }
                  }} 
                  disabled={saving} 
                  className={`h-12 sm:h-13 text-sm font-bold border-2 rounded-xl ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '...' : t('save')}
                </Button>
                <Button onClick={() => {
                  setEditing(false);
                  setFormData({
                    full_name: user.full_name || '',
                    phone: user.phone || '',
                    phone_country_code: user.phone_country_code || '+49',
                    bio: user.bio || '',
                    address_street: user.address_street || '',
                    address_city: user.address_city || '',
                    address_postal_code: user.address_postal_code || '',
                    address_country: user.address_country || ''
                  });
                }} variant="outline" className={`h-12 text-sm font-bold border-2 rounded-xl ${theme.border}`}>
                  <X className="w-4 h-4 mr-2" />
                  ABBRECHEN
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate(createPageUrl('Home'))} className={`h-12 text-sm tracking-wider border-2 rounded-xl ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-300 text-black hover:bg-zinc-200'}`}>
                  <HomeIcon className="w-4 h-4 mr-2" />
                  HOME
                </Button>
                <Button onClick={() => setEditing(true)} className={`h-12 text-sm tracking-wider border-2 rounded-xl ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  BEARBEITEN
                </Button>
                <Button onClick={handleLogout} className="col-span-2 h-12 text-sm tracking-wider border-2 bg-rose-600 hover:bg-rose-700 text-white border-rose-600 rounded-xl">
                  <LogOut className="w-4 h-4 mr-2" />
                  LOGOUT
                </Button>
              </>
            )}
          </div>

          {/* Danger Zone */}
          <div className={`border-2 border-rose-600/40 ${darkMode ? 'bg-rose-600/5' : 'bg-rose-50'} rounded-2xl p-5 md:p-6`}>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm tracking-wider text-rose-600 font-bold mb-1">{t('dangerZone')}</h3>
                <p className={`${theme.textSecondary} text-sm leading-relaxed font-sans`}>
                  {t('deleteWarning')}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDeleteAccount}
              className="w-full h-11 border-2 bg-rose-600 text-white hover:bg-rose-700 border-rose-600 text-sm font-bold tracking-wider rounded-xl">
              <Trash2 className="w-4 h-4 mr-2" />
              {t('deletePermanently')}
            </Button>
          </div>
        </motion.div>

        {/* Admin PWA Link */}
        {user?.role === 'admin' && (
          <div className={`mt-6 border-2 ${theme.border} rounded-2xl p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <LineChart className={`w-5 h-5 ${theme.textMuted}`} />
              <span className={`text-sm tracking-wider font-bold ${theme.textSecondary}`}>PWA / PUSH ANALYTICS</span>
            </div>
            <button
              onClick={() => navigate(createPageUrl('PWAAdmin'))}
              className={`text-xs font-bold tracking-wider px-4 py-2 rounded-xl border-2 transition-colors ${darkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-900' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'}`}
            >
              ÖFFNEN
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className={`mt-12 md:mt-16 pt-6 border-t ${theme.border}`}>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <button onClick={() => navigate(createPageUrl('Impressum'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>Impressum</button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>Datenschutz</button>
            <div className={`h-3 w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors`}>AGB</button>
          </div>
        </footer>
      </main>
    </div>
  );
}