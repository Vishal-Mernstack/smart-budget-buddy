
-- Bill splits table for splitting expenses with friends
CREATE TABLE public.bill_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  split_with JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  settled BOOLEAN NOT NULL DEFAULT false,
  settled_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.bill_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own splits" ON public.bill_splits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own splits" ON public.bill_splits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own splits" ON public.bill_splits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own splits" ON public.bill_splits FOR DELETE USING (auth.uid() = user_id);
