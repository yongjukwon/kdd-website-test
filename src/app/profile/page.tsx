"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUserBrowser } from "@/lib/supabase/auth-browser";
import { setupSecureAuthListener } from "@/shared/handle-auth-state-change";
import { getSupabaseBrowser } from "@/shared/supabase-browser";
import { format } from "date-fns";
import { Calendar, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define types for better TypeScript support
interface UserProfile {
	id: string;
	email: string;
	created_at: string;
	email_confirmed_at?: string;
	first_name?: string;
	last_name?: string;
	job_title?: string;
	bio?: string;
	newsletter_subscribed?: boolean;
	profile_image?: string;
	user_metadata?: {
		full_name?: string;
	};
	role?: string;
}

interface Event {
	id: string;
	title: string;
	date: string;
	location?: string;
	status: string;
}

interface AuthError {
	message?: string;
}

export default function ProfilePage() {
	const router = useRouter();
	const [user, setUser] = useState<UserProfile | null>(null);
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const supabase = getSupabaseBrowser();

	// Load user profile and events
	async function loadProfile() {
		setLoading(true);
		setError(null);

		try {
			// Use getCurrentUserBrowser which now uses getUser() internally for security
			const { user: userData, error: userError } =
				await getCurrentUserBrowser();

			console.log(
				"[ProfilePage] User data:",
				userData?.email,
				"Error:",
				(userError as AuthError)?.message || "No error"
			);

			if (userError || !userData) {
				console.error("[ProfilePage] Error getting user:", userError);
				setError("Could not load your profile. Please try signing in again.");
				router.push("/auth/signin");
				return;
			}

			setUser(userData as UserProfile);

			// Fetch the user's event participation history
			try {
				const response = await fetch(`/api/users/events`, {
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (response.ok) {
					const eventData = await response.json();
					setEvents(eventData);
					console.log("[ProfilePage] Events loaded:", eventData.length);
				} else {
					console.error("[ProfilePage] Event fetch error:", response.status);
					setError("Could not load your events. Please try again later.");
				}
			} catch (err) {
				console.error("[ProfilePage] Error fetching user events:", err);
				setError(
					"Could not connect to the server. Please check your internet connection."
				);
			}
		} catch (err) {
			console.error("[ProfilePage] Unexpected error:", err);
			setError(
				"An unexpected error occurred. Please refresh the page or try again later."
			);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		// Initial profile load
		loadProfile();

		// Set up secure auth state change listener
		const subscription = setupSecureAuthListener({
			supabase,
			debugPrefix: "ProfilePage",
			onAuthenticated: () => {
				// Re-fetch user profile when authenticated
				loadProfile();
			},
			onUnauthenticated: () => {
				setUser(null);
				setLoading(false);
				setError("You are not signed in. Please sign in to view your profile.");
				router.push("/auth/signin");
			},
			onSignedOut: () => {
				setUser(null);
				setLoading(false);
				// Direct redirect to home page
				window.location.href = "/";
			},
		});

		// Clean up the subscription
		return () => {
			subscription.unsubscribe();
		};
	}, [router, supabase]);

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-16 flex justify-center">
				<div className="w-full max-w-2xl">
					<div className="h-32 bg-gray-200 animate-pulse rounded-t-lg"></div>
					<div className="p-6 bg-white rounded-b-lg shadow">
						<div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded mb-4"></div>
						<div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-2"></div>
						<div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-16 flex justify-center">
				<div className="w-full max-w-2xl">
					<Card className="border shadow-lg">
						<CardHeader>
							<CardTitle className="text-2xl">Error Loading Profile</CardTitle>
							<CardDescription>We encountered a problem</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-red-600">{error}</p>
						</CardContent>
						<CardFooter className="flex justify-end space-x-2 border-t p-6">
							<Button variant="outline" onClick={() => router.push("/")}>
								Go to Home
							</Button>
							<Button
								variant="default"
								onClick={() => router.push("/auth/signin")}
							>
								Sign In Again
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="container mx-auto px-4 py-16 flex justify-center">
				<div className="w-full max-w-2xl">
					<Card className="border shadow-lg">
						<CardHeader>
							<CardTitle className="text-2xl">User Not Found</CardTitle>
							<CardDescription>Please sign in again</CardDescription>
						</CardHeader>
						<CardFooter className="flex justify-end space-x-2 border-t p-6">
							<Button
								variant="default"
								onClick={() => router.push("/auth/signin")}
							>
								Sign In
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-16 flex justify-center">
			<div className="w-full max-w-3xl">
				<Card className="border shadow-lg">
					<div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
						<div className="absolute -bottom-12 left-6">
							<div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white">
								{user.profile_image ? (
									<img
										src={user.profile_image}
										alt="Profile"
										className="w-full h-full rounded-full object-cover"
									/>
								) : (
									<User className="h-12 w-12 text-gray-700" />
								)}
							</div>
						</div>
					</div>

					<CardHeader className="pt-16">
						<CardTitle className="text-2xl">
							{user.first_name && user.last_name
								? `${user.first_name} ${user.last_name}`
								: user.user_metadata?.full_name ||
								  user.email?.split("@")[0] ||
								  "User"}
						</CardTitle>
						<CardDescription>{user.email}</CardDescription>
						{user.job_title && (
							<div className="mt-1 text-sm text-gray-600">{user.job_title}</div>
						)}
					</CardHeader>

					<CardContent>
						<Tabs defaultValue="info" className="w-full">
							<TabsList className="mb-4">
								<TabsTrigger value="info">Profile Info</TabsTrigger>
								<TabsTrigger value="events">My Events</TabsTrigger>
							</TabsList>

							<TabsContent value="info" className="space-y-4">
								<div>
									<h3 className="text-sm font-medium text-gray-500">
										Account Information
									</h3>
									<div className="mt-2 border rounded-md p-4 bg-gray-50">
										<div className="grid grid-cols-2 gap-3">
											<div className="text-sm font-medium">User ID</div>
											<div className="text-sm text-gray-600 truncate">
												{user.id}
											</div>

											<div className="text-sm font-medium">Email</div>
											<div className="text-sm text-gray-600">{user.email}</div>

											<div className="text-sm font-medium">Email Verified</div>
											<div className="text-sm text-gray-600">
												{user.email_confirmed_at ? "Yes" : "No"}
											</div>

											<div className="text-sm font-medium">Created</div>
											<div className="text-sm text-gray-600">
												{new Date(user.created_at).toLocaleDateString()}
											</div>

											{user.bio && (
												<>
													<div className="text-sm font-medium">Bio</div>
													<div className="text-sm text-gray-600">
														{user.bio}
													</div>
												</>
											)}

											{user.newsletter_subscribed !== undefined && (
												<>
													<div className="text-sm font-medium">Newsletter</div>
													<div className="text-sm text-gray-600">
														{user.newsletter_subscribed
															? "Subscribed"
															: "Not subscribed"}
													</div>
												</>
											)}
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="events">
								<div className="space-y-4">
									<h3 className="text-sm font-medium text-gray-500">
										Events I&apos;ve Participated In
									</h3>

									{events.length === 0 ? (
										<div className="text-center py-8 border rounded-md">
											<p className="text-gray-500">
												You haven&apos;t participated in any events yet.
											</p>
											<Button
												variant="outline"
												className="mt-2"
												onClick={() => router.push("/events")}
											>
												Browse Events
											</Button>
										</div>
									) : (
										<div className="space-y-3">
											{events.map((event) => (
												<div
													key={event.id}
													className="border rounded-md p-4 hover:bg-slate-50 transition-colors"
													onClick={() => router.push(`/events/${event.id}`)}
													style={{ cursor: "pointer" }}
												>
													<div className="flex justify-between items-start">
														<h4 className="font-medium">{event.title}</h4>
														<Badge>{event.status}</Badge>
													</div>
													<div className="mt-2 space-y-1 text-sm">
														<div className="flex items-center text-gray-600">
															<Calendar className="mr-2 h-4 w-4" />
															{format(
																new Date(event.date),
																"MMMM d, yyyy 'at' h:mm a"
															)}
														</div>
														{event.location && (
															<div className="flex items-center text-gray-600">
																<MapPin className="mr-2 h-4 w-4" />
																{event.location}
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>

					<CardFooter className="flex justify-end space-x-2 border-t p-6">
						<Button variant="outline" onClick={() => router.push("/")}>
							Go to Home
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
