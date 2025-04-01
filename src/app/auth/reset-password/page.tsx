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
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define form validation schema
const formSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
});

export default function ResetPasswordPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	// Initialize form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	// Handle form submission
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);
		setIsSuccess(false);

		try {
			// Reset password with Supabase
			const { error } = await supabase.auth.resetPasswordForEmail(
				values.email,
				{
					redirectTo: `${window.location.origin}/auth/update-password`,
				}
			);

			if (error) {
				throw error;
			}

			// Show success message
			setIsSuccess(true);
			form.reset();
		} catch (error: any) {
			console.error("Error resetting password:", error);
			setError(
				error.message || "An error occurred when trying to reset your password"
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
							Reset your password
						</CardTitle>
						<CardDescription>
							Enter your email address and we'll send you a link to reset your
							password
						</CardDescription>
					</CardHeader>
					<CardContent>
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 text-sm">
								{error}
							</div>
						)}

						{isSuccess && (
							<div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-3 mb-4 text-sm">
								Password reset link has been sent to your email.
							</div>
						)}

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													placeholder="your.email@example.com"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? "Sending reset link..." : "Send reset link"}
								</Button>
							</form>
						</Form>
					</CardContent>
					<CardFooter className="flex justify-center border-t p-6">
						<div className="text-sm text-gray-600">
							Remember your password?{" "}
							<Link
								href="/auth/signin"
								className="text-blue-600 hover:text-blue-800 font-medium"
							>
								Back to sign in
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
