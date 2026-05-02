import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function formatPhoneE164(phone: string): string | null {
    if (!phone) return null;
    const digits = phone.replace(/[^\d+]/g, '');
    if (digits.startsWith('+') && digits.length >= 10) return digits;
    if (digits.startsWith('08') && digits.length === 10) return '+353' + digits.substring(1);
    if (digits.startsWith('353') && digits.length >= 11) return '+' + digits;
    if (digits.length >= 10 && !digits.startsWith('+')) return '+' + digits;
    return null;
}

async function trySendSms(phone: string | null | undefined, message: string): Promise<boolean> {
    if (!phone) return false;
    const formatted = formatPhoneE164(phone);
    if (!formatted) return false;
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const messagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
    if (!accountSid || !authToken || !messagingServiceSid) return false;
    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append('To', formatted);
        formData.append('MessagingServiceSid', messagingServiceSid);
        formData.append('Body', message);
        const credentials = btoa(`${accountSid}:${authToken}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });
        const result = await response.json();
        if (response.ok) { console.log(`SMS sent to ${formatted}`); return true; }
        else { console.error(`SMS failed:`, result.message); return false; }
    } catch (err) { console.error(`SMS error:`, err); return false; }
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const { email, customerName, county, town, assessmentId, customerPhone } = await req.json();
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL') || 'https://theberman.eu';

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
            smsSent = await trySendSms(smsPhone, `Hi ${customerName}, your BER assessment request in ${town || county} is now live on TheBerman.eu!`);
        }

        for (const c of relevant) {
            if (c.phone) {
                const loc = town || county;
                const name = c.full_name || 'Assessor';
                const link = `${websiteUrl}/quote/${assessmentId}?phone=${encodeURIComponent(c.phone)}`;
                await trySendSms(c.phone, `Hi ${name}, new job in ${loc}! Quote here: ${link}`);
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
