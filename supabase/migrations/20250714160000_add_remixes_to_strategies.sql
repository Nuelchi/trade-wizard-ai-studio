-- Add remixes field to strategies table
ALTER TABLE public.strategies 
ADD COLUMN remixes INTEGER DEFAULT 0; 