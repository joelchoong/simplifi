-- Add missing columns for retirement planning
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_epf_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS age integer DEFAULT 25;