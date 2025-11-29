-- Fix the foreign key constraint issue
-- Run this in Supabase SQL Editor

-- Step 1: Drop the foreign key constraint
ALTER TABLE public.workflows DROP CONSTRAINT IF EXISTS workflows_user_id_fkey;

-- Step 2: Make user_id nullable
ALTER TABLE public.workflows ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Optionally, add back a less strict constraint that allows NULL
-- (This step is optional - uncomment if you want to re-add the constraint later)
-- ALTER TABLE public.workflows 
--   ADD CONSTRAINT workflows_user_id_fkey 
--   FOREIGN KEY (user_id) 
--   REFERENCES public.users(id) 
--   ON DELETE SET NULL;
