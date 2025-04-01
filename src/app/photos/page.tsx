import { PhotosPage } from "@/pages/photos/PhotosPage";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Photos | KDD",
	description: "Browse photos from KDD events",
};

export default function Photos() {
	return <PhotosPage />;
}
