"use client";

/**
 * Utility for setting up secure handling of authentication state changes
 *
 * This helper follows Supabase best practices by not using the data from the
 * auth state change event directly, but instead calling getUser() to verify
 * authentication with the server.
 *
 * Reference: https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";

interface AuthChangeHandlerOptions {
	supabase: SupabaseClient;
	onAuthenticated?: (user: User) => void;
	onUnauthenticated?: () => void;
	onSignedOut?: () => void;
	debugPrefix?: string;
}

/**
 * Sets up a secure auth state change listener with optimized performance
 *
 * This function helps implement the security best practice of verifying
 * authentication with the server rather than trusting client-side state.
 */
export function setupSecureAuthListener({
	supabase,
	onAuthenticated,
	onUnauthenticated,
	onSignedOut,
	debugPrefix = "",
}: AuthChangeHandlerOptions) {
	const logPrefix = debugPrefix ? `[${debugPrefix}]` : "";

	// Set up auth state change listener
	try {
		// First, immediately check the current auth state without waiting for events
		(async () => {
			try {
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (error) {
					// Only log as error if it's not a missing session error
					if (error.name !== "AuthSessionMissingError") {
						console.error(`${logPrefix} Initial auth check error:`, error);
					} else {
						console.log(`${logPrefix} No active session found`);
					}
					onUnauthenticated?.();
					return;
				}

				if (user) {
					onAuthenticated?.(user);
				} else {
					onUnauthenticated?.();
				}
			} catch (error) {
				console.error(`${logPrefix} Initial auth check failed:`, error);
				onUnauthenticated?.();
			}
		})();

		// Then set up the ongoing listener for changes
		const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === "SIGNED_OUT") {
				onSignedOut?.();
				return;
			}

			// For all other events, verify auth state with the server
			try {
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (error) {
					// Only log as error if it's not a missing session error
					if (error.name !== "AuthSessionMissingError") {
						console.error(`${logPrefix} Auth verification error:`, error);
					} else {
						console.log(
							`${logPrefix} No active session found during verification`
						);
					}
					onUnauthenticated?.();
					return;
				}

				if (user) {
					onAuthenticated?.(user);
				} else {
					onUnauthenticated?.();
				}
			} catch (error) {
				console.error(`${logPrefix} Auth verification failed:`, error);
				onUnauthenticated?.();
			}
		});

		return data.subscription;
	} catch (error) {
		console.error(`${logPrefix} Error setting up auth listener:`, error);
		// Return a dummy subscription object
		return {
			unsubscribe: () => {},
		};
	}
}
