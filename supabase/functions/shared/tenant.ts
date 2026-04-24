// Shared tenant utility for Supabase Edge Functions
// Single source of truth: all SMTP / Twilio creds live in the tenant_configurations table.
// Adding a new tenant = insert a row. No env vars, no code changes.

export async function getTenantConfig(supabase: any, tenant: string) {
    const { data, error } = await supabase
        .from('tenant_configurations')
        .select('*')
        .eq('tenant', tenant)
        .single();

    if (error || !data) {
        console.error(`[tenant] Failed to load config for tenant "${tenant}":`, error);
        throw new Error(`Tenant config not found: ${tenant}`);
    }

    return {
        tenant: data.tenant,
        domain: data.domain,
        display_name: data.display_name,
        smtp_hostname: data.smtp_hostname,
        smtp_port: data.smtp_port || 587,
        smtp_username: data.smtp_username,
        smtp_password: data.smtp_password,
        smtp_from: data.smtp_from || `${data.display_name} <${data.smtp_username}>`,
        twilio_account_sid: data.twilio_account_sid,
        twilio_auth_token: data.twilio_auth_token,
        twilio_messaging_service_sid: data.twilio_messaging_service_sid,
        phone_country_code: data.phone_country_code || '+353',
        website_url: data.website_url || `https://${data.domain}`,
        currency: data.currency,
    };
}
