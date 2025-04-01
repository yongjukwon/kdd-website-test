#!/bin/bash

# Script to find all components using searchParams directly without awaiting

echo "🔍 Finding server components using searchParams properties directly..."
FILES=$(grep -r "searchParams\." --include="*.tsx" --include="*.ts" src/)

if [ -z "$FILES" ]; then
  echo "✅ No instances of direct searchParams property access found!"
  exit 0
fi

echo "🔧 Found these files that need to be updated:"
echo "$FILES"
echo ""
echo "⚠️  In Next.js 15, searchParams needs to be awaited before accessing its properties"
echo "⚠️  An example of the fix has been implemented in:"
echo "   - src/app/admin/events/page.tsx"
echo ""
echo "🔧 To fix this issue:"
echo "   1. Add this line before using searchParams:"
echo "      const params = await Promise.resolve(searchParams);"
echo "   2. Replace all instances of searchParams.X with params.X"
echo ""
echo "⚠️  This is necessary because in Next.js 15, searchParams is now asynchronous" 