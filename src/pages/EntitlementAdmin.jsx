/**
 * EntitlementAdmin — Admin page to manage user entitlements.
 * Grant, revoke, view billing events and audit logs.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, UserX, RefreshCw, Search, Plus, Shield, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';
import AdminGuard from '@/components/AdminGuard';

const STATUS_COLORS = {
  active: 'text-emerald-600',
  pending: 'text-yellow-500',
  revoked: 'text-red-500',
  refunded: 'text-orange-500',
  suspended: 'text-zinc-400',
  cancelled: 'text-zinc-400',
};

const STATUS_ICONS = {
  active: CheckCircle2,
  pending: Clock,
  revoked: UserX,
  refunded: AlertCircle,
};

function EntitlementAdminContent() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [entitlements, setEntitlements] = useState([]);
  const [billingEvents, setBillingEvents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('entitlements');
  const [search, setSearch] = useState('');
  const [grantEmail, setGrantEmail] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantError, setGrantError] = useState(null);
  const [revokeId, setRevokeId] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ents, bills, audits] = await Promise.all([
        base44.entities.UserEntitlement.list('-created_date', 200),
        base44.entities.BillingEvent.list('-created_date', 200),
        base44.entities.AccessAuditLog.list('-created_date', 100),
      ]);
      setEntitlements(ents);
      setBillingEvents(bills);
      setAuditLogs(audits);
    } catch (err) {
      console.error('[EntitlementAdmin] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualGrant = async () => {
    if (!grantEmail.trim()) return;
    setGrantLoading(true);
    setGrantError(null);
    try {
      const me = await base44.auth.me();
      const ent = await base44.entities.UserEntitlement.create({
        user_email: grantEmail.trim().toLowerCase(),
        entitlement_key: 'full_app_access',
        status: 'active',
        granted_at: new Date().toISOString(),
        source: 'manual_admin',
        notes: `Manually granted by admin ${me.email}`
      });
      await base44.entities.AccessAuditLog.create({
        user_email: grantEmail.trim().toLowerCase(),
        action: 'manual_grant',
        actor_type: 'admin',
        actor_id: me.email,
        entitlement_id: ent.id,
        reason: 'Manual grant by admin'
      }).catch(() => {});
      setGrantEmail('');
      await loadAll();
    } catch (err) {
      setGrantError(err.message);
    } finally {
      setGrantLoading(false);
    }
  };

  const handleRevoke = async (ent) => {
    if (!window.confirm(`Entitlement für ${ent.user_email} wirklich widerrufen?`)) return;
    setRevokeId(ent.id);
    try {
      const me = await base44.auth.me();
      await base44.entities.UserEntitlement.update(ent.id, {
        status: 'revoked',
        revoked_at: new Date().toISOString()
      });
      await base44.entities.AccessAuditLog.create({
        user_email: ent.user_email,
        action: 'entitlement_revoked',
        actor_type: 'admin',
        actor_id: me.email,
        entitlement_id: ent.id,
        reason: 'Manual revoke by admin'
      }).catch(() => {});
      await loadAll();
    } catch (err) {
      alert('Fehler beim Widerrufen: ' + err.message);
    } finally {
      setRevokeId(null);
    }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const filteredEntitlements = entitlements.filter(e =>
    !search || e.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: entitlements.length,
    active: entitlements.filter(e => e.status === 'active').length,
    revenue: billingEvents.filter(e => e.payment_status === 'succeeded').reduce((sum, e) => sum + (e.amount || 0), 0),
    payments: billingEvents.filter(e => e.payment_status === 'succeeded').length,
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50 px-4 py-3`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button onClick={() => navigate(createPageUrl('PWAAdmin'))} className={cn('p-2 rounded-lg', darkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500')}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold tracking-widest">ENTITLEMENT ADMIN</div>
            <div className={`text-[10px] ${theme.textMuted}`}>Billing & Access Control</div>
          </div>
          <button onClick={loadAll} className={cn('p-2 rounded-lg', darkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500')}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Aktive Lizenzen', value: stats.active, color: 'text-emerald-600' },
            { label: 'Gesamt Entitlements', value: stats.total, color: theme.text },
            { label: 'Erfolgreiche Zahlungen', value: stats.payments, color: 'text-blue-500' },
            { label: 'Umsatz (Test)', value: `${(stats.revenue / 100).toFixed(2)} €`, color: 'text-purple-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className={cn('p-4 rounded-xl border-2', theme.bgCard, theme.border)}>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className={`text-[10px] tracking-wider mt-0.5 ${theme.textMuted}`}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Manual Grant */}
        <div className={cn('p-4 rounded-xl border-2', theme.bgCard, theme.border)}>
          <div className={`text-xs font-bold tracking-widest mb-3 ${theme.text}`}>MANUELL GEWÄHREN</div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="user@example.com"
              value={grantEmail}
              onChange={e => setGrantEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualGrant()}
              className={cn('flex-1 px-3 py-2 rounded-lg border text-sm font-sans', theme.border, darkMode ? 'bg-zinc-800 text-white placeholder-zinc-500' : 'bg-white text-zinc-900 placeholder-zinc-400')}
            />
            <button
              onClick={handleManualGrant}
              disabled={grantLoading || !grantEmail.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold tracking-widest disabled:opacity-50"
            >
              {grantLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              GRANT
            </button>
          </div>
          {grantError && <p className="text-red-500 text-xs mt-2 font-sans">{grantError}</p>}
        </div>

        {/* Tabs */}
        <div className={cn('flex gap-1 p-1 rounded-xl border', theme.border, theme.bgCard)}>
          {[
            { key: 'entitlements', label: `ENTITLEMENTS (${entitlements.length})` },
            { key: 'billing', label: `BILLING (${billingEvents.length})` },
            { key: 'audit', label: `AUDIT LOG (${auditLogs.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn('flex-1 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-all',
                activeTab === key
                  ? darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'
                  : theme.textMuted
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search (entitlements tab) */}
        {activeTab === 'entitlements' && (
          <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border', theme.border, theme.bgCard)}>
            <Search className={`w-4 h-4 ${theme.textMuted}`} />
            <input
              type="text"
              placeholder="Nach E-Mail suchen…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`flex-1 bg-transparent text-sm font-sans outline-none ${theme.text} placeholder:${theme.textMuted}`}
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-white' : 'border-zinc-900'}`} />
          </div>
        ) : (
          <>
            {/* Entitlements Tab */}
            {activeTab === 'entitlements' && (
              <div className="space-y-2">
                {filteredEntitlements.length === 0 && (
                  <div className={`text-center py-8 ${theme.textMuted} text-sm`}>Keine Einträge gefunden.</div>
                )}
                {filteredEntitlements.map(ent => {
                  const StatusIcon = STATUS_ICONS[ent.status] || Shield;
                  return (
                    <div key={ent.id} className={cn('flex items-center gap-3 p-3 rounded-xl border', theme.bgCard, theme.border)}>
                      <StatusIcon className={`w-4 h-4 flex-shrink-0 ${STATUS_COLORS[ent.status] || theme.textMuted}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold truncate ${theme.text}`}>{ent.user_email}</div>
                        <div className={`text-[10px] ${theme.textMuted}`}>
                          {ent.entitlement_key} · {ent.source} · {ent.granted_at ? new Date(ent.granted_at).toLocaleDateString('de-DE') : '—'}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} ${STATUS_COLORS[ent.status]}`}>
                        {ent.status?.toUpperCase()}
                      </span>
                      {ent.status === 'active' && (
                        <button
                          onClick={() => handleRevoke(ent)}
                          disabled={revokeId === ent.id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="Widerrufen"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-2">
                {billingEvents.length === 0 && (
                  <div className={`text-center py-8 ${theme.textMuted} text-sm`}>Keine Billing Events.</div>
                )}
                {billingEvents.map(be => (
                  <div key={be.id} className={cn('p-3 rounded-xl border', theme.bgCard, theme.border)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${theme.text}`}>{be.user_email}</span>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded',
                        be.payment_status === 'succeeded' ? 'bg-emerald-700/10 text-emerald-600' :
                        be.payment_status === 'failed' ? 'bg-red-500/10 text-red-500' :
                        darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-500'
                      )}>{be.payment_status?.toUpperCase()}</span>
                    </div>
                    <div className={`text-[10px] ${theme.textMuted} font-sans`}>
                      {be.event_type} · {be.amount ? `${(be.amount / 100).toFixed(2)} ${be.currency?.toUpperCase()}` : '—'} · {new Date(be.created_date).toLocaleString('de-DE')}
                    </div>
                    {be.provider_session_id && (
                      <div className={`text-[9px] font-mono truncate mt-0.5 ${theme.textMuted}`}>{be.provider_session_id}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Audit Tab */}
            {activeTab === 'audit' && (
              <div className="space-y-2">
                {auditLogs.length === 0 && (
                  <div className={`text-center py-8 ${theme.textMuted} text-sm`}>Keine Audit-Einträge.</div>
                )}
                {auditLogs.map(log => (
                  <div key={log.id} className={cn('p-3 rounded-xl border', theme.bgCard, theme.border)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold tracking-wider ${theme.text}`}>{log.action?.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className={`text-[9px] ${theme.textMuted} font-mono`}>{new Date(log.created_date).toLocaleString('de-DE')}</span>
                    </div>
                    <div className={`text-xs ${theme.textSecondary} font-sans`}>{log.user_email}</div>
                    {log.reason && <div className={`text-[10px] ${theme.textMuted} font-sans mt-0.5`}>{log.reason}</div>}
                    <div className={`text-[9px] ${theme.textMuted} mt-0.5`}>via {log.actor_type} · {log.actor_id}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function EntitlementAdminPage() {
  return (
    <AdminGuard>
      <EntitlementAdminContent />
    </AdminGuard>
  );
}