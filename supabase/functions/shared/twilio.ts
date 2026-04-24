// @ts-nocheck
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
export function createTwilioClient(accountSid?: string, authToken?: string, messagingServiceSid?: string): TwilioSmsClient | null {
    const sid = accountSid || Deno.env.get('TWILIO_ACCOUNT_SID');
    const token = authToken || Deno.env.get('TWILIO_AUTH_TOKEN');
    const mgSid = messagingServiceSid || Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');

    if (!sid || !token || !mgSid) {
        console.warn('[Twilio] Missing credentials. SMS disabled.');
        return null;
    }

    return new TwilioSmsClient(sid, token, mgSid);
}

/** Format phone numbers to E.164. Returns null if invalid.
 *  @param phone - raw phone string
 *  @param countryCode - e.g. '+353' for Ireland, '+34' for Spain
 */
export function formatPhoneE164(phone: string, countryCode: string = '+353'): string | null {
    if (!phone) return null;

    // Strip all non-digit characters except leading +
    let digits = phone.replace(/[^\d+]/g, '');

    // Already E.164
    if (digits.startsWith('+') && digits.length >= 10) return digits;

    // Remove leading + if present (we'll add country code)
    if (digits.startsWith('+')) digits = digits.substring(1);

    // If starts with country code already (without +)
    const ccWithoutPlus = countryCode.replace('+', '');
    if (digits.startsWith(ccWithoutPlus)) {
        return '+' + digits;
    }

    // Handle local format: Irish 08x... → +3538x..., Spanish 6xx... → +346xx...
    // Strip leading 0 for most countries when adding country code
    if (digits.startsWith('0') && digits.length >= 9) {
        return countryCode + digits.substring(1);
    }

    // Fallback: just prepend country code
    if (digits.length >= 9) {
        return countryCode + digits;
    }

    return null;
}

/** Send SMS if Twilio is configured and phone is valid.
 *  @param phoneCountryCode - e.g. '+353' or '+34' for tenant-specific formatting
 */
export async function trySendSms(
    phone: string | null | undefined,
    message: string,
    phoneCountryCode?: string,
    twilioAccountSid?: string,
    twilioAuthToken?: string,
    twilioMessagingServiceSid?: string
): Promise<boolean> {
    if (!phone) return false;

    const formatted = formatPhoneE164(phone, phoneCountryCode || '+353');
    if (!formatted) {
        console.warn(`[Twilio] Invalid phone number: ${phone}`);
        return false;
    }

    const client = createTwilioClient(twilioAccountSid, twilioAuthToken, twilioMessagingServiceSid);
    if (!client) return false;

    try {
        const result = await client.send(formatted, message);
        return result.success;
    } catch (err) {
        console.error(`[Twilio] SMS send error:`, err);
        return false;
    }
}
