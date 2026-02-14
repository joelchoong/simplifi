// This file configures the Supabase client for the application
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Load environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validate that required environment variables are present
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    '❌ Missing Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are defined in your .env file. ' +
    'See .env.example for reference.'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/shared/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
