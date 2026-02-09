'use client';

import React from 'react';
import LandingHeader from '@/components/ui/LandingHeader';
import LandingFooter from '@/components/ui/landing/LandingFooter';
import { plusJakartaStyle } from '@/components/Options';

const TermsOfServicePage: React.FC = () => {
	return (
		<div className="bg-page min-h-screen">
			<LandingHeader />

			{/* Hero Section */}
			<section className="pt-32 pb-16 px-6 md:px-[180px]">
				<div className="max-w-4xl mx-auto">
					<h1
						className="text-[30px] md:text-[36px] lg:text-[48px] font-bold mb-6 text-[#050711] leading-tight"
						style={plusJakartaStyle}
					>
						Terms of Service
					</h1>
					<p
						className="text-[14px] md:text-[16px] text-[#4A5565] leading-relaxed"
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
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								1. Agreement to Terms
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								By accessing or using Peoplely&apos;s CRM platform and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
							</p>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								These terms apply to all users of the service, including without limitation users who are browsers, vendors, customers, merchants, and contributors of content.
							</p>
						</div>

						{/* Use License */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								2. Use License
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Permission is granted to temporarily access and use Peoplely&apos;s services for your business purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}>Modify or copy the materials or services</li>
								<li style={plusJakartaStyle}>Use the materials for any commercial purpose or for any public display</li>
								<li style={plusJakartaStyle}>Attempt to reverse engineer, decompile, or disassemble any software</li>
								<li style={plusJakartaStyle}>Remove any copyright or other proprietary notations from the materials</li>
								<li style={plusJakartaStyle}>Transfer the materials to another person or mirror the materials on any other server</li>
							</ul>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mt-4"
								style={plusJakartaStyle}
							>
								This license shall automatically terminate if you violate any of these restrictions and may be terminated by Peoplely at any time.
							</p>
						</div>

						{/* Account Registration */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								3. Account Registration and Security
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								To access certain features of our service, you must register for an account. When you register, you agree to:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}>Provide accurate, current, and complete information</li>
								<li style={plusJakartaStyle}>Maintain and promptly update your account information</li>
								<li style={plusJakartaStyle}>Maintain the security of your password and identification</li>
								<li style={plusJakartaStyle}>Accept all responsibility for activities that occur under your account</li>
								<li style={plusJakartaStyle}>Notify us immediately of any unauthorized use of your account</li>
							</ul>
						</div>

						{/* Acceptable Use */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								4. Acceptable Use Policy
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								You agree not to use the service to:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}>Violate any applicable laws or regulations</li>
								<li style={plusJakartaStyle}>Infringe upon the rights of others, including intellectual property rights</li>
								<li style={plusJakartaStyle}>Transmit any malicious code, viruses, or harmful data</li>
								<li style={plusJakartaStyle}>Engage in any fraudulent, abusive, or illegal activity</li>
								<li style={plusJakartaStyle}>Interfere with or disrupt the service or servers</li>
								<li style={plusJakartaStyle}>Attempt to gain unauthorized access to any portion of the service</li>
								<li style={plusJakartaStyle}>Collect or harvest information about other users without their consent</li>
								<li style={plusJakartaStyle}>Use the service to send spam or unsolicited communications</li>
							</ul>
						</div>

						{/* Payment Terms */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								5. Payment Terms
							</h2>
							<h3
								className="text-[14px] md:text-[16px] font-semibold mb-3 text-[#050711] mt-6"
								style={plusJakartaStyle}
							>
								5.1 Subscription Fees
							</h3>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law or as otherwise stated in your subscription agreement.
							</p>

							<h3
								className="text-[14px] md:text-[16px] font-semibold mb-3 text-[#050711] mt-6"
								style={plusJakartaStyle}
							>
								5.2 Price Changes
							</h3>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We reserve the right to modify our pricing at any time. We will provide at least 30 days&apos; notice of any price changes. Continued use of the service after the price change constitutes acceptance of the new pricing.
							</p>

							<h3
								className="text-[14px] md:text-[16px] font-semibold mb-3 text-[#050711] mt-6"
								style={plusJakartaStyle}
							>
								5.3 Payment Processing
							</h3>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Payment processing is handled by third-party payment processors. You agree to provide current, complete, and accurate purchase and account information for all purchases made through our service.
							</p>
						</div>

						{/* Service Availability */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								6. Service Availability and Modifications
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We strive to maintain high availability of our service but do not guarantee uninterrupted access. We reserve the right to:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}>Modify, suspend, or discontinue any aspect of the service at any time</li>
								<li style={plusJakartaStyle}>Perform scheduled maintenance that may temporarily interrupt service</li>
								<li style={plusJakartaStyle}>Update features, functionality, or user interfaces</li>
								<li style={plusJakartaStyle}>Impose limits on certain features or restrict access to parts of the service</li>
							</ul>
						</div>

						{/* Intellectual Property */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								7. Intellectual Property Rights
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								The service and its original content, features, and functionality are owned by Peoplely and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
							</p>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								You retain ownership of any data, content, or materials you upload to the service. By uploading content, you grant us a license to use, store, and process that content solely for the purpose of providing the service to you.
							</p>
						</div>

						{/* Data and Privacy */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								8. Data and Privacy
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Your use of the service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.
							</p>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								You are responsible for ensuring that any data you upload complies with applicable data protection laws and that you have the necessary rights and permissions to use such data.
							</p>
						</div>

						{/* Termination */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								9. Termination
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service.
							</p>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Upon termination, your right to use the service will immediately cease. You may terminate your account at any time by contacting us or using the account deletion features in the service.
							</p>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								All provisions of these Terms which by their nature should survive termination shall survive termination, including ownership provisions, warranty disclaimers, and limitations of liability.
							</p>
						</div>

						{/* Disclaimer */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								10. Disclaimer
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								The information on this service is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, Peoplely excludes all representations, warranties, conditions, and terms relating to our service and the use of this service.
							</p>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								We do not warrant that the service will be available at all times, be uninterrupted, secure, or error-free, or that defects will be corrected.
							</p>
						</div>

						{/* Limitation of Liability */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								11. Limitation of Liability
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								In no event shall Peoplely, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
							</p>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								Our total liability to you for all claims arising from or related to the use of the service shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
							</p>
						</div>

						{/* Governing Law */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								12. Governing Law
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
							</p>
						</div>

						{/* Changes to Terms */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								13. Changes to Terms
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect.
							</p>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
							</p>
						</div>

						{/* Contact Information */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								14. Contact Information
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								If you have any questions about these Terms of Service, please contact us:
							</p>
							<ul className="list-none space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>Email:</strong> legal@peoplely.com</li>
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

export default TermsOfServicePage;

