"use client";

import { useState } from "react";

interface DebugPanelProps {
	data: Record<string, any>;
}

export function DebugPanel({ data }: DebugPanelProps) {
	const [isOpen, setIsOpen] = useState(true);

	if (process.env.NODE_ENV === "production") {
		return null;
	}

	return (
		<div className="fixed bottom-5 right-5 z-50">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 transition-colors"
			>
				{isOpen ? "Hide" : "Show"} Debug Info
			</button>

			{isOpen && (
				<div className="mt-2 p-4 bg-gray-800 text-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-auto">
					<div className="space-y-2">
						{Object.entries(data).map(([key, value]) => (
							<div key={key}>
								<div className="text-gray-400 text-sm">{key}</div>
								<pre className="text-xs overflow-auto">
									{JSON.stringify(value, null, 2)}
								</pre>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
