
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: agencia } = await supabase.from('agencias').select('*').eq('slug', 'vcd').single();
    console.log('Agency:', agencia);

    if (agencia) {
        const { data: gestores } = await supabase.from('gestores').select('*').eq('agencia_id', agencia.id);
        console.log('Gestores for VCD:', gestores);
    }
}

check();
