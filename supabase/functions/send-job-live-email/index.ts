/// <reference lib="deno.ns" />
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateContractorEmail } from "./templates/contractor-notification.ts";
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
        const { email, customerName, county, town, assessmentId, jobType } = await req.json();
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Update assessment status
        if (assessmentId) {
            await supabase.from('assessments').update({ status: 'live' }).eq('id', assessmentId);
        }

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFrom = Deno.env.get('SMTP_FROM') || 'no-reply@theberman.eu';
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL') || 'https://theberman.eu';

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            return new Response(JSON.stringify({ success: true, message: 'Job is live! (Email skipped: Secrets missing)' }), { headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');
        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // 1. Fetch Sponsors for Promo Section
            const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).limit(3);
            const promoHtml = generatePromoHtml(sponsors || []);

            // 2. Notify Customer (Optional/Non-blocking)
            try {
                const customerHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                      <h2 style="color: #007F00;">Your BER job is live!</h2>
                      <p>Hi ${customerName},</p>
                      <p>Assessors in <strong>${county}</strong> have been notified of your request.</p>
                      <p>We'll notify you when your first quote arrives.</p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      ${promoHtml}
                    </div>
                `;
                await client.send(smtpFrom, email, 'Your job is live on TheBerman.eu', customerHtml);
                console.log(`[SMTP] Notified customer: ${email}`);
            } catch (custErr) {
                console.error(`[SMTP ERROR] Failed to notify customer ${email}:`, custErr);
            }

            // 3. Notify Relevant Contractors
            // First, get list of contractors who have already quoted
            const { data: existingQuotes } = await supabase
                .from('quotes')
                .select('created_by')
                .eq('assessment_id', assessmentId);

            const quotedContractorIds = new Set((existingQuotes || []).map(q => q.created_by));

            const { data: contractors } = await supabase
                .from('profiles')
                .select('id, email, full_name, preferred_counties')
                .eq('role', 'contractor')
                .eq('is_active', true);

            if (contractors && contractors.length > 0) {
                // Filter by county AND check if they haven't quoted yet
                const relevantContractors = contractors.filter(c => {
                    // 1. Check if they already quoted
                    if (quotedContractorIds.has(c.id)) return false;

                    // 2. Check location preference
                    if (!c.preferred_counties || c.preferred_counties.length === 0) return true; // Notify if no preference set
                    return c.preferred_counties.includes(county);
                });

                console.log(`[INFO] Job in ${county}. Notifying ${relevantContractors.length} relevant contractors out of ${contractors.length} total. Excluded ${quotedContractorIds.size} who already quoted.`);

                for (const contractor of relevantContractors) {
                    try {
                        const contractorHtml = generateContractorEmail(county, town, contractor.full_name, promoHtml, websiteUrl, jobType);
                        await client.send(smtpFrom, contractor.email, `New ${jobType === 'commercial' ? 'Commercial' : 'Domestic'} BER Job in ${town || county}`, contractorHtml);
                        console.log(`[SMTP] Notified contractor: ${contractor.email}`);
                    } catch (err) {
                        console.error(`[SMTP ERROR] Failed to notify contractor ${contractor.email}:`, err);
                    }
                }
            }

            await client.close();
            return new Response(JSON.stringify({ success: true, message: 'Process completed' }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error("[SMTP GLOBAL ERROR]", smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Connection Failed', details: smtpErr?.message }), { headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[GLOBAL ERROR]", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { headers: responseHeaders });
    }
});
