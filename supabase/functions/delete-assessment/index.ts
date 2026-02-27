// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const { assessmentId } = await req.json();

        if (!assessmentId) {
            throw new Error("assessmentId is required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Extract the JWT token from the Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ success: false, error: 'No authorization header' }),
                { status: 401, headers: responseHeaders }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('[delete-assessment] Auth error:', authError);
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized' }),
                { status: 401, headers: responseHeaders }
            );
        }

        // Verify the user owns this assessment
        const { data: assessment, error: fetchError } = await supabase
            .from('assessments')
            .select('id, user_id')
            .eq('id', assessmentId)
            .single();

        if (fetchError || !assessment) {
            return new Response(
                JSON.stringify({ success: false, error: 'Assessment not found' }),
                { status: 404, headers: responseHeaders }
            );
        }

        if (assessment.user_id !== user.id) {
            return new Response(
                JSON.stringify({ success: false, error: 'You can only delete your own assessments' }),
                { status: 403, headers: responseHeaders }
            );
        }

        // Delete all related records using service role (bypasses RLS)
        console.log(`[delete-assessment] Deleting assessment ${assessmentId} for user ${user.id}`);

        // 1. Delete payments
        const { error: paymentsErr } = await supabase
            .from('payments')
            .delete()
            .eq('assessment_id', assessmentId);
        if (paymentsErr) console.error('[delete-assessment] Error deleting payments:', paymentsErr);

        // 2. Delete quotes
        const { error: quotesErr } = await supabase
            .from('quotes')
            .delete()
            .eq('assessment_id', assessmentId);
        if (quotesErr) console.error('[delete-assessment] Error deleting quotes:', quotesErr);

        // 3. Delete assessment messages
        const { error: messagesErr } = await supabase
            .from('assessment_messages')
            .delete()
            .eq('assessment_id', assessmentId);
        if (messagesErr) console.error('[delete-assessment] Error deleting messages:', messagesErr);

        // 4. Delete the assessment itself
        const { error: deleteErr } = await supabase
            .from('assessments')
            .delete()
            .eq('id', assessmentId);

        if (deleteErr) {
            console.error('[delete-assessment] Error deleting assessment:', deleteErr);
            return new Response(
                JSON.stringify({ success: false, error: deleteErr.message }),
                { status: 500, headers: responseHeaders }
            );
        }

        console.log(`[delete-assessment] SUCCESS: Assessment ${assessmentId} deleted`);
        return new Response(
            JSON.stringify({ success: true, message: 'Assessment deleted successfully' }),
            { headers: responseHeaders }
        );

    } catch (err: any) {
        console.error('[delete-assessment] GLOBAL ERROR:', err);
        return new Response(
            JSON.stringify({ success: false, error: err?.message || 'Internal error' }),
            { status: 400, headers: responseHeaders }
        );
    }
});
