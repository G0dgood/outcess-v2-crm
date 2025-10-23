import React from 'react';

interface MarkProps {
	width?: number;
	height?: number;
	className?: string;
	backgroundColor?: string;
	borderColor?: string;
	checkmarkColor?: string;
}

export const Mark: React.FC<MarkProps> = ({
	width = 20,
	height = 20,
	className = '',
	backgroundColor = '#F9F5FF',
	borderColor = '#222222',
	checkmarkColor = '#222222',
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g clipPath="url(#clip0_605_7130)">
				<rect width="20" height="20" rx="10" fill={backgroundColor} />
				<rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke={borderColor} />
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M14.247 6.15838L8.28033 11.9167L6.697 10.2251C6.40533 9.95005 5.94699 9.93338 5.61366 10.1667C5.28866 10.4084 5.19699 10.8334 5.39699 11.1751L7.27199 14.2251C7.45533 14.5084 7.77199 14.6834 8.13033 14.6834C8.47199 14.6834 8.797 14.5084 8.98033 14.2251C9.28033 13.8334 15.0053 7.00838 15.0053 7.00838C15.7553 6.24172 14.847 5.56672 14.247 6.15005V6.15838Z"
					fill={checkmarkColor}
				/>
			</g>
			<defs>
				<clipPath id="clip0_605_7130">
					<rect width="20" height="20" rx="10" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
};

export default Mark;
