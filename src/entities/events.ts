// lib/entities/events.ts
import { isAfter, isBefore, isToday } from "date-fns";
import { Database } from "../lib/supabase/types";
import { supabase } from "../shared/index";

// Status is now computed from date rather than stored in the database
export type ComputedEventStatus = "ongoing" | "upcoming" | "past" | "canceled";
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

/**
 * Computes the event status based on its date
 */
export function getEventStatus(
	event: Event,
	now = new Date()
): ComputedEventStatus {
	const eventDate = new Date(event.date);

	// If today is the event date, it's ongoing
	if (isToday(eventDate)) {
		return "ongoing";
	}

	// If the event date is in the past, it's a past event
	if (isBefore(eventDate, now)) {
		return "past";
	}

	// Otherwise it's upcoming
	return "upcoming";
}

export async function getAllEvents(): Promise<Event[]> {
	const { data, error } = await supabase
		.from("events")
		.select("*")
		.order("date", { ascending: true });

	if (error) throw error;
	return data;
}

export async function getEventById(id: string): Promise<Event> {
	const { data, error } = await supabase
		.from("events")
		.select("*")
		.eq("id", id)
		.single();

	if (error) throw error;
	return data;
}

export async function createEvent(payload: EventInsert): Promise<Event> {
	const { data, error } = await supabase
		.from("events")
		.insert(payload)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function updateEvent(
	id: string,
	updates: EventUpdate
): Promise<Event> {
	const { data, error } = await supabase
		.from("events")
		.update(updates)
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteEvent(id: string): Promise<void> {
	const { error } = await supabase.from("events").delete().eq("id", id);
	if (error) throw error;
}
