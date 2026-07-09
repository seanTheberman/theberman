// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getTenantConfig } from "../shared/tenant.ts";
import { requireAdmin } from "../shared/auth.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function generateSecurePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars[randomBytes[i] % chars.length];
    }
    return password;
}

const contractorValidationMessages: Record<string, {
    serviceAreaRequired: string;
    registrationRequired: string;
    assessorTypeRequired: string;
}> = {
    ireland: {
        serviceAreaRequired: 'At least one preferred county or town is required for contractors',
        registrationRequired: 'SEAI registration number is required',
        assessorTypeRequired: 'Assessor type is required for contractors',
    },
    spain: {
        serviceAreaRequired: 'Selecciona al menos una comunidad autónoma o localidad para el certificador',
        registrationRequired: 'Número de registro CEE CAT es obligatorio',
        assessorTypeRequired: 'El tipo de certificador es obligatorio',
    },
    england: {
        serviceAreaRequired: 'At least one preferred county or town is required for assessors',
        registrationRequired: 'Assessor ID is required',
        assessorTypeRequired: 'Assessor type is required',
    },
    france: {
        serviceAreaRequired: 'Au moins une région ou ville est obligatoire pour le diagnostiqueur',
        registrationRequired: 'Le numéro DPE est obligatoire',
        assessorTypeRequired: 'Le type de diagnostiqueur est obligatoire',
    },
    portugal: {
        serviceAreaRequired: 'Selecione pelo menos uma região ou localidade para o perito',
        registrationRequired: 'O número de registo ADENE é obrigatório',
        assessorTypeRequired: 'O tipo de perito é obrigatório',
    },
};

const ALLOWED_ROLES = ['contractor', 'business', 'user'];

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Authorize: only authenticated admins may invoke this endpoint
        const { error: authError } = await requireAdmin(req, supabaseAdmin);
        if (authError) {
            console.warn('[create-managed-user] Authorization failed:', authError);
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            );
        }

        const body = await req.json();
        const { fullName, email, password: providedPassword, phone, role, county, town, seaiNumber, assessorType, companyName, businessAddress, website, companyNumber, vatNumber, description, preferredCounties, preferredTowns, tenant } = body;
        const validationMessages = contractorValidationMessages[tenant];

        if (!email || !fullName || !role || !tenant) {
            throw new Error('Missing required fields');
        }

        // Hard allowlist: admin creation is not permitted through any edge function
        if (!ALLOWED_ROLES.includes(role)) {
            return new Response(
                JSON.stringify({ success: false, error: `Role '${role}' is not permitted. Only ${ALLOWED_ROLES.join(', ')} can be created.` }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            );
        }

        if (!validationMessages) {
            throw new Error(`Missing validation messages for tenant: ${tenant}`);
        }

        // For contractors, require at least one service area (county or town)
        if (role === 'contractor') {
            if ((!preferredCounties || preferredCounties.length === 0) && (!preferredTowns || preferredTowns.length === 0)) {
                throw new Error(validationMessages.serviceAreaRequired);
            }
            if (!seaiNumber) {
                throw new Error(validationMessages.registrationRequired);
            }
            if (!assessorType) {
                throw new Error(validationMessages.assessorTypeRequired);
            }
        }

        // Always generate a strong unique temporary password per user unless the caller explicitly provided one.
        const password = providedPassword && providedPassword.length >= 8 ? providedPassword : generateSecurePassword(14);

        // 1. Create user in Auth
        const { data: authData, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: role,
                phone: phone,
                tenant: tenant,
                is_admin_created: true,
                requires_password_change: true
            }
        });

        if (authError2) throw authError2;

        if (!authData.user) {
            throw new Error('User created but no context returned');
        }

        const userId = authData.user.id;

        // 2. Insert/Update Profile with correct subscription settings
        let profileData: any = {
            id: userId,
            full_name: fullName,
            email: email,
            role: role,
            phone: phone,
            county: county,
            town: town,
            tenant: tenant,
            registration_status: role === 'contractor' ? 'completed' : 'pending',
            is_active: true,
        };

        // Set subscription details based on role
        if (role === 'contractor') {
            profileData = {
                ...profileData,
                seai_number: seaiNumber,
                assessor_type: assessorType,
                company_name: companyName,
                preferred_counties: preferredCounties || [],
                preferred_towns: preferredTowns || [],
                subscription_status: 'active',
                stripe_payment_id: 'FREE_ASSESSOR',
            };
        } else if (role === 'business') {
            profileData = {
                ...profileData,
                business_address: businessAddress,
                website: website,
                company_number: companyNumber,
                vat_number: vatNumber,
                company_name: companyName,
                subscription_status: 'inactive',
                stripe_payment_id: 'MANUAL_BY_ADMIN',
            };
        }

        // Use upsert to handle the case where the DB trigger already created the profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });

        if (profileError) {
            console.error('[create-managed-user] Profile update error:', profileError);
        }

        // 3. Resolve tenant website URL for the login link in the welcome email
        let websiteUrl = 'https://theberman.eu';
        try {
            const tenantConfig = await getTenantConfig(supabaseAdmin, tenant);
            websiteUrl = (tenantConfig.website_url || `https://${tenantConfig.domain}`).replace(/\/$/, '');
        } catch (tenantErr: any) {
            console.warn('[create-managed-user] tenant config lookup failed, falling back to default:', tenantErr.message);
        }
        const loginUrl = `${websiteUrl}/login`;

        return new Response(
            JSON.stringify({
                success: true,
                message: "User created successfully",
                user: authData.user,
                password: password,
                loginUrl: loginUrl,
                // Back-compat: older frontend code reads `magicLink` – return the login URL so it still works.
                magicLink: loginUrl,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[create-managed-user] Error:", err);
        return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
