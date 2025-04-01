#!/bin/bash

# Fix dynamic parameters to be properly awaited in Next.js 15
# This script finds and fixes common patterns where dynamic parameters
# are used synchronously instead of asynchronously

echo "Fixing dynamic parameters for Next.js 15..."

# 1. Fix direct params.id access in route handlers and pages
find src/app -type f -name "*.ts*" -not -path "*/node_modules/*" | xargs sed -i '' -E 's/([^a]wait )params\.([a-zA-Z0-9_]+)/\1await params.\2/g'

# 2. Fix params.get("something") access in route handlers
find src/app/api -type f -name "*.ts*" -not -path "*/node_modules/*" | xargs sed -i '' -E 's/([^a]wait )params\.get\((.*)\)/\1await params.get(\2)/g'

# 3. Fix searchParams access for pages
find src/app -type f -name "page.tsx" -not -path "*/node_modules/*" | xargs sed -i '' -E 's/searchParams\./await searchParams./g'

echo "Fixed dynamic parameter access across the codebase."
echo "Please check the changes and test your application." 