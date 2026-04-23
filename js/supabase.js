// ===== CONFIGURATION SUPABASE =====
const SUPABASE_URL = 'https://edhsddxdbnlojfwuidcb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9pWrEJQ4AqX4VsdVKzjwYg_CS4C8-2f';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
