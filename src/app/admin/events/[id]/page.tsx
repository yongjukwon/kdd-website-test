import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServer } from "@/shared/supabase-server";
import { format } from "date-fns";
import {
	ArrowLeft,
	Calendar,
	DollarSign,
	Edit,
	Globe,
	MapPin,
	Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetailPage(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = await props.params;
    // Get the event data
    try {
		const id = await params.id;
		const supabase = await getSupabaseServer();
		const { data: event, error } = await supabase
			.from("events")
			.select("*, users!inner(first_name, last_name)")
			.eq("id", id)
			.single();

		if (error || !event) {
			notFound();
		}

		// Get participant count
		const { count: participantCount } = await supabase
			.from("event_participants")
			.select("*", { count: "exact" })
			.eq("event_id", id);

		// Determine event status based on date
		const getEventStatus = (event: any): string => {
			const eventDate = new Date(event.date);
			const now = new Date();

			if (eventDate.toDateString() === now.toDateString()) {
				return "ongoing";
			}

			if (eventDate < now) {
				return "past";
			}

			return "upcoming";
		};

		const getStatusBadge = (event: any) => {
			// If event is not published, show draft status
			if (!event.is_published) {
				return <Badge className="bg-amber-100 text-amber-800">Draft</Badge>;
			}

			// Otherwise, show status based on date
			const status = getEventStatus(event);

			switch (status) {
				case "upcoming":
					return (
						<Badge className="bg-green-100 text-green-800">Upcoming</Badge>
					);
				case "ongoing":
					return <Badge className="bg-blue-100 text-blue-800">Ongoing</Badge>;
				case "past":
					return <Badge className="bg-slate-100 text-slate-800">Past</Badge>;
				default:
					return <Badge>{status}</Badge>;
			}
		};

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Link href="/admin/events">
							<Button variant="ghost" size="sm">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Events
							</Button>
						</Link>
						<h1 className="text-3xl font-bold">{event.title}</h1>
						{getStatusBadge(event)}
					</div>
					<Link href={`/admin/events/${id}/edit`}>
						<Button>
							<Edit className="mr-2 h-4 w-4" />
							Edit Event
						</Button>
					</Link>
				</div>

				{event.subtitle && (
					<p className="text-xl text-muted-foreground">{event.subtitle}</p>
				)}

				<div className="grid gap-6 md:grid-cols-3">
					<Card className="md:col-span-2">
						<CardHeader>
							<CardTitle>Event Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center space-x-2">
								<Calendar className="h-5 w-5 text-muted-foreground" />
								<span>
									{format(
										new Date(event.date),
										"EEEE, MMMM d, yyyy 'at' h:mm a"
									)}
								</span>
							</div>

							{event.is_online ? (
								<div className="flex items-center space-x-2">
									<Globe className="h-5 w-5 text-muted-foreground" />
									<span>Online Event</span>
									{event.online_url && (
										<a
											href={event.online_url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline"
										>
											Join URL
										</a>
									)}
								</div>
							) : event.location ? (
								<div className="flex items-center space-x-2">
									<MapPin className="h-5 w-5 text-muted-foreground" />
									<span>{event.location}</span>
								</div>
							) : null}

							<div className="flex items-center space-x-2">
								<Users className="h-5 w-5 text-muted-foreground" />
								<span>
									{participantCount || 0} participants
									{event.capacity
										? ` / ${event.capacity} capacity`
										: " (unlimited capacity)"}
								</span>
							</div>

							<div className="flex items-center space-x-2">
								<DollarSign className="h-5 w-5 text-muted-foreground" />
								<span>
									{event.price ? `$${event.price.toFixed(2)}` : "Free"}
								</span>
							</div>

							{event.rsvp_deadline && (
								<div className="flex items-center space-x-2">
									<Calendar className="h-5 w-5 text-muted-foreground" />
									<span>
										RSVP Deadline:{" "}
										{format(new Date(event.rsvp_deadline), "MMMM d, yyyy")}
									</span>
								</div>
							)}

							{event.description && (
								<div className="mt-6">
									<h3 className="text-lg font-medium mb-2">Description</h3>
									<div className="prose max-w-none">
										<p className="whitespace-pre-wrap">{event.description}</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Event Organizer</CardTitle>
							</CardHeader>
							<CardContent>
								<p>
									{event.users.first_name || ""}{" "}
									{event.users.last_name || "Unknown"}
								</p>
							</CardContent>
						</Card>

						{event.poster_image && (
							<Card>
								<CardHeader>
									<CardTitle>Event Poster</CardTitle>
								</CardHeader>
								<CardContent>
									<img
										src={event.poster_image}
										alt={`Poster for ${event.title}`}
										className="w-full rounded-md"
									/>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error fetching event:", error);
		notFound();
	}
}
