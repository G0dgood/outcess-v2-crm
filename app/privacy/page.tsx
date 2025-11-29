'use client';

import React from 'react';
import LandingHeader from '@/components/ui/LandingHeader';
import LandingFooter from '@/components/ui/landing/LandingFooter';
import { plusJakartaStyle } from '@/components/Options';

const PrivacyPolicyPage: React.FC = () => {
	return (
		<div className="bg-page min-h-screen">
			<LandingHeader />

			{/* Hero Section */}
			<section className="pt-32 pb-16 px-6 md:px-[180px]">
				<div className="max-w-4xl mx-auto">
					<h1
						className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#050711] leading-tight"
						style={plusJakartaStyle}
					>
						Privacy Policy
					</h1>
					<p
						className="text-lg md:text-xl text-[#4A5565] leading-relaxed"
						style={plusJakartaStyle}
					>
						Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
					</p>
				</div>
			</section>

			{/* Content Section */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-4xl mx-auto prose prose-lg">
					<div className="space-y-8">
						{/* Introduction */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								1. Introduction
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								At Peoplely, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our CRM platform and services.
							</p>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								By using Peoplely, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
							</p>
						</div>

						{/* Information We Collect */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								2. Information We Collect
							</h2>
							<h3
								className="text-xl font-semibold mb-3 text-[#050711] mt-6"
								style={plusJakartaStyle}
							>
								2.1 Personal Information
							</h3>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We collect information that you provide directly to us, including:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}>Name, email address, phone number, and other contact information</li>
								<li style={plusJakartaStyle}>Company name, job title, and business information</li>
								<li style={plusJakartaStyle}>Payment and billing information</li>
								<li style={plusJakartaStyle}>Account credentials and authentication information</li>
								<li style={plusJakartaStyle}>Customer data and contact information that you upload to our platform</li>
							</ul>

							<h3
								className="text-xl font-semibold mb-3 text-[#050711] mt-6"
								style={plusJakartaStyle}
							>
								2.2 Usage Data
							</h3>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We automatically collect certain information when you use our services:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}>IP address, browser type, and device information</li>
								<li style={plusJakartaStyle}>Usage patterns, feature interactions, and performance data</li>
								<li style={plusJakartaStyle}>Log files, error reports, and diagnostic information</li>
								<li style={plusJakartaStyle}>Cookies and similar tracking technologies</li>
							</ul>
						</div>

						{/* How We Use Your Information */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								3. How We Use Your Information
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We use the information we collect to:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}>Provide, maintain, and improve our CRM platform and services</li>
								<li style={plusJakartaStyle}>Process transactions and manage your account</li>
								<li style={plusJakartaStyle}>Send you technical notices, updates, and support messages</li>
								<li style={plusJakartaStyle}>Respond to your comments, questions, and requests</li>
								<li style={plusJakartaStyle}>Monitor and analyze usage patterns and trends</li>
								<li style={plusJakartaStyle}>Detect, prevent, and address technical issues and security threats</li>
								<li style={plusJakartaStyle}>Comply with legal obligations and enforce our terms</li>
							</ul>
						</div>

						{/* Data Sharing and Disclosure */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								4. Data Sharing and Disclosure
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We do not sell your personal information. We may share your information only in the following circumstances:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform</li>
								<li style={plusJakartaStyle}><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
								<li style={plusJakartaStyle}><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
								<li style={plusJakartaStyle}><strong>With Your Consent:</strong> When you have explicitly authorized us to share your information</li>
							</ul>
						</div>

						{/* Data Security */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								5. Data Security
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We implement industry-standard security measures to protect your information:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}>AES-256 encryption for data at rest and in transit</li>
								<li style={plusJakartaStyle}>Regular security audits and vulnerability assessments</li>
								<li style={plusJakartaStyle}>Access controls and authentication mechanisms</li>
								<li style={plusJakartaStyle}>SOC 2 Type II certified infrastructure</li>
								<li style={plusJakartaStyle}>ISO 27001 compliant data centers</li>
							</ul>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mt-4"
								style={plusJakartaStyle}
							>
								However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
							</p>
						</div>

						{/* Your Rights */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								6. Your Privacy Rights
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Depending on your location, you may have the following rights:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>Access:</strong> Request access to your personal information</li>
								<li style={plusJakartaStyle}><strong>Correction:</strong> Request correction of inaccurate information</li>
								<li style={plusJakartaStyle}><strong>Deletion:</strong> Request deletion of your personal information</li>
								<li style={plusJakartaStyle}><strong>Portability:</strong> Request transfer of your data to another service</li>
								<li style={plusJakartaStyle}><strong>Objection:</strong> Object to processing of your personal information</li>
								<li style={plusJakartaStyle}><strong>Restriction:</strong> Request restriction of processing</li>
							</ul>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mt-4"
								style={plusJakartaStyle}
							>
								To exercise these rights, please contact us at privacy@peoplely.com.
							</p>
						</div>

						{/* Cookies */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								7. Cookies and Tracking Technologies
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
							</p>
						</div>

						{/* International Data Transfers */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								8. International Data Transfers
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our services, you consent to the transfer of your information to facilities located outside your jurisdiction.
							</p>
						</div>

						{/* Children&apos;s Privacy */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								9. Children&apos;s Privacy
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
							</p>
						</div>

						{/* Changes to This Policy */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								10. Changes to This Privacy Policy
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
							</p>
						</div>

						{/* Contact Us */}
						<div>
							<h2
								className="text-2xl md:text-3xl font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								11. Contact Us
							</h2>
							<p
								className="text-base md:text-lg text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								If you have any questions about this Privacy Policy, please contact us:
							</p>
							<ul className="list-none space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>Email:</strong> privacy@peoplely.com</li>
								<li style={plusJakartaStyle}><strong>Address:</strong> Peoplely, Inc., [Your Address]</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			<LandingFooter />
		</div>
	);
};

export default PrivacyPolicyPage;




