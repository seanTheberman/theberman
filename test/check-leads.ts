
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeHFjYmNncHJ1bGRvZGF4bWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjg4MTksImV4cCI6MjA4NDgwNDgxOX0.PCES_0gQp7JO6DG4ces4qPeCaeA0xGFN0uZFKWvG2CI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLeads() {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('❌ Error fetching leads:', error);
    } else {
        console.log('✅ Recent Leads:');
        console.table(data);
    }
}

checkLeads();
