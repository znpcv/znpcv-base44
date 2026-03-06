import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    // Auth-Check: Nur authentifizierte User
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Nicht autorisiert' }, { status: 401 });

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    if (!vapidPublicKey) {
      return Response.json({ error: 'Push-Notifications nicht konfiguriert' }, { status: 503 });
    }

    return Response.json({ publicKey: vapidPublicKey });
  } catch (_error) {
    return Response.json({ error: 'Anfrage fehlgeschlagen' }, { status: 500 });
  }
});