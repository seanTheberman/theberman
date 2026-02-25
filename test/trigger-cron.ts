
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aN2P5DuVIXcXZ1h0y9W2lQ_JVS439gz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCron() {
    console.log("🔍 Checking Database Readiness...");

    const { data: contractors } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('role', 'contractor');

    console.log(`Found ${contractors?.length || 0} contractors.`);
    if (contractors && contractors.length > 0) {
        contractors.forEach(c => console.log(` - ${c.full_name} (${c.email})`));
    }

    const { data: assessments } = await supabase
        .from('assessments')
        .select('id, status, county')
        .in('status', ['live', 'submitted', 'pending_quote']);

    console.log(`Found ${assessments?.length || 0} live/pending assessments.`);

    console.log("\n🚀 Triggering 'send-job-reminder-cron'...");

    const { data, error } = await supabase.functions.invoke('send-job-reminder-cron', {
        body: {}
    });

    if (error) {
        console.error('❌ Function Invocation Failed:', error);
    } else {
        console.log('✅ Function Response:', data);
    }
}

testCron();
