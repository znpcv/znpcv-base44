/**
 * useProductAccess — zentraler Access-Hook für die zwei Produkte.
 *
 * checklist_lifetime_access  → ZNPCV Checkliste ($99 Lifetime)
 * strategy_access            → ZNPCV Strategie  ($2,499 optional)
 *
 * Legacy: stripe_subscription_active wird als checklist_lifetime_access behandelt
 * (bestehende Nutzer behalten ihren Zugang).
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useProductAccess() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasChecklistAccess, setHasChecklistAccess] = useState(false);
  const [hasStrategyAccess, setHasStrategyAccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setLoading(false);
          }
          return;
        }
        const u = await base44.auth.me();
        if (cancelled) return;
        setIsAuthenticated(true);
        setUser(u);

        // strategy_access = explizit gekaufte Strategie
        setHasStrategyAccess(!!u.strategy_access);

        // checklist_lifetime_access ODER legacy stripe_subscription_active
        setHasChecklistAccess(
          !!u.checklist_lifetime_access || !!u.stripe_subscription_active
        );
      } catch {
        // nicht eingeloggt oder Fehler → kein Zugriff
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { loading, isAuthenticated, hasChecklistAccess, hasStrategyAccess, user };
}