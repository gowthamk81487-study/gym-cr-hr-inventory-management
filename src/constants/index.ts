/**
 * Gym HR & Membership System - System Constants
 */

export const APP_METADATA = {
  name: 'Gym HR Portal',
  startup: 'The Gym Fitness Club',
  version: '1.0.0-MVP',
  supportEmail: 'support@thegymfitnesshub.in',
  inquiryPhone: '+1 (800) 555-PROV'
};

export const BRANCH_LOCATIONS = [
  { id: 'downtown', name: 'The Gym Fitness Club Downtown Club (HQ)', address: '100 The Gym Fitness Club Blvd, SF, CA' },
  { id: 'heights', name: 'The Gym Fitness Club Heights Club', address: '400 heights Ave, SF, CA' },
  { id: 'marina', name: 'The Gym Fitness Club Marina Club', address: '750 Marina Blvd, SF, CA' }
];

export const NAVIGATION_GROUPS = {
  CORE: 'Core Panel',
  CRM: 'Client Management (CRM)',
  FITNESS: 'Fitness & Memberships',
  OPERATIONS: 'Operations'
};

export const PORTAL_LINKS = [
  { label: 'Executive Dashboard', href: '/dashboard', group: 'CORE' },
  { label: 'Alert Feed', href: '/notifications', group: 'CORE' },
  { label: 'Analytics Reports', href: '/reports', group: 'CORE' },
  { label: 'System Settings', href: '/settings', group: 'CORE' },
  
  { label: 'Client Database', href: '/clients', group: 'CRM' },
  { label: 'Coach Roster', href: '/coaches', group: 'CRM' },
  { label: 'Interactive Matching', href: '/coach-assignment', group: 'CRM' },
  { label: 'Transfer Records', href: '/coach-transfer', group: 'CRM' },
  
  { label: 'Workout Protocols', href: '/workouts', group: 'FITNESS' },
  { label: 'Nutrition Schedules', href: '/diets', group: 'FITNESS' },
  { label: 'Membership Tiers', href: '/memberships', group: 'FITNESS' },
  
  { label: 'HR Administration', href: '/hr', group: 'OPERATIONS' },
  { label: 'Club Inventory', href: '/inventory', group: 'OPERATIONS' },
  { label: 'Payment Ledger', href: '/payments', group: 'OPERATIONS' }
];

export const MARKETING_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Startup', href: '/about' },
  { label: 'Memberships', href: '/pricing' },
  { label: 'Personal Training', href: '/pt-pricing' },
  { label: 'Reviews', href: '/testimonials' },
  { label: 'Contact', href: '/contact' }
];
