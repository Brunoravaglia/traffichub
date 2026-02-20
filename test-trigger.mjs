import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function checkTriggers() {
  const { data, error } = await supabase.rpc('get_triggers');
  if (error) {
    console.log("No RPC or error:", error);
  } else {
    console.log("Triggers:", data);
  }
}
checkTriggers();
