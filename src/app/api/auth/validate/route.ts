import { getCurrentUser } from "@/shared/auth/get-user";
import { NextResponse } from "next/server";

export async function GET() {
	const authState = await getCurrentUser();
	return NextResponse.json(authState, {
		status: authState.error ? 401 : 200,
	});
}
