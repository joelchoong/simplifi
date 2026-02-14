/**
 * Supabase Public Configuration
 * 
 * These values are safe to commit to GitHub because:
 * 1. The anon/publishable key is designed to be public
 * 2. Row Level Security (RLS) policies protect your data
 * 3. The URL is publicly visible anyway in network requests
 * 
 * For local development, use .env file to override these values.
 */

export const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || "https://kcddiucedwlnlhfibuss.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZGRpdWNlZHdsbmxoZmlidXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzcyNDgsImV4cCI6MjA4NTk1MzI0OH0.ZlXlLH_TOlDJjVAdtkgCsEBv0WF-1MTa0xVQs0kiYbo",
};
