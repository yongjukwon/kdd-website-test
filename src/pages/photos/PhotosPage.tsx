"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	ChevronLeft,
	ChevronRight,
	Loader2,
	Plus,
	Trash,
	Upload,
	X,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Types
type Photo = {
	id: string;
	event_id: string;
	image: string;
	public_url?: string;
	caption: string | null;
	uploaded_by_user_id: string;
	created_at: string;
};

type Event = {
	id: string;
	title: string;
	date: string;
	is_published?: boolean;
	photos: Photo[];
};

export function PhotosPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const eventIdParam = searchParams ? searchParams.get("eventId") : null;

	// State
	const [isLoading, setIsLoading] = useState(true);
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [visiblePhotos, setVisiblePhotos] = useState(20);
	const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [uploadCaption, setUploadCaption] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	// Cache for photo data to avoid repeated API calls
	const [photoCache, setPhotoCache] = useState<Record<string, Photo[]>>({});
	// We only need the setter function for future UI improvements
	const setUploadProgress = useState(0)[1];
	const [uploadError, setUploadError] = useState<string | null>(null);

	// Load photos for a specific event
	const loadPhotosForEvent = useCallback(
		async (eventId: string): Promise<Photo[]> => {
			try {
				// Check if we already have photos for this event in the cache
				if (photoCache[eventId]) {
					console.log(`Using cached photos for event ${eventId}`);
					return photoCache[eventId];
				}

				// Not in cache, fetch from API
				const response = await fetch(`/api/photos?eventId=${eventId}`);
				if (!response.ok) throw new Error("Failed to fetch photos");

				const photos = await response.json();
				console.log("[load] Photos:", photos);

				return photos;
			} catch (error) {
				console.error(`Error loading photos for event ${eventId}:`, error);
				return [];
			}
		},
		[photoCache]
	);

	// Load events
	useEffect(() => {
		async function loadEvents() {
			setIsLoading(true);
			try {
				// Explicitly include unpublished events as well
				const response = await fetch("/api/events?published=all&limit=100");
				if (!response.ok) throw new Error("Failed to fetch events");

				const data = await response.json();
				console.log("Events data:", data);

				// Extract events array from the response
				// API may return { events: [...], pagination: {...} } structure or direct array
				const eventsData = Array.isArray(data) ? data : data.events || [];

				if (!Array.isArray(eventsData)) {
					console.error("Events data is not an array:", eventsData);
					setEvents([]);
					setIsLoading(false);
					return;
				}

				// Log all events to debug
				console.log(
					"All events before filtering:",
					eventsData.map((e) => ({
						id: e.id,
						title: e.title,
						date: e.date,
						is_published: e.is_published,
					}))
				);

				// Include ALL events, even if not published
				const sortedEvents = eventsData.sort(
					(a: Event, b: Event) =>
						new Date(b.date).getTime() - new Date(a.date).getTime()
				);

				// Initialize events with empty photos array
				const eventsWithPhotos = sortedEvents.map((event: Event) => ({
					...event,
					photos: [],
				}));

				setEvents(eventsWithPhotos);

				// Load photos for all events
				const photoResults = await Promise.all(
					eventsWithPhotos.map((event) => loadPhotosForEvent(event.id))
				);

				// Create a mapping of event IDs to their photos
				const updatedPhotoCache: Record<string, Photo[]> = {};
				eventsWithPhotos.forEach((event, index) => {
					updatedPhotoCache[event.id] = photoResults[index] || [];
				});

				// Update the photo cache with all loaded photos
				setPhotoCache(updatedPhotoCache);

				// Update the events with their photos
				const updatedEvents = eventsWithPhotos.map((event) => ({
					...event,
					photos: updatedPhotoCache[event.id] || [],
				}));
				setEvents(updatedEvents);

				// Determine which event to select
				let eventToSelect = null;

				if (eventIdParam) {
					// If event ID is in URL, use that
					eventToSelect =
						updatedEvents.find((e) => e.id === eventIdParam) || null;
				} else {
					// Otherwise find first event with photos
					eventToSelect =
						updatedEvents.find(
							(e) => (updatedPhotoCache[e.id] || []).length > 0
						) || (updatedEvents.length > 0 ? updatedEvents[0] : null);

					// If we found an event with photos, update the URL
					if (eventToSelect) {
						router.push(`/photos?eventId=${eventToSelect.id}`);
					}
				}

				// Set the selected event
				setSelectedEvent(eventToSelect);
			} catch (error) {
				console.error("Error loading events:", error);
			} finally {
				setIsLoading(false);
			}
		}

		loadEvents();
	}, [eventIdParam, router, loadPhotosForEvent]);

	// Handle event selection
	const handleEventSelect = (event: Event) => {
		setSelectedEvent(event);
		setVisiblePhotos(20);
		router.push(`/photos?eventId=${event.id}`);

		// Photos are now pre-loaded for all events, so no need to load them again
	};

	// Group events by year and month
	const eventsByYearAndMonth = useMemo(() => {
		const grouped: Record<number, Record<number, Event[]>> = {};

		events.forEach((event) => {
			const date = new Date(event.date);
			const year = date.getFullYear();
			const month = date.getMonth();

			if (!grouped[year]) {
				grouped[year] = {};
			}

			if (!grouped[year][month]) {
				grouped[year][month] = [];
			}

			grouped[year][month].push(event);
		});

		return grouped;
	}, [events]);

	// Get the years in descending order
	const years = useMemo(() => {
		return Object.keys(eventsByYearAndMonth)
			.map((year) => parseInt(year))
			.sort((a, b) => b - a);
	}, [eventsByYearAndMonth]);

	// Get month name
	const getMonthName = (month: number): string => {
		return new Date(2000, month, 1).toLocaleString("en-US", { month: "long" });
	};

	const handleLoadMore = useCallback(() => {
		setVisiblePhotos((prev) => prev + 20);
	}, []);

	const openLightbox = useCallback((photo: Photo) => {
		setCurrentPhoto(photo);
		setIsLightboxOpen(true);
	}, []);

	const closeLightbox = useCallback(() => {
		setIsLightboxOpen(false);
		setCurrentPhoto(null);
	}, []);

	const viewPreviousPhoto = useCallback(() => {
		if (!currentPhoto || !selectedEvent) return;

		const currentIndex = selectedEvent.photos.findIndex(
			(p) => p.id === currentPhoto.id
		);
		if (currentIndex > 0) {
			setCurrentPhoto(selectedEvent.photos[currentIndex - 1]);
		}
	}, [currentPhoto, selectedEvent]);

	const viewNextPhoto = useCallback(() => {
		if (!currentPhoto || !selectedEvent) return;

		const currentIndex = selectedEvent.photos.findIndex(
			(p) => p.id === currentPhoto.id
		);
		if (currentIndex < selectedEvent.photos.length - 1) {
			setCurrentPhoto(selectedEvent.photos[currentIndex + 1]);
		}
	}, [currentPhoto, selectedEvent]);

	// Get current photo index for display
	const currentPhotoIndex = useMemo(() => {
		if (!currentPhoto || !selectedEvent) return 0;
		return selectedEvent.photos.findIndex((p) => p.id === currentPhoto.id) + 1;
	}, [currentPhoto, selectedEvent]);

	// Upload functionality
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setUploadFile(e.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!uploadFile || !selectedEvent) return;

		setIsUploading(true);
		setUploadError(null);
		setUploadProgress(0);

		try {
			const formData = new FormData();
			formData.append("file", uploadFile);
			formData.append("event_id", selectedEvent.id);
			if (uploadCaption) {
				formData.append("caption", uploadCaption);
			}

			const response = await fetch("/api/photos", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Upload failed");
			}

			const newPhoto = await response.json();

			// Add new photo to the event
			setEvents((prevEvents) =>
				prevEvents.map((event) =>
					event.id === selectedEvent.id
						? {
								...event,
								photos: [newPhoto, ...event.photos],
						  }
						: event
				)
			);

			// Also update selectedEvent
			setSelectedEvent((prev) => {
				if (!prev) return null;
				return {
					...prev,
					photos: [newPhoto, ...prev.photos],
				};
			});

			// Update photo cache with the new photo
			setPhotoCache((prevCache) => {
				const eventPhotos = prevCache[selectedEvent.id] || [];
				return {
					...prevCache,
					[selectedEvent.id]: [newPhoto, ...eventPhotos],
				};
			});

			// Reset form
			setUploadFile(null);
			setUploadCaption("");
			setIsUploadDialogOpen(false);
		} catch (error) {
			console.error("Error uploading photo:", error);
			setUploadError(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeletePhoto = async (photoId: string) => {
		if (!selectedEvent) return;

		if (
			!confirm(
				"Are you sure you want to delete this photo? This action cannot be undone."
			)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/photos?id=${photoId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Delete failed");
			}

			// Remove photo from the event
			setEvents((prevEvents) =>
				prevEvents.map((event) =>
					event.id === selectedEvent.id
						? {
								...event,
								photos: event.photos.filter((p) => p.id !== photoId),
						  }
						: event
				)
			);

			// Also update selectedEvent
			setSelectedEvent((prev) => {
				if (!prev) return null;
				return {
					...prev,
					photos: prev.photos.filter((p) => p.id !== photoId),
				};
			});

			// Update photo cache to remove the deleted photo
			setPhotoCache((prevCache) => {
				const eventPhotos = prevCache[selectedEvent.id] || [];
				return {
					...prevCache,
					[selectedEvent.id]: eventPhotos.filter((p) => p.id !== photoId),
				};
			});

			// Close lightbox if the deleted photo is the current one
			if (currentPhoto?.id === photoId) {
				closeLightbox();
			}
		} catch (error) {
			console.error("Error deleting photo:", error);
			alert(
				`Failed to delete photo: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	};

	return (
		<div className="flex flex-col flex-grow">
			<div className="container mx-auto px-4 py-8 flex-grow">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold">Photo Galleries</h1>
					{selectedEvent && (
						<Button
							onClick={() => setIsUploadDialogOpen(true)}
							className="flex items-center gap-2"
						>
							<Plus size={16} /> Upload Photo
						</Button>
					)}
				</div>
				<Separator className="mb-6" />

				{isLoading ? (
					<div className="flex items-center justify-center h-64">
						<Loader2 className="w-8 h-8 animate-spin text-primary" />
					</div>
				) : (
					<div className="flex flex-col md:flex-row gap-8 flex-grow">
						{/* Sidebar with event navigation */}
						<div className="w-full md:w-64 flex-shrink-0">
							<ScrollArea className="h-[calc(100vh-250px)]">
								<Accordion
									type="multiple"
									defaultValue={years.map((year) => year.toString())}
								>
									{years.map((year) => (
										<AccordionItem key={year} value={year.toString()}>
											<AccordionTrigger className="font-semibold">
												{year}
											</AccordionTrigger>
											<AccordionContent>
												{Object.keys(eventsByYearAndMonth[year])
													.map((month) => parseInt(month))
													.sort((a, b) => b - a)
													.map((month) => (
														<div key={`${year}-${month}`} className="mb-4">
															<h3 className="text-sm font-medium text-gray-500 mb-2">
																{getMonthName(month)}
															</h3>
															<ul className="space-y-2">
																{eventsByYearAndMonth[year][month].map(
																	(event) => (
																		<li
																			key={event.id}
																			className={`pl-2 border-l-2 py-1 cursor-pointer text-sm ${
																				selectedEvent?.id === event.id
																					? "border-primary text-primary font-medium"
																					: "border-gray-200 hover:border-gray-400"
																			}`}
																			onClick={() => handleEventSelect(event)}
																		>
																			{event.title}
																			<span className="text-xs text-gray-500 ml-2">
																				({event.photos?.length || 0})
																			</span>
																		</li>
																	)
																)}
															</ul>
														</div>
													))}
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</ScrollArea>
						</div>

						{/* Main content - Photo Gallery */}
						<div className="flex-grow">
							{selectedEvent ? (
								<>
									<div className="mb-6">
										<h2 className="text-2xl font-bold">
											{selectedEvent.title}
										</h2>
										<p className="text-gray-500">
											{new Date(selectedEvent.date).toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "long",
													day: "numeric",
												}
											)}{" "}
											• {selectedEvent.photos.length} photos
										</p>
									</div>

									{selectedEvent.photos.length === 0 ? (
										<div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-md border border-gray-200">
											<p className="text-gray-500 mb-4">
												No photos have been uploaded for this event yet.
											</p>
											<Button onClick={() => setIsUploadDialogOpen(true)}>
												<Plus className="mr-2 h-4 w-4" /> Upload Photos
											</Button>
										</div>
									) : (
										<>
											{/* Photo Gallery Grid */}
											<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
												{selectedEvent.photos
													.slice(0, visiblePhotos)
													.map((photo) => (
														<div
															key={photo.id}
															className="aspect-square relative cursor-pointer overflow-hidden rounded-md shadow-sm hover:shadow-md transition-shadow group"
															onClick={() => openLightbox(photo)}
														>
															<Image
																src={photo.public_url || photo.image}
																alt={photo.caption || "Event photo"}
																fill
																sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
																className="object-cover"
															/>
															{photo.caption && (
																<div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent p-3">
																	<span className="text-white text-sm font-medium line-clamp-2">
																		{photo.caption}
																	</span>
																</div>
															)}
														</div>
													))}
											</div>

											{/* Load More button */}
											{visiblePhotos < selectedEvent.photos.length && (
												<div className="mt-8 text-center">
													<Button onClick={handleLoadMore} variant="outline">
														Load More Photos
													</Button>
												</div>
											)}
										</>
									)}
								</>
							) : (
								<div className="flex items-center justify-center h-full">
									<p className="text-gray-500">
										Select an event to view photos
									</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Lightbox */}
			<Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
				<DialogContent
					className="w-[90vw] max-w-[70%] p-0 mx-auto"
					style={{ animation: "none" }}
				>
					<DialogHeader className="p-4 flex justify-between items-center">
						<DialogTitle>{currentPhoto?.caption || "Photo"}</DialogTitle>
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() =>
									currentPhoto && handleDeletePhoto(currentPhoto.id)
								}
								className="text-red-500 hover:text-red-700"
							>
								<Trash className="h-5 w-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={closeLightbox}
								className="text-gray-500"
							>
								<X className="h-5 w-5" />
							</Button>
						</div>
					</DialogHeader>

					{currentPhoto && (
						<div className="relative bg-black">
							<div className="aspect-video w-full flex items-center justify-center">
								<Image
									src={currentPhoto.public_url || currentPhoto.image}
									alt={currentPhoto.caption || "Event photo"}
									fill
									sizes="90vw"
									className="object-contain"
								/>
							</div>

							{/* Navigation buttons */}
							<div className="absolute inset-y-0 left-0 flex items-center">
								<Button
									variant="ghost"
									size="icon"
									onClick={viewPreviousPhoto}
									className="h-12 w-12 text-white bg-black/20 hover:bg-black/40 rounded-full ml-2"
								>
									<ChevronLeft className="h-8 w-8" />
								</Button>
							</div>
							<div className="absolute inset-y-0 right-0 flex items-center">
								<Button
									variant="ghost"
									size="icon"
									onClick={viewNextPhoto}
									className="h-12 w-12 text-white bg-black/20 hover:bg-black/40 rounded-full mr-2"
								>
									<ChevronRight className="h-8 w-8" />
								</Button>
							</div>
						</div>
					)}

					{/* Photo information */}
					<div className="p-4 bg-white">
						{selectedEvent && currentPhoto && (
							<p className="text-gray-500">
								Photo {currentPhotoIndex} of {selectedEvent.photos.length} •{" "}
								{selectedEvent.title} •{" "}
								{new Date(selectedEvent.date).toLocaleDateString()}
							</p>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Upload Dialog */}
			<Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Upload Photo</DialogTitle>
						<DialogDescription>
							Upload a new photo for the event &ldquo;{selectedEvent?.title}
							&rdquo;.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="photo">Photo</Label>
							<Input
								id="photo"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
							/>
							{uploadFile && (
								<div className="mt-2">
									<p className="text-sm text-gray-500">
										Selected: {uploadFile.name} (
										{Math.round(uploadFile.size / 1024)} KB)
									</p>
								</div>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="caption">Caption (optional)</Label>
							<Textarea
								id="caption"
								placeholder="Add a caption for this photo"
								value={uploadCaption}
								onChange={(e) => setUploadCaption(e.target.value)}
							/>
						</div>
						{uploadError && (
							<div className="text-red-500 text-sm">{uploadError}</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsUploadDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleUpload}
							disabled={!uploadFile || isUploading}
						>
							{isUploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Upload
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
