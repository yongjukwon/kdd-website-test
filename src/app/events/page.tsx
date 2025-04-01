import { EventList } from "@/features/events/EventList";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getSupabaseServer } from "@/shared/supabase-server";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Events | KDD",
	description: "Browse and register for upcoming KDD events",
};

export default async function EventsPage() {
	const supabase = await getSupabaseServer();

	// Fetch all events
	const { data: events, error } = await supabase
		.from("events")
		.select("*")
		.eq("is_published", "true")
		.order("date", { ascending: true });

	if (error) {
		console.error("Error fetching events:", error);
		return (
			<div className="container mx-auto px-4 py-16 text-center text-red-500">
				Failed to load events
			</div>
		);
	}

	// Get the current user (if logged in)
	const { user } = await getCurrentUser();

	// Get participant counts for each event
	const eventsWithParticipants = await Promise.all(
		events.map(async (event) => {
			const { count } = await supabase
				.from("event_participants")
				.select("*", { count: "exact" })
				.eq("event_id", event.id);

			return {
				...event,
				participantCount: count || 0,
			};
		})
	);

	// If user is logged in, get their RSVPs
	let userRsvpStatus = {};
	if (user) {
		const { data: userEvents } = await supabase
			.from("event_participants")
			.select("event_id, status")
			.eq("user_id", user.id);

		if (userEvents) {
			userRsvpStatus = userEvents.reduce((acc, event) => {
				acc[event.event_id] = event.status === "going" ? "rsvp" : "declined";
				return acc;
			}, {});
		}
	}

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="text-center mb-16">
				<h1 className="text-5xl font-bold mb-6">Events</h1>
				<p className="text-xl text-gray-600 max-w-3xl mx-auto">
					Discover and RSVP to our curated collection of events. Join us for
					workshops, conferences, and gatherings designed to inspire and
					connect.
				</p>
			</div>

			<EventList
				events={eventsWithParticipants}
				userRsvpStatus={userRsvpStatus}
				currentUser={user}
			/>
		</div>
	);
}
