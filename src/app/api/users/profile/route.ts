import { getCurrentUser, updateUser } from "@/entities/user";
import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users/profile - Get current user's profile
export async function GET(request: NextRequest) {
	try {
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await getCurrentUser(user.id);

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user profile" },
			{ status: 500 }
		);
	}
}

// PATCH /api/users/profile - Update current user's profile
export async function PATCH(request: NextRequest) {
	try {
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const updates = await request.json();

		// Prevent changing the role field
		if (updates.role) {
			delete updates.role;
		}

		const updatedUser = await updateUser(user.id, updates);

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Error updating user profile:", error);
		return NextResponse.json(
			{ error: "Failed to update user profile" },
			{ status: 500 }
		);
	}
}
