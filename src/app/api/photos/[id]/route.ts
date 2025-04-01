import { deletePhoto } from "@/entities/photos";
import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/photos/[id] - Delete a photo
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const photoId = await params.id;
		const supabase = await getSupabaseRouteHandler();
		// Use getUser() instead of getSession() for security
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get the photo details to check permissions
		const { data: photo, error: fetchError } = await supabase
			.from("photos")
			.select("*")
			.eq("id", photoId)
			.single();

		if (fetchError) {
			console.error("Error fetching photo:", fetchError);
			return NextResponse.json({ error: "Photo not found" }, { status: 404 });
		}

		// Only creators or admins can delete photos
		const { data: userData } = await supabase
			.from("users")
			.select("role")
			.eq("id", user.id)
			.single();

		const isAdmin = userData?.role === "admin";
		const isCreator = photo.user_id === user.id;

		if (!isAdmin && !isCreator) {
			return NextResponse.json(
				{ error: "You don't have permission to delete this photo" },
				{ status: 403 }
			);
		}

		// Delete the photo
		const { error } = await deletePhoto(supabase, photoId);

		if (error) {
			console.error("Error deleting photo:", error);
			return NextResponse.json(
				{ error: "Failed to delete photo" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in DELETE /api/photos/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
