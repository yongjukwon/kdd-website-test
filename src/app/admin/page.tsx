import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getSupabaseServer } from "@/shared/supabase-server";
import { isBefore, isToday } from "date-fns";
import {
	ArrowRightIcon,
	CalendarIcon,
	ImageIcon,
	PlusIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function AdminDashboard() {
	const supabase = await getSupabaseServer();

	// Fetch counts for stats
	const { count: usersCount } = await supabase
		.from("users")
		.select("*", { count: "exact", head: true });

	const { count: eventsCount } = await supabase
		.from("events")
		.select("*", { count: "exact", head: true });

	const { count: photosCount } = await supabase
		.from("photos")
		.select("*", { count: "exact", head: true });

	const { count: upcomingEventsCount } = await supabase
		.from("events")
		.select("*", { count: "exact", head: true })
		.gte("date", new Date().toISOString())
		.eq("is_published", "published");

	// Get recent events
	let events: any[] = [];
	try {
		const { data } = await supabase
			.from("events")
			.select("id, title, date, is_published")
			.order("date", { ascending: false })
			.limit(5);

		events = data || [];
	} catch (error) {
		console.error("Error fetching recent events:", error);
	}

	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold">Admin Dashboard</h1>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<UsersIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{usersCount || 0}</div>
						<p className="text-xs text-muted-foreground">Registered members</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Events</CardTitle>
						<CalendarIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{eventsCount || 0}</div>
						<p className="text-xs text-muted-foreground">Events created</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Upcoming Events
						</CardTitle>
						<ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{upcomingEventsCount || 0}</div>
						<p className="text-xs text-muted-foreground">
							Published events in the future
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Photos</CardTitle>
						<ImageIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{photosCount || 0}</div>
						<p className="text-xs text-muted-foreground">Photos uploaded</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Events */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Recent Events</h2>
					<Link href="/admin/events">
						<Button variant="outline" size="sm">
							View All <ArrowRightIcon className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>

				<div className="rounded-lg border">
					<div className="overflow-hidden">
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-slate-100 text-left">
									<th className="px-4 py-3 font-medium">Title</th>
									<th className="px-4 py-3 font-medium">Date</th>
									<th className="px-4 py-3 font-medium">Status</th>
								</tr>
							</thead>
							<tbody>
								{events && events.length > 0 ? (
									events.map((event) => (
										<tr key={event.id} className="border-t border-slate-200">
											<td className="px-4 py-3">
												<Link
													href={`/admin/events/${event.id}`}
													className="hover:underline text-blue-600"
												>
													{event.title}
												</Link>
											</td>
											<td className="px-4 py-3">
												{new Date(event.date).toLocaleDateString()}
											</td>
											<td className="px-4 py-3">
												<span
													className={`inline-block rounded-full px-2 py-1 text-xs ${
														!event.is_published
															? "bg-amber-100 text-amber-800"
															: isToday(new Date(event.date))
															? "bg-blue-100 text-blue-800"
															: isBefore(new Date(event.date), new Date())
															? "bg-slate-100 text-slate-800"
															: "bg-green-100 text-green-800"
													}`}
												>
													{!event.is_published
														? "Draft"
														: isToday(new Date(event.date))
														? "Ongoing"
														: isBefore(new Date(event.date), new Date())
														? "Past"
														: "Upcoming"}
												</span>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan={3}
											className="px-4 py-3 text-center text-slate-500"
										>
											No events found
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Quick Actions</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Link href="/admin/events/new">
						<Card className="hover:bg-slate-50 transition-colors cursor-pointer">
							<CardContent className="p-6 flex items-center space-x-4">
								<div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
									<CalendarIcon className="h-6 w-6 text-blue-600" />
								</div>
								<div>
									<h3 className="font-medium">Create New Event</h3>
									<p className="text-sm text-slate-500">
										Add a new event to the calendar
									</p>
								</div>
							</CardContent>
						</Card>
					</Link>

					<Link href="/admin/photos/upload">
						<Card className="hover:bg-slate-50 transition-colors cursor-pointer">
							<CardContent className="p-6 flex items-center space-x-4">
								<div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
									<ImageIcon className="h-6 w-6 text-purple-600" />
								</div>
								<div>
									<h3 className="font-medium">Upload Photos</h3>
									<p className="text-sm text-slate-500">
										Add new photos to the gallery
									</p>
								</div>
							</CardContent>
						</Card>
					</Link>

					<Link href="/admin/users">
						<Card className="hover:bg-slate-50 transition-colors cursor-pointer">
							<CardContent className="p-6 flex items-center space-x-4">
								<div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
									<UserIcon className="h-6 w-6 text-green-600" />
								</div>
								<div>
									<h3 className="font-medium">Manage Users</h3>
									<p className="text-sm text-slate-500">
										View and edit user information
									</p>
								</div>
							</CardContent>
						</Card>
					</Link>
				</div>
			</div>
		</div>
	);
}
