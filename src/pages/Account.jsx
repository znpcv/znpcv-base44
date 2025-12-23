import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Edit2, X, Phone, MapPin, Settings, LogOut, Home as HomeIcon, BarChart3, Zap, Percent, AlertTriangle, Trash2, Calendar } from 'lucide-react';
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
    phone: '',
    phone_country_code: '+49',
    bio: '',
    country: '',
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_country: '',
    default_leverage: '100',
    default_risk_percent: '1'
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
        phone: userData.phone || '',
        phone_country_code: userData.phone_country_code || '+49',
        bio: userData.bio || '',
        country: userData.country || '',
        address_street: userData.address_street || '',
        address_city: userData.address_city || '',
        address_postal_code: userData.address_postal_code || '',
        address_country: userData.address_country || '',
        default_leverage: userData.default_leverage || '100',
        default_risk_percent: userData.default_risk_percent || '1'
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
        <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3">
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
      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5 md:space-y-6">
          
          {/* Profile Card */}
          <div className={`${theme.bgSecondary} border-2 ${theme.border} rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6`}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
              {/* Profile Image */}
              <div className="relative group flex-shrink-0">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl md:rounded-2xl border-2 flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white border-zinc-700' : 'bg-zinc-900 border-zinc-300'}`}>
                  {user.profile_image ?
                  <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" /> :
                  <User className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 ${darkMode ? 'text-black' : 'text-white'}`} />
                  }
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  {uploading ?
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> :
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  }
                </label>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                {editing ?
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className={`font-bold text-sm sm:text-base md:text-lg ${theme.border} mb-2 h-9 sm:h-10`}
                  placeholder={t('yourName')} /> :
                <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme.text} mb-1 sm:mb-2`}>{user.full_name || '-'}</h1>
                }
                <p className={`text-[10px] sm:text-xs md:text-sm ${theme.textSecondary} mb-2 sm:mb-3 truncate`}>{user.email}</p>
                
                {/* Stats Pills */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}>
                    <User className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${theme.textSecondary}`} />
                    {user.role?.toUpperCase()}
                  </div>
                  <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}>
                    <Calendar className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${theme.textSecondary}`} />
                    {format(new Date(user.created_date), 'MM/yyyy')}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {!editing && (
                <Button onClick={() => setEditing(true)} className={`h-8 sm:h-9 px-3 sm:px-4 text-[10px] sm:text-xs font-bold border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">{t('edit')}</span>
                </Button>
              )}
            </div>

            {/* Bio */}
            {editing ? (
              <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${theme.border}`}>
                <label className={`block text-[10px] sm:text-xs ${theme.textSecondary} mb-2 tracking-wider`}>BIO</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder={t('bioPlaceholder')}
                  className={`${theme.border} h-20 sm:h-24 resize-none text-xs font-sans`} />
              </div>
            ) : user.bio && (
              <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${theme.border}`}>
                <p className={`text-xs sm:text-sm ${theme.text} font-sans leading-relaxed`}>{user.bio}</p>
              </div>
            )}
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Phone */}
            <div className={`${theme.bgSecondary} border-2 ${theme.border} rounded-xl p-3 sm:p-4 md:p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <Phone className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textSecondary}`} />
                <span className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary}`}>{t('phone')}</span>
              </div>
              {editing ?
              <div className="flex gap-2">
                <Select value={formData.phone_country_code} onValueChange={(v) => setFormData({...formData, phone_country_code: v})}>
                  <SelectTrigger className={`w-16 sm:w-20 ${theme.border} h-8 sm:h-9 text-[10px] sm:text-xs`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {COUNTRIES.map((c) =>
                    <SelectItem key={c.dial} value={c.dial} className="text-xs">{c.dial}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})}
                  placeholder="123456789"
                  className={`flex-1 ${theme.border} h-8 sm:h-9 text-[10px] sm:text-xs`} />
              </div> :
              <div className={`text-xs sm:text-sm ${theme.text} font-mono`}>
                {user.phone_country_code && user.phone ? `${user.phone_country_code} ${user.phone}` : '-'}
              </div>
              }
            </div>

            {/* Country */}
            <div className={`${theme.bgSecondary} border-2 ${theme.border} rounded-xl p-3 sm:p-4 md:p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textSecondary}`} />
                <span className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary}`}>{t('country')}</span>
              </div>
              {editing ?
              <CountrySelect
                value={formData.country}
                onChange={(v) => setFormData({...formData, country: v})}
                className={`${theme.border} h-8 sm:h-9 text-[10px] sm:text-xs`} /> :
              <div className={`text-xs sm:text-sm ${theme.text}`}>
                {COUNTRIES.find((c) => c.code === user.country)?.name || '-'}
              </div>
              }
            </div>
          </div>

          {/* Address */}
          <div className={`${theme.bgSecondary} border-2 ${theme.border} rounded-xl p-3 sm:p-4 md:p-5`}>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <HomeIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textSecondary}`} />
              <span className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary}`}>{t('address')}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="col-span-2">
                {editing ?
                <Input
                  value={formData.address_street}
                  onChange={(e) => setFormData({...formData, address_street: e.target.value})}
                  placeholder={t('street')}
                  className={`${theme.border} h-8 sm:h-9 text-[10px] sm:text-xs`} /> :
                <div className={`text-[10px] sm:text-xs ${theme.text} p-2 sm:p-3 border ${theme.border} rounded-lg`}>
                  {user.address_street || '-'}
                </div>
                }
              </div>

              <div>
                {editing ?
                <Input
                  value={formData.address_postal_code}
                  onChange={(e) => setFormData({...formData, address_postal_code: e.target.value})}
                  placeholder={t('postalCode')}
                  className={`${theme.border} h-8 sm:h-9 text-[10px] sm:text-xs`} /> :
                <div className={`text-[10px] sm:text-xs ${theme.text} p-2 sm:p-3 border ${theme.border} rounded-lg`}>
                  {user.address_postal_code || '-'}
                </div>
                }
              </div>

              <div>
                {editing ?
                <Input
                  value={formData.address_city}
                  onChange={(e) => setFormData({...formData, address_city: e.target.value})}
                  placeholder={t('city')}
                  className={`${theme.border} h-8 sm:h-9 text-[10px] sm:text-xs`} /> :
                <div className={`text-[10px] sm:text-xs ${theme.text} p-2 sm:p-3 border ${theme.border} rounded-lg`}>
                  {user.address_city || '-'}
                </div>
                }
              </div>

              <div className="col-span-2">
                {editing ?
                <CountrySelect
                  value={formData.address_country}
                  onChange={(v) => setFormData({...formData, address_country: v})}
                  className={`${theme.border} h-8 sm:h-9 text-[10px] sm:text-xs`} /> :
                <div className={`text-[10px] sm:text-xs ${theme.text} p-2 sm:p-3 border ${theme.border} rounded-lg`}>
                  {COUNTRIES.find((c) => c.code === user.address_country)?.name || '-'}
                </div>
                }
              </div>
            </div>
          </div>

          {/* Trading Preferences */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className={`${theme.bgSecondary} border-2 ${theme.border} rounded-xl p-3 sm:p-4 md:p-5`}>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3">
                <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500`} />
                <span className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary}`}>LEVERAGE</span>
              </div>
              {editing ?
              <Input
                value={formData.default_leverage}
                onChange={(e) => setFormData({...formData, default_leverage: e.target.value})}
                placeholder="100"
                className={`${theme.border} h-8 sm:h-9 text-[10px] sm:text-xs`} /> :
              <div className={`text-sm sm:text-base md:text-lg font-bold ${theme.text}`}>1:{user.default_leverage || '100'}</div>
              }
            </div>

            <div className={`${theme.bgSecondary} border-2 ${theme.border} rounded-xl p-3 sm:p-4 md:p-5`}>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3">
                <Percent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500`} />
                <span className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary}`}>RISK</span>
              </div>
              {editing ?
              <Input
                value={formData.default_risk_percent}
                onChange={(e) => setFormData({...formData, default_risk_percent: e.target.value})}
                placeholder="1"
                className={`${theme.border} h-8 sm:h-9 text-[10px] sm:text-xs`} /> :
              <div className={`text-sm sm:text-base md:text-lg font-bold ${theme.text}`}>{user.default_risk_percent || '1'}%</div>
              }
            </div>
          </div>

          {/* Save/Cancel Buttons (only in edit mode) */}
          {editing && (
            <div className="flex gap-2 sm:gap-3">
              <Button onClick={handleSave} disabled={saving} className={`flex-1 h-10 sm:h-11 text-xs sm:text-sm font-bold border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">{saving ? '...' : t('save')}</span>
                <span className="sm:hidden">{saving ? '...' : 'OK'}</span>
              </Button>
              <Button onClick={() => {
                setEditing(false);
                setFormData({
                  full_name: user.full_name || '',
                  phone: user.phone || '',
                  phone_country_code: user.phone_country_code || '+49',
                  bio: user.bio || '',
                  country: user.country || '',
                  address_street: user.address_street || '',
                  address_city: user.address_city || '',
                  address_postal_code: user.address_postal_code || '',
                  address_country: user.address_country || '',
                  default_leverage: user.default_leverage || '100',
                  default_risk_percent: user.default_risk_percent || '1'
                });
              }} variant="outline" className={`h-10 sm:h-11 px-3 sm:px-4 border-2 ${theme.border}`}>
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Button onClick={() => navigate(createPageUrl('Home'))} className={`h-10 sm:h-11 text-[10px] sm:text-xs tracking-widest border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <HomeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">HOME</span>
            </Button>
            <Button onClick={() => navigate(createPageUrl('Dashboard'))} className={`h-10 sm:h-11 text-[10px] sm:text-xs tracking-widest border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">STATS</span>
            </Button>
            <Button onClick={() => navigate(createPageUrl('Integrations'))} className={`h-10 sm:h-11 text-[10px] sm:text-xs tracking-widest border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">TOOLS</span>
            </Button>
            <Button onClick={handleLogout} className="h-10 sm:h-11 text-[10px] sm:text-xs tracking-widest border-2 bg-rose-600 hover:bg-rose-700 text-white border-rose-600">
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">OUT</span>
            </Button>
          </div>

          {/* Danger Zone */}
          <div className={`border-2 border-rose-600/40 ${darkMode ? 'bg-rose-600/5' : 'bg-rose-50'} rounded-xl p-3 sm:p-4 md:p-5`}>
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-base tracking-wider text-rose-600 font-bold mb-1">{t('dangerZone')}</h3>
                <p className={`${theme.textSecondary} text-[10px] sm:text-xs leading-relaxed font-sans`}>
                  {t('deleteWarning')}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDeleteAccount}
              className="w-full h-9 sm:h-10 md:h-11 border-2 bg-rose-600 text-white hover:bg-rose-700 border-rose-600 text-[10px] sm:text-xs md:text-sm font-bold tracking-wider">
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
              {t('deletePermanently')}
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className={`mt-10 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t ${theme.border}`}>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] sm:text-xs">
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