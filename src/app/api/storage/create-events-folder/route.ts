import { createEventsFolder } from "@/entities/photos";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic to ensure fresh execution
export const dynamic = "force-dynamic";

/**
 * API endpoint to create the events folder in the photos bucket
 * This can be called manually to ensure the folder exists
 */
export async function POST(request: NextRequest) {
	try {
		const result = await createEventsFolder();
		return NextResponse.json({
			success: true,
			message: "Events folder created successfully",
		});
	} catch (error) {
		console.error("Error creating events folder:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to create events folder",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
