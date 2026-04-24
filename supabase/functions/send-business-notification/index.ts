// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
}

// Embedded SMTP Client
export class CustomSmtpClient {
    private conn: Deno.Conn | null = null;
    private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    private encoder = new TextEncoder();
    private decoder = new TextDecoder();

    async connect(hostname: string, port: number) {
        console.log(`[SMTP] Connecting to ${hostname}:${port}...`);
        this.conn = await Deno.connect({ hostname, port });
        this.reader = this.conn.readable.getReader();
        await this.readResponse();

        await this.command("EHLO theberman.eu");

        if (port !== 465) {
            console.log("[SMTP] Issuing STARTTLS...");
            await this.command("STARTTLS");
            if (this.reader) this.reader.releaseLock();
            if (!this.conn) throw new Error("Connection lost during STARTTLS");
            const tlsConn = await Deno.startTls(this.conn as any, { hostname });
            this.conn = tlsConn;
            this.reader = this.conn.readable.getReader();
            await this.command("EHLO theberman.eu");
        }
    }

    async authenticate(user: string, pass: string) {
        console.log("[SMTP] Authenticating...");
        await this.command("AUTH LOGIN");
        await this.command(btoa(user));
        await this.command(btoa(pass));
        console.log("[SMTP] Authentication successful.");
    }

