import {
	createEvent,
	deleteEvent,
	getAllEvents,
	getEventById,
	updateEvent,
} from "@/entities/events";
import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextRequest, NextResponse } from "next/server";

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
	try {
		const supabase = await getSupabaseRouteHandler();
		const { searchParams } = new URL(request.url);
		const params = await Promise.resolve(searchParams);

		// Parse parameters
		const page = parseInt((await params.get("page")) || "1");
		const limit = parseInt((await params.get("limit")) || "10");
		const published = (await params.get("published")) || "all";

		// Build query
		let query = supabase
			.from("events")
			.select("*, users!inner(first_name, last_name)", { count: "exact" });

		// Filter by publication status
		if (published !== "all") {
			const isPublished = published === "true";
			query = query.eq("is_published", isPublished);
		}

		// Pagination
		const from = (page - 1) * limit;
		const to = from + limit - 1;

		const {
			data: events,
			count,
			error,
		} = await query.order("date", { ascending: false }).range(from, to);

		if (error) throw error;

		return NextResponse.json({
			events,
			pagination: {
				page,
				limit,
				totalItems: count || 0,
				totalPages: count ? Math.ceil(count / limit) : 0,
			},
		});
	} catch (error) {
		console.error("Error fetching events:", error);
		return NextResponse.json(
			{ error: "Failed to fetch events" },
			{ status: 500 }
		);
	}
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
	try {
		const supabase = await getSupabaseRouteHandler();

		// Get the current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
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

		// Get event data from request
		const eventData = await request.json();

		// Add the current user as organizer if not specified
		if (!eventData.organizer_user_id) {
			eventData.organizer_user_id = user.id;
		}

		// Set default values if not provided
		if (eventData.is_published === undefined) eventData.is_published = false;
		if (!eventData.price) eventData.price = 0;
		if (!eventData.is_online) eventData.is_online = false;

		// Convert date strings to ISO format
		if (eventData.date && !(eventData.date instanceof Date)) {
			eventData.date = new Date(eventData.date).toISOString();
		}

		if (eventData.rsvp_deadline && !(eventData.rsvp_deadline instanceof Date)) {
			eventData.rsvp_deadline = new Date(eventData.rsvp_deadline).toISOString();
		}

		// Add timestamps
		eventData.created_at = new Date().toISOString();
		eventData.updated_at = new Date().toISOString();

		// Insert the new event
		const { data: newEvent, error } = await supabase
			.from("events")
			.insert(eventData)
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json(newEvent, { status: 201 });
	} catch (error) {
		console.error("Error creating event:", error);
		return NextResponse.json(
			{ error: "Failed to create event" },
			{ status: 500 }
		);
	}
}
