"use client";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSetup } from "@/contexts/SetupContext";
import {
	PersonIcon,
	LockClosedIcon,
	IdCardIcon,
	EyeOpenIcon,
	EyeClosedIcon,
	MoonIcon,
	SunIcon,
	GearIcon
} from "@radix-ui/react-icons";
import PageHeading from "@/components/ui/PageHeading";
import SubPageHeading from "@/components/ui/SubPageHeading";
import { useTheme } from "@/contexts/ThemeContext";

interface CreditCardInfo {
	id: string;
	last4: string;
	brand: string;
	expiryMonth: number;
	expiryYear: number;
	isDefault: boolean;
}

export default function SettingsPage() {
	const { setupData } = useSetup();
	const { isDarkMode, toggleTheme } = useTheme();
	const primaryColor = setupData.primaryColor || '#9333EA';
	const secondaryColor = setupData.secondaryColor || '#6C8B7D';

	const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'email' | 'preferences'>('profile');

	// Loading states
	const [isProfileLoading, setIsProfileLoading] = useState(false);
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);
	const [isLoadingUserData, setIsLoadingUserData] = useState(false);

	// Profile section
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [profileData, setProfileData] = useState({
		fullName: '',
		username: '',
		phone: '',
		email: '',
	});

	// Fetch user data on component mount


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

	// // Email section
	// const [emailData, setEmailData] = useState({
	// 	newEmail: '',
	// 	verificationCode: '',
	// });
	// const [isEmailVerifying, setIsEmailVerifying] = useState(false);

	// Credit cards section
	const [creditCards, setCreditCards] = useState<CreditCardInfo[]>([
		{ id: '1', last4: '4242', brand: 'Visa', expiryMonth: 12, expiryYear: 2025, isDefault: true },
		{ id: '2', last4: '5555', brand: 'Mastercard', expiryMonth: 8, expiryYear: 2026, isDefault: false },
	]);
	const [isAddingCard, setIsAddingCard] = useState(false);
	const [newCardData, setNewCardData] = useState({
		cardNumber: '',
		expiryMonth: '',
		expiryYear: '',
		cvv: '',
		cardholderName: '',
		zipCode: '',
	});

	const handleProfileSave = async () => {
		setIsProfileLoading(true);
		try {
			console.log('Sending profile update request:', profileData);

			const response = await fetch('/api/user/profile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(profileData),
			});

			console.log('Profile update response status:', response.status);

			const data = await response.json();
			console.log('Profile update response data:', data);

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
		setProfileData({
			fullName: 'kishan kumar',
			username: 'kishan',
			phone: '1234567890',
			email: 'kishan@example.com',
		});
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

			console.log('Sending password change request:', {
				currentPassword: passwordData.currentPassword ? '[REDACTED]' : 'empty',
				newPassword: passwordData.newPassword ? '[REDACTED]' : 'empty',
				confirmPassword: passwordData.confirmPassword ? '[REDACTED]' : 'empty'
			});

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
		} catch (error) {
			console.error('Error updating password:', error);
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
					<h3 className="text-lg font-medium">Profile Details</h3>
					<Skeleton className="h-10 w-24" />
				</div>

				{/* Current info skeleton */}
				<div className="bg-gray-50 p-4 rounded-lg">
					<h4 className="text-sm font-medium text-gray-700 mb-3">Current Information</h4>
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
				<PageHeading
					text="Account Settings"
				/>
				<SubPageHeading
					text="Manage your account information, security, and payment methods."
				/>
			</div>

			<div className="bg-(--accent-white) dark:bg-(--accent-white) border border-gray-200 dark:border-gray-700 w-full h-full p-6">
				{/* Navigation Tabs */}
				<div className="border-b border-gray-200 dark:border-gray-700 mb-8">
					<nav className="-mb-px flex space-x-1">
						{[
							{ id: 'profile', label: 'Profile', icon: PersonIcon },
							{ id: 'password', label: 'Password', icon: LockClosedIcon },
							{ id: 'preferences', label: 'Preferences', icon: GearIcon },
							// { id: 'email', label: 'Email', icon: Mail }, 
						].map(({ id, label, icon: IconComponent }) => (
							<button
								key={id}
								onClick={() => setActiveSection(id as 'profile' | 'password' | 'email' | 'preferences')}
								className={`relative flex items-center space-x-2 py-3 px-4 font-medium text-sm transition-all duration-200 ${activeSection === id
									? 'text-gray-900 dark:text-gray-100'
									: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
									}`}
							>
								<IconComponent className="h-4 w-4 transition-colors" />
								<span>{label}</span>
								{activeSection === id && (
									<span
										className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
										style={{ backgroundColor: primaryColor }}
									/>
								)}
							</button>
						))}
					</nav>
				</div>

				{/* Profile Section */}
				{activeSection === 'profile' && (
					isLoadingUserData ? (
						<ProfileSkeleton />
					) : (
						<div className="py-6">
							<div className="mb-6">
								<div className="flex items-center space-x-2 mb-2">
									<PersonIcon className="w-6 h-6 text-(--text-secondary)" />
									<h2 className="text-xl font-semibold text-(--text-secondary)">Personal Information</h2>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
									Update your personal details and contact information.
								</p>
							</div>
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h3 className="text-lg font-medium text-(--text-secondary)">Profile Details</h3>
									{!isEditingProfile ? (
										<Button
											onClick={() => setIsEditingProfile(true)}
											disabled={isLoadingUserData}
											style={{ backgroundColor: primaryColor }}
										>
											{isLoadingUserData ? 'Loading...' : 'Edit Profile'}
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
								<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
									<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Information</h4>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
										<div>
											<span className="font-medium text-gray-600 dark:text-gray-400">Full Name:</span>
											<p className="text-gray-900 dark:text-gray-100">{profileData.fullName || 'Not set'}</p>
										</div>
										<div>
											<span className="font-medium text-gray-600 dark:text-gray-400">Username:</span>
											<p className="text-gray-900 dark:text-gray-100">{profileData.username || 'Not set'}</p>
										</div>
										<div>
											<span className="font-medium text-gray-600 dark:text-gray-400">Phone:</span>
											<p className="text-gray-900 dark:text-gray-100">{profileData.phone || 'Not set'}</p>
										</div>
										<div>
											<span className="font-medium text-gray-600 dark:text-gray-400">Email:</span>
											<p className="text-gray-900 dark:text-gray-100">{profileData.email || 'Not set'}</p>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
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
										<label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
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
										<label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
										<Input
											label=""
											type="email"
											value={profileData.email}
											disabled
											className="disabled:bg-gray-50 dark:disabled:bg-gray-800"
										/>
										<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
											Email changes require verification. Use the Email tab to update.
										</p>
									</div>

									<div className="space-y-2">
										<label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
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
								<LockClosedIcon className="w-6 h-6 text-(--text-secondary)" />
								<h2 className="text-xl font-semibold text-(--text-secondary)">Change Password</h2>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
								Update your password to keep your account secure.
							</p>
						</div>
						<div className="space-y-6">
							<div className="max-w-md space-y-4">
								<div className="space-y-2">
									<label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
									<div className="relative">
										<Input
											label=""
											type={showPasswords.current ? "text" : "password"}
											value={passwordData.currentPassword}
											onChange={(value) => setPasswordData({ ...passwordData, currentPassword: value })}
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
											onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
										>
											{showPasswords.current ? <EyeClosedIcon className="h-5 w-5" /> : <EyeOpenIcon className="h-5 w-5" />}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
									<div className="relative">
										<Input
											label=""
											type={showPasswords.new ? "text" : "password"}
											value={passwordData.newPassword}
											onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
											onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
										>
											{showPasswords.new ? <EyeClosedIcon className="h-5 w-5" /> : <EyeOpenIcon className="h-5 w-5" />}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
									<div className="relative">
										<Input
											label=""
											type={showPasswords.confirm ? "text" : "password"}
											value={passwordData.confirmPassword}
											onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
											onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
										>
											{showPasswords.confirm ? <EyeClosedIcon className="h-5 w-5" /> : <EyeOpenIcon className="h-5 w-5" />}
										</button>
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
								<GearIcon className="w-6 h-6 text-(--text-secondary)" />
								<h2 className="text-xl font-semibold text-(--text-secondary)">Appearance</h2>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
								Customize the appearance of your application.
							</p>
						</div>

						<div className="space-y-6">
							{/* Dark Mode Toggle */}
							<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ">
								<div className="flex items-center space-x-3">
									<div className="p-2  " style={{ backgroundColor: primaryColor + '20' }}>
										{isDarkMode ? (
											<SunIcon className="w-5 h-5" style={{ color: primaryColor }} />
										) : (
											<MoonIcon className="w-5 h-5" style={{ color: primaryColor }} />
										)}
									</div>
									<div>
										<h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Dark Mode</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
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

			</div>
		</div>
	);
}