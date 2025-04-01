import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextRequest, NextResponse } from "next/server";

// GET /api/events/[id] - Get a single event by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const eventId = await params.id;
		const supabase = await getSupabaseRouteHandler();

		const { data: event, error } = await supabase
			.from("events")
			.select("*, users!inner(first_name, last_name)")
			.eq("id", eventId)
			.single();

		if (error) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		return NextResponse.json(event);
	} catch (error) {
		console.error("Error fetching event:", error);
		return NextResponse.json(
			{ error: "Failed to fetch event" },
			{ status: 500 }
		);
	}
}

// PUT /api/events/[id] - Update an event
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const eventId = await params.id;
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

		// Convert date strings to ISO format
		if (eventData.date && !(eventData.date instanceof Date)) {
			eventData.date = new Date(eventData.date).toISOString();
		}

		if (eventData.rsvp_deadline && !(eventData.rsvp_deadline instanceof Date)) {
			eventData.rsvp_deadline = new Date(eventData.rsvp_deadline).toISOString();
		}

		// Update timestamp
		eventData.updated_at = new Date().toISOString();

		// Update the event
		const { data: updatedEvent, error } = await supabase
			.from("events")
			.update(eventData)
			.eq("id", eventId)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json({ error: "Event not found" }, { status: 404 });
			}
			throw error;
		}

		return NextResponse.json(updatedEvent);
	} catch (error) {
		console.error("Error updating event:", error);
		return NextResponse.json(
			{ error: "Failed to update event" },
			{ status: 500 }
		);
	}
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const eventId = await params.id;
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

		// First check if event exists
		const { data: event, error: fetchError } = await supabase
			.from("events")
			.select("id")
			.eq("id", eventId)
			.single();

		if (fetchError || !event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		// Delete the event
		const { error } = await supabase.from("events").delete().eq("id", eventId);

		if (error) throw error;

		return NextResponse.json(
			{ message: "Event deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting event:", error);
		return NextResponse.json(
			{ error: "Failed to delete event" },
			{ status: 500 }
		);
	}
}
