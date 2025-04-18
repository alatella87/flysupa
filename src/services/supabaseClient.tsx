import { createClient } from "@supabase/supabase-js";

// Cloud instance

const supabaseUrl = "https://wrwpeeudwfaxxpgvprme.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyd3BlZXVkd2ZheHhwZ3Zwcm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5ODk3MjksImV4cCI6MjA2MDU2NTcyOX0.fFeL3PM-NEq3XgempijC5FWPCS-R_aiHKcOmz8Wgxuo";

// Local Instance

// const supabaseUrl = 'http://127.0.0.1:54321';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
