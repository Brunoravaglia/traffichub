
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wunfuxyhnxyykzzqtcgu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1bmZ1eHlobnh5eWt6enF0Y2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjM3MzcsImV4cCI6MjA4NjkzOTczN30.K2_mOxvBBwQ4nxcPITW1BIq8v7rduMHBeN7J3-SnWpQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('--- Checking Agencias ---');
    const { data: agencias, error: errAg } = await supabase.from('agencias').select('*');
    console.log('Agencias:', agencias);
    if (errAg) console.error('Error fetching agencias:', errAg);

    console.log('\n--- Checking Gestores for vcd ---');
    const vcd = agencias?.find(a => a.slug === 'vcd');
    if (vcd) {
        const { data: gestores, error: errGes } = await supabase.from('gestores').select('*').eq('agencia_id', vcd.id);
        console.log('Gestores for VCD:', gestores);
        if (errGes) console.error('Error fetching gestores:', errGes);
    } else {
        console.log('Agency "vcd" not found');
    }
}

check();
