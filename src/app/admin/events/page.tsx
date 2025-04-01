import { Button } from "@/components/ui/button";
import { EventList } from "@/features/admin/events/EventList";
import { getSupabaseServer } from "@/shared/supabase-server";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminEventsPage(
    props: {
        params: Promise<{ page: string; status: string }>;
    }
) {
    const params = await props.params;
    const supabase = await getSupabaseServer();

    // Get current filters and pagination
    const page = parseInt((await params.page) || "1");
    const status = (await params.status) || "all";
    const perPage = 10;

    // Build query
    let query = supabase
		.from("events")
		.select("*, users!inner(first_name, last_name)", { count: "exact" });

    // Filter by status
    if (status !== "all") {
		query = query.eq("status", status);
	}

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data: events, count } = await query
		.order("date", { ascending: false })
		.range(from, to);

    return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Events Management</h1>
				<Link href="/admin/events/new">
					<Button
						variant="default"
						className="bg-blue-600 text-white hover:bg-blue-700"
					>
						<Plus className="mr-2 h-4 w-4" />
						Create Event
					</Button>
				</Link>
			</div>

			<EventList
				events={events || []}
				count={count || 0}
				page={page}
				perPage={perPage}
				status={status}
			/>
		</div>
	);
}
