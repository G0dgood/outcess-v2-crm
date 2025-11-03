'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Image from 'next/image';
import ArtworkCarousel from '@/components/ui/ArtworkCarousel';

export default function LoginPage() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		rememberMe: false,
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
		setFormData(prev => ({ ...prev, rememberMe: e.target.checked }));
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
						<h1 className="welcome-title">Welcome Back</h1>
						<p className="welcome-subtitle font-lato font-normal text-base leading-[150%] text-[#6D7280]">Please Login to continue.</p>
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
							<label className="remember-me">
								<input
									type="checkbox"
									checked={formData.rememberMe}
									onChange={handleCheckboxChange}
								/>
								<span>Remember me</span>
							</label>
							<a href="#" className="forgot-password">Forgot password?</a>
						</div>

						<button
							type="submit"
							className={`login-button ${isLoading ? 'loading' : ''}`}
							disabled={isLoading}
						>
							{isLoading ? 'Logging in...' : 'Login'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
