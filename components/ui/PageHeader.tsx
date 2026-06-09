import React from 'react';

interface PageHeaderProps {
	title: string;
	description?: string;
	className?: string;
	icon?: React.ElementType;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, className = '', icon: Icon }) => {
	return (
		<div className={`mb-6 ${className}`}>
			<div className="flex items-center gap-2 mb-2">
				{Icon && (
					<div 
						className="w-8 h-8 rounded-lg flex items-center justify-center"
						style={{ backgroundColor: 'var(--bg-primary)' }}
					>
						<Icon className="w-5 h-5 opacity-60" style={{ color: 'var(--text-primary)' }} />
					</div>
				)}
				<h1
					className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100"
					style={{ color: 'var(--text-primary)' }}
				>
					{title}
				</h1>
			</div>
			<p
				className="text-[10px] md:text-[12px] dark:text-gray-400"
				style={{ color: 'var(--text-tertiary)' }}
			>
				{description}
			</p>
		</div>
	);
};

export default PageHeader;
