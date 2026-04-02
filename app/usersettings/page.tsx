"use client";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCampaign } from "@/contexts/CampaignContext";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserByIdQuery } from "@/store/services/authApi";
import { useEffect } from "react";
import {
	PersonIcon,
	LockClosedIcon,
	EyeOpenIcon,
	EyeClosedIcon,
	MoonIcon,
	SunIcon,
	GearIcon,
	SpeakerLoudIcon
} from "@radix-ui/react-icons";
import SoundSettings from "@/components/ui/SoundSettings";
import PageHeading from "@/components/ui/PageHeading";
import SubPageHeading from "@/components/ui/SubPageHeading";
import BackButton from "@/components/ui/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";



export default function SettingsPage() {
	const { isDarkMode, toggleTheme } = useTheme();
	const { campaignData } = useCampaign();
	const primaryColor = campaignData?.primaryColor || '#050711';

	const { user } = useAuth();
	const { data: userData, isLoading: isUserLoading } = useGetUserByIdQuery(user?.id || '', {
		skip: !user?.id
	});


	const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'email' | 'preferences' | 'sound'>('profile');

	// Loading states
	const [isProfileLoading, setIsProfileLoading] = useState(false);
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);

	// Profile section
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [profileData, setProfileData] = useState({
		fullName: '',
		username: '',
		phone: '',
		email: '',
	});

	useEffect(() => {
		if (userData?.user) {
			setProfileData({
				fullName: userData.user.firstName && userData.user.lastName
					? `${userData.user.firstName} ${userData.user.lastName}`
					: userData.user.name || '',
				username: userData.user.username || '',
				phone: userData.user.phone || '',
				email: userData.user.email || '',
			});
		}
	}, [userData]);



	// Password section
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});




	// Credit cards section


	const handleProfileSave = async () => {
		setIsProfileLoading(true);
		try {

			const response = await fetch('/api/user/profile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(profileData),
			});



			const data = await response.json();

			if (response.ok) {
				toast.success('Profile updated successfully!');
				setIsEditingProfile(false);
			} else {
				console.error('Profile update failed:', data);
				toast.error(data.error || 'Failed to update profile');
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			toast.error('Failed to update profile. Please try again.');
		} finally {
			setIsProfileLoading(false);
		}
	};

	const handleProfileCancel = () => {
		// Reset to original values from auth context
		if (userData?.user) {
			setProfileData({
				fullName: userData.user.firstName && userData.user.lastName
					? `${userData.user.firstName} ${userData.user.lastName}`
					: userData.user.name || '',
				username: userData.user.username || '',
				phone: userData.user.phone || '',
				email: userData.user.email || '',
			});
		}
		setIsEditingProfile(false);
	};

	const handlePasswordChange = async () => {
		setIsPasswordLoading(true);
		try {
			// Validate passwords match
			if (passwordData.newPassword !== passwordData.confirmPassword) {
				toast.error('New passwords do not match');
				return;
			}



			const response = await fetch('/api/user/password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(passwordData),
			});



			const data = await response.json();

			if (response.ok) {
				toast.success('Password updated successfully!');
				setPasswordData({
					currentPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
				setShowPasswords({
					current: false,
					new: false,
					confirm: false,
				});
			} else {
				toast.error(data.error || 'Failed to update password');
			}
		} catch {
			toast.error('Failed to update password. Please try again.');
		} finally {
			setIsPasswordLoading(false);
		}
	};


	// Skeleton loader component for profile section
	const ProfileSkeleton = () => (
		<div className="py-6">
			<div className="flex items-center space-x-2">
				<div className="flex items-center space-x-2">
					<PersonIcon className="w-6 h-6" />
					<span>Personal Information</span>
				</div>
				<div>
					Update your personal details and contact information.
				</div>
			</div>
			<div className="space-y-6">
				{/* Header skeleton */}
				<div className="flex justify-between items-center">
					<h3
						className="text-[12px] md:text-[14px] font-medium"
						style={{ color: 'var(--text-secondary)' }}
					>
						Profile Details
					</h3>
					<Skeleton className="h-10 w-24" />
				</div>

				{/* Current info skeleton */}
				<div
					className="p-4 rounded-lg"
					style={{ backgroundColor: 'var(--bg-primary)' }}
				>
					<h4
						className="text-[10px] md:text-[12px] font-medium mb-3"
						style={{ color: 'var(--text-secondary)' }}
					>
						Current Information
					</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Skeleton className="h-4 w-20 mb-2" />
							<Skeleton className="h-5 w-32" />
						</div>
						<div>
							<Skeleton className="h-4 w-20 mb-2" />
							<Skeleton className="h-5 w-28" />
						</div>
						<div>
							<Skeleton className="h-4 w-16 mb-2" />
							<Skeleton className="h-5 w-24" />
						</div>
						<div>
							<Skeleton className="h-4 w-16 mb-2" />
							<Skeleton className="h-5 w-36" />
						</div>
					</div>
				</div>

				{/* Form fields skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</div>
		</div>
	);

	return (

		<div className="space-y-8">
			{/* Page Header */}
			<div>
				<div className="mb-4">
					<BackButton />
				</div>
				<PageHeading
					text="Account Settings"
				/>
				<SubPageHeading
					text="Manage your account information, security, and payment methods."
				/>
			</div>

			<div
				className="dark:bg-gray-800 border dark:border-gray-700 w-full h-full p-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				{/* Navigation Tabs */}
				<div
					className="border-b dark:border-gray-700 mb-8"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<nav className="-mb-px flex space-x-1">
						{[
							{ id: 'profile', label: 'Profile', icon: PersonIcon },
							{ id: 'password', label: 'Password', icon: LockClosedIcon },
							{ id: 'preferences', label: 'Preferences', icon: GearIcon },
							{ id: 'sound', label: 'Sound', icon: SpeakerLoudIcon },
							// { id: 'email', label: 'Email', icon: Mail }, 
						].map(({ id, label, icon: IconComponent }) => (
							<Button
								key={id}
								variant="ghost"
								size="sm"
								onClick={() => setActiveSection(id as 'profile' | 'password' | 'email' | 'preferences' | 'sound')}
								className={`relative flex items-center space-x-2 py-3 px-4 font-medium text-[10px] md:text-[12px] transition-all duration-200 !rounded-none ${activeSection === id
									? 'dark:text-gray-100'
									: 'dark:text-gray-400 dark:hover:text-gray-300'
									}`}
								style={activeSection === id ? {
									color: 'var(--text-primary)'
								} : {
									color: 'var(--text-tertiary)'
								}}
								onMouseEnter={(e) => {
									if (activeSection !== id) {
										e.currentTarget.style.color = 'var(--text-primary)';
									}
								}}
								onMouseLeave={(e) => {
									if (activeSection !== id) {
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}
								}}
							>
								<IconComponent className="h-4 w-4 transition-colors" />
								<span>{label}</span>
								{activeSection === id && (
									<span
										className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
										style={{ backgroundColor: primaryColor }}
									/>
								)}
							</Button>
						))}
					</nav>
				</div>

				{/* Profile Section */}
				{activeSection === 'profile' && (
					isUserLoading ? (
						<ProfileSkeleton />
					) : (
						<div className="py-6">
							<div className="mb-6">
								<div className="flex items-center space-x-2 mb-2">
									<PersonIcon
										className="w-6 h-6"
										style={{ color: 'var(--text-secondary)' }}
									/>
									<h2
										className="text-[14px] md:text-[16px] font-semibold"
										style={{ color: 'var(--text-secondary)' }}
									>
										Personal Information
									</h2>
								</div>
								<p
									className="text-[10px] md:text-[12px] dark:text-gray-400 ml-8"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Update your personal details and contact information.
								</p>
							</div>
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h3
										className="text-[12px] md:text-[14px] font-medium"
										style={{ color: 'var(--text-secondary)' }}
									>
										Profile Details
									</h3>
									{!isEditingProfile ? (
										<Button
											onClick={() => setIsEditingProfile(true)}
											disabled={isUserLoading}
											style={{ backgroundColor: primaryColor }}
										>
											{isUserLoading ? 'Loading...' : 'Edit Profile'}
										</Button>
									) : (
										<div className="space-x-3">
											<Button
												variant="danger"
												onClick={handleProfileCancel}
												disabled={isProfileLoading}
											>
												Cancel
											</Button>
											<Button
												onClick={handleProfileSave}
												disabled={isProfileLoading}
												style={{ backgroundColor: primaryColor }}
											>
												{isProfileLoading ? 'Saving...' : 'Save Changes'}
											</Button>
										</div>
									)}
								</div>

								{/* Current User Info Display */}
								<div
									className="dark:bg-gray-800 p-4 rounded-lg"
									style={{ backgroundColor: 'var(--bg-primary)' }}
								>
									<h4
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-3"
										style={{ color: 'var(--text-secondary)' }}
									>
										Current Information
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] md:text-[12px]">
										<div>
											<span
												className="font-medium dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Full Name:
											</span>
											<p
												className="dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{profileData.fullName || 'Not set'}
											</p>
										</div>
										<div>
											<span
												className="font-medium dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Username:
											</span>
											<p
												className="dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{profileData.username || 'Not set'}
											</p>
										</div>
										<div>
											<span
												className="font-medium dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Phone:
											</span>
											<p
												className="dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{profileData.phone || 'Not set'}
											</p>
										</div>
										<div>
											<span
												className="font-medium dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Email:
											</span>
											<p
												className="dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{profileData.email || 'Not set'}
											</p>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label
											htmlFor="fullName"
											className="text-[10px] md:text-[12px] font-medium dark:text-gray-300"
											style={{ color: 'var(--text-secondary)' }}
										>
											Full Name
										</label>
										<Input
											label=""
											type="text"
											value={profileData.fullName}
											onChange={(value) => setProfileData({ ...profileData, fullName: value })}
											disabled={!isEditingProfile}
											className="disabled:bg-gray-50"
										/>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="username"
											className="text-[10px] md:text-[12px] font-medium dark:text-gray-300"
											style={{ color: 'var(--text-secondary)' }}
										>
											Username
										</label>
										<Input
											label=""
											type="text"
											value={profileData.username}
											onChange={(value) => setProfileData({ ...profileData, username: value })}
											disabled={!isEditingProfile}
											className="disabled:bg-gray-50"
										/>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="email"
											className="text-[10px] md:text-[12px] font-medium dark:text-gray-300"
											style={{ color: 'var(--text-secondary)' }}
										>
											Email Address
										</label>
										<Input
											label=""
											type="email"
											value={profileData.email}
											disabled
											className="disabled:bg-gray-50 dark:disabled:bg-gray-800"
										/>
										<p
											className="text-[10px] md:text-[12px] dark:text-gray-400 mt-1"
											style={{ color: 'var(--text-tertiary)' }}
										>
											Email changes require verification. Use the Email tab to update.
										</p>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="phone"
											className="text-[10px] md:text-[12px] font-medium dark:text-gray-300"
											style={{ color: 'var(--text-secondary)' }}
										>
											Phone Number
										</label>
										<Input
											label=""
											type="tel"
											value={profileData.phone}
											onChange={(value) => setProfileData({ ...profileData, phone: value })}
											disabled={!isEditingProfile}
											className="disabled:bg-gray-50"
										/>
									</div>
								</div>
							</div>
						</div>
					)
				)}

				{/* Password Section */}
				{activeSection === 'password' && (
					<div className="py-6">
						<div className="mb-6">
							<div className="flex items-center space-x-2 mb-2">
								<LockClosedIcon
									className="w-6 h-6"
									style={{ color: 'var(--text-secondary)' }}
								/>
								<h2
									className="text-[14px] md:text-[16px] font-semibold"
									style={{ color: 'var(--text-secondary)' }}
								>
									Change Password
								</h2>
							</div>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-400 ml-8"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Update your password to keep your account secure.
							</p>
						</div>
						<div className="space-y-6">
							<div className="max-w-md space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="currentPassword"
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Current Password
									</label>
									<div className="relative">
										<Input
											label=""
											type={showPasswords.current ? "text" : "password"}
											value={passwordData.currentPassword}
											onChange={(value) => setPasswordData({ ...passwordData, currentPassword: value })}
										/>
										<Button
											variant="ghost"
											size="sm"
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-500 dark:hover:text-gray-300 transition-colors !rounded-none"
											style={{ color: 'var(--text-tertiary)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = 'var(--text-secondary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-tertiary)';
											}}
											onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
										>
											{showPasswords.current ? <EyeClosedIcon className="h-5 w-5" /> : <EyeOpenIcon className="h-5 w-5" />}
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="newPassword"
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										New Password
									</label>
									<div className="relative">
										<Input
											label=""
											type={showPasswords.new ? "text" : "password"}
											value={passwordData.newPassword}
											onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
										/>
										<Button
											variant="ghost"
											size="sm"
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-500 dark:hover:text-gray-300 transition-colors !rounded-none"
											style={{ color: 'var(--text-tertiary)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = 'var(--text-secondary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-tertiary)';
											}}
											onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
										>
											{showPasswords.new ? <EyeClosedIcon className="h-5 w-5" /> : <EyeOpenIcon className="h-5 w-5" />}
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="confirmPassword"
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Confirm New Password
									</label>
									<div className="relative">
										<Input
											label=""
											type={showPasswords.confirm ? "text" : "password"}
											value={passwordData.confirmPassword}
											onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
										/>
										<Button
											variant="ghost"
											size="sm"
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-500 dark:hover:text-gray-300 transition-colors !rounded-none"
											style={{ color: 'var(--text-tertiary)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = 'var(--text-secondary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-tertiary)';
											}}
											onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
										>
											{showPasswords.confirm ? <EyeClosedIcon className="h-5 w-5" /> : <EyeOpenIcon className="h-5 w-5" />}
										</Button>
									</div>
								</div>

								<Button
									onClick={handlePasswordChange}
									disabled={isPasswordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
									style={{ backgroundColor: primaryColor }}
								>
									{isPasswordLoading ? 'Updating...' : 'Update Password'}
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Preferences Section */}
				{activeSection === 'preferences' && (
					<div className="py-6">
						<div className="mb-6">
							<div className="flex items-center space-x-2 mb-2">
								<GearIcon
									className="w-6 h-6"
									style={{ color: 'var(--text-secondary)' }}
								/>
								<h2
									className="text-[14px] md:text-[16px] font-semibold"
									style={{ color: 'var(--text-secondary)' }}
								>
									Appearance
								</h2>
							</div>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-400 ml-8"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Customize the appearance of your application.
							</p>
						</div>

						<div className="space-y-6">
							{/* Dark Mode Toggle */}
							<div
								className="flex items-center justify-between p-4 dark:bg-gray-800 border dark:border-gray-700"
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--light-gray)'
								}}
							>
								<div className="flex items-center space-x-3">
									<div className="p-2" style={{ backgroundColor: primaryColor + '20' }}>
										{isDarkMode ? (
											<SunIcon className="w-5 h-5" style={{ color: primaryColor }} />
										) : (
											<MoonIcon className="w-5 h-5" style={{ color: primaryColor }} />
										)}
									</div>
									<div>
										<h3
											className="text-base font-medium dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											Dark Mode
										</h3>
										<p
											className="text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
										</p>
									</div>
								</div>
								<button
									onClick={toggleTheme}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode
										? 'focus:ring-offset-gray-800 focus:ring-gray-500'
										: 'focus:ring-offset-white focus:ring-gray-500'
										}`}
									style={isDarkMode ? { backgroundColor: primaryColor } : { backgroundColor: '#D1D5DB' }}
								>
									<span
										className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
											}`}
									/>
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Sound Section */}
				{activeSection === 'sound' && (
					<div className="py-6">
						<div className="mb-6">
							<div className="flex items-center space-x-2 mb-2">
								<SpeakerLoudIcon
									className="w-6 h-6"
									style={{ color: 'var(--text-secondary)' }}
								/>
								<h2
									className="text-[14px] md:text-[16px] font-semibold"
									style={{ color: 'var(--text-secondary)' }}
								>
									Sound Settings
								</h2>
							</div>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-400 ml-8"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Control sound notifications for different components. You can enable or disable sounds globally or for specific components.
							</p>
						</div>
						<SoundSettings />
					</div>
				)}

			</div>
		</div>
	);
}