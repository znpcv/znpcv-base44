import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subscription, deviceInfo } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return Response.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Validate subscription keys
    if (!subscription.keys?.p256dh || !subscription.keys?.auth) {
      return Response.json({ 
        error: 'Invalid subscription keys',
        success: false 
      }, { status: 400 });
    }

    // Check if subscription already exists
    const existing = await base44.asServiceRole.entities.PushSubscription.filter({
      endpoint: subscription.endpoint
    });

    if (existing.length > 0) {
      // Update existing subscription
      await base44.asServiceRole.entities.PushSubscription.update(existing[0].id, {
        keys: subscription.keys,
        user_email: user.email,
        device_info: deviceInfo || 'Unknown',
        active: true
      });
      return Response.json({ 
        success: true, 
        message: 'Subscription aktualisiert' 
      });
    }

    // Create new subscription
    await base44.asServiceRole.entities.PushSubscription.create({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      user_email: user.email,
      device_info: deviceInfo || 'Unknown',
      active: true
    });

    return Response.json({ 
      success: true, 
      message: 'Subscription erstellt' 
    });
  } catch (error) {
    console.error('Subscribe push failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});