'use client';

import React from 'react';
import LandingHeader from '@/components/ui/LandingHeader';
import LandingFooter from '@/components/ui/landing/LandingFooter';
import { plusJakartaStyle } from '@/components/Options';
import { LockClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';

const SecurityPage: React.FC = () => {
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
						Security
					</h1>
					<p
						className="text-[14px] md:text-[16px] text-[#4A5565] leading-relaxed"
						style={plusJakartaStyle}
					>
						Enterprise-grade security to protect your data and ensure compliance with industry standards.
					</p>
				</div>
			</section>

			{/* Security Features Section */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-6xl mx-auto">
					<h2
						className="text-[24px] md:text-[30px] font-bold mb-12 text-[#050711] text-center"
						style={plusJakartaStyle}
					>
						Our Security Commitment
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
						{/* Encryption */}
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
								<LockClosedIcon className="w-6 h-6" style={{ color: '#6C8B7D' }} />
							</div>
							<h3
								className="text-[14px] md:text-[16px] font-semibold mb-3 text-[#050711]"
								style={plusJakartaStyle}
							>
								End-to-End Encryption
							</h3>
							<p
								className="text-[10px] md:text-[12px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								All data is encrypted using AES-256 encryption both at rest and in transit. We use TLS 1.3 for all data transmission to ensure your information remains secure.
							</p>
						</div>

						{/* Access Control */}
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
								<EyeOpenIcon className="w-6 h-6" style={{ color: '#6C8B7D' }} />
							</div>
							<h3
								className="text-[14px] md:text-[16px] font-semibold mb-3 text-[#050711]"
								style={plusJakartaStyle}
							>
								Role-Based Access Control
							</h3>
							<p
								className="text-[10px] md:text-[12px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								Granular permissions and role-based access controls ensure that users only have access to the data and features they need. Multi-factor authentication (MFA) is available for all accounts.
							</p>
						</div>

						{/* Compliance */}
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
								className="text-[14px] md:text-[16px] font-semibold mb-3 text-[#050711]"
								style={plusJakartaStyle}
							>
								Industry Compliance
							</h3>
							<p
								className="text-[10px] md:text-[12px] text-[#4A5565] leading-relaxed"
								style={plusJakartaStyle}
							>
								We maintain SOC 2 Type II certification, ISO 27001 compliance, and adhere to GDPR, HIPAA, and PCI-DSS standards to ensure your data meets the highest security requirements.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Detailed Security Information */}
			<section className="py-16 px-6 md:px-[180px] bg-white">
				<div className="max-w-4xl mx-auto">
					<div className="space-y-8">
						{/* Data Encryption */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								Data Encryption
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We employ industry-standard encryption to protect your data:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>AES-256 Encryption:</strong> All data stored in our databases is encrypted using Advanced Encryption Standard with 256-bit keys</li>
								<li style={plusJakartaStyle}><strong>TLS 1.3:</strong> All data in transit is protected using Transport Layer Security 1.3, the latest and most secure protocol</li>
								<li style={plusJakartaStyle}><strong>Key Management:</strong> Encryption keys are managed using a secure key management system with regular rotation</li>
								<li style={plusJakartaStyle}><strong>Database Encryption:</strong> All databases are encrypted at rest with separate encryption keys</li>
							</ul>
						</div>

						{/* Infrastructure Security */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								Infrastructure Security
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Our infrastructure is built on secure, enterprise-grade foundations:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>ISO 27001 Certified Data Centers:</strong> All data is stored in facilities that meet the highest international security standards</li>
								<li style={plusJakartaStyle}><strong>Redundant Systems:</strong> Multiple layers of redundancy ensure high availability and data durability</li>
								<li style={plusJakartaStyle}><strong>Network Security:</strong> Advanced firewalls, intrusion detection systems, and DDoS protection</li>
								<li style={plusJakartaStyle}><strong>Regular Backups:</strong> Automated daily backups with point-in-time recovery capabilities</li>
								<li style={plusJakartaStyle}><strong>Disaster Recovery:</strong> Comprehensive disaster recovery plans with regular testing</li>
							</ul>
						</div>

						{/* Access Control and Authentication */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								Access Control and Authentication
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We implement multiple layers of access control:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>Multi-Factor Authentication (MFA):</strong> Optional MFA using TOTP authenticators or SMS</li>
								<li style={plusJakartaStyle}><strong>Single Sign-On (SSO):</strong> Support for SAML 2.0 and OAuth 2.0 for enterprise customers</li>
								<li style={plusJakartaStyle}><strong>Role-Based Permissions:</strong> Granular permissions system allowing fine-grained access control</li>
								<li style={plusJakartaStyle}><strong>Session Management:</strong> Secure session handling with automatic timeout and activity monitoring</li>
								<li style={plusJakartaStyle}><strong>Password Policies:</strong> Enforced strong password requirements and regular password rotation</li>
								<li style={plusJakartaStyle}><strong>IP Whitelisting:</strong> Optional IP address restrictions for enhanced security</li>
							</ul>
						</div>

						{/* Compliance and Certifications */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								Compliance and Certifications
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We maintain compliance with major industry standards:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>SOC 2 Type II:</strong> Annual audits verify our security, availability, and confidentiality controls</li>
								<li style={plusJakartaStyle}><strong>ISO 27001:</strong> Information security management system certification</li>
								<li style={plusJakartaStyle}><strong>GDPR:</strong> Full compliance with European data protection regulations</li>
								<li style={plusJakartaStyle}><strong>HIPAA:</strong> Healthcare data protection compliance for applicable use cases</li>
								<li style={plusJakartaStyle}><strong>PCI-DSS:</strong> Payment card industry data security standards for payment processing</li>
							</ul>
						</div>

						{/* Security Monitoring */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								Security Monitoring and Incident Response
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								We continuously monitor and protect our systems:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>24/7 Security Monitoring:</strong> Round-the-clock monitoring of our infrastructure and applications</li>
								<li style={plusJakartaStyle}><strong>Intrusion Detection:</strong> Advanced systems to detect and respond to security threats</li>
								<li style={plusJakartaStyle}><strong>Vulnerability Scanning:</strong> Regular automated and manual security assessments</li>
								<li style={plusJakartaStyle}><strong>Penetration Testing:</strong> Annual third-party security audits and penetration tests</li>
								<li style={plusJakartaStyle}><strong>Incident Response Plan:</strong> Documented procedures for responding to security incidents</li>
								<li style={plusJakartaStyle}><strong>Security Logging:</strong> Comprehensive audit logs of all system access and changes</li>
							</ul>
						</div>

						{/* Data Privacy */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								Data Privacy and Retention
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Your data privacy is our priority:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>Data Minimization:</strong> We only collect and store data necessary for service delivery</li>
								<li style={plusJakartaStyle}><strong>Data Retention:</strong> Clear retention policies with automatic deletion of expired data</li>
								<li style={plusJakartaStyle}><strong>Right to Deletion:</strong> You can request deletion of your data at any time</li>
								<li style={plusJakartaStyle}><strong>Data Portability:</strong> Export your data in standard formats whenever needed</li>
								<li style={plusJakartaStyle}><strong>No Data Sharing:</strong> We do not sell or share your data with third parties without consent</li>
							</ul>
						</div>

						{/* Employee Security */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								Employee Security Practices
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Our team is trained and committed to security:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>Background Checks:</strong> All employees undergo comprehensive background verification</li>
								<li style={plusJakartaStyle}><strong>Security Training:</strong> Regular security awareness training for all staff</li>
								<li style={plusJakartaStyle}><strong>Least Privilege Access:</strong> Employees only have access to data necessary for their role</li>
								<li style={plusJakartaStyle}><strong>Confidentiality Agreements:</strong> All employees sign strict confidentiality and security agreements</li>
								<li style={plusJakartaStyle}><strong>Regular Audits:</strong> Internal audits of employee access and activities</li>
							</ul>
						</div>

						{/* Security Best Practices */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								Security Best Practices for Users
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								Help us keep your account secure:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}>Enable multi-factor authentication on your account</li>
								<li style={plusJakartaStyle}>Use strong, unique passwords and change them regularly</li>
								<li style={plusJakartaStyle}>Review and manage user permissions regularly</li>
								<li style={plusJakartaStyle}>Monitor account activity and report suspicious behavior</li>
								<li style={plusJakartaStyle}>Keep your contact information up to date</li>
								<li style={plusJakartaStyle}>Be cautious of phishing attempts and suspicious emails</li>
							</ul>
						</div>

						{/* Security Contact */}
						<div>
							<h2
								className="text-[18px] md:text-[20px] font-bold mb-4 text-[#050711]"
								style={plusJakartaStyle}
							>
								Report a Security Issue
							</h2>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mb-4"
								style={plusJakartaStyle}
							>
								If you discover a security vulnerability or have a security concern, please contact us immediately:
							</p>
							<ul className="list-none space-y-2 text-[#4A5565]">
								<li style={plusJakartaStyle}><strong>Email:</strong> security@outcess.com</li>
								<li style={plusJakartaStyle}><strong>Security Team:</strong> We respond to all security reports within 24 hours</li>
							</ul>
							<p
								className="text-[12px] md:text-[14px] text-[#4A5565] leading-relaxed mt-4"
								style={plusJakartaStyle}
							>
								We appreciate responsible disclosure and will work with security researchers to address any issues.
							</p>
						</div>
					</div>
				</div>
			</section>

			<LandingFooter />
		</div>
	);
};

export default SecurityPage;

