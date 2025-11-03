'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
		agreeToTerms: false,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }));
		if (errors.agreeToTerms) {
			setErrors(prev => ({ ...prev, agreeToTerms: '' }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		const newErrors: Record<string, string> = {};

		if (!formData.firstName.trim()) {
			newErrors.firstName = 'First name is required';
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = 'Last name is required';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email';
		}

		if (!formData.password.trim()) {
			newErrors.password = 'Password is required';
		} else if (formData.password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters';
		}

		if (!formData.confirmPassword.trim()) {
			newErrors.confirmPassword = 'Please confirm your password';
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}

		if (!formData.agreeToTerms) {
			newErrors.agreeToTerms = 'You must agree to the terms and conditions';
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			// Simulate sign-up API call
			setTimeout(() => {
				console.log('Sign-up successful:', formData);
				setIsLoading(false);
				router.push('/setup');
			}, 1500);
		} else {
			setIsLoading(false);
		}
	};

	return (
		<div className="login-container">
			{/* Left Side - Image */}
			<div className="login-image-section">

			</div>

			{/* Right Side - Sign Up Form */}
			<div className="login-form-section">
				<div className="login-form-container">
					<div className="login-header">
						<div className="logo-container">
							<Image
								src="/peoplely-logo.svg"
								alt="Peoplely Logo"
								width={120}
								height={40}
								priority
							// className="logo"
							/>
						</div>
						<h1 className="welcome-title">Create Account</h1>
						<p className="font-lato not-italic font-normal text-base leading-[150%] text-[#6D7280]">Join Peoplely CRM to get started.</p>
					</div>

					<form onSubmit={handleSubmit} className="login-form">
						<div className="name-fields">
							<Input
								label="First Name"
								placeholder="Enter first name"
								value={formData.firstName}
								onChange={handleInputChange('firstName')}
								required
								error={errors.firstName}
							/>
							<Input
								label="Last Name"
								placeholder="Enter last name"
								value={formData.lastName}
								onChange={handleInputChange('lastName')}
								required
								error={errors.lastName}
							/>
						</div>

						<Input
							label="Email Address"
							placeholder="you@company.com"
							type="email"
							value={formData.email}
							onChange={handleInputChange('email')}
							required
							error={errors.email}
						/>

						<PasswordInput
							label="Password"
							placeholder="Create a password"
							value={formData.password}
							onChange={handleInputChange('password')}
							required
							error={errors.password}
							onHelpClick={() => {
								alert('Password Requirements:\n• At least 8 characters\n• Mix of letters and numbers\n• Special characters recommended\n• Avoid common words');
							}}
						/>

						<PasswordInput
							label="Confirm Password"
							placeholder="Confirm your password"
							value={formData.confirmPassword}
							onChange={handleInputChange('confirmPassword')}
							required
							error={errors.confirmPassword}
							showHelpIcon={false}
						/>

						<div className="terms-container">
							<label className="terms-checkbox">
								<input
									type="checkbox"
									checked={formData.agreeToTerms}
									onChange={handleCheckboxChange}
								/>
								<span className="checkbox-label">
									I agree to the{' '}
									<a href="#" className="terms-link">Terms of Service</a>
									{' '}and{' '}
									<a href="#" className="terms-link">Privacy Policy</a>
								</span>
							</label>
							{errors.agreeToTerms && (
								<span className="terms-error">{errors.agreeToTerms}</span>
							)}
						</div>

						<button
							type="submit"
							className={`login-button ${isLoading ? 'loading' : ''}`}
							disabled={isLoading}
						>
							{isLoading ? 'Creating Account...' : 'Create Account'}
						</button>

						<div className="signup-footer">
							<p className="signup-text">
								Already have an account?{' '}
								<a href="/login" className="signup-link">Sign in</a>
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
