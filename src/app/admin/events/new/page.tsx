import { EventForm } from "@/features/admin/events/EventForm";

export default function NewEventPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Create New Event</h1>
			<p className="text-muted-foreground">
				Fill in the form below to create a new event for KDD.
			</p>

			<EventForm />
		</div>
	);
}
