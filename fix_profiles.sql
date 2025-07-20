-- Fix existing profiles that have email addresses as display names
-- This will convert email addresses to email prefixes

-- First, let's see what we're working with
SELECT id, user_id, display_name, created_at 
FROM profiles 
WHERE display_name LIKE '%@%';

-- Update profiles to use email prefix instead of full email
UPDATE profiles 
SET display_name = SPLIT_PART(display_name, '@', 1)
WHERE display_name LIKE '%@%';

-- Verify the changes
SELECT id, user_id, display_name, created_at 
FROM profiles 
ORDER BY created_at DESC; 