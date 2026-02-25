
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aN2P5DuVIXcXZ1h0y9W2lQ_JVS439gz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCron() {
    console.log("Starting Detailed Cron Trigger...");

    const { data, error } = await supabase.functions.invoke('send-job-reminder-cron');

    if (error) {
        console.log(`RESULT: ERROR`);
        console.log("Error object:", JSON.stringify(error, null, 2));
        if (error.context) {
            try {
                const text = await error.context.text();
                console.log("Response Body:", text);
            } catch (e) { }
        }
    } else {
        console.log(`RESULT: SUCCESS - ${JSON.stringify(data)}`);
    }
}

testCron();
