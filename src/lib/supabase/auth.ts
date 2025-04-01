import { getSupabaseBrowser } from "@/shared/supabase-browser";
import { createClient } from "@/utils/supabase/server";
import { supabase } from "./client";

/**
 * Sign out the current user
 */
export async function signOut() {
	const { error } = await supabase.auth.signOut();
	return { error };
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
	try {
		console.log("[getCurrentUser] Fetching current user");

		// Determine if we're in a client component by checking if window is defined
		const isClientComponent = typeof window !== "undefined";

		// Use the appropriate client
		const client = isClientComponent
			? getSupabaseBrowser()
			: await createClient(); // Use the createClient for server components

		// Use getUser() instead of getSession() for security
		// This validates the session by making an authenticated request to Supabase Auth server
		const {
			data: { user: authUser },
			error: authError,
		} = await client.auth.getUser();

		if (authError) {
			console.error("[getCurrentUser] Auth error:", authError);
			return { user: null, error: authError };
		}

		if (!authUser) {
			console.log("[getCurrentUser] No authenticated user found");
			return { user: null, error: { message: "No authenticated user" } };
		}

		console.log("[getCurrentUser] Auth user found:", authUser.email);

		// Then get additional user data from the users table
		const { data: userData, error: userDataError } = await client
			.from("users")
			.select("*")
			.eq("id", authUser.id)
			.single();

		if (userDataError) {
			console.error("[getCurrentUser] User data error:", userDataError);
		}

		// Merge the auth user and db user data
		const mergedUser = {
			...authUser,
			...userData,
		};

		console.log("[getCurrentUser] Merged user data:", {
			id: mergedUser.id,
			email: mergedUser.email,
			role: mergedUser.role,
		});

		return { user: mergedUser, error: null };
	} catch (error) {
		console.error("[getCurrentUser] Unexpected error:", error);
		return { user: null, error };
	}
}

/**
 * Get the current session
 * Note: For secure user verification, use getCurrentUser() instead
 */
export async function getSession() {
	try {
		// Determine if we're in a client component by checking if window is defined
		const isClientComponent = typeof window !== "undefined";

		// Use the appropriate client
		const client = isClientComponent
			? getSupabaseBrowser()
			: await createClient(); // Use the createClient for server components

		// First verify the user is authenticated securely
		const {
			data: { user },
			error: userError,
		} = await client.auth.getUser();

		if (userError) {
			console.error("[getSession] User verification error:", userError);
			return { session: null, error: userError };
		}

		// If we have a verified user, we can safely get the session
		if (user) {
			const {
				data: { session },
				error,
			} = await client.auth.getSession();

			console.log(
				"[getSession] Session check:",
				session?.user?.email || "No session"
			);

			return { session, error };
		} else {
			console.log("[getSession] No authenticated user");
			return { session: null, error: null };
		}
	} catch (error) {
		console.error("[getSession] Error:", error);
		return { session: null, error };
	}
}
