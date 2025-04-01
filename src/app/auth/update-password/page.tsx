"use client";

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
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define form validation schema
const formSchema = z
	.object({
		password: z.string().min(8, {
			message: "Password must be at least 8 characters.",
		}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export default function UpdatePasswordPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [isVerified, setIsVerified] = useState(false);

	// Check if user has a valid reset token
	useEffect(() => {
		async function checkSession() {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				setMessage(
					"Invalid or expired password reset link. Please request a new password reset."
				);
				setIsVerified(false);
			} else {
				setIsVerified(true);
			}
		}

		checkSession();
	}, []);

	// Initialize form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	// Handle form submission
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);

		try {
			// Update password with Supabase
			const { error } = await supabase.auth.updateUser({
				password: values.password,
			});

			if (error) {
				throw error;
			}

			// Show success message
			setIsSuccess(true);
			form.reset();

			// Redirect after 3 seconds
			setTimeout(() => {
				router.push("/auth/signin");
			}, 3000);
		} catch (error: any) {
			console.error("Error updating password:", error);
			setError(
				error.message || "An error occurred when updating your password"
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
			<div className="w-full max-w-md">
				<Card className="shadow-lg">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold">
							Update your password
						</CardTitle>
						<CardDescription>Enter your new password below</CardDescription>
					</CardHeader>
					<CardContent>
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 text-sm">
								{error}
							</div>
						)}

						{isSuccess && (
							<div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-3 mb-4 text-sm">
								Your password has been updated successfully. You will be
								redirected to the sign in page.
							</div>
						)}

						{message && !isVerified && (
							<div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md p-3 mb-4 text-sm">
								{message}
								<div className="mt-2">
									<Button
										variant="link"
										className="p-0 text-yellow-700 underline"
										onClick={() => router.push("/auth/reset-password")}
									>
										Request a new password reset
									</Button>
								</div>
							</div>
						)}

						{isVerified && !isSuccess && (
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>New Password</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="********"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Confirm New Password</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="********"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? "Updating password..." : "Update password"}
									</Button>
								</form>
							</Form>
						)}
					</CardContent>
					<CardFooter className="flex justify-center border-t p-6">
						<div className="text-sm text-gray-600">
							Remember your password?{" "}
							<a
								href="/auth/signin"
								className="text-blue-600 hover:text-blue-800 font-medium"
							>
								Back to sign in
							</a>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
