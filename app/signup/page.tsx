'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import PasswordInput from '@/components/ui/PasswordInput';
import Checkbox from '@/components/ui/Checkbox';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import ArtworkCarousel from '@/components/ui/ArtworkCarousel';
import { toast } from 'sonner';
import { useRegisterMutation } from '@/store/services/authApi';
import { useCreateCompanyMutation } from '@/store/services/companyApi';

import { useDispatch } from 'react-redux';
import { setUser, register as registerAction } from '@/store/slices/authSlice';
import { useCampaign } from '@/contexts/CampaignContext';
import { Button } from '@/components/ui/Button';

export default function SignUpPage() {
	const { setSelectedCampaignId } = useCampaign();
	const router = useRouter();
	const dispatch = useDispatch();
	const { isDarkMode } = useTheme();
	const primaryColor = '#050711';
	const [register] = useRegisterMutation();
	const [createCompany] = useCreateCompanyMutation();
	const [formData, setFormData] = useState({
		firstname: '',
		lastname: '',
		username: '',
		companyname: '',
		companydescription: '',
		email: '',
		phone: '',
		password: '',
		confirmpassword: '',
		role: "admin",
		agreetoterms: false,
	});

	const [userId, setUserId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [step, setStep] = useState(1);

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const validateStep1 = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.firstname.trim()) {
			newErrors.firstname = 'First name is required';
		} else if (formData.firstname.trim().length < 2) {
			newErrors.firstname = 'First name must be at least 2 characters';
		}

		if (!formData.lastname.trim()) {
			newErrors.lastname = 'Last name is required';
		} else if (formData.lastname.trim().length < 2) {
			newErrors.lastname = 'Last name must be at least 2 characters';
		}

		if (!formData.username.trim()) {
			newErrors.username = 'Username is required';
		} else if (formData.username.trim().length < 3) {
			newErrors.username = 'Username must be at least 3 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateStep1()) {
			setStep(2);
		}
	};

	const handleBack = () => {
		setStep(step - 1);
	};

	const handleUserRegistration = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		const newErrors: Record<string, string> = {};

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email';
		}

		if (!formData.phone.trim()) {
			newErrors.phone = 'Phone number is required';
		}

		if (!formData.password.trim()) {
			newErrors.password = 'Password is required';
		} else if (formData.password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters';
		}

		if (!formData.confirmpassword.trim()) {
			newErrors.confirmpassword = 'Please confirm your password';
		} else if (formData.password !== formData.confirmpassword) {
			newErrors.confirmpassword = 'Passwords do not match';
		}

		if (!formData.agreetoterms) {
			newErrors.agreetoterms = 'You must agree to the terms and conditions';
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			setIsLoading(true);
			try {
				const payload = {
					firstName: formData.firstname,
					lastName: formData.lastname,
					username: formData.username,
					email: formData.email,
					password: formData.password,
					role: formData.role,
					phone: formData.phone,
					agreeToTerms: formData.agreetoterms,
				};

				const response = await register(payload).unwrap();

				if (response.user && (response.user.id || response.user._id)) {
					// Normalize user object
					const normalizedUser = {
						...response.user,
						id: response.user.id || response.user._id
					};

					// Store user and token in Redux using register action for atomic update
					if (response.token) {
						dispatch(registerAction({
							user: normalizedUser,
							tokens: { accessToken: response.token }
						}));
						localStorage.setItem('peoplely-token', response.token);
						localStorage.setItem('peoplely-user', JSON.stringify(normalizedUser));
					} else {
						// Fallback if no token (shouldn't happen for successful auth)
						dispatch(setUser(normalizedUser));
						localStorage.setItem('peoplely-user', JSON.stringify(normalizedUser));
					}

					setUserId(normalizedUser.id);
					toast.success('Account created successfully! Please verify company details.');
					setStep(3);
				} else {
					toast.error('Account created but user ID is missing.');
				}
			} catch (err: unknown) {
				toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to create account');
			} finally {
				setIsLoading(false);
			}
		} else {
			setIsLoading(false);
		}
	};

	const handleCompanyCreation = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.companyname.trim()) {
			setErrors({ companyname: 'Company name is required' });
			return;
		}

		if (!userId) {
			toast.error('User ID is missing. Please restart registration.');
			return;
		}

		setIsLoading(true);
		try {
			const payload = {
				companyName: formData.companyname,
				description: formData.companydescription,
				userId: userId,
			};

			await createCompany(payload).unwrap();
			toast.success('Company profile created successfully!');
			setSelectedCampaignId('new');
			localStorage.removeItem('peoplely-setup-data');
			router.push('/signup/success');
		} catch (err: unknown) {
			toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to create company profile');
		} finally {
			setIsLoading(false);
		}
	};

	const getSubmitHandler = (e: React.FormEvent) => {
		if (step === 1) return handleNext(e);
		if (step === 2) return handleUserRegistration(e);
		if (step === 3) return handleCompanyCreation(e);
	};

	return (
		<div className="login-container h-screen">
			{/* Left Side - Image */}
			<div className="login-image-section w-full md:w-1/2">
				<ArtworkCarousel autoPlayInterval={300000} />
			</div>

			{/* Right Side - Sign Up Form */}
			<div className="login-form-section w-full md:w-1/2">
				<div className="login-form-container max-h-[720px] overflow-y-auto no-scrollbar pr-2">
					<div className="login-header">
						<h1 className="welcome-title font-lato not-italic" style={{ color: isDarkMode ? '#F3F4F6' : primaryColor }}>
							{step === 3 ? 'Company Details' : 'Create Account'}
						</h1>
						<p className="font-lato not-italic font-normal text-base leading-[150%] text-[#6D7280] dark:text-gray-400">
							{step === 3 ? 'Tell us more about your company.' : 'Join Peoplely CRM to get started.'}
						</p>
					</div>

					<form onSubmit={getSubmitHandler} className="login-form" noValidate>
						{step === 1 && (
							<div className="space-y-4 ">
								<Input
									label="First Name"
									name="firstname"
									id="firstname"
									placeholder="Enter first name"
									value={formData.firstname}
									onChange={handleInputChange('firstname')}
									required
									error={errors.firstname}
									autoComplete="given-name"
								/>
								<Input
									label="Last Name"
									name="lastname"
									id="lastname"
									placeholder="Enter last name"
									value={formData.lastname}
									onChange={handleInputChange('lastname')}
									required
									error={errors.lastname}
									autoComplete="family-name"
								/>

								<Input
									label="Username"
									name="username"
									id="username"
									placeholder="Enter username"
									value={formData.username}
									onChange={handleInputChange('username')}
									required
									error={errors.username}
									autoComplete="username"
								/>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-4">
								<Input
									label="Email Address"
									name="email"
									id="email"
									placeholder="you@company.com"
									type="email"
									value={formData.email}
									onChange={handleInputChange('email')}
									required
									error={errors.email}
									autoComplete="email"
								/>

								<Input
									label="Phone Number"
									name="phone"
									id="phone"
									placeholder="Enter phone number"
									type="tel"
									value={formData.phone}
									onChange={handleInputChange('phone')}
									required
									error={errors.phone}
									autoComplete="tel"
								/>

								<PasswordInput
									label="Password"
									name="password"
									id="password"
									placeholder="Create a password"
									value={formData.password}
									onChange={handleInputChange('password')}
									required
									error={errors.password}
									autoComplete="new-password"
									onHelpClick={() => {
										toast('Password Requirements:\n• At least 8 characters\n• Mix of letters and numbers\n• Special characters recommended\n• Avoid common words');
									}}
								/>

								<PasswordInput
									label="Confirm Password"
									name="confirmpassword"
									id="confirmpassword"
									placeholder="Confirm your password"
									value={formData.confirmpassword}
									onChange={handleInputChange('confirmpassword')}
									required
									error={errors.confirmpassword}
									showHelpIcon={false}
									autoComplete="new-password"
								/>
							</div>
						)}

						{step === 2 && (
							<div className="terms-container mb-4">
								<div className="terms-checkbox flex items-center gap-2">
									<Checkbox
										id="agreetoterms"
										checked={formData.agreetoterms}
										onChange={(checked) => setFormData(prev => ({ ...prev, agreetoterms: checked }))}
										size="small"
									/>
									<span className="text-[10px] md:text-[12px] text-gray-600 dark:text-gray-400">
										I agree to the Terms of Service and Privacy Policy
									</span>
								</div>
								{errors.agreetoterms && (
									<span className="terms-error text-red-500 text-[10px] md:text-[12px] mt-1 block">{errors.agreetoterms}</span>
								)}
							</div>
						)}

						{step === 3 && (
							<>
								<Input
									label="Company Name"
									name="companyname"
									id="companyname_step3"
									placeholder="Enter company name"
									value={formData.companyname}
									onChange={handleInputChange('companyname')}
									required
									error={errors.companyname}
								/>

								<Textarea
									label="Company Description"
									name="companydescription"
									placeholder="Describe your company"
									value={formData.companydescription}
									onChange={handleInputChange('companydescription')}
									rows={4}
								/>
							</>
						)}

						<div style={{ display: 'flex', gap: '10px' }} className="flex flex-row justify-between items-center">
							{step === 2 && (
								<Button
									type="button"
									variant="outline"
									onClick={handleBack}
									className="flex items-center gap-2 px-2 !py-4 text-[10px] md:text-[12px] sm:px-4 sm:py-2"
									disabled={isLoading}
								>
									Back
								</Button>
							)}
							<Button
								type="submit"
								loading={isLoading}
								style={{ flex: 1 }}
								className="flex items-center gap-2 px-2 !py-4 text-[10px] md:text-[12px] sm:px-4 sm:py-2"
							>
								{step === 1 ? 'Next' : (
									step === 2 ? (isLoading ? 'Creating Account...' : 'Create Account') :
										(isLoading ? 'Creating Company...' : 'Finish Setup')
								)}
							</Button>
						</div>

						<div className="signup-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
							<p className="signup-text" style={{ color: '#6D7280', fontSize: '14px' }}>
								Already have an account?{' '}
								<a
									href="/login"
									className={`font-lato not-italic font-semibold text-[10px] md:text-[12px] leading-[150%] dark:text-gray-100 cursor-pointer `}
									style={{ color: 'var(--text-primary)' }}
								>
									Login
								</a>
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
