import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthResult {
    user: any | null;
    profile: any | null;
    error: string | null;
}

/**
 * Verifies the JWT from the Authorization header and returns the authenticated user.
 * Uses the provided service-role client to call auth.getUser(), which validates the token.
 */
export async function verifyAuth(req: Request, serviceRoleClient: any): Promise<AuthResult> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
        return { user: null, profile: null, error: 'Missing authorization header' };
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
        return { user: null, profile: null, error: 'Missing bearer token' };
    }

    const { data, error } = await serviceRoleClient.auth.getUser(token);
    if (error || !data.user) {
        return { user: null, profile: null, error: error?.message || 'Invalid or expired token' };
    }

    return { user: data.user, profile: null, error: null };
}

/**
 * Verifies the caller is an authenticated admin.
 * Returns the admin user on success, or null/error on failure.
 */
export async function requireAdmin(req: Request, serviceRoleClient: any): Promise<AuthResult> {
    const authResult = await verifyAuth(req, serviceRoleClient);
    if (authResult.error || !authResult.user) {
        return authResult;
    }

    const { data: profile, error: profileError } = await serviceRoleClient
        .from('profiles')
        .select('role, tenant')
        .eq('id', authResult.user.id)
        .maybeSingle();

    if (profileError) {
        return { user: null, profile: null, error: profileError.message };
    }

    if (!profile || profile.role !== 'admin') {
        return { user: null, profile: null, error: 'Forbidden: admin access required' };
    }

    return { user: authResult.user, profile, error: null };
}
