"use client";

import { getSupabaseBrowser } from "@/shared/supabase-browser";

// Initialize the Supabase client using the browser client function
export const supabase = getSupabaseBrowser();
