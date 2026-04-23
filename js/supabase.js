// ===== CONFIGURATION SUPABASE =====
const SUPABASE_URL = 'https://edhsddxdbnlojfwuidcb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wewVlZcR2146P5YHeFNC6A_oKeejj6n';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
