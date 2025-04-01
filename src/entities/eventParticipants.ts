// lib/entities/eventParticipants.ts
import { Database } from "../lib/supabase/types";
import { supabase } from "../shared/index";

export type EventParticipant =
	Database["public"]["Tables"]["event_participants"]["Row"];
export type EventParticipantInsert =
	Database["public"]["Tables"]["event_participants"]["Insert"];
export type EventParticipantUpdate =
	Database["public"]["Tables"]["event_participants"]["Update"];

export async function getMyEventParticipants(
	userId: string
): Promise<EventParticipant[]> {
	const { data, error } = await supabase
		.from("event_participants")
		.select("*")
		.eq("user_id", userId);

	if (error) throw error;
	return data;
}

export async function upsertEventParticipant(
	payload: EventParticipantInsert
): Promise<EventParticipant> {
	const { data, error } = await supabase
		.from("event_participants")
		.upsert(payload, { onConflict: "user_id,event_id" })
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function updateEventParticipant(
	id: string,
	updates: EventParticipantUpdate
): Promise<EventParticipant> {
	const { data, error } = await supabase
		.from("event_participants")
		.update(updates)
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteEventParticipant(id: string): Promise<void> {
	const { error } = await supabase
		.from("event_participants")
		.delete()
		.eq("id", id);

	if (error) throw error;
}
