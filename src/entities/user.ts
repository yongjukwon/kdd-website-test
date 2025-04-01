// lib/entities/users.ts
import { Database } from "../lib/supabase/types";
import { supabase } from "../shared/index";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function getCurrentUser(userId: string): Promise<User> {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", userId)
		.single();

	if (error) throw error;
	console.log("[getCurrentUser] user data:", data);
	return data;
}

export async function updateUser(
	userId: string,
	updates: UserUpdate
): Promise<User> {
	const { data, error } = await supabase
		.from("users")
		.update(updates)
		.eq("id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
}
