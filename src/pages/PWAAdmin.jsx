import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Smartphone, Bell, UserCheck, UserX, RefreshCw, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';
import AdminGuard from '@/components/AdminGuard';

function PWAAdminContent() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const u = await base44.auth.me();
      if (u.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(u);
      await loadStats();
    } catch {
      navigate(createPageUrl('Home'));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Count push subscriptions
      const allSubs = await base44.asServiceRole.entities.PushSubscription.list('-created_date', 1000);
      const activeSubs = allSubs.filter(s => s.active !== false);

      // Count users with push enabled
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
      const pushEnabled = allUsers.filter(u => u.browser_notifications_enabled);
      const totalUsers = allUsers.length;

      // Topics breakdown
      const topicCounts = { setup_alerts: 0, reminders: 0, product_updates: 0 };
      allUsers.forEach(u => {
        if (u.push_topics && Array.isArray(u.push_topics)) {
          u.push_topics.forEach(t => {
            if (topicCounts[t] !== undefined) topicCounts[t]++;
          });
        }
      });

      // Notifications sent
      const allNotifs = await base44.asServiceRole.entities.Notification.list('-created_date', 1000);

      setStats({
        totalUsers,
        pushEnabled: pushEnabled.length,
        activeSubs: activeSubs.length,
        totalSubs: allSubs.length,
        notificationsSent: allNotifs.length,
        unreadNotifs: allNotifs.filter(n => !n.read).length,
        topicCounts,
        pushRate: totalUsers > 0 ? ((pushEnabled.length / totalUsers) * 100).toFixed(1) : '0',
      });
    } catch (err) {
      console.error('Stats load error:', err);
    }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`w-10 h-10 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full animate-spin`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50 px-4 py-3`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(createPageUrl('Home'))} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-sm font-bold tracking-widest">PUSH & ANALYTICS</div>
              <div className={`text-[10px] ${theme.textMuted}`}>Admin</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadStats} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Entitlement Admin Link */}
      <button
        onClick={() => navigate(createPageUrl('EntitlementAdmin'))}
        className={cn('w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all hover:border-emerald-600/50', theme.bgCard, theme.border)}
      >
        <CreditCard className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <div className={`text-sm font-bold tracking-widest ${theme.text}`}>ZUGÄNGE & ZAHLUNGEN</div>
          <div className={`text-xs font-sans ${theme.textMuted}`}>Lizenzen · Zahlungen · Protokoll</div>
        </div>
      </button>

      {stats ? (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Gesamt-Nutzer', value: stats.totalUsers, icon: UserCheck, color: 'text-blue-500' },
                { label: 'Push Opt-in', value: stats.pushEnabled, icon: Bell, color: 'text-emerald-600' },
                { label: 'Opt-in Rate', value: `${stats.pushRate}%`, icon: TrendingUp, color: 'text-teal-500' },
                { label: 'Aktive Subs', value: stats.activeSubs, icon: Smartphone, color: 'text-purple-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={cn('p-4 rounded-xl border-2', theme.bgCard, theme.border)}>
                  <Icon className={`w-5 h-5 ${color} mb-2`} />
                  <div className={`text-2xl font-bold ${theme.text}`}>{value}</div>
                  <div className={`text-[10px] tracking-wider ${theme.textMuted} mt-0.5`}>{label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Notification Stats */}
            <div className={cn('p-4 rounded-xl border-2', theme.bgCard, theme.border)}>
              <div className={`text-xs font-bold tracking-widest mb-3 ${theme.text}`}>BENACHRICHTIGUNGEN</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Gesendet (gesamt)', value: stats.notificationsSent },
                  { label: 'Ungelesen', value: stats.unreadNotifs },
                  { label: 'Subscriptions (DB)', value: stats.totalSubs },
                  { label: 'Aktive Subscriptions', value: stats.activeSubs },
                ].map(({ label, value }) => (
                  <div key={label} className={cn('p-3 rounded-lg border', theme.border, darkMode ? 'bg-zinc-950' : 'bg-white')}>
                    <div className={`text-xl font-bold ${theme.text}`}>{value}</div>
                    <div className={`text-[10px] ${theme.textMuted}`}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics Breakdown */}
            <div className={cn('p-4 rounded-xl border-2', theme.bgCard, theme.border)}>
              <div className={`text-xs font-bold tracking-widest mb-3 ${theme.text}`}>PUSH THEMEN (OPT-INS)</div>
              <div className="space-y-2">
                {[
                  { key: 'setup_alerts', label: 'Setup Alerts', icon: '📊' },
                  { key: 'reminders', label: 'Checkliste Reminder', icon: '⏰' },
                  { key: 'product_updates', label: 'Produkt Updates', icon: '🚀' },
                ].map(({ key, label, icon }) => {
                  const count = stats.topicCounts[key] || 0;
                  const pct = stats.pushEnabled > 0 ? Math.round((count / stats.pushEnabled) * 100) : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-lg">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${theme.text}`}>{label}</span>
                          <span className={`text-xs font-mono ${theme.textSecondary}`}>{count} ({pct}%)</span>
                        </div>
                        <div className={`h-1.5 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracked Events Info */}
            <div className={cn('p-4 rounded-xl border-2', theme.bgCard, theme.border)}>
              <div className={`text-xs font-bold tracking-widest mb-3 ${theme.text}`}>TRACKED EVENTS (ANALYTICS)</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'pwa_eligible_shown',
                  'pwa_install_clicked',
                  'pwa_installed',
                  'push_pre_prompt_shown',
                  'push_permission_granted',
                  'push_permission_denied',
                  'push_topic_selected',
                  'push_unsubscribed',
                ].map(event => (
                  <div key={event} className={cn('px-2.5 py-1.5 rounded-lg border text-[10px] font-mono', theme.border, darkMode ? 'bg-zinc-950 text-zinc-400' : 'bg-white text-zinc-600')}>
                    {event}
                  </div>
                ))}
              </div>
              <p className={`text-[10px] font-sans mt-3 ${theme.textMuted}`}>
                Events werden via base44.analytics.track() protokolliert. Auswertung im Base44 Analytics Dashboard.
              </p>
            </div>
          </>
        ) : (
          <div className={`text-center py-12 ${theme.textMuted}`}>Lade Statistiken…</div>
        )}
      </main>
    </div>
  );
}

export default function PWAAdminPage() {
  return (
    <AdminGuard>
      <PWAAdminContent />
    </AdminGuard>
  );
}