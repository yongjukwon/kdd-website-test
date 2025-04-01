import { OrganizationChart } from "@/components/organization-chart/OrganizationChart";
import React from "react";

// Mock data for the organization chart
const mockCenterMember = {
	id: "ceo",
	name: "Mark Lee",
	position: "President",
	photoUrl: "/images/team/mark.jpg", // This would be a real image path in production
};

const mockTeams = [
	{
		id: "team1",
		name: "GREAT TEAM",
		color: "#5a7e3a", // green
		members: [
			{
				id: "member1",
				name: "C. Kelly",
				position: "Team Lead",
				photoUrl: "/images/team/kelly.jpg",
			},
			{
				id: "member2",
				name: "P. Brandt",
				position: "Developer",
				photoUrl: "/images/team/brandt.jpg",
			},
			{
				id: "member3",
				name: "Paul Torres",
				position: "Designer",
				photoUrl: "/images/team/torres.jpg",
			},
		],
	},
	{
		id: "team2",
		name: "SPECIAL TEAM",
		color: "#3a5e7e", // blue
		members: [
			{
				id: "member4",
				name: "Alice",
				position: "Team Lead",
				photoUrl: "/images/team/alice.jpg",
			},
			{
				id: "member5",
				name: "Judy",
				position: "Developer",
				photoUrl: "/images/team/judy.jpg",
			},
			{
				id: "member6",
				name: "Susanne",
				position: "Designer",
				photoUrl: "/images/team/susanne.jpg",
			},
		],
	},
	{
		id: "team3",
		name: "AMAZING TEAM",
		color: "#3a7e7e", // teal
		members: [
			{
				id: "member7",
				name: "M. Burne",
				position: "Team Lead",
				photoUrl: "/images/team/burne.jpg",
			},
			{
				id: "member8",
				name: "B. Graham",
				position: "Developer",
				photoUrl: "/images/team/graham.jpg",
			},
			{
				id: "member9",
				name: "H. Jeon",
				position: "Designer",
				photoUrl: "/images/team/jeon.jpg",
			},
		],
	},
	{
		id: "team4",
		name: "CREATIVE TEAM",
		color: "#7e3a5e", // purple
		members: [
			{
				id: "member10",
				name: "Simon",
				position: "Team Lead",
				photoUrl: "/images/team/simon.jpg",
			},
			{
				id: "member11",
				name: "N. Ellison",
				position: "Developer",
				photoUrl: "/images/team/ellison.jpg",
			},
			{
				id: "member12",
				name: "Sara Wirth",
				position: "Designer",
				photoUrl: "/images/team/wirth.jpg",
			},
		],
	},
];

export function AboutUsPage() {
	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto mb-16">
				<h1 className="text-4xl font-bold mb-6">About KDD</h1>

				<p className="text-lg mb-6">
					Korean Developers and Designers (KDD) is a community for tech
					professionals to connect, learn, and grow together in Vancouver. Our
					mission is to support Korean tech talents in their professional
					journey and build a strong network of industry professionals.
				</p>

				<p className="text-lg mb-6">
					Founded in 2020, KDD has grown to become a hub for innovation,
					collaboration, and knowledge sharing. We organize regular events,
					workshops, and networking sessions to foster connections and
					continuous learning.
				</p>
			</div>

			<div className="my-20">
				<h2 className="text-3xl font-bold text-center mb-4">Our Vision</h2>
				<p className="text-xl text-center max-w-3xl mx-auto">
					To create a thriving community where Korean developers and designers
					can connect, collaborate, and excel in the tech industry.
				</p>
			</div>

			{/* Organization Chart Section */}
			<div className="mb-20">
				<h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
				<p className="text-center max-w-3xl mx-auto mb-12">
					Meet the dedicated team behind KDD. Our leadership team works together
					to create valuable opportunities for our community members.
				</p>

				<OrganizationChart centerMember={mockCenterMember} teams={mockTeams} />
			</div>

			{/* Additional Sections */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
				<div>
					<h3 className="text-2xl font-bold mb-4">Our Values</h3>
					<ul className="space-y-3">
						<li className="flex items-start">
							<span className="text-amber-600 font-bold mr-2">•</span>
							<span>
								<strong>Community</strong>: Building connections and support
								networks
							</span>
						</li>
						<li className="flex items-start">
							<span className="text-amber-600 font-bold mr-2">•</span>
							<span>
								<strong>Growth</strong>: Fostering continuous learning and
								development
							</span>
						</li>
						<li className="flex items-start">
							<span className="text-amber-600 font-bold mr-2">•</span>
							<span>
								<strong>Excellence</strong>: Striving for quality in everything
								we do
							</span>
						</li>
						<li className="flex items-start">
							<span className="text-amber-600 font-bold mr-2">•</span>
							<span>
								<strong>Inclusion</strong>: Creating a welcoming environment for
								all
							</span>
						</li>
					</ul>
				</div>

				<div>
					<h3 className="text-2xl font-bold mb-4">Get Involved</h3>
					<p className="mb-4">
						There are many ways to become a part of the KDD community:
					</p>
					<ul className="space-y-3">
						<li className="flex items-start">
							<span className="text-amber-600 font-bold mr-2">•</span>
							<span>Attend our monthly events and workshops</span>
						</li>
						<li className="flex items-start">
							<span className="text-amber-600 font-bold mr-2">•</span>
							<span>Join our online community on Discord</span>
						</li>
						<li className="flex items-start">
							<span className="text-amber-600 font-bold mr-2">•</span>
							<span>Volunteer as a speaker or mentor</span>
						</li>
						<li className="flex items-start">
							<span className="text-amber-600 font-bold mr-2">•</span>
							<span>Partner with us as a sponsor</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
