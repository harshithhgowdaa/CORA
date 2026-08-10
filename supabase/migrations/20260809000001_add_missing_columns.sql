-- Add missing columns to companies table
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'Prospect',
  ADD COLUMN IF NOT EXISTS notes text;

-- Add missing columns to contacts table
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS linkedin text;

-- Add author_id alias (interactions uses author_id not author)
-- Ensure interactions has correct columns
ALTER TABLE public.interactions
  ADD COLUMN IF NOT EXISTS outcome text;
