// lib/entities/newsletterSubscriptions.ts
import { Database } from "../lib/supabase/types";
import { supabase } from "../shared/index";

export type NewsletterSubscription =
	Database["public"]["Tables"]["newsletter_subscriptions"]["Row"];
export type NewsletterInsert =
	Database["public"]["Tables"]["newsletter_subscriptions"]["Insert"];

export async function subscribeToNewsletter(
	email: string,
	userId?: string
): Promise<NewsletterSubscription> {
	const { data, error } = await supabase
		.from("newsletter_subscriptions")
		.insert({ email, user_id: userId, status: "subscribed" })
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
	const { error } = await supabase
		.from("newsletter_subscriptions")
		.insert({ email, status: "unsubscribed" });

	if (error) throw error;
}
