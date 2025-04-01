"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/entities/events";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define the form schema with validation
const formSchema = z.object({
	title: z.string().min(5, "Title must be at least 5 characters"),
	subtitle: z.string().optional(),
	date: z.date({
		required_error: "Event date is required",
	}),
	location: z.string().optional(),
	description: z.string().min(10, "Description must be at least 10 characters"),
	price: z.coerce.number().min(0, "Price cannot be negative").default(0),
	capacity: z.coerce
		.number()
		.int()
		.positive("Capacity must be positive")
		.optional()
		.nullable(),
	poster_image: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	is_online: z.boolean().default(false),
	online_url: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	rsvp_deadline: z.date().optional().nullable(),
	is_published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface EventFormProps {
	event?: Event; // Optional event for editing mode
}

export function EventForm({ event }: EventFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!event;

	// Format dates from ISO strings if in edit mode
	const eventDate = event?.date ? new Date(event.date) : undefined;
	const rsvpDeadline = event?.rsvp_deadline
		? new Date(event.rsvp_deadline)
		: null;

	// Initialize form with default values or event data
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: isEditMode
			? {
					title: event.title,
					subtitle: event.subtitle || "",
					date: eventDate,
					location: event.location || "",
					description: event.description || "",
					price: event.price || 0,
					capacity: event.capacity,
					poster_image: event.poster_image || "",
					is_online: event.is_online || false,
					online_url: event.online_url || "",
					rsvp_deadline: rsvpDeadline,
					is_published: event.is_published || false,
			  }
			: {
					title: "",
					subtitle: "",
					description: "",
					price: 0,
					is_online: false,
					is_published: false,
			  },
	});

	const handleSubmit = async (values: FormValues) => {
		setIsSubmitting(true);
		setError(null);
		try {
			if (isEditMode) {
				// Update existing event
				const response = await fetch(`/api/events/${event.id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						...values,
						updated_at: new Date().toISOString(),
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					console.error("Error updating event:", errorData);
					throw new Error(errorData.error || "Failed to update event");
				}

				// Redirect to the event detail page on success
				router.push(`/admin/events/${event.id}`);
			} else {
				// Create new event
				const response = await fetch("/api/events", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				});

				if (!response.ok) {
					console.error("Error creating event:", response);
					throw new Error("Failed to create event");
				}

				// Redirect to the event list page on success
				router.push("/admin/events");
			}

			router.refresh();
		} catch (err) {
			console.error(
				`Error ${isEditMode ? "updating" : "creating"} event:`,
				err
			);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const isOnline = form.watch("is_online");

	return (
		<Card>
			<CardContent className="pt-6">
				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
						{error}
					</div>
				)}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						<div className="grid gap-6 md:grid-cols-2">
							{/* Event Title */}
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Event Title *</FormLabel>
										<FormControl>
											<Input placeholder="Enter event title" {...field} />
										</FormControl>
										<FormDescription>
											The main title of your event.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Event Subtitle */}
							<FormField
								control={form.control}
								name="subtitle"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Subtitle</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter event subtitle (optional)"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											A secondary title or tagline for your event.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Event Date */}
							<FormField
								control={form.control}
								name="date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Event Date and Time *</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "PPP p")
														) : (
															<span>Pick a date and time</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													initialFocus
												/>
												{/* Time picker */}
												<div className="p-3 border-t">
													<Input
														type="time"
														onChange={(e) => {
															const date = new Date(field.value || new Date());
															const [hours, minutes] =
																e.target.value.split(":");
															date.setHours(parseInt(hours), parseInt(minutes));
															field.onChange(date);
														}}
														defaultValue={
															field.value
																? format(field.value, "HH:mm")
																: "18:00"
														}
													/>
												</div>
											</PopoverContent>
										</Popover>
										<FormDescription>
											When will the event take place?
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* RSVP Deadline */}
							<FormField
								control={form.control}
								name="rsvp_deadline"
								render={({ field }) => (
									<FormItem>
										<FormLabel>RSVP Deadline</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a deadline (optional)</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value || undefined}
													onSelect={field.onChange}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormDescription>
											The last day attendees can RSVP to the event.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Event Status */}
							<FormField
								control={form.control}
								name="is_published"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Event Status</FormLabel>
										<Select
											onValueChange={(value) =>
												field.onChange(value === "true")
											}
											defaultValue={field.value ? "true" : "false"}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select event status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="true">Published</SelectItem>
												<SelectItem value="false">Unpublished</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>
											Published events are visible to all users. Unpublished
											events are only visible to administrators.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Price */}
							<FormField
								control={form.control}
								name="price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Price</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												step="0.01"
												placeholder="0"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Price in USD (0 for free events).
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Capacity */}
							<FormField
								control={form.control}
								name="capacity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Capacity</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="1"
												placeholder="Unlimited"
												{...field}
												value={field.value === null ? "" : field.value}
												onChange={(e) => {
													const value =
														e.target.value === ""
															? null
															: parseInt(e.target.value);
													field.onChange(value);
												}}
											/>
										</FormControl>
										<FormDescription>
											Maximum number of attendees (leave empty for unlimited).
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Is Online */}
							<FormField
								control={form.control}
								name="is_online"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Online Event</FormLabel>
											<FormDescription>
												Check if this event will be held online.
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>

							{/* Location */}
							{!isOnline && (
								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Physical Location</FormLabel>
											<FormControl>
												<Input placeholder="Enter event location" {...field} />
											</FormControl>
											<FormDescription>
												The address or venue where the event will take place.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{/* Online URL */}
							{isOnline && (
								<FormField
									control={form.control}
									name="online_url"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Online URL</FormLabel>
											<FormControl>
												<Input placeholder="https://zoom.us/..." {...field} />
											</FormControl>
											<FormDescription>
												The URL where participants can join the online event.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{/* Poster Image */}
							<FormField
								control={form.control}
								name="poster_image"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Poster Image URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com/image.jpg"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											A URL to an image that represents your event.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Description */}
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Event Description *</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter details about the event..."
												className="min-h-32"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Provide a detailed description of the event.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex justify-end space-x-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{isEditMode ? "Save Changes" : "Create Event"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
