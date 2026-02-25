
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aN2P5DuVIXcXZ1h0y9W2lQ_JVS439gz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCron() {
    console.log("Starting Simple Cron Trigger...");

    const { data: profiles } = await supabase.from('profiles').select('id, role').eq('role', 'contractor');
    const { data: jobs } = await supabase.from('assessments').select('id').in('status', ['live', 'submitted', 'pending_quote']);

    console.log(`STATS: Contractors=${profiles?.length || 0}, Jobs=${jobs?.length || 0}`);

    const { data, error } = await supabase.functions.invoke('send-job-reminder-cron');

    if (error) {
        console.log(`RESULT: ERROR - ${error.message}`);
    } else {
        console.log(`RESULT: SUCCESS - ${JSON.stringify(data)}`);
    }
}

testCron();
