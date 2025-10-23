import React from 'react';

interface MenuProps {
	width?: number;
	height?: number;
	className?: string;
	strokeColor?: string;
}

export const Menu: React.FC<MenuProps> = ({
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
				d="M4.16666 5.8335L15.8333 5.8335"
				stroke={strokeColor}
				strokeLinecap="round"
			/>
			<path
				d="M4.16666 10L15.8333 10"
				stroke={strokeColor}
				strokeLinecap="round"
			/>
			<path
				d="M4.16666 14.1665L15.8333 14.1665"
				stroke={strokeColor}
				strokeLinecap="round"
			/>
		</svg>
	);
};

export default Menu;
