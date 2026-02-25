
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aN2P5DuVIXcXZ1h0y9W2lQ_JVS439gz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    console.log("--- TABLE: profiles ---");
    const { data: p, error: pe } = await supabase.from('profiles').select('*').limit(5);
    console.log(pe ? `Error: ${pe.message}` : `Count: ${p?.length}`);
    if (p) console.log(JSON.stringify(p, null, 2));

    console.log("\n--- TABLE: assessments ---");
    const { data: a, error: ae } = await supabase.from('assessments').select('*').limit(5);
    console.log(ae ? `Error: ${ae.message}` : `Count: ${a?.length}`);
    if (a) console.log(JSON.stringify(a, null, 2));
}

check();
