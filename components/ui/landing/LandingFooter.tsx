'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LandingFooter: React.FC = () => {
	return (
		<footer className="border-t border-light bg-surface">
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:justify-between">
				<div className="space-y-4">
					<Image src="/logo/outcess.svg" alt="Outcess logo" width={140} height={40} className="w-[110px] h-auto md:w-[140px]" />
					<p className="text-[10px] md:text-[12px] text-tertiary">
						Customizable CRM built to empower your support, sales, and success teams with intelligent tools.
					</p>
				</div>

				<div className="grid flex-1 gap-8 text-[10px] md:text-[12px] text-secondary sm:grid-cols-3">
					<div className="space-y-3">
						<p className="font-semibold text-primary">Product</p>
						<ul className="space-y-2">
							<li>
								<Link href="#features" className="hover:text-accent">
									Features
								</Link>
							</li>
							<li>
								<Link href="#pricing" className="hover:text-accent">
									Pricing
								</Link>
							</li>
							<li>
								<Link href="/login" className="hover:text-accent">
									Login
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-3">
						<p className="font-semibold text-primary">Company</p>
						<ul className="space-y-2">
							<li>
								<Link href="/about" className="hover:text-accent">
									About
								</Link>
							</li>
							<li>
								<Link href="/careers" className="hover:text-accent">
									Careers
								</Link>
							</li>
							<li>
								<Link href="/blog" className="hover:text-accent">
									Blog
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-3">
						<p className="font-semibold text-primary">Resources</p>
						<ul className="space-y-2">
							<li>
								<Link href="#faq" className="hover:text-accent">
									Help Center
								</Link>
							</li>
							<li>
								<Link href="/support" className="hover:text-accent">
									Support
								</Link>
							</li>
							<li>
								<Link href="/partners" className="hover:text-accent">
									Partners
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div className="border-t border-light bg-surface">
				<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-[8px] md:text-[10px] text-tertiary sm:flex-row">
					<p>© {new Date().getFullYear()} Outcess. All rights reserved.</p>
					<div className="flex items-center gap-4">
						<Link href="/privacy" className="hover:text-accent">
							Privacy Policy
						</Link>
						<Link href="/terms" className="hover:text-accent">
							Terms of Service
						</Link>
						<Link href="/security" className="hover:text-accent">
							Security
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default LandingFooter;
