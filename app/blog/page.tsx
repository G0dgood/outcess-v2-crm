'use client';

import React from 'react';
import LandingHeader from '@/components/ui/LandingHeader';
import LandingFooter from '@/components/ui/landing/LandingFooter';
import { plusJakartaStyle } from '@/components/Options';
import { ArrowRightIcon, CalendarIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import Image from 'next/image';

const BlogPage: React.FC = () => {
	const featuredPost = {
		title: '5 Ways to Improve Call Center Agent Productivity',
		excerpt: 'Discover proven strategies to boost your call center team\'s efficiency and reduce average handle time.',
		author: 'Sarah Johnson',
		date: 'March 15, 2025',
		category: 'Productivity',
		readTime: '5 min read',
		image: '/logo/Call1.svg'
	};

	const blogPosts = [
		{
			title: 'The Future of CRM: AI-Powered Customer Insights',
			excerpt: 'How artificial intelligence is transforming customer relationship management and enabling data-driven decisions.',
			author: 'Michael Chen',
			date: 'March 10, 2025',
			category: 'Technology',
			readTime: '7 min read',
			image: '/logo/Call2.svg'
		},
		{
			title: 'Best Practices for Call Center Quality Assurance',
			excerpt: 'Learn how to implement effective QA programs that improve customer satisfaction and agent performance.',
			author: 'Emily Rodriguez',
			date: 'March 5, 2025',
			category: 'Best Practices',
			readTime: '6 min read',
			image: '/logo/Call3.svg'
		},
		{
			title: 'Reducing Average Handle Time: A Complete Guide',
			excerpt: 'Practical tips and strategies to decrease AHT while maintaining high-quality customer interactions.',
			author: 'David Thompson',
			date: 'February 28, 2025',
			category: 'Operations',
			readTime: '8 min read',
			image: '/logo/Call4.svg'
		},
		{
			title: 'Omnichannel Support: Connecting All Customer Touchpoints',
			excerpt: 'Why unified customer communication across channels is essential for modern call centers.',
			author: 'Lisa Park',
			date: 'February 20, 2025',
			category: 'Customer Experience',
			readTime: '6 min read',
			image: '/logo/Call5.svg'
		},
		{
			title: 'Data Security in Call Centers: Compliance and Best Practices',
			excerpt: 'Ensure your call center meets industry standards for data protection and customer privacy.',
			author: 'James Wilson',
			date: 'February 15, 2025',
			category: 'Security',
			readTime: '9 min read',
			image: '/logo/Call6.svg'
		},
		{
			title: 'Building a High-Performance Call Center Team',
			excerpt: 'Recruitment, training, and retention strategies for building a world-class call center workforce.',
			author: 'Maria Garcia',
			date: 'February 10, 2025',
			category: 'Team Management',
			readTime: '7 min read',
			image: '/logo/Call7.svg'
		}
	];

	const categories = ['All', 'Productivity', 'Technology', 'Best Practices', 'Operations', 'Customer Experience', 'Security', 'Team Management'];

	return (
		<div className="bg-page min-h-screen">
			<LandingHeader />

			{/* Hero Section */}
			<section className="pt-32 pb-16 px-6 md:px-[180px]">
				<div className="max-w-4xl mx-auto text-center">
					<h1
						className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#050711] leading-tight"
						style={plusJakartaStyle}
					>
						Peoplely Blog
					</h1>
					<p
						className="text-lg md:text-xl text-[#4A5565] leading-relaxed"
						style={plusJakartaStyle}
					>
						Insights, tips, and best practices for call center operations, customer experience, and CRM technology.
					</p>
				</div>
			</section>

			{/* Featured Post */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-2xl font-semibold mb-8 text-[#050711]"
						style={plusJakartaStyle}
					>
						Featured Article
					</h2>
					<div
						className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-lg border"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<div className="flex items-center justify-center">
							<div
								className="w-full h-64 rounded-lg flex items-center justify-center"
								style={{ backgroundColor: 'var(--light-gray)' }}
							>
								<Image
									src={featuredPost.image}
									alt={featuredPost.title}
									width={200}
									height={200}
									className="object-contain"
								/>
							</div>
						</div>
						<div className="flex flex-col justify-center">
							<div className="flex items-center gap-3 mb-4">
								<span
									className="text-xs px-3 py-1 rounded-full font-medium"
									style={{
										backgroundColor: '#6C8B7D',
										color: 'white'
									}}
								>
									{featuredPost.category}
								</span>
								<span
									className="text-xs text-[#4A5565] flex items-center gap-1"
									style={plusJakartaStyle}
								>
									<CalendarIcon className="w-3 h-3" />
									{featuredPost.date}
								</span>
							</div>
							<h3
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								{featuredPost.title}
							</h3>
							<p
								className="text-base text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								{featuredPost.excerpt}
							</p>
							<div className="flex items-center justify-between">
								<div>
									<p
										className="text-sm font-medium text-[#050711]"
										style={plusJakartaStyle}
									>
										{featuredPost.author}
									</p>
									<p
										className="text-xs text-[#4A5565]"
										style={plusJakartaStyle}
									>
										{featuredPost.readTime}
									</p>
								</div>
								<Link
									href={`/blog/${encodeURIComponent(featuredPost.title.toLowerCase().replace(/\s+/g, '-'))}`}
									className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
									style={{
										backgroundColor: '#050711',
										color: 'white'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = '#6C8B7D';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = '#050711';
									}}
								>
									Read Article
									<ArrowRightIcon className="w-4 h-4" />
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Categories */}
			<section className="py-8 px-6 md:px-[180px] bg-white border-b"
				style={{ borderColor: 'var(--light-gray)' }}
			>
				<div className="max-w-6xl mx-auto">
					<div className="flex flex-wrap gap-3">
						{categories.map((category) => (
							<button
								key={category}
								className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
								style={{
									backgroundColor: category === 'All' ? '#050711' : 'transparent',
									color: category === 'All' ? 'white' : 'var(--text-secondary)',
									border: category !== 'All' ? '1px solid' : 'none',
									borderColor: category !== 'All' ? 'var(--light-gray)' : 'transparent'
								}}
								onMouseEnter={(e) => {
									if (category !== 'All') {
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
									}
								}}
								onMouseLeave={(e) => {
									if (category !== 'All') {
										e.currentTarget.style.backgroundColor = 'transparent';
									}
								}}
							>
								{category}
							</button>
						))}
					</div>
				</div>
			</section>

			{/* Blog Posts Grid */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-3xl md:text-4xl font-bold mb-12 text-[#050711]"
						style={plusJakartaStyle}
					>
						Latest Articles
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{blogPosts.map((post, index) => (
							<Link
								key={index}
								href={`/blog/${encodeURIComponent(post.title.toLowerCase().replace(/\s+/g, '-'))}`}
								className="group"
							>
								<div
									className="p-6 rounded-lg border h-full flex flex-col transition-all hover:shadow-lg"
									style={{
										backgroundColor: 'var(--accent-white)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<div
										className="w-full h-48 rounded-lg mb-4 flex items-center justify-center"
										style={{ backgroundColor: 'var(--light-gray)' }}
									>
										<Image
											src={post.image}
											alt={post.title}
											width={150}
											height={150}
											className="object-contain"
										/>
									</div>
									<div className="flex items-center gap-3 mb-3">
										<span
											className="text-xs px-3 py-1 rounded-full font-medium"
											style={{
												backgroundColor: 'var(--light-gray)',
												color: 'var(--text-secondary)'
											}}
										>
											{post.category}
										</span>
										<span
											className="text-xs text-[#4A5565] flex items-center gap-1"
											style={plusJakartaStyle}
										>
											<CalendarIcon className="w-3 h-3" />
											{post.date}
										</span>
									</div>
									<h3
										className="text-xl font-semibold mb-3 text-[#050711] group-hover:text-[#6C8B7D] transition-colors"
										style={plusJakartaStyle}
									>
										{post.title}
									</h3>
									<p
										className="text-sm text-[#4A5565] leading-relaxed mb-4 flex-1"
										style={plusJakartaStyle}
									>
										{post.excerpt}
									</p>
									<div className="flex items-center justify-between pt-4 border-t"
										style={{ borderColor: 'var(--light-gray)' }}
									>
										<div>
											<p
												className="text-sm font-medium text-[#050711]"
												style={plusJakartaStyle}
											>
												{post.author}
											</p>
											<p
												className="text-xs text-[#4A5565]"
												style={plusJakartaStyle}
											>
												{post.readTime}
											</p>
										</div>
										<ArrowRightIcon className="w-5 h-5 text-[#4A5565] group-hover:text-[#6C8B7D] transition-colors" />
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Newsletter Section */}
			<section
				className="py-16 px-6 md:px-[180px] text-center"
				style={{ backgroundColor: '#6C8B7D' }}
			>
				<div className="max-w-3xl mx-auto">
					<h2
						className="text-3xl md:text-4xl font-bold mb-4 text-white"
						style={plusJakartaStyle}
					>
						Stay Updated
					</h2>
					<p
						className="text-base md:text-lg text-white/90 mb-8"
						style={plusJakartaStyle}
					>
						Get the latest articles, tips, and insights delivered to your inbox.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
						<input
							type="email"
							placeholder="Enter your email"
							className="flex-1 px-4 py-3 rounded-lg text-sm"
							style={{
								backgroundColor: 'white',
								color: '#050711'
							}}
						/>
						<button
							className="px-8 py-3 bg-[#050711] text-white rounded-lg font-semibold text-sm transition-colors hover:bg-[#050711]/90"
							style={plusJakartaStyle}
						>
							Subscribe
						</button>
					</div>
				</div>
			</section>

			<LandingFooter />
		</div>
	);
};

export default BlogPage;




