import {
	deleteEventParticipant,
	EventParticipantInsert,
	upsertEventParticipant,
} from "@/entities/eventParticipants";
import { getEventById } from "@/entities/events";
import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextRequest, NextResponse } from "next/server";

// GET /api/events/[id]/participants - Get all participants for an event
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const supabase = await getSupabaseRouteHandler();

		// Check if event exists
		await getEventById(await params.id);

		// Get participants with user details
		const { data, error } = await supabase
			.from("event_participants")
			.select(
				`
        *,
        users:user_id (
          id,
          first_name,
          last_name,
          email,
          profile_image
        )
      `
			)
			.eq("event_id", await params.id);

		if (error) throw error;

		return NextResponse.json({ participants: data });
	} catch (error) {
		console.error(
			`Error fetching participants for event ${await params.id}:`,
			error
		);
		return NextResponse.json(
			{ error: "Failed to fetch participants" },
			{ status: 500 }
		);
	}
}

// POST /api/events/[id]/participants - RSVP to an event
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if event exists and is available
		const event = await getEventById(await params.id);

		if (!event.is_published) {
			return NextResponse.json(
				{ error: "Event is not available for RSVP" },
				{ status: 400 }
			);
		}

		// Check if event is at capacity
		const { count } = await supabase
			.from("event_participants")
			.select("*", { count: "exact" })
			.eq("event_id", await params.id)
			.eq("status", "going");

		const participantData: EventParticipantInsert = {
			user_id: user.id,
			event_id: await params.id,
			status: "going",
			is_checked_in: false,
			cancelled_at: null,
		};

		if (event.capacity && count !== null && count >= event.capacity) {
			// Add to waitlist if at capacity
			participantData.status = "waitlisted";

			const participant = await upsertEventParticipant(participantData);

			return NextResponse.json({
				...participant,
				message: "Event is at capacity. You have been added to the waitlist.",
			});
		}

		// RSVP as going
		const participant = await upsertEventParticipant(participantData);

		return NextResponse.json(participant, { status: 201 });
	} catch (error) {
		console.error(`Error RSVPing to event ${await params.id}:`, error);
		return NextResponse.json(
			{ error: "Failed to RSVP to event" },
			{ status: 500 }
		);
	}
}

// DELETE /api/events/[id]/participants - Cancel RSVP
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Find the participant record
		const { data: participant } = await supabase
			.from("event_participants")
			.select("id")
			.eq("event_id", await params.id)
			.eq("user_id", user.id)
			.single();

		if (!participant) {
			return NextResponse.json(
				{ error: "You are not registered for this event" },
				{ status: 404 }
			);
		}

		// Cancel RSVP
		await deleteEventParticipant(participant.id);

		return NextResponse.json({ message: "RSVP cancelled successfully" });
	} catch (error) {
		console.error(`Error cancelling RSVP for event ${await params.id}:`, error);
		return NextResponse.json(
			{ error: "Failed to cancel RSVP" },
			{ status: 500 }
		);
	}
}
