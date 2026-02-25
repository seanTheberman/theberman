// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CustomSmtpClient } from "../shared/smtp.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { registrationData, paymentIntentId } = await req.json()
        const {
            user_id,
            user_email,
            user_full_name,
            companyName,
            tradingName,
            phone,
            businessAddress,
            county,
            website,
            description,
            companyNumber,
            vatNumber,
            insuranceExpiry,
            certifications,
            selectedCategories,
            facebook,
            instagram,
            linkedin,
            twitter
        } = registrationData

        // Initialize Supabase Admin Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

        // 1. Update User Metadata (Compliance Data)
        const { error: authError } = await supabase.auth.admin.updateUserById(user_id, {
            user_metadata: {
                role: 'business',
                compliance_data: {
                    trading_name: tradingName,
                    company_number: companyNumber,
                    vat_number: vatNumber,
                    insurance_expiry: insuranceExpiry,
                    certifications: certifications,
                }
            }
        })
        if (authError) throw authError

        // Also update profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                role: 'business',
                company_name: companyName,
                phone: phone,
                subscription_status: 'active'
            })
            .eq('id', user_id)
        if (profileError) throw profileError

        // 2. Create Catalogue Listing
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
        const fullAddress = businessAddress + (county ? `, Co. ${county}` : '');

        const { data: listing, error: listError } = await supabase
            .from('catalogue_listings')
            .insert({
                name: companyName,
                slug,
                company_name: companyName,
                description: description || `${companyName} - Professional services provider.`,
                email: user_email,
                phone: phone,
                address: fullAddress,
                website: website,
                owner_id: user_id,
                is_active: true,
                social_media: {
                    facebook: facebook || undefined,
                    instagram: instagram || undefined,
                    linkedin: linkedin || undefined,
                    twitter: twitter || undefined,
                }
            })
            .select('id')
            .single()

        if (listError) throw listError

        // 3. Category & Location Mapping
        if (listing) {
            // Map categories
            if (selectedCategories && selectedCategories.length > 0) {
                const categoryMappings = selectedCategories.map((categoryId: string) => ({
                    listing_id: listing.id,
                    category_id: categoryId,
                }));
                await supabase.from('catalogue_listing_categories').insert(categoryMappings);
            }

            // Map location (County)
            if (county) {
                const { data: locData } = await supabase
                    .from('catalogue_locations')
                    .select('id')
                    .eq('name', county)
                    .maybeSingle()

                if (locData) {
                    await supabase.from('catalogue_listing_locations').insert({
                        listing_id: listing.id,
                        location_id: locData.id
                    })
                }
            }
        }

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
                <h1 style="color: #007F00; text-align: center;">Welcome to The Berman!</h1>
                <p>Hello ${user_full_name},</p>
                <p>Your business registration is now complete and your listing is active in our Home Energy Catalogue.</p>
                
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 0.5rem; margin: 20px 0;">
                    <h2 style="font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Listing Details</h2>
                    <p><strong>Company:</strong> ${companyName}</p>
                    <p><strong>Status:</strong> Active & Verified</p>
                </div>

                <p>You can now log in to manage your profile and view leads in your dashboard.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://theberman.eu/login" style="background-color: #007F00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 0.5rem; font-weight: bold;">Go to Dashboard</a>
                </div>

                <p style="margin-top: 40px; font-size: 0.8rem; color: #6b7280; text-align: center;">
                    If you have any questions, please contact us at support@theberman.eu
                </p>
            </div>
        `;
        // 4. Send Confirmation Email
        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')!;
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
        const smtpUsername = Deno.env.get('SMTP_USERNAME')!;
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')!;
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `Theberman.eu <${smtpFromEnv}>`;

        const client = new CustomSmtpClient();
        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            await client.send(
                smtpFrom,
                user_email,
                'Registration Successful - Business Profile Active',
                emailHtml
            );

            await client.close();
            console.log(`[confirm-business-registration] SUCCESS: Confirmation email sent to ${user_email}`);
        } catch (smtpErr: any) {
            console.error("[confirm-business-registration] SMTP ERROR", smtpErr);
        }

        return new Response(
            JSON.stringify({ success: true, message: "Business registration confirmed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )

    } catch (error: any) {
        console.error(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    }
})
