import { SignUpForm } from "@/features/auth/SignUpForm";

export default function SignUpPage() {
	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
			<div className="w-full max-w-md">
				<SignUpForm />
			</div>
		</div>
	);
}
