import React, { useState, useEffect } from 'react';
import { Bell, Clock, VolumeX } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NotificationSettings({ darkMode }) {
  const [settings, setSettings] = useState({
    browser_notifications_enabled: false,
    notification_frequency: '1',
    notification_snooze_duration: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = await base44.auth.me();
      setSettings({
        browser_notifications_enabled: user.browser_notifications_enabled || false,
        notification_frequency: user.notification_frequency || '1',
        notification_snooze_duration: user.notification_snooze_duration || 30
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await base44.auth.updateMe(settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const theme = {
    bg: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600'
  };

  if (loading) {
    return (
      <div className={`${theme.bg} rounded-xl p-6 border ${theme.border}`}>
        <div className="animate-pulse">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Master Toggle - Prominent */}
      <div className={`p-5 sm:p-6 rounded-xl border-2 transition-all ${settings.browser_notifications_enabled ? 
        darkMode ? 'border-emerald-600 bg-emerald-700/20' : 'border-teal-500 bg-teal-500/20' : 
        darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-300 bg-zinc-100'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all ${
              settings.browser_notifications_enabled ? 
              darkMode ? 'bg-emerald-700' : 'bg-teal-500' : 
              darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`}>
              <span className={`text-3xl ${settings.browser_notifications_enabled ? '' : 'opacity-50'}`}>💭</span>
            </div>
            <div className="flex-1 min-w-0">
              <Label className={`text-base sm:text-lg font-bold tracking-wider cursor-pointer ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                Tägliche Trading-Sprüche
              </Label>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'} font-sans`}>
                Erhalte motivierende Sprüche als Push-Mitteilung aufs Handy
              </p>
            </div>
          </div>
          <Switch
            checked={settings.browser_notifications_enabled}
            onCheckedChange={(checked) => updateSetting('browser_notifications_enabled', checked)}
            className="scale-125"
          />
        </div>
      </div>

      {settings.browser_notifications_enabled && (
        <>
          {/* Frequency - Enhanced */}
          <div className={`p-5 sm:p-6 rounded-xl border-2 ${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-300 bg-zinc-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className={`w-5 h-5 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`} />
              <Label className={`${theme.text} text-base sm:text-lg font-bold tracking-wider`}>
                HÄUFIGKEIT PRO TAG
              </Label>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {['1', '2', '3', '4'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => updateSetting('notification_frequency', freq)}
                  className={`p-4 sm:p-5 rounded-xl border-2 transition-all font-bold text-lg sm:text-xl ${
                    settings.notification_frequency === freq
                      ? darkMode ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-teal-500 border-teal-500 text-white'
                      : `${theme.border} ${theme.text} hover:border-emerald-600/50`
                  }`}
                >
                  {freq}x
                </button>
              ))}
            </div>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-600'} mt-3 font-sans`}>
              Lege fest, wie oft du täglich Benachrichtigungen erhalten möchtest
            </p>
          </div>

          {/* Snooze Duration - Enhanced */}
          <div className={`p-5 sm:p-6 rounded-xl border-2 ${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-300 bg-zinc-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <VolumeX className={`w-5 h-5 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`} />
              <Label className={`${theme.text} text-base sm:text-lg font-bold tracking-wider`}>
                SNOOZE-DAUER
              </Label>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Input
                type="number"
                min="5"
                max="120"
                step="5"
                value={settings.notification_snooze_duration}
                onChange={(e) => updateSetting('notification_snooze_duration', parseInt(e.target.value) || 30)}
                className={`flex-1 p-3 sm:p-4 rounded-xl border-2 font-bold text-lg sm:text-xl text-center ${darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black'}`}
              />
              <span className={`text-base sm:text-lg font-bold ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Min</span>
            </div>
            <div className="flex gap-2">
              {[15, 30, 60, 120].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => updateSetting('notification_snooze_duration', minutes)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    settings.notification_snooze_duration === minutes
                      ? darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'
                      : darkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                  }`}
                >
                  {minutes}m
                </button>
              ))}
            </div>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-600'} mt-3 font-sans`}>
              Wie lange sollen Benachrichtigungen pausiert werden?
            </p>
          </div>
        </>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg tracking-wider transition-all border-2 ${
          darkMode
            ? 'bg-white text-black hover:bg-zinc-200 border-white'
            : 'bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900'
        } disabled:opacity-50`}
      >
        {saving ? '⏳ Speichern...' : '💾 Einstellungen speichern'}
      </Button>
    </div>
  );
}