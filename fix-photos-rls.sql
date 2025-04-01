-- SQL to fix photos upload permissions

-- Enable RLS on the photos table (if not already enabled)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows only admins to insert new photos
CREATE POLICY "Admin users can upload photos" 
ON photos
FOR INSERT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Allow admins to update photos
CREATE POLICY "Admin users can update photos" 
ON photos
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Allow admins to delete photos
CREATE POLICY "Admin users can delete photos" 
ON photos
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Allow all authenticated users to view photos
CREATE POLICY "Anyone can view photos" 
ON photos
FOR SELECT 
TO authenticated
USING (true);
