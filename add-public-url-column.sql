-- Add public_url column to photos table
ALTER TABLE photos
ADD COLUMN public_url TEXT;

-- Update existing photos to populate the public_url column
UPDATE photos
SET public_url = image
WHERE public_url IS NULL AND image IS NOT NULL;

-- Add a comment to the column
COMMENT ON COLUMN photos.public_url IS 'Permanent public URL for the photo in Supabase Storage'; 