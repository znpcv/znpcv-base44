import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, duration } = await req.json();

    // Calculate snooze time
    const snoozeUntil = new Date();
    snoozeUntil.setMinutes(snoozeUntil.getMinutes() + (duration || 30));

    // Update notification
    await base44.entities.Notification.update(notificationId, {
      snoozed_until: snoozeUntil.toISOString()
    });

    return Response.json({
      success: true,
      snoozed_until: snoozeUntil.toISOString()
    });
  } catch (error) {
    console.error('Snooze notification failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});