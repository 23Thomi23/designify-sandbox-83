// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lppvelqalxnauzlslfna.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcHZlbHFhbHhuYXV6bHNsZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NjM3MjgsImV4cCI6MjA1NDQzOTcyOH0.3VPfzC6vRIQujMGiJ8o6fS6VqXYGVYZjwuVCDK-SNYU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);