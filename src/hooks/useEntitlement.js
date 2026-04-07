/**
 * useEntitlement — React hook for checking user entitlement status.
 * Caches result in sessionStorage for 5 minutes to avoid repeated backend calls.
 */
import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const CACHE_KEY = 'znpcv_entitlement_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, expires } = JSON.parse(raw);
    if (Date.now() > expires) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      expires: Date.now() + CACHE_TTL_MS
    }));
  } catch { /* ignore */ }
}

export function clearEntitlementCache() {
  try { sessionStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

export function useEntitlement() {
  const [state, setState] = useState({
    loading: true,
    entitled: false,
    status: null,
    isAdmin: false,
    error: null
  });

  const check = useCallback(async (force = false) => {
    // Return cached result unless forced
    if (!force) {
      const cached = getCache();
      if (cached) {
        setState({ ...cached, loading: false, error: null });
        return;
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await base44.functions.invoke('checkEntitlement', {});
      const data = res.data;

      if (!data || typeof data.entitled !== 'boolean') {
        // Malformed response — do not cache, fail safe (deny access)
        setState({ loading: false, entitled: false, status: 'error', isAdmin: false, error: 'Ungültige Server-Antwort.' });
        return;
      }

      const result = {
        loading: false,
        entitled: data.entitled === true,
        status: data.status || (data.entitled ? 'active' : 'unpaid'),
        isAdmin: data.status === 'admin_bypass',
        error: null
      };

      setCache(result);
      setState(result);
    } catch (err) {
      console.error('[useEntitlement] check failed:', err.message);
      // Network/server error: fail closed (no access granted), do not cache
      setState({ loading: false, entitled: false, status: 'network_error', isAdmin: false, error: 'Verbindungsfehler. Bitte Seite neu laden.' });
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { ...state, refresh: () => check(true) };
}