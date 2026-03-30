import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Rate limiter: 10 req/min per user
const rateLimitMap = new Map();
function checkRateLimit(userId, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const key = `push_sub_${userId}`;
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
      return Response.json({ error: 'Zu viele Anfragen. Bitte warte eine Minute.' }, { status: 429 });
    }

    const body = await req.json();
    const { subscription, deviceInfo } = body;

    // Strikte Validierung
    if (!subscription || typeof subscription !== 'object') {
      return Response.json({ error: 'Ungültige Anfrage' }, { status: 400 });
    }
    if (!subscription.endpoint || typeof subscription.endpoint !== 'string' || !subscription.endpoint.startsWith('https://')) {
      return Response.json({ error: 'Ungültige Subscription-URL' }, { status: 400 });
    }
    if (!subscription.keys?.p256dh || !subscription.keys?.auth) {
      return Response.json({ error: 'Fehlende Subscription-Keys' }, { status: 400 });
    }
    // Länge prüfen, keine riesigen Payloads
    if (subscription.endpoint.length > 500 || subscription.keys.p256dh.length > 200 || subscription.keys.auth.length > 100) {
      return Response.json({ error: 'Ungültige Daten' }, { status: 400 });
    }

    const safeDeviceInfo = String(deviceInfo || 'Unbekannt').substring(0, 100);

    const existing = await base44.asServiceRole.entities.PushSubscription.filter({
      endpoint: subscription.endpoint
    });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.PushSubscription.update(existing[0].id, {
        keys: subscription.keys,
        user_email: user.email,
        device_info: safeDeviceInfo,
        active: true
      });
      return Response.json({ success: true, action: 'updated' });
    }

    await base44.asServiceRole.entities.PushSubscription.create({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      user_email: user.email,
      device_info: safeDeviceInfo,
      active: true
    });

    return Response.json({ success: true, action: 'created' });
  } catch (_error) {
    const errorId = `E${Date.now().toString(36).toUpperCase()}`;
    console.error(`[${errorId}] subscribePush error`);
    return Response.json({ error: 'Anfrage fehlgeschlagen.', errorId }, { status: 500 });
  }
});