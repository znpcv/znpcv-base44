import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { title, body, targetEmail, icon, badge } = await req.json();

    if (!title || !body) {
      return Response.json({ error: 'Title and body required' }, { status: 400 });
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    webpush.setVapidDetails(
      'mailto:support@znpcv.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    // Get all active subscriptions
    let subscriptions;
    if (targetEmail) {
      subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
        user_email: targetEmail,
        active: true
      });
    } else {
      subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
        active: true
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png',
      badge: badge || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png',
      tag: 'znpcv-notification',
      requireInteraction: false
    });

    let successCount = 0;
    let failedCount = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys
          },
          payload
        );
        successCount++;
      } catch (error) {
        console.error('Push failed for subscription:', error);
        failedCount++;
        
        // Deactivate failed subscriptions (expired/invalid)
        if (error.statusCode === 410 || error.statusCode === 404) {
          await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
            active: false
          });
        }
      }
    }

    return Response.json({
      success: true,
      sent: successCount,
      failed: failedCount,
      total: subscriptions.length
    });
  } catch (error) {
    console.error('Send push notification failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});