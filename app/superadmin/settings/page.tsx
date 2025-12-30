"use client";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateUserMutation, useChangePasswordMutation } from "@/store/services/authApi";
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
import { useLineOfBusiness } from "@/contexts/LineOfBusinessContext";

interface ExtendedUser {
	firstName?: string;
	lastName?: string;
	username?: string;
	[key: string]: unknown;
}

interface ApiError {
	data?: {
		message?: string;
	};
	message?: string;
}

interface CreditCardInfo {
	id: string;
	last4: string;
	brand: string;
	expiryMonth: number;
	expiryYear: number;
	isDefault: boolean;
}

export default function SettingsPage() {
	const { user, updateUser: updateContextUser } = useAuth();
	const [updateUserApi] = useUpdateUserMutation();
	const [changePasswordApi] = useChangePasswordMutation();

	const { lineOfBusinessData } = useLineOfBusiness();
	const { isDarkMode, toggleTheme } = useTheme();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const secondaryColor = lineOfBusinessData?.secondaryColor || '#6C8B7D';

	const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'email' | 'payment' | 'preferences'>('profile');

	// Loading states
	const [isProfileLoading, setIsProfileLoading] = useState(false);
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);
	const [isLoadingUserData, setIsLoadingUserData] = useState(true);

	// Profile section
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [profileData, setProfileData] = useState({
		fullName: '',
		username: '',
		phone: '',
		email: '',
	});

	// Fetch user data on component mount
	useEffect(() => {
		if (user) {
			setProfileData({
				fullName: user.name || `${(user as ExtendedUser).firstName || ''} ${(user as ExtendedUser).lastName || ''}`.trim(),
				username: (user as ExtendedUser).username || '',
				phone: user.phone || '',
				email: user.email || '',
			});
			setIsLoadingUserData(false);
		}
	}, [user]);


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
		if (!user?.id) {
			toast.error("User not found");
			return;
		}

		setIsProfileLoading(true);
		try {

			// Split full name into first and last name
			const nameParts = profileData.fullName.trim().split(/\s+/);
			const firstName = nameParts[0];
			const lastName = nameParts.slice(1).join(' ');

			const updateData = {
				firstName,
				lastName,
				username: profileData.username,
				phone: profileData.phone,
			};

			await updateUserApi({
				id: user.id,
				data: updateData
			}).unwrap();


			toast.success('Profile updated successfully!');
			setIsEditingProfile(false);

			// Update local context
			updateContextUser({
				...user,
				name: profileData.fullName,
				username: profileData.username,
				phone: profileData.phone,
				firstName,
				lastName
			});

		} catch (err: unknown) {
			const error = err as ApiError;
			console.error('Error updating profile:', error);
			toast.error(error?.data?.message || 'Failed to update profile. Please try again.');
		} finally {
			setIsProfileLoading(false);
		}
	};

	const handleProfileCancel = () => {
		// Reset to original values from auth context
		if (user) {
			setProfileData({
				fullName: user.name || `${(user as ExtendedUser).firstName || ''} ${(user as ExtendedUser).lastName || ''}`.trim(),
				username: (user as ExtendedUser).username || '',
				phone: user.phone || '',
				email: user.email || '',
			});
		}
		setIsEditingProfile(false);
	};

	const handlePasswordChange = async () => {
		if (!user?.id) {
			toast.error("User not found");
			return;
		}

		setIsPasswordLoading(true);
		try {
			// Validate passwords match
			if (passwordData.newPassword !== passwordData.confirmPassword) {
				toast.error('New passwords do not match');
				return;
			}

			if (passwordData.newPassword.length < 6) {
				toast.error('Password must be at least 6 characters long');
				return;
			}

			await changePasswordApi({
				userId: user.id,
				oldPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword
			}).unwrap();

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

		} catch (err: unknown) {
			const error = err as ApiError;
			console.error('Error updating password:', error);
			toast.error(error?.data?.message || 'Failed to update password. Please try again.');
		} finally {
			setIsPasswordLoading(false);
		}
	};

	// const handleEmailChange = () => {
	// 	// TODO: Implement email change functionality
	// 	setIsEmailVerifying(true);
	// 	// Add toast notification here
	// };

	const handleAddCreditCard = () => {
		// TODO: Implement add credit card functionality with payment processor
		const newCard: CreditCardInfo = {
			id: Date.now().toString(),
			last4: newCardData.cardNumber.slice(-4),
			brand: newCardData.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
			expiryMonth: parseInt(newCardData.expiryMonth),
			expiryYear: parseInt(newCardData.expiryYear),
			isDefault: creditCards.length === 0,
		};
		setCreditCards([...creditCards, newCard]);
		setIsAddingCard(false);
		setNewCardData({
			cardNumber: '',
			expiryMonth: '',
			expiryYear: '',
			cvv: '',
			cardholderName: '',
			zipCode: '',
		});
		toast.success('Credit card added successfully!');
	};

	const handleRemoveCard = (cardId: string) => {
		setCreditCards(creditCards.filter(card => card.id !== cardId));
		toast.success('Credit card removed successfully!');
	};

	const handleSetDefaultCard = (cardId: string) => {
		setCreditCards(creditCards.map(card => ({
			...card,
			isDefault: card.id === cardId
		})));
		toast.success('Default payment method updated!');
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
						className="text-lg font-medium"
						style={{ color: 'var(--text-secondary)' }}
					>
						Profile Details
					</h3>
					<Skeleton className="h-10 w-24" />
				</div>

				{/* Current info skeleton */}
				<div
					className="p-4"
					style={{ backgroundColor: 'var(--bg-primary)' }}
				>
					<h4
						className="text-sm font-medium mb-3"
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
							{ id: 'payment', label: 'Payment', icon: IdCardIcon },
							{ id: 'preferences', label: 'Preferences', icon: GearIcon },
						].map(({ id, label, icon: IconComponent }) => {
							const isActive = activeSection === id;
							const activeColor = isDarkMode ? '#F3F4F6' : (primaryColor || '#050711');
							const inactiveColor = isDarkMode ? '#9CA3AF' : 'var(--text-tertiary)';
							return (
								<button
									key={id}
									onClick={() => setActiveSection(id as 'profile' | 'password' | 'email' | 'payment' | 'preferences')}
									className={`relative flex items-center space-x-2 py-3 px-4 font-medium text-sm transition-all duration-200 ${isActive ? '' : 'dark:text-gray-400 dark:hover:text-gray-300'
										}`}
									style={{
										color: isActive ? activeColor : inactiveColor,
									}}
									onMouseEnter={(e) => {
										if (!isActive) {
											e.currentTarget.style.color = isDarkMode ? '#D1D5DB' : (secondaryColor || '#6C8B7D');
										}
									}}
									onMouseLeave={(e) => {
										if (!isActive) {
											e.currentTarget.style.color = inactiveColor;
										}
									}}
								>
									<IconComponent className="h-4 w-4 transition-colors" />
									<span>{label}</span>
									{isActive && (
										<span
											className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
											style={{ backgroundColor: activeColor }}
										/>
									)}
								</button>
							);
						})}
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
									<PersonIcon
										className="w-6 h-6 dark:text-gray-400"
										style={{ color: 'var(--text-secondary)' }}
									/>
									<h2
										className="text-xl font-semibold dark:text-gray-100"
										style={{ color: 'var(--text-secondary)' }}
									>
										Personal Information
									</h2>
								</div>
								<p
									className="text-sm dark:text-gray-400 ml-8"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Update your personal details and contact information.
								</p>
							</div>
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h3
										className="text-lg font-medium dark:text-gray-100"
										style={{ color: 'var(--text-secondary)' }}
									>
										Profile Details
									</h3>
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
												variant="outline"
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
									className="dark:bg-gray-700/50 p-4"
									style={{ backgroundColor: 'var(--bg-primary)' }}
								>
									<h4
										className="text-sm font-medium dark:text-gray-300 mb-3"
										style={{ color: 'var(--text-secondary)' }}
									>
										Current Information
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
											className="text-sm font-medium dark:text-gray-300"
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
											className="text-sm font-medium dark:text-gray-300"
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
											className="text-sm font-medium dark:text-gray-300"
											style={{ color: 'var(--text-secondary)' }}
										>
											Email Address
										</label>
										<Input
											label=""
											type="email"
											value={profileData.email}
											disabled
											className="disabled:bg-gray-50"
										/>
										<p
											className="text-sm dark:text-gray-400 mt-1"
											style={{ color: 'var(--text-tertiary)' }}
										>
											Email changes require verification. Use the Email tab to update.
										</p>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="phone"
											className="text-sm font-medium dark:text-gray-300"
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
									className="w-6 h-6 dark:text-gray-400"
									style={{ color: 'var(--text-secondary)' }}
								/>
								<h2
									className="text-xl font-semibold dark:text-gray-100"
									style={{ color: 'var(--text-secondary)' }}
								>
									Change Password
								</h2>
							</div>
							<p
								className="text-sm dark:text-gray-400 ml-8"
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
										className="text-sm font-medium dark:text-gray-300"
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
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
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
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="newPassword"
										className="text-sm font-medium dark:text-gray-300"
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
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
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
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="confirmPassword"
										className="text-sm font-medium dark:text-gray-300"
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
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
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

				{/* Email Section */}
				{/* {activeSection === 'email' && (
					<Card className="py-6">
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Mail className="h-5 w-5" />
								<span>Change Email Address</span>
							</CardTitle>
							<CardDescription>
								Update your email address. You&apos;ll need to verify the new email.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="max-w-md space-y-4">
								<div className="space-y-2">
									<Label htmlFor="currentEmail">Current Email</Label>
									<Input
										id="currentEmail"
										type="email"
										value={user?.email || ''}
										disabled
										className="disabled:bg-gray-50"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="newEmail">New Email Address</Label>
									<Input
										id="newEmail"
										type="email"
										value={emailData.newEmail}
										onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
										placeholder="Enter new email address"
									/>
								</div>

								{isEmailVerifying && (
									<div className="space-y-2">
										<Label htmlFor="verificationCode">Verification Code</Label>
										<Input
											id="verificationCode"
											type="text"
											value={emailData.verificationCode}
											onChange={(e) => setEmailData({ ...emailData, verificationCode: e.target.value })}
											placeholder="Enter verification code"
										/>
										<p className="text-sm text-gray-500">
											We&apos;ve sent a verification code to your new email address.
										</p>
									</div>
								)}

								<Button
									onClick={handleEmailChange}
									className="bg-yellow-400 hover:bg-yellow-500 text-black"
									disabled={!emailData.newEmail || (isEmailVerifying && !emailData.verificationCode)}
								>
									{isEmailVerifying ? 'Verify Email' : 'Send Verification Code'}
								</Button>
							</div>
						</CardContent>
					</Card>
				)} */}

				{/* Payment Section */}
				{activeSection === 'payment' && (
					<div className="py-6">
						<div className="mb-6">
							<div className="flex items-center space-x-2 mb-2">
								<IdCardIcon
									className="w-6 h-6 dark:text-gray-400"
									style={{ color: 'var(--text-secondary)' }}
								/>
								<h2
									className="text-xl font-semibold dark:text-gray-100"
									style={{ color: 'var(--text-secondary)' }}
								>
									Payment Methods
								</h2>
							</div>
							<p
								className="text-sm dark:text-gray-400 ml-8"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Manage your credit cards and payment methods.
							</p>
						</div>
						<div className="space-y-6">
							{/* Existing Credit Cards */}
							<div className="space-y-4">
								<h3
									className="text-lg font-medium dark:text-gray-100"
									style={{ color: 'var(--text-secondary)' }}
								>
									Saved Payment Methods
								</h3>
								{creditCards.map((card) => (
									<div
										key={card.id}
										className="flex items-center justify-between p-4 border dark:border-gray-700 dark:bg-gray-700/50"
										style={{
											backgroundColor: 'var(--accent-white)',
											borderColor: 'var(--light-gray)'
										}}
									>
										<div className="flex items-center space-x-4">
											<IdCardIcon
												className="h-8 w-8 dark:text-gray-500"
												style={{ color: 'var(--text-tertiary)' }}
											/>
											<div>
												<div className="flex items-center space-x-2">
													<span
														className="font-medium dark:text-gray-100"
														style={{ color: 'var(--text-secondary)' }}
													>
														{card.brand} •••• {card.last4}
													</span>
													{card.isDefault && (
														<span
															className="text-xs px-2 py-1 rounded-full text-white"
															style={{ backgroundColor: primaryColor }}
														>
															Default
														</span>
													)}
												</div>
												<p
													className="text-sm dark:text-gray-400"
													style={{ color: 'var(--text-tertiary)' }}
												>
													Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											{!card.isDefault && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleSetDefaultCard(card.id)}
													style={{
														borderColor: primaryColor,
														color: primaryColor,
													}}
												>
													Set as Default
												</Button>
											)}
											<Button
												variant="danger"
												size="sm"
												onClick={() => handleRemoveCard(card.id)}
											>
												Remove
											</Button>
										</div>
									</div>
								))}
							</div>

							<Separator />

							{/* Add New Credit Card */}
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<h3
										className="text-lg font-medium dark:text-gray-100"
										style={{ color: 'var(--text-secondary)' }}
									>
										Add New Payment Method
									</h3>
									<Button
										variant="outline"
										onClick={() => setIsAddingCard(!isAddingCard)}
										style={{
											borderColor: primaryColor,
											color: primaryColor,
										}}
									>
										{isAddingCard ? 'Cancel' : 'Add Card'}
									</Button>
								</div>

								{isAddingCard && (
									<div
										className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border dark:border-gray-700 rounded-lg dark:bg-gray-700/50"
										style={{
											backgroundColor: 'var(--bg-primary)',
											borderColor: 'var(--light-gray)'
										}}
									>
										<div className="md:col-span-2 space-y-2">
											<label
												htmlFor="cardNumber"
												className="text-sm font-medium dark:text-gray-300"
												style={{ color: 'var(--text-secondary)' }}
											>
												Card Number
											</label>
											<Input
												label=""
												type="text"
												value={newCardData.cardNumber}
												onChange={(value) => setNewCardData({ ...newCardData, cardNumber: value })}
												placeholder="1234 5678 9012 3456"
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="cardholderName"
												className="text-sm font-medium dark:text-gray-300"
												style={{ color: 'var(--text-secondary)' }}
											>
												Cardholder Name
											</label>
											<Input
												label=""
												type="text"
												value={newCardData.cardholderName}
												onChange={(value) => setNewCardData({ ...newCardData, cardholderName: value })}
												placeholder="John Doe"
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="zipCode"
												className="text-sm font-medium dark:text-gray-300"
												style={{ color: 'var(--text-secondary)' }}
											>
												ZIP Code
											</label>
											<Input
												label=""
												type="text"
												value={newCardData.zipCode}
												onChange={(value) => setNewCardData({ ...newCardData, zipCode: value })}
												placeholder="12345"
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="expiryMonth"
												className="text-sm font-medium dark:text-gray-300"
												style={{ color: 'var(--text-secondary)' }}
											>
												Expiry Month
											</label>
											<Input
												label=""
												type="text"
												value={newCardData.expiryMonth}
												onChange={(value) => setNewCardData({ ...newCardData, expiryMonth: value })}
												placeholder="MM"
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="expiryYear"
												className="text-sm font-medium dark:text-gray-300"
												style={{ color: 'var(--text-secondary)' }}
											>
												Expiry Year
											</label>
											<Input
												label=""
												type="text"
												value={newCardData.expiryYear}
												onChange={(value) => setNewCardData({ ...newCardData, expiryYear: value })}
												placeholder="YYYY"
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="cvv"
												className="text-sm font-medium dark:text-gray-300"
												style={{ color: 'var(--text-secondary)' }}
											>
												CVV
											</label>
											<Input
												label=""
												type="text"
												value={newCardData.cvv}
												onChange={(value) => setNewCardData({ ...newCardData, cvv: value })}
												placeholder="123"
											/>
										</div>

										<div className="md:col-span-2">
											<Button
												onClick={handleAddCreditCard}
												style={{ backgroundColor: primaryColor }}
												disabled={
													!newCardData.cardNumber ||
													!newCardData.cardholderName ||
													!newCardData.expiryMonth ||
													!newCardData.expiryYear ||
													!newCardData.cvv ||
													!newCardData.zipCode
												}
											>
												Add Payment Method
											</Button>
										</div>
									</div>
								)}
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
									className="w-6 h-6 dark:text-gray-400"
									style={{ color: 'var(--text-secondary)' }}
								/>
								<h2
									className="text-xl font-semibold dark:text-gray-100"
									style={{ color: 'var(--text-secondary)' }}
								>
									Appearance
								</h2>
							</div>
							<p
								className="text-sm dark:text-gray-400 ml-8"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Customize the appearance of your application.
							</p>
						</div>

						<div className="space-y-6">
							{/* Dark Mode Toggle */}
							<div
								className="flex items-center justify-between p-4 dark:bg-gray-700/50 border dark:border-gray-700"
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
											className="text-sm dark:text-gray-400"
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
			</div>
		</div>
	);
}
