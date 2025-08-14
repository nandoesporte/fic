-- Add image fields to profiles table for cooperative logos
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS coop_image_1 TEXT,
ADD COLUMN IF NOT EXISTS coop_image_2 TEXT,
ADD COLUMN IF NOT EXISTS coop_image_3 TEXT,
ADD COLUMN IF NOT EXISTS coop_image_4 TEXT;