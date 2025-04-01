"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	NameType,
	ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface EventData {
	id: string;
	title: string;
	date: string;
	capacity: number | null;
	attendees: number;
	waitlisted: number;
	fillRate: number;
}

interface EventAnalyticsProps {
	data: EventData[];
}

export function EventAnalytics({ data }: EventAnalyticsProps) {
	const [view, setView] = useState<"chart" | "table">("chart");

	// Calculate average fill rate
	const avgFillRate = useMemo(() => {
		if (data.length === 0) return 0;

		const eventsWithCapacity = data.filter((event) => !!event.capacity);
		if (eventsWithCapacity.length === 0) return 0;

		const totalFillRate = eventsWithCapacity.reduce(
			(acc, event) => acc + event.fillRate,
			0
		);
		return Math.round(totalFillRate / eventsWithCapacity.length);
	}, [data]);

	// Calculate total attendees
	const totalAttendees = useMemo(() => {
		return data.reduce((acc, event) => acc + event.attendees, 0);
	}, [data]);

	// Prepare data for the chart - limit to 7 events
	const chartData = useMemo(() => {
		return [...data]
			.slice(0, 7)
			.map((event) => ({
				name:
					event.title.length > 15
						? `${event.title.slice(0, 15)}...`
						: event.title,
				attendees: event.attendees,
				capacity: event.capacity || 0,
				fillRate: event.fillRate,
				fullTitle: event.title,
				date: format(new Date(event.date), "MMM d, yyyy"),
			}))
			.reverse(); // Display oldest events first
	}, [data]);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Event Attendance</CardTitle>
						<CardDescription>Attendance statistics for events</CardDescription>
					</div>
					<Tabs
						defaultValue="chart"
						className="w-[180px]"
						onValueChange={(v) => setView(v as "chart" | "table")}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="chart">Chart</TabsTrigger>
							<TabsTrigger value="table">Table</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4 mb-6">
					<div className="bg-purple-50 p-4 rounded-lg">
						<div className="text-2xl font-bold">{totalAttendees}</div>
						<div className="text-sm text-slate-500">Total Attendees</div>
					</div>
					<div className="bg-green-50 p-4 rounded-lg">
						<div className="text-2xl font-bold">{avgFillRate}%</div>
						<div className="text-sm text-slate-500">Avg. Fill Rate</div>
					</div>
				</div>

				{view === "chart" ? (
					<div className="h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip
									formatter={(value: ValueType, name: NameType) => [
										value,
										name === "attendees" ? "Attendees" : "Capacity",
									]}
									labelFormatter={(label) => {
										const item = chartData.find((item) => item.name === label);
										return item ? `${item.fullTitle} (${item.date})` : label;
									}}
								/>
								<Legend />
								<Bar
									dataKey="capacity"
									fill="#94a3b8"
									name="Capacity"
									radius={[4, 4, 0, 0]}
								/>
								<Bar
									dataKey="attendees"
									fill="#8b5cf6"
									name="Attendees"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Event</TableHead>
									<TableHead>Date</TableHead>
									<TableHead className="text-right">Attendees</TableHead>
									<TableHead className="text-right">Capacity</TableHead>
									<TableHead className="text-right">Fill Rate</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((event) => (
									<TableRow key={event.id}>
										<TableCell className="font-medium">{event.title}</TableCell>
										<TableCell>
											{format(new Date(event.date), "MMM d, yyyy")}
										</TableCell>
										<TableCell className="text-right">
											{event.attendees}
										</TableCell>
										<TableCell className="text-right">
											{event.capacity || "—"}
										</TableCell>
										<TableCell className="text-right">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													event.fillRate >= 90
														? "bg-green-100 text-green-800"
														: event.fillRate >= 60
														? "bg-blue-100 text-blue-800"
														: "bg-amber-100 text-amber-800"
												}`}
											>
												{event.fillRate}%
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
