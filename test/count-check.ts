
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aN2P5DuVIXcXZ1h0y9W2lQ_JVS439gz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    const { count: pcount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: acount } = await supabase.from('assessments').select('*', { count: 'exact', head: true });
    const { count: lcount } = await supabase.from('leads').select('*', { count: 'exact', head: true });

    console.log(`Profiles: ${pcount}`);
    console.log(`Assessments: ${acount}`);
    console.log(`Leads: ${lcount}`);
}

check();
