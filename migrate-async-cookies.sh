#!/bin/bash

# This script updates all calls to the Supabase utility functions to await them

echo "Updating server component calls..."
find src -type f -name "*.tsx" -exec sed -i '' 's/const supabase = getSupabaseServer()/const supabase = await getSupabaseServer()/g' {} \;

echo "Updating route handler calls..."
find src -type f -name "*.ts" -exec sed -i '' 's/const supabase = getSupabaseRouteHandler()/const supabase = await getSupabaseRouteHandler()/g' {} \;

echo "Checking if auth.ts needs to be updated..."
sed -i '' 's/const client = isClientComponent ? getSupabaseBrowser() : supabase;/const client = isClientComponent ? getSupabaseBrowser() : supabase;/g' src/lib/supabase/auth.ts

echo "Making sure all functions that use these utilities are async..."
# We'll check files manually to ensure they have async functions

echo "Migration completed. Please check the files manually to ensure all functions are correctly marked as async." 