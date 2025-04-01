"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Server action for signing out
 */
export async function signOut() {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		return { error: error.message };
	}

	return { success: true };
}

/**
 * Server action for OAuth sign-in
 */
export async function signInWithOAuth(provider: "google" | "github") {
	const siteUrl =
		process.env.NEXT_PUBLIC_SITE_URL ||
		process.env.VERCEL_URL ||
		"http://localhost:3000";

	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: `${siteUrl}/auth/callback`,
		},
	});

	if (error) {
		console.error("OAuth sign in error:", error);
		return { error: error.message };
	}

	return { url: data.url };
}

/**
 * Server action for email/password sign-in
 */
export async function signInWithPassword(email: string, password: string) {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return { error: error.message };
	}

	// After successful sign-in, refresh the session to ensure cookies are properly set
	// await supabase.auth.refreshSession();

	return { user: data.user, session: data.session };
}

/**
 * Server action for email/password sign-up
 */
export async function signUpWithEmail(email: string, password: string) {
	const siteUrl =
		process.env.NEXT_PUBLIC_SITE_URL ||
		process.env.VERCEL_URL ||
		"http://localhost:3000";

	const supabase = await createClient();
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${siteUrl}/auth/callback`,
		},
	});

	if (error) {
		return { error: error.message };
	}

	return { user: data.user, session: data.session };
}

/**
 * Server action for getting the current session
 */
export async function getSession() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getSession();

	if (error) {
		console.error("Get session error:", error);
		return { error: error.message };
	}

	return { session: data.session };
}

/**
 * Server action for getting the current user
 */
export async function getUser() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();

	if (error) {
		console.error("Get user error:", error);
		return { error: error.message };
	}

	return { user: data.user };
}
