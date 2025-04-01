"use server";

import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schema for sign in validation
const signInSchema = z.object({
	email: z.string().email("Please enter a valid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for sign up validation
const signUpSchema = z.object({
	email: z.string().email("Please enter a valid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	name: z.string().min(1, "Name is required"),
});

// Server action for signing in
export async function signIn(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	// Validate form data
	const result = signInSchema.safeParse({ email, password });
	if (!result.success) {
		return {
			error: result.error.errors[0].message,
			data: null,
		};
	}

	// Get Supabase client in route handler context
	const supabase = await getSupabaseRouteHandler();

	// Sign in with credentials
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return {
			error: error.message,
			data: null,
		};
	}

	// If successful, revalidate the path and redirect
	revalidatePath("/");
	return { data, error: null };
}

// Server action for signing up
export async function signUp(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const name = formData.get("name") as string;

	// Validate form data
	const result = signUpSchema.safeParse({ email, password, name });
	if (!result.success) {
		return {
			error: result.error.errors[0].message,
			data: null,
		};
	}

	// Get Supabase client in route handler context
	const supabase = await getSupabaseRouteHandler();

	// Sign up with credentials
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				name,
			},
		},
	});

	if (error) {
		return {
			error: error.message,
			data: null,
		};
	}

	// Create user profile
	const { error: profileError } = await supabase.from("users").insert({
		id: data.user?.id,
		email: data.user?.email,
		name,
		created_at: new Date().toISOString(),
	});

	if (profileError) {
		return {
			error: profileError.message,
			data: null,
		};
	}

	// If successful, revalidate the path
	revalidatePath("/");
	return { data, error: null };
}

// Server action for signing out
export async function signOut() {
	const supabase = await getSupabaseRouteHandler();

	const { error } = await supabase.auth.signOut();

	if (error) {
		return {
			error: error.message,
		};
	}

	revalidatePath("/");
	redirect("/");
}

// Server action for getting current user
export async function getCurrentUser() {
	const supabase = await getSupabaseRouteHandler();

	const {
		data: { user: authUser },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !authUser) {
		return {
			user: null,
			error: authError?.message || "No authenticated user",
		};
	}

	// Get user profile data
	const { data: userData, error: userDataError } = await supabase
		.from("users")
		.select("*")
		.eq("id", authUser.id)
		.single();

	// Combine auth and profile data
	const user = {
		...authUser,
		...(userData || {}),
	};

	return {
		user,
		error: userDataError?.message || null,
	};
}
