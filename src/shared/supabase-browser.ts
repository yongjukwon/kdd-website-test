"use client";

import type { Database } from "@/lib/supabase/types";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Creates a Supabase client for use in browser environments (Client Components)
 * Following the latest Supabase documentation recommendations
 */
export function getSupabaseBrowser() {
	if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
	}
	if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
	}

	if (cachedClient) {
		console.log("[Supabase Browser] Using cached client");
		return cachedClient;
	}

	try {
		console.log("[Supabase Browser] Creating new client");
		cachedClient = createBrowserClient<Database>(
			process.env.NEXT_PUBLIC_SUPABASE_URL,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
			{
				auth: {
					persistSession: true,
					detectSessionInUrl: true,
					storageKey: "kdd-auth-token",
					flowType: "pkce",
				},
				global: {
					headers: {
						"x-client-info": "@supabase/ssr",
					},
				},
			}
		);

		// Test the client
		console.log("[Supabase Browser] Testing client connection...");
		cachedClient.auth.onAuthStateChange((event, session) => {
			console.log(
				"[Supabase Browser] Auth state changed:",
				event,
				session?.user?.email
			);
		});

		return cachedClient;
	} catch (error) {
		console.error("[Supabase Browser] Failed to create client:", error);
		throw error;
	}
}
