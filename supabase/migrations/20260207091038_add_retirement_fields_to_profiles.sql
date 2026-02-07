-- Add retirement planning fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_epf_amount DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT 25;

-- Add comments for documentation
COMMENT ON COLUMN profiles.current_epf_amount IS 'Current EPF (Employees Provident Fund) balance in RM';
COMMENT ON COLUMN profiles.age IS 'User current age for retirement planning calculations';
