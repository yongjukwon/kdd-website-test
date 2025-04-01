import {
	addPhoto,
	deletePhoto,
	getPhotosByEvent,
	initializeStorage,
	uploadPhotoToStorage,
} from "@/entities/photos";
import { getSupabaseRouteHandler } from "@/shared/supabase-route";
import { NextRequest, NextResponse } from "next/server";

// Initialize the storage bucket - try once on server startup
initializeStorage()
	.then(() => {
		console.log("Storage bucket initialized successfully on server startup");
	})
	.catch((error) => {
		console.error(
			"Failed to initialize storage bucket on server startup:",
			error
		);
		// We'll retry on each upload request, so don't block server startup
	});

// GET /api/photos?eventId={eventId} - Fetch photos by event ID
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const params = await Promise.resolve(searchParams);
		const eventId = await params.get("eventId");

		if (!eventId) {
			return NextResponse.json(
				{ error: "Event ID is required" },
				{ status: 400 }
			);
		}

		const photos = await getPhotosByEvent(eventId);
		return NextResponse.json(photos);
	} catch (error) {
		console.error("Error fetching photos:", error);
		return NextResponse.json(
			{ error: "Failed to fetch photos" },
			{ status: 500 }
		);
	}
}

// POST /api/photos - Upload a new photo
export async function POST(request: NextRequest) {
	try {
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if the request is multipart form data
		const contentType = request.headers.get("content-type") || "";
		console.log("[POST /api/photos] Content-Type:", contentType);

		// Debug log for the request
		console.log("[POST /api/photos] Processing request");

		if (contentType.includes("multipart/form-data")) {
			// Handle file upload
			console.log("[POST /api/photos] Handling multipart/form-data");

			try {
				// First, make sure the storage bucket exists
				try {
					await initializeStorage();
					console.log("[POST /api/photos] Storage bucket initialized");
				} catch (bucketError: unknown) {
					console.error(
						"[POST /api/photos] Storage bucket error:",
						bucketError
					);

					if (
						typeof bucketError === "object" &&
						bucketError !== null &&
						"message" in bucketError &&
						typeof bucketError.message === "string"
					) {
						// Check specific error types
						const errorMessage = bucketError.message;

						if (errorMessage.includes("Permission denied")) {
							return NextResponse.json(
								{
									error:
										"Storage permission error: The application doesn't have permission to create or access storage buckets",
								},
								{ status: 500 }
							);
						} else if (
							errorMessage.includes("not found") ||
							errorMessage.includes("Bucket not found")
						) {
							// Special handling for not found errors
							console.error(
								"[POST /api/photos] Bucket not found error. Check Supabase project settings and environment variables."
							);

							// Return details for debugging
							return NextResponse.json(
								{
									error:
										"Storage bucket not found. This could be due to missing permissions or incorrect configuration.",
									details:
										"Please verify your Supabase project has Storage enabled and check environment variables.",
								},
								{ status: 500 }
							);
						} else if (
							errorMessage.includes("quota") ||
							errorMessage.includes("limit")
						) {
							return NextResponse.json(
								{
									error:
										"Storage quota error: Your Supabase project may have reached its storage limits",
								},
								{ status: 500 }
							);
						}
					}

					// Try to provide more specific error based on error type
					const errorMessage =
						typeof bucketError === "object" &&
						bucketError !== null &&
						"message" in bucketError &&
						typeof bucketError.message === "string"
							? bucketError.message
							: String(bucketError);

					return NextResponse.json(
						{
							error: `Storage configuration error: ${errorMessage}`,
							troubleshooting:
								"Check your Supabase project configuration and environment variables.",
						},
						{ status: 500 }
					);
				}

				// Parse form data
				const formData = await request.formData();
				console.log("[POST /api/photos] FormData parsed");

				// List all fields for debugging
				const fields = Array.from(formData.entries()).map(
					([field, value]) =>
						`${field}: ${
							typeof value === "object"
								? `${(value as File).name} (${(value as File).size} bytes)`
								: value
						}`
				);
				console.log("[POST /api/photos] FormData fields:", fields);

				const eventId = formData.get("event_id");
				const caption = formData.get("caption");
				const file = formData.get("file");

				console.log("[POST /api/photos] Extracted values:", {
					eventId: eventId ? "present" : "missing",
					caption: caption ? "present" : "missing",
					file: file ? `${typeof file} present` : "missing",
				});

				if (!eventId || !file) {
					return NextResponse.json(
						{ error: "Event ID and file are required" },
						{ status: 400 }
					);
				}

				if (!(file instanceof File)) {
					return NextResponse.json(
						{ error: "Invalid file object" },
						{ status: 400 }
					);
				}

				// Check file size (max 10MB)
				if (file.size > 10 * 1024 * 1024) {
					return NextResponse.json(
						{ error: "File size exceeds 10MB limit" },
						{ status: 400 }
					);
				}

				// Upload file to Supabase Storage
				console.log("[POST /api/photos] Uploading to storage:", {
					fileName: file.name,
					fileSize: file.size,
					fileType: file.type,
					eventId: eventId.toString(),
				});

				const imageUrl = await uploadPhotoToStorage(file, eventId.toString());
				console.log("[POST /api/photos] File uploaded, URL:", imageUrl);

				// Save photo data to the database
				const photoData = {
					event_id: eventId.toString(),
					image: imageUrl,
					public_url: imageUrl,
					caption: caption ? caption.toString() : null,
					uploaded_by_user_id: user.id,
				};

				console.log("[POST /api/photos] Saving to database:", photoData);
				try {
					const newPhoto = await addPhoto(photoData);
					console.log(
						"[POST /api/photos] Photo saved to database:",
						newPhoto.id
					);
					return NextResponse.json(newPhoto, { status: 201 });
				} catch (dbError) {
					console.error("[POST /api/photos] Database error:", dbError);

					// Handle RLS policy errors
					if (
						dbError instanceof Error &&
						(dbError.message.includes("row-level security") ||
							dbError.message.includes("violates row-level security policy"))
					) {
						return NextResponse.json(
							{
								error:
									"Permission error: Cannot add photos due to database security policies",
								details:
									"This is likely due to Row Level Security (RLS) policies. Please ask an administrator to check the RLS policies for the photos table.",
								troubleshooting:
									"The user might not have permissions to insert records in the photos table.",
							},
							{ status: 403 }
						);
					}

					// Other database errors
					return NextResponse.json(
						{
							error: `Database error: ${
								dbError instanceof Error ? dbError.message : String(dbError)
							}`,
							troubleshooting:
								"There was an error saving the photo record to the database.",
						},
						{ status: 500 }
					);
				}
			} catch (error) {
				console.error("[POST /api/photos] FormData processing error:", error);
				return NextResponse.json(
					{
						error: `FormData processing error: ${
							error instanceof Error ? error.message : String(error)
						}`,
					},
					{ status: 500 }
				);
			}
		} else {
			// Handle JSON payload (backward compatibility)
			console.log("[POST /api/photos] Handling JSON payload");
			const photoData = await request.json();

			// Validate required fields
			if (!photoData.event_id || !photoData.image) {
				return NextResponse.json(
					{ error: "Event ID and image are required" },
					{ status: 400 }
				);
			}

			// Add the current user as the uploader
			photoData.uploaded_by_user_id = user.id;

			try {
				const newPhoto = await addPhoto(photoData);
				return NextResponse.json(newPhoto, { status: 201 });
			} catch (error) {
				console.error("[POST /api/photos] Database error:", error);

				// Check for RLS error
				if (
					error instanceof Error &&
					(error.message.includes("row-level security") ||
						error.message.includes("violates row-level security policy"))
				) {
					return NextResponse.json(
						{
							error:
								"Permission error: Your user doesn't have access to add photos",
							details:
								"This is likely due to Row Level Security policies in the database. Ask an administrator to check the RLS policies for the photos table.",
						},
						{ status: 403 }
					);
				}

				throw error; // Re-throw for the outer catch block
			}
		}
	} catch (error) {
		console.error("[POST /api/photos] Unhandled error:", error);
		return NextResponse.json(
			{
				error: `Failed to upload photo: ${
					error instanceof Error ? error.message : String(error)
				}`,
			},
			{ status: 500 }
		);
	}
}

// DELETE /api/photos?id={photoId} - Delete a photo
export async function DELETE(request: NextRequest) {
	try {
		const supabase = await getSupabaseRouteHandler();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const params = await Promise.resolve(searchParams);
		const photoId = await params.get("id");

		if (!photoId) {
			return NextResponse.json(
				{ error: "Photo ID is required" },
				{ status: 400 }
			);
		}

		await deletePhoto(photoId);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting photo:", error);
		return NextResponse.json(
			{ error: "Failed to delete photo" },
			{ status: 500 }
		);
	}
}
