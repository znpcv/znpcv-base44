import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Home, Bell, Webhook, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle, LanguageToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';
import { toast } from 'sonner';

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const { t, darkMode } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const [settings, setSettings] = useState({
    telegram_chat_id: '',
    whatsapp_phone: '',
    webhook_secret: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setSettings({
        telegram_chat_id: userData.telegram_chat_id || '',
        whatsapp_phone: userData.whatsapp_phone || '',
        webhook_secret: userData.webhook_secret || generateSecret()
      });
      
      const baseUrl = window.location.origin;
      setWebhookUrl(`${baseUrl}/api/functions/tradingViewWebhook?secret=${userData.webhook_secret || generateSecret()}&user=${userData.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const handleSave = async () => {
    try {
      await base44.auth.updateMe(settings);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('Webhook URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const testAlert = async (type) => {
    try {
      await base44.functions.invoke(`send${type}Alert`, {
        message: 'Test alert from ZNPCV!',
        trade: { pair: 'EUR/USD', direction: 'long', completion_percentage: 90 }
      });
      toast.success(`${type} alert sent!`);
    } catch (err) {
      toast.error(`Failed to send ${type} alert`);
    }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
  };

  if (loading) return <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}><div className="text-teal-600">Loading...</div></div>;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button onClick={() => navigate(createPageUrl('Home'))} className={`${theme.textSecondary} hover:${theme.text} p-2`}>
                <Home className="w-5 h-5" />
              </button>
            </div>
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              } alt="ZNPCV" className="h-10 w-auto" />
            </button>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl tracking-wider mb-2">INTEGRATIONS</h1>
          <p className={`${theme.textSecondary} text-sm mb-8`}>Connect ZNPCV with your trading tools</p>

          {/* Alerts Section */}
          <div className={`border-2 ${theme.border} rounded-2xl p-6 mb-6 ${theme.bgSecondary}`}>
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl tracking-wider">ALERTS</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-sm mb-2 block ${theme.textSecondary}`}>Telegram Chat ID</label>
                <div className="flex gap-2">
                  <Input value={settings.telegram_chat_id} onChange={(e) => setSettings({...settings, telegram_chat_id: e.target.value})} placeholder="123456789" className={darkMode ? 'bg-zinc-900 border-zinc-800' : ''} />
                  <Button onClick={() => testAlert('Telegram')} variant="outline">Test</Button>
                </div>
                <p className={`text-xs mt-1 ${theme.textSecondary}`}>Get your chat ID from @userinfobot</p>
              </div>

              <div>
                <label className={`text-sm mb-2 block ${theme.textSecondary}`}>WhatsApp Phone</label>
                <div className="flex gap-2">
                  <Input value={settings.whatsapp_phone} onChange={(e) => setSettings({...settings, whatsapp_phone: e.target.value})} placeholder="+1234567890" className={darkMode ? 'bg-zinc-900 border-zinc-800' : ''} />
                  <Button onClick={() => testAlert('WhatsApp')} variant="outline">Test</Button>
                </div>
                <p className={`text-xs mt-1 ${theme.textSecondary}`}>WhatsApp requires Twilio setup</p>
              </div>
            </div>
          </div>

          {/* Webhook Section */}
          <div className={`border-2 ${theme.border} rounded-2xl p-6 mb-6 ${theme.bgSecondary}`}>
            <div className="flex items-center gap-3 mb-6">
              <Webhook className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl tracking-wider">WEBHOOK</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-sm mb-2 block ${theme.textSecondary}`}>TradingView / MetaTrader Webhook URL</label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : ''} font-mono text-xs`} />
                  <Button onClick={copyWebhookUrl} variant="outline">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className={`text-xs mt-2 ${theme.textSecondary}`}>Use this URL in your TradingView alerts or MetaTrader webhooks</p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl">
            SAVE SETTINGS
          </Button>
        </motion.div>
      </main>
    </div>
  );
}