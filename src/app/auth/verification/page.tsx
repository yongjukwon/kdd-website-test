import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function VerificationPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50 text-center">
			<div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
				<div className="flex justify-center mb-6">
					<div className="bg-blue-50 p-3 rounded-full">
						<CheckCircle2 className="h-12 w-12 text-blue-500" />
					</div>
				</div>

				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Check your email
				</h1>
				<p className="text-gray-600 mb-6">
					We've sent you a verification link to your email address. Please check
					your inbox and click the link to verify your account.
				</p>

				<div className="space-y-4">
					<p className="text-sm text-gray-500">
						If you don't see the email, check other places like your spam, junk,
						social, or other folders.
					</p>

					<div className="pt-4 border-t border-gray-200">
						<Link href="/auth/signin">
							<Button variant="outline" className="w-full">
								Back to Sign In
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
