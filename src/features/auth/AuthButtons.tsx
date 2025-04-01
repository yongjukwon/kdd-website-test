"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/features/auth/action";
import { useDebug } from "@/shared/providers/DebugProvider";
import { getSupabaseBrowser } from "@/shared/supabase-browser";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Define a proper type for the user
interface UserProfile {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	role?: string;
}

export function AuthButtons() {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [initialCheckDone, setInitialCheckDone] = useState(false);
	const isMounted = useRef(true);
	const supabase = getSupabaseBrowser();
	const { updateDebugInfo } = useDebug();

	// Function to fetch user data including role
	const fetchUserData = async (userId: string) => {
		console.log("[AuthButtons] Fetching user data for:", userId);
		const { data: userData, error: userError } = await supabase
			.from("users")
			.select("*")
			.eq("id", userId)
			.single();

		if (userError) {
			console.error("[AuthButtons] User data error:", userError);
			updateDebugInfo({ userDataError: userError });
			return null;
		}

		console.log("[AuthButtons] User data fetched:", userData);
		updateDebugInfo({ userData });
		return userData;
	};

	// Function to check and update user state
	const checkUser = async () => {
		try {
			console.log("[AuthButtons] Checking user auth state...");
			const {
				data: { user: authUser },
				error: authError,
			} = await supabase.auth.getUser();

			if (!isMounted.current) return;

			// Only update debug info with error if it's not a missing session
			updateDebugInfo({
				authState: {
					user: authUser,
					error:
						authError?.name === "AuthSessionMissingError" ? null : authError,
					timestamp: new Date().toISOString(),
				},
			});

			if (authError && authError.name !== "AuthSessionMissingError") {
				console.error("[AuthButtons] Auth error:", authError);
				setUser(null);
				return;
			}

			if (!authUser) {
				console.log("[AuthButtons] No authenticated user");
				setUser(null);
				return;
			}

			console.log("[AuthButtons] Auth user found:", authUser.email);

			// Fetch additional user data
			const userData = await fetchUserData(authUser.id);
			const mergedUser = { ...authUser, ...userData };
			console.log("[AuthButtons] Merged user data:", mergedUser);

			setUser(mergedUser);
			updateDebugInfo({
				currentUser: mergedUser,
				authStatus: "authenticated",
			});
		} catch (err) {
			console.error("[AuthButtons] Error checking user:", err);
			updateDebugInfo({
				lastError: err as Error,
				errorTimestamp: new Date().toISOString(),
			});
			if (isMounted.current) {
				setUser(null);
			}
		} finally {
			if (isMounted.current) {
				setInitialCheckDone(true);
				setLoading(false);
				updateDebugInfo({
					loading,
					initialCheckDone,
				});
			}
		}
	};

	useEffect(() => {
		isMounted.current = true;
		console.log("[AuthButtons] Component mounted");
		updateDebugInfo({ componentStatus: "mounted" });

		// Initial auth check
		checkUser();

		// Set up auth state change listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log(
				"[AuthButtons] Auth state changed:",
				event,
				session?.user?.email
			);
			updateDebugInfo({
				lastAuthEvent: event,
				sessionStatus: session ? "active" : "none",
				eventTimestamp: new Date().toISOString(),
			});

			if (!isMounted.current) return;

			if (session?.user) {
				const userData = await fetchUserData(session.user.id);
				const mergedUser = { ...session.user, ...userData };
				setUser(mergedUser);
				updateDebugInfo({ currentUser: mergedUser });
			} else {
				setUser(null);
				updateDebugInfo({ currentUser: null });
			}
			setLoading(false);
		});

		return () => {
			console.log("[AuthButtons] Component unmounting");
			isMounted.current = false;
			subscription.unsubscribe();
			updateDebugInfo({ componentStatus: "unmounted" });
		};
	}, []);

	const handleSignOut = async () => {
		try {
			setLoading(true);
			console.log("[AuthButtons] Signing out...");
			updateDebugInfo({ status: "signing-out" });

			await signOut();
			setUser(null);
			updateDebugInfo({
				status: "signed-out",
				currentUser: null,
			});

			window.location.href = window.location.origin;
		} catch (err) {
			console.error("[AuthButtons] Error during sign out:", err);
			updateDebugInfo({
				signOutError: err as Error,
				errorTimestamp: new Date().toISOString(),
			});
			if (isMounted.current) {
				setLoading(false);
			}
		}
	};

	return (
		<div className="flex items-center space-x-2">
			{loading && !initialCheckDone ? (
				<>
					<Skeleton className="h-9 w-20 rounded" />
					<Skeleton className="h-9 w-20 rounded" />
				</>
			) : user ? (
				<>
					{user.role === "admin" && (
						<Link href="/admin">
							<Button
								variant="ghost"
								className="flex items-center space-x-2 text-blue-600"
							>
								<span>Admin Page</span>
							</Button>
						</Link>
					)}
					<Link href="/profile">
						<Button variant="ghost" className="flex items-center space-x-2">
							<User className="h-4 w-4" />
							<span>
								{user.first_name || user.email?.split("@")[0] || "Profile"}
							</span>
						</Button>
					</Link>
					<Button
						variant="outline"
						onClick={handleSignOut}
						className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
					>
						<LogOut className="h-4 w-4" />
						<span>Sign Out</span>
					</Button>
				</>
			) : (
				<>
					<Link href="/auth/signin">
						<Button variant="ghost" className="min-w-20">
							Sign In
						</Button>
					</Link>
					<Link href="/auth/signup">
						<Button variant="default" className="bg-neutral-800 min-w-20">
							Sign Up
						</Button>
					</Link>
				</>
			)}
		</div>
	);
}
