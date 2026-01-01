import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription, deviceInfo } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return Response.json({ error: 'Invalid subscription' }, { status: 400 });
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
      return Response.json({ success: true, message: 'Subscription updated' });
    }

    // Create new subscription
    await base44.asServiceRole.entities.PushSubscription.create({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      user_email: user.email,
      device_info: deviceInfo || 'Unknown',
      active: true
    });

    return Response.json({ success: true, message: 'Subscription created' });
  } catch (error) {
    console.error('Subscribe push failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});