
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

        await this.command("EHLO localhost");

        if (port !== 465) {
            console.log("[SMTP] Issuing STARTTLS...");
            await this.command("STARTTLS");
            if (this.reader) this.reader.releaseLock();
            if (!this.conn) throw new Error("Connection lost during STARTTLS");
            const tlsConn = await Deno.startTls(this.conn as any, { hostname });
            this.conn = tlsConn;
            this.reader = this.conn.readable.getReader();
            await this.command("EHLO localhost");
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
        console.log(`[SMTP] Sending MAIL FROM:<${from}>`);
        await this.command(`MAIL FROM:<${from.match(/<(.+)>/)?.[1] || from}>`);

        console.log(`[SMTP] Sending RCPT TO:<${to}>`);
        await this.command(`RCPT TO:<${to.match(/<(.+)>/)?.[1] || to}>`);

        await this.command("DATA");

        const date = new Date().toUTCString();
        const messageId = `<${crypto.randomUUID()}@theberman.eu>`;

        const message = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `Date: ${date}`,
            `Message-ID: ${messageId}`,
            `Content-Type: text/html; charset=UTF-8`,
            `MIME-Version: 1.0`,
            "",
            html,
            "\r\n."
        ].join("\r\n");

        console.log(`[SMTP] Writing message body (${message.length} bytes)...`);
        await this.writeAll(this.encoder.encode(message + "\r\n"));
        await this.readResponse();
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
            throw new Error(`SMTP Error: ${fullResponse.substring(0, 500)}`);
        }
        return fullResponse;
    }
}
