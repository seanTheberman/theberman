
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aN2P5DuVIXcXZ1h0y9W2lQ_JVS439gz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createDummyJob() {
    console.log("🚀 Creating Dummy Job for Cron Test...");

    // Create a job in Dublin since we saw a contractor with Dublin in their preferred_counties
    const { data, error } = await supabase
        .from('assessments')
        .insert([
            {
                name: "Test Cron Job",
                email: "test.user@example.com",
                phone: "0871234567",
                county: "Dublin",
                town: "Dublin City",
                address: "123 Test Street",
                property_type: "house",
                job_type: "domestic",
                status: "live",
                eircode: "D01 A1B2"
            }
        ])
        .select();

    if (error) {
        console.error("❌ Error creating dummy job:", error);
    } else {
        console.log("✅ Dummy Job created:", data[0].id);
    }
}

createDummyJob();
