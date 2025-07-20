-- Add remixes field to public_strategies table
ALTER TABLE public.public_strategies 
ADD COLUMN remixes INTEGER DEFAULT 0;

-- Add remixes field to strategies table as well
ALTER TABLE public.strategies 
ADD COLUMN remixes INTEGER DEFAULT 0; 