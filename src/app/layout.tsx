import { PreloadAuth } from "@/components/auth/PreloadAuth";
import { DebugProvider } from "@/shared/providers/DebugProvider";
import { Footer } from "@/widgets/footer/Footer";
import { Navbar } from "@/widgets/navbar/Navbar";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Work_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const workSans = Work_Sans({
	subsets: ["latin"],
	variable: "--font-work-sans",
	display: "swap",
});

export const metadata: Metadata = {
	title: "KDD - Korean Developers and Designers",
	description: "A community for Korean developers and designers in Vancouver",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${workSans.variable} font-sans antialiased flex flex-col min-h-screen`}
			>
				<DebugProvider>
					<PreloadAuth />

					<Navbar />
					<main className="pt-16 flex-grow flex flex-col">{children}</main>
					<Footer />

					<Toaster position="top-right" />
				</DebugProvider>
			</body>
		</html>
	);
}
