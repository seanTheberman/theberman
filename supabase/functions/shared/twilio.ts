// Shared Twilio SMS client for Supabase Edge Functions
// Uses Twilio Messaging Service ("My New Notifications Service")

export class TwilioSmsClient {
    private accountSid: string;
    private authToken: string;
    private messagingServiceSid: string;

    constructor(accountSid: string, authToken: string, messagingServiceSid: string) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.messagingServiceSid = messagingServiceSid;
    }

    async send(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

        const formData = new URLSearchParams();
        formData.append('To', to);
        formData.append('MessagingServiceSid', this.messagingServiceSid);
        formData.append('Body', body);

        const credentials = btoa(`${this.accountSid}:${this.authToken}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        const result = await response.json();

        if (response.ok) {
            console.log(`[Twilio] SMS sent to ${to} — SID: ${result.sid}`);
            return { success: true, sid: result.sid };
        } else {
            console.error(`[Twilio] Failed to send SMS to ${to}:`, result.message || result);
            return { success: false, error: result.message || 'Unknown Twilio error' };
        }
    }
}

/** Create a TwilioSmsClient from environment variables. Returns null if config is missing. */
export function createTwilioClient(): TwilioSmsClient | null {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const messagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');

    if (!accountSid || !authToken || !messagingServiceSid) {
        console.warn('[Twilio] Missing env vars (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID). SMS disabled.');
        return null;
    }

    return new TwilioSmsClient(accountSid, authToken, messagingServiceSid);
}

/** Format Irish phone numbers to E.164. Returns null if invalid. */
export function formatPhoneE164(phone: string): string | null {
    if (!phone) return null;

    // Strip all non-digit characters
    let digits = phone.replace(/[^\d+]/g, '');

    // Already E.164
    if (digits.startsWith('+') && digits.length >= 10) return digits;

    // Irish numbers: 08x... → +3538x...
    if (digits.startsWith('08') && digits.length === 10) {
        return '+353' + digits.substring(1);
    }

    // Irish numbers without leading 0: 3538x...
    if (digits.startsWith('353') && digits.length >= 11) {
        return '+' + digits;
    }

    // US/International numbers starting with country code
    if (digits.length >= 10 && !digits.startsWith('+')) {
        return '+' + digits;
    }

    return null;
}

/** Send SMS if Twilio is configured and phone is valid. Returns true on success, false on failure/skip. */
export async function trySendSms(phone: string | null | undefined, message: string): Promise<boolean> {
    if (!phone) return false;

    const formatted = formatPhoneE164(phone);
    if (!formatted) {
        console.warn(`[Twilio] Invalid phone number: ${phone}`);
        return false;
    }

    const client = createTwilioClient();
    if (!client) return false;

    try {
        const result = await client.send(formatted, message);
        return result.success;
    } catch (err) {
        console.error(`[Twilio] SMS send error:`, err);
        return false;
    }
}
