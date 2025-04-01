import { createClient } from "@/utils/supabase/server";

export type AuthUser = {
	authenticated: boolean;
	user?: any;
	error?: string;
};

export async function getCurrentUser(): Promise<AuthUser> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) {
			console.error("[Auth] Error:", error.message);
			return { authenticated: false, error: error.message };
		}

		if (!user) {
			return { authenticated: false };
		}

		return { authenticated: true, user };
	} catch (error) {
		console.error("[Auth] Server error:", error);
		return { authenticated: false, error: "Internal server error" };
	}
}
