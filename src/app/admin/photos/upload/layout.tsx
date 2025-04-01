import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Upload Photos | Admin | KDD",
	description: "Upload photos to KDD events",
};

export default function PhotoUploadLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
