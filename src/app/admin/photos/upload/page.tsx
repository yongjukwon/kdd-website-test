"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	CheckCircle,
	FileText,
	Info,
	Loader2,
	Upload,
	X,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Event type definition
type Event = {
	id: string;
	title: string;
	date: string;
	is_published: boolean;
};

// Upload status type
type UploadStatus = {
	filename: string;
	status: "pending" | "uploading" | "success" | "error";
	progress: number;
	error?: string;
	imageUrl?: string;
};

export default function PhotoUploadPage() {
	// State for form
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedEventId, setSelectedEventId] = useState<string>("");
	const [isEventsLoading, setIsEventsLoading] = useState(true);
	const [files, setFiles] = useState<File[]>([]);
	const [commonCaption, setCommonCaption] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
	const [overallProgress, setOverallProgress] = useState(0);

	// Fetch events on component mount
	useEffect(() => {
		const fetchEvents = async () => {
			setIsEventsLoading(true);
			try {
				const response = await fetch("/api/events");
				if (!response.ok) throw new Error("Failed to fetch events");

				const responseData = await response.json();

				// API returns { events: [...] } structure
				const eventsData = responseData.events || [];

				// Sort events by date in descending order
				const sortedEvents = eventsData
					.filter((event: Event) => event && event.is_published)
					.sort(
						(a: Event, b: Event) =>
							new Date(b.date).getTime() - new Date(a.date).getTime()
					);

				setEvents(sortedEvents);
			} catch (error) {
				console.error("Error loading events:", error);
			} finally {
				setIsEventsLoading(false);
			}
		};

		fetchEvents();
	}, []);

	// Handle file selection
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			// Convert FileList to array and append to existing files
			const newFiles = Array.from(e.target.files);

			// Check file sizes (max 10MB per file)
			const oversizedFiles = newFiles.filter(
				(file) => file.size > 10 * 1024 * 1024
			);
			if (oversizedFiles.length > 0) {
				toast.error(
					`${oversizedFiles.length} file(s) exceed the 10MB size limit and were not added`
				);

				// Filter out oversized files
				const validFiles = newFiles.filter(
					(file) => file.size <= 10 * 1024 * 1024
				);
				if (validFiles.length === 0) {
					e.target.value = "";
					return; // No valid files to add
				}

				setFiles((prev) => [...prev, ...validFiles]);

				// Initialize upload statuses for the new files
				setUploadStatuses((prev) => [
					...prev,
					...validFiles.map((file) => ({
						filename: file.name,
						status: "pending" as const,
						progress: 0,
					})),
				]);
			} else {
				// All files are valid
				setFiles((prev) => [...prev, ...newFiles]);

				// Initialize upload statuses for the new files
				setUploadStatuses((prev) => [
					...prev,
					...newFiles.map((file) => ({
						filename: file.name,
						status: "pending" as const,
						progress: 0,
					})),
				]);
			}

			// Reset the input to allow selecting the same file again
			e.target.value = "";
		}
	};

	// Remove a file from the list
	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		setUploadStatuses((prev) => prev.filter((_, i) => i !== index));
	};

	// Format file size
	const formatFileSize = (bytes: number): string => {
		if (bytes < 1024) return bytes + " B";
		else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
		else return (bytes / 1048576).toFixed(1) + " MB";
	};

	// Handle error with helpful user message
	const handleUploadError = (error: unknown, filename: string): string => {
		let message = "Upload failed";

		if (error instanceof Error) {
			// Parse the error message to provide helpful guidance
			const errorMsg = error.message;

			if (errorMsg.includes("Storage bucket not found")) {
				message =
					"Storage not configured correctly. Please contact administrator.";
			} else if (errorMsg.includes("quota") || errorMsg.includes("limit")) {
				message = "Storage quota exceeded. Contact administrator.";
			} else if (errorMsg.includes("permission")) {
				message = "Permission error. Contact administrator.";
			} else if (errorMsg.includes("timeout")) {
				message = "Upload timed out. Try a smaller file or check connection.";
			} else if (errorMsg.includes("file size")) {
				message = "File exceeds size limit (10MB).";
			} else {
				// Use the error message directly if available
				message = errorMsg;
			}
		}

		// Log for debugging
		console.error(`Error uploading ${filename}:`, error);
		return message;
	};

	// Upload files one by one
	const uploadFiles = async () => {
		if (!selectedEventId || files.length === 0) return;

		setIsUploading(true);
		setOverallProgress(0);
		let completed = 0;
		let errors = 0;
		let successCount = 0;

		// Add upload start notification
		toast.info(`Starting upload of ${files.length} files...`);

		// Upload files one by one
		for (let i = 0; i < files.length; i++) {
			if (uploadStatuses[i].status === "success") {
				completed++;
				successCount++;
				continue; // Skip already uploaded files
			}

			// Update status to uploading
			setUploadStatuses((prev) => {
				const updated = [...prev];
				updated[i] = { ...updated[i], status: "uploading", progress: 0 };
				return updated;
			});

			try {
				// Add logging for debugging
				console.log(
					`Uploading file ${i + 1}/${files.length}: ${
						files[i].name
					} (${Math.round(files[i].size / 1024)}KB)`
				);

				// Check file size again
				if (files[i].size > 10 * 1024 * 1024) {
					throw new Error("File size exceeds 10MB limit");
				}

				const formData = new FormData();
				formData.append("file", files[i]);
				formData.append("event_id", selectedEventId);
				if (commonCaption) {
					formData.append("caption", commonCaption);
				}

				// Log FormData (for debugging)
				console.log("FormData content:");
				for (const pair of formData.entries()) {
					console.log(
						`- ${pair[0]}: ${
							typeof pair[1] === "object"
								? `${(pair[1] as File).name} (${(pair[1] as File).size} bytes)`
								: pair[1]
						}`
					);
				}

				// Set up timeout to prevent hanging requests
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

				try {
					const response = await fetch("/api/photos", {
						method: "POST",
						body: formData,
						signal: controller.signal,
					});

					clearTimeout(timeoutId);

					// Get response text first for debugging
					const responseText = await response.text();
					console.log("Response text:", responseText);

					// Parse the response text as JSON
					let responseData;
					try {
						responseData = JSON.parse(responseText);
					} catch (parseError) {
						console.error("Error parsing response:", parseError);
						throw new Error(
							`Invalid response: ${responseText.substring(0, 100)}...`
						);
					}

					if (!response.ok) {
						throw new Error(
							responseData.error ||
								`Upload failed with status ${response.status}`
						);
					}

					// Update status to success
					setUploadStatuses((prev) => {
						const updated = [...prev];
						updated[i] = {
							...updated[i],
							status: "success",
							progress: 100,
							imageUrl: responseData.image,
						};
						return updated;
					});

					completed++;
					successCount++;
					toast.success(`Uploaded ${files[i].name} successfully`);
				} catch (error) {
					clearTimeout(timeoutId);

					// Check if it's an AbortError (timeout)
					if (error instanceof DOMException && error.name === "AbortError") {
						throw new Error("Upload timed out. Please try again.");
					}

					throw error; // re-throw the error to be caught by the outer catch block
				}
			} catch (error) {
				console.error(`Error uploading ${files[i].name}:`, error);
				errors++;

				// Get user-friendly error message
				const errorMessage = handleUploadError(error, files[i].name);

				// Show toast with error
				toast.error(`Error uploading ${files[i].name}: ${errorMessage}`);

				// Update status to error
				setUploadStatuses((prev) => {
					const updated = [...prev];
					updated[i] = {
						...updated[i],
						status: "error",
						error: errorMessage,
					};
					return updated;
				});

				completed++;
			}

			// Update overall progress
			setOverallProgress(Math.round((completed / files.length) * 100));
		}

		// Show summary toast
		if (successCount > 0 && errors === 0) {
			toast.success(`All ${successCount} files uploaded successfully!`);
		} else if (successCount > 0 && errors > 0) {
			toast.warning(
				`Upload completed: ${successCount} successful, ${errors} failed`
			);
		} else if (successCount === 0 && errors > 0) {
			toast.error(`Upload failed: All ${errors} files failed to upload`);
		}

		setIsUploading(false);
	};

	// Check if upload button should be disabled
	const isUploadDisabled =
		!selectedEventId || files.length === 0 || isUploading;

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Upload Photos</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Upload Form */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Upload Photos</CardTitle>
							<CardDescription>
								Upload multiple photos to an event
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Event Selection */}
							<div className="space-y-2">
								<Label htmlFor="event">Event</Label>
								<Select
									value={selectedEventId}
									onValueChange={setSelectedEventId}
									disabled={isEventsLoading || isUploading}
								>
									<SelectTrigger id="event">
										<SelectValue
											placeholder={
												isEventsLoading
													? "Loading events..."
													: "Select an event"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{events.map((event) => (
											<SelectItem key={event.id} value={event.id}>
												{event.title} (
												{new Date(event.date).toLocaleDateString()})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Common Caption */}
							<div className="space-y-2">
								<Label htmlFor="caption">Common Caption (optional)</Label>
								<Textarea
									id="caption"
									placeholder="Caption for all uploaded photos"
									value={commonCaption}
									onChange={(e) => setCommonCaption(e.target.value)}
									disabled={isUploading}
								/>
							</div>

							{/* File Upload */}
							<div className="space-y-2">
								<Label htmlFor="files">Photos</Label>
								<div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
									<Input
										id="files"
										type="file"
										accept="image/*"
										multiple
										className="hidden"
										onChange={handleFileChange}
										disabled={isUploading}
									/>
									<Label
										htmlFor="files"
										className="cursor-pointer flex flex-col items-center gap-2"
									>
										<Upload className="h-10 w-10 text-gray-400" />
										<span className="text-sm font-medium">
											Click to select photos or drag and drop
										</span>
										<span className="text-xs text-gray-500">
											JPG, PNG, WEBP up to 10MB
										</span>
									</Label>
								</div>
							</div>

							{/* Overall Progress */}
							{isUploading && (
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Overall Progress</span>
										<span>{overallProgress}%</span>
									</div>
									<Progress value={overallProgress} />
								</div>
							)}

							{/* Upload Button */}
							<Button
								onClick={uploadFiles}
								disabled={isUploadDisabled}
								className="w-full"
							>
								{isUploading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Upload className="mr-2 h-4 w-4" />
										Upload Photos
									</>
								)}
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* File List */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Selected Photos ({files.length})</CardTitle>
							<CardDescription>
								{files.length === 0
									? "No photos selected"
									: `${files.length} photo${
											files.length > 1 ? "s" : ""
									  } selected for upload`}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{files.length === 0 ? (
								<div className="text-center py-12 text-gray-400">
									<FileText className="h-12 w-12 mx-auto mb-2" />
									<p>No photos selected</p>
								</div>
							) : (
								<ScrollArea className="h-[400px] pr-4">
									<div className="space-y-3">
										{files.map((file, index) => {
											const status = uploadStatuses[index];
											return (
												<div key={index} className="border rounded-md p-3">
													<div className="flex items-start justify-between mb-2">
														<div className="flex items-center">
															{status?.status === "success" && (
																<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
															)}
															{status?.status === "error" && (
																<XCircle className="h-5 w-5 text-red-500 mr-2" />
															)}
															{status?.status === "uploading" && (
																<Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
															)}
															{status?.status === "pending" && (
																<Info className="h-5 w-5 text-gray-400 mr-2" />
															)}
															<div>
																<p className="font-medium text-sm truncate max-w-xs">
																	{file.name}
																</p>
																<p className="text-xs text-gray-500">
																	{formatFileSize(file.size)}
																</p>
															</div>
														</div>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => removeFile(index)}
															disabled={isUploading}
														>
															<X className="h-4 w-4" />
														</Button>
													</div>

													{/* Preview */}
													<div className="relative h-32 w-full mb-2 bg-gray-100 rounded overflow-hidden">
														{URL.createObjectURL && (
															<img
																src={URL.createObjectURL(file)}
																alt={file.name}
																className="h-full w-full object-cover"
																onLoad={() => URL.revokeObjectURL}
															/>
														)}
													</div>

													{/* Status info */}
													{status?.status === "uploading" && (
														<Progress value={status.progress} className="h-2" />
													)}

													{status?.status === "error" && (
														<p className="text-xs text-red-500 mt-1">
															{status.error}
														</p>
													)}

													{status?.status === "success" && status.imageUrl && (
														<a
															href={status.imageUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="text-xs text-blue-500 hover:underline block mt-1 truncate"
														>
															{status.imageUrl}
														</a>
													)}
												</div>
											);
										})}
									</div>
								</ScrollArea>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
