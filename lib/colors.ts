/**
 * Color Palette for Outcess CRM
 * Generated from COLORS.png image
 */

// Row 1: Light/Neutral Colors
export const lightColors = {
  accentWhite: '#FFFFFF', // Very light, almost white gray
  offWhite: '#F8F9FA', // Very light, almost white gray
  offWhite2: '#F5F6F7', // Another very light gray
  lightGray: '#E9ECEF', // Pale, cool-toned gray
  mediumGray: '#DEE2E6', // Slightly darker, cool-toned gray
  offWhite3: '#F8F9FA', // Identical to first off-white
} as const;

// Row 2: Dark/Neutral Colors
export const darkColors = {
  primary: '#050711', // Primary dark color
  slateGray: '#6C757D', // Medium-dark, cool gray with hint of blue
  darkSlateGray: '#495057', // Very dark, desaturated blue-gray
  black: '#000000', // Pure black
} as const;

// Row 3: Accent Colors
export const accentColors = {
  paleMintGreen: '#D1E7DD', // Very light, desaturated green
  mutedSageGreen: '#6C8B7D', // Medium, desaturated green
  paleBlushPink: '#F8D7DA', // Very light, desaturated pink
  mutedCoralRed: '#DC3545', // Medium-dark, desaturated reddish-orange
  paleCream: '#FFF3CD', // Very light, warm yellow/beige
  burntOrange: '#FD7E14', // Vibrant, medium-dark orange with reddish-brown undertone
} as const;

// Semantic Color Mapping
export const semanticColors = {
  // Backgrounds
  background: {
    primary: lightColors.offWhite,
    secondary: lightColors.lightGray,
    tertiary: lightColors.mediumGray,
  },
  
  // Text Colors
  text: {
    primary: darkColors.primary,
    secondary: darkColors.darkSlateGray,
    tertiary: darkColors.slateGray,
    inverse: lightColors.offWhite,
  },
  
  // Status Colors
  status: {
    success: accentColors.mutedSageGreen,
    warning: accentColors.burntOrange,
    error: accentColors.mutedCoralRed,
    info: darkColors.slateGray,
  },
  
  // Interactive Colors
  interactive: {
    primary: accentColors.burntOrange,
    secondary: accentColors.mutedSageGreen,
    hover: accentColors.paleCream,
    disabled: lightColors.mediumGray,
  },
  
  // Accent Colors
  accent: {
    mint: accentColors.paleMintGreen,
    sage: accentColors.mutedSageGreen,
    blush: accentColors.paleBlushPink,
    coral: accentColors.mutedCoralRed,
    cream: accentColors.paleCream,
    orange: accentColors.burntOrange,
  },
} as const;

// Export all colors as a single object
export const colors = {
  light: lightColors,
  dark: darkColors,
  accent: accentColors,
  semantic: semanticColors,
} as const;

export default colors;
