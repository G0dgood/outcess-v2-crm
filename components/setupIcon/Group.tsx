import React from 'react';

interface GroupProps {
	width?: number;
	height?: number;
	className?: string;
	strokeColor?: string;
	fillColor?: string;
}

export const Group: React.FC<GroupProps> = ({
	width = 20,
	height = 20,
	className = '',
	strokeColor = '#222222',
	fillColor = '#222222',
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<circle
				cx="12"
				cy="8.25"
				r="3"
				fill={fillColor}
				fillOpacity={0.12}
				stroke={strokeColor}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6 19.5C6 16.1863 8.68629 13.5 12 13.5C15.3137 13.5 18 16.1863 18 19.5"
				stroke={strokeColor}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle
				cx="5.5"
				cy="10.25"
				r="2"
				fill={fillColor}
				fillOpacity={0.12}
				stroke={strokeColor}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle
				cx="18.5"
				cy="10.25"
				r="2"
				fill={fillColor}
				fillOpacity={0.12}
				stroke={strokeColor}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M3 19.75C3 17.6789 4.67893 16 6.75 16H7.5"
				stroke={strokeColor}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M21 19.75C21 17.6789 19.3211 16 17.25 16H16.5"
				stroke={strokeColor}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default Group;
