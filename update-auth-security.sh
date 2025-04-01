#!/bin/bash

# Script to update routes and layouts to use supabase.auth.getUser() instead of getSession()
# This script updates files to improve security of authentication

echo "🔐 Updating files to use more secure authentication method..."

# Function to update a file
update_file() {
  local file=$1
  echo "Processing $file"
  
  # Check if the file contains auth.getSession() code
  if grep -q "auth.getSession" "$file"; then
    # Create a backup
    cp "$file" "${file}.bak"
    
    # Replace getSession pattern with getUser pattern
    sed -i '' 's/data: { session },/data: { user },/g' "$file"
    sed -i '' 's/await supabase.auth.getSession()/await supabase.auth.getUser()/g' "$file"
    sed -i '' 's/if (!session)/if (!user)/g' "$file"
    sed -i '' 's/session.user.id/user.id/g' "$file"
    sed -i '' 's/session.user?.id/user?.id/g' "$file"
    sed -i '' 's/session?.user?.id/user?.id/g' "$file"
    sed -i '' 's/session?.user?.email/user?.email/g' "$file"
    
    echo "✅ Updated $file"
  else
    echo "⏩ Skipping $file (no auth.getSession() found)"
  fi
}

# Find all API route files that need to be updated
echo "🔍 Finding API routes..."
api_routes=$(find ./src/app/api -name "route.ts")

# Update each API route file
for file in $api_routes; do
  update_file "$file"
done

# Find all layout.tsx files
echo "🔍 Finding layout files..."
layouts=$(find ./src -name "layout.tsx")

# Update each layout file
for file in $layouts; do
  update_file "$file"
done

# Find all page.tsx files in server components
echo "🔍 Finding server page files..."
server_pages=$(find ./src -name "page.tsx" -not -path "*node_modules*" | grep -v "\"use client\"")

# Update each server page file
for file in $server_pages; do
  update_file "$file"
done

# Also update middleware.ts if it exists
if [ -f "./src/middleware.ts" ]; then
  update_file "./src/middleware.ts"
fi

echo "🔐 Security update complete! Please check the updated files carefully."
echo "If you need to restore originals, .bak files have been created." 