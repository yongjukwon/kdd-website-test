// lib/entities/photos.ts
import { Database } from "../lib/supabase/types";
import { supabase } from "../shared/index";

export type Photo = Database["public"]["Tables"]["photos"]["Row"];
export type PhotoInsert = Database["public"]["Tables"]["photos"]["Insert"];

// Bucket name for event photos
export const STORAGE_BUCKET = "photos";

// Create events folder in the photos bucket
export async function createEventsFolder() {
	try {
		console.log("[Storage] Creating 'events' folder in the photos bucket");

		// Create a small placeholder file to establish the folder
		// Using a .gitkeep naming convention (common for empty directories)
		const placeholderContent = new Blob(
			["This is a placeholder file to ensure the events folder exists."],
			{ type: "text/plain" }
		);

		const file = new File([placeholderContent], ".gitkeep", {
			type: "text/plain",
		});

		// Upload the placeholder to create the folder
		const { error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.upload("events/.gitkeep", file, {
				cacheControl: "3600",
				upsert: true, // Overwrite if exists
			});

		if (error) {
			console.error("[Storage] Error creating events folder:", error);
			throw error;
		}

		console.log("[Storage] Successfully created 'events' folder");
		return true;
	} catch (error) {
		console.error("[Storage] Error creating events folder:", error);
		throw error;
	}
}

// Initialize storage bucket if it doesn't exist
export async function initializeStorage() {
	try {
		console.log(
			"[Storage] Starting initialization of storage bucket:",
			STORAGE_BUCKET
		);

		// First check if the bucket exists
		const { data: bucket, error } = await supabase.storage.getBucket(
			STORAGE_BUCKET
		);

		console.log("[Storage] getBucket result:", {
			bucket: bucket ? "exists" : "null",
			error: error ? `Error: ${error.message}` : "none",
		});

		// Handle specific error cases for bucket checking
		if (error) {
			// Not found or permission errors are common
			if (
				error.message.includes("does not exist") ||
				error.message.includes("Bucket not found") ||
				error.message.includes("not found")
			) {
				console.log(`[Storage] Creating storage bucket: ${STORAGE_BUCKET}`);

				// Create the bucket with proper permissions
				const { error: createError } = await supabase.storage.createBucket(
					STORAGE_BUCKET,
					{
						public: true, // Make bucket public by default to simplify access
						fileSizeLimit: 10485760, // 10MB in bytes
					}
				);

				if (createError) {
					console.error("[Storage] Error creating bucket:", createError);
					throw createError;
				}

				// Update bucket policy to ensure public access
				console.log("[Storage] Setting bucket to public access");
				const { error: policyError } = await supabase.storage.updateBucket(
					STORAGE_BUCKET,
					{
						public: true,
					}
				);

				if (policyError) {
					console.error("[Storage] Error updating bucket policy:", policyError);
					throw policyError;
				}

				// Add a public policy to the bucket to ensure objects are accessible
				try {
					console.log("[Storage] Ensuring proper bucket policies");
					// This is a workaround for some Supabase versions that require explicit policies
					await supabase.storage.from(STORAGE_BUCKET).getPublicUrl("test");
				} catch {
					// Error is intentionally ignored as this call might fail but we don't care
					console.log("[Storage] Policy check complete");
				}

				console.log(`[Storage] Bucket ${STORAGE_BUCKET} created successfully`);

				// Create the events folder
				try {
					await createEventsFolder();
				} catch (folderError) {
					console.error("[Storage] Error creating events folder:", folderError);
					// Continue even if folder creation fails - it's not critical
				}

				return true;
			} else {
				console.error("[Storage] Error checking bucket:", error);
				throw error;
			}
		}

		console.log(`[Storage] Bucket ${STORAGE_BUCKET} already exists`);
		return true;
	} catch (error) {
		console.error("[Storage] Initialization error:", error);

		// Handle quota or permission errors
		if (error && typeof error === "object" && "message" in error) {
			const errorMessage = String(error.message);
			if (
				errorMessage.includes("quota") ||
				errorMessage.includes("permission")
			) {
				console.error(
					"[Storage] Possible quota or permission issue:",
					errorMessage
				);
			}
		}

		throw error;
	}
}

// Upload a photo to Supabase storage
export async function uploadPhotoToStorage(
	file: File,
	eventId: string
): Promise<string> {
	// Create a unique file path: event-id/timestamp-filename
	const timestamp = new Date().getTime();
	const filePath = `events/${eventId}/${timestamp}-${file.name}`;

	console.log("[uploadPhotoToStorage] Uploading photo to storage:", filePath);

	const { error: uploadError } = await supabase.storage
		.from(STORAGE_BUCKET)
		.upload(filePath, file, {
			cacheControl: "3600",
			upsert: false,
		});

	console.log("[uploadPhotoToStorage] Upload error:", uploadError);

	if (uploadError) throw uploadError;

	// Get the public URL
	const {
		data: { publicUrl },
	} = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

	return publicUrl;
}

// Get a photo's URL from its path
export function getPhotoUrl(path: string): string {
	const {
		data: { publicUrl },
	} = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

	return publicUrl;
}

// Delete a photo from storage
export async function deletePhotoFromStorage(path: string): Promise<void> {
	const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

	if (error) throw error;
}

export async function getPhotosByEvent(eventId: string): Promise<Photo[]> {
	const { data, error } = await supabase
		.from("photos")
		.select("*")
		.eq("event_id", eventId);

	if (error) throw error;
	return data;
}

// Add a photo with the storage URL and public URL
export async function addPhoto(payload: PhotoInsert): Promise<Photo> {
	// Make sure we have both the storage path and public URL
	// If the image is already a full URL (like when using uploadPhotoToStorage)
	// we should store it as is, and generate the public URL if needed
	let publicUrl = payload.public_url;

	// If public_url isn't provided but we have an image URL, generate it
	if (!publicUrl && payload.image) {
		try {
			// If image is already a public URL, use it directly
			if (payload.image.includes("https://")) {
				publicUrl = payload.image;
			} else {
				// Otherwise, it might be a storage path, so generate a public URL
				const { data } = supabase.storage
					.from(STORAGE_BUCKET)
					.getPublicUrl(payload.image);
				publicUrl = data.publicUrl;
			}
		} catch (error) {
			console.error("Error generating public URL:", error);
			// Fall back to the original image if we can't generate a public URL
			publicUrl = payload.image;
		}
	}

	// Create the final payload with both fields
	const payloadWithPublicUrl = {
		...payload,
		public_url: publicUrl,
	};

	const { data, error } = await supabase
		.from("photos")
		.insert(payloadWithPublicUrl)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deletePhoto(id: string): Promise<void> {
	// First get the photo to get its storage path
	const { data: photo, error: getError } = await supabase
		.from("photos")
		.select("image")
		.eq("id", id)
		.single();

	if (getError) throw getError;

	// Delete from storage if it's a storage URL
	if (photo.image && photo.image.includes(STORAGE_BUCKET)) {
		try {
			// Extract the path from the URL
			const url = new URL(photo.image);
			const pathParts = url.pathname.split("/");
			const storagePath = pathParts
				.slice(pathParts.indexOf(STORAGE_BUCKET) + 1)
				.join("/");

			await deletePhotoFromStorage(storagePath);
		} catch (err) {
			console.error("Error deleting photo from storage:", err);
		}
	}

	// Delete the database record
	const { error } = await supabase.from("photos").delete().eq("id", id);
	if (error) throw error;
}
