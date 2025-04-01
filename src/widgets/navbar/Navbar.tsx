"use client";

import { Button } from "@/components/ui/button";
import { AuthButtons } from "@/features/auth/AuthButtons";
import { getSupabaseBrowser } from "@/shared/supabase-browser";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserProfile {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	role?: string;
}

export function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [user, setUser] = useState<UserProfile | null>(null);

	useEffect(() => {
		const supabase = getSupabaseBrowser();

		// Initial auth check
		const checkUser = async () => {
			const {
				data: { user: authUser },
			} = await supabase.auth.getUser();
			if (authUser) {
				const { data: userData } = await supabase
					.from("users")
					.select("*")
					.eq("id", authUser.id)
					.single();

				setUser({ ...authUser, ...userData });
			} else {
				setUser(null);
			}
		};

		checkUser();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (session?.user) {
				const { data: userData } = await supabase
					.from("users")
					.select("*")
					.eq("id", session.user.id)
					.single();

				setUser({ ...session.user, ...userData });
			} else {
				setUser(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return (
		<nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b z-50 shadow-sm">
			<div className="container mx-auto px-4">
				<div className="flex h-20 items-center">
					{/* Logo */}
					<div className="flex-shrink-0 w-1/4">
						<Link href="/" className="flex items-center">
							<Image
								src="/KDD_eng.png"
								alt="KDD Logo"
								width={60}
								height={60}
								style={{ width: "auto" }}
								className="mr-2"
							/>
						</Link>
					</div>

					{/* Navigation Links - Always Centered */}
					<div className="flex-grow flex justify-center">
						<div className="hidden md:flex items-center space-x-4">
							<Link href="/about">
								<Button variant="ghost">About Us</Button>
							</Link>
							<Link href="/events">
								<Button variant="ghost">Events</Button>
							</Link>
							<Link href="/photos">
								<Button variant="ghost">Photos</Button>
							</Link>
							<Link href="/blogs">
								<Button variant="ghost">Blogs</Button>
							</Link>
							{user?.role === "admin" && (
								<Link href="/admin">
									<Button variant="ghost" className="text-blue-600">
										Admin page
									</Button>
								</Link>
							)}
						</div>
					</div>

					{/* Auth Buttons - Fixed Width */}
					<div className="flex-shrink-0 w-1/4 flex justify-end">
						<div className="hidden md:block">
							<AuthButtons />
						</div>

						{/* Mobile Menu Button */}
						<div className="md:hidden">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							>
								{mobileMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-white py-4 px-4 shadow-md">
					<div className="flex flex-col space-y-4">
						<Link href="/about" onClick={() => setMobileMenuOpen(false)}>
							<Button variant="ghost" className="w-full justify-start">
								About Us
							</Button>
						</Link>
						<Link href="/events" onClick={() => setMobileMenuOpen(false)}>
							<Button variant="ghost" className="w-full justify-start">
								Events
							</Button>
						</Link>
						<Link href="/photos" onClick={() => setMobileMenuOpen(false)}>
							<Button variant="ghost" className="w-full justify-start">
								Photos
							</Button>
						</Link>
						<Link href="/blogs" onClick={() => setMobileMenuOpen(false)}>
							<Button variant="ghost" className="w-full justify-start">
								Blogs
							</Button>
						</Link>
						{user?.role === "admin" && (
							<Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
								<Button
									variant="ghost"
									className="w-full justify-start text-blue-600"
								>
									Admin
								</Button>
							</Link>
						)}
						<div className="pt-2 border-t">
							<AuthButtons />
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
