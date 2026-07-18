/**
 * Gym HR & Membership System - System Configs
 */

export const CONFIG = {
  env: process.env.NODE_ENV || 'development',
  apiTimeout: 5000,
  
  // Feature Toggles (Roadmap parameters)
  features: {
    enableStripeBilling: true,
    enableGeminiSlipScanning: false,
    enablePredictiveAttendance: true,
    enableRealtimeAlerts: false
  },
  
  // Brand definitions
  branding: {
    primaryColor: '#2563eb', // Blue
    accentColor: '#10b981', // Emerald
    themeMode: 'dark-only'
  }
};

export default CONFIG;
