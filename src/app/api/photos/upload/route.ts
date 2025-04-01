import { addPhoto, uploadPhotoToStorage } from "@/entities/photos";
import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// POST /api/photos/upload - Upload a local image as an admin (for initial seeding)
export async function POST(request: NextRequest) {
	try {
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();

		// Validate required fields
		if (!data.event_id || !data.filename) {
			return NextResponse.json(
				{ error: "Event ID and filename are required" },
				{ status: 400 }
			);
		}

		const { event_id, filename, caption } = data;

		// Check if the file exists in the public directory
		const filePath = path.join(process.cwd(), "public", "images", filename);
		if (!fs.existsSync(filePath)) {
			return NextResponse.json(
				{ error: `File not found: ${filePath}` },
				{ status: 404 }
			);
		}

		// Read file and convert to File object
		const buffer = fs.readFileSync(filePath);
		const file = new File([buffer], filename, {
			type: getContentType(filename),
		});

		// Upload to storage
		const imageUrl = await uploadPhotoToStorage(file, event_id);

		// Add to database
		const photoData = {
			event_id,
			image: imageUrl,
			caption: caption || null,
			uploaded_by_user_id: user.id,
		};

		const newPhoto = await addPhoto(photoData);
		return NextResponse.json(newPhoto, { status: 201 });
	} catch (error) {
		console.error("Error uploading photo:", error);
		return NextResponse.json(
			{ error: "Failed to upload photo" },
			{ status: 500 }
		);
	}
}

// Helper function to determine content type based on file extension
function getContentType(filename: string): string {
	const ext = path.extname(filename).toLowerCase();
	switch (ext) {
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		case ".png":
			return "image/png";
		case ".gif":
			return "image/gif";
		case ".webp":
			return "image/webp";
		default:
			return "application/octet-stream";
	}
}
