'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Checkbox from '@/components/ui/Checkbox';
import Image from 'next/image';
import ArtworkCarousel from '@/components/ui/ArtworkCarousel';
import PricingModal from '@/components/ui/PricingModal';
import { PersonIcon } from '@radix-ui/react-icons';
import { useSetup } from '@/contexts/SetupContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginPage() {
	const { setupData } = useSetup();
	const { isDarkMode } = useTheme();
	const primaryColor = setupData.primaryColor || '#050711';
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		rememberMe: false,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

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

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email';
		}

		if (!formData.password.trim()) {
			newErrors.password = 'Password is required';
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			// Simulate login API call
			setTimeout(() => {
				console.log('Login successful:', formData);
				setIsLoading(false);
				alert('Login successful!');
			}, 1500);
		} else {
			setIsLoading(false);
		}
	};

	return (
		<div className="login-container">
			{/* Top Right Header */}
			<div className="login-top-header">
				<div className="login-header-card">
					<button className="upgrade-button" onClick={() => setIsPricingModalOpen(true)} style={{ color: primaryColor }}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						<span>Upgrade</span>
					</button>
					<div className="header-separator"></div>
					<div className="user-info">
						<div className="user-email">chinedu.go@gmail.com</div>
						<div className="user-plan">Free plan</div>
					</div>
					<div className="profile-icon">
						<div className="profile-avatar">
						</div>
					</div>
				</div>
			</div>

			{/* Left Side - Artwork Carousel */}
			<div className="login-image-section w-full md:w-1/2">
				<ArtworkCarousel autoPlayInterval={300000} />
			</div>
			{/* Right Side - Login Form */}
			<div className="login-form-section w-full md:w-1/2">
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
						<h1 className="welcome-title" style={{ color: isDarkMode ? '#F3F4F6' : primaryColor }}>Welcome Back</h1>
						<p className="welcome-subtitle font-lato font-normal text-base leading-[150%] text-[#6D7280] dark:text-gray-400">Please Login to continue.</p>
					</div>

					<form onSubmit={handleSubmit} className="login-form">
						<Input
							label="Email"
							placeholder="you@company.com"
							type="email"
							value={formData.email}
							onChange={handleInputChange('email')}
							required
							error={errors.email}
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

						<button
							type="submit"
							className={`login-button ${isLoading ? 'loading' : ''}`}
							disabled={isLoading}
							style={{ backgroundColor: primaryColor }}
							onMouseEnter={(e) => {
								if (!isLoading) {
									e.currentTarget.style.backgroundColor = primaryColor;
									e.currentTarget.style.opacity = '0.9';
								}
							}}
							onMouseLeave={(e) => {
								if (!isLoading) {
									e.currentTarget.style.backgroundColor = primaryColor;
									e.currentTarget.style.opacity = '1';
								}
							}}
						>
							{isLoading ? 'Logging in...' : 'Login'}
						</button>
					</form>
				</div>
			</div>

			{/* Pricing Modal */}
			<PricingModal
				isOpen={isPricingModalOpen}
				onClose={() => setIsPricingModalOpen(false)}
				onSelectPlan={(planId) => {
					console.log('Selected plan:', planId);
					// Handle plan selection
				}}
			/>
		</div>
	);
}
