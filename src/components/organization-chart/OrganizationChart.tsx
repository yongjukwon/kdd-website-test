import Image from "next/image";
import React from "react";

// Types for our organization chart
interface TeamMember {
	id: string;
	name: string;
	position: string;
	photoUrl: string;
}

interface Team {
	id: string;
	name: string;
	color: string;
	members: TeamMember[];
}

interface OrganizationChartProps {
	centerMember: TeamMember;
	teams: Team[];
}

export function OrganizationChart({
	centerMember,
	teams,
}: OrganizationChartProps) {
	return (
		<div className="my-16">
			<h2 className="text-3xl font-bold text-center mb-12">
				KDD Organizational Chart
			</h2>

			<div className="relative w-full h-[700px]">
				{/* Center member (CEO/Director) */}
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
					<ChartNode
						member={centerMember}
						size="large"
						backgroundColor="bg-gray-700"
					/>
				</div>

				{/* Team clusters */}
				{teams.map((team, index) => (
					<TeamCluster
						key={team.id}
						team={team}
						position={index}
						centerMember={centerMember}
					/>
				))}

				{/* SVG connection lines would be added here */}
				<svg className="absolute top-0 left-0 w-full h-full -z-10">
					{/* Connection lines will be dynamically generated */}
				</svg>
			</div>
		</div>
	);
}

// Size variants for nodes
type NodeSize = "small" | "medium" | "large";

interface ChartNodeProps {
	member: TeamMember;
	size: NodeSize;
	backgroundColor?: string;
}

// Individual team member node
function ChartNode({
	member,
	size,
	backgroundColor = "bg-white",
}: ChartNodeProps) {
	// Size classes
	const sizeClasses = {
		small: "w-16 h-16",
		medium: "w-20 h-20",
		large: "w-24 h-24",
	};

	return (
		<div className="flex flex-col items-center">
			<div
				className={`rounded-full overflow-hidden border-4 border-white shadow-md ${sizeClasses[size]} ${backgroundColor}`}
			>
				{member.photoUrl ? (
					<Image
						src={member.photoUrl}
						alt={member.name}
						width={100}
						height={100}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-white">
						{member.name
							.split(" ")
							.map((n) => n[0])
							.join("")
							.toUpperCase()}
					</div>
				)}
			</div>
			<div className="text-center mt-2">
				<p className="font-bold text-sm">{member.name}</p>
				<p className="text-xs text-gray-600">{member.position}</p>
			</div>
		</div>
	);
}

interface TeamClusterProps {
	team: Team;
	position: number; // 0: top, 1: right, 2: bottom, 3: left
	centerMember: TeamMember;
}

// Cluster of team members
function TeamCluster({ team, position, centerMember }: TeamClusterProps) {
	// Calculate positions for the team cluster
	const getClusterPosition = () => {
		switch (position) {
			case 0: // top
				return "left-1/2 top-[10%] -translate-x-1/2";
			case 1: // right
				return "right-[10%] top-1/2 -translate-y-1/2";
			case 2: // bottom
				return "left-1/2 bottom-[10%] -translate-x-1/2";
			case 3: // left
				return "left-[10%] top-1/2 -translate-y-1/2";
			default:
				return "";
		}
	};

	return (
		<div className={`absolute ${getClusterPosition()}`}>
			<div className="mb-8">
				<h3
					className={`text-xl font-bold text-center mb-2`}
					style={{ color: team.color }}
				>
					{team.name}
				</h3>
			</div>

			<div className="flex flex-wrap justify-center gap-6">
				{team.members.map((member) => (
					<ChartNode
						key={member.id}
						member={member}
						size="medium"
						backgroundColor={`bg-[${team.color}]/10`}
					/>
				))}
			</div>
		</div>
	);
}
