import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic to ensure the callback is always processed fresh
export const dynamic = "force-dynamic";

/**
 * Auth callback handler - processes code exchange from OAuth providers
 * and email magic links, then redirects to the appropriate page
 */
export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = requestUrl.searchParams.get("next") || "/";
	const error = requestUrl.searchParams.get("error_description");

	// Handle error from Supabase OAuth
	if (error) {
		return NextResponse.redirect(
			new URL(
				`/auth/signin?error=${encodeURIComponent(error)}`,
				requestUrl.origin
			)
		);
	}

	if (!code) {
		// No code provided, redirect to the next URL directly
		return NextResponse.redirect(new URL(next, requestUrl.origin));
	}

	try {
		// Create supabase client and exchange the code for a session
		const supabase = await createClient();

		// Exchange the auth code for a session
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			console.error("Error exchanging auth code for session:", error);
			return NextResponse.redirect(
				new URL(
					`/auth/signin?error=${encodeURIComponent(error.message)}`,
					requestUrl.origin
				)
			);
		}

		// Explicitly get the session to ensure all cookies are set properly
		await supabase.auth.getSession();

		// Successfully authenticated, redirect to the target URL
		return NextResponse.redirect(new URL(next, requestUrl.origin));
	} catch (error) {
		console.error("Unexpected error during auth callback:", error);
		return NextResponse.redirect(
			new URL("/auth/signin?error=Authentication%20failed", requestUrl.origin)
		);
	}
}
