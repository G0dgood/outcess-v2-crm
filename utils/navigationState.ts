/**
 * Global navigation state tracker
 * Prevents sounds and other effects during page navigation
 */

let isNavigating = false;
let navigationTimeout: NodeJS.Timeout | null = null;

/**
 * Set navigation state to true (prevents sounds)
 * Automatically resets after 2 seconds
 */
export const setNavigating = (value: boolean = true) => {
	isNavigating = value;
	
	// Clear any existing timeout
	if (navigationTimeout) {
		clearTimeout(navigationTimeout);
		navigationTimeout = null;
	}
	
	// Auto-reset after 2 seconds
	if (value) {
		navigationTimeout = setTimeout(() => {
			isNavigating = false;
			navigationTimeout = null;
		}, 2000);
	}
};

/**
 * Check if currently navigating
 */
export const getIsNavigating = (): boolean => {
	return isNavigating;
};

/**
 * Reset navigation state immediately
 */
export const resetNavigation = () => {
	isNavigating = false;
	if (navigationTimeout) {
		clearTimeout(navigationTimeout);
		navigationTimeout = null;
	}
};

