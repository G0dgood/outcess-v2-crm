'use client';

import React from 'react';

interface SkeletonProps {
	className?: string;
	variant?: 'rect' | 'circle' | 'text';
	style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
	className = '', 
	variant = 'rect',
	style
}) => {
	const baseClass = "animate-pulse bg-gray-200 dark:bg-gray-700";
	const variantClass = variant === 'circle' ? 'rounded-full' : 'rounded-[var(--radius)]';
	
	return (
		<div className={`${baseClass} ${variantClass} ${className}`} style={style} />
	);
};

export default Skeleton;
