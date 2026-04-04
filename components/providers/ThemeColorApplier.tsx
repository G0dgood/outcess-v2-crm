'use client';

import { useEffect } from 'react';
import { useCampaign } from '@/contexts/CampaignContext';
import { useSetup } from '@/contexts/SetupContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';

/**
 * ThemeColorApplier
 * Dynamically synchronizes theme colors from SetupContext or CampaignContext
 * to global CSS variables on the document root.
 */
export const ThemeColorApplier: React.FC = () => {
    const { campaignData } = useCampaign();
    const { setupData } = useSetup();
    const { isDarkMode } = useTheme();
    const pathname = usePathname();

    // Check if we are currently in the setup flow
    const isSetup = pathname?.startsWith('/setup');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;

        // Apply fallback defaults to CSS variables if they were somehow cleared
        // Most are already in globals.css, but this ensures critical ones are set
        // according to the dark mode state.

        if (isDarkMode) {
            root.style.setProperty('--primary', 'oklch(0.922 0 0)');
            root.style.setProperty('--sidebar-primary', 'oklch(0.922 0 0)');
            root.style.setProperty('--accent-white', '#1E293B');
            root.style.setProperty('--bg-main', 'oklch(0.145 0 0)');
        } else {
            root.style.setProperty('--primary', 'oklch(0.205 0 0)');
            root.style.setProperty('--sidebar-primary', 'oklch(0.205 0 0)');
            root.style.setProperty('--accent-white', '#ffffff');
            root.style.setProperty('--bg-main', '#F8F9FA');
        }

        // Cleanup: We no longer need to remove these since they should stay at defaults
        return () => {};

    }, [isDarkMode]);

    return null;
};

export default ThemeColorApplier;
