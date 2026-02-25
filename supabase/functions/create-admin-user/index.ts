// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json();
        const {
            fullName, email, password, phone, county, town,
            assessorType, companyName, role, redirectUrl,
            businessAddress, website, description, companyNumber, vatNumber
        } = body;

        console.log(`[create-admin-user] Received request body:`, JSON.stringify(body));
        console.log(`[create-admin-user] Creating user ${email} with role ${role || 'contractor'}`);

        if (!email || !fullName || !password) {
            throw new Error("Missing required fields: fullName, email, password");
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // 1. Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role: role || 'contractor' }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        console.log(`[create-admin-user] Auth user created: ${authData.user.id}`);

        // 2. Upsert profile
        const profileData: Record<string, any> = {
            id: authData.user.id,
            full_name: fullName,
            email,
            role: role || 'contractor',
            registration_status: role === 'business' ? 'active' : 'pending',
            is_active: true,
        };

        if (phone) profileData.phone = phone;
        if (county) profileData.county = county;
        if (town) profileData.town = town;
        if (assessorType) profileData.assessor_type = assessorType;
        if (companyName) profileData.company_name = companyName;

        // Business specific fields
        if (businessAddress) profileData.business_address = businessAddress;
        if (website) profileData.website = website;
        if (description) profileData.description = description;
        if (companyNumber) profileData.company_number = companyNumber;
        if (vatNumber) profileData.vat_number = vatNumber;

        const { data: profileResult, error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert([profileData], { onConflict: 'id' })
            .select()
            .single();

        if (profileError) throw profileError;

        // 3. Generate a magic link so the user can log in with one click
        let magicLink = null;
        try {
            const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL')?.replace(/\/$/, '') || 'https://theberman.eu';

            // Default redirects based on role
            let defaultRedirect = `${websiteUrl}/assessor-onboarding`;
            if (role === 'business') {
                defaultRedirect = `${websiteUrl}/business-onboarding`;
            } else if (role === 'user' || role === 'homeowner') {
                defaultRedirect = `${websiteUrl}/dashboard/user`;
            }

            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'magiclink',
                email: email,
                options: {
                    redirectTo: redirectUrl || defaultRedirect,
                }
            });

            if (linkError) {
                console.error('[create-admin-user] Magic link error:', linkError.message);
            } else {
                magicLink = linkData?.properties?.action_link || null;
                console.log(`[create-admin-user] Magic link generated for ${email}`);
            }
        } catch (linkErr: any) {
            console.error('[create-admin-user] Magic link generation failed:', linkErr?.message);
        }

        console.log(`[create-admin-user] Done: ${email}`);

        return new Response(
            JSON.stringify({ success: true, user: profileResult, magicLink }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[create-admin-user] ERROR:", err?.message);
        return new Response(
            JSON.stringify({ success: false, error: err?.message || 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
