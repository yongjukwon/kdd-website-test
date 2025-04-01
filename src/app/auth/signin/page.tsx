import { SignInForm } from "@/features/auth/SignInForm";

export default function SignInPage() {
	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
			<div className="w-full max-w-md">
				<SignInForm />
			</div>
		</div>
	);
}
