import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Rate limiter: 30 req/min per userId (webhook)
const rateLimitMap = new Map();
function checkRateLimit(key, limit = 30, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, reset: now + windowMs };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs; }
  entry.count++;
  rateLimitMap.set(key, entry);
  return entry.count <= limit;
}

// Erlaubte Pair-Zeichen (Whitelist)
const VALID_PAIR = /^[A-Z0-9/_.-]{2,20}$/i;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    const userId = url.searchParams.get('user');

    if (!secret || !userId || secret.length > 100 || userId.length > 100) {
      return Response.json({ error: 'Ungültige Anfrage' }, { status: 401 });
    }

    if (!checkRateLimit(`webhook_${userId}`)) {
      return Response.json({ error: 'Zu viele Anfragen.' }, { status: 429 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    const user = users[0];

    if (!user || user.webhook_secret !== secret) {
      return Response.json({ error: 'Ungültig' }, { status: 401 });
    }

    const data = await req.json();

    // Input-Validierung
    const rawPair = String(data.ticker || data.symbol || '').toUpperCase().substring(0, 20);
    if (!rawPair || !VALID_PAIR.test(rawPair)) {
      return Response.json({ error: 'Ungültiges Währungspaar' }, { status: 400 });
    }

    const rawAction = String(data.strategy?.order_action || data.action || '').toLowerCase();
    const direction = rawAction === 'buy' ? 'long' : rawAction === 'sell' ? 'short' : null;
    if (!direction) {
      return Response.json({ error: 'Ungültige Handelsrichtung' }, { status: 400 });
    }

    const tradeData = {
      pair: rawPair,
      direction,
      entry_price: String(data.strategy?.order_price || '').substring(0, 30) || null,
      stop_loss: null,
      take_profit: null,
      account_size: String(user.account_size || '10000').substring(0, 20),
      risk_percent: String(user.default_risk_percent || '1').substring(0, 10),
      leverage: String(user.default_leverage || '100').substring(0, 10),
      status: 'executed',
      notes: `Automatisch importiert`,
      created_by: user.email,
      trade_date: new Date().toISOString().split('T')[0]
    };

    const checklist = await base44.asServiceRole.entities.TradeChecklist.create(tradeData);

    return Response.json({ success: true, id: checklist.id });
  } catch (_error) {
    const errorId = `E${Date.now().toString(36).toUpperCase()}`;
    console.error(`[${errorId}] tradingViewWebhook error`);
    return Response.json({ error: 'Webhook-Verarbeitung fehlgeschlagen.', errorId }, { status: 500 });
  }
});