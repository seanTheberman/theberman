// @ts-nocheck
// Passwordless login for homeowners/buyers.
//   action=send   { identifier (email|phone), tenant }  -> SMS (fallback email) a 6-digit code
//   action=verify { identifier, code, tenant }          -> returns { token_hash } for supabase.auth.verifyOtp({ type:'magiclink' })
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { trySendSms, formatPhoneE164 } from "../shared/twilio.ts";
import { getLang, pick } from "../shared/lang.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 4;
const SEND_WINDOW_MS = 15 * 60 * 1000;
const ALLOWED_ROLES = ['homeowner', 'user'];

const digitsOnly = (s: string) => (s || '').replace(/\D/g, '');

async function findHomeowner(supabase: any, identifier: string, tenant: string, countryCode: string) {
    const id = identifier.trim();
    if (id.includes('@')) {
        const { data } = await supabase
            .from('profiles')
            .select('id, email, phone, full_name, role, tenant')
            .ilike('email', id)
            .eq('tenant', tenant)
            .is('deleted_at', null)
            .in('role', ALLOWED_ROLES)
            .limit(1)
            .maybeSingle();
        return data;
    }
    // Phone: compare on normalised E.164 and on trailing digits (handles 087..., +353 87..., 353 87...)
    const e164 = formatPhoneE164(id, countryCode);
    const tail = digitsOnly(id).slice(-9);
    if (!tail || tail.length < 7) return null;
    const { data: candidates } = await supabase
        .from('profiles')
        .select('id, email, phone, full_name, role, tenant')
        .eq('tenant', tenant)
        .is('deleted_at', null)
        .in('role', ALLOWED_ROLES)
        .not('phone', 'is', null)
        .ilike('phone', `%${tail.slice(-6)}%`)
        .limit(25);
    for (const c of candidates || []) {
        const cDigits = digitsOnly(c.phone);
        if (cDigits.endsWith(tail)) return c;
        if (e164 && formatPhoneE164(c.phone, countryCode) === e164) return c;
    }
    return null;
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
    const fail = (error: string, status = 400) =>
        new Response(JSON.stringify({ success: false, error }), { status, headers: responseHeaders });

    try {
        const { action, identifier, code, tenant = 'ireland' } = await req.json();
        if (!identifier || typeof identifier !== 'string') return fail('identifier_required');

        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const config = await getTenantConfig(supabase, tenant);
        const lang = getLang(tenant);
        const countryCode = config.phone_country_code || '+353';

        const profile = await findHomeowner(supabase, identifier, tenant, countryCode);

        if (action === 'send') {
            // Always respond success to avoid account enumeration; only actually send when a match exists.
            if (!profile?.email) {
                console.warn(`[otp-login] No homeowner match for identifier (tenant ${tenant})`);
                return new Response(JSON.stringify({ success: true, channel: 'none' }), { headers: responseHeaders });
            }
            const email = profile.email.toLowerCase();

            const since = new Date(Date.now() - SEND_WINDOW_MS).toISOString();
            const { count } = await supabase
                .from('email_otps')
                .select('id', { count: 'exact', head: true })
                .eq('email', email)
                .gte('created_at', since);
            if ((count || 0) >= MAX_SENDS_PER_WINDOW) return fail('too_many_requests', 429);

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const { error: dbError } = await supabase.from('email_otps').insert({
                email, code: otp, expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
            });
            if (dbError) throw dbError;

            const brand = config.display_name;
            const smsText = pick(lang, {
                en: `${otp} is your ${brand} login code. It expires in 10 minutes.`,
                es: `${otp} es tu código de acceso de ${brand}. Caduca en 10 minutos.`,
                pt: `${otp} é o seu código de acesso ${brand}. Expira em 10 minutos.`,
                fr: `${otp} est votre code de connexion ${brand}. Il expire dans 10 minutes.`,
            });

            let channel = 'none';
            if (profile.phone) {
                const ok = await trySendSms(profile.phone, smsText, countryCode, config.twilio_account_sid, config.twilio_auth_token, config.twilio_messaging_service_sid);
                if (ok) channel = 'sms';
            }
            if (channel === 'none' && config.smtp_hostname && config.smtp_username && config.smtp_password) {
                const client = new CustomSmtpClient(config.domain);
                try {
                    await client.connect(config.smtp_hostname, config.smtp_port);
                    await client.authenticate(config.smtp_username, config.smtp_password);
                    const subject = pick(lang, { en: `Your ${brand} login code`, es: `Tu código de acceso de ${brand}`, pt: `O seu código de acesso ${brand}`, fr: `Votre code de connexion ${brand}` });
                    const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;text-align:center">
                        <h2 style="color:#007F00;margin:0 0 16px">${brand}</h2>
                        <p style="color:#444">${pick(lang, { en: 'Use this code to sign in. It expires in 10 minutes.', es: 'Usa este código para iniciar sesión. Caduca en 10 minutos.', pt: 'Use este código para iniciar sessão. Expira em 10 minutos.', fr: 'Utilisez ce code pour vous connecter. Il expire dans 10 minutes.' })}</p>
                        <div style="font-family:monospace;font-size:40px;font-weight:bold;letter-spacing:10px;color:#007F00;background:#f0fdf4;border:1px solid #dcfce7;border-radius:8px;padding:20px;display:inline-block">${otp}</div>
                    </div>`;
                    await client.send(config.smtp_from || config.smtp_username, email, subject, html);
                    channel = 'email';
                } catch (e) {
                    console.error('[otp-login] email fallback failed:', e?.message);
                } finally {
                    try { await client.close(); } catch { /* noop */ }
                }
            }
            console.log(`[otp-login] code sent via ${channel} for ${profile.id} (tenant ${tenant})`);
            // Masked hints so the UI can say "sent to ***1234"
            const phoneHint = profile.phone ? digitsOnly(profile.phone).slice(-4) : null;
            const emailHint = email.replace(/^(.).*(@.*)$/, '$1***$2');
            return new Response(JSON.stringify({ success: true, channel, phoneHint, emailHint }), { headers: responseHeaders });
        }

        if (action === 'verify') {
            if (!code) return fail('code_required');
            if (!profile?.email) return fail('invalid_code');
            const email = profile.email.toLowerCase();

            const { data: otpRow } = await supabase
                .from('email_otps')
                .select('id, code, expires_at')
                .eq('email', email)
                .eq('verified', false)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!otpRow) return fail('invalid_code');
            if (new Date(otpRow.expires_at).getTime() < Date.now()) return fail('code_expired');
            if (otpRow.code !== String(code).trim()) return fail('invalid_code');

            await supabase.from('email_otps').update({ verified: true }).eq('id', otpRow.id);

            // Ensure the auth user is confirmed first — updating the user after generateLink invalidates the token.
            await supabase.auth.admin.updateUserById(profile.id, { email_confirm: true }).catch(() => { /* noop */ });

            // Mint a one-time magic-link token the client exchanges for a session (no email is sent by generateLink).
            const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({ type: 'magiclink', email });
            if (linkError || !linkData?.properties?.hashed_token) {
                console.error('[otp-login] generateLink failed:', linkError?.message);
                return fail('session_failed', 500);
            }

            return new Response(JSON.stringify({ success: true, token_hash: linkData.properties.hashed_token, email }), { headers: responseHeaders });
        }

        return fail('invalid_action');
    } catch (err: any) {
        console.error('[otp-login] ERROR', err);
        return fail(err?.message || 'internal_error', 500);
    }
});
