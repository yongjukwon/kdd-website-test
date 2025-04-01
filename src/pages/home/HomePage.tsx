"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Sample event data
const eventCards = [
	{
		id: 1,
		color: "from-blue-100 to-blue-200",
		date: "2023.09.10",
		category: "인사이트",
		title: "왜 새로운 소득에 따라 달라질까?",
	},
	{
		id: 2,
		color: "from-green-100 to-green-200",
		date: "2023.09.10",
		category: "인사이트",
		title: "한국정보기술연구회, 자체대 보안리더 양성",
	},
	{
		id: 3,
		color: "from-amber-100 to-amber-200",
		date: "2023.09.10",
		category: "인사이트",
		title: "코로나가 바꾼 대한민국 시니어의 소비트렌드",
	},
	{
		id: 4,
		color: "from-rose-100 to-rose-200",
		date: "2023.09.15",
		category: "세션드 라이프 스토리",
		title: "인생 제2의 기회 어렵지 않았습니다.",
	},
	{
		id: 5,
		color: "from-purple-100 to-purple-200",
		date: "2023.09.20",
		category: "인사이트",
		title: "AI 시대의 개발자 역할과 미래",
	},
	{
		id: 6,
		color: "from-teal-100 to-teal-200",
		date: "2023.09.20",
		category: "인사이트",
		title: "블록체인 기술의 실용적 적용사례",
	},
	{
		id: 7,
		color: "from-blue-200 to-indigo-200",
		date: "2023.09.20",
		category: "인사이트",
		title: "클라우드 컴퓨팅의 미래 전망",
	},
	{
		id: 8,
		color: "from-pink-100 to-rose-200",
		date: "2023.09.20",
		category: "인사이트",
		title: "UX/UI 디자인 트렌드 2024",
	},
];

