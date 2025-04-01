import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Linkedin } from "lucide-react";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="bg-neutral-800 pt-16 pb-8 text-white">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
					{/* Column 1: Essential Info */}
					<div className="space-y-4">
						<h3 className="font-bold text-xl mb-4">KDD</h3>
						<p className="text-gray-300">
							Korean Developers & Designers (KDD) is a community for tech
							professionals to connect, learn, and grow together in Vancouver.
						</p>
						<div className="space-y-2">
							<p className="text-gray-300">📧 hello@kddvancouver.com</p>
							<div className="flex space-x-4 mt-4">
								<Link
									href="https://instagram.com/kddvancouver"
									className="text-gray-300 hover:text-amber-400"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-5 w-5"
									>
										<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
										<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
										<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
									</svg>
								</Link>
								<Link
									href="https://linkedin.com/company/kddvancouver"
									className="text-gray-300 hover:text-amber-400"
								>
									<Linkedin className="h-5 w-5" />
								</Link>
							</div>
						</div>
					</div>

					{/* Column 2: Quick Navigation Links Part 1 */}
					<div>
						<h3 className="font-bold text-lg mb-4">Community Overview</h3>
						<ul className="space-y-2 text-gray-300">
							<li>
								<Link href="/about" className="hover:text-amber-400">
									About Us
								</Link>
							</li>
							<li>
								<Link href="/team" className="hover:text-amber-400">
									Team & Leadership
								</Link>
							</li>
							<li>
								<Link href="/events" className="hover:text-amber-400">
									Events
								</Link>
							</li>
							<li>
								<Link href="/resources" className="hover:text-amber-400">
									Resources
								</Link>
							</li>
							<li>
								<Link href="/blog" className="hover:text-amber-400">
									Blog / Tech Articles
								</Link>
							</li>
						</ul>
					</div>

					{/* Column 3: Quick Navigation Links Part 2 */}
					<div>
						<h3 className="font-bold text-lg mb-4">Membership & Engagement</h3>
						<ul className="space-y-2 text-gray-300">
							<li>
								<Link href="/join" className="hover:text-amber-400">
									Join the Community
								</Link>
							</li>
							<li>
								<Link href="/newsletter" className="hover:text-amber-400">
									Newsletter Subscription
								</Link>
							</li>
							<li>
								<Link href="/partner" className="hover:text-amber-400">
									Partner with Us
								</Link>
							</li>
							<li>
								<Link href="/study-groups" className="hover:text-amber-400">
									Study Groups
								</Link>
							</li>
							<li>
								<Link href="/sponsors" className="hover:text-amber-400">
									Sponsorship Opportunities
								</Link>
							</li>
						</ul>
					</div>

					{/* Column 4: Newsletter Signup */}
					<div>
						<h3 className="font-bold text-lg mb-4">Stay Connected</h3>
						<p className="text-gray-300 mb-4">
							Stay updated on the latest KDD events and insights!
						</p>
						<div className="flex flex-col space-y-2">
							<Input
								type="email"
								placeholder="Your email address"
								className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
							/>
							<Button className="bg-amber-600 hover:bg-amber-700 text-white">
								Subscribe to Newsletter
							</Button>
						</div>
						<div className="mt-6">
							<Link href="/join" className="inline-block">
								<Button
									variant="outline"
									className="border-amber-600 text-amber-400 hover:bg-gray-800"
								>
									Join Our Community
								</Button>
							</Link>
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="border-t border-gray-800 my-6"></div>

				{/* Copyright */}
				<div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
					<p>© 2025 KDD. All rights reserved.</p>
					<div className="flex space-x-6 mt-4 md:mt-0">
						<Link href="/privacy" className="hover:text-amber-400">
							Privacy Policy
						</Link>
						<Link href="/terms" className="hover:text-amber-400">
							Terms of Service
						</Link>
						<Link href="/contact" className="hover:text-amber-400">
							Contact Us
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
