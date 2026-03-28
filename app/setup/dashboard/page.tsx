'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';
import { useSetup } from '@/contexts/SetupContext';
import { Skeleton } from '@/components/ui/skeleton';

const KPIMetric = dynamic(() => import('@/components/KPIMetric'), {
	ssr: false,
	loading: () => (
		<div className="p-6 space-y-4">
			<Skeleton className="h-4 w-32" />
			<Skeleton className="h-8 w-full" />
		</div>
	)
});

const CallDisposition = dynamic(() => import('@/components/CallDisposition'), {
	ssr: false,
	loading: () => (
		<div className="p-6 space-y-4">
			<Skeleton className="h-4 w-40" />
			<Skeleton className="h-10 w-full" />
		</div>
	)
});

export default function DashboardPage(): React.JSX.Element {
	const { setupData, updateDashboardSettings, dashboardStep, setDashboardStep } = useSetup();
	const { dashboardSettings } = setupData;

	const toActiveTab = (step: 'KPI Metric' | 'Call Disposition'): 'kpi' | 'disposition' =>
		step === 'KPI Metric' ? 'kpi' : 'disposition';

	return (
		<div className="w-full h-full">
			<div className="mb-8">
				<h1
					className="font-lato not-italic font-semibold text-[24px] leading-[150%] dark:text-gray-100"
					style={{ color: 'var(--text-secondary)' }}
				>
					Dashboard
				</h1>
				<p
					className="font-lato not-italic font-normal text-[12px] md:text-[14px] leading-[150%] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Set up your dashboard widgets and reports
				</p>
			</div>

			<div
				className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div>
						<Input
							label="Dashboard Name"
							placeholder="Enter dashboard name"
							value={dashboardSettings.dashboardName}
							onChange={(value) => updateDashboardSettings({ dashboardName: value })}
						/>
					</div>
				</div>
			</div>

			<div className="mb-6">
				<div
					className="flex border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setDashboardStep('KPI Metric');
							updateDashboardSettings({ activeTab: toActiveTab('KPI Metric') });
						}}
						className={`px-4 py-2 font-inter text-[10px] md:text-[12px] font-medium transition-colors hover:transform-none h-auto rounded-none ${dashboardStep === 'KPI Metric'
							? 'dark:text-gray-100 dark:border-gray-100'
							: 'dark:text-gray-400 dark:hover:text-gray-300'
							}`}
						style={dashboardStep === 'KPI Metric' ? {
							color: 'var(--text-primary)',
							borderBottom: '2px solid',
							borderBottomColor: 'var(--text-primary)'
						} : {
							color: 'var(--text-tertiary)'
						}}
						onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
							if (dashboardStep !== 'KPI Metric') {
								e.currentTarget.style.color = 'var(--text-secondary)';
							}
						}}
						onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
							if (dashboardStep !== 'KPI Metric') {
								e.currentTarget.style.color = 'var(--text-tertiary)';
							}
						}}
						title="KPI Metric Tab"
					>
						KPI Metric
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setDashboardStep('Call Disposition');
							updateDashboardSettings({ activeTab: toActiveTab('Call Disposition') });
						}}
						className={`px-4 py-2 font-inter text-[10px] md:text-[12px] font-medium transition-colors hover:transform-none h-auto rounded-none ${dashboardStep === 'Call Disposition'
							? 'dark:text-gray-100 dark:border-gray-100'
							: 'dark:text-gray-400 dark:hover:text-gray-300'
							}`}
						style={dashboardStep === 'Call Disposition' ? {
							color: 'var(--text-primary)',
							borderBottom: '2px solid',
							borderBottomColor: 'var(--text-primary)'
						} : {
							color: 'var(--text-tertiary)'
						}}
						onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
							if (dashboardStep !== 'Call Disposition') {
								e.currentTarget.style.color = 'var(--text-secondary)';
							}
						}}
						onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
							if (dashboardStep !== 'Call Disposition') {
								e.currentTarget.style.color = 'var(--text-tertiary)';
							}
						}}
						title="Call Disposition Tab"
					>
						Call Disposition
					</Button>
				</div>
			</div>

			{dashboardStep === 'KPI Metric' && (
				<KPIMetric
					widgets={dashboardSettings.widgets}
					onWidgetsChange={(widgets) => updateDashboardSettings({ widgets })}
					callOutcomes={dashboardSettings.callOutcomes}
					onCallOutcomesChange={(callOutcomes) => updateDashboardSettings({ callOutcomes })}
				/>
			)}

			{dashboardStep === 'Call Disposition' && (
				<CallDisposition
					dispositions={dashboardSettings.dispositions}
					onDispositionsChange={(dispositions) => updateDashboardSettings({ dispositions })}
				/>
			)}

		</div>
	);
}
