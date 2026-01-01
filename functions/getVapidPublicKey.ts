import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');

    if (!vapidPublicKey) {
      return Response.json({ error: 'VAPID key not configured' }, { status: 500 });
    }

    return Response.json({ publicKey: vapidPublicKey });
  } catch (error) {
    console.error('Get VAPID key failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});