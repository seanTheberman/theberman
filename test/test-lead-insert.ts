
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aN2P5DuVIXcXZ1h0y9W2lQ_JVS439gz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLead() {
    console.log("Testing insert into 'leads'...");
    const { data, error } = await supabase
        .from('leads')
        .insert([{ name: "Test", email: "test@example.com", message: "Hi" }])
        .select();

    if (error) {
        console.log("LEADS ERROR:", error.message);
    } else {
        console.log("LEADS SUCCESS! ID:", data[0].id);
    }
}

testLead();
