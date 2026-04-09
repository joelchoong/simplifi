-- Financial Memory Layer: History tracking for Net Worth and Tax Records

-- 1. Create Net Worth History Table
CREATE TABLE IF NOT EXISTS public.net_worth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_net_worth NUMERIC NOT NULL DEFAULT 0,
  assets_total NUMERIC NOT NULL DEFAULT 0,
  liabilities_total NUMERIC NOT NULL DEFAULT 0,
  assets_breakdown JSONB DEFAULT '[]'::jsonb,
  liabilities_breakdown JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_net_worth_history_user_date ON public.net_worth_history(user_id, snapshot_date);

-- Enable RLS
ALTER TABLE public.net_worth_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own net worth history" 
ON public.net_worth_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own net worth records" 
ON public.net_worth_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own net worth records" 
ON public.net_worth_history FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own net worth records" 
ON public.net_worth_history FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Create Tax History Table
CREATE TABLE IF NOT EXISTS public.tax_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  gross_annual_income NUMERIC NOT NULL DEFAULT 0,
  total_tax_paid NUMERIC NOT NULL DEFAULT 0,
  total_reliefs_amount NUMERIC NOT NULL DEFAULT 0,
  reliefs_breakdown JSONB DEFAULT '[]'::jsonb,
  effective_tax_rate NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tax_year)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tax_history_user_year ON public.tax_history(user_id, tax_year);

-- Enable RLS
ALTER TABLE public.tax_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tax history" 
ON public.tax_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax records" 
ON public.tax_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax records" 
ON public.tax_history FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax records" 
ON public.tax_history FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Trigger for timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_net_worth_history_updated_at
BEFORE UPDATE ON public.net_worth_history
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_tax_history_updated_at
BEFORE UPDATE ON public.tax_history
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
