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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { User } from "@/entities/user";
import { format } from "date-fns";
import {
	CheckCircle,
	Edit,
	Mail,
	MoreHorizontal,
	Search,
	Trash2,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserTableProps {
	users: User[];
	count: number;
	page: number;
	perPage: number;
	search: string;
}

export function UserTable({
	users,
	count,
	page,
	perPage,
	search,
}: UserTableProps) {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState(search);
	const [isSearching, setIsSearching] = useState(false);
	const [userToDelete, setUserToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [updatingRole, setUpdatingRole] = useState<string | null>(null);

	const totalPages = Math.ceil(count / perPage);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSearching(true);
		router.push(`/admin/users?search=${encodeURIComponent(searchTerm)}`);
		setIsSearching(false);
	};

	const handlePageChange = (newPage: number) => {
		router.push(
			`/admin/users?page=${newPage}&search=${encodeURIComponent(search)}`
		);
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;

		setIsDeleting(true);
		try {
			// This API endpoint would need to be created
			const response = await fetch(`/api/users/${userToDelete}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete user");
			}

			// Refresh the page to show updated data
			router.refresh();
		} catch (error) {
			console.error("Error deleting user:", error);
		} finally {
			setIsDeleting(false);
			setUserToDelete(null);
		}
	};

	const handleRoleChange = async (userId: string, newRole: string) => {
		setUpdatingRole(userId);
		try {
			const response = await fetch(`/api/users/${userId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ role: newRole }),
			});

			if (!response.ok) {
				throw new Error("Failed to update user role");
			}

			// Refresh the page to show updated data
			router.refresh();
		} catch (error) {
			console.error("Error updating user role:", error);
		} finally {
			setUpdatingRole(null);
		}
	};

	return (
		<div className="space-y-4">
			{/* Search */}
			<form
				onSubmit={handleSearch}
				className="flex w-full max-w-sm items-center space-x-2"
			>
				<Input
					type="search"
					placeholder="Search users..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="flex-1"
				/>
				<Button type="submit" disabled={isSearching}>
					<Search className="mr-2 h-4 w-4" />
					{isSearching ? "Searching..." : "Search"}
				</Button>
			</form>

			{/* Users Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Newsletter</TableHead>
							<TableHead>Joined</TableHead>
							<TableHead className="w-[80px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									No users found.
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											{user.profile_image ? (
												<img
													src={user.profile_image}
													alt={`${user.first_name || ""} ${
														user.last_name || ""
													}`}
													className="h-8 w-8 rounded-full object-cover"
												/>
											) : (
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
													{user.first_name?.[0] || user.email?.[0] || "?"}
												</div>
											)}
											<div>
												{user.first_name || user.last_name ? (
													<div>
														{user.first_name} {user.last_name}
													</div>
												) : (
													<div className="text-slate-500">Unnamed User</div>
												)}
												{user.job_title && (
													<div className="text-xs text-slate-500">
														{user.job_title}
													</div>
												)}
											</div>
										</div>
									</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={
												user.role === "admin"
													? "border-blue-200 bg-blue-100 text-blue-800"
													: undefined
											}
										>
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										{user.newsletter_subscribed ? (
											<CheckCircle className="h-5 w-5 text-green-500" />
										) : (
											<XCircle className="h-5 w-5 text-slate-300" />
										)}
									</TableCell>
									<TableCell>
										{user.created_at &&
											format(new Date(user.created_at), "MMM d, yyyy")}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<MoreHorizontal className="h-4 w-4" />
													<span className="sr-only">Actions</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => setSelectedUser(user)}>
													<Edit className="mr-2 h-4 w-4" />
													Edit Role
												</DropdownMenuItem>
												<DropdownMenuItem asChild className="text-slate-600">
													<a
														href={`mailto:${user.email}`}
														target="_blank"
														rel="noopener noreferrer"
													>
														<Mail className="mr-2 h-4 w-4" />
														Send Email
													</a>
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-red-600 focus:text-red-700"
													onClick={() => setUserToDelete(user.id)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
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

			{/* Edit Role Dialog */}
			<Dialog
				open={!!selectedUser}
				onOpenChange={(open) => !open && setSelectedUser(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change User Role</DialogTitle>
						<DialogDescription>
							Update the role for {selectedUser?.first_name}{" "}
							{selectedUser?.last_name || ""}({selectedUser?.email}).
						</DialogDescription>
					</DialogHeader>

					<div className="py-4 flex flex-col gap-4">
						<Button
							variant="outline"
							className={
								selectedUser?.role === "user" ? "bg-blue-50" : undefined
							}
							onClick={() =>
								selectedUser && handleRoleChange(selectedUser.id, "user")
							}
							disabled={updatingRole === selectedUser?.id}
						>
							<span className="flex-1 text-left">User</span>
							{selectedUser?.role === "user" && (
								<CheckCircle className="h-4 w-4 text-blue-600" />
							)}
						</Button>

						<Button
							variant="outline"
							className={
								selectedUser?.role === "admin" ? "bg-blue-50" : undefined
							}
							onClick={() =>
								selectedUser && handleRoleChange(selectedUser.id, "admin")
							}
							disabled={updatingRole === selectedUser?.id}
						>
							<span className="flex-1 text-left">Admin</span>
							{selectedUser?.role === "admin" && (
								<CheckCircle className="h-4 w-4 text-blue-600" />
							)}
						</Button>
					</div>

					<DialogFooter>
						<Button
							variant="secondary"
							onClick={() => setSelectedUser(null)}
							disabled={updatingRole === selectedUser?.id}
						>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation */}
			<AlertDialog
				open={!!userToDelete}
				onOpenChange={(open) => !open && setUserToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							user account and remove all their data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteUser}
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
