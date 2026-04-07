/**
 * checkEntitlement — Server-side entitlement gate.
 * Returns { entitled: bool, status, entitlement } for the authenticated user.
 * Admins always pass (but get flagged as admin_bypass).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ entitled: false, reason: 'unauthenticated' }, { status: 401 });
    }

    // Admins always have access (operational, not a billing bypass)
    if (user.role === 'admin') {
      return Response.json({
        entitled: true,
        status: 'admin_bypass',
        user_email: user.email
      });
    }

    // Look up active entitlement for this user
    const entitlements = await base44.asServiceRole.entities.UserEntitlement.filter({
      user_email: user.email,
      entitlement_key: 'full_app_access',
      status: 'active'
    });

    if (entitlements.length === 0) {
      // Audit: log access denial (non-blocking, best-effort)
      try {
        await base44.asServiceRole.entities.AccessAuditLog.create({
          user_email: user.email,
          action: 'access_denied_no_entitlement',
          actor_type: 'system',
          actor_id: 'checkEntitlement',
          reason: 'No active full_app_access entitlement found'
        });
      } catch (_) { /* audit failure must not block response */ }

      return Response.json({
        entitled: false,
        reason: 'no_active_entitlement',
        status: 'unpaid'
      });
    }

    const ent = entitlements[0];
    return Response.json({
      entitled: true,
      status: 'active',
      entitlement_key: ent.entitlement_key,
      granted_at: ent.granted_at,
      source: ent.source,
      user_email: user.email
    });

  } catch (error) {
    console.error('[checkEntitlement] error:', error.message);
    return Response.json({ entitled: false, reason: 'server_error' }, { status: 500 });
  }
});