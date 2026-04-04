import React from 'react';
import Button from './Button';

interface BottomNavProps {
	onSave?: () => void;
	onBack?: () => void;
	isLoading?: boolean;
	disabled?: boolean;
	buttonText?: string;
	backText?: string;
	showBack?: boolean;
	className?: string;
	dashboardStep?: 'KPI Metric' | 'Call Disposition';
	setDashboardStep?: React.Dispatch<React.SetStateAction<'KPI Metric' | 'Call Disposition'>>;
	currentStep?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
	onSave,
	onBack,
	isLoading = false,
	disabled = false,
	buttonText = "Save & Continue",
	backText = "Back",
	showBack = true,
	className = '',
	dashboardStep,
	setDashboardStep,
	currentStep,
}) => {


	return (
		<div
			id="footer"
			className={`dark:bg-gray-800 border-t dark:border-gray-700 px-6 py-4 flex items-center justify-between ${className} w-full`}
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			{showBack && onBack && (
				<Button
					variant="outline"
					size="md"
					onClick={onBack}
					disabled={isLoading}
					className="text-[8px] md:text-[10px]"
				>
					{backText}
				</Button>
			)}
			{!showBack && <div />}

			{dashboardStep === "KPI Metric" && currentStep === 2 ? <Button
				variant="primary"
				size="md"
				onClick={() => setDashboardStep?.("Call Disposition")}
				loading={isLoading}
				disabled={disabled || isLoading}
				className="text-[8px] md:text-[10px]"
			>
				{"Call Disposition"}
			</Button> : <Button
				variant="primary"
				size="md"
				onClick={onSave}
				loading={isLoading}
				disabled={disabled || isLoading}
				className="text-[8px] md:text-[10px]"
			>
				{buttonText}
			</Button>}
		</div>
	);
};

export default BottomNav;
