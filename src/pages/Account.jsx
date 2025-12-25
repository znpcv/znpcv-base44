import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Edit2, Check, X, Phone, MapPin, Home as HomeIcon, BarChart3, Zap, Percent, AlertTriangle, Trash2, Calendar, Bell, Clock, LogOut, Settings, Mail } from 'lucide-react';
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
  const [editingSections, setEditingSections] = useState({});
  const [uploading, setUploading] = useState(false);
  const [tempValues, setTempValues] = useState({});

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (err) {
      console.error('Load user failed:', err);
      navigate(createPageUrl('Home'));
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    if (editingSections[section]) {
      setTempValues(prev => {
        const newVals = {...prev};
        delete newVals[section];
        return newVals;
      });
    }
    setEditingSections(prev => ({...prev, [section]: !prev[section]}));
  };

  const saveSection = async (section, data) => {
    try {
      await base44.auth.updateMe(data);
      await loadUser();
      toggleSection(section);
    } catch (err) {
      console.error('Save failed:', err);
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
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
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
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50 backdrop-blur-lg bg-opacity-80`}>
        <div className="max-w-4xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <DarkModeToggle />
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img 
                src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV" 
                className="h-8 sm:h-10 w-auto"
              />
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-3 py-4 space-y-3">
        
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${theme.bgSecondary} border ${theme.border} rounded-2xl p-4`}>
          <div className="flex items-start gap-3">
            <div className="relative group">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white border-zinc-700' : 'bg-zinc-900 border-zinc-200'}`}>
                {user.profile_image ? <img src={user.profile_image} alt="" className="w-full h-full object-cover" /> : <User className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'text-black' : 'text-white'}`} />}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                {uploading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Camera className="w-5 h-5 text-white" />}
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg sm:text-xl font-bold ${theme.text} mb-1 truncate`}>{user.full_name || 'User'}</h1>
              <p className={`text-xs ${theme.textSecondary} mb-2 truncate`}>{user.email}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${darkMode ? 'bg-zinc-900' : 'bg-zinc-200'}`}>{user.role?.toUpperCase()}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${darkMode ? 'bg-zinc-900' : 'bg-zinc-200'}`}>{format(new Date(user.created_date), 'MMM yyyy')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <Section
          icon={<Edit2 className="w-4 h-4" />}
          title="BIO"
          isEditing={editingSections.bio}
          onToggle={() => toggleSection('bio')}
          onSave={() => saveSection('bio', { bio: tempValues.bio })}
          theme={theme}
        >
          {editingSections.bio ? (
            <Textarea
              value={tempValues.bio ?? user.bio ?? ''}
              onChange={(e) => setTempValues({...tempValues, bio: e.target.value})}
              placeholder="Erzähle etwas über dich..."
              className={`${theme.border} h-20 resize-none text-xs`}
            />
          ) : (
            <p className={`text-xs ${theme.text} ${!user.bio && theme.textSecondary}`}>{user.bio || 'Keine Bio hinterlegt'}</p>
          )}
        </Section>

        {/* Contact */}
        <Section
          icon={<Phone className="w-4 h-4" />}
          title="KONTAKT"
          isEditing={editingSections.contact}
          onToggle={() => toggleSection('contact')}
          onSave={() => saveSection('contact', {
            phone: tempValues.phone ?? user.phone,
            phone_country_code: tempValues.phone_country_code ?? user.phone_country_code,
            country: tempValues.country ?? user.country
          })}
          theme={theme}
        >
          {editingSections.contact ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select 
                  value={tempValues.phone_country_code ?? user.phone_country_code ?? '+49'} 
                  onValueChange={(v) => setTempValues({...tempValues, phone_country_code: v})}
                >
                  <SelectTrigger className={`w-16 ${theme.border} h-8 text-xs`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    {COUNTRIES.map(c => <SelectItem key={c.dial} value={c.dial} className="text-xs">{c.dial}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  value={tempValues.phone ?? user.phone ?? ''}
                  onChange={(e) => setTempValues({...tempValues, phone: e.target.value.replace(/[^0-9]/g, '')})}
                  placeholder="123456789"
                  className={`flex-1 ${theme.border} h-8 text-xs`}
                />
              </div>
              <CountrySelect
                value={tempValues.country ?? user.country ?? ''}
                onChange={(v) => setTempValues({...tempValues, country: v})}
                className={`${theme.border} h-8 text-xs`}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className={`text-xs ${theme.text}`}>
                {user.phone_country_code && user.phone ? `${user.phone_country_code} ${user.phone}` : 'Keine Telefonnummer'}
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>
                {COUNTRIES.find(c => c.code === user.country)?.name || 'Kein Land'}
              </div>
            </div>
          )}
        </Section>

        {/* Address */}
        <Section
          icon={<MapPin className="w-4 h-4" />}
          title="ADRESSE"
          isEditing={editingSections.address}
          onToggle={() => toggleSection('address')}
          onSave={() => saveSection('address', {
            address_street: tempValues.address_street ?? user.address_street,
            address_postal_code: tempValues.address_postal_code ?? user.address_postal_code,
            address_city: tempValues.address_city ?? user.address_city,
            address_country: tempValues.address_country ?? user.address_country
          })}
          theme={theme}
        >
          {editingSections.address ? (
            <div className="space-y-2">
              <Input value={tempValues.address_street ?? user.address_street ?? ''} onChange={(e) => setTempValues({...tempValues, address_street: e.target.value})} placeholder="Straße" className={`${theme.border} h-8 text-xs`} />
              <div className="grid grid-cols-2 gap-2">
                <Input value={tempValues.address_postal_code ?? user.address_postal_code ?? ''} onChange={(e) => setTempValues({...tempValues, address_postal_code: e.target.value})} placeholder="PLZ" className={`${theme.border} h-8 text-xs`} />
                <Input value={tempValues.address_city ?? user.address_city ?? ''} onChange={(e) => setTempValues({...tempValues, address_city: e.target.value})} placeholder="Stadt" className={`${theme.border} h-8 text-xs`} />
              </div>
              <CountrySelect value={tempValues.address_country ?? user.address_country ?? ''} onChange={(v) => setTempValues({...tempValues, address_country: v})} className={`${theme.border} h-8 text-xs`} />
            </div>
          ) : (
            <div className={`text-xs ${theme.text} space-y-0.5`}>
              <div>{user.address_street || '-'}</div>
              <div>{user.address_postal_code || '-'} {user.address_city || '-'}</div>
              <div className={theme.textSecondary}>{COUNTRIES.find(c => c.code === user.address_country)?.name || '-'}</div>
            </div>
          )}
        </Section>

        {/* Trading Settings */}
        <Section
          icon={<BarChart3 className="w-4 h-4" />}
          title="TRADING"
          isEditing={editingSections.trading}
          onToggle={() => toggleSection('trading')}
          onSave={() => saveSection('trading', {
            default_leverage: tempValues.default_leverage ?? user.default_leverage,
            default_risk_percent: tempValues.default_risk_percent ?? user.default_risk_percent
          })}
          theme={theme}
        >
          {editingSections.trading ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`text-[9px] ${theme.textSecondary} mb-1 block`}>LEVERAGE</label>
                <Input value={tempValues.default_leverage ?? user.default_leverage ?? '100'} onChange={(e) => setTempValues({...tempValues, default_leverage: e.target.value})} className={`${theme.border} h-8 text-xs`} />
              </div>
              <div>
                <label className={`text-[9px] ${theme.textSecondary} mb-1 block`}>RISK %</label>
                <Input value={tempValues.default_risk_percent ?? user.default_risk_percent ?? '1'} onChange={(e) => setTempValues({...tempValues, default_risk_percent: e.target.value})} className={`${theme.border} h-8 text-xs`} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className={`text-[9px] ${theme.textSecondary} mb-1`}>LEVERAGE</div>
                <div className={`text-sm font-bold ${theme.text}`}>1:{user.default_leverage || '100'}</div>
              </div>
              <div>
                <div className={`text-[9px] ${theme.textSecondary} mb-1`}>RISK</div>
                <div className={`text-sm font-bold ${theme.text}`}>{user.default_risk_percent || '1'}%</div>
              </div>
            </div>
          )}
        </Section>

        {/* Notifications */}
        <Section
          icon={<Bell className="w-4 h-4" />}
          title="BENACHRICHTIGUNGEN"
          isEditing={editingSections.notifications}
          onToggle={() => toggleSection('notifications')}
          onSave={() => saveSection('notifications', {
            daily_quote_enabled: tempValues.daily_quote_enabled ?? user.daily_quote_enabled,
            daily_quote_time: tempValues.daily_quote_time ?? user.daily_quote_time,
            show_daily_quote_in_app: tempValues.show_daily_quote_in_app ?? user.show_daily_quote_in_app,
            browser_notifications_enabled: tempValues.browser_notifications_enabled ?? user.browser_notifications_enabled,
            notification_frequency: tempValues.notification_frequency ?? user.notification_frequency
          })}
          theme={theme}
        >
          {editingSections.notifications ? (
            <div className="space-y-3">
              <NotifToggle
                icon={<Mail className="w-3.5 h-3.5 text-blue-500" />}
                label="E-Mail"
                checked={tempValues.daily_quote_enabled ?? user.daily_quote_enabled ?? false}
                onChange={(v) => setTempValues({...tempValues, daily_quote_enabled: v})}
                theme={theme}
              >
                {(tempValues.daily_quote_enabled ?? user.daily_quote_enabled) && (
                  <Input
                    type="time"
                    value={tempValues.daily_quote_time ?? user.daily_quote_time ?? '09:00'}
                    onChange={(e) => setTempValues({...tempValues, daily_quote_time: e.target.value})}
                    className={`${theme.border} h-8 text-xs w-28`}
                  />
                )}
              </NotifToggle>
              
              <NotifToggle
                icon={<Zap className="w-3.5 h-3.5 text-purple-500" />}
                label="In-App"
                checked={tempValues.show_daily_quote_in_app ?? user.show_daily_quote_in_app ?? false}
                onChange={(v) => setTempValues({...tempValues, show_daily_quote_in_app: v})}
                theme={theme}
              />
              
              <NotifToggle
                icon={<Bell className="w-3.5 h-3.5 text-amber-500" />}
                label="Browser Push"
                checked={tempValues.browser_notifications_enabled ?? user.browser_notifications_enabled ?? false}
                onChange={(v) => setTempValues({...tempValues, browser_notifications_enabled: v})}
                theme={theme}
              >
                {(tempValues.browser_notifications_enabled ?? user.browser_notifications_enabled) && (
                  <Select 
                    value={tempValues.notification_frequency ?? user.notification_frequency ?? '1'} 
                    onValueChange={(v) => setTempValues({...tempValues, notification_frequency: v})}
                  >
                    <SelectTrigger className={`${theme.border} h-8 text-xs w-28`}>
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
              </NotifToggle>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <StatusPill icon={<Mail className="w-3 h-3" />} label="E-Mail" active={user.daily_quote_enabled} extra={user.daily_quote_enabled && user.daily_quote_time} theme={theme} />
              <StatusPill icon={<Zap className="w-3 h-3" />} label="In-App" active={user.show_daily_quote_in_app} theme={theme} />
              <StatusPill icon={<Bell className="w-3 h-3" />} label="Push" active={user.browser_notifications_enabled} extra={user.browser_notifications_enabled && `${user.notification_frequency}x`} theme={theme} />
            </div>
          )}
        </Section>

        {/* Quick Nav */}
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={() => navigate(createPageUrl('Home'))} className={`h-11 text-xs ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
            <HomeIcon className="w-4 h-4" />
          </Button>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))} className={`h-11 text-xs ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button onClick={() => navigate(createPageUrl('Integrations'))} className={`h-11 text-xs ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button onClick={handleLogout} className="h-11 text-xs bg-rose-600 hover:bg-rose-700 text-white">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Danger Zone */}
        <div className={`border-2 border-rose-600/40 ${darkMode ? 'bg-rose-600/5' : 'bg-rose-50'} rounded-xl p-3`}>
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xs font-bold text-rose-600 mb-1">{t('dangerZone')}</h3>
              <p className={`${theme.textSecondary} text-[10px]`}>{t('deleteWarning')}</p>
            </div>
          </div>
          <Button onClick={handleDeleteAccount} className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {t('deletePermanently')}
          </Button>
        </div>
      </main>
    </div>
  );
}

function Section({ icon, title, isEditing, onToggle, onSave, children, theme }) {
  return (
    <div className={`${theme.bgSecondary} border ${theme.border} rounded-xl p-3`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`${theme.textSecondary}`}>{icon}</div>
          <span className={`text-[10px] font-bold tracking-wider ${theme.textSecondary}`}>{title}</span>
        </div>
        <div className="flex gap-1">
          {isEditing && (
            <button onClick={onSave} className={`p-1.5 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-600 hover:bg-teal-700'} text-white`}>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onToggle} className={`p-1.5 rounded-lg ${theme.border} border hover:${theme.bgSecondary}`}>
            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function NotifToggle({ icon, label, checked, onChange, children, theme }) {
  return (
    <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-white'} border ${theme.border} rounded-lg p-2`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`text-xs ${theme.text}`}>{label}</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
          <div className="w-8 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
        </label>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

function StatusPill({ icon, label, active, extra, theme }) {
  return (
    <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-white'} border ${theme.border} rounded-lg p-2`}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={active ? 'text-teal-500' : theme.textSecondary}>{icon}</div>
        <span className={`text-[9px] ${theme.textSecondary}`}>{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-teal-500 animate-pulse' : darkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
        <span className={`text-[10px] font-bold ${theme.text}`}>{active ? 'Aktiv' : 'Aus'}</span>
      </div>
      {extra && <div className={`text-[9px] ${theme.textSecondary} mt-0.5`}>{extra}</div>}
    </div>
  );
}