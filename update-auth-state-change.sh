#!/bin/bash

# Script to find all components using onAuthStateChange and prompt to update them

echo "🔍 Finding components using supabase.auth.onAuthStateChange..."
FILES=$(grep -r "onAuthStateChange" --include="*.tsx" --include="*.ts" src/)

if [ -z "$FILES" ]; then
  echo "✅ No more instances of onAuthStateChange found!"
  exit 0
fi

echo "🔧 Found these files that need to be updated:"
echo "$FILES"
echo ""
echo "⚠️  These components should be updated to use setupSecureAuthListener from @/shared/handle-auth-state-change"
echo "⚠️  Examples have been implemented in:"
echo "   - src/features/auth/AuthButtons.tsx"
echo "   - src/features/debug/DebugPanel.tsx"
echo ""
echo "🔧 Use these components as reference for updating the remaining ones."
echo "🚀 Remember to:"
echo "   1. Import setupSecureAuthListener from @/shared/handle-auth-state-change"
echo "   2. Replace onAuthStateChange with setupSecureAuthListener"
echo "   3. Use the returned subscription for cleanup"
echo "   4. Implement onAuthenticated, onUnauthenticated, and onSignedOut callbacks" 