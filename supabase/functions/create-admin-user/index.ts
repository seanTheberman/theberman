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

        const body = await req.json();
        const { fullName, email, password, phone, role, county, town, seaiNumber, assessorType, companyName, businessAddress, website, companyNumber, vatNumber, description } = body;

        if (!email || !password || !fullName || !role) {
            throw new Error('Missing required fields');
        }

        // 1. Create user in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: role,
                phone: phone,
                is_admin_created: true
            }
        });

        if (authError) throw authError;

        if (!authData.user) {
            throw new Error('User created but no context returned');
        }

        const userId = authData.user.id;

        // 2. Insert/Update Profile
        // The trigger handle_new_user might have already inserted a row.
        // We will try to update it, or upsert.
        let profileData: any = {
            id: userId,
            full_name: fullName,
            email: email,
            role: role,
            phone: phone,
            county: county,
            town: town,
            is_admin_created: true,
            registration_status: 'pending'
        };

        if (role === 'contractor') {
            profileData = {
                ...profileData,
                seai_number: seaiNumber,
                assessor_type: assessorType,
                company_name: companyName,
            };
        } else if (role === 'business') {
            profileData = {
                ...profileData,
                business_address: businessAddress,
                website: website,
                company_number: companyNumber,
                vat_number: vatNumber,
                company_name: companyName, // or some default logic
            };
        }

        // Use upsert to handle the case where the DB trigger already created the profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });

        if (profileError) {
            console.error('[create-admin-user] Profile update error:', profileError);
            // We don't throw, since Auth creation succeeded, but we should log it.
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "User created successfully",
                user: authData.user
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[create-admin-user] Error:", err);
        return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
