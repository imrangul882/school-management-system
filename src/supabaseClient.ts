import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://jwgoeminmlrogjizbomv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Z29lbWlubWxyb2dqaXpib212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTg5ODIsImV4cCI6MjEwNDI3NDk4Mn0.VuBBjQ5olPgIECAR17Demy18D69qDWtGKIEC-oH5z0M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);