// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Verify the caller is an authenticated admin
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
            if (userError || !user) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 401,
                });
            }
            // Check caller is admin
            const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
            if (!profile || profile.role !== 'admin') {
                return new Response(JSON.stringify({ error: 'Forbidden: Admin only' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 403,
                });
            }
        }

        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            throw new Error('Missing required fields: userId');
        }

        // Clean up all related records before deleting auth user
        // Nullify owner_id on catalogue listings (preserve the listing)
        await supabaseAdmin.from('catalogue_listings').update({ owner_id: null }).eq('owner_id', userId);

        // Delete records from tables that reference profiles.id
        const tablesToClean = [
            { table: 'assessments', column: 'user_id' },
            { table: 'payments', column: 'user_id' },
            { table: 'referrals', column: 'referred_user_id' },
            { table: 'referral_points', column: 'user_id' },
            { table: 'referral_redemptions', column: 'user_id' },
            { table: 'quotes', column: 'created_by' },
            { table: 'notifications', column: 'target_user_id' },
        ];

        for (const { table, column } of tablesToClean) {
            const { error: cleanErr } = await supabaseAdmin.from(table).delete().eq(column, userId);
            if (cleanErr) {
                console.warn(`Warning: Could not clean ${table}.${column}: ${cleanErr.message}`);
            }
        }

        // Delete profile explicitly
        await supabaseAdmin.from('profiles').delete().eq('id', userId);

        // Delete user from Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            throw new Error(`Failed to delete user from Auth: ${authError.message}`);
        }

        return new Response(JSON.stringify({ success: true, message: 'User deleted successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
