import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getTenantConfig } from "../shared/tenant.ts";
import { trySendSms } from "../shared/twilio.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPIRY_DAYS = 7;
const OPEN_JOB_STATUSES = ['live', 'submitted', 'pending_quote'];

const getLastActivityTime = (assessment: any, quotes: any[] = []) => {
    let latest = new Date(assessment.created_at).getTime();

    for (const quote of quotes) {
        const quoteTime = new Date(quote.created_at).getTime();
        if (quoteTime > latest) latest = quoteTime;
    }

    if (assessment.scheduled_date) {
        const scheduledTime = new Date(assessment.scheduled_date).getTime();
        if (scheduledTime > latest) latest = scheduledTime;
    }

    return latest;
};

const isExpiredAssessment = (assessment: any, quotes: any[] = []) => {
    const daysSinceActivity = Math.floor((Date.now() - getLastActivityTime(assessment, quotes)) / (1000 * 60 * 60 * 24));
    return daysSinceActivity >= EXPIRY_DAYS;
};


Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const { email, customerName, county, town, assessmentId, customerPhone, tenant = 'ireland' } = await req.json();
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, tenant);
        const websiteUrl = (config.website_url || 'https://theberman.eu').replace(/\/$/, '');

        let smsSent = false;

        const { data: assessment } = await supabase
            .from('assessments')
            .select('id, status, created_at, scheduled_date, completed_at')
            .eq('id', assessmentId)
            .maybeSingle();

        if (!assessment || assessment.completed_at || !OPEN_JOB_STATUSES.includes(assessment.status)) {
            return new Response(
                JSON.stringify({ success: true, skipped: true, reason: 'not_open', assessmentId, status: assessment?.status }),
                { headers: responseHeaders },
            );
        }

        const { data: existingQuotes } = await supabase.from('quotes').select('created_by, created_at, status').eq('assessment_id', assessmentId);
        if (isExpiredAssessment(assessment, existingQuotes || [])) {
            return new Response(
                JSON.stringify({ success: true, skipped: true, reason: 'expired', assessmentId }),
                { headers: responseHeaders },
            );
        }

        const quotedIds = new Set((existingQuotes || []).map((q: any) => q.created_by));

        const { data: contractors } = await supabase
            .from('profiles')
            .select('id, email, full_name, phone, preferred_counties')
            .eq('role', 'contractor')
            .eq('is_active', true)
            .is('deleted_at', null)
            .in('registration_status', ['active', 'completed']);

        const relevant = (contractors || []).filter((c: any) => {
            if (quotedIds.has(c.id)) return false;
            if (!c.preferred_counties || c.preferred_counties.length === 0) return true;
            return c.preferred_counties.includes(county);
        });

        console.log(`Notifying ${relevant.length} contractors for ${county}`);

        const { data: asmnt } = await supabase.from('assessments').select('contact_phone').eq('id', assessmentId).single();
        const smsPhone = customerPhone || asmnt?.contact_phone || null;
        if (smsPhone) {
            smsSent = await trySendSms(smsPhone, `Hi ${customerName}, your BER assessment request in ${town || county} is now live on ${websiteUrl.replace('https://', '')}!`, config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);
        }

        for (const c of relevant) {
            if (c.phone) {
                const loc = town || county;
                const name = c.full_name || 'Assessor';
                const link = `${websiteUrl}/quote/${assessmentId}?phone=${encodeURIComponent(c.phone)}`;
                await trySendSms(c.phone, `Hi ${name}, new job in ${loc}! Quote here: ${link}`, config.phone_country_code, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);
            }
        }

        if (assessmentId) {
            await supabase.from('assessments').update({
                job_live_sms_sent: smsSent,
                job_live_notified_at: new Date().toISOString(),
            }).eq('id', assessmentId);
        }

        return new Response(JSON.stringify({ success: true, smsSent }), { headers: responseHeaders });

    } catch (err: any) {
        console.error("ERROR", err);
        return new Response(JSON.stringify({ success: false, error: err?.message }), { status: 400, headers: responseHeaders });
    }
});
