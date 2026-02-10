
-- Create recurring_transactions table
CREATE TABLE public.recurring_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'expense',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  day_of_month INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_run_date DATE NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month')::date,
  last_run_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring transactions" ON public.recurring_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recurring transactions" ON public.recurring_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring transactions" ON public.recurring_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring transactions" ON public.recurring_transactions FOR DELETE USING (auth.uid() = user_id);
