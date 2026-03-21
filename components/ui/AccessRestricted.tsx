import React from 'react';

interface AccessRestrictedProps {
	title?: string;
	message?: string;
	titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	className?: string;
}

const AccessRestricted: React.FC<AccessRestrictedProps> = ({
	title = 'Access Restricted',
	message = 'You do not have access permission to view this content.',
	titleTag: TitleTag = 'h2',
	className = 'mb-8'
}) => {
	const titleStyles = TitleTag === 'h3'
		? 'font-inter text-base font-semibold'
		: 'font-inter text-[12px] md:text-[14px] font-semibold';

	return (
		<div
			className={`dark:bg-gray-800 border dark:border-gray-700 p-6 ${className}`}
			style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
		>
			<TitleTag className={titleStyles} style={{ color: 'var(--text-primary)' }}>
				{title}
			</TitleTag>
			<p className="font-lato text-[10px] md:text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
				{message}
			</p>
		</div>
	);
};

export default AccessRestricted;
