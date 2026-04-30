export const COLORS = {
  primary: '#1E3A5F',       // Bleu HSE foncé
  primaryLight: '#2E5180',  // Bleu clair
  accent: '#F5A623',        // Orange accent
  success: '#27AE60',       // Vert succès
  danger: '#E74C3C',        // Rouge danger
  warning: '#F39C12',       // Orange avertissement
  info: '#3498DB',          // Bleu info
  white: '#FFFFFF',
  background: '#F4F6F9',    // Fond gris clair
  card: '#FFFFFF',
  border: '#E0E6ED',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  shadow: '#000000',
};

export const SEVERITY_COLORS = {
  low: '#27AE60',
  medium: '#F39C12',
  high: '#E74C3C',
  critical: '#8B0000',
};

export const STATUS_COLORS = {
  active: '#27AE60',
  inactive: '#E74C3C',
  pending: '#F39C12',
  resolved: '#3498DB',
  open: '#E74C3C',
  closed: '#27AE60',
  'in-progress': '#F39C12',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};
