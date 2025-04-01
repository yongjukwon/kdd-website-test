"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getSupabaseClient() {
	const supabase = await createClient();

	return supabase;
}

export async function signIn(formData: FormData) {
	const supabase = await getSupabaseClient();

	const data = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};

	const { error } = await supabase.auth.signInWithPassword(data);

	if (error) {
		console.error(error);
		return { error: error.message };
	}

	// Explicitly refresh session to ensure cookies are properly set
	await supabase.auth.getSession();

	revalidatePath("/");
	return { success: true };
}

export async function signOut() {
	const supabase = await getSupabaseClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/");
	redirect("/");
}

export async function getUser() {
	const supabase = await getSupabaseClient();

	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user) {
		return { user: null };
	}

	return { user: data.user };
}
