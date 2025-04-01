import { getSupabaseServer } from "@/shared/supabase-server";
import AdminSidebar from "@/widgets/AdminSidebar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "KDD Admin Dashboard",
	description: "Admin dashboard for managing KDD website",
};

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await getSupabaseServer();

	// Check if the user is authenticated using getUser() for security
	const {
		data: { user },
	} = await supabase.auth.getUser();

	console.log(
		"Admin layout - User check:",
		user?.email || "No authenticated user"
	);

	if (!user) {
		// If no authenticated user exists, redirect to login
		redirect("/auth/signin?redirect=/admin");
	}

	// Check if the user has admin role
	const { data: userData } = await supabase
		.from("users")
		.select("role")
		.eq("id", user.id)
		.single();

	console.log(
		"Admin layout - User role check:",
		userData?.role || "No role data"
	);

	if (userData?.role !== "admin") {
		// If user is not an admin, redirect to home
		redirect("/");
	}

	return (
		<div className="flex min-h-screen bg-slate-50">
			<AdminSidebar />
			<div className="flex-1 p-8">
				<div className="max-w-7xl mx-auto">{children}</div>
			</div>
		</div>
	);
}
