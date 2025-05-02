import { createClient } from "@supabase/supabase-js";

// Cloud instance

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_URL;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
