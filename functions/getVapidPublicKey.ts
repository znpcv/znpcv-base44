import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');

    if (!vapidPublicKey) {
      console.error('VAPID_PUBLIC_KEY nicht gesetzt');
      return Response.json({ 
        error: 'VAPID key not configured',
        message: 'Bitte VAPID_PUBLIC_KEY in den Umgebungsvariablen setzen'
      }, { status: 500 });
    }

    return Response.json({ 
      success: true,
      publicKey: vapidPublicKey 
    });
  } catch (error) {
    console.error('Get VAPID key failed:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});