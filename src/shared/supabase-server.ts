import { createClient } from "@/utils/supabase/server";

// Force dynamic rendering for pages using this function
export const dynamic = "force-dynamic";

// Create a Supabase client for use in server components
export async function getSupabaseServer() {
	// Use the createClient function from utils/supabase/server.ts
	return createClient();
}
