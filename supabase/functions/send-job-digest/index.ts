
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

        const body = await req.json().catch(() => ({}));
        let tenants: string[];
        if (body.tenant) {
            tenants = [body.tenant];
        } else {
            const { data: tenantRows } = await supabase
                .from('tenant_configurations')
                .select('tenant')
                .eq('is_active', true);
            tenants = (tenantRows || []).map((r: any) => r.tenant).filter(Boolean);
            if (tenants.length === 0) tenants = ['ireland'];
        }

        // Only include jobs created within the last 15 days
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const norm = (s: any) => (typeof s === 'string' ? s.trim().toLowerCase() : '');

        const perTenantResults: Record<string, { sent: number; skipped: number }> = {};

        for (const tenant of tenants) {
            perTenantResults[tenant] = { sent: 0, skipped: 0 };

            let config;
            try {
                const { getTenantConfig } = await import("../shared/tenant.ts");
                config = await getTenantConfig(supabase, tenant);
            } catch (e: any) {
                console.error(`[send-job-digest] Tenant config load failed for ${tenant}:`, e.message);
                continue;
            }
            const { smtp_hostname: smtpHostname, smtp_port: smtpPort, smtp_username: smtpUsername, smtp_password: smtpPassword, smtp_from: smtpFrom, website_url: websiteUrl } = config;

            if (!smtpHostname || !smtpUsername || !smtpPassword) {
                console.error(`[send-job-digest] SMTP not configured for tenant ${tenant}, skipping.`);
                continue;
            }

            // 1. Only active, fully-onboarded contractors for this tenant
            const { data: contractors, error: contractorsError } = await supabase
                .from('profiles')
                .select('id, email, full_name, preferred_counties, preferred_towns, assessor_type')
                .eq('role', 'contractor')
                .eq('tenant', tenant)
                .eq('is_active', true)
                .is('deleted_at', null)
                .in('registration_status', ['active', 'completed']);

            if (contractorsError || !contractors || contractors.length === 0) {
                console.log(`[send-job-digest] No eligible contractors for tenant ${tenant}.`);
                continue;
            }

            // 2. Only currently LIVE jobs, less than 15 days old, for this tenant
            const { data: activeJobs, error: jobsError } = await supabase
                .from('assessments')
                .select('id, county, town, property_type, job_type, ber_purpose, created_at')
                .eq('tenant', tenant)
                .eq('status', 'live')
                .gte('created_at', fifteenDaysAgo.toISOString());

            if (jobsError || !activeJobs || activeJobs.length === 0) {
                console.log(`[send-job-digest] No live jobs for tenant ${tenant}.`);
                continue;
            }

            // 3. Fetch existing quotes to exclude jobs already quoted by each contractor
            const { data: allQuotes } = await supabase
                .from('quotes')
                .select('assessment_id, created_by')
                .in('assessment_id', activeJobs.map(j => j.id))
                .in('created_by', contractors.map(c => c.id));

            const contractorQuotes = new Map<string, Set<string>>();
            (allQuotes || []).forEach(q => {
                if (!contractorQuotes.has(q.created_by)) {
                    contractorQuotes.set(q.created_by, new Set());
                }
                contractorQuotes.get(q.created_by)!.add(q.assessment_id);
            });

            // 4. Send digest emails
            const client = new CustomSmtpClient();
            try {
                await client.connect(smtpHostname, smtpPort);
                await client.authenticate(smtpUsername, smtpPassword);
            } catch (e: any) {
                console.error(`[send-job-digest] SMTP connect failed for tenant ${tenant}:`, e.message);
                continue;
            }

            for (const contractor of contractors) {
                const quotedJobIds = contractorQuotes.get(contractor.id) || new Set();

                const prefTownsNorm = Array.isArray(contractor.preferred_towns)
                    ? contractor.preferred_towns.map(norm).filter(Boolean)
                    : [];
                const prefCountiesNorm = Array.isArray(contractor.preferred_counties)
                    ? contractor.preferred_counties.map(norm).filter(Boolean)
                    : [];

                if (prefTownsNorm.length === 0 && prefCountiesNorm.length === 0) {
                    perTenantResults[tenant].skipped++;
                    continue;
                }

                const assessorType = contractor.assessor_type || 'Domestic Assessor';
                const isDomesticAssessor = assessorType.includes('Domestic');
                const isCommercialAssessor = assessorType.includes('Commercial');
                const isTechnicalAssessor = assessorType.includes('Technical');

                const relevantJobs = activeJobs.filter(job => {
                    if (quotedJobIds.has(job.id)) return false;

                    // Town match (preferred) or county fallback – case-insensitive
                    const townMatches = prefTownsNorm.length > 0 && norm(job.town)
                        ? prefTownsNorm.includes(norm(job.town))
                        : false;
                    const countyMatches = prefCountiesNorm.length > 0 && norm(job.county)
                        ? prefCountiesNorm.includes(norm(job.county))
                        : false;
                    if (!townMatches && !countyMatches) return false;

                    // Assessor type match
                    const isCommercialJob = job.job_type === 'commercial' ||
                        ['commercial', 'office', 'retail', 'industrial', 'warehouse'].some(type =>
                            (job.property_type || '').toLowerCase().includes(type),
                        );
                    const isTechnicalJob = job.job_type === 'technical';
                    if (isCommercialJob && !isCommercialAssessor) return false;
                    if (isTechnicalJob && !isTechnicalAssessor) return false;
                    if (!isCommercialJob && !isTechnicalJob && !isDomesticAssessor) return false;

                    return true;
                });

                if (relevantJobs.length === 0) {
                    perTenantResults[tenant].skipped++;
                    continue;
                }

                try {
                    console.log(`[send-job-digest] Sending digest with ${relevantJobs.length} jobs to ${contractor.email} (tenant: ${tenant})`);
                    const html = generateDigestEmail(contractor.full_name, relevantJobs, websiteUrl);
                    await client.send(smtpFrom, contractor.email, `${relevantJobs.length}x Jobs Still Available to Quote`, html);
                    perTenantResults[tenant].sent++;
                } catch (sendErr) {
                    console.error(`[send-job-digest] Failed to send digest to ${contractor.email}:`, sendErr);
                }
            }

            await client.close();
            console.log(`[send-job-digest] Tenant ${tenant}: sent=${perTenantResults[tenant].sent}, skipped=${perTenantResults[tenant].skipped}.`);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Digest processed.',
            results: perTenantResults,
        }), { headers: responseHeaders });

    } catch (err: any) {
        console.error("[send-job-digest] GLOBAL ERROR", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { headers: responseHeaders });
    }
});