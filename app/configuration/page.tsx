'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GearIcon } from '@radix-ui/react-icons';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetLineOfBusinessByCompanyIdForheaderQuery } from '@/store/services/lineOfBusinessApi';
import { Skeleton } from '@/components/ui/skeleton';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';

import { usePrivilege } from '@/contexts/PrivilegeContext';

export default function ConfigurationPage() {
	const router = useRouter();
	const { user } = useUserInfo();
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('systemSetting');
	const canCreate = canAccess('systemSetting', 'create');
	const canEdit = canAccess('systemSetting', 'edit');

	const { setSelectedLineOfBusinessId } = useLineOfBusiness();
	const companyId = user?.companyId || user?.company?._id || '';
	const [searchTerm, setSearchTerm] = useState('');
	const { data: lineOfBusinessData, isLoading } = useGetLineOfBusinessByCompanyIdForheaderQuery(companyId, {
		skip: !companyId
	});

	const lineOfBusinesses = useMemo(() => {
		return lineOfBusinessData?.lineOfBusinesses || [];
	}, [lineOfBusinessData]);

	if (!canAccessModule) {
		return null;
	}

	return (
		<div>
			{/* Header Section */}
			<div className="mb-6">
				<h1
					className="text-2xl font-semibold dark:text-gray-100 mb-2"
					style={{ color: 'var(--text-primary)' }}
				>
					Configuration
				</h1>
				<p
					className="text-sm dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Manage your line of businesses and other settings.
				</p>
			</div>

			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<Search
					placeholder="Search"
					value={searchTerm}
					onChange={setSearchTerm}
					className="w-full sm:w-auto"
					maxWidth="w-full"
					onSearch={(value) => console.log('Search triggered:', value)}
					onClear={() => console.log('Search cleared')}
					showClearButton={true}
				/>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					{canCreate && (
						<Button
							variant="primary"
							size="md"
							onClick={() => {
								setSelectedLineOfBusinessId(null);
								localStorage.removeItem('peoplely-setup-data');
								router.push('/setup');
							}}
							className="flex items-center gap-2 px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
						>
							Line of Businesses
						</Button>
					)}
				</div>
			</div>
			{/* Line of Business Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="p-6 border-b dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
					<h2
						className="text-lg font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Line of Businesses
					</h2>
				</div>

				<div className="overflow-x-auto">
					<table
						className="min-w-full divide-y dark:divide-gray-700"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<thead
							className="dark:bg-gray-700 border-b dark:border-gray-700"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Name
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									ID
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Created At
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Action
								</th>
							</tr>
						</thead>
						<tbody
							className="dark:bg-gray-800 divide-y dark:divide-gray-700"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{isLoading ? (
								<SVGLoaderFetch colSpan={8} text={''} />
							) : lineOfBusinesses.length === 0 ? (
								<NoRecordFound colSpan={8} />
							) : lineOfBusinesses.map((lob: { _id: string; lineOfBusinessName: string; createdAt?: string }) => (
									<tr
										key={lob._id}
										className="dark:hover:bg-gray-700 transition-colors"
										style={{ borderColor: 'var(--light-gray)' }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'transparent';
										}}
									>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{lob.lineOfBusinessName}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{lob._id}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{lob.createdAt ? new Date(lob.createdAt).toLocaleDateString() : 'N/A'}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm font-medium"
										>
											{canEdit && (
												<button
													onClick={() => {
														setSelectedLineOfBusinessId(lob._id);
														router.push('/setup');
													}}
													className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-700"
													title="Configure"
												>
													<GearIcon width={18} height={18} style={{ color: 'var(--text-primary)' }} />
												</button>
											)}
										</td>
									</tr>
								)) }
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
