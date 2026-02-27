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
            phone,
            homeCounty,
            homeTown,
            seaiNumber,
            insuranceHolder,
            vatRegistered,
            assessorTypes,
            serviceAreas,
            companyName,
            website,
            features,
            socialFacebook,
            socialInstagram,
            socialLinkedin
        } = registrationData

        // Initialize Supabase Admin Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

        // 4. Dates for subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1);

        // 1. Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                phone,
                home_county: homeCounty,
                seai_number: seaiNumber,
                insurance_holder: insuranceHolder,
                vat_registered: vatRegistered,
                assessor_type: assessorTypes.join(' & '),
                preferred_counties: serviceAreas,
                company_name: companyName,
                website_url: website,
                role: 'contractor', // Ensure role is set
                subscription_status: 'active',
                subscription_start_date: startDate.toISOString(),
                subscription_end_date: endDate.toISOString(),
                registration_status: 'active',
                stripe_payment_id: paymentIntentId
            })
            .eq('id', user_id)

        if (profileError) throw profileError

        // 2. Handle Catalogue Listing
        let { data: listing } = await supabase
            .from('catalogue_listings')
            .select('id')
            .eq('email', user_email)
            .maybeSingle()

        if (!listing) {
            const assessorDescription = `${user_full_name || 'BER Assessor'} is a registered BER Assessor based in ${homeTown || ''}, Co. ${homeCounty || ''}.`

            const { data: newListing, error: listError } = await supabase
                .from('catalogue_listings')
                .insert({
                    name: user_full_name || 'Service Provider',
                    email: user_email,
                    phone: phone || '',
                    company_name: companyName || user_full_name || '',
                    description: assessorDescription,
                    is_active: true,
                    address: `${homeTown || ''}, Co. ${homeCounty || ''}`,
                    website: website || '',
                    features: features || [],
                    social_media: {
                        facebook: socialFacebook || null,
                        instagram: socialInstagram || null,
                        linkedin: socialLinkedin || null
                    },
                    slug: user_full_name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `provider-${user_id?.slice(0, 8)}`
                })
                .select()
                .single()

            if (listError) throw listError
            listing = newListing
        } else {
            await supabase
                .from('catalogue_listings')
                .update({
                    phone: phone,
                    company_name: companyName || undefined,
                    address: `${homeTown}, Co. ${homeCounty}`,
                    website: website || '',
                    features: features || []
                })
                .eq('id', listing.id)
        }

        // 3. Category & Location Mapping
        if (listing) {
            const { data: berCat } = await supabase
                .from('catalogue_categories')
                .select('id')
                .ilike('name', '%BER Assessor%')
                .maybeSingle()

            if (berCat) {
                await supabase.from('catalogue_listing_categories').delete().eq('listing_id', listing.id)
                await supabase.from('catalogue_listing_categories').insert({
                    listing_id: listing.id,
                    category_id: berCat.id
                })
            }

            const { data: locData } = await supabase
                .from('catalogue_locations')
                .select('id')
                .eq('name', homeCounty)
                .maybeSingle()

            if (locData) {
                await supabase.from('catalogue_listing_locations').delete().eq('listing_id', listing.id)
                await supabase.from('catalogue_listing_locations').insert({
                    listing_id: listing.id,
                    location_id: locData.id
                })
            }
        }

        // 4. Send Confirmation Email
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1);

        const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const startDateStr = startDate.toLocaleDateString('en-IE', dateOptions);
        const endDateStr = endDate.toLocaleDateString('en-IE', dateOptions);

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded-lg: 1rem;">
                <h1 style="color: #007F00; text-align: center;">Registration Successful!</h1>
                <p>Hello ${user_full_name},</p>
                <p>Congratulations! Your registration as a BER Assessor on The Berman platform is now complete and your membership is active.</p>
                
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 0.5rem; margin: 20px 0;">
                    <h2 style="font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Membership Details</h2>
                    <p><strong>Status:</strong> Active</p>
                    <p><strong>Start Date:</strong> ${startDateStr}</p>
                    <p><strong>Valid Until:</strong> ${endDateStr}</p>
                </div>

                <p>You can now log in to your dashboard to manage your profile and view job notifications.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://theberman.eu/login" style="background-color: #007F00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 0.5rem; font-weight: bold;">Go to Dashboard</a>
                </div>

                <p style="margin-top: 40px; font-size: 0.8rem; color: #6b7280; text-align: center;">
                    If you have any questions, please contact us at hello@theberman.eu
                </p>
            </div>
        `;

        // 4. Send Confirmation Email
        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')!;
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
        const smtpUsername = Deno.env.get('SMTP_USERNAME')!;
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')!;
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'hello@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `The Berman.eu <${smtpFromEnv}>`;

        const client = new CustomSmtpClient();
        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // Fetch admin email from settings or use fallback
            const { data: settings } = await supabase.from('app_settings').select('support_email').single();
            const adminEmail = settings?.support_email || 'hello@theberman.eu';

            await client.send(
                smtpFrom,
                user_email,
                'Registration Successful - Assessor Membership Active',
                emailHtml
            );

            // Email 2: To Admin (Notification)
            const adminEmailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
                    <h1 style="color: #4F46E5; text-align: center;">New Assessor Registration</h1>
                    <p>A new BER Assessor has successfully registered and paid on The Berman.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 0.5rem; margin: 20px 0;">
                        <h2 style="font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Assessor Details</h2>
                        <p><strong>Name:</strong> ${user_full_name}</p>
                        <p><strong>Email:</strong> ${user_email}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>SEAI Number:</strong> ${seaiNumber}</p>
                        <p><strong>Types:</strong> ${assessorTypes.join(', ')}</p>
                    </div>

                    <div style="background-color: #ebf5ff; padding: 15px; border-radius: 0.5rem; margin: 20px 0;">
                        <h2 style="font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Payment Confirmation</h2>
                        <p><strong>Stripe Payment ID:</strong> <code style="background: #fff; padding: 2px 4px; border-radius: 4px;">${paymentIntentId}</code></p>
                        <p><strong>Status:</strong> Paid & Active</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://theberman.eu/admin" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 0.5rem; font-weight: bold;">View in Admin Dashboard</a>
                    </div>
            `;
            await client.send(
                smtpFrom,
                adminEmail,
                `NOTIFICATION: New Assessor Signup - ${user_full_name} `,
                adminEmailHtml
            );

            await client.close();
            console.log(`[confirm - assessor - registration] SUCCESS: Confirmation and Admin notification emails sent`);
        } catch (smtpErr: any) {
            console.error("[confirm-assessor-registration] SMTP ERROR", smtpErr);
        }

        return new Response(
            JSON.stringify({ success: true, message: "Registration confirmed and email sent" }),
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
