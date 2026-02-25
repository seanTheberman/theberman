
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aN2P5DuVIXcXZ1h0y9W2lQ_JVS439gz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkData() {
    const { data: contractors } = await supabase
        .from('profiles')
        .select('id, email, full_name, preferred_counties, assessor_type')
        .eq('role', 'contractor');

    const { data: assessments } = await supabase
        .from('assessments')
        .select('id, town, county, status, job_type')
        .in('status', ['live', 'submitted', 'pending_quote']);

    const { data: quotes } = await supabase
        .from('quotes')
        .select('assessment_id, created_by');

    console.log("DATA_DUMP_START");
    console.log(JSON.stringify({ contractors, assessments, quotesCount: quotes?.length || 0 }, null, 2));
    console.log("DATA_DUMP_END");
}

checkData();
