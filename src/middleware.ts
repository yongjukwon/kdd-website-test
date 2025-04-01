import type { Database } from "@/lib/supabase/types";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware for handling authentication and protected routes
 * Also refreshes sessions and sets cookies properly
 */
export async function middleware(request: NextRequest) {
	const response = NextResponse.next();

	// Create a Supabase client specifically for the middleware
	const supabase = createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return Array.from(request.cookies.getAll());
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => {
						response.cookies.set({
							name,
							value,
							...options,
						});
					});
				},
			},
		}
	);

	// IMPORTANT: Make sure to always refresh the session
	// This will ensure cookies are properly set/updated
	await supabase.auth.getSession();

	// Check if the user is authenticated
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// If user is not authenticated and trying to access protected routes
	if (
		!user &&
		(request.nextUrl.pathname.startsWith("/admin") ||
			request.nextUrl.pathname.startsWith("/profile"))
	) {
		const redirectUrl = new URL("/auth/signin", request.url);
		redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
		return NextResponse.redirect(redirectUrl);
	}

	// If the user is authenticated and trying to access admin routes
	if (user && request.nextUrl.pathname.startsWith("/admin")) {
		// Fetch user data to check role
		const { data: userData } = await supabase
			.from("users")
			.select("role")
			.eq("id", user.id)
			.single();

		// If not admin, redirect to home
		if (userData?.role !== "admin") {
			return NextResponse.redirect(new URL("/", request.url));
		}
	}

	return response;
}

// Specify which routes this middleware should run on
export const config = {
	matcher: ["/admin/:path*", "/profile/:path*", "/auth/callback"],
};
