import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
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

		// Get query parameters for pagination/filtering
		const { searchParams } = new URL(request.url);
		const params = await Promise.resolve(searchParams);

		// Parse parameters
		const page = parseInt((await params.get("page")) || "1");
		const limit = parseInt((await params.get("limit")) || "20");
		const search = await params.get("search");

		// Calculate offset
		const offset = (page - 1) * limit;

		// Build query
		let query = supabase.from("users").select("*", { count: "exact" });

		// Add search if provided
		if (search) {
			query = query.or(
				`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
			);
		}

		// Add pagination
		const {
			data: users,
			count,
			error,
		} = await query
			.range(offset, offset + limit - 1)
			.order("created_at", { ascending: false });

		if (error) throw error;

		return NextResponse.json({
			users,
			pagination: {
				page,
				limit,
				totalItems: count || 0,
				totalPages: count ? Math.ceil(count / limit) : 0,
			},
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 }
		);
	}
}
