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
import { signInWithOAuth, signInWithPassword } from "@/features/auth/action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define form validation schema
const formSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	password: z.string().min(1, {
		message: "Password is required.",
	}),
	remember: z.boolean().default(false),
});

export function SignInForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			remember: false,
		},
	});

	// Handle form submission
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);

		try {
			console.log("Attempting sign in with email/password...");
			const result = await signInWithPassword(values.email, values.password);

			if (result.error) {
				throw new Error(result.error);
			}

			console.log("Sign in successful, refreshing page...");
			// Hard refresh the page to ensure cookies are properly applied
			window.location.href = "/";
		} catch (error: any) {
			console.error("Error signing in:", error);
			setError(error.message || "Invalid email or password");
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

			// If we have a URL to redirect to
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
				<CardTitle className="text-2xl font-bold">
					Sign in to your account
				</CardTitle>
				<CardDescription>
					Enter your credentials to access your account
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
						Sign in with Google
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
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="remember"
									className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									{...form.register("remember")}
								/>
								<label htmlFor="remember" className="text-sm text-gray-600">
									Remember me
								</label>
							</div>
							<a
								href="/auth/reset-password"
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								Forgot password?
							</a>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Signing in..." : "Sign in"}
						</Button>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="flex flex-col items-center justify-center p-6 border-t">
				<div className="text-sm text-gray-600">
					Don&apos;t have an account?{" "}
					<a
						href="/auth/signup"
						className="text-blue-600 hover:text-blue-800 font-medium"
					>
						Sign up
					</a>
				</div>
			</CardFooter>
		</Card>
	);
}
