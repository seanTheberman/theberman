/// <reference lib="deno.ns" />
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateJobReminderEmail } from "./templates/job-reminder-template.ts";
import { generatePromoHtml } from "./templates/promo-section.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

class CustomSmtpClient {
    private conn: Deno.Conn | null = null;
    private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    private encoder = new TextEncoder();
    private decoder = new TextDecoder();

    async connect(hostname: string, port: number) {
        this.conn = await Deno.connect({ hostname, port });
        this.reader = this.conn.readable.getReader();
        await this.readResponse();
        await this.command("EHLO localhost");

        if (port !== 465) {
            await this.command("STARTTLS");
            if (this.reader) this.reader.releaseLock();
            if (!this.conn) throw new Error("Connection lost during STARTTLS");
            const tlsConn = await Deno.startTls(this.conn, { hostname });
            this.conn = tlsConn;
            this.reader = this.conn.readable.getReader();
            await this.command("EHLO localhost");
        }
    }

    async authenticate(user: string, pass: string) {
        await this.command("AUTH LOGIN");
        await this.command(btoa(user));
        await this.command(btoa(pass));
    }

    async send(from: string, to: string, subject: string, html: string) {
        await this.command(`MAIL FROM:<${from}>`);
        await this.command(`RCPT TO:<${to}>`);
        await this.command("DATA");

        const message = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `Content-Type: text/html; charset=UTF-8`,
            `MIME-Version: 1.0`,
            "",
            html,
            "\r\n."
        ].join("\r\n");

        await this.command(message);
    }

    async close() {
        if (this.conn) {
            try { await this.command("QUIT"); } catch (e) { }
            this.conn.close();
        }
    }

    private async command(cmd: string) {
        await this.conn!.write(this.encoder.encode(cmd + "\r\n"));
        return await this.readResponse();
    }

    private async readResponse() {
        const { value } = await this.reader!.read();
        if (!value) throw new Error("No response from server");
        const response = this.decoder.decode(value);
        if (response.startsWith("4") || response.startsWith("5")) {
            throw new Error(`SMTP Error: ${response}`);
        }
        return response;
    }
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFrom = Deno.env.get('SMTP_FROM') || 'no-reply@theberman.eu';
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL') || 'https://theberman.eu';

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');

        // 1. Fetch all active contractors and their preferences
        const { data: contractors, error: contractorsError } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, preferred_counties, assessor_type')
            .eq('role', 'contractor');

        if (contractorsError) throw contractorsError;

        // 2. Fetch all live assessments
        const { data: assessments, error: assessmentsError } = await supabase
            .from('assessments')
            .select('*')
            .in('status', ['live', 'submitted', 'pending_quote']);

        if (assessmentsError) throw assessmentsError;

        // 3. Fetch all quotes to exclude jobs already quoted for
        const { data: allQuotes, error: quotesError } = await supabase
            .from('quotes')
            .select('assessment_id, created_by');

        if (quotesError) throw quotesError;

        // 4. Fetch Sponsors for Promo Section
        const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).limit(3);
        const promoHtml = generatePromoHtml(sponsors || []);

        const client = new CustomSmtpClient();
        await client.connect(smtpHostname, smtpPort);
        await client.authenticate(smtpUsername, smtpPassword);

        let sentCount = 0;
        console.log(`[INFO] Processing reminders for ${contractors.length} contractors and ${assessments.length} potential jobs.`);

        for (const contractor of contractors) {
            // Filter jobs for this contractor
            const quotedIds = new Set(allQuotes?.filter(q => q.created_by === contractor.id).map(q => q.assessment_id) || []);

            // Start with jobs not already quoted
            let matchingJobs = assessments?.filter(j => !quotedIds.has(j.id)) || [];

            // 1. County filtering
            if (contractor.preferred_counties && contractor.preferred_counties.length > 0) {
                matchingJobs = matchingJobs.filter(job =>
                    contractor.preferred_counties.includes(job.county)
                );
            }

            // 2. Assessor Type filtering (Domestic vs Commercial)
            // Default to 'Domestic Assessor' if none set to ensure they get something
            const assessorType = contractor.assessor_type || 'Domestic Assessor';
            const isDomesticAssessor = assessorType.includes('Domestic');
            const isCommercialAssessor = assessorType.includes('Commercial');

            matchingJobs = matchingJobs.filter(job => {
                // Use the explicit job_type column if available, fallback to property_type heuristics
                const isCommercialJob = job.job_type === 'commercial' ||
                    ['commercial', 'office', 'retail', 'industrial', 'warehouse'].some(type =>
                        job.property_type?.toLowerCase().includes(type)
                    );

                if (isCommercialJob) return isCommercialAssessor;
                // If it's not explicitly commercial, we treat it as domestic
                return isDomesticAssessor;
            });

            if (matchingJobs.length > 0) {
                try {
                    console.log(`[SMTP] Attempting to send ${matchingJobs.length} jobs to ${contractor.email} (Type: ${assessorType})`);
                    const emailHtml = generateJobReminderEmail(contractor.full_name, matchingJobs, promoHtml, websiteUrl);
                    await client.send(smtpFrom, contractor.email, `${matchingJobs.length}x Jobs Still Available to Quote`, emailHtml);
                    console.log(`[SMTP] SUCCESS: Sent reminder to ${contractor.email}`);
                    sentCount++;
                } catch (err) {
                    console.error(`[SMTP ERROR] Failed to send reminder to ${contractor.email}:`, err);
                }
            }
        }

        await client.close();

        return new Response(JSON.stringify({
            success: true,
            message: `Periodic reminders processed. Sent ${sentCount} emails.`
        }), { headers: responseHeaders });

    } catch (err: any) {
        console.error("[GLOBAL ERROR]", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { headers: responseHeaders });
    }
});
