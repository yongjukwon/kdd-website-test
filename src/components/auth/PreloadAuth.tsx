"use client";

import { getSupabaseBrowser } from "@/shared/supabase-browser";
import { useEffect } from "react";

/**
 * Preloads authentication state to make it immediately available
 *
 * This component should be rendered at the root layout to ensure auth state
 * is pre-fetched before any auth-dependent components are mounted
 */
export function PreloadAuth() {
	useEffect(() => {
		// Immediately initialize Supabase and fetch the user
		const supabase = getSupabaseBrowser();

		// Use an IIFE to run the async code
		(async () => {
			try {
				// Prefetch user - this will be cached by the Supabase client
				// so that later calls to getUser() are instant
				await supabase.auth.getUser();
			} catch (error) {
				// Silent fail is fine here as we're just preloading
				console.error("Auth preload failed:", error);
			}
		})();
	}, []);

	// This component doesn't render anything
	return null;
}
