import { getCurrentUser, updateUser } from "@/entities/user";
import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users/[id] - Get user by ID (admin only)
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is admin
		const { data: userData } = await supabase
			.from("users")
			.select("role")
			.eq("id", user.id)
			.single();

		if (userData?.role !== "admin") {
			return NextResponse.json({ error: "Permission denied" }, { status: 403 });
		}

		const id = await params.id;
		const fetchedUser = await getCurrentUser(id);

		if (!fetchedUser) {
			return NextResponse.json(
				{ error: `User with ID ${id} not found` },
				{ status: 404 }
			);
		}

		return NextResponse.json(fetchedUser);
	} catch (error) {
		const id = await params.id;
		console.error(`Error fetching user with ID ${id}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch user" },
			{ status: 500 }
		);
	}
}

// PATCH /api/users/[id] - Update user by ID (admin only)
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is admin
		const { data: userData } = await supabase
			.from("users")
			.select("role")
			.eq("id", user.id)
			.single();

		if (userData?.role !== "admin") {
			return NextResponse.json({ error: "Permission denied" }, { status: 403 });
		}

		const id = await params.id;
		const updates = await request.json();
		const updatedUser = await updateUser(id, updates);

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error(`Error updating user with ID ${id}:`, error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 }
		);
	}
}

// PUT /api/users/[id] - Update user by ID (admin only)
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		// Validate user exists
		const supabase = await getSupabaseRouteHandler();
		const user = await getCurrentUser(await params.id);

		if (!user) {
			return NextResponse.json(
				{ error: `User with ID ${await params.id} not found` },
				{ status: 404 }
			);
		}

		// Get updates from request body
		const updates = await request.json();
		const updatedUser = await updateUser(await params.id, updates);

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error(`Error updating user with ID ${await params.id}:`, error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 }
		);
	}
}
