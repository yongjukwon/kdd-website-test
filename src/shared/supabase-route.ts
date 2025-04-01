import { Database } from "@/lib/supabase/types";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseRouteHandler() {
	const cookieStore = await cookies();

	return createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					try {
						cookieStore.set({ name, value, ...options });
					} catch (error) {
						console.error("Cookie set error:", error);
					}
				},
				remove(name: string, options: CookieOptions) {
					try {
						cookieStore.set({ name, value: "", ...options, maxAge: 0 });
					} catch (error) {
						console.error("Cookie remove error:", error);
					}
				},
			},
		}
	);
}
