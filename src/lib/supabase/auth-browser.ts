"use client";

// This file is safe to import in both client and server components
// It only uses browser-side authentication

import { getSupabaseBrowser } from "@/shared/supabase-browser";

/**
 * Sign out the current user (browser-only version)
 */
export async function signOutBrowser() {
	console.log("[signOutBrowser] Signing user out");
	try {
		const supabase = getSupabaseBrowser();

		// Clear any local session data first to avoid potential message port issues
		localStorage.removeItem("supabase.auth.token");

		// Perform the signout
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error("[signOutBrowser] Error signing out:", error);
		} else {
			console.log("[signOutBrowser] Successfully signed out");
		}

		return { error };
	} catch (err) {
		console.error("[signOutBrowser] Unexpected error during sign out:", err);
		return { error: err as Error };
	}
}

/**
 * Get the current user (browser-only version)
 */
export async function getCurrentUserBrowser() {
	const startTime = Date.now();
	console.log("[getCurrentUserBrowser] START: Fetching current user");

	try {
		const supabase = getSupabaseBrowser();

		// Use getUser() instead of getSession() for security
		// This validates the session by making an authenticated request to Supabase Auth server
		console.log("[getCurrentUserBrowser] Calling auth.getUser()");
		const {
			data: { user: authUser },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) {
			console.error("[getCurrentUserBrowser] Auth error:", authError);
			console.log(
				`[getCurrentUserBrowser] COMPLETE (${
					Date.now() - startTime
				}ms): Auth error`
			);
			return { user: null, error: authError };
		}

		if (!authUser) {
			console.log("[getCurrentUserBrowser] No authenticated user found");
			console.log(
				`[getCurrentUserBrowser] COMPLETE (${
					Date.now() - startTime
				}ms): No user`
			);
			return { user: null, error: { message: "No authenticated user" } };
		}

		console.log("[getCurrentUserBrowser] Auth user found:", authUser.email);

		// Then get additional user data from the users table
		console.log("[getCurrentUserBrowser] Fetching user data from users table");
		const { data: userData, error: userDataError } = await supabase
			.from("users")
			.select("*")
			.eq("id", authUser.id)
			.single();

		if (userDataError) {
			console.error("[getCurrentUserBrowser] User data error:", userDataError);
		}

		// Merge the auth user and db user data
		const mergedUser = {
			...authUser,
			...userData,
		};

		console.log("[getCurrentUserBrowser] Merged user data:", {
			id: mergedUser.id,
			email: mergedUser.email,
			role: mergedUser.role,
		});
		console.log(
			`[getCurrentUserBrowser] COMPLETE (${Date.now() - startTime}ms): Success`
		);

		return { user: mergedUser, error: null };
	} catch (error) {
		console.error("[getCurrentUserBrowser] Unexpected error:", error);
		console.log(
			`[getCurrentUserBrowser] COMPLETE (${Date.now() - startTime}ms): Error`
		);
		return { user: null, error };
	}
}

/**
 * Get the current session (browser-only version)
 * Note: For secure user verification, use getCurrentUserBrowser() instead
 */
export async function getSessionBrowser() {
	try {
		// First verify the user is authenticated securely
		const supabase = getSupabaseBrowser();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError) {
			console.error("[getSessionBrowser] User verification error:", userError);
			return { session: null, error: userError };
		}

		// If we have a verified user, we can safely get the session
		if (user) {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			console.log(
				"[getSessionBrowser] Session check:",
				session?.user?.email || "No session"
			);

			return { session, error };
		} else {
			console.log("[getSessionBrowser] No authenticated user");
			return { session: null, error: null };
		}
	} catch (error) {
		console.error("[getSessionBrowser] Error:", error);
		return { session: null, error };
	}
}
