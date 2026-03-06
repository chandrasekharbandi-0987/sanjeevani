const Colors = {
  primary: '#C62828',
  primaryLight: '#E53935',
  primaryDark: '#8E0000',
  secondary: '#FF6B6B',
  accent: '#2EC4B6',
  accentDark: '#1A9B8F',

  background: '#F7F9FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F4F8',
  border: '#E5E9EE',

  text: '#1E1E1E',
  textSecondary: '#5A6070',
  textMuted: '#9BA3AF',
  textOnPrimary: '#FFFFFF',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  bloodGroups: {
    'A+': '#FF6B6B',
    'A-': '#FF8C8C',
    'B+': '#FF9A3C',
    'B-': '#FFB366',
    'AB+': '#9B59B6',
    'AB-': '#B07CC6',
    'O+': '#C62828',
    'O-': '#E53935',
  },

  urgency: {
    critical: '#C62828',
    high: '#FF6B6B',
    medium: '#F59E0B',
    low: '#22C55E',
  },

  gradient: {
    primary: ['#C62828', '#E53935'] as [string, string],
    hero: ['#8E0000', '#C62828', '#E53935'] as [string, string, string],
    card: ['#FFFFFF', '#F7F9FB'] as [string, string],
    accent: ['#2EC4B6', '#1A9B8F'] as [string, string],
  },

  shadow: {
    color: '#000000',
    offset: { width: 0, height: 2 },
    opacity: 0.08,
    radius: 12,
    elevation: 4,
  },

  light: {
    text: '#1E1E1E',
    background: '#F7F9FB',
    tint: '#C62828',
    tabIconDefault: '#9BA3AF',
    tabIconSelected: '#C62828',
  },
};

export default Colors;