    async send(from: string, to: string, subject: string, html: string) {
        const fromEmail = (from.match(/<(.+)>/)?.[1] || from).trim();
        const toEmail = (to.match(/<(.+)>/)?.[1] || to).trim();

        console.log(`[SMTP] Sending MAIL FROM:<${fromEmail}>`);
        await this.command(`MAIL FROM:<${fromEmail}>`);

        console.log(`[SMTP] Sending RCPT TO:<${toEmail}>`);
        await this.command(`RCPT TO:<${toEmail}>`);

        await this.command("DATA");

        const date = new Date().toUTCString();
        const messageId = `<${crypto.randomUUID()}@theberman.eu>`;

        const message = [
            `From: ${from}`,
            `To: ${to}`,
            `Reply-To: ${fromEmail}`,
            `Subject: ${subject}`,
            `Date: ${date}`,
            `Message-ID: ${messageId}`,
            `X-Mailer: The Berman.eu Mailer`,
            `Importance: normal`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=UTF-8`,
            `Auto-Submitted: auto-generated`,
            `X-Entity-Ref-ID: ${crypto.randomUUID()}`,
            "",
            html
        ].join("\r\n");

        console.log(`[SMTP] Headers prepared:\n${message.split('\r\n\r\n')[0]}`);
        console.log(`[SMTP] Writing message body (${message.length} bytes)...`);
        await this.writeAll(this.encoder.encode(message + "\r\n.\r\n"));
        const response = await this.readResponse();
        console.log(`[SMTP] Server response after DATA: ${response.trim()}`);
        console.log("[SMTP] Message data accepted by server");
    }

    private async writeAll(data: Uint8Array) {
        if (!this.conn) throw new Error("SMTP: Not connected");
        let written = 0;
        while (written < data.length) {
            const n = await this.conn.write(data.subarray(written));
            written += n;
        }
    }

    async close() {
        if (this.conn) {
            try { await this.command("QUIT"); } catch (e) { }
            this.conn.close();
            this.conn = null;
            this.reader = null;
        }
    }

    private async command(cmd: string) {
        if (!this.conn) throw new Error("SMTP: Not connected");
        await this.writeAll(this.encoder.encode(cmd + "\r\n"));
        return await this.readResponse();
    }

    private async readResponse() {
        if (!this.reader) throw new Error("SMTP: Reader not initialized");

        let fullResponse = "";
        while (true) {
            const { value } = await this.reader.read();
            if (!value) throw new Error("SMTP: Connection closed by server");

            const chunk = this.decoder.decode(value);
            fullResponse += chunk;

            // In SMTP, a multi-line response lines start with "XYZ-"
            // and the last line starts with "XYZ " (where XYZ is the 3-digit code).
            const lines = fullResponse.split("\r\n");
            // Check the last non-empty line
            const lastLine = lines[lines.length - 1] === "" ? lines[lines.length - 2] : lines[lines.length - 1];

            if (lastLine && /^\d{3} /.test(lastLine)) {
                break;
            }
        }

        if (fullResponse.startsWith("4") || fullResponse.startsWith("5")) {
            console.error(`[SMTP] SERVER ERROR RESPONSE: ${fullResponse}`);
            throw new Error(`SMTP Error: ${fullResponse.substring(0, 500)}`);
        }
        return fullResponse;
    }
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { companyName, email, phone, address, website, catalogueUrl, adminName, registrationAmount } = await req.json();

        if (!email || !companyName) {
            throw new Error("Missing required business details");
        }

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
        const smtpUsername = Deno.env.get('SMTP_USERNAME')
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL')?.replace(/\/$/, '') || 'https://theberman.eu';
        const smtpFrom = `The Berman <${smtpUsername}>`;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            throw new Error('SMTP credentials missing');
        }

        const client = new CustomSmtpClient()
        await client.connect(smtpHostname, smtpPort)
        await client.authenticate(smtpUsername, smtpPassword)

        const subject = `Your Business Has Been Added to The Berman Catalogue!`;
        const isFreeRegistration = registrationAmount === 0 || registrationAmount === undefined;
        const feeText = isFreeRegistration ? 'FREE' : `€${registrationAmount.toFixed(2)}`;

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${websiteUrl}/logo.svg" alt="The Berman" style="height: 40px; filter: grayscale(1) brightness(0.2);">
                </div>
                <h2 style="color: #2e7d32; margin-top: 0; text-align: center; font-size: 24px;">Welcome to The Berman Catalogue!</h2>
                <p style="font-size: 16px; color: #333;">Dear <strong>${companyName}</strong> Team,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Great news! Your business has been successfully added to The Berman Home Energy Catalogue - Ireland's trusted platform for connecting homeowners with verified energy professionals.
                </p>

                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #333;">Your Business Listing Details:</h3>
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Business Name:</strong></td>
                            <td style="padding: 5px 0;">${companyName}</td>
                        </tr>
                        ${email ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Email:</strong></td>
                            <td style="padding: 5px 0;">${email}</td>
                        </tr>` : ''}
                        ${phone ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Phone:</strong></td>
                            <td style="padding: 5px 0;">${phone}</td>
                        </tr>` : ''}
                        ${address ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Address:</strong></td>
                            <td style="padding: 5px 0;">${address}</td>
                        </tr>` : ''}
                        ${website ? `
                        <tr style="vertical-align: top;">
                            <td style="padding: 5px 10px 5px 0;"><strong>Website:</strong></td>
                            <td style="padding: 5px 0;"><a href="${website}" style="color: #2e7d32; text-decoration: none;">${website}</a></td>
                        </tr>` : ''}
                    </table>
                </div>

                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c8e6c9; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #2e7d32;">🎉 Special Registration Offer!</h3>
                    <p style="font-size: 15px; color: #2e7d32; font-weight: bold; margin-bottom: 10px;">
                        Your Business Registration Fee: <span style="font-size: 18px;">${feeText}</span>
                    </p>
                    <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0;">
                        ${isFreeRegistration 
                            ? 'You\'ve been selected for a <strong>FREE business registration</strong>! Create your account today to claim your listing and start receiving customer inquiries.'
                            : `You\'ve been selected for a special registration fee of <strong>€${registrationAmount.toFixed(2)}</strong>. This is a discounted rate exclusively for your business.`}
                    </p>
                </div>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Your listing is now <strong>live and visible</strong> to homeowners across Ireland who are looking for energy upgrade services. This means potential customers can already find and contact you through our platform.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${catalogueUrl}" target="_blank" style="display:inline-block;background-color:#2e7d32;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:18px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        View Your Business Listing
                    </a>
                </div>

                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c8e6c9; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #2e7d32;">🚀 What's Next?</h3>
                    <ul style="font-size: 14px; color: #555; line-height: 1.6; padding-left: 20px;">
                        <li><strong>Review Your Listing:</strong> Check if all details are accurate</li>
                        <li><strong>Claim Your Listing:</strong> Create an account to manage your business profile</li>
                        <li><strong>Receive Inquiries:</strong> Homeowners can contact you directly through the platform</li>
                        <li><strong>Enhance Your Profile:</strong> Add more photos, services, and testimonials</li>
                    </ul>
                </div>

                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    To take full control of your listing, track inquiries, and update your business information, we recommend creating a business account.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${websiteUrl}/signup?role=business" target="_blank" style="display:inline-block;background-color:#1976d2;color:#ffffff;padding:14px 30px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                        Create Business Account
                    </a>
                </div>

                <p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 30px;">
                    This listing was added by <strong>${adminName || 'The Berman Team'}</strong>. If you have any questions or need to update your information, please don't hesitate to contact us.
                </p>

                <p style="color: #888; font-size: 13px; text-align: center; margin-top: 30px;">
                    View your listing:<br>
                    <a href="${catalogueUrl}" style="color: #2e7d32; text-decoration: none; font-size: 11px; word-break: break-all;">${catalogueUrl}</a>
                </p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
                    &copy; ${new Date().getFullYear()} The Berman. Registered in Ireland.<br>
                    Connecting Ireland's homeowners with trusted energy professionals.
                </p>
            </div>
        `;

        await client.send(smtpFrom, email, subject, html)
        await client.close()

        return new Response(
            JSON.stringify({ success: true, message: 'Business notification email sent' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[send-business-notification] ERROR", err.message);
        return new Response(
            JSON.stringify({ success: false, error: err?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})