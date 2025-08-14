-- Add weather_city column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN weather_city TEXT DEFAULT 'São Paulo';