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
import { signInWithOAuth, signUpWithEmail } from "@/features/auth/action";
import { getSupabaseBrowser } from "@/shared/supabase-browser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define form validation schema
const formSchema = z
	.object({
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		password: z.string().min(8, {
			message: "Password must be at least 8 characters.",
		}),
		confirmPassword: z.string(),
		terms: z.boolean().refine((val) => val === true, {
			message: "You must agree to the terms and conditions.",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export function SignUpForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const supabase = getSupabaseBrowser();

	// Initialize form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			terms: false,
		},
	});

	// Handle form submission
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);

		try {
			// Sign up with Supabase using server action
			const result = await signUpWithEmail(values.email, values.password);

			if (result.error) {
				throw new Error(result.error);
			}

			// Handle successful sign-up
			// If auto-confirm is disabled, show a verification message
			if (result.user && !result.session) {
				router.push("/auth/verification");
			} else {
				// Redirect to dashboard or home
				router.push("/");
			}
		} catch (error: any) {
			console.error("Error signing up:", error);
			setError(error.message || "An error occurred during sign up");
		} finally {
			setIsLoading(false);
		}
	}

	// Handle Google sign-in
	async function handleGoogleSignIn() {
		setIsLoading(true);
		setError(null);

		try {
			const result = await signInWithOAuth("google");

			if (result.error) {
				throw new Error(result.error);
			}

			// If we have a URL, redirect the user
			if (result.url) {
				window.location.href = result.url;
			}
		} catch (error: any) {
			console.error("Error signing in with Google:", error);
			setError(error.message || "An error occurred during Google sign in");
			setIsLoading(false);
		}
	}

	return (
		<Card className="w-full max-w-md mx-auto shadow-lg">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-bold">Create an account</CardTitle>
				<CardDescription>
					Enter your email below to create your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 text-sm">
						{error}
					</div>
				)}

				{/* Google Sign-in Button */}
				<div className="mb-6">
					<Button
						variant="outline"
						className="w-full flex items-center justify-center gap-2"
						onClick={handleGoogleSignIn}
						disabled={isLoading}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							className="w-5 h-5"
						>
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Sign up with Google
					</Button>
				</div>

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-gray-300" />
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="bg-white px-2 text-gray-500">
							Or continue with
						</span>
					</div>
				</div>

				{/* Email/Password Form */}
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="your.email@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="********" {...field} />
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
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="********" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="mt-6">
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input
										id="terms"
										type="checkbox"
										className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										{...form.register("terms")}
									/>
								</div>
								<div className="ml-3 text-sm">
									<label htmlFor="terms" className="text-gray-600">
										I agree to the{" "}
										<a
											href="/terms"
											className="text-blue-600 hover:text-blue-800"
										>
											Terms of Service
										</a>{" "}
										and{" "}
										<a
											href="/privacy"
											className="text-blue-600 hover:text-blue-800"
										>
											Privacy Policy
										</a>
									</label>
									{form.formState.errors.terms && (
										<p className="text-sm text-red-600 mt-1">
											{form.formState.errors.terms.message}
										</p>
									)}
								</div>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creating account..." : "Create account"}
						</Button>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="flex flex-col items-center justify-center p-6 border-t">
				<div className="text-sm text-gray-600">
					Already have an account?{" "}
					<a
						href="/auth/signin"
						className="text-blue-600 hover:text-blue-800 font-medium"
					>
						Sign in
					</a>
				</div>
			</CardFooter>
		</Card>
	);
}
