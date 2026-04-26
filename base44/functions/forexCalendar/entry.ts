import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Forex Economic Calendar
 * Primary: nfs.faireconomy.media (ForexFactory compatible JSON, free, no auth)
 *   - thisweek  → current week
 *   - nextweek  → next week
 * Fallback: investing.com public calendar proxy via allorigins
 */

const IMPACT_MAP = { 'High': 'high', 'Medium': 'medium', 'Low': 'low', 'Holiday': 'low' };

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
  };
}

async function fetchFF(endpoint) {
  const url = `https://nfs.faireconomy.media/ff_calendar_${endpoint}.json?version=${Date.now()}`;
  const r = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  if (!Array.isArray(data)) throw new Error('Not an array');
  return data.map((e, i) => parseFFEvent(e, i, endpoint)).filter(Boolean);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch thisweek and nextweek in parallel
    const [thisWeekResult, nextWeekResult] = await Promise.allSettled([
      fetchFF('thisweek'),
      fetchFF('nextweek'),
    ]);

    const thisWeek = thisWeekResult.status === 'fulfilled' ? thisWeekResult.value : [];
    const nextWeek = nextWeekResult.status === 'fulfilled' ? nextWeekResult.value : [];

    if (thisWeekResult.status === 'rejected') console.log('thisweek failed:', thisWeekResult.reason?.message);
    if (nextWeekResult.status === 'rejected') console.log('nextweek failed:', nextWeekResult.reason?.message);

    let events = [...thisWeek, ...nextWeek];

    // Deduplicate by id
    const seen = new Set();
    events = events.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });

    // Sort by date + time
    events.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return a.time.localeCompare(b.time);
    });

    console.log(`Returning ${events.length} events (thisWeek=${thisWeek.length}, nextWeek=${nextWeek.length})`);

    return Response.json({ success: true, data: events, source: 'faireconomy' });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});