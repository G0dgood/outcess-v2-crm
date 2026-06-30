'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Checkbox from '@/components/ui/Checkbox';
import Image from 'next/image';
import LoginTopHeader from '@/components/ui/LoginTopHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { usePrivilege, RoleModulePermission, UserPrivileges } from '@/contexts/PrivilegeContext';
import { useLoginMutation, useTeamMemberLoginMutation, LoginResponse } from '@/store/services/authApi';
import { login as loginAction } from '@/store/slices/authSlice';
import { useApiError } from '@/hooks/useApiError';
import { Button } from '@/components/ui/Button';
import { useAuth, User as AuthUser } from '@/contexts/AuthContext';
import ReactivationRequestModal from '@/components/ui/ReactivationRequestModal';
import { useRequestReactivationMutation } from '@/store/services/authApi';
import PasswordHelpModal from '@/components/ui/PasswordHelpModal';

interface ApiError {
	data?: {
		message?: string;
		status?: string;
		deactivationReason?: string;
	};
	message?: string;
	error?: string;
	status?: number | string;
}

interface RawUser extends Partial<AuthUser> {
	_id: string;
	id?: string;
	email?: string;
	name?: string;
	token?: string;
}

export default function LoginPage() {
	const router = useRouter();
	const dispatch = useDispatch();
	const authContext = useAuth();
	const [login, { isError: isLoginError, error: loginError }] = useLoginMutation();
	const [teamMemberLogin, { isError: isTmError, error: tmError }] = useTeamMemberLoginMutation();

	// Filter out the 403 deactivated / pending reactivation states so they don't trigger toast alerts
	const shouldShowLoginError = isLoginError && !(
		loginError && 
		typeof loginError === 'object' && 
		'status' in loginError && 
		(loginError as ApiError).status === 403
	);

	const shouldShowTmError = isTmError && !(
		tmError && 
		typeof tmError === 'object' && 
		'status' in tmError && 
		(tmError as ApiError).status === 403
	);

	useApiError(shouldShowLoginError, loginError, 'Invalid email or password');
	useApiError(shouldShowTmError, tmError, 'Invalid email or password');
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
	const [isDeactivatedModalOpen, setIsDeactivatedModalOpen] = useState(false);
	const [deactivatedEmail, setDeactivatedEmail] = useState('');
	const [deactivationReason, setDeactivationReason] = useState('');
	const [requestReactivation, { isLoading: isRequestingReactivation, isError: isReactError, error: reactError }] = useRequestReactivationMutation();

	useApiError(isReactError, reactError, 'Failed to send reactivation request');
	const [isPasswordHelpModalOpen, setIsPasswordHelpModalOpen] = useState(false);

	// Set browser tab title
	React.useEffect(() => {
		if (typeof document !== 'undefined') {
			document.title = 'Login | Outcess CRM';
		}
	}, []);

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
				const isEmail = /\S+@\S+\.\S+/.test(formData.emailOrUserId);

				let response: LoginResponse;

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

				const rawUser = (response.user || response.teamMember || response) as RawUser;
				const token = rawUser?.token || response.token;

				if (rawUser && token) {
					// Normalize user object - ALWAYS use _id for consistent linking
					const normalizedUser: AuthUser = {
						...rawUser,
						_id: rawUser._id,
						id: rawUser._id || rawUser.id || '',
						email: rawUser.email || '',
						name: rawUser.name || (rawUser.firstName && rawUser.lastName ? `${rawUser.firstName} ${rawUser.lastName}` : ''),
						isTeamMember: !!response.teamMember
					};

					// Login to Context for immediate sync - This now handles all storage
					authContext.login(normalizedUser, { accessToken: token });

					dispatch(loginAction({
						user: normalizedUser as unknown as import('@/store/slices/authSlice').User,
						tokens: { accessToken: token }
					}));

					// Update PrivilegeContext with the user's role and permissions
					if (normalizedUser.role && typeof normalizedUser.role === 'object') {
						const roleObj = normalizedUser.role as { _id?: string; id?: string; roleName: string; permissions: RoleModulePermission[] };
						const privileges: UserPrivileges = {
							userId: normalizedUser.id,
							roleId: roleObj._id || roleObj.id || roleObj.roleName,
							role: {
								...roleObj,
								roleName: roleObj.roleName,
								permissions: roleObj.permissions as RoleModulePermission[]
							},
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
				console.error('Login error:', err);

				if (err && typeof err === 'object') {
					const apiError = err as ApiError;

					// Handle Account Deactivated
					if (apiError.status === 403 && apiError.data?.status === 'deactivated') {
						setDeactivatedEmail(formData.emailOrUserId);
						setDeactivationReason(apiError.data.deactivationReason || '');
						setIsDeactivatedModalOpen(true);
						setIsLoading(false);
						return;
					}

					// Handle Pending Reactivation
					if (apiError.status === 403 && apiError.data?.status === 'pending_reactivation') {
						toast.error(apiError.data.message || 'Reactivation request is under review.');
						setIsLoading(false);
						return;
					}
				}

				setIsLoading(false);
			}
		} else {
			setIsLoading(false);
		}
	};


	const handleReactivationConfirm = async (reason: string) => {
		try {
			await requestReactivation({
				email: deactivatedEmail,
				reason,
			}).unwrap();
			toast.success('Reactivation request sent successfully!');
			setIsDeactivatedModalOpen(false);
		} catch (error: unknown) {
			// useApiError hook handles the error UI reactively
		}
	};

	return (
		<div className="login-container">
			<LoginTopHeader />

			{/* Left Side - Image Section */}
			<div className="login-image-section w-full md:w-1/2 relative">
				<Image
					src="/image/loginImage.png"
					alt="Outcess CRM"
					fill
					priority
					style={{ objectFit: 'cover' }}
				/>
			</div>
			{/* Right Side - Login Form */}
			<div className="login-form-section w-full md:w-1/4">

				<div className="login-form-container">
					<div className="login-header">
						<h1 className="welcome-title font-lato not-italic" style={{ color: isDarkMode ? '#F3F4F6' : primaryColor }}>Welcome Aboard</h1>
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
							onHelpClick={() => setIsPasswordHelpModalOpen(true)}
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
							className="flex items-center gap-2 px-2 py-4! text-[10px] md:text-[12px] sm:px-4 sm:py-2"
						>
							Login
						</Button>

						<div className="signup-footer">
							<p className="signup-text">
								Don&apos;t have an account?{' '}
								<a href="/signup"
									className={`font-lato not-italic font-semibold text-[10px] md:text-[12px] leading-[150%] dark:text-gray-100 cursor-pointer `}
									style={{ color: 'var(--text-primary)' }}>Create account</a>
							</p>
						</div>
					</form>
				</div>
			</div>

			<ReactivationRequestModal
				isOpen={isDeactivatedModalOpen}
				onClose={() => setIsDeactivatedModalOpen(false)}
				onConfirm={handleReactivationConfirm}
				email={deactivatedEmail}
				deactivationReason={deactivationReason}
				isLoading={isRequestingReactivation}
			/>

			<PasswordHelpModal
				isOpen={isPasswordHelpModalOpen}
				onClose={() => setIsPasswordHelpModalOpen(false)}
			/>
		</div>
	);
}
