import React from "react";

export function BlogsPage() {
	// Sample blog data - in a real app, this would come from an API
	const featuredPost = {
		id: 1,
		title: "Advancements in Deep Learning: A 2024 Perspective",
		date: "April 15, 2024",
		author: "Dr. Jane Smith",
		authorRole: "AI Research Lead",
		excerpt:
			"As we progress through 2024, the field of deep learning continues to evolve at an unprecedented pace. This article explores the latest breakthroughs and their implications for various industries.",
		readTime: "8 min read",
		category: "AI & Machine Learning",
	};

	const recentPosts = [
		{
			id: 2,
			title: "Data Privacy in the Age of AI: Challenges and Solutions",
			date: "April 3, 2024",
			author: "Michael Johnson",
			excerpt:
				"With the rapid adoption of AI systems, data privacy concerns are more relevant than ever. We explore the current landscape and proposed solutions.",
			readTime: "6 min read",
			category: "Data Ethics",
		},
		{
			id: 3,
			title: "Optimizing Database Performance for Big Data Applications",
			date: "March 28, 2024",
			author: "Sarah Chen",
			excerpt:
				"Learn practical strategies for improving database performance when dealing with large-scale data processing requirements.",
			readTime: "10 min read",
			category: "Data Engineering",
		},
		{
			id: 4,
			title: "Explainable AI: Making Black Box Models Transparent",
			date: "March 15, 2024",
			author: "Dr. Robert Williams",
			excerpt:
				"Transparency in AI decision-making is crucial for adoption in regulated industries. This post examines methods for making AI models more explainable.",
			readTime: "7 min read",
			category: "AI & Machine Learning",
		},
		{
			id: 5,
			title: "Natural Language Processing Trends in 2024",
			date: "March 5, 2024",
			author: "Emily Parker",
			excerpt:
				"From conversational AI to multilingual models, NLP continues to advance rapidly. We look at the most exciting developments this year.",
			readTime: "5 min read",
			category: "NLP",
		},
	];

	return (
		<div className="container mx-auto px-4 py-12">
			<h1 className="text-3xl font-bold mb-8">KDD Blog</h1>

			{/* Featured Post */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl overflow-hidden shadow-sm mb-12">
				<div className="p-8">
					<div className="mb-2">
						<span className="text-sm font-medium text-blue-600 bg-blue-50 rounded-full px-3 py-1">
							{featuredPost.category}
						</span>
					</div>
					<h2 className="text-2xl font-bold mb-3">{featuredPost.title}</h2>
					<div className="flex items-center mb-4">
						<div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
							{featuredPost.author.charAt(0)}
						</div>
						<div>
							<p className="font-medium">{featuredPost.author}</p>
							<p className="text-sm text-gray-600">{featuredPost.authorRole}</p>
						</div>
						<div className="ml-auto text-sm text-gray-500">
							{featuredPost.date} • {featuredPost.readTime}
						</div>
					</div>
					<p className="text-gray-700 mb-6">{featuredPost.excerpt}</p>
					<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
						Read Full Article
					</button>
				</div>
			</div>

			{/* Recent Posts */}
			<h2 className="text-2xl font-semibold mb-6">Recent Articles</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{recentPosts.map((post) => (
					<div
						key={post.id}
						className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
					>
						<div className="p-6">
							<div className="mb-2">
								<span className="text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2 py-1">
									{post.category}
								</span>
							</div>
							<h3 className="font-bold text-xl mb-2">{post.title}</h3>
							<p className="text-gray-700 mb-4">{post.excerpt}</p>
							<div className="flex items-center text-sm text-gray-500">
								<span>{post.author}</span>
								<span className="mx-2">•</span>
								<span>{post.date}</span>
								<span className="mx-2">•</span>
								<span>{post.readTime}</span>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-8 text-center">
				<button className="px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors">
					View All Articles
				</button>
			</div>
		</div>
	);
}
