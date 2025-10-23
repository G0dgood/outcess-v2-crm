import React from 'react';

interface DashboardProps {
	width?: number;
	height?: number;
	className?: string;
	strokeColor?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
	width = 20,
	height = 20,
	className = '',
	strokeColor = '#3A4050',
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
			<rect
				x="3.33334"
				y="3.3335"
				width="5"
				height="5"
				rx="1"
				stroke={strokeColor}
				strokeLinejoin="round"
			/>
			<rect
				x="3.33334"
				y="11.6665"
				width="5"
				height="5"
				rx="1"
				stroke={strokeColor}
				strokeLinejoin="round"
			/>
			<rect
				x="11.6667"
				y="11.6665"
				width="5"
				height="5"
				rx="1"
				stroke={strokeColor}
				strokeLinejoin="round"
			/>
			<rect
				x="11.6667"
				y="3.3335"
				width="5"
				height="5"
				rx="1"
				stroke={strokeColor}
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default Dashboard;
