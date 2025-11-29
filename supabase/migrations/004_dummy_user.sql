-- Create a dummy user for development
-- Run this in Supabase SQL Editor

INSERT INTO public.users (id, email, name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'dev@aptosflow.local',
  'Development User',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
