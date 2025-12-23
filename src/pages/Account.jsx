import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Edit2, X, Phone, MapPin, Settings, LogOut, Home as HomeIcon, BarChart3, Zap, Percent, AlertTriangle, Trash2 } from 'lucide-react';
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
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFullName(userData.full_name || '');
      setPhone(userData.phone || '');
      setPhoneCountryCode(userData.phone_country_code || '+49');
      setBio(userData.bio || '');
      setCountry(userData.country || '');
      setAddressStreet(userData.address_street || '');
      setAddressCity(userData.address_city || '');
      setAddressPostalCode(userData.address_postal_code || '');
      setAddressCountry(userData.address_country || '');
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
      await base44.auth.updateMe({
        full_name: fullName,
        phone: phone,
        phone_country_code: phoneCountryCode,
        bio: bio,
        country: country,
        address_street: addressStreet,
        address_city: addressCity,
        address_postal_code: addressPostalCode,
        address_country: addressCountry
      });
      await loadUser();
      setEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCountryChange = (countryCode) => {
    setCountry(countryCode);
    const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);
    if (selectedCountry && !phoneCountryCode) {
      setPhoneCountryCode(selectedCountry.dial);
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
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200'
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
      {/* Compact Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-5xl mx-auto px-2 sm:px-3 md:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <DarkModeToggle />
            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img
                src={darkMode ?
                "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png" :
                "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV"
                className="h-8 sm:h-10 md:h-12 w-auto" />
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content - Ultra Compact */}
      <main className="max-w-5xl mx-auto px-2 sm:px-3 md:px-6 py-3 sm:py-4 md:py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
          
          {/* Profile Card - Compact */}
          <div className={`${theme.bgSecondary} border ${theme.border} rounded-xl p-3 sm:p-4 md:p-5 lg:p-6`}>
            <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
              {/* Profile Image */}
              <div className="relative group flex-shrink-0">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl border-2 flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white border-zinc-800' : 'bg-zinc-900 border-zinc-300'}`}>
                  {user.profile_image ?
                  <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" /> :
                  <User className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 ${darkMode ? 'text-black' : 'text-white'}`} />
                  }
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  {uploading ?
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> :
                  <Camera className="w-4 h-4 text-white" />
                  }
                </label>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                {editing ?
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`font-bold text-sm sm:text-base ${theme.border} mb-1 h-8 sm:h-9`}
                  placeholder={t('yourName')} /> :
                <div className={`text-base sm:text-lg md:text-xl font-bold ${theme.text} truncate`}>{user.full_name || '-'}</div>
                }
                <div className={`text-[10px] sm:text-xs ${theme.textSecondary} truncate mb-1.5`}>{user.email}</div>
                
                {/* Inline Stats */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}>
                    <div className="w-1 h-1 bg-teal-600 rounded-full" />
                    <span className={theme.textSecondary}>{user.role?.toUpperCase()}</span>
                  </div>
                  <div className={`text-[9px] ${theme.textSecondary}`}>
                    {format(new Date(user.created_date), 'MM/yyyy')}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex gap-1 flex-shrink-0">
                {editing ?
                <>
                  <Button onClick={handleSave} disabled={saving} size="sm" className={`h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-bold border-2 ${darkMode ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900'}`}>
                    <Save className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">{saving ? '...' : t('save')}</span>
                  </Button>
                  <Button onClick={() => {
                    setEditing(false);
                    setFullName(user.full_name);
                    setPhone(user.phone || '');
                    setPhoneCountryCode(user.phone_country_code || '+49');
                    setBio(user.bio || '');
                    setCountry(user.country || '');
                    setAddressStreet(user.address_street || '');
                    setAddressCity(user.address_city || '');
                    setAddressPostalCode(user.address_postal_code || '');
                    setAddressCountry(user.address_country || '');
                  }} size="sm" variant="outline" className={`h-8 px-2 border-2 ${theme.border}`}>
                    <X className="w-3 h-3" />
                  </Button>
                </> :
                <Button onClick={() => setEditing(true)} size="sm" className={`h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-bold border-2 ${darkMode ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900'}`}>
                  <Edit2 className="w-3 h-3 sm:mr-1" />
                  <span className="hidden sm:inline">{t('edit')}</span>
                </Button>
                }
              </div>
            </div>

            {/* Bio */}
            {editing &&
            <div className="mt-3 pt-3 border-t ${theme.border}">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('bioPlaceholder')}
                className={`${theme.border} h-12 sm:h-14 resize-none text-[10px] sm:text-xs`} />
            </div>
            }
            {!editing && bio &&
            <div className="mt-3 pt-3 border-t ${theme.border}">
              <p className={`text-[10px] sm:text-xs ${theme.text}`}>{bio}</p>
            </div>
            }
          </div>

          {/* Contact Grid - Super Compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div className={`${theme.bgSecondary} border ${theme.border} rounded-xl p-2.5 sm:p-3 md:p-4`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Phone className={`w-3.5 h-3.5 ${theme.textSecondary}`} />
                <span className={`text-[10px] tracking-wider ${theme.textSecondary}`}>{t('phone')}</span>
              </div>
              {editing ?
              <div className="flex gap-1.5">
                <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                  <SelectTrigger className={`w-16 sm:w-20 ${theme.border} h-7 sm:h-8 text-[10px] sm:text-xs`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {COUNTRIES.map((c) =>
                    <SelectItem key={c.dial} value={c.dial} className="text-xs">{c.dial}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456789"
                  className={`flex-1 ${theme.border} h-7 sm:h-8 text-[10px] sm:text-xs`} />
              </div> :
              <div className={`text-xs sm:text-sm ${theme.text}`}>
                {user.phone_country_code && user.phone ? `${user.phone_country_code} ${user.phone}` : '-'}
              </div>
              }
            </div>

            <div className={`${theme.bgSecondary} border ${theme.border} rounded-xl p-2.5 sm:p-3 md:p-4`}>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className={`w-3.5 h-3.5 ${theme.textSecondary}`} />
                <span className={`text-[10px] tracking-wider ${theme.textSecondary}`}>{t('country')}</span>
              </div>
              {editing ?
              <CountrySelect
                value={country}
                onChange={handleCountryChange}
                className={`${theme.border} h-7 sm:h-8 text-[10px] sm:text-xs`} /> :
              <div className={`text-xs sm:text-sm ${theme.text}`}>
                {COUNTRIES.find((c) => c.code === user.country)?.name || '-'}
              </div>
              }
            </div>
          </div>

          {/* Address - Collapsible Compact */}
          <div className={`${theme.bgSecondary} border ${theme.border} rounded-xl p-2.5 sm:p-3 md:p-4`}>
            <div className="flex items-center gap-1.5 mb-2">
              <HomeIcon className="w-3.5 h-3.5 ${theme.textSecondary}" />
              <span className={`text-[10px] tracking-wider ${theme.textSecondary}`}>{t('address')}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="col-span-2">
                {editing ?
                <Input
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder={t('street')}
                  className={`${theme.border} h-7 sm:h-8 text-[10px] sm:text-xs`} /> :
                <div className={`text-[10px] sm:text-xs ${theme.text} p-1.5 sm:p-2 border ${theme.border} rounded`}>
                  {user.address_street || '-'}
                </div>
                }
              </div>

              <div>
                {editing ?
                <Input
                  value={addressPostalCode}
                  onChange={(e) => setAddressPostalCode(e.target.value)}
                  placeholder={t('postalCode')}
                  className={`${theme.border} h-7 sm:h-8 text-[10px] sm:text-xs`} /> :
                <div className={`text-[10px] sm:text-xs ${theme.text} p-1.5 sm:p-2 border ${theme.border} rounded`}>
                  {user.address_postal_code || '-'}
                </div>
                }
              </div>

              <div>
                {editing ?
                <Input
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  placeholder={t('city')}
                  className={`${theme.border} h-7 sm:h-8 text-[10px] sm:text-xs`} /> :
                <div className={`text-[10px] sm:text-xs ${theme.text} p-1.5 sm:p-2 border ${theme.border} rounded`}>
                  {user.address_city || '-'}
                </div>
                }
              </div>

              <div className="col-span-2">
                {editing ?
                <CountrySelect
                  value={addressCountry}
                  onChange={setAddressCountry}
                  className={`${theme.border} h-7 sm:h-8 text-[10px] sm:text-xs`} /> :
                <div className={`text-[10px] sm:text-xs ${theme.text} p-1.5 sm:p-2 border ${theme.border} rounded`}>
                  {COUNTRIES.find((c) => c.code === user.address_country)?.name || '-'}
                </div>
                }
              </div>
            </div>
          </div>

          {/* Trading Preferences - Inline */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div className={`${theme.bgSecondary} border ${theme.border} rounded-xl p-2.5 sm:p-3 md:p-4`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap className={`w-3.5 h-3.5 text-purple-500`} />
                <span className={`text-[10px] tracking-wider ${theme.textSecondary}`}>LEVERAGE</span>
              </div>
              {editing ?
              <Input
                value={user.default_leverage || '100'}
                onChange={async (e) => {
                  await base44.auth.updateMe({ default_leverage: e.target.value });
                  await loadUser();
                }}
                placeholder="100"
                className={`${theme.border} h-7 sm:h-8 text-xs`} /> :
              <div className={`text-sm sm:text-base font-bold ${theme.text}`}>1:{user.default_leverage || '100'}</div>
              }
            </div>

            <div className={`${theme.bgSecondary} border ${theme.border} rounded-xl p-2.5 sm:p-3 md:p-4`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Percent className={`w-3.5 h-3.5 text-amber-500`} />
                <span className={`text-[10px] tracking-wider ${theme.textSecondary}`}>RISK</span>
              </div>
              {editing ?
              <Input
                value={user.default_risk_percent || '1'}
                onChange={async (e) => {
                  await base44.auth.updateMe({ default_risk_percent: e.target.value });
                  await loadUser();
                }}
                placeholder="1"
                className={`${theme.border} h-7 sm:h-8 text-xs`} /> :
              <div className={`text-sm sm:text-base font-bold ${theme.text}`}>{user.default_risk_percent || '1'}%</div>
              }
            </div>
          </div>

          {/* Navigation - Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
            <Button onClick={() => navigate(createPageUrl('Home'))} className={`h-9 md:h-10 text-[10px] sm:text-xs tracking-widest border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <HomeIcon className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">HOME</span>
            </Button>
            <Button onClick={() => navigate(createPageUrl('Dashboard'))} className={`h-9 md:h-10 text-[10px] sm:text-xs tracking-widest border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <BarChart3 className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">STATS</span>
            </Button>
            <Button onClick={() => navigate(createPageUrl('Integrations'))} className={`h-9 md:h-10 text-[10px] sm:text-xs tracking-widest border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <Settings className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">INTEGRATIONS</span>
            </Button>
            <Button onClick={handleLogout} className="h-9 md:h-10 text-[10px] sm:text-xs tracking-widest border-2 bg-rose-600 hover:bg-rose-700 text-white border-rose-600">
              <LogOut className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">LOGOUT</span>
            </Button>
          </div>

          {/* Danger Zone - Ultra Compact */}
          <div className={`border border-rose-600/40 ${darkMode ? 'bg-rose-600/5' : 'bg-rose-50'} rounded-xl p-2.5 sm:p-3 md:p-4`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <div>
                  <div className={`text-[10px] sm:text-xs font-bold ${theme.text} mb-0.5`}>{t('dangerZone')}</div>
                  <p className={`${theme.textSecondary} text-[9px] sm:text-[10px] leading-tight`}>
                    {t('deleteWarning')}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDeleteAccount}
                size="sm"
                className="border border-rose-600 bg-rose-600 text-white hover:bg-rose-700 h-8 px-2 sm:px-3 text-[10px] font-bold flex-shrink-0">
                <Trash2 className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">DELETE</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className={`mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${theme.border}`}>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px]">
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