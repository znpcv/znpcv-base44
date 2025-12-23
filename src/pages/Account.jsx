import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Home, User, Mail, Calendar, LogOut, Edit2, Save, X, Shield, Phone, MapPin, Upload, Camera, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';
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
      navigate(createPageUrl('Home'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
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
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCountryChange = (countryCode) => {
    setCountry(countryCode);
    const selectedCountry = COUNTRIES.find(c => c.code === countryCode);
    if (selectedCountry && !phoneCountryCode) {
      setPhoneCountryCode(selectedCountry.dial);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_image: file_url });
      await loadUser();
    } catch (err) {
      console.error(err);
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
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-4xl mx-auto px-2 sm:px-3 md:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <DarkModeToggle />
            </div>
            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img 
                src={darkMode 
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV" 
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 sm:px-3 md:px-6 py-4 sm:py-6 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-widest mb-4 sm:mb-6 md:mb-8">{t('account')}</h1>

          {/* Profile Header */}
          <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6 ${theme.bgCard}`}>
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
              {/* Profile Image */}
              <div className="relative group mx-auto sm:mx-0">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className={`w-10 h-10 sm:w-12 sm:h-12 ${darkMode ? 'text-black' : 'text-white'}`} />
                  )}
                </div>
                <label className={`absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer`}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  {uploading ? (
                    <div className="animate-spin w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </label>
              </div>

              {/* Name & Edit */}
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary} mb-1 sm:mb-2`}>{t('name')}</div>
                    {editing ? (
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`font-bold text-sm sm:text-base md:text-lg ${theme.border} mb-2 sm:mb-4 h-9 sm:h-10`}
                        placeholder={t('yourName')}
                      />
                    ) : (
                      <div className={`text-lg sm:text-xl md:text-2xl font-bold ${theme.text} mb-1 truncate`}>{user.full_name || '-'}</div>
                    )}
                    <div className={`text-xs sm:text-sm ${theme.textSecondary} truncate`}>{user.email}</div>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    {editing ? (
                      <>
                        <Button onClick={handleSave} disabled={saving} className={`h-8 sm:h-9 md:h-10 text-xs sm:text-sm font-bold border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                          <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                          <span className="hidden sm:inline">{saving ? `${t('save')}...` : t('save')}</span>
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
                        }} variant="outline" className={`h-8 sm:h-9 md:h-10 border-2 ${theme.border}`}>
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditing(true)} className={`h-8 sm:h-9 md:h-10 text-xs sm:text-sm font-bold border-2 ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                        <span className="hidden sm:inline">{t('edit')}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {editing && (
                  <div className="mb-3 sm:mb-4">
                    <div className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary} mb-1.5 sm:mb-2`}>{t('bio')}</div>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t('bioPlaceholder')}
                      className={`${theme.border} h-16 sm:h-20 resize-none text-xs sm:text-sm`}
                    />
                  </div>
                )}
                {!editing && bio && (
                  <div className="mb-3 sm:mb-4">
                    <div className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary} mb-1`}>{t('bio')}</div>
                    <p className={`text-xs sm:text-sm ${theme.text}`}>{bio}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className={`p-3 sm:p-4 border ${theme.border} rounded-lg sm:rounded-xl`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.textSecondary}`} />
                  <span className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary}`}>{t('myAccount')}</span>
                </div>
                <div className={`text-xs sm:text-sm md:text-base ${theme.text} break-all`}>{user.email}</div>
              </div>

              <div className={`p-3 sm:p-4 border ${theme.border} rounded-lg sm:rounded-xl sm:col-span-2`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <Phone className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.textSecondary}`} />
                  <span className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary}`}>{t('phone')}</span>
                </div>
                {editing ? (
                  <div className="flex gap-2">
                    <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                      <SelectTrigger className={`w-24 sm:w-32 ${theme.border} h-9 sm:h-10 text-xs sm:text-sm`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.dial} value={c.dial}>
                            {c.dial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123456789"
                      className={`flex-1 ${theme.border} h-9 sm:h-10 text-xs sm:text-sm`}
                    />
                  </div>
                ) : (
                  <div className={`text-xs sm:text-sm md:text-base ${theme.text}`}>
                    {user.phone_country_code && user.phone ? `${user.phone_country_code} ${user.phone}` : '-'}
                  </div>
                )}
              </div>

              <div className={`p-4 border ${theme.border} rounded-xl sm:col-span-2`}>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>{t('country')}</span>
                </div>
                {editing ? (
                  <CountrySelect
                    value={country}
                    onChange={handleCountryChange}
                    className={`${theme.border}`}
                  />
                ) : (
                  <div className={`text-base ${theme.text}`}>
                    {COUNTRIES.find(c => c.code === user.country)?.name || '-'}
                  </div>
                )}
              </div>

              <div className={`p-4 border ${theme.border} rounded-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>{t('role')}</span>
                </div>
                <div className={`text-base ${theme.text} uppercase`}>{user.role}</div>
              </div>

              <div className={`p-4 border ${theme.border} rounded-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>{t('registeredSince')}</span>
                </div>
                <div className={`text-base ${theme.text}`}>
                  {format(new Date(user.created_date), 'dd.MM.yyyy')}
                </div>
              </div>

              <div className={`p-4 border ${theme.border} rounded-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <User className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>{t('userId')}</span>
                </div>
                <div className={`text-base ${theme.text} font-mono text-xs break-all`}>
                  {user.id.substring(0, 12)}...
                </div>
              </div>
            </div>
          </div>

          {/* Address Section (Optional) */}
          <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6 ${theme.bgCard}`}>
            <h3 className={`text-sm sm:text-base md:text-lg lg:text-xl tracking-widest mb-3 sm:mb-4 ${theme.text} flex items-center gap-1.5 sm:gap-2`}>
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('address')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`sm:col-span-2`}>
                <label className={`block text-xs tracking-wider ${theme.textSecondary} mb-2`}>
                  {t('street')}
                </label>
                {editing ? (
                  <Input
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder={t('street')}
                    className={`${theme.border}`}
                  />
                ) : (
                  <div className={`text-base ${theme.text} p-3 border ${theme.border} rounded-lg`}>
                    {user.address_street || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-xs tracking-wider ${theme.textSecondary} mb-2`}>
                  {t('postalCode')}
                </label>
                {editing ? (
                  <Input
                    value={addressPostalCode}
                    onChange={(e) => setAddressPostalCode(e.target.value)}
                    placeholder={t('postalCode')}
                    className={`${theme.border}`}
                  />
                ) : (
                  <div className={`text-base ${theme.text} p-3 border ${theme.border} rounded-lg`}>
                    {user.address_postal_code || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-xs tracking-wider ${theme.textSecondary} mb-2`}>
                  {t('city')}
                </label>
                {editing ? (
                  <Input
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder={t('city')}
                    className={`${theme.border}`}
                  />
                ) : (
                  <div className={`text-base ${theme.text} p-3 border ${theme.border} rounded-lg`}>
                    {user.address_city || '-'}
                  </div>
                )}
              </div>

              <div className={`sm:col-span-2`}>
                <label className={`block text-xs tracking-wider ${theme.textSecondary} mb-2`}>
                  {t('addressCountry')}
                </label>
                {editing ? (
                  <CountrySelect
                    value={addressCountry}
                    onChange={setAddressCountry}
                    className={`${theme.border}`}
                  />
                ) : (
                  <div className={`text-base ${theme.text} p-3 border ${theme.border} rounded-lg`}>
                    {COUNTRIES.find(c => c.code === user.address_country)?.name || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <Button 
              onClick={() => navigate(createPageUrl('Home'))} 
              variant="outline" 
              className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base tracking-widest border-2 ${theme.border}`}
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2" />
              <span>{t('home')}</span>
            </Button>
            <Button 
              onClick={() => navigate(createPageUrl('Dashboard'))} 
              variant="outline" 
              className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base tracking-widest border-2 ${theme.border}`}
            >
              {t('dashboard')}
            </Button>
            <Button 
              onClick={() => navigate(createPageUrl('Integrations'))} 
              variant="outline" 
              className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base tracking-widest border-2 ${theme.border} col-span-2 sm:col-span-1`}
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2" />
              INTEGRATIONS
            </Button>
            <Button 
              onClick={handleLogout} 
              className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base tracking-widest border-2 bg-rose-600 hover:bg-rose-700 text-white border-rose-600 col-span-2 sm:col-span-1`}
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">{t('logout')}</span>
              <span className="xs:hidden">{t('out')}</span>
            </Button>
          </div>

          {/* Delete Account */}
          <div className={`border-2 border-rose-600/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 bg-rose-600/5`}>
            <h3 className="text-rose-600 text-sm sm:text-base md:text-lg tracking-widest mb-2 sm:mb-3 font-bold">{t('dangerZone')}</h3>
            <p className={`${theme.textSecondary} text-xs sm:text-sm mb-3 sm:mb-4 font-sans`}>
              {t('deleteWarning')}
            </p>
            <Button 
              onClick={handleDeleteAccount}
              className="border-2 border-rose-600 bg-rose-600 text-white hover:bg-rose-700 h-9 sm:h-10 md:h-11 text-xs sm:text-sm font-bold"
            >
              {t('deletePermanently')}
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className={`mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t ${theme.border}`}>
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