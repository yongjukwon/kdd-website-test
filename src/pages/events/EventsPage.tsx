"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/supabase/auth";
import { format, isBefore, isToday } from "date-fns";
import { CalendarIcon, Globe, MapPinIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Event type definition matching our Supabase schema
interface Event {
	id: string;
	title: string;
	subtitle?: string;
	description: string;
	date: string;
	location?: string;
	is_online: boolean;
	online_url?: string;
	capacity?: number;
	status: string;
	poster_image?: string;
	price?: number;
	rsvp_deadline?: string;
	created_at: string;
	updated_at: string;
	organizer_user_id: string;
	is_published: boolean;
}

interface EventWithParticipantCount extends Event {
	participantCount: number;
}

// User type definition
interface User {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	role?: string;
}

// User event participation type
interface UserEvent {
	id: string;
	user_id: string;
	event_id: string;
	status: string;
	created_at: string;
}

// Type for our filtered events
type EventStatus = "ongoing" | "upcoming" | "past";

// Utility function to format date
function formatEventDate(dateStr: string): string {
	const date = new Date(dateStr);
	return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
}

export function EventsPage() {
	const [events, setEvents] = useState<EventWithParticipantCount[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [rsvpStatus, setRsvpStatus] = useState<
		Record<string, "rsvp" | "declined" | null>
	>({});
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const router = useRouter();

	// Fetch events from our API
	useEffect(() => {
		async function fetchEvents() {
			try {
				setLoading(true);

				// First, try to get current user
				const { user, error: userError } = await getCurrentUser();
				setCurrentUser(user);

				if (userError) {
					console.error("Error fetching user:", userError);
				}

				// Fetch events
				const response = await fetch("/api/events?limit=100");

				if (!response.ok) {
					throw new Error("Failed to fetch events");
				}

				const data = await response.json();

				// Fetch participant counts for each event
				const eventsWithCounts = await Promise.all(
					data.events.map(async (event: Event) => {
						try {
							const countResponse = await fetch(
								`/api/events/${event.id}/participants`
							);
							const countData = await countResponse.json();
							return {
								...event,
								participantCount: countData.participants?.length || 0,
							};
						} catch (err) {
							console.error(
								`Error fetching participants for ${event.id}:`,
								err
							);
							return {
								...event,
								participantCount: 0,
							};
						}
					})
				);

				// Check if user has RSVPed to any events
				if (user) {
					const userEventsResponse = await fetch("/api/users/events");
					if (userEventsResponse.ok) {
						const userEvents = await userEventsResponse.json();

						// Set RSVP status
						const userRsvpStatus: Record<string, "rsvp" | "declined" | null> =
							{};
						userEvents.forEach((userEvent: UserEvent) => {
							userRsvpStatus[userEvent.event_id] =
								userEvent.status === "confirmed" ? "rsvp" : "declined";
						});

						setRsvpStatus(userRsvpStatus);
					}
				}

				setEvents(eventsWithCounts);
			} catch (err) {
				console.error("Error fetching events:", err);
				setError("Failed to load events. Please try again later.");
			} finally {
				setLoading(false);
			}
		}

		fetchEvents();
	}, []);

	// Determine event status based on date
	const categorizeEvent = (event: EventWithParticipantCount): EventStatus => {
		const eventDate = new Date(event.date);
		const now = new Date();

		// If the event is happening today, mark as ongoing
		if (isToday(eventDate)) {
			return "ongoing";
		}

		// If the event date is before today, mark as past
		if (isBefore(eventDate, now)) {
			return "past";
		}

		// Otherwise it's upcoming
		return "upcoming";
	};

	// Filter events by status
	const ongoingEvents = events
		.filter(
			(event) => categorizeEvent(event) === "ongoing" && event.is_published
		)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const upcomingEvents = events
		.filter(
			(event) => categorizeEvent(event) === "upcoming" && event.is_published
		)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const pastEvents = events
		.filter((event) => categorizeEvent(event) === "past" && event.is_published)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const handleRSVP = async (eventId: string, status: "rsvp" | "declined") => {
		console.log("currentUser: ", currentUser);
		if (!currentUser) {
			// Redirect to login if not signed in
			router.push("/auth/signin");
			return;
		}

		try {
			const method = status === "rsvp" ? "POST" : "DELETE";
			const response = await fetch(`/api/events/${eventId}/participants`, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to update RSVP status");
			}

			// Update local state
			setRsvpStatus((prev) => ({
				...prev,
				[eventId]: status,
			}));
		} catch (err) {
			console.error("Error updating RSVP:", err);
			// Could add a toast notification here
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				Loading events...
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-16 text-center text-red-500">
				{error}
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-16 flex-grow flex flex-col">
			{/* Event Tabs */}
			<Tabs defaultValue="upcoming" className="flex-grow flex flex-col">
				<TabsList className="w-full max-w-3xl mx-auto grid-cols-3 mb-10">
					<TabsTrigger value="ongoing" className="text-base py-3">
						Ongoing
						<Badge
							variant="secondary"
							className="ml-2 bg-blue-50 text-blue-700"
						>
							{ongoingEvents.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="upcoming" className="text-base py-3">
						Upcoming
						<Badge
							variant="secondary"
							className="ml-2 bg-blue-50 text-blue-700"
						>
							{upcomingEvents.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="past" className="text-base py-3">
						Past
						<Badge
							variant="secondary"
							className="ml-2 bg-blue-50 text-blue-700"
						>
							{pastEvents.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				{/* Ongoing Events */}
				<TabsContent value="ongoing" className="flex-grow">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{ongoingEvents.map((event) => (
							<EventCard
								key={event.id}
								event={event}
								rsvpStatus={rsvpStatus[event.id]}
								onRSVP={handleRSVP}
							/>
						))}
						{ongoingEvents.length === 0 && (
							<p className="text-center col-span-full text-gray-500 py-10">
								No events are currently happening. Check back soon!
							</p>
						)}
					</div>
				</TabsContent>

				{/* Upcoming Events */}
				<TabsContent value="upcoming" className="flex-grow">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{upcomingEvents.map((event) => (
							<EventCard
								key={event.id}
								event={event}
								rsvpStatus={rsvpStatus[event.id]}
								onRSVP={handleRSVP}
							/>
						))}
						{upcomingEvents.length === 0 && (
							<p className="text-center col-span-full text-gray-500 py-10">
								No upcoming events scheduled. Check back soon!
							</p>
						)}
					</div>
				</TabsContent>

				{/* Past Events */}
				<TabsContent value="past" className="flex-grow">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{pastEvents.map((event) => (
							<EventCard
								key={event.id}
								event={event}
								rsvpStatus={rsvpStatus[event.id]}
								onRSVP={handleRSVP}
								isPast={true}
							/>
						))}
						{pastEvents.length === 0 && (
							<p className="text-center col-span-full text-gray-500 py-10">
								No past events to display.
							</p>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

// Event Card Component
interface EventCardProps {
	event: EventWithParticipantCount;
	rsvpStatus: "rsvp" | "declined" | null;
	onRSVP: (eventId: string, status: "rsvp" | "declined") => void;
	isPast?: boolean;
}

function EventCard({
	event,
	rsvpStatus,
	onRSVP,
	isPast = false,
}: EventCardProps) {
	// Generate placeholder image based on event title if no image is provided
	const imageSrc =
		event.poster_image ||
		`https://source.unsplash.com/random/800x600/?${encodeURIComponent(
			event.title
		)}`;

	// Determine event status based on date
	const eventDate = new Date(event.date);
	const isOngoing = isToday(eventDate);
	const isPastEvent = isPast || isBefore(eventDate, new Date());

	return (
		<div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
			{/* Event Image */}
			<div className="relative h-60">
				<Image
					src={imageSrc}
					alt={event.title}
					fill
					sizes="(max-width: 768px) 100vw, 33vw"
					className="object-cover"
				/>
				<div className="absolute top-4 right-4">
					<Badge className="bg-white text-blue-600 hover:bg-white">
						{isOngoing ? "Ongoing" : isPastEvent ? "Past" : "Upcoming"}
					</Badge>
				</div>
			</div>

			{/* Event Content */}
			<div className="p-6">
				{/* Date */}
				<div className="flex items-center text-gray-500 mb-4">
					<CalendarIcon className="h-5 w-5 mr-2" />
					<span>{formatEventDate(event.date)}</span>
				</div>

				{/* Title and Description */}
				<h3 className="text-2xl font-bold mb-3">{event.title}</h3>
				{event.subtitle && (
					<p className="text-lg text-gray-700 mb-3">{event.subtitle}</p>
				)}
				<p className="text-gray-600 mb-6 line-clamp-2">{event.description}</p>

				{/* Location or Online */}
				{event.is_online ? (
					<div className="flex items-center text-gray-500 mb-4">
						<Globe className="h-5 w-5 mr-2" />
						<span>Online Event</span>
						{event.online_url && !isPastEvent && (
							<a
								href={event.online_url}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-2 text-blue-600 hover:underline"
							>
								Join URL
							</a>
						)}
					</div>
				) : event.location ? (
					<div className="flex items-center text-gray-500 mb-4">
						<MapPinIcon className="h-5 w-5 mr-2" />
						<span>{event.location}</span>
					</div>
				) : null}

				{/* Attendees */}
				<div className="flex items-center text-gray-500 mb-6">
					<UsersIcon className="h-5 w-5 mr-2" />
					<span>
						{event.participantCount} / {event.capacity || "Unlimited"}
					</span>
				</div>

				{/* Price */}
				{event.price && event.price > 0 && (
					<div className="mb-6 text-gray-700">
						Price: ${event.price.toFixed(2)}
					</div>
				)}

				{/* RSVP Actions */}
				{!isPastEvent && (
					<div className="flex space-x-4">
						<Button
							className={`flex-1 ${
								rsvpStatus === "rsvp" ? "bg-green-600 hover:bg-green-700" : ""
							}`}
							onClick={() => onRSVP(event.id, "rsvp")}
						>
							RSVP
						</Button>
						<Button
							variant="outline"
							className={`flex-1 ${
								rsvpStatus === "declined" ? "bg-gray-100" : ""
							}`}
							onClick={() => onRSVP(event.id, "declined")}
						>
							Decline
						</Button>
					</div>
				)}

				{/* Past Event */}
				{isPastEvent && (
					<Button variant="outline" className="w-full" disabled>
						Event Completed
					</Button>
				)}
			</div>
		</div>
	);
}
