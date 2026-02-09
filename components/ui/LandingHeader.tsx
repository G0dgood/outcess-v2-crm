'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HamburgerMenuIcon, Cross2Icon } from '@radix-ui/react-icons';

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
	const [isMenuOpen, setIsMenuOpen] = useState(false);

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
					<Image src="/logo/peoplely.svg" alt="Peoplely logo" width={140} height={40} priority className="w-[110px] h-auto md:w-[140px]" />
					<nav className="font-inter font-normal text-[12px] md:text-[14px] leading-[24px] tracking-[-0.5px] text-[#4A5565] hidden items-center gap-8 text-[10px] md:text-[12px]  text-secondary md:flex">
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className="transition-colors hover:text-primary" onClick={() => setIsMenuOpen(false)}>
								{link.label}
							</Link>
						))}
					</nav>
				</div>
				<div className="flex items-center gap-3">
					<Link
						href="/login"
						className="hidden md:inline-flex flex-row justify-center items-center px-4 py-3 gap-2 h-[48px] bg-white font-plusJakartaSans font-semibold text-[12px] md:text-[14px] leading-[24px] text-[#050711] text-[10px] md:text-[12px] text-secondary transition-colors hover:border-transparent hover:bg-muted"
					>
						Login
					</Link>
					<Link
						href="/signup"
						className="inline-flex flex-row justify-center items-center px-4 py-2 gap-2 h-10 bg-[#050711] text-white text-[10px] md:text-[12px] font-semibold transition-transform hover:-translate-y-0.5 md:h-[48px] md:py-3 md:text-[12px] md:text-[14px]"
					>
						Start Free Trial
					</Link>
					<button
						className="md:hidden inline-flex items-center justify-center p-2 border border-light text-secondary"
						onClick={() => setIsMenuOpen((v) => !v)}
						aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
						aria-expanded={isMenuOpen}
					>
						{isMenuOpen ? <Cross2Icon className="h-5 w-5" /> : <HamburgerMenuIcon className="h-5 w-5" />}
					</button>
				</div>
			</div>
			{isMenuOpen && (
				<div className={`md:hidden border-t border-light bg-white ${transitionTiming}`}>
					<div className="px-6 py-4 flex flex-col gap-4">
						<nav className="flex flex-col gap-3 text-[10px] md:text-[12px] text-[#4A5565]">
							{navLinks.map((link) => (
								<Link key={link.href} href={link.href} className="transition-colors hover:text-[#050711]" onClick={() => setIsMenuOpen(false)}>
									{link.label}
								</Link>
							))}
						</nav>
						<div className="flex items-center gap-2">
							<Link href="/login" className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-light text-[10px] md:text-[12px] text-[#050711] bg-white">
								Login
							</Link>
							<Link href="/signup" className="flex-1 inline-flex items-center justify-center px-3 py-2 text-[10px] md:text-[12px] text-white bg-[#050711]">
								Start Free Trial
							</Link>
						</div>
					</div>
				</div>
			)}
		</header>
	);
};

export default LandingHeader;
