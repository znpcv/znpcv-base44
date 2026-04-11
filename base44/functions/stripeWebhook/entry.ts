import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    return Response.json({ error: `Webhook verification failed: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.metadata?.user_email || session.customer_email;

    if (!userEmail) {
      return Response.json({ error: 'No user email in session' }, { status: 400 });
    }

    try {
      const base44 = createClientFromRequest(req);
      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });

      if (users && users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          stripe_subscription_active: true,
          stripe_customer_id: session.customer || '',
          stripe_session_id: session.id,
        });
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return Response.json({ received: true });
});