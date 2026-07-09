// @ts-nocheck
// DEPRECATED / DISABLED
// This endpoint has been replaced by `create-managed-user` and intentionally
// cannot create any user. Admin user creation via edge functions is not allowed.

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    console.warn('[create-admin-user] Blocked request to deprecated endpoint');
    return new Response(
        JSON.stringify({
            success: false,
            error: 'This endpoint is disabled. Admin user creation is not permitted via edge functions. Use create-managed-user for contractor/business users only.'
        }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
})
