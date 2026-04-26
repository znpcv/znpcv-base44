import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Forex Economic Calendar
 * Source 1: nfs.faireconomy.media (ForexFactory JSON) — thisweek + nextweek
 * Source 2: api.tradingeconomics.com — free public calendar endpoint (no key needed for basic)
 * Merges & deduplicates both sources for a complete calendar.
 */

const IMPACT_MAP_FF  = { 'High': 'high', 'Medium': 'medium', 'Low': 'low', 'Holiday': 'low' };
const IMPACT_MAP_INT = { 3: 'high', 2: 'medium', 1: 'low' };

function parseFFEvent(e, idx, prefix) {
  if (!e.date) return null;
  const d = new Date(e.date);
  if (isNaN(d)) return null;
  return {
    id: `${prefix}-${idx}`,
    date: d.toISOString().split('T')[0],
    time: d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }),
    currency: e.country || '',
    impact: IMPACT_MAP_FF[e.impact] || 'low',
    event: e.title || '',
    actual:   e.actual   || null,
    forecast: e.forecast || null,
    previous: e.previous || null,
    source: 'ff',
  };
}

async function fetchFF(endpoint) {
  const url = `https://nfs.faireconomy.media/ff_calendar_${endpoint}.json?version=${Date.now()}`;
  const r = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`FF HTTP ${r.status}`);
  const data = await r.json();
  if (!Array.isArray(data)) throw new Error('FF: Not an array');
  return data.map((e, i) => parseFFEvent(e, i, endpoint)).filter(Boolean);
}

async function fetchTradingEconomics() {
  // Trading Economics free public calendar (JSON, no API key required for basic access)
  const from = new Date().toISOString().split('T')[0];
  const to   = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  // Try the public TE calendar endpoint
  const url = `https://api.tradingeconomics.com/calendar/country/all/${from}/${to}?c=guest:guest&format=json`;
  const r = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`TE HTTP ${r.status}`);
  const data = await r.json();
  if (!Array.isArray(data)) throw new Error('TE: Not an array');

  const MAJOR = new Set(['USD','EUR','GBP','JPY','AUD','CAD','CHF','NZD','CNY']);

  return data
    .filter(e => MAJOR.has(e.Currency))
    .map((e, idx) => {
      const d = e.Date ? new Date(e.Date) : null;
      if (!d || isNaN(d)) return null;
      // Importance: 3=high, 2=medium, 1=low
      const imp = IMPACT_MAP_INT[e.Importance] || (e.Category?.toLowerCase().includes('interest') ? 'high' : 'low');
      return {
        id: `te-${idx}`,
        date: d.toISOString().split('T')[0],
        time: d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }),
        currency: e.Currency || '',
        impact: imp,
        event: e.Event || e.Category || '',
        actual:   e.Actual   != null ? String(e.Actual)   : null,
        forecast: e.Forecast != null ? String(e.Forecast) : null,
        previous: e.Previous != null ? String(e.Previous) : null,
        source: 'te',
      };
    }).filter(Boolean);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all 3 sources in parallel
    const [thisWeekRes, nextWeekRes, teRes] = await Promise.allSettled([
      fetchFF('thisweek'),
      fetchFF('nextweek'),
      fetchTradingEconomics(),
    ]);

    const thisWeek = thisWeekRes.status === 'fulfilled' ? thisWeekRes.value : [];
    const nextWeek = nextWeekRes.status === 'fulfilled' ? nextWeekRes.value : [];
    const teEvents = teRes.status === 'fulfilled' ? teRes.value : [];

    if (thisWeekRes.status === 'rejected') console.log('FF thisweek failed:', thisWeekRes.reason?.message);
    if (nextWeekRes.status === 'rejected') console.log('FF nextweek failed:', nextWeekRes.reason?.message);
    if (teRes.status === 'rejected')       console.log('TE failed:', teRes.reason?.message);

    // Merge: ForexFactory is primary. Add TE events not already covered (deduplicate by date+currency+similar event name)
    const ffEvents = [...thisWeek, ...nextWeek];
    const ffKeys = new Set(ffEvents.map(e => `${e.date}-${e.currency}-${e.event.slice(0, 15).toLowerCase()}`));

    const uniqueTE = teEvents.filter(e => {
      const key = `${e.date}-${e.currency}-${e.event.slice(0, 15).toLowerCase()}`;
      return !ffKeys.has(key);
    });

    let events = [...ffEvents, ...uniqueTE];

    // Sort by date + time
    events.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return a.time.localeCompare(b.time);
    });

    console.log(`Total: ${events.length} (FF: ${ffEvents.length}, TE unique: ${uniqueTE.length})`);

    return Response.json({ success: true, data: events });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});