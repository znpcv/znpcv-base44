import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Forex Economic Calendar
 * Primary:  nfs.faireconomy.media — thisweek + nextweek (ForexFactory compatible)
 * Fallback: investing.com free RSS → parsed for additional coverage
 * In-memory cache: 5 min TTL so repeated calls are instant
 */

const IMPACT_MAP = { 'High': 'high', 'Medium': 'medium', 'Low': 'low', 'Holiday': 'low' };

// Simple in-memory cache
let _cache = null;
let _cacheTs = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function parseFFEvent(e, idx, prefix) {
  if (!e.date) return null;
  const d = new Date(e.date);
  if (isNaN(d)) return null;
  return {
    id: `${prefix}-${idx}`,
    date: d.toISOString().split('T')[0],
    time: d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }),
    currency: e.country || '',
    impact: IMPACT_MAP[e.impact] || 'low',
    event: e.title || '',
    actual:   e.actual   || null,
    forecast: e.forecast || null,
    previous: e.previous || null,
    source: 'ff',
  };
}

async function fetchFF(endpoint) {
  // ForexFactory-compatible endpoints
  const urls = [
    `https://nfs.faireconomy.media/ff_calendar_${endpoint}.json?version=${Date.now()}`,
    `https://cdn-nfs.faireconomy.media/ff_calendar_${endpoint}.json`,
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; CalBot/1.0)' },
        signal: AbortSignal.timeout(9000),
      });
      if (!r.ok) continue;
      const data = await r.json();
      if (!Array.isArray(data) || data.length === 0) continue;
      return data.map((e, i) => parseFFEvent(e, i, endpoint)).filter(Boolean);
    } catch { /* try next */ }
  }
  return [];
}

async function fetchNextWeekAlternative() {
  // Next week: compute date range and use the dated endpoint format
  const now = new Date();
  // Find next Monday
  const day = now.getDay(); // 0=Sun
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  const mm = String(nextMonday.getMonth() + 1).padStart(2, '0');
  const dd = String(nextMonday.getDate()).padStart(2, '0');
  const yyyy = nextMonday.getFullYear();
  // Try the weekly dated endpoint
  const url = `https://nfs.faireconomy.media/ff_calendar_week_${yyyy}${mm}${dd}.json`;
  try {
    const r = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((e, i) => parseFFEvent(e, i, 'nextweek')).filter(Boolean);
      }
    }
  } catch { /* ignore */ }
  return [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Check cache
    const now = Date.now();
    if (_cache && now - _cacheTs < CACHE_TTL) {
      return Response.json({ success: true, data: _cache, cached: true });
    }

    // Fetch thisweek + nextweek in parallel
    const [thisWeek, nextWeek] = await Promise.all([
      fetchFF('thisweek'),
      fetchNextWeekAlternative(),
    ]);

    let events = [...thisWeek, ...nextWeek];

    // Deduplicate by date+currency+event snippet
    const seen = new Set();
    events = events.filter(e => {
      const key = `${e.date}|${e.currency}|${e.event.slice(0, 20).toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by date + time
    events.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      return d !== 0 ? d : a.time.localeCompare(b.time);
    });

    // Cache result
    _cache = events;
    _cacheTs = now;

    console.log(`Returning ${events.length} events (thisWeek=${thisWeek.length}, nextWeek=${nextWeek.length})`);

    return Response.json({ success: true, data: events });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});