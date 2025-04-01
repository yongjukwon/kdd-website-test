import React from "react";

export function AboutPage() {
	return (
		<div className="container mx-auto px-4 py-12">
			<h1 className="text-3xl font-bold mb-6">About Us</h1>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div>
					<h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
					<p className="text-lg text-gray-700 mb-6">
						KDD is committed to fostering a vibrant community of data
						scientists, researchers, and practitioners. We strive to advance the
						field of knowledge discovery and data mining through collaboration,
						education, and innovation.
					</p>
					<h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
					<p className="text-lg text-gray-700">
						We envision a world where data-driven insights empower individuals
						and organizations to make better decisions, solve complex problems,
						and create positive impact in society.
					</p>
				</div>
				<div>
					<h2 className="text-2xl font-semibold mb-4">Our History</h2>
					<p className="text-lg text-gray-700 mb-6">
						Founded in [year], KDD has grown from a small group of enthusiasts
						to a global community. Over the years, we have organized numerous
						events, workshops, and conferences that have contributed
						significantly to the field.
					</p>
					<h2 className="text-2xl font-semibold mb-4">Our Team</h2>
					<p className="text-lg text-gray-700">
						Our team consists of dedicated professionals with diverse
						backgrounds and expertise. Together, we work to create valuable
						experiences and resources for our community members.
					</p>
				</div>
			</div>
		</div>
	);
}
