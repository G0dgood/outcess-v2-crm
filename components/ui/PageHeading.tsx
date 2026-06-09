import React from 'react';

interface PageHeadingProps {
	text: string;
	className?: string;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
	text,
	className = '',
}) => {
	return (
		<h1
			className={`font-lato not-italic font-semibold text-[20px] md:text-[22px] leading-[150%] dark:text-gray-100 ${className}`}
			style={{ color: 'var(--text-primary)' }}
		>
			{text}
		</h1>
	);
};

export default PageHeading;

