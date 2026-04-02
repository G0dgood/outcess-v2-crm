'use client';

import { useEffect } from 'react';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useSetup } from '@/contexts/SetupContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';

/**
 * ThemeColorApplier
 * Dynamically synchronizes theme colors from SetupContext or LineOfBusinessContext
 * to global CSS variables on the document root.
 */
export const ThemeColorApplier: React.FC = () => {
    const { lineOfBusinessData } = useLineOfBusiness();
    const { setupData } = useSetup();
    const { isDarkMode } = useTheme();
    const pathname = usePathname();

    // Check if we are currently in the setup flow
    const isSetup = pathname?.startsWith('/setup');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;

        // 1. Determine which colors to use
        // Priority: Setup Data (if in setup flow) > Live LOB Data > Default CSS
        const getModeColor = (light: string | undefined, dark: string | undefined, fallback: string) => {
            if (isDarkMode) return dark || fallback;
            return light || fallback;
        };

        const currentPrimary = isSetup
            ? getModeColor(setupData.primaryColor, setupData.primaryColorDark, '#050711')
            : getModeColor(
                lineOfBusinessData?.primaryColor || lineOfBusinessData?.lineOfBusiness?.primaryColor,
                lineOfBusinessData?.primaryColorDark || lineOfBusinessData?.lineOfBusiness?.primaryColorDark,
                '#050711'
            );

        const currentSecondary = isSetup
            ? getModeColor(setupData.secondaryColor, setupData.secondaryColorDark, '#6C8B7D')
            : getModeColor(
                lineOfBusinessData?.secondaryColor || lineOfBusinessData?.lineOfBusiness?.secondaryColor,
                lineOfBusinessData?.secondaryColorDark || lineOfBusinessData?.lineOfBusiness?.secondaryColorDark,
                '#6C8B7D'
            );

        const currentText = isSetup
            ? getModeColor(setupData.textColor, setupData.textColorDark, isDarkMode ? '#F3F4F6' : '#050711')
            : getModeColor(
                lineOfBusinessData?.textColor || lineOfBusinessData?.lineOfBusiness?.textColor,
                lineOfBusinessData?.textColorDark || lineOfBusinessData?.lineOfBusiness?.textColorDark,
                isDarkMode ? '#F3F4F6' : '#050711'
            );

        const currentBackground = isSetup
            ? getModeColor(setupData.backgroundColor, setupData.backgroundColorDark, isDarkMode ? '#0F172A' : '#ffffff')
            : getModeColor(
                lineOfBusinessData?.backgroundColor || lineOfBusinessData?.lineOfBusiness?.backgroundColor,
                lineOfBusinessData?.backgroundColorDark || lineOfBusinessData?.lineOfBusiness?.backgroundColorDark,
                isDarkMode ? '#0F172A' : '#F8F9FA'
            );

        const currentTable = isSetup
            ? getModeColor(setupData.tableColor, setupData.tableColorDark, isDarkMode ? '#1E293B' : '#F8F9FA')
            : getModeColor(
                lineOfBusinessData?.tableColor || lineOfBusinessData?.lineOfBusiness?.tableColor,
                lineOfBusinessData?.tableColorDark || lineOfBusinessData?.lineOfBusiness?.tableColorDark,
                isDarkMode ? '#1E293B' : '#F8F9FA'
            );

        const currentAccent = isSetup
            ? getModeColor(setupData.accentColor, setupData.accentColorDark, '#6C8B7D')
            : getModeColor(
                lineOfBusinessData?.accentColor || lineOfBusinessData?.lineOfBusiness?.accentColor,
                lineOfBusinessData?.accentColorDark || lineOfBusinessData?.lineOfBusiness?.accentColorDark,
                '#6C8B7D'
            );

        const currentMainForeground = isSetup
            ? getModeColor(setupData.mainForegroundColor, setupData.mainForegroundColorDark, isDarkMode ? '#0F172A' : '#FFFFFF')
            : getModeColor(
                lineOfBusinessData?.mainForegroundColor || lineOfBusinessData?.lineOfBusiness?.mainForegroundColor,
                lineOfBusinessData?.mainForegroundColorDark || lineOfBusinessData?.lineOfBusiness?.mainForegroundColorDark,
                isDarkMode ? '#0F172A' : '#FFFFFF'
            );

        // 2. Apply colors to CSS variables
        if (currentPrimary) {
            root.style.setProperty('--primary', currentPrimary);
            root.style.setProperty('--sidebar-primary', currentPrimary);
        }

        if (currentSecondary) {
            root.style.setProperty('--secondary', currentSecondary);
            root.style.setProperty('--interactive-secondary', currentSecondary);
            root.style.setProperty('--interactive-primary', currentSecondary);
            root.style.setProperty('--shadow-color', currentSecondary);
        }

        if (currentText) {
            root.style.setProperty('--text-primary', currentText);
        }

        if (currentBackground) {
            // Background = overall page/app background
            root.style.setProperty('--background', currentBackground);
            root.style.setProperty('--bg-page', currentBackground);
            root.style.setProperty('--off-white', currentBackground);
            root.style.setProperty('--accent-white', isDarkMode ? '#1E293B' : currentBackground);
        }

        if (currentTable) {
            root.style.setProperty('--table-header-bg', currentTable);
        }

        if (currentAccent) {
            root.style.setProperty('--accent', currentAccent);
        }

        if (currentMainForeground) {
            root.style.setProperty('--primary-foreground', currentMainForeground);
            root.style.setProperty('--bg-main', currentMainForeground);
        }

        // Cleanup function for when the component unmounts or deps change
        return () => {
            if (root) {
                const propsToRemove = ['--primary', '--secondary', '--text-primary', '--table-header-bg', '--bg-main', '--bg-page', '--accent-white', '--accent', '--interactive-primary', '--interactive-secondary', '--shadow-color'];
                propsToRemove.forEach(prop => root.style.removeProperty(prop));
            }
        };

    }, [lineOfBusinessData, setupData, isSetup, pathname, isDarkMode]);

    return null;
};

export default ThemeColorApplier;
