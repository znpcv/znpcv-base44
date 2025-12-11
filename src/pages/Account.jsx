import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Home, User, Mail, Calendar, LogOut, Edit2, Save, X, Shield, Phone, MapPin, Upload, Camera } from 'lucide-react';
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
  const { darkMode } = useLanguage();
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <DarkModeToggle />
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
                  className="h-10 sm:h-12 w-auto cursor-pointer"
                />
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl tracking-widest mb-8">MEIN ACCOUNT</h1>

          {/* Profile Header */}
          <div className={`border-2 ${theme.border} rounded-2xl p-6 sm:p-8 mb-6 ${theme.bgCard}`}>
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className={`w-12 h-12 ${darkMode ? 'text-black' : 'text-white'}`} />
                  )}
                </div>
                <label className={`absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer`}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  {uploading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </label>
              </div>

              {/* Name & Edit */}
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className={`text-xs tracking-wider ${theme.textSecondary} mb-2`}>VOLLSTÄNDIGER NAME</div>
                    {editing ? (
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`font-bold text-lg ${theme.border} mb-4`}
                        placeholder="Dein Name"
                      />
                    ) : (
                      <div className={`text-2xl font-bold ${theme.text} mb-1`}>{user.full_name || '-'}</div>
                    )}
                    <div className={`text-sm ${theme.textSecondary}`}>{user.email}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {editing ? (
                      <>
                        <Button onClick={handleSave} disabled={saving} className={`${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'SPEICHERN...' : 'SPEICHERN'}
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
                        }} variant="outline" className={`${theme.border}`}>
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

                {/* Bio */}
                {editing && (
                  <div className="mb-4">
                    <div className={`text-xs tracking-wider ${theme.textSecondary} mb-2`}>BIO</div>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Erzähl etwas über dich..."
                      className={`${theme.border} h-20 resize-none`}
                    />
                  </div>
                )}
                {!editing && bio && (
                  <div className="mb-4">
                    <div className={`text-xs tracking-wider ${theme.textSecondary} mb-1`}>BIO</div>
                    <p className={`text-sm ${theme.text}`}>{bio}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 border ${theme.border} rounded-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <Mail className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>E-MAIL</span>
                </div>
                <div className={`text-base ${theme.text} break-all`}>{user.email}</div>
              </div>

              <div className={`p-4 border ${theme.border} rounded-xl sm:col-span-2`}>
                <div className="flex items-center gap-3 mb-2">
                  <Phone className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>TELEFON</span>
                </div>
                {editing ? (
                  <div className="flex gap-2">
                    <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                      <SelectTrigger className={`w-32 ${theme.border}`}>
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
                      className={`flex-1 ${theme.border} h-9`}
                    />
                  </div>
                ) : (
                  <div className={`text-base ${theme.text}`}>
                    {user.phone_country_code && user.phone ? `${user.phone_country_code} ${user.phone}` : '-'}
                  </div>
                )}
              </div>

              <div className={`p-4 border ${theme.border} rounded-xl sm:col-span-2`}>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className={`w-5 h-5 ${theme.textSecondary}`} />
                  <span className={`text-xs tracking-wider ${theme.textSecondary}`}>LAND</span>
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
                <div className={`text-base ${theme.text} font-mono text-xs break-all`}>
                  {user.id.substring(0, 12)}...
                </div>
              </div>
            </div>
          </div>

          {/* Address Section (Optional) */}
          <div className={`border-2 ${theme.border} rounded-2xl p-6 sm:p-8 mb-6 ${theme.bgCard}`}>
            <h3 className={`text-xl tracking-widest mb-4 ${theme.text} flex items-center gap-2`}>
              <MapPin className="w-5 h-5" />
              ADRESSE (OPTIONAL)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`sm:col-span-2`}>
                <label className={`block text-xs tracking-wider ${theme.textSecondary} mb-2`}>
                  STRASSE & HAUSNUMMER
                </label>
                {editing ? (
                  <Input
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="Musterstraße 123"
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
                  POSTLEITZAHL
                </label>
                {editing ? (
                  <Input
                    value={addressPostalCode}
                    onChange={(e) => setAddressPostalCode(e.target.value)}
                    placeholder="12345"
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
                  STADT
                </label>
                {editing ? (
                  <Input
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="Berlin"
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
                  LAND DER ADRESSE
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Button 
              onClick={() => navigate(createPageUrl('Home'))} 
              variant="outline" 
              className={`h-12 sm:h-14 text-sm sm:text-base tracking-widest ${theme.border}`}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">HOME</span>
            </Button>
            <Button 
              onClick={() => navigate(createPageUrl('Dashboard'))} 
              variant="outline" 
              className={`h-12 sm:h-14 text-sm sm:text-base tracking-widest ${theme.border}`}
            >
              DASHBOARD
            </Button>
            <Button 
              onClick={handleLogout} 
              className={`h-12 sm:h-14 text-sm sm:text-base tracking-widest bg-rose-600 hover:bg-rose-700 text-white`}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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