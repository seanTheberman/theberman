
/// <reference lib="deno.ns" />
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateDigestEmail } from "./templates/digest-notification.ts";

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
        console.log(`[SMTP] Connecting to ${hostname}:${port}...`);
        this.conn = await Deno.connect({ hostname, port });
        this.reader = this.conn.readable.getReader();
        await this.readResponse();

        await this.command("EHLO localhost");

        if (port !== 465) {
            console.log("[SMTP] Issuing STARTTLS...");
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
            return new Response(JSON.stringify({ success: false, message: 'SMTP credentials missing' }), { headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');

        // 1. Fetch Active Contractors
        const { data: contractors, error: contractorsError } = await supabase
            .from('profiles')
            .select('id, email, full_name, preferred_counties')
            .eq('role', 'contractor')
            .eq('is_active', true);

        if (contractorsError || !contractors) {
            console.error('Failed to fetch contractors:', contractorsError);
            throw new Error('Failed to fetch contractors');
        }

        // 2. Fetch Live Assessments
        const { data: activeJobs, error: jobsError } = await supabase
            .from('assessments')
            .select('id, county, town, property_type, ber_purpose, created_at')
            .in('status', ['live', 'submitted', 'pending_quote']);

        if (jobsError || !activeJobs) {
            console.error('Failed to fetch active jobs:', jobsError);
            throw new Error('Failed to fetch active jobs');
        }

        if (activeJobs.length === 0) {
            return new Response(JSON.stringify({ success: true, message: 'No live jobs available' }), { headers: responseHeaders });
        }

        // 3. Fetch Existing Quotes (to filter out)
        const { data: allQuotes, error: quotesError } = await supabase
            .from('quotes')
            .select('assessment_id, created_by')
            .in('assessment_id', activeJobs.map(j => j.id));

        if (quotesError) {
            console.error('Failed to fetch quotes:', quotesError);
            throw new Error('Failed to fetch existing quotes');
        }

        const contractorQuotes = new Map<string, Set<string>>();
        (allQuotes || []).forEach(q => {
            if (!contractorQuotes.has(q.created_by)) {
                contractorQuotes.set(q.created_by, new Set());
            }
            contractorQuotes.get(q.created_by)!.add(q.assessment_id);
        });

        // 4. Process and Send Emails
        const client = new CustomSmtpClient();
        await client.connect(smtpHostname, smtpPort);
        await client.authenticate(smtpUsername, smtpPassword);

        let emailsSent = 0;

        for (const contractor of contractors) {
            const quotedJobIds = contractorQuotes.get(contractor.id) || new Set();

            const relevantJobs = activeJobs.filter(job => {
                // Check if already quoted
                if (quotedJobIds.has(job.id)) return false;

                // Check location preference. If invalid or empty, return false.
                if (!contractor.preferred_counties || !Array.isArray(contractor.preferred_counties) || contractor.preferred_counties.length === 0) return false;
                return contractor.preferred_counties.includes(job.county);
            });

            if (relevantJobs.length > 0) {
                try {
                    console.log(`Sending digest with ${relevantJobs.length} jobs to ${contractor.email}`);
                    const html = generateDigestEmail(contractor.full_name, relevantJobs, websiteUrl);
                    await client.send(smtpFrom, contractor.email, `${relevantJobs.length}x Jobs Still Available to Quote`, html);
                    emailsSent++;
                } catch (sendErr) {
                    console.error(`Failed to send digest to ${contractor.email}:`, sendErr);
                }
            }
        }

        await client.close();

        return new Response(JSON.stringify({
            success: true,
            message: `Digest sent to ${emailsSent} contractors`,
            details: {
                totalContractors: contractors.length,
                totalActiveJobs: activeJobs.length,
                emailsSent
            }
        }), { headers: responseHeaders });

    } catch (err: any) {
        console.error("[GLOBAL ERROR]", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { headers: responseHeaders });
    }
});