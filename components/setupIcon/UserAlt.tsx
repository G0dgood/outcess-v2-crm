import React from 'react';

interface UserAltProps {
	width?: number;
	height?: number;
	className?: string;
	strokeColor?: string;
}

export const UserAlt: React.FC<UserAltProps> = ({
	width = 20,
	height = 20,
	className = '',
	strokeColor = '#222222',
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
			<path
				d="M9.99966 3.8335C11.5644 3.8335 12.8335 5.10185 12.8336 6.6665C12.8336 8.23131 11.5645 9.50049 9.99966 9.50049C8.43501 9.50031 7.16666 8.2312 7.16666 6.6665C7.16683 5.10196 8.43512 3.83367 9.99966 3.8335Z"
				stroke={strokeColor}
				strokeLinecap="round"
			/>
			<path
				d="M3.89557 14.7476C4.35607 12.3614 6.8314 11.25 9.26167 11.25H10.7383C13.1686 11.25 15.6439 12.3614 16.1044 14.7476C16.1361 14.9116 16.1634 15.08 16.1856 15.2523C16.256 15.8001 15.8023 16.25 15.25 16.25H4.75C4.19771 16.25 3.74395 15.8001 3.81441 15.2523C3.83657 15.08 3.86392 14.9116 3.89557 14.7476Z"
				stroke={strokeColor}
				strokeLinecap="round"
			/>
		</svg>
	);
};

export default UserAlt;
