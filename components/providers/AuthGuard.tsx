'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Routes that do NOT require authentication. Everything else is protected and
 * redirects unauthenticated visitors to `/` (the login page).
 *
 * `/` is matched exactly; every other entry also matches its sub-paths
 * (e.g. `/blog/some-post`).
 */
const PUBLIC_ROUTES = [
	'/',
	'/signup',
	'/pending-request',
	'/about',
	'/blog',
	'/careers',
	'/privacy',
	'/terms',
	'/security',
];

const isPublicRoute = (pathname: string): boolean =>
	PUBLIC_ROUTES.some((route) =>
		route === '/'
			? pathname === '/'
			: pathname === route || pathname.startsWith(`${route}/`)
	);

/**
 * Client-side auth guard. Auth state lives in localStorage (see AuthContext),
 * so this can't be a server middleware — it runs on the client and redirects
 * unauthenticated users off protected routes to the login page.
 */
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAuthenticated, isLoading } = useAuth();
	const pathname = usePathname();
	const router = useRouter();

	const publicRoute = isPublicRoute(pathname);

	useEffect(() => {
		// Wait until auth has been restored from storage before deciding.
		if (isLoading) return;
		if (!isAuthenticated && !publicRoute) {
			router.replace('/');
		}
	}, [isAuthenticated, isLoading, publicRoute, pathname, router]);

	// On protected routes, don't render children until we know the user is
	// authenticated — this avoids flashing protected content during the initial
	// auth-restore window and before the redirect completes.
	if (!publicRoute && (isLoading || !isAuthenticated)) {
		return null;
	}

	return <>{children}</>;
};

export default AuthGuard;
