import React, { useState, useEffect } from 'react';
import { Bell, Clock, Volume2, VolumeX } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NotificationSettings({ darkMode }) {
  const [settings, setSettings] = useState({
    browser_notifications_enabled: false,
    notification_frequency: '1',
    notification_settings: {
      daily_quote: true,
      trade_alerts: true,
      performance_summary: true,
      system: true
    },
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
        notification_settings: user.notification_settings || {
          daily_quote: true,
          trade_alerts: true,
          performance_summary: true,
          system: true
        },
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

  const updateNotificationType = (type, enabled) => {
    setSettings(prev => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        [type]: enabled
      }
    }));
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
    <div className={`${theme.bg} rounded-xl p-4 sm:p-6 border ${theme.border} space-y-4 sm:space-y-6`}>
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-teal-600" />
        <h3 className={`text-lg font-bold tracking-wider ${theme.text}`}>BENACHRICHTIGUNGEN</h3>
      </div>

      {/* Master Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className={`${theme.text} text-sm font-bold tracking-wider`}>Push-Benachrichtigungen</Label>
          <p className={`${theme.textSecondary} text-xs font-sans`}>Aktiviere Browser-Benachrichtigungen</p>
        </div>
        <Switch
          checked={settings.browser_notifications_enabled}
          onCheckedChange={(checked) => updateSetting('browser_notifications_enabled', checked)}
        />
      </div>

      {settings.browser_notifications_enabled && (
        <>
          {/* Notification Types */}
          <div className="space-y-3">
            <h4 className={`${theme.text} text-sm font-bold tracking-wider`}>EREIGNISTYPEN</h4>
            
            <div className="space-y-2">
              <NotificationType
                icon="💭"
                label="Trading Quotes"
                description="Tägliche motivierende Zitate"
                enabled={settings.notification_settings.daily_quote}
                onChange={(checked) => updateNotificationType('daily_quote', checked)}
                darkMode={darkMode}
              />
              
              <NotificationType
                icon="📊"
                label="Trade Alerts"
                description="Wichtige Handelssignale"
                enabled={settings.notification_settings.trade_alerts}
                onChange={(checked) => updateNotificationType('trade_alerts', checked)}
                darkMode={darkMode}
              />
              
              <NotificationType
                icon="📈"
                label="Performance Summaries"
                description="Wöchentliche Zusammenfassungen"
                enabled={settings.notification_settings.performance_summary}
                onChange={(checked) => updateNotificationType('performance_summary', checked)}
                darkMode={darkMode}
              />
              
              <NotificationType
                icon="⚙️"
                label="System-Benachrichtigungen"
                description="Updates und wichtige Infos"
                enabled={settings.notification_settings.system}
                onChange={(checked) => updateNotificationType('system', checked)}
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <Label className={`${theme.text} text-sm font-bold tracking-wider block mb-2`}>
              HÄUFIGKEIT PRO TAG
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '2', '3', '4'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => updateSetting('notification_frequency', freq)}
                  className={`p-3 rounded-lg border-2 transition-all font-bold ${
                    settings.notification_frequency === freq
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : `${theme.border} ${theme.text} hover:border-teal-600/50`
                  }`}
                >
                  {freq}x
                </button>
              ))}
            </div>
          </div>

          {/* Snooze Duration */}
          <div>
            <Label className={`${theme.text} text-sm font-bold tracking-wider flex items-center gap-2 mb-2`}>
              <Clock className="w-4 h-4" />
              SNOOZE-DAUER (MINUTEN)
            </Label>
            <Input
              type="number"
              min="5"
              max="120"
              step="5"
              value={settings.notification_snooze_duration}
              onChange={(e) => updateSetting('notification_snooze_duration', parseInt(e.target.value) || 30)}
              className={`${darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black'}`}
            />
            <p className={`${theme.textSecondary} text-xs font-sans mt-1`}>
              Benachrichtigungen werden für diese Dauer pausiert
            </p>
          </div>
        </>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        {saving ? 'Speichert...' : 'Einstellungen speichern'}
      </Button>
    </div>
  );
}

function NotificationType({ icon, label, description, enabled, onChange, darkMode }) {
  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600'
  };

  return (
    <div className={`${theme.bg} border ${theme.border} rounded-lg p-3 flex items-center justify-between`}>
      <div className="flex items-center gap-3 flex-1">
        <span className="text-xl">{icon}</span>
        <div>
          <div className={`${theme.text} text-sm font-bold tracking-wider`}>{label}</div>
          <div className={`${theme.textSecondary} text-xs font-sans`}>{description}</div>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}