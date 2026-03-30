import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Rate limiter: 10 req/min per user
const rateLimitMap = new Map();
function checkRateLimit(userId, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const key = `tg_${userId}`;
  const entry = rateLimitMap.get(key) || { count: 0, reset: now + windowMs };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs; }
  entry.count++;
  rateLimitMap.set(key, entry);
  return entry.count <= limit;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Nicht autorisiert' }, { status: 401 });

    if (!checkRateLimit(user.id)) {
      return Response.json({ error: 'Zu viele Anfragen.' }, { status: 429 });
    }

    const body = await req.json();
    const { message, trade } = body;

    // Validierung
    if (!message || typeof message !== 'string' || message.length > 500) {
      return Response.json({ error: 'Ungültige Nachricht' }, { status: 400 });
    }

    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const telegramChatId = user.telegram_chat_id;

    if (!telegramToken || !telegramChatId) {
      return Response.json({ error: 'Telegram nicht konfiguriert' }, { status: 400 });
    }

    // Sanitize trade fields
    const pair = trade?.pair ? String(trade.pair).substring(0, 20) : null;
    const direction = trade?.direction ? String(trade.direction).substring(0, 10) : null;
    const score = trade?.completion_percentage ? Math.round(parseFloat(trade.completion_percentage) || 0) : null;

    const text = `ZNPCV Alert\n\n${message}${pair ? `\n\nPaar: ${pair}` : ''}${direction ? `\nRichtung: ${direction}` : ''}${score !== null ? `\nScore: ${score}%` : ''}`;

    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ chat_id: telegramChatId, text })
    });

    if (!response.ok) {
      return Response.json({ error: 'Telegram-Übertragung fehlgeschlagen' }, { status: 502 });
    }

    return Response.json({ success: true });
  } catch (_error) {
    const errorId = `E${Date.now().toString(36).toUpperCase()}`;
    console.error(`[${errorId}] sendTelegramAlert error`);
    return Response.json({ error: 'Anfrage fehlgeschlagen.', errorId }, { status: 500 });
  }
});