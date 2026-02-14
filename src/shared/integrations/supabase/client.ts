// This file configures the Supabase client for the application
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_CONFIG } from '@/config/supabase.config';

// Load environment variables with fallback to config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_CONFIG.anonKey;

// Validate that required environment variables are present
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    '❌ Missing Supabase configuration. ' +
    'Please check your environment variables or supabase.config.ts'
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
