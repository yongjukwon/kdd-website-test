import { UserTable } from "@/features/admin/users/UserTable";
import { getSupabaseServer } from "@/shared/supabase-server";

export default async function AdminUsersPage(
    props: {
        params: Promise<{ page: string; search: string }>;
    }
) {
    const params = await props.params;
    // Get current filters and pagination
    const page = parseInt((await params.page) || "1");
    const search = (await params.search) || "";
    const perPage = 20;

    // Calculate pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const supabase = await getSupabaseServer();

    // Build query
    let query = supabase.from("users").select("*", { count: "exact" });

    // Add search if provided
    if (search) {
		query = query.or(
			`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
		);
	}

    // Execute query with pagination
    const { data: users, count } = await query
		.order("created_at", { ascending: false })
		.range(from, to);

    return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">User Management</h1>

			<UserTable
				users={users || []}
				count={count || 0}
				page={page}
				perPage={perPage}
				search={search}
			/>
		</div>
	);
}
