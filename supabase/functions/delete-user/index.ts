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
        ];

        for (const { table, column } of tablesToClean) {
            const { error: cleanErr } = await supabaseAdmin.from(table).delete().eq(column, userId);
            if (cleanErr) {
                console.warn(`Warning: Could not clean ${table}.${column}: ${cleanErr.message}`);
            }
        }

        // Delete profile explicitly - this is the critical step for effective deletion
        const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
        if (profileError) {
            console.error('[delete-user] Failed to delete profile:', profileError);
            throw new Error(`Failed to delete profile: ${profileError.message}`);
        }

        // Delete user from Auth with retry logic
        // If this fails, the user is still effectively deleted (profile is gone)
        // but we log the error for manual cleanup
        let authDeleteSuccess = false;
        let authDeleteError = null;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
                if (!authError) {
                    authDeleteSuccess = true;
                    console.log(`[delete-user] Auth user deleted successfully on attempt ${attempt}`);
                    break;
                }
                authDeleteError = authError;
                console.warn(`[delete-user] Auth deletion attempt ${attempt} failed:`, authError.message);
                if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                }
            } catch (e: any) {
                authDeleteError = e;
                console.warn(`[delete-user] Auth deletion attempt ${attempt} threw error:`, e.message);
                if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        if (!authDeleteSuccess) {
            console.error('[delete-user] Failed to delete Auth user after 3 attempts:', authDeleteError);
            // Don't throw - the profile is deleted so user is effectively removed
            // Return success with a warning about Auth cleanup
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'User deleted successfully (profile removed). Auth cleanup failed - user may still exist in Auth but cannot access the platform.',
                authCleanupFailed: true,
                authError: authDeleteError?.message
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
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
