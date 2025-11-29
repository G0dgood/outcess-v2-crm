'use client';

import React from 'react';
import LandingHeader from '@/components/ui/LandingHeader';
import LandingFooter from '@/components/ui/landing/LandingFooter';
import { plusJakartaStyle } from '@/components/Options';
import { LightningBoltIcon, PersonIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

const AboutPage: React.FC = () => {
	return (
		<div className="bg-page min-h-screen">
			<LandingHeader />

			{/* Hero Section */}
			<section className="pt-32 pb-16 px-6 md:px-[180px]">
				<div className="max-w-4xl mx-auto">
					{/* Callout Box */}
					<div
						className="inline-block px-4 py-2 mb-6 rounded-lg"
						style={{
							backgroundColor: 'var(--light-gray)',
							color: 'var(--text-secondary)'
						}}
					>
						<p className="text-sm font-medium" style={plusJakartaStyle}>
							Our Focus: Maximum Agent Productivity, Minimum Data Friction.
						</p>
					</div>

					{/* Main Headline */}
					<h1
						className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#050711] leading-tight"
						style={plusJakartaStyle}
					>
						We Don&apos;t Just Build CRMs. We Engineer Call Center Success.
					</h1>

					{/* Sub-headline */}
					<p
						className="text-lg md:text-xl text-[#4A5565] leading-relaxed"
						style={plusJakartaStyle}
					>
						Our mission is to transform high-volume operations by providing the fastest, most flexible platform on the market.
					</p>
				</div>
			</section>

			{/* Our Vision Section */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-4xl mx-auto">
					<h2
						className="text-3xl md:text-4xl font-bold mb-6 text-[#050711]"
						style={plusJakartaStyle}
					>
						Our Vision: The Future of Call Center Efficiency
					</h2>
					<p
						className="text-base md:text-lg text-[#4A5565] leading-relaxed"
						style={plusJakartaStyle}
					>
						To be the global leader in operational software for high-volume contact centers. We aim to continuously innovate on speed, data accuracy, and agent-focused design, making our platform the standard benchmark for every efficient and successful call center operation worldwide.
					</p>
				</div>
			</section>

			{/* Our Core Values Section */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-3xl md:text-4xl font-bold mb-3 text-[#050711] text-center"
						style={plusJakartaStyle}
					>
						Our Core Values: What Drives Us
					</h2>
					<p
						className="text-base md:text-lg text-[#4A5565] text-center mb-12"
						style={plusJakartaStyle}
					>
						The principles that guide everything we build
					</p>

					{/* Value Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Operational Excellence */}
						<div
							className="p-6 rounded-lg border"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
								style={{ backgroundColor: 'var(--light-gray)' }}
							>
								<LightningBoltIcon className="w-6 h-6" style={{ color: '#6C8B7D' }} />
							</div>
							<h3
								className="text-xl font-semibold mb-3 text-[#050711]"
								style={plusJakartaStyle}
							>
								Operational Excellence
							</h3>
							<p
								className="text-sm text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								Every feature we develop is measured by how much time it saves an agent or a manager. We are obsessed with cutting wrap-up time, streamlining dispositions, and optimizing every micro-interaction.
							</p>
						</div>

						{/* Unwavering Reliability */}
						<div
							className="p-6 rounded-lg border"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
								style={{ backgroundColor: 'var(--light-gray)' }}
							>
								<svg
									className="w-6 h-6"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#6C8B7D"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" />
								</svg>
							</div>
							<h3
								className="text-xl font-semibold mb-3 text-[#050711]"
								style={plusJakartaStyle}
							>
								Unwavering Reliability
							</h3>
							<p
								className="text-sm text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								High-volume centers cannot afford downtime or sluggish performance. We commit to enterprise-grade stability, security, and lightning-fast load times, even when handling millions of data records.
							</p>
						</div>

						{/* True Partnership */}
						<div
							className="p-6 rounded-lg border"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 gap-1"
								style={{ backgroundColor: 'var(--light-gray)' }}
							>
								<PersonIcon className="w-5 h-5" style={{ color: '#6C8B7D' }} />
								<PersonIcon className="w-5 h-5" style={{ color: '#6C8B7D' }} />
							</div>
							<h3
								className="text-xl font-semibold mb-3 text-[#050711]"
								style={plusJakartaStyle}
							>
								True Partnership
							</h3>
							<p
								className="text-sm text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								We don&apos;t just sell software; we partner with your operations team. We ensure our customizable platform adapts seamlessly as your business grows, regulatory needs change, and new campaigns launch.
							</p>
						</div>
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
						className="text-3xl md:text-4xl font-bold mb-4 text-white"
						style={plusJakartaStyle}
					>
						Ready to Implement the CRM Designed for Your Floor?
					</h2>
					<p
						className="text-base md:text-lg text-white/90 mb-8"
						style={plusJakartaStyle}
					>
						Join thousands of call centers already transforming their operations
					</p>
					<Link
						href="/demo"
						className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-lg border border-white/20 text-[#050711] font-semibold transition-colors hover:bg-white/90"
						style={plusJakartaStyle}
					>
						Connect with Our Call Center Solutions Team
						<ArrowRightIcon className="w-5 h-5" />
					</Link>
				</div>
			</section>

			<LandingFooter />
		</div>
	);
};

export default AboutPage;

