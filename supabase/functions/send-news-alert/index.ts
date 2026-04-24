import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
      this.reader.releaseLock();
      this.conn = await Deno.startTls(this.conn, { hostname });
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
      `From: The Berman <${from}>`,
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
      try { await this.command("QUIT"); } catch(e) {}
      this.conn.close();
    }
  }

  private async command(cmd: string) {
    await this.conn!.write(this.encoder.encode(cmd + "\r\n"));
    return await this.readResponse();
  }

  private async readResponse() {
    const { value } = await this.reader!.read();
    if (!value) throw new Error("No response");
    const response = this.decoder.decode(value);
    if (response.startsWith("4") || response.startsWith("5")) {
      throw new Error(`SMTP Error: ${response}`);
    }
    return response;
  }
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { record, old_record } = await req.json()
        
        // Only fire if the article just went live
        const isNowLive = record.is_live === true && (!old_record || old_record.is_live === false);
        if (!isNowLive) {
            return new Response(JSON.stringify({ success: true, message: "Skipped: Not newly live" }), { headers: corsHeaders });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey!);

        // Fetch subscribers
        const { data: subscribers, error: subError } = await supabase
            .from('leads')
            .select('email')
            .in('purpose', ['News Subscription', 'Home Energy Guide']);

        if (subError) throw subError;
        if (!subscribers || subscribers.length === 0) {
            return new Response(JSON.stringify({ success: true, message: "No subscribers found" }), { headers: corsHeaders });
        }

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFrom = Deno.env.get('SMTP_FROM') || 'no-reply@theberman.eu';

        if (smtpHostname && smtpUsername && smtpPassword) {
            const client = new CustomSmtpClient();
            const smtpPort = parseInt(smtpPortStr || '587');
            
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #007F00; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Breaking News</h1>
                    </div>
                    <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                        <img src="${record.image_url}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 25px;" />
                        <h2 style="font-size: 26px; font-weight: 800; line-height: 1.2; margin-bottom: 15px; color: #111;">${record.title}</h2>
                        <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">${record.excerpt}</p>
                        <div style="text-align: center;">
                            <a href="https://theberman.eu/news/${record.id}" style="display: inline-block; background-color: #007F00; color: white; padding: 15px 30px; border-radius: 12px; font-size: 16px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 15px rgba(0,127,0,0.2);">Read Full Story</a>
                        </div>
                    </div>
                    <div style="padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
                        <p>&copy; 2026 The Berman. All rights reserved.</p>
                        <p>You received this because you subscribed to The Berman News Updates.</p>
                    </div>
                </div>
            `;

            for (const sub of subscribers) {
                try {
                    await client.send(smtpFrom, sub.email, `BREAKING: ${record.title}`, emailHtml);
                } catch (sendErr) {
                    console.error(`Failed to send to ${sub.email}:`, sendErr);
                }
            }

            await client.close();
            return new Response(JSON.stringify({ success: true, message: `Sent to ${subscribers.length} subscribers` }), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true, message: "Logged (dev mode)" }), { headers: corsHeaders });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: 'Failed', details: error.message }), { headers: corsHeaders });
    }
})
