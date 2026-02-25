
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aN2P5DuVIXcXZ1h0y9W2lQ_JVS439gz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createJob() {
    console.log("Creating Job in Cavan...");
    const { data, error } = await supabase
        .from('assessments')
        .insert([
            {
                name: "Cavan Test Job",
                email: "test.cavan@example.com",
                phone: "0879999999",
                county: "Cavan",
                town: "Cavan Town",
                address: "456 Mock Road",
                property_type: "house",
                job_type: "domestic",
                status: "live",
                eircode: "H12 X3Y4"
            }
        ])
        .select();

    if (error) {
        console.log("ERROR:", error.message);
        console.log("DETAILS:", error.details);
    } else {
        console.log("SUCCESS! ID:", data[0].id);
    }
}

createJob();
