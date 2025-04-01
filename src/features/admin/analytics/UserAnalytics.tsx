"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// Format to display month names
const formatMonth = (month: string) => {
	const date = new Date(`${month}-01`);
	return date.toLocaleString("default", { month: "short" });
};

// Find the percentage growth from the previous month
const calculateGrowth = (data: { month: string; count: number }[]) => {
	if (data.length < 2) return 0;

	const currentMonth = data[data.length - 1].count;
	const previousMonth = data[data.length - 2].count;

	if (previousMonth === 0) return 100; // Handle division by zero

	return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
};

// Calculate total users
const calculateTotal = (data: { month: string; count: number }[]) => {
	return data.reduce((acc, item) => acc + item.count, 0);
};

interface UserAnalyticsProps {
	data: { month: string; count: number }[];
}

export function UserAnalytics({ data }: UserAnalyticsProps) {
	const [view, setView] = useState<"line" | "bar">("line");

	const growth = calculateGrowth(data);
	const totalUsers = calculateTotal(data);
	const chartData = data.map((item) => ({
		...item,
		name: formatMonth(item.month),
	}));

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>User Signups</CardTitle>
						<CardDescription>Monthly new user registrations</CardDescription>
					</div>
					<Tabs
						defaultValue="line"
						className="w-[150px]"
						onValueChange={(v) => setView(v as "line" | "bar")}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="line">Line</TabsTrigger>
							<TabsTrigger value="bar">Bar</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4 mb-6">
					<div className="bg-blue-50 p-4 rounded-lg">
						<div className="text-2xl font-bold">{totalUsers}</div>
						<div className="text-sm text-slate-500">Total Signups</div>
					</div>
					<div
						className={`p-4 rounded-lg ${
							growth >= 0 ? "bg-green-50" : "bg-red-50"
						}`}
					>
						<div
							className={`text-2xl font-bold ${
								growth >= 0 ? "text-green-700" : "text-red-700"
							}`}
						>
							{growth >= 0 ? `+${growth}%` : `${growth}%`}
						</div>
						<div className="text-sm text-slate-500">Monthly Growth</div>
					</div>
				</div>

				<div className="h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						{view === "line" ? (
							<LineChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip
									formatter={(value: number) => [`${value} users`, "Signups"]}
									labelFormatter={(value: string) =>
										`${value} ${new Date().getFullYear()}`
									}
								/>
								<Line
									type="monotone"
									dataKey="count"
									stroke="#3b82f6"
									activeDot={{ r: 8 }}
									name="Signups"
								/>
							</LineChart>
						) : (
							<BarChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip
									formatter={(value: number) => [`${value} users`, "Signups"]}
									labelFormatter={(value: string) =>
										`${value} ${new Date().getFullYear()}`
									}
								/>
								<Bar
									dataKey="count"
									fill="#3b82f6"
									name="Signups"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						)}
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
