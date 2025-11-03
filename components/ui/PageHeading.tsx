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
			className={`font-lato not-italic font-medium text-[20px] bold leading-[150%] text-(--text-secondary) ${className}`}
		>
			{text}
		</h1>
	);
};

export default PageHeading;

