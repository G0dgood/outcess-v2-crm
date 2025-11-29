'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const CallToActionSection: React.FC = () => {


	const [value, setValue] = useState('');
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	return (
		<section className="bg-textPrimary px-6 md:px-10 py-16 text-center text-white shadow-soft flex flex-col justify-center items-center">
			<h2 className="text-3xl font-semibold sm:text-4xl">Ready to Transform Your Call Center?</h2>
			<p className="mt-4 text-sm text-white/80 sm:text-base">
				Join thousands of teams already using Peoplely CRM to deliver exceptional customer experiences.
			</p>
			<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
				<input
					placeholder="Start Free Trial"
					value={value}
					onChange={handleChange}
					className="box-border w-full sm:w-96 h-12 bg-white/10 border border-white/20 px-2"
				/>
				<Link
					href="/demo"
					className="whitespace-nowrap flex flex-row justify-center items-center px-[32px] py-[12px] w-[158px] h-[48px] bg-[#6C8B7D] border border-white/20 text-sm font-semibold text-white transition-colors hover:bg-white/10"
				>
					Speak with Sales
				</Link>
			</div>
			<p className="mt-3 text-xs text-white/60">No credit card required • 14-day free trial.</p>
		</section>
	);
};

export default CallToActionSection;
