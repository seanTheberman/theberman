// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const NEW_PASSWORD = 'Welcome@TheBerman123';
  const CUTOFF_DATE = new Date('2026-03-10T23:59:59Z');

  try {
    // Fetch all users (paginated)
    let allUsers: any[] = [];
    let page = 1;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
      if (error) throw error;
      if (!data.users.length) break;
      allUsers = allUsers.concat(data.users);
      if (data.users.length < 100) break;
      page++;
    }

    // Filter: admin-created users (requires_password_change === true) created after cutoff
    const targets = allUsers.filter(u => {
      const created = new Date(u.created_at);
      return created > CUTOFF_DATE && u.user_metadata?.requires_password_change === true;
    });

    const results: any[] = [];

    for (const u of targets) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(u.id, {
        password: NEW_PASSWORD,
        user_metadata: { ...u.user_metadata, requires_password_change: true },
      });

      results.push({
        email: u.email,
        name: u.user_metadata?.full_name ?? 'N/A',
        created_at: u.created_at,
        status: error ? `FAILED: ${error.message}` : 'OK - Password reset done',
      });
    }

    const success = results.filter(r => r.status.startsWith('OK')).length;
    const failed = results.filter(r => r.status.startsWith('FAILED')).length;

    return new Response(
      JSON.stringify({ total_found: targets.length, success, failed, results }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
