import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Edit2, X, Phone, MapPin, Settings, LogOut, Home as HomeIcon, BarChart3, Zap, Percent, AlertTriangle, Trash2, Calendar, Bell, Clock, Check, ArrowLeft } from 'lucide-react';
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
        phone: userData.phone || '',
        phone_country_code: userData.phone_country_code || '+49',
        bio: userData.bio || '',
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
              <button onClick={() => navigate(createPageUrl('Home'))} className={`p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-zinc-900 text-zinc-400 hover:text-white' : 'hover:bg-zinc-200 text-zinc-600 hover:text-black'}`}>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
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
          <div className={`relative overflow-hidden ${theme.bgSecondary} border-2 ${theme.border} rounded-2xl`}>
            <div className={`absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-teal-500/5 to-transparent rounded-full blur-3xl`} />
            <div className="relative z-10 p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                {/* Profile Image */}
                <div className="relative group flex-shrink-0">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl border-2 flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white border-zinc-700' : 'bg-zinc-900 border-zinc-300'}`}>
                    {user.profile_image ?
                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" /> :
                    <User className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 ${darkMode ? 'text-black' : 'text-white'}`} />
                    }
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    {uploading ?
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> :
                    <Camera className="w-6 h-6 text-white" />
                    }
                  </label>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  {editing ?
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className={`font-bold text-base sm:text-lg md:text-xl ${theme.border} mb-2 h-10 sm:h-11`}
                    placeholder={t('yourName')} /> :
                  <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme.text} mb-1 sm:mb-2`}>{user.full_name || '-'}</h1>
                  }
                  <p className={`text-xs sm:text-sm ${theme.textSecondary} mb-3 sm:mb-4 truncate font-sans`}>{user.email}</p>
                  
                  {/* Stats Pills */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <div className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border-2 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-300'}`}>
                      <User className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textSecondary}`} />
                      {user.role?.toUpperCase()}
                    </div>
                    <div className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-mono border-2 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-300'}`}>
                      <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textSecondary}`} />
                      {format(new Date(user.created_date), 'MMM yyyy')}
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                {!editing && (
                  <Button onClick={() => setEditing(true)} className={`h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-bold border-2 rounded-xl ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                    <Edit2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('edit')}</span>
                  </Button>
                )}
              </div>

              {/* Bio */}
              {editing ? (
                <div className={`mt-4 sm:mt-5 pt-4 sm:pt-5 border-t ${theme.border}`}>
                  <label className={`block text-xs ${theme.textSecondary} mb-2 tracking-wider font-bold`}>BIO</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder={t('bioPlaceholder')}
                    className={`${theme.border} h-24 sm:h-28 resize-none text-sm font-sans rounded-xl`} />
                </div>
              ) : user.bio && (
                <div className={`mt-4 sm:mt-5 pt-4 sm:pt-5 border-t ${theme.border}`}>
                  <p className={`text-sm sm:text-base ${theme.text} font-sans leading-relaxed`}>{user.bio}</p>
                </div>
              )}
            </div>
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

          {/* Notification Settings - Prominent Section */}
          <div className={`relative overflow-hidden border-2 rounded-2xl ${darkMode ? 'border-emerald-600/30 bg-emerald-700/5' : 'border-teal-500/30 bg-teal-500/5'}`}>
            <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${darkMode ? 'from-emerald-700/20' : 'from-teal-500/20'} to-transparent rounded-full blur-3xl`} />
            <div className="relative z-10 p-5 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-700' : 'bg-teal-500'}`}>
                  <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-wider ${theme.text}`}>BENACHRICHTIGUNGEN</h3>
                  <p className={`text-xs sm:text-sm ${theme.textSecondary} font-sans`}>Stelle alle Erinnerungen individuell ein</p>
                </div>
              </div>
              
              <NotificationSettings darkMode={darkMode} />
              
              {editing && (
                <div className="space-y-4 sm:space-y-5 mt-6">
                  {/* Email Notifications */}
                  <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-white'} border ${theme.border} rounded-xl p-3 sm:p-4`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} mt-0.5`}>
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs sm:text-sm font-bold ${theme.text} mb-0.5`}>E-Mail Benachrichtigungen</h4>
                          <p className={`text-[9px] sm:text-[10px] ${theme.textSecondary} leading-relaxed`}>Erhalte Trading-Sprüche direkt in dein Postfach</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.daily_quote_enabled}
                          onChange={(e) => setFormData({...formData, daily_quote_enabled: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                    {formData.daily_quote_enabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`pt-3 border-t ${theme.border}`}>
                        <label className={`text-[9px] sm:text-[10px] ${theme.textSecondary} mb-2 block font-bold tracking-wider`}>UHRZEIT</label>
                        <div className="flex items-center gap-2">
                          <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textSecondary}`} />
                          <Input
                            type="time"
                            value={formData.daily_quote_time}
                            onChange={(e) => setFormData({...formData, daily_quote_time: e.target.value})}
                            className={`${theme.border} h-9 sm:h-10 text-xs sm:text-sm flex-1`}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* In-App Notifications */}
                  <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-white'} border ${theme.border} rounded-xl p-3 sm:p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} mt-0.5`}>
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs sm:text-sm font-bold ${theme.text} mb-0.5`}>In-App Widget</h4>
                          <p className={`text-[9px] sm:text-[10px] ${theme.textSecondary} leading-relaxed`}>Zeige Sprüche auf Dashboard & Home</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.show_daily_quote_in_app}
                          onChange={(e) => setFormData({...formData, show_daily_quote_in_app: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Browser Push Notifications */}
                  <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-white'} border ${theme.border} rounded-xl p-3 sm:p-4`}>
                    <div className="flex items-start gap-2 sm:gap-3 mb-3">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} mt-0.5`}>
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs sm:text-sm font-bold ${theme.text} mb-0.5`}>Push-Benachrichtigungen</h4>
                        <p className={`text-[9px] sm:text-[10px] ${theme.textSecondary} leading-relaxed`}>Erhalte Benachrichtigungen auf allen Geräten - auch wenn App geschlossen</p>
                      </div>
                    </div>
                    
                    {editing ? (
                      <div className="space-y-3">
                        <PushNotificationManager darkMode={darkMode} onSuccess={loadUser} />
                        
                        {formData.browser_notifications_enabled && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`pt-3 border-t ${theme.border}`}>
                            <label className={`text-[9px] sm:text-[10px] ${theme.textSecondary} mb-2 block font-bold tracking-wider`}>HÄUFIGKEIT PRO TAG</label>
                            <Select value={formData.notification_frequency} onValueChange={(v) => setFormData({...formData, notification_frequency: v})}>
                              <SelectTrigger className={`${theme.border} h-9 sm:h-10 text-xs sm:text-sm w-full`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1" className="text-xs sm:text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>1x täglich (Empfohlen)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="2" className="text-xs sm:text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>2x täglich</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="3" className="text-xs sm:text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span>3x täglich</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="4" className="text-xs sm:text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                    <span>4x täglich (Max)</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className={`text-xs sm:text-sm ${theme.text} font-sans`}>
                        {user.browser_notifications_enabled ? (
                          <div className="flex items-center gap-2 text-emerald-700">
                            <Check className="w-4 h-4" />
                            <span className="font-bold">Aktiv ({user.notification_frequency || '1'}x täglich)</span>
                          </div>
                        ) : (
                          <span className={theme.textSecondary}>Nicht aktiviert</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Email Status */}
                  <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-white'} border ${theme.border} rounded-xl p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      <span className={`text-[9px] sm:text-[10px] ${theme.textSecondary} font-bold tracking-wider`}>E-MAIL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.daily_quote_enabled ? 'bg-teal-500 animate-pulse' : darkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
                      <span className={`text-xs sm:text-sm font-bold ${theme.text}`}>
                        {user.daily_quote_enabled ? 'Aktiv' : 'Aus'}
                      </span>
                    </div>
                    {user.daily_quote_enabled && (
                      <div className={`flex items-center gap-1.5 mt-2 text-[9px] sm:text-[10px] ${theme.textSecondary}`}>
                        <Clock className="w-3 h-3" />
                        {user.daily_quote_time || '09:00'} Uhr
                      </div>
                    )}
                  </div>

                  {/* In-App Status */}
                  <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-white'} border ${theme.border} rounded-xl p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-3.5 h-3.5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                      </svg>
                      <span className={`text-[9px] sm:text-[10px] ${theme.textSecondary} font-bold tracking-wider`}>IN-APP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.show_daily_quote_in_app ? 'bg-purple-500 animate-pulse' : darkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
                      <span className={`text-xs sm:text-sm font-bold ${theme.text}`}>
                        {user.show_daily_quote_in_app ? 'Aktiv' : 'Aus'}
                      </span>
                    </div>
                  </div>

                  {/* Browser Status */}
                  <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-white'} border ${theme.border} rounded-xl p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                      </svg>
                      <span className={`text-[9px] sm:text-[10px] ${theme.textSecondary} font-bold tracking-wider`}>BROWSER</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.browser_notifications_enabled ? 'bg-amber-500 animate-pulse' : darkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
                      <span className={`text-xs sm:text-sm font-bold ${theme.text}`}>
                        {user.browser_notifications_enabled ? 'Aktiv' : 'Aus'}
                      </span>
                    </div>
                    {user.browser_notifications_enabled && (
                      <div className={`flex items-center gap-1.5 mt-2 text-[9px] sm:text-[10px] ${theme.textSecondary}`}>
                        <Zap className="w-3 h-3" />
                        {user.notification_frequency || '1'}x täglich
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  default_risk_percent: user.default_risk_percent || '1',
                  daily_quote_enabled: user.daily_quote_enabled || false,
                  daily_quote_time: user.daily_quote_time || '09:00',
                  show_daily_quote_in_app: user.show_daily_quote_in_app || false,
                  browser_notifications_enabled: user.browser_notifications_enabled || false,
                  notification_frequency: user.notification_frequency || '1'
                });
              }} variant="outline" className={`h-10 sm:h-11 px-3 sm:px-4 border-2 ${theme.border}`}>
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Button onClick={() => navigate(createPageUrl('Home'))} className={`h-10 sm:h-11 text-[10px] sm:text-xs tracking-widest border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <HomeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">HOME</span>
            </Button>
            <Button onClick={() => navigate(createPageUrl('Dashboard'))} className={`h-10 sm:h-11 text-[10px] sm:text-xs tracking-widest border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">STATS</span>
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