"use client";

import { cn } from "@/lib/utils";
import {
	BarChart3,
	CalendarClock,
	Home,
	Image,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
	href: string;
	icon: React.ReactNode;
	label: string;
}

function SidebarItem({ href, icon, label }: SidebarItemProps) {
	const pathname = usePathname();
	const isActive = pathname === href || pathname.startsWith(`${href}/`);

	return (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
				isActive
					? "bg-blue-100 text-blue-900 font-medium"
					: "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
			)}
		>
			<div
				className={cn(
					"flex h-6 w-6 items-center justify-center",
					isActive && "text-blue-900"
				)}
			>
				{icon}
			</div>
			<span>{label}</span>
		</Link>
	);
}

export default function AdminSidebar() {
	return (
		<div className="w-64 border-r border-slate-200 bg-white pt-10">
			<div className="mb-8 flex items-center gap-2 px-3">
				<span className="text-xl font-bold text-blue-600">KDD Admin</span>
			</div>
			<nav className="space-y-1">
				<SidebarItem
					href="/admin"
					icon={<Home size={20} />}
					label="Dashboard"
				/>
				<SidebarItem
					href="/admin/events"
					icon={<CalendarClock size={20} />}
					label="Events"
				/>
				<SidebarItem
					href="/admin/photos"
					icon={<Image size={20} />}
					label="Photos"
				/>
				<SidebarItem
					href="/admin/users"
					icon={<Users size={20} />}
					label="Users"
				/>
				<SidebarItem
					href="/admin/analytics"
					icon={<BarChart3 size={20} />}
					label="Analytics"
				/>
				<SidebarItem
					href="/admin/settings"
					icon={<Settings size={20} />}
					label="Settings"
				/>
			</nav>
		</div>
	);
}
