"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
	Calendar,
	Edit,
	Eye,
	MoreHorizontal,
	Trash2,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EventWithOrganizer = {
	id: string;
	title: string;
	date: string;
	location: string | null;
	is_published: boolean;
	users: {
		first_name: string | null;
		last_name: string | null;
	};
	capacity: number | null;
};

interface EventListProps {
	events: EventWithOrganizer[];
	count: number;
	page: number;
	perPage: number;
	published: string;
}

export function EventList({
	events,
	count,
	page,
	perPage,
	published,
}: EventListProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);
	const [eventToDelete, setEventToDelete] = useState<string | null>(null);

	const totalPages = Math.ceil(count / perPage);

	const handlePublishedChange = (newPublished: string) => {
		router.push(`/admin/events?published=${newPublished}`);
	};

	const handlePageChange = (newPage: number) => {
		router.push(`/admin/events?page=${newPage}&published=${published}`);
	};

	const handleDeleteEvent = async () => {
		if (!eventToDelete) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/events/${eventToDelete}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to delete event");
			}

			// Refresh the page to show updated data
			router.refresh();
		} catch (error) {
			console.error("Error deleting event:", error);
			// You could add toast notification here
		} finally {
			setIsDeleting(false);
			setEventToDelete(null);
		}
	};

	// Determine event status based on date
	const getEventStatus = (event: EventWithOrganizer): string => {
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

	const getStatusBadge = (event: EventWithOrganizer) => {
		const status = getEventStatus(event);

		if (!event.is_published) {
			return (
				<Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800">
					Draft
				</Badge>
			);
		}

		switch (status) {
			case "upcoming":
				return (
					<Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
						Upcoming
					</Badge>
				);
			case "ongoing":
				return (
					<Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800">
						Ongoing
					</Badge>
				);
			case "past":
				return (
					<Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 hover:text-slate-800">
						Past
					</Badge>
				);
			default:
				return <Badge>{status}</Badge>;
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2">
					<span className="text-sm text-slate-500">Filter:</span>
					<Select value={published} onValueChange={handlePublishedChange}>
						<SelectTrigger className="w-32">
							<SelectValue placeholder="All" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="true">Published</SelectItem>
							<SelectItem value="false">Draft</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="text-sm text-slate-500">
					Showing {events.length} of {count} events
				</div>
			</div>

			{events.length === 0 ? (
				<Card>
					<CardContent className="p-6 text-center text-slate-500">
						No events found. Create your first event to get started.
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{events.map((event) => (
						<Card key={event.id} className="overflow-hidden">
							<CardHeader className="p-4 pb-0">
								<div className="flex justify-between items-start">
									<CardTitle className="text-lg">{event.title}</CardTitle>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<MoreHorizontal className="h-4 w-4" />
												<span className="sr-only">Actions</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<Link
													href={`/events/${event.id}`}
													className="flex items-center"
												>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href={`/admin/events/${event.id}/edit`}
													className="flex items-center"
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-red-600 focus:text-red-700"
												onClick={() => setEventToDelete(event.id)}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
								<CardDescription>
									Organized by {event.users.first_name || ""}{" "}
									{event.users.last_name || "Unknown"}
								</CardDescription>
							</CardHeader>
							<CardContent className="p-4">
								<div className="space-y-2">
									<div className="flex items-center text-sm">
										<Calendar className="mr-2 h-4 w-4 text-slate-500" />
										<span>
											{format(new Date(event.date), "MMMM d, yyyy 'at' h:mm a")}
										</span>
									</div>
									{event.location && (
										<div className="flex items-center text-sm">
											<svg
												className="mr-2 h-4 w-4 text-slate-500"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
												<circle cx="12" cy="10" r="3" />
											</svg>
											<span className="truncate">{event.location}</span>
										</div>
									)}
									{event.capacity && (
										<div className="flex items-center text-sm">
											<Users className="mr-2 h-4 w-4 text-slate-500" />
											<span>Capacity: {event.capacity}</span>
										</div>
									)}
								</div>
							</CardContent>
							<CardFooter className="flex justify-between p-4 pt-0">
								{getStatusBadge(event)}
								<Link href={`/admin/events/${event.id}/edit`}>
									<Button variant="outline" size="sm">
										Manage
									</Button>
								</Link>
							</CardFooter>
						</Card>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<Pagination className="mt-6">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => handlePageChange(Math.max(1, page - 1))}
								className={
									page <= 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
								}
							/>
						</PaginationItem>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map(
							(pageNum) => (
								<PaginationItem key={pageNum}>
									<PaginationLink
										onClick={() => handlePageChange(pageNum)}
										isActive={pageNum === page}
									>
										{pageNum}
									</PaginationLink>
								</PaginationItem>
							)
						)}

						<PaginationItem>
							<PaginationNext
								onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
								className={
									page >= totalPages
										? "cursor-not-allowed opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}

			<AlertDialog
				open={!!eventToDelete}
				onOpenChange={(open) => !open && setEventToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							event and remove the data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteEvent}
							disabled={isDeleting}
							className="bg-red-600 hover:bg-red-700"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
