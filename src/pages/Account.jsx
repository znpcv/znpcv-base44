import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Edit2, Save, X, Phone, MapPin, Home as HomeIcon, BarChart3, Bell, LogOut, Settings, Mail, Zap, AlertTriangle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import CountrySelect, { COUNTRIES } from '@/components/CountrySelect';
import { format } from 'date-fns';

export default function AccountPage() {
  const navigate = useNavigate();
  const { t, darkMode } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    phone_country_code: '+49',
    country: '',
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_country: '',
    default_leverage: '100',
    default_risk_percent: '1',
    daily_quote_enabled: false,
    daily_quote_time: '09:00',
    show_daily_quote_in_app: false,
    browser_notifications_enabled: false,
    notification_frequency: '1'
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        bio: userData.bio || '',
        phone: userData.phone || '',
        phone_country_code: userData.phone_country_code || '+49',
        country: userData.country || '',
        address_street: userData.address_street || '',
        address_city: userData.address_city || '',
        address_postal_code: userData.address_postal_code || '',
        address_country: userData.address_country || '',
        default_leverage: userData.default_leverage || '100',
        default_risk_percent: userData.default_risk_percent || '1',
        daily_quote_enabled: userData.daily_quote_enabled || false,
        daily_quote_time: userData.daily_quote_time || '09:00',
        show_daily_quote_in_app: userData.show_daily_quote_in_app || false,
        browser_notifications_enabled: userData.browser_notifications_enabled || false,
        notification_frequency: userData.notification_frequency || '1'
      });
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
    bgSecondary: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200'
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`animate-spin w-8 h-8 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <DarkModeToggle />
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img 
                src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV" 
                className="h-12 w-auto"
              />
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Profile Section - Editable */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${theme.bgSecondary} border ${theme.border} rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-bold tracking-wider ${theme.text}`}>PROFIL</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${theme.border} hover:${theme.bgSecondary} transition-colors`}>
                <Edit2 className="w-4 h-4" />
                <span className="text-sm">Bearbeiten</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors">
                  <Save className="w-4 h-4" />
                  <span className="text-sm">{saving ? 'Speichern...' : 'Speichern'}</span>
                </button>
                <button onClick={() => { setEditing(false); loadUser(); }} className={`px-4 py-2 rounded-xl border ${theme.border} hover:${theme.bgSecondary} transition-colors`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-6">
            <div className="relative group">
              <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white border-zinc-700' : 'bg-zinc-900 border-zinc-200'}`}>
                {user.profile_image ? <img src={user.profile_image} alt="" className="w-full h-full object-cover" /> : <User className={`w-12 h-12 ${darkMode ? 'text-black' : 'text-white'}`} />}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                {uploading ? <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> : <Camera className="w-6 h-6 text-white" />}
              </label>
            </div>

            <div className="flex-1">
              {editing ? (
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Name"
                  className={`${theme.border} mb-3 font-bold text-lg`}
                />
              ) : (
                <h1 className={`text-xl font-bold ${theme.text} mb-1`}>{user.full_name || 'User'}</h1>
              )}
              
              <p className={`text-sm ${theme.textSecondary} mb-3`}>{user.email}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>{user.role?.toUpperCase()}</span>
                <span className={`px-3 py-1 rounded-lg text-xs ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>Mitglied seit {format(new Date(user.created_date), 'MMM yyyy')}</span>
              </div>

              {editing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Erzähle etwas über dich..."
                  className={`${theme.border} resize-none`}
                  rows={3}
                />
              ) : (
                <p className={`text-sm ${theme.text} ${!user.bio && theme.textSecondary}`}>
                  {user.bio || 'Keine Bio hinterlegt'}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Contact & Address Section - Editable */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${theme.bgSecondary} border ${theme.border} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <Phone className={`w-5 h-5 ${theme.textSecondary}`} />
            <h2 className={`text-lg font-bold tracking-wider ${theme.text}`}>KONTAKT & ADRESSE</h2>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className={`text-xs ${theme.textSecondary} mb-2 block`}>Telefon</label>
                <div className="flex gap-2">
                  <Select value={formData.phone_country_code} onValueChange={(v) => setFormData({...formData, phone_country_code: v})}>
                    <SelectTrigger className={`w-24 ${theme.border}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COUNTRIES.map(c => <SelectItem key={c.dial} value={c.dial}>{c.dial}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})}
                    placeholder="123456789"
                    className={`flex-1 ${theme.border}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs ${theme.textSecondary} mb-2 block`}>Land</label>
                <CountrySelect value={formData.country} onChange={(v) => setFormData({...formData, country: v})} className={theme.border} />
              </div>

              <div className="pt-4 border-t ${theme.border}">
                <label className={`text-xs ${theme.textSecondary} mb-2 block`}>Adresse</label>
                <Input value={formData.address_street} onChange={(e) => setFormData({...formData, address_street: e.target.value})} placeholder="Straße" className={`${theme.border} mb-2`} />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={formData.address_postal_code} onChange={(e) => setFormData({...formData, address_postal_code: e.target.value})} placeholder="PLZ" className={theme.border} />
                  <Input value={formData.address_city} onChange={(e) => setFormData({...formData, address_city: e.target.value})} placeholder="Stadt" className={theme.border} />
                </div>
                <CountrySelect value={formData.address_country} onChange={(v) => setFormData({...formData, address_country: v})} className={`${theme.border} mt-2`} />
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-xs font-bold ${theme.textSecondary} mb-2`}>TELEFON</h3>
                <p className={`text-sm ${theme.text}`}>
                  {user.phone_country_code && user.phone ? `${user.phone_country_code} ${user.phone}` : 'Keine Telefonnummer'}
                </p>
                <h3 className={`text-xs font-bold ${theme.textSecondary} mb-2 mt-4`}>LAND</h3>
                <p className={`text-sm ${theme.text}`}>
                  {COUNTRIES.find(c => c.code === user.country)?.name || 'Kein Land'}
                </p>
              </div>
              <div>
                <h3 className={`text-xs font-bold ${theme.textSecondary} mb-2`}>ADRESSE</h3>
                <p className={`text-sm ${theme.text}`}>{user.address_street || '-'}</p>
                <p className={`text-sm ${theme.text}`}>{user.address_postal_code || '-'} {user.address_city || '-'}</p>
                <p className={`text-sm ${theme.textSecondary}`}>{COUNTRIES.find(c => c.code === user.address_country)?.name || '-'}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Trading & Notifications Section - Editable */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${theme.bgSecondary} border ${theme.border} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className={`w-5 h-5 ${theme.textSecondary}`} />
            <h2 className={`text-lg font-bold tracking-wider ${theme.text}`}>TRADING & BENACHRICHTIGUNGEN</h2>
          </div>

          {editing ? (
            <div className="space-y-6">
              <div>
                <h3 className={`text-xs font-bold ${theme.textSecondary} mb-3`}>TRADING EINSTELLUNGEN</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs ${theme.textSecondary} mb-2 block`}>Standard Leverage</label>
                    <Input value={formData.default_leverage} onChange={(e) => setFormData({...formData, default_leverage: e.target.value})} className={theme.border} />
                  </div>
                  <div>
                    <label className={`text-xs ${theme.textSecondary} mb-2 block`}>Standard Risk %</label>
                    <Input value={formData.default_risk_percent} onChange={(e) => setFormData({...formData, default_risk_percent: e.target.value})} className={theme.border} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t ${theme.border}">
                <h3 className={`text-xs font-bold ${theme.textSecondary} mb-3`}>BENACHRICHTIGUNGEN</h3>
                <div className="space-y-3">
                  <div className={`${darkMode ? 'bg-zinc-950' : 'bg-white'} border ${theme.border} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm ${theme.text}`}>E-Mail Quote</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.daily_quote_enabled} onChange={(e) => setFormData({...formData, daily_quote_enabled: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                    {formData.daily_quote_enabled && (
                      <Input type="time" value={formData.daily_quote_time} onChange={(e) => setFormData({...formData, daily_quote_time: e.target.value})} className={`${theme.border} mt-2`} />
                    )}
                  </div>

                  <div className={`${darkMode ? 'bg-zinc-950' : 'bg-white'} border ${theme.border} rounded-xl p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <span className={`text-sm ${theme.text}`}>In-App Quote</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.show_daily_quote_in_app} onChange={(e) => setFormData({...formData, show_daily_quote_in_app: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className={`${darkMode ? 'bg-zinc-950' : 'bg-white'} border ${theme.border} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-500" />
                        <span className={`text-sm ${theme.text}`}>Browser Push</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.browser_notifications_enabled} onChange={(e) => setFormData({...formData, browser_notifications_enabled: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                    {formData.browser_notifications_enabled && (
                      <Select value={formData.notification_frequency} onValueChange={(v) => setFormData({...formData, notification_frequency: v})}>
                        <SelectTrigger className={`${theme.border} mt-2`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x täglich</SelectItem>
                          <SelectItem value="2">2x täglich</SelectItem>
                          <SelectItem value="3">3x täglich</SelectItem>
                          <SelectItem value="4">4x täglich</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-xs font-bold ${theme.textSecondary} mb-3`}>TRADING</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme.textSecondary}`}>Leverage:</span>
                    <span className={`text-sm font-bold ${theme.text}`}>1:{user.default_leverage || '100'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme.textSecondary}`}>Risk:</span>
                    <span className={`text-sm font-bold ${theme.text}`}>{user.default_risk_percent || '1'}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className={`text-xs font-bold ${theme.textSecondary} mb-3`}>BENACHRICHTIGUNGEN</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className={`text-sm ${theme.text}`}>E-Mail</span>
                    </div>
                    <span className={`text-xs font-bold ${user.daily_quote_enabled ? 'text-teal-500' : theme.textSecondary}`}>
                      {user.daily_quote_enabled ? `Aktiv (${user.daily_quote_time})` : 'Aus'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span className={`text-sm ${theme.text}`}>In-App</span>
                    </div>
                    <span className={`text-xs font-bold ${user.show_daily_quote_in_app ? 'text-teal-500' : theme.textSecondary}`}>
                      {user.show_daily_quote_in_app ? 'Aktiv' : 'Aus'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <span className={`text-sm ${theme.text}`}>Push</span>
                    </div>
                    <span className={`text-xs font-bold ${user.browser_notifications_enabled ? 'text-teal-500' : theme.textSecondary}`}>
                      {user.browser_notifications_enabled ? `Aktiv (${user.notification_frequency}x)` : 'Aus'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          <Button onClick={() => navigate(createPageUrl('Home'))} className={`h-12 ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
            <HomeIcon className="w-5 h-5" />
          </Button>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))} className={`h-12 ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
            <BarChart3 className="w-5 h-5" />
          </Button>
          <Button onClick={() => navigate(createPageUrl('Integrations'))} className={`h-12 ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
            <Settings className="w-5 h-5" />
          </Button>
          <Button onClick={handleLogout} className="h-12 bg-rose-600 hover:bg-rose-700 text-white">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Danger Zone */}
        <div className={`border-2 border-rose-600/40 ${darkMode ? 'bg-rose-600/10' : 'bg-rose-50'} rounded-2xl p-6`}>
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-rose-600 mb-1">{t('dangerZone')}</h3>
              <p className={`${theme.textSecondary} text-xs`}>{t('deleteWarning')}</p>
            </div>
          </div>
          <Button onClick={handleDeleteAccount} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
            <Trash2 className="w-4 h-4 mr-2" />
            {t('deletePermanently')}
          </Button>
        </div>
      </main>
    </div>
  );
}