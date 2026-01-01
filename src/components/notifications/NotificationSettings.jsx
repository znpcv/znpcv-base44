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
    <div className="space-y-3">
      {/* Master Toggle - Compact */}
      <div className={`flex items-center justify-between p-3 rounded-lg border ${theme.border} ${darkMode ? 'bg-zinc-900/50' : 'bg-white'}`}>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">💭</span>
          <div className="flex-1 min-w-0">
            <div className={`text-xs sm:text-sm font-bold ${theme.text}`}>Tägliche Sprüche</div>
            <div className={`text-[10px] sm:text-xs ${theme.textSecondary} font-sans`}>Push-Mitteilung aufs Handy</div>
          </div>
        </div>
        <Switch
          checked={settings.browser_notifications_enabled}
          onCheckedChange={(checked) => updateSetting('browser_notifications_enabled', checked)}
        />
      </div>

      {settings.browser_notifications_enabled && (
        <>
          {/* Frequency - Compact */}
          <div className={`p-3 rounded-lg border ${theme.border} ${darkMode ? 'bg-zinc-900/50' : 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`w-3.5 h-3.5 ${theme.textSecondary}`} />
              <span className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary}`}>HÄUFIGKEIT</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['1', '2', '3', '4'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => updateSetting('notification_frequency', freq)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    settings.notification_frequency === freq
                      ? darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'
                      : darkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                  }`}
                >
                  {freq}x
                </button>
              ))}
            </div>
          </div>

          {/* Snooze Duration - Compact */}
          <div className={`p-3 rounded-lg border ${theme.border} ${darkMode ? 'bg-zinc-900/50' : 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-2">
              <VolumeX className={`w-3.5 h-3.5 ${theme.textSecondary}`} />
              <span className={`text-[10px] sm:text-xs tracking-wider ${theme.textSecondary}`}>SNOOZE</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 60, 120].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => updateSetting('notification_snooze_duration', minutes)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    settings.notification_snooze_duration === minutes
                      ? darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'
                      : darkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                  }`}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>
          )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className={`w-full h-9 sm:h-10 rounded-xl font-bold text-xs sm:text-sm tracking-wider transition-all border-2 ${
          darkMode
            ? 'bg-white text-black hover:bg-zinc-200 border-white'
            : 'bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900'
        } disabled:opacity-50`}
      >
        {saving ? 'Speichert...' : 'Speichern'}
      </Button>
    </div>
  );
}