import {
	subscribeToNewsletter,
	unsubscribeFromNewsletter,
} from "@/entities/newsletterSubscription";
import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextRequest, NextResponse } from "next/server";

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Check if the request is from a logged-in user
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		let userId = undefined;
		if (user) {
			userId = user.id;

			// Also update the user's newsletter_subscribed flag
			await supabase
				.from("users")
				.update({ newsletter_subscribed: true })
				.eq("id", userId);
		}

		const subscription = await subscribeToNewsletter(email, userId);

		return NextResponse.json(subscription, { status: 201 });
	} catch (error) {
		console.error("Error subscribing to newsletter:", error);
		return NextResponse.json(
			{ error: "Failed to subscribe to newsletter" },
			{ status: 500 }
		);
	}
}

// DELETE /api/newsletter - Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		// Await searchParams before accessing properties
		const params = await Promise.resolve(searchParams);
		const email = await params.get("email");

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// If user is logged in, update their preference
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user) {
			const { data: userData } = await supabase
				.from("users")
				.select("email")
				.eq("id", user.id)
				.single();

			if (userData && userData.email === email) {
				await supabase
					.from("users")
					.update({ newsletter_subscribed: false })
					.eq("id", user.id);
			}
		}

		await unsubscribeFromNewsletter(email);

		return NextResponse.json({
			message: "Successfully unsubscribed from newsletter",
		});
	} catch (error) {
		console.error("Error unsubscribing from newsletter:", error);
		return NextResponse.json(
			{ error: "Failed to unsubscribe from newsletter" },
			{ status: 500 }
		);
	}
}
