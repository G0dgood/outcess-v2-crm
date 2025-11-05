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
			className={`font-lato not-italic font-semibold text-[24px] leading-[150%] text-[#050711] dark:text-gray-100 ${className}`}
		>
			{text}
		</h1>
	);
};

export default PageHeading;

