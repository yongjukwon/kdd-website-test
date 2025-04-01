"use client";

import { DebugPanel } from "@/shared/components/DebugPanel";
import { createContext, useContext, useEffect, useState } from "react";

interface DebugInfo {
	authState?: {
		user: unknown;
		error: Error | null;
		timestamp: string;
	};
	userData?: Record<string, unknown>;
	userDataError?: Error;
	currentUser?: unknown;
	authStatus?: "authenticated" | "unauthenticated";
	lastError?: Error;
	errorTimestamp?: string;
	loading?: boolean;
	initialCheckDone?: boolean;
	componentStatus?: "mounted" | "unmounted";
	lastAuthEvent?: string;
	sessionStatus?: "active" | "none";
	eventTimestamp?: string;
	status?: "signing-out" | "signed-out";
	signOutError?: Error;
	lastUpdated: string;
}

interface DebugContextType {
	debugInfo: DebugInfo;
	updateDebugInfo: (info: Partial<DebugInfo>) => void;
}

const DebugContext = createContext<DebugContextType | null>(null);

export function useDebug() {
	const context = useContext(DebugContext);
	if (!context) {
		throw new Error("useDebug must be used within a DebugProvider");
	}
	return context;
}

export function DebugProvider({ children }: { children: React.ReactNode }) {
	const [debugInfo, setDebugInfo] = useState<DebugInfo>({
		lastUpdated: "",
	});

	useEffect(() => {
		setDebugInfo((prev) => ({
			...prev,
			lastUpdated: new Date().toISOString(),
		}));
	}, []);

	const updateDebugInfo = (newInfo: Partial<DebugInfo>) => {
		setDebugInfo((prev) => ({
			...prev,
			...newInfo,
			lastUpdated: new Date().toISOString(),
		}));
	};

	return (
		<DebugContext.Provider value={{ debugInfo, updateDebugInfo }}>
			{children}
			{process.env.NODE_ENV === "development" && (
				<DebugPanel data={debugInfo} />
			)}
		</DebugContext.Provider>
	);
}
