import { EventForm } from "@/features/admin/events/EventForm";
import { getSupabaseServer } from "@/shared/supabase-server";
import { notFound } from "next/navigation";

export default async function EditEventPage(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = await props.params;
    // Get the event data
    try {
		const id = await params.id;
		const supabase = await getSupabaseServer();
		const { data: event, error } = await supabase
			.from("events")
			.select("*")
			.eq("id", id)
			.single();

		if (error || !event) {
			notFound();
		}

		return (
			<div className="space-y-6">
				<h1 className="text-3xl font-bold">Edit Event</h1>
				<p className="text-muted-foreground">Update the event details below.</p>

				<EventForm event={event} />
			</div>
		);
	} catch (error) {
		console.error("Error fetching event:", error);
		notFound();
	}
}
