/**
 * activatePremiumUser — Admin-Tool zur manuellen Freischaltung.
 * Nur für Admins zugänglich.
 *
 * Body: { email: string, product: "checklist" | "strategy" | "both" }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25'; // ZNPCV Platform

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { email, product } = await req.json();
  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const users = await base44.asServiceRole.entities.User.filter({ email });
  if (!users || users.length === 0) {
    return Response.json({ error: `User not found: ${email}` }, { status: 404 });
  }

  const updateData = {};

  if (product === 'strategy' || product === 'both') {
    updateData.strategy_access = true;
  }
  if (product === 'checklist' || product === 'both' || !product) {
    // Default: Checkliste (legacy-kompatibel)
    updateData.checklist_lifetime_access = true;
    updateData.stripe_subscription_active = true;
  }

  await base44.asServiceRole.entities.User.update(users[0].id, updateData);

  return Response.json({
    success: true,
    message: `Access granted for ${email}`,
    granted: updateData,
  });
});