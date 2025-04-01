#!/bin/bash

# This script migrates from @supabase/auth-helpers-nextjs to @supabase/ssr
# by replacing imports in the codebase with our new utility functions

# Update server components
find src -type f -name "*.tsx" -exec sed -i '' 's/import { createServerComponentClient } from "@supabase\/auth-helpers-nextjs";/import { getSupabaseServer } from "@\/shared\/supabase-server";/g' {} \;
find src -type f -name "*.tsx" -exec sed -i '' 's/const supabase = createServerComponentClient({ cookies });/const supabase = getSupabaseServer();/g' {} \;

# Update route handlers
find src -type f -name "*.ts" -exec sed -i '' 's/import { createRouteHandlerClient } from "@supabase\/auth-helpers-nextjs";/import { getSupabaseRouteHandler } from "@\/shared\/supabase-route";/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/const supabase = createRouteHandlerClient({ cookies: () => cookieStore });/const supabase = getSupabaseRouteHandler();/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/const supabase = createRouteHandlerClient({ cookies });/const supabase = getSupabaseRouteHandler();/g' {} \;

# Remove cookies import where it's no longer needed
find src -type f -name "*.tsx" -exec sed -i '' '/import { cookies } from "next\/headers";/d' {} \;
find src -type f -name "*.ts" -exec sed -i '' '/import { cookies } from "next\/headers";/d' {} \;

echo "Migration complete. Please check the files for any remaining issues." 