import { cookies } from "next/headers";

/**
 * Helper function to safely get cookie values in a server context
 * Handles any errors that might occur and provides a fallback value
 */
export function getCookieValue(name: string): string | undefined {
	try {
		// Get the cookie directly - in Next.js 14+ this is guaranteed to be synchronous
		return cookies().get(name)?.value;
	} catch (error) {
		console.error(`Error accessing cookie ${name}:`, error);
		return undefined;
	}
}
