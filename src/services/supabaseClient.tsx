import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lctywkbjskclilxtfiux.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdHl3a2Jqc2tjbGlseHRmaXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDk5OTcsImV4cCI6MjA1MTkyNTk5N30.WCW4abo8wTdE0WNad16BJcBYq15D1NLjlhHIyP_Kr0I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)