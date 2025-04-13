// Initialize Supabase client
const supabaseUrl = 'http://localhost:3000/api/supabase-url';
const supabaseAnonKey = 'http://localhost:3000/api/supabase-anon-key';

// Create Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Export Supabase client
window.ExpenseeaseSupabase = supabase; 