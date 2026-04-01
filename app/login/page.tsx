'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Checkbox from '@/components/ui/Checkbox';
import ArtworkCarousel from '@/components/ui/ArtworkCarousel';
import PricingModal from '@/components/ui/PricingModal';
import LoginTopHeader from '@/components/ui/LoginTopHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useLoginMutation, useTeamMemberLoginMutation } from '@/store/services/authApi';
import { login as loginAction } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface ApiError {
	data?: {
		message?: string;
	};
	message?: string;
	error?: string;
	status?: number | string;
}

export default function LoginPage() {
	const router = useRouter();
	const dispatch = useDispatch();
	const authContext = useAuth();
	const [login] = useLoginMutation();
	const [teamMemberLogin] = useTeamMemberLoginMutation();
	const { isDarkMode } = useTheme();
	const { setUserPrivileges } = usePrivilege();
	const primaryColor = '#050711';
	// loginMethod is determined dynamically based on input value (email vs userId)
	// const [loginMethod, setLoginMethod] = useState<'email' | 'userId'>('email');
	const [formData, setFormData] = useState({
		emailOrUserId: '',
		password: '',
		rememberMe: false,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

	// Redirect authenticated users back to dashboard
	React.useEffect(() => {
		if (authContext.isAuthenticated && !authContext.isLoading && authContext.user) {
			const role = authContext.user.role;
			const roleName = (typeof role === 'object' && role !== null && 'roleName' in role)
				? (role as { roleName: string }).roleName
				: (typeof role === 'string' ? role : '');

			if (roleName.toLowerCase() === 'super admin' || roleName.toLowerCase() === 'superadmin') {
				router.push('/superadmin/dashboard');
			} else {
				router.push('/dashboard');
			}
		}
	}, [authContext.isAuthenticated, authContext.isLoading, authContext.user, router]);

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		const newErrors: Record<string, string> = {};

		if (!formData.emailOrUserId.trim()) {
			newErrors.emailOrUserId = 'Email or User ID is required';
		}

		if (!formData.password.trim()) {
			newErrors.password = 'Password is required';
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			try {
				// Determine if input is email or userId
				const isEmail = /\S+@\S+\.\S+/.test(formData.emailOrUserId);

				let response;

				if (isEmail) {
					response = await login({
						email: formData.emailOrUserId,
						password: formData.password,
					}).unwrap();
				} else {
					response = await teamMemberLogin({
						userId: formData.emailOrUserId,
						password: formData.password,
					}).unwrap();
				}

				// Based on the provided response structure:
				// For email login: { message: "...", user: { ...userFields, token: "..." } }
				// For userId login: { message: "...", teamMember: { ...userFields, token: "..." } }
				// The token is inside the user/teamMember object.

				const user = response.user || response.teamMember || response;
				const token = user?.token || response.token;

				if (user && token) {
					// Normalize user object - ALWAYS use _id for consistent linking
					const normalizedUser = {
						...user,
						id: user._id || user.id,
						isTeamMember: !!response.teamMember
					};

					// Login to Context for immediate sync - This now handles all storage
					authContext.login(normalizedUser, { accessToken: token });

					dispatch(loginAction({
						user: normalizedUser,
						tokens: { accessToken: token }
					}));

					// Update PrivilegeContext with the user's role and permissions
					if (normalizedUser.role && typeof normalizedUser.role === 'object') {
						const privileges = {
							userId: normalizedUser.id,
							roleId: normalizedUser.role.roleName,
							role: normalizedUser.role,
						};
						setUserPrivileges(privileges);
						localStorage.setItem('userPrivileges', JSON.stringify(privileges));
					}

					toast.success('Login successful!');

					// Check for Super Admin role
					const role = normalizedUser.role;
					const roleName = (typeof role === 'object' && role !== null && 'roleName' in role)
						? (role as { roleName: string }).roleName
						: (typeof role === 'string' ? role : '');

					if (roleName.toLowerCase() === 'super admin' || roleName.toLowerCase() === 'superadmin') {
						router.push('/superadmin/dashboard');
					} else {
						router.push('/dashboard');
					}
				}
			} catch (err: unknown) {
				// Enhanced error logging
				if (typeof err === 'object' && err !== null) {
					// const apiError = err as ApiError;
				}

				let errorMessage = 'Invalid email or password';

				if (err && typeof err === 'object') {
					const apiError = err as ApiError;
					// Handle RTK Query FetchBaseQueryError with data.message
					if ('data' in apiError && apiError.data?.message) {
						errorMessage = apiError.data.message;
					}
					// Handle RTK Query SerializedError or standard Error
					else if ('message' in apiError && apiError.message) {
						errorMessage = apiError.message;
					}
					// Handle RTK Query FetchBaseQueryError string error
					else if ('error' in apiError && typeof apiError.error === 'string') {
						errorMessage = apiError.error;
					}
				}

				toast.error(errorMessage);
				setIsLoading(false);
			}
		} else {
			setIsLoading(false);
		}
	};

	return (
		<div className="login-container">
			<LoginTopHeader
				plan="Free plan"
				primaryColor={primaryColor}
				onUpgradeClick={() => setIsPricingModalOpen(true)}
			/>

			{/* Left Side - Artwork Carousel */}
			<div className="login-image-section w-full md:w-1/2">
				<ArtworkCarousel autoPlayInterval={300000} />
			</div>
			{/* Right Side - Login Form */}
			<div className="login-form-section w-full md:w-1/4">

				<div className="login-form-container">
					<div className="login-header">
						<h1 className="welcome-title font-lato not-italic" style={{ color: isDarkMode ? '#F3F4F6' : primaryColor }}>Welcome People</h1>
						<p className="welcome-subtitle font-lato font-normal text-base leading-[150%] text-[#6D7280] dark:text-gray-400">Please Login to continue.</p>
					</div>

					<form onSubmit={handleSubmit} className="login-form">
						<Input
							label="Email or User ID"
							placeholder="Enter your email or user ID"
							type="text"
							value={formData.emailOrUserId}
							onChange={handleInputChange('emailOrUserId')}
							required
							error={errors.emailOrUserId}
						/>

						<PasswordInput
							label="Password"
							placeholder="Enter your password"
							value={formData.password}
							onChange={handleInputChange('password')}
							required
							error={errors.password}
							onHelpClick={() => {
								alert('Password Requirements:\n• At least 8 characters\n• Mix of letters and numbers\n• Special characters recommended');
							}}
						/>

						<div className="login-options">
							<Checkbox
								checked={formData.rememberMe}
								onChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked }))}
								label="Remember me"
								size="small"
							/>
							<a href="#" className="forgot-password" style={{ color: primaryColor }} onMouseEnter={(e) => {
								e.currentTarget.style.opacity = '0.8';
							}} onMouseLeave={(e) => {
								e.currentTarget.style.opacity = '1';
							}}>Forgot password?</a>
						</div>

						<Button
							type="submit"
							size="lg"
							loading={isLoading}
							className="flex items-center gap-2 px-2 !py-4 text-[10px] md:text-[12px] sm:px-4 sm:py-2"
						>
							Login
						</Button>

						<div className="signup-footer">
							<p className="signup-text">
								Don&apos;t have an account?{' '}
								<a href="/signup"
									className={`font-lato not-italic font-semibold text-[10px] md:text-[12px] leading-[150%] dark:text-gray-100 cursor-pointer `}
									style={{ color: 'var(--text-primary)' }}> Create account</a>
							</p>
						</div>
					</form>
				</div>
			</div>

			{/* Pricing Modal */}
			<PricingModal
				isOpen={isPricingModalOpen}
				onClose={() => setIsPricingModalOpen(false)}
				onSelectPlan={() => {
					// Handle plan selection
				}}
			/>
		</div>
	);
}
