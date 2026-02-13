
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS housing_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS household_type text DEFAULT 'alone',
  ADD COLUMN IF NOT EXISTS dependants integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS location text DEFAULT 'kl',
  ADD COLUMN IF NOT EXISTS expense_food numeric DEFAULT 1500,
  ADD COLUMN IF NOT EXISTS expense_transport numeric DEFAULT 600,
  ADD COLUMN IF NOT EXISTS expense_utilities numeric DEFAULT 300,
  ADD COLUMN IF NOT EXISTS expense_others numeric DEFAULT 100;
