'use client';

import React, { useState, useEffect } from 'react';
import { useCampaign } from '@/contexts/CampaignContext';
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import { GearIcon } from '@radix-ui/react-icons';
import SubPageHeading from '@/components/ui/SubPageHeading';
import PageHeading from '@/components/ui/PageHeading';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AccountDeactivationModal from '@/components/ui/AccountDeactivationModal';
import AccountDeletionModal from '@/components/ui/AccountDeletionModal';
import Button from '@/components/ui/Button';

const GeneralSettings: React.FC = () => {
	const { campaignData } = useCampaign();
	const primaryColor = campaignData?.primaryColor || '#050711';
	const [tooltipLength, setTooltipLength] = useState<number>(10);
	const { user, logout } = useAuth();
	const router = useRouter();
	const [isDeactivating, setIsDeactivating] = useState(false);
	const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

	// Deletion states
	const [isDeleting, setIsDeleting] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


	// Check if user is admin
	const role = user?.role;
	const roleName = (typeof role === 'object' && role !== null && 'roleName' in role)
		? (role as { roleName: string }).roleName
		: (typeof role === 'string' ? role : '');

	const isAdmin = roleName.toLowerCase() === 'admin' || roleName.toLowerCase() === 'super admin' || roleName.toLowerCase() === 'superadmin';


	useEffect(() => {
		const savedLength = localStorage.getItem('report_tooltip_length');
		if (savedLength) {
			setTooltipLength(parseInt(savedLength, 10));
		}
	}, []);

	const handleTooltipLengthChange = (value: string) => {
		const length = parseInt(value, 10);
		if (!isNaN(length) && length > 0) {
			setTooltipLength(length);
			localStorage.setItem('report_tooltip_length', length.toString());
			toast.success('Tooltip length saved');
		}
	};

	const handleDeactivate = async (reason: string) => {
		if (!user?.id) return;
		setIsDeactivating(true);
		try {
			const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000/api/v1'}/api/v1/users/deactivate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
				},
				body: JSON.stringify({ userId: user.id, reason }),
			});

			const data = (await response.json()) as { message?: string };

			if (response.ok) {
				toast.success('Account deactivated. Logging you out...');
				setTimeout(() => {
					logout();
					router.push('/login');
				}, 2000);
			} else {
				toast.error(data.message || 'Failed to deactivate account');
			}
		} catch (error) {
			console.error('Error deactivating account:', error);
			toast.error('An error occurred. Please try again.');
		} finally {
			setIsDeactivating(false);
		}
	};

	const handleDeleteAccount = async (confirmationText: string) => {
		if (!user?.id) return;
		setIsDeleting(true);
		try {
			const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000/api/v1'}/api/v1/users/delete-account`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
				},
				body: JSON.stringify({ confirmationText }),
			});

			const data = (await response.json()) as { message?: string };

			if (response.ok) {
				toast.success('Account and all associated data deleted successfully.');
				setTimeout(() => {
					logout();
					router.push('/login');
				}, 1500);
			} else {
				toast.error(data.message || 'Failed to delete account');
			}
		} catch (error) {
			console.error('Error deleting account:', error);
			toast.error('An error occurred during deletion. Please try again.');
		} finally {
			setIsDeleting(false);
			setIsDeleteModalOpen(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<PageHeading text="General Settings" />
				<SubPageHeading text="Manage general configuration for your application." />
			</div>

			<div className="space-y-6">
				{/* Tooltip Length Setting */}
				<div
					className="flex items-center justify-between p-4 dark:bg-gray-800 border dark:border-gray-700 rounded-[var(--radius)]"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex items-center space-x-3">
						<div className="p-2 rounded-full" style={{ backgroundColor: primaryColor + '20' }}>
							<GearIcon className="w-5 h-5" style={{ color: primaryColor }} />
						</div>
						<div>
							<h3
								className="text-base font-medium dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Table Text Abbreviation Length
							</h3>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Set the number of characters to show before abbreviating text in tables.
							</p>
						</div>
					</div>
					<div className="w-24">
						<Input
							label=""
							type="number"
							value={tooltipLength.toString()}
							onChange={handleTooltipLengthChange}
							className="text-center"
						/>
					</div>
				</div>

				{/* Deactivate Account Setting (Admin Only) */}
				{isAdmin && (
					<div
						className="p-6 border-2 border-red-100 dark:border-red-900/30 rounded-[var(--radius)] bg-red-50/50 dark:bg-red-900/10"
					>
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<h3 className="text-[14px] font-bold text-red-800 dark:text-red-400 mb-1">
									Deactivate Account
								</h3>
								<p className="text-[12px] text-red-700 dark:text-red-300 max-w-xl">
									Deactivating your account will immediately log you out and restrict access until it is reactivated by a Super Admin. This action is reversible but requires approval.
								</p>
							</div>
							<Button
								variant="danger"
								size="md"
								onClick={() => setIsDeactivateModalOpen(true)}
								loading={isDeactivating}
							>
								Deactivate Account
							</Button>
						</div>
					</div>
				)}

				{/* Delete Account Setting (Admin Only) */}
				{isAdmin && (
					<div
						className="p-6 border-2 border-red-200 dark:border-red-800 rounded-[var(--radius)] bg-white dark:bg-gray-800"
						style={{ borderColor: '#FEE2E2' }}
					>
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<h3 className="text-[14px] font-bold text-red-600 dark:text-red-400 mb-1">
									Permanently Delete Account
								</h3>
								<p className="text-[12px] text-gray-700 dark:text-gray-400 max-w-xl">
									Deleting your account and workspace will permanently purge all team members, customer data, campaigns, and settings. This action is complete, destructive, and <strong>cannot be undone</strong>.
								</p>
							</div>
							<Button
								variant="outline"
								size="md"
								className="!border-red-600 !text-red-600 hover:!bg-red-50 transition-colors"
								onClick={() => setIsDeleteModalOpen(true)}
								loading={isDeleting}
							>
								Delete Everything
							</Button>
						</div>
					</div>
				)}
			</div>

			<AccountDeactivationModal
				isOpen={isDeactivateModalOpen}
				onClose={() => setIsDeactivateModalOpen(false)}
				onConfirm={handleDeactivate}
				userName={user?.firstName || 'your account'}
			/>

			<AccountDeletionModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDeleteAccount}
				username={user?.username || 'user'}
				isLoading={isDeleting}
			/>
		</div>

	);
};

export default GeneralSettings;

