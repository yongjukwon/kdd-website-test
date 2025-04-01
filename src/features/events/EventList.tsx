"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isBefore, isToday } from "date-fns";
import { CalendarIcon, Globe, MapPinIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

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
	participantCount: number;
	is_published: boolean;
}

// Type for our filtered events
type EventStatus = "happening" | "upcoming" | "past";

// Props for the EventList component
interface EventListProps {
	events: Event[];
	userRsvpStatus: Record<string, "rsvp" | "declined">;
	currentUser: any;
}

// Utility function to format date
function formatEventDate(dateStr: string): string {
	const date = new Date(dateStr);
	return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
}

export function EventList({
	events,
	userRsvpStatus,
	currentUser,
}: EventListProps) {
	const [rsvpStatus, setRsvpStatus] = useState<
		Record<string, "rsvp" | "declined" | null>
	>(userRsvpStatus || {});
	const router = useRouter();

	// Determine event status based on date
	const categorizeEvent = (event: Event): EventStatus => {
		const eventDate = new Date(event.date);
		const now = new Date();

		// If the event is happening today, mark as happening
		if (isToday(eventDate)) {
			return "happening";
		}

		// If the event date is before today, mark as past
		if (isBefore(eventDate, now)) {
			return "past";
		}

		// Otherwise it's upcoming
		return "upcoming";
	};

	// Filter events by status
	const happeningEvents = events
		.filter(
			(event) => categorizeEvent(event) === "happening" && event.is_published
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

			// Refresh the page to show updated data
			router.refresh();
		} catch (err) {
			console.error("Error updating RSVP:", err);
			// Could add a toast notification here
		}
	};

	return (
		<Tabs defaultValue="upcoming" className="flex-grow flex flex-col">
			<TabsList className="w-full max-w-3xl mx-auto grid-cols-3 mb-10">
				<TabsTrigger value="happening" className="text-base py-3">
					Ongoing
					<Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700">
						{happeningEvents.length}
					</Badge>
				</TabsTrigger>
				<TabsTrigger value="upcoming" className="text-base py-3">
					Upcoming
					<Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700">
						{upcomingEvents.length}
					</Badge>
				</TabsTrigger>
				<TabsTrigger value="past" className="text-base py-3">
					Past
					<Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700">
						{pastEvents.length}
					</Badge>
				</TabsTrigger>
			</TabsList>

			{/* Ongoing Events */}
			<TabsContent value="happening" className="flex-grow">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{happeningEvents.map((event) => (
						<EventCard
							key={event.id}
							event={event}
							rsvpStatus={rsvpStatus[event.id]}
							onRSVP={handleRSVP}
						/>
					))}
					{happeningEvents.length === 0 && (
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
	);
}

// Event Card Component
interface EventCardProps {
	event: Event;
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
	// Generate mock images for events
	const mockImages = [
		"/images/events/event1.jpg",
		"/images/events/event2.jpg",
		"/images/events/event3.jpg",
		"/images/events/event4.jpg",
		"/images/events/event5.jpg",
	];

	// Generate a consistent index for this event
	const eventIdNum = parseInt(
		event.id.replace(/[^0-9]/g, "").substring(0, 5) || "0"
	);
	const imageIndex = eventIdNum % mockImages.length;

	// Use poster image if available, otherwise use mock image
	const imageSrc = event.poster_image || mockImages[imageIndex];

	// Determine event status based on date
	const eventDate = new Date(event.date);
	const isOngoing = isToday(eventDate);
	const isPastEvent = isPast || isBefore(eventDate, new Date());

	return (
		<div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
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
