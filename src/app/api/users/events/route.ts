import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextResponse } from "next/server";

// GET /api/users/events - Get all events for the current user
export async function GET() {
	try {
		const supabase = await getSupabaseRouteHandler();

		// Use getUser for security
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get all events the user is participating in
		const { data, error } = await supabase
			.from("event_participants")
			.select(
				`
				id,
				status,
				rsvp_at,
				is_checked_in,
				event_id,
				events:event_id (
					id,
					title,
					description,
					date,
					location,
					is_online,
					status
				)
			`
			)
			.eq("user_id", user.id);

		if (error) throw error;

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching user events:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user events" },
			{ status: 500 }
		);
	}
}
