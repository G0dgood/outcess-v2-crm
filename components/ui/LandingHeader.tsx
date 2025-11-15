'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const navLinks = [
	{ href: '#features', label: 'Features' },
	{ href: '#industries', label: 'Industries' },
	{ href: '#testimonials', label: 'Customers' },
];

const transitionTiming = 'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

const LandingHeader: React.FC = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const lastScrollYRef = useRef(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			setIsScrolled(currentScrollY > 10);

			const isScrollingUp = currentScrollY < lastScrollYRef.current;
			const shouldShow = isScrollingUp || currentScrollY < 120;
			setIsVisible(shouldShow);

			lastScrollYRef.current = currentScrollY;
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<header
			className={`border-b border-light bg-surface fixed inset-x-0 top-0 z-50 ${transitionTiming} ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
				} ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-light shadow-[0_12px_30px_rgba(5,7,17,0.12)]' : 'bg-transparent border-transparent'}`}
		>
			<div className={`mx-auto flex h-[72px] items-center justify-between px-6 md:px-[180px] ${transitionTiming}`}>
				<div className="flex items-center gap-9">
					<Image src="/logo/peoplely.svg" alt="Peoplely logo" width={140} height={40} priority />
					<nav className="font-inter font-normal text-[16px] leading-[24px] tracking-[-0.5px] text-[#4A5565] hidden items-center gap-8 text-sm  text-secondary md:flex">
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
								{link.label}
							</Link>
						))}
					</nav>
				</div>
				<div className="flex items-center gap-3">
					<Link
						href="/login"
						className="flex flex-row justify-center items-center px-4 py-3 gap-2 w-[92px] h-[48px] bg-white rounded-lg font-plusJakartaSans font-semibold text-[16px] leading-[24px] text-[#050711]   text-sm text-secondary transition-colors hover:border-transparent hover:bg-muted md:inline-flex"
					>
						Login
					</Link>
					<Link
						href="/signup"
						className="flex flex-row justify-center items-center px-4 py-3 gap-2 w-[166px] h-[48px] bg-[#050711] font-semibold text-[16px] leading-[24px] text-white font-[Plus Jakarta Sans] text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
					>
						Start Free Trial
					</Link>
				</div>
			</div>
		</header>
	);
};

export default LandingHeader;

