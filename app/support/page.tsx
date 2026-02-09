'use client';

import React, { useState } from 'react';
import LandingHeader from '@/components/ui/LandingHeader';
import LandingFooter from '@/components/ui/landing/LandingFooter';
import { plusJakartaStyle } from '@/components/Options';
import { MagnifyingGlassIcon, ChatBubbleIcon, EnvelopeClosedIcon, FileTextIcon, PlayIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

const SupportPage: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState('');

	const supportCategories = [
		{
			title: 'Getting Started',
			icon: FileTextIcon,
			description: 'Learn the basics and set up your account',
			articles: [
				'How to create your first account',
				'Setting up your dashboard',
				'Adding team members',
				'Configuring your first workflow'
			]
		},
		{
			title: 'Account & Billing',
			icon: ChatBubbleIcon,
			description: 'Manage your subscription and billing',
			articles: [
				'Upgrading your plan',
				'Managing payment methods',
				'Understanding your invoice',
				'Canceling your subscription'
			]
		},
		{
			title: 'Features & Usage',
			icon: PlayIcon,
			description: 'Master all platform features',
			articles: [
				'Using the call routing system',
				'Setting up custom workflows',
				'Managing customer contacts',
				'Using analytics and reports'
			]
		},
		{
			title: 'Integrations',
			icon: ArrowRightIcon,
			description: 'Connect with your favorite tools',
			articles: [
				'Slack integration guide',
				'Connecting your phone system',
				'Email integration setup',
				'API documentation'
			]
		}
	];

	const faqs = [
		{
			question: 'How do I reset my password?',
			answer: 'You can reset your password by clicking "Forgot Password" on the login page. You\'ll receive an email with instructions to create a new password.'
		},
		{
			question: 'Can I change my subscription plan?',
			answer: 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and billing is prorated.'
		},
		{
			question: 'How do I add more users to my account?',
			answer: 'Go to Settings > Users and click "Add User". You can assign roles and permissions to each user. Additional users may require a plan upgrade.'
		},
		{
			question: 'Is my data secure?',
			answer: 'Yes, we use AES-256 encryption, maintain SOC 2 Type II certification, and comply with GDPR, HIPAA, and PCI-DSS standards. Learn more on our Security page.'
		},
		{
			question: 'How can I export my data?',
			answer: 'You can export your data from Settings > Data Export. Choose the format (CSV, JSON) and date range, then download your export file.'
		},
		{
			question: 'What browsers are supported?',
			answer: 'We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome or Firefox.'
		}
	];

	const contactMethods = [
		{
			title: 'Email Support',
			description: 'Get help via email. We typically respond within 24 hours.',
			icon: EnvelopeClosedIcon,
			action: 'Send Email',
			link: 'mailto:support@peoplely.com',
			availability: '24/7'
		},
		{
			title: 'Live Chat',
			description: 'Chat with our support team in real-time during business hours.',
			icon: ChatBubbleIcon,
			action: 'Start Chat',
			link: '#',
			availability: 'Mon-Fri, 9 AM - 6 PM EST'
		},
		{
			title: 'Help Center',
			description: 'Browse our comprehensive documentation and guides.',
			icon: FileTextIcon,
			action: 'Browse Docs',
			link: '/docs',
			availability: 'Always Available'
		}
	];

	return (
		<div className="bg-page min-h-screen">
			<LandingHeader />

			{/* Hero Section */}
			<section className="pt-32 pb-16 px-6 md:px-[180px]">
				<div className="max-w-4xl mx-auto text-center">
					<h1
						className="text-[30px] md:text-[36px] lg:text-[48px] font-bold mb-6 text-[#050711] leading-tight"
						style={plusJakartaStyle}
					>
						How Can We Help?
					</h1>
					<p
						className="text-[14px] md:text-[16px] text-[#4A5565] leading-relaxed mb-8"
						style={plusJakartaStyle}
					>
						Find answers, get help, and learn how to make the most of Peoplely CRM.
					</p>

					{/* Search Bar */}
					<div className="max-w-2xl mx-auto">
						<div className="relative">
							<MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A5565]" />
							<input
								type="text"
								placeholder="Search for help articles, guides, or FAQs..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-12 pr-4 py-4 rounded-lg border text-[10px] md:text-[12px]"
								style={{
									borderColor: 'var(--light-gray)',
									backgroundColor: 'white',
									color: '#050711'
								}}
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Methods */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-[24px] md:text-[30px] font-bold mb-12 text-[#050711] text-center"
						style={plusJakartaStyle}
					>
						Get in Touch
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{contactMethods.map((method, index) => {
							const IconComponent = method.icon;
							return (
								<div
									key={index}
									className="p-6 rounded-lg border flex flex-col"
									style={{
										backgroundColor: 'var(--accent-white)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<div
										className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
										style={{ backgroundColor: 'var(--light-gray)' }}
									>
										<IconComponent className="w-6 h-6" style={{ color: '#6C8B7D' }} />
									</div>
									<h3
										className="text-[14px] md:text-[16px] font-semibold mb-2 text-[#050711]"
										style={plusJakartaStyle}
									>
										{method.title}
									</h3>
									<p
										className="text-[10px] md:text-[12px] text-[#4A5565] leading-relaxed mb-4 flex-1"
										style={plusJakartaStyle}
									>
										{method.description}
									</p>
									<p
										className="text-[8px] md:text-[10px] text-[#4A5565] mb-4"
										style={plusJakartaStyle}
									>
										{method.availability}
									</p>
									<Link
										href={method.link}
										className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-[10px] md:text-[12px] transition-colors"
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
										{method.action}
									</Link>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Help Categories */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-[24px] md:text-[30px] font-bold mb-12 text-[#050711] text-center"
						style={plusJakartaStyle}
					>
						Browse by Category
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{supportCategories.map((category, index) => {
							const IconComponent = category.icon;
							return (
								<div
									key={index}
									className="p-6 rounded-lg border"
									style={{
										backgroundColor: 'var(--accent-white)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<div className="flex items-start gap-4">
										<div
											className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
											style={{ backgroundColor: 'var(--light-gray)' }}
										>
											<IconComponent className="w-6 h-6" style={{ color: '#6C8B7D' }} />
										</div>
										<div className="flex-1">
											<h3
												className="text-[14px] md:text-[16px] font-semibold mb-2 text-[#050711]"
												style={plusJakartaStyle}
											>
												{category.title}
											</h3>
											<p
												className="text-[10px] md:text-[12px] text-[#4A5565] leading-relaxed mb-4"
												style={plusJakartaStyle}
											>
												{category.description}
											</p>
											<ul className="space-y-2">
												{category.articles.map((article, articleIndex) => (
													<li key={articleIndex}>
														<Link
															href={`/support/article/${encodeURIComponent(article.toLowerCase().replace(/\s+/g, '-'))}`}
															className="text-[10px] md:text-[12px] text-[#6C8B7D] hover:underline flex items-center gap-2"
															style={plusJakartaStyle}
														>
															<ArrowRightIcon className="w-3 h-3" />
															{article}
														</Link>
													</li>
												))}
											</ul>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-4xl mx-auto">
					<h2
						className="text-[24px] md:text-[30px] font-bold mb-12 text-[#050711] text-center"
						style={plusJakartaStyle}
					>
						Frequently Asked Questions
					</h2>

					<div className="space-y-4">
						{faqs.map((faq, index) => (
							<div
								key={index}
								className="p-6 rounded-lg border"
								style={{
									backgroundColor: 'var(--accent-white)',
									borderColor: 'var(--light-gray)'
								}}
							>
								<h3
									className="text-[12px] md:text-[14px] font-semibold mb-3 text-[#050711]"
									style={plusJakartaStyle}
								>
									{faq.question}
								</h3>
								<p
									className="text-[10px] md:text-[12px] text-[#4A5565] leading-relaxed"
									style={plusJakartaStyle}
								>
									{faq.answer}
								</p>
							</div>
						))}
					</div>

					<div className="mt-12 text-center">
						<p
							className="text-base text-[#4A5565] mb-4"
							style={plusJakartaStyle}
						>
							Still have questions?
						</p>
						<Link
							href="mailto:support@peoplely.com"
							className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border font-semibold text-[10px] md:text-[12px] transition-colors"
							style={{
								borderColor: 'var(--light-gray)',
								color: 'var(--text-primary)'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'transparent';
							}}
						>
							Contact Support
							<ArrowRightIcon className="w-4 h-4" />
						</Link>
					</div>
				</div>
			</section>

			{/* Resources Section */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-[24px] md:text-[30px] font-bold mb-12 text-[#050711] text-center"
						style={plusJakartaStyle}
					>
						Additional Resources
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Link
							href="/blog"
							className="p-6 rounded-lg border group transition-all hover:shadow-lg"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<FileTextIcon className="w-8 h-8 mb-4 text-[#6C8B7D]" />
							<h3
								className="text-[12px] md:text-[14px] font-semibold mb-2 text-[#050711] group-hover:text-[#6C8B7D] transition-colors"
								style={plusJakartaStyle}
							>
								Blog & Guides
							</h3>
							<p
								className="text-[10px] md:text-[12px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								Read articles, tutorials, and best practices from our team.
							</p>
						</Link>

						<Link
							href="/docs"
							className="p-6 rounded-lg border group transition-all hover:shadow-lg"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<PlayIcon className="w-8 h-8 mb-4 text-[#6C8B7D]" />
							<h3
								className="text-[12px] md:text-[14px] font-semibold mb-2 text-[#050711] group-hover:text-[#6C8B7D] transition-colors"
								style={plusJakartaStyle}
							>
								Video Tutorials
							</h3>
							<p
								className="text-[10px] md:text-[12px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								Watch step-by-step video guides to master the platform.
							</p>
						</Link>

						<Link
							href="/api-docs"
							className="p-6 rounded-lg border group transition-all hover:shadow-lg"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<ArrowRightIcon className="w-8 h-8 mb-4 text-[#6C8B7D]" />
							<h3
								className="text-[12px] md:text-[14px] font-semibold mb-2 text-[#050711] group-hover:text-[#6C8B7D] transition-colors"
								style={plusJakartaStyle}
							>
								API Documentation
							</h3>
							<p
								className="text-[10px] md:text-[12px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								Integrate Peoplely with your existing systems using our API.
							</p>
						</Link>
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			<section
				className="py-16 px-6 md:px-[180px] text-center"
				style={{ backgroundColor: '#6C8B7D' }}
			>
				<div className="max-w-3xl mx-auto">
					<h2
						className="text-[24px] md:text-[30px] font-bold mb-4 text-white"
						style={plusJakartaStyle}
					>
						Need More Help?
					</h2>
					<p
						className="text-[12px] md:text-[14px] text-white/90 mb-8"
						style={plusJakartaStyle}
					>
						Our support team is here to help you succeed. Reach out anytime.
					</p>
					<Link
						href="mailto:support@peoplely.com"
						className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-lg border border-white/20 text-[#050711] font-semibold transition-colors hover:bg-white/90"
						style={plusJakartaStyle}
					>
						Contact Support Team
						<ArrowRightIcon className="w-5 h-5" />
					</Link>
				</div>
			</section>

			<LandingFooter />
		</div>
	);
};

export default SupportPage;



