import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Rate limiter: 30 req/min per user
const rateLimitMap = new Map();
function checkRateLimit(userId, limit = 30, windowMs = 60000) {
  const now = Date.now();
  const key = `snooze_${userId}`;
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
    const { notificationId, duration } = body;

    // Validierung
    if (!notificationId || typeof notificationId !== 'string' || notificationId.length > 100) {
      return Response.json({ error: 'Ungültige Benachrichtigungs-ID' }, { status: 400 });
    }
    const durationMin = Math.max(5, Math.min(10080, parseInt(duration) || 30));

    // Ownership check: Notification muss dem User gehören
    // Erst Validierung ob es eine hex-like ID ist, bevor wir die DB anfragen
    if (!/^[a-f0-9]{20,30}$/i.test(notificationId)) {
      return Response.json({ error: 'Nicht gefunden' }, { status: 404 });
    }
    let notifications;
    try {
      notifications = await base44.entities.Notification.filter({ id: notificationId });
    } catch (_e) {
      return Response.json({ error: 'Nicht gefunden' }, { status: 404 });
    }
    if (!notifications.length || notifications[0].user_email !== user.email) {
      return Response.json({ error: 'Nicht gefunden' }, { status: 404 });
    }

    const snoozeUntil = new Date();
    snoozeUntil.setMinutes(snoozeUntil.getMinutes() + durationMin);

    await base44.entities.Notification.update(notificationId, {
      snoozed_until: snoozeUntil.toISOString()
    });

    return Response.json({ success: true, snoozed_until: snoozeUntil.toISOString() });
  } catch (_error) {
    const errorId = `E${Date.now().toString(36).toUpperCase()}`;
    console.error(`[${errorId}] snoozeNotification error`);
    return Response.json({ error: 'Anfrage fehlgeschlagen.', errorId }, { status: 500 });
  }
});