export function HomePage() {
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);
	const carouselRef = useRef<HTMLDivElement>(null);
	const [isPlaying] = useState(true);
	const autoplayRef = useRef<NodeJS.Timeout | null>(null);

	// Handle autoplay functionality
	const startAutoplay = useCallback(() => {
		if (autoplayRef.current) clearInterval(autoplayRef.current);

		autoplayRef.current = setInterval(() => {
			if (api) api.scrollNext();
		}, 3000); // Change slide every 4 seconds
	}, [api]);

	const stopAutoplay = useCallback(() => {
		if (autoplayRef.current) {
			clearInterval(autoplayRef.current);
			autoplayRef.current = null;
		}
	}, []);

	// Start/stop autoplay based on isPlaying state
	useEffect(() => {
		if (isPlaying) {
			startAutoplay();
		} else {
			stopAutoplay();
		}

		return () => stopAutoplay();
	}, [isPlaying, startAutoplay, stopAutoplay]);

	// Handle mouse wheel horizontal scrolling
	useEffect(() => {
		const carousel = carouselRef.current;
		if (!carousel) return;

		const handleWheel = (e: WheelEvent) => {
			// Only respond to horizontal scrolling (deltaX)
			if (e.deltaX !== 0) {
				e.preventDefault();
				stopAutoplay();

				if (e.deltaX > 0) {
					api?.scrollNext();
				} else {
					api?.scrollPrev();
				}

				// Restart autoplay after user interaction
				if (isPlaying) {
					setTimeout(startAutoplay, 5000);
				}
			}
		};

		carousel.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			carousel.removeEventListener("wheel", handleWheel);
		};
	}, [api, isPlaying, startAutoplay, stopAutoplay]);

	// Handle carousel API setup
	useEffect(() => {
		if (!api) {
			return;
		}

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap());

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});

		// Stop autoplay on interaction
		api.on("pointerDown", () => {
			stopAutoplay();
			// Restart autoplay after user interaction
			if (isPlaying) {
				setTimeout(startAutoplay, 5000);
			}
		});
	}, [api, isPlaying, startAutoplay, stopAutoplay]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopAutoplay();
		};
	}, [stopAutoplay]);

	return (
		<div className="flex flex-col flex-grow">
			<div className="relative">
				{/* Carousel section */}
				<div className="pt-40 pb-30 bg-white">
					<div className="container mx-auto px-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="w-full">
								<div className="flex flex-col mb-6">
									<span className="text-amber-600 font-medium uppercase tracking-wider mb-4">
										ABOUT KDD
									</span>
									<h2 className="text-4xl font-bold mb-6 leading-tight">
										KDD Promises Peace and Acts Upon the Promise
									</h2>
									<p className="text-lg text-gray-600 mb-8 leading-relaxed">
										Korean Developers and Designers (KDD) is an international
										community committed to attaining the shared goal of
										technology professionals—establishing connections and
										creating opportunities for growth.
									</p>
									<div className="mb-8">
										<Link href="/about">
											<Button
												variant="outline"
												className="uppercase tracking-wider px-8 py-6 h-auto text-sm border-gray-400 cursor-pointer"
											>
												VIEW MORE
											</Button>
										</Link>
									</div>
									<div className="order-1 md:order-2 h-64 md:h-[24rem] relative overflow-hidden mb-0">
										<Image
											src="/images/2024_tech_conference_group_photo.jpeg"
											alt="Large crowd gathered at an outdoor event venue"
											fill
											sizes="(max-width: 768px) 100vw, 50vw"
											className="object-cover"
											priority
										/>
									</div>
								</div>
							</div>

							<div className="w-full">
								<div className="order-2 md:order-1 h-64 md:h-[30rem] relative overflow-hidden md:mt-[3rem]">
									<Image
										src="/images/kdd_christmas_group_photo.jpg"
										alt="Community leaders and religious figures walking together with blue globe balloons"
										fill
										sizes="(max-width: 768px) 100vw, 50vw"
										className="object-cover"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* KDD Missions Section */}
				<div className="pb-30 pt-10 bg-white">
					<div className="container mx-auto px-4">
						<div className="text-center mb-16">
							<span className="text-amber-600 font-medium uppercase tracking-wider block mb-6">
								KDD MISSIONS
							</span>
							<h2 className="text-4xl font-bold mb-8 leading-tight max-w-4xl mx-auto">
								Building Community Together #Connect, #Learn, #Grow
							</h2>
							<p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
								With professionals from various backgrounds, disciplines, and
								skill levels, members of the KDD community are working together
								to create a supportive network for Korean developers and
								designers.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
							{/* Community Building */}
							<div className="text-center">
								<div className="w-36 h-36 bg-gray-100 rounded-full mx-auto mb-8 flex items-center justify-center">
									<div className="w-20 h-20">
										<svg
											viewBox="0 0 24 24"
											className="w-full h-full text-blue-600"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
											<circle cx="9" cy="7" r="4"></circle>
											<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
											<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
										</svg>
									</div>
								</div>
								<h3 className="text-2xl font-bold mb-4">Community Building</h3>
								<p className="text-gray-600 leading-relaxed">
									Creating a welcoming space for Korean developers and designers
									to connect, network, and build meaningful professional
									relationships. Our community events foster collaboration and
									mutual support.
								</p>
							</div>

							{/* Knowledge Sharing */}
							<div className="text-center">
								<div className="w-36 h-36 bg-gray-100 rounded-full mx-auto mb-8 flex items-center justify-center">
									<div className="w-20 h-20">
										<svg
											viewBox="0 0 24 24"
											className="w-full h-full text-blue-600"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
											<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
										</svg>
									</div>
								</div>
								<h3 className="text-2xl font-bold mb-4">Knowledge Sharing</h3>
								<p className="text-gray-600 leading-relaxed">
									Facilitating the exchange of technical expertise, industry
									trends, and professional development resources. Our workshops,
									talks, and mentorship programs help members grow their skills.
								</p>
							</div>

							{/* Career Development */}
							<div className="text-center">
								<div className="w-36 h-36 bg-gray-100 rounded-full mx-auto mb-8 flex items-center justify-center">
									<div className="w-20 h-20">
										<svg
											viewBox="0 0 24 24"
											className="w-full h-full text-blue-600"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
											<polyline points="22 4 12 14.01 9 11.01"></polyline>
										</svg>
									</div>
								</div>
								<h3 className="text-2xl font-bold mb-4">Career Development</h3>
								<p className="text-gray-600 leading-relaxed">
									Supporting members in advancing their professional careers
									through job opportunities, resume workshops, interview
									preparation, and industry connections. We aim to help every
									member achieve their career goals.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* KDD News Section */}
				<div className="pt-10 pb-30 bg-white">
					<div className="container mx-auto px-4">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
							<div>
								<span className="text-amber-600 font-medium uppercase tracking-wider block mb-2">
									KDD NEWS
								</span>
								<h2 className="text-4xl font-bold">
									Check out KDD&apos;s Recent News
								</h2>
							</div>
							<Link href="/blog" className="mt-4 md:mt-0">
								<Button
									variant="outline"
									className="uppercase tracking-wider border-gray-400"
								>
									VIEW ALL ARTICLES
								</Button>
							</Link>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{/* News Item 1 */}
							<div className="bg-white shadow-sm overflow-hidden cursor-pointer">
								<div className="h-60 relative">
									<Image
										src="/images/kdd_christmas_group_photo.jpg"
										alt="KDD Annual Tech Conference 2024"
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										className="object-cover"
									/>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold mb-3">
										The Annual KDD Tech Conference: Connecting Korean Developers
										Worldwide
									</h3>
									<p className="text-gray-500 mb-4">March 15, 2024</p>
								</div>
							</div>

							{/* News Item 2 */}
							<div className="bg-white shadow-sm overflow-hidden">
								<div className="h-60 relative">
									<Image
										src="/images/kdd_christmas_group_photo.jpg"
										alt="KDD Workshop Series Launch"
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										className="object-cover"
									/>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold mb-3">
										KDD Launches Weekly Workshop Series for New Developers
									</h3>
									<p className="text-gray-500 mb-4">February 28, 2024</p>
								</div>
							</div>

							{/* News Item 3 */}
							<div className="bg-white shadow-sm overflow-hidden">
								<div className="h-60 relative">
									<Image
										src="/images/kdd_christmas_group_photo.jpg"
										alt="KDD Partners with Local Tech Companies"
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										className="object-cover"
									/>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold mb-3">
										KDD Partners with Major Tech Companies for Mentorship
										Program
									</h3>
									<p className="text-gray-500 mb-4">January 20, 2024</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Upcoming Events Section */}
				<div className="py-20 bg-gray-50">
					<div className="container mx-auto px-4">
						<div className="flex justify-between items-center mb-12">
							<div>
								<span className="text-amber-600 font-medium uppercase tracking-wider block mb-3">
									JOIN US
								</span>
								<h2 className="text-3xl font-bold">Upcoming Events</h2>
							</div>
							<Link href="/events">
								<Button variant="outline" className="border-gray-400">
									View All Events
								</Button>
							</Link>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{eventCards.slice(0, 3).map((event) => (
								<Link href="/events" key={event.id}>
									<Card className="h-full hover:shadow-md transition-shadow">
										<CardHeader
											className={`bg-gradient-to-r ${event.color} p-6`}
										>
											<div className="flex flex-col">
												<span className="text-sm text-gray-600">
													{event.date}
												</span>
												<span className="text-xs text-gray-500 mt-1">
													{event.category}
												</span>
											</div>
										</CardHeader>
										<CardContent className="p-6">
											<h3 className="text-xl font-semibold mb-2">
												{event.title}
											</h3>
											<div className="mt-4 flex justify-end">
												<Button
													variant="ghost"
													size="sm"
													className="text-amber-600"
												>
													Read More
												</Button>
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>
				</div>

				{/* Carousel section */}
				<div className="pt-10 pb-30 bg-white">
					<div className="container mx-auto px-4">
						<div className="text-center mb-16">
							<span className="text-amber-600 font-medium uppercase tracking-wider block mb-6">
								KDD EVENTS
							</span>
							<h2 className="text-4xl font-bold mb-8 leading-tight max-w-4xl mx-auto">
								Check out KDD&apos;s Upcoming Events
							</h2>
							<p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
								Stay updated with the latest events and opportunities in the KDD
								community.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
							{/* Event Item 1 */}
							<div className="bg-white shadow-sm overflow-hidden cursor-pointer">
								<div className="h-60 relative">
									<Image
										src="/images/kdd_christmas_group_photo.jpg"
										alt="KDD Annual Tech Conference 2024"
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										className="object-cover"
									/>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold mb-3">
										The Annual KDD Tech Conference: Connecting Korean Developers
										Worldwide
									</h3>
									<p className="text-gray-500 mb-4">March 15, 2024</p>
								</div>
							</div>

							{/* Event Item 2 */}
							<div className="bg-white shadow-sm overflow-hidden">
								<div className="h-60 relative">
									<Image
										src="/images/kdd_christmas_group_photo.jpg"
										alt="KDD Workshop Series Launch"
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										className="object-cover"
									/>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold mb-3">
										KDD Launches Weekly Workshop Series for New Developers
									</h3>
									<p className="text-gray-500 mb-4">February 28, 2024</p>
								</div>
							</div>

							{/* Event Item 3 */}
							<div className="bg-white shadow-sm overflow-hidden">
								<div className="h-60 relative">
									<Image
										src="/images/kdd_christmas_group_photo.jpg"
										alt="KDD Partners with Local Tech Companies"
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										className="object-cover"
									/>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold mb-3">
										KDD Partners with Major Tech Companies for Mentorship
										Program
									</h3>
									<p className="text-gray-500 mb-4">January 20, 2024</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
