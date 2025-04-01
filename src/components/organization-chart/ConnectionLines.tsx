import React from "react";

interface Point {
	x: number;
	y: number;
}

interface ConnectionLinesProps {
	centerPoint: Point;
	teamPoints: {
		teamId: string;
		leaderPoint: Point;
		memberPoints: Point[];
	}[];
}

export function ConnectionLines({
	centerPoint,
	teamPoints,
}: ConnectionLinesProps) {
	return (
		<svg
			className="absolute inset-0 w-full h-full -z-10"
			style={{ pointerEvents: "none" }}
		>
			{/* Lines from center to team leaders */}
			{teamPoints.map(({ teamId, leaderPoint }) => (
				<line
					key={`center-to-${teamId}`}
					x1={centerPoint.x}
					y1={centerPoint.y}
					x2={leaderPoint.x}
					y2={leaderPoint.y}
					stroke="#ccc"
					strokeWidth="1.5"
					strokeDasharray="5,5"
				/>
			))}

			{/* Lines from team leaders to team members */}
			{teamPoints.map(({ teamId, leaderPoint, memberPoints }) =>
				memberPoints.map((memberPoint, index) => (
					<line
						key={`${teamId}-leader-to-member-${index}`}
						x1={leaderPoint.x}
						y1={leaderPoint.y}
						x2={memberPoint.x}
						y2={memberPoint.y}
						stroke="#ddd"
						strokeWidth="1"
					/>
				))
			)}
		</svg>
	);
}
