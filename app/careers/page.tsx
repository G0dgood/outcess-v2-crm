'use client';

import React from 'react';
import LandingHeader from '@/components/ui/LandingHeader';
import LandingFooter from '@/components/ui/landing/LandingFooter';
import { plusJakartaStyle } from '@/components/Options';
import { PersonIcon, LightningBoltIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

const CareersPage: React.FC = () => {
	const openPositions = [
		{
			title: 'Senior Full-Stack Engineer',
			department: 'Engineering',
			location: 'Remote',
			type: 'Full-time',
			description: 'Build scalable features for our CRM platform using React, TypeScript, and Node.js. Work on high-impact projects that directly improve agent productivity.'
		},
		{
			title: 'Product Designer',
			department: 'Design',
			location: 'Remote',
			type: 'Full-time',
			description: 'Design intuitive user experiences for call center operations. Create wireframes, prototypes, and collaborate with engineering teams to ship beautiful products.'
		},
		{
			title: 'Customer Success Manager',
			department: 'Customer Success',
			location: 'Remote',
			type: 'Full-time',
			description: 'Help our customers achieve success with Peoplely CRM. Onboard new clients, provide training, and ensure high customer satisfaction.'
		},
		{
			title: 'DevOps Engineer',
			department: 'Engineering',
			location: 'Remote',
			type: 'Full-time',
			description: 'Maintain and scale our cloud infrastructure. Ensure 99.9% uptime, implement CI/CD pipelines, and optimize system performance.'
		},
		{
			title: 'Sales Development Representative',
			department: 'Sales',
			location: 'Remote',
			type: 'Full-time',
			description: 'Identify and qualify potential customers for our CRM platform. Build relationships with call center decision-makers and drive pipeline growth.'
		},
		{
			title: 'Security Engineer',
			department: 'Engineering',
			location: 'Remote',
			type: 'Full-time',
			description: 'Protect our platform and customer data. Conduct security audits, implement security best practices, and ensure compliance with industry standards.'
		}
	];

	const benefits = [
		{
			title: 'Competitive Compensation',
			description: 'We offer competitive salaries and equity packages to attract top talent.'
		},
		{
			title: 'Remote-First Culture',
			description: 'Work from anywhere. We believe in flexibility and work-life balance.'
		},
		{
			title: 'Health & Wellness',
			description: 'Comprehensive health insurance, dental, vision, and wellness programs.'
		},
		{
			title: 'Learning & Development',
			description: 'Annual learning budget, conference attendance, and mentorship programs.'
		},
		{
			title: 'Flexible Time Off',
			description: 'Unlimited PTO policy. Take time when you need it to recharge.'
		},
		{
			title: 'Equipment & Setup',
			description: 'We provide all the tools you need, including a laptop and home office setup.'
		}
	];

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
						Join the Peoplely Team
					</h1>
					<p
						className="text-lg md:text-xl text-[#4A5565] leading-relaxed"
						style={plusJakartaStyle}
					>
						Help us build the future of call center operations. We&apos;re looking for talented individuals who are passionate about creating exceptional software.
					</p>
				</div>
			</section>

			{/* Why Work With Us Section */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-3xl md:text-4xl font-bold mb-12 text-[#050711] text-center"
						style={plusJakartaStyle}
					>
						Why Work at Peoplely?
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
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
								Impact-Driven Work
							</h3>
							<p
								className="text-sm text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								Every feature you build directly improves the productivity of thousands of call center agents. See your work make a real difference.
							</p>
						</div>

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
								<PersonIcon className="w-6 h-6" style={{ color: '#6C8B7D' }} />
							</div>
							<h3
								className="text-xl font-semibold mb-3 text-[#050711]"
								style={plusJakartaStyle}
							>
								Collaborative Culture
							</h3>
							<p
								className="text-sm text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								Work with a team of passionate, talented individuals who value collaboration, transparency, and continuous learning.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-3xl md:text-4xl font-bold mb-12 text-[#050711] text-center"
						style={plusJakartaStyle}
					>
						Benefits & Perks
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{benefits.map((benefit, index) => (
							<div
								key={index}
								className="p-6 rounded-lg border"
								style={{
									backgroundColor: 'var(--accent-white)',
									borderColor: 'var(--light-gray)'
								}}
							>
								<h3
									className="text-lg font-semibold mb-2 text-[#050711]"
									style={plusJakartaStyle}
								>
									{benefit.title}
								</h3>
								<p
									className="text-sm text-[#4A5565] leading-relaxed"
									style={plusJakartaStyle}
								>
									{benefit.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Open Positions Section */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-3xl md:text-4xl font-bold mb-12 text-[#050711] text-center"
						style={plusJakartaStyle}
					>
						Open Positions
					</h2>

					<div className="space-y-4">
						{openPositions.map((position, index) => (
							<div
								key={index}
								className="p-6 rounded-lg border hover:shadow-lg transition-shadow"
								style={{
									backgroundColor: 'var(--accent-white)',
									borderColor: 'var(--light-gray)'
								}}
							>
								<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
									<div className="flex-1">
										<h3
											className="text-xl font-semibold mb-2 text-[#050711]"
											style={plusJakartaStyle}
										>
											{position.title}
										</h3>
										<div className="flex flex-wrap gap-3 mb-3">
											<span
												className="text-sm px-3 py-1 rounded-full"
												style={{
													backgroundColor: 'var(--light-gray)',
													color: 'var(--text-secondary)'
												}}
											>
												{position.department}
											</span>
											<span
												className="text-sm px-3 py-1 rounded-full"
												style={{
													backgroundColor: 'var(--light-gray)',
													color: 'var(--text-secondary)'
												}}
											>
												{position.location}
											</span>
											<span
												className="text-sm px-3 py-1 rounded-full"
												style={{
													backgroundColor: 'var(--light-gray)',
													color: 'var(--text-secondary)'
												}}
											>
												{position.type}
											</span>
										</div>
										<p
											className="text-sm text-[#4A5565] leading-relaxed"
											style={plusJakartaStyle}
										>
											{position.description}
										</p>
									</div>
									<Link
										href={`/careers/apply?position=${encodeURIComponent(position.title)}`}
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
										Apply Now
										<ArrowRightIcon className="w-4 h-4" />
									</Link>
								</div>
							</div>
						))}
					</div>

					<div className="mt-12 text-center">
						<p
							className="text-base text-[#4A5565] mb-4"
							style={plusJakartaStyle}
						>
							Don&apos;t see a role that fits? We&apos;re always looking for great talent.
						</p>
						<Link
							href="mailto:careers@peoplely.com"
							className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border font-semibold text-sm transition-colors"
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
							Send Us Your Resume
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
						className="text-3xl md:text-4xl font-bold mb-4 text-white"
						style={plusJakartaStyle}
					>
						Ready to Build the Future of Call Centers?
					</h2>
					<p
						className="text-base md:text-lg text-white/90 mb-8"
						style={plusJakartaStyle}
					>
						Join us in transforming how call centers operate. We&apos;re building something special.
					</p>
					<Link
						href="mailto:careers@peoplely.com"
						className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-lg border border-white/20 text-[#050711] font-semibold transition-colors hover:bg-white/90"
						style={plusJakartaStyle}
					>
						Get in Touch
						<ArrowRightIcon className="w-5 h-5" />
					</Link>
				</div>
			</section>

			<LandingFooter />
		</div>
	);
};

export default CareersPage;




