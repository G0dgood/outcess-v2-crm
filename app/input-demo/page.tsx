'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';

export default function InputExample() {
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Record<string, string> = {};

		if (!formData.fullName.trim()) {
			newErrors.fullName = 'Full name is required';
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

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			console.log('Form submitted:', formData);
			alert('Form submitted successfully!');
		}
	};

	return (
		<div style={{
			maxWidth: '600px',
			margin: '40px auto',
			padding: '20px',
			backgroundColor: 'var(--bg-primary)',
			borderRadius: '12px',
			boxShadow: '0 4px 6px var(--shadow-medium)'
		}}>
			<h1 style={{
				color: 'var(--primary)',
				marginBottom: '32px',
				fontSize: '24px',
				fontWeight: '600'
			}}>
				Custom Input Component Demo
			</h1>

			<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
				<Input
					label="Full Name"
					placeholder="Enter full name"
					value={formData.fullName}
					onChange={handleInputChange('fullName')}
					required
					error={errors.fullName}
				/>

				<Input
					label="Email Address"
					placeholder="Enter email address"
					type="email"
					value={formData.email}
					onChange={handleInputChange('email')}
					required
					error={errors.email}
				/>

				<Input
					label="Phone Number"
					placeholder="Enter phone number"
					type="tel"
					value={formData.phone}
					onChange={handleInputChange('phone')}
				/>

				<PasswordInput
					label="Password"
					placeholder="Enter your password"
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

				<button
					type="submit"
					style={{
						backgroundColor: 'var(--interactive-primary)',
						color: 'white',
						border: 'none',
						padding: '12px 24px',
						borderRadius: '8px',
						fontSize: '16px',
						fontWeight: '500',
						cursor: 'pointer',
						transition: 'background-color 0.2s ease',
						marginTop: '16px'
					}}
					onMouseOver={(e) => {
						e.currentTarget.style.backgroundColor = 'var(--interactive-hover)';
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.backgroundColor = 'var(--interactive-primary)';
					}}
				>
					Submit Form
				</button>
			</form>

			<div style={{
				marginTop: '32px',
				padding: '16px',
				backgroundColor: 'var(--bg-secondary)',
				borderRadius: '8px',
				border: '1px solid var(--light-gray)'
			}}>
				<h3 style={{
					color: 'var(--primary)',
					marginBottom: '12px',
					fontSize: '16px',
					fontWeight: '500'
				}}>
					Form Data:
				</h3>
				<pre style={{
					color: 'var(--text-secondary)',
					fontSize: '14px',
					margin: 0,
					whiteSpace: 'pre-wrap'
				}}>
					{JSON.stringify(formData, null, 2)}
				</pre>
			</div>
		</div>
	);
}
