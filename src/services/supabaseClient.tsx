import { createClient } from '@supabase/supabase-js'

// Cloud instance

const supabaseUrl = 'https://lctywkbjskclilxtfiux.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdHl3a2Jqc2tjbGlseHRmaXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDk5OTcsImV4cCI6MjA1MTkyNTk5N30.WCW4abo8wTdE0WNad16BJcBYq15D1NLjlhHIyP_Kr0I';

// Local Instance

// const supabaseUrl = 'http://127.0.0.1:54321';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)