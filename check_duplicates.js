
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wunfuxyhnxyykzzqtcgu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1bmZ1eHlobnh5eWt6enF0Y2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjM3MzcsImV4cCI6MjA4NjkzOTczN30.K2_mOxvBBwQ4nxcPITW1BIq8v7rduMHBeN7J3-SnWpQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('--- Checking ALL Gestores ---');
    const { data: gestores, error } = await supabase.from('gestores').select('id, nome, agencia_id');
    console.log('All Gestores:', gestores);

    const names = {};
    gestores?.forEach(g => {
        if (!names[g.nome]) names[g.nome] = [];
        names[g.nome].push(g);
    });

    console.log('\n--- Duplicates ---');
    Object.keys(names).forEach(name => {
        if (names[name].length > 1) {
            console.log(`Duplicate found: ${name}`, names[name]);
        }
    });
}

check();
