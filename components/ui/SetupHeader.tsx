import React from 'react';

interface User {
	name: string;
	role: string;
	avatar?: string;
	initials?: string;
}

interface SetupHeaderProps {
	title?: string;
	user?: User;
	showLogo?: boolean;
	className?: string;
}

export const SetupHeader: React.FC<SetupHeaderProps> = ({
	title = "CRM Setup Configurator",
	user,
	showLogo = true,
	className = '',
}) => {
	const defaultUser: User = {
		name: "John Doe",
		role: "Administrator",
		initials: "JD",
	};

	const userData: User = user || defaultUser;

	return (
		<header id="header" className={`!flex flex-row bg-(--accent-white) border-b border-gray-100 px-6 py-4 justify-between items-center ${className}`}>
			<div className="flex items-center">
				{showLogo && (
					<div className="flex items-center gap-3">
						<div className="flex gap-1">
							<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
							<div className="w-2 h-2 bg-[#6C8B7D] rounded-full"></div>
							<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
						</div>
						<span className="font-lato not-italic font-medium text-[14px] leading-[150%] text-[#3A4050]">{title}</span>
					</div>
				)}
				{!showLogo && (
					<span className="font-inter font-semibold text-lg text-[#050711]">{title}</span>
				)}
			</div>

			{userData && (
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-[#F2F4F7] border-2 border-[#E5E7EB] rounded-full flex items-center justify-center">
						{userData.avatar ? (
							<img
								src={userData.avatar}
								alt={userData.name}
								className="w-10 h-10 rounded-full object-cover"
							/>
						) : (
							<span className="font-lato font-semibold text-base leading-[150%] text-center text-[#475467]">
								{userData.initials || userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
							</span>
						)}
					</div>
					<div className="flex flex-col">
						<span className="font-lato font-medium text-sm leading-[150%] text-[#3A4050]">
							{userData.name}
						</span>
						<span className="font-lato font-normal text-xs leading-[150%] text-[#6D7280]">{userData.role}</span>
					</div>
				</div>
			)}
		</header>
	);
};

export default SetupHeader;
