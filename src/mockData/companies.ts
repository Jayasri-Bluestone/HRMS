import { Tenant } from '../types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-bluestone-in',
    name: 'Bluestone Group',
    slug: 'bluestone',
    code: 'BLUE-IN',
    countryId: 'IN',
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop&crop=faces',
    primaryColor: '#0284c7',
    status: 'ACTIVE',
    employeeCount: 84,
    employeeLimit: 150,
    planName: 'Growth Plan',
    createdAt: '2026-01-15'
  },
  {
    id: 'tenant-bluestone-uae',
    name: 'Bluestone Middle East LLC',
    slug: 'bluestone-uae',
    code: 'BLUE-AE',
    countryId: 'AE',
    currency: 'AED',
    currencySymbol: 'د.إ',
    timezone: 'Asia/Dubai',
    status: 'ACTIVE',
    employeeCount: 28,
    employeeLimit: 50,
    planName: 'Growth Plan',
    createdAt: '2026-03-01'
  },
  {
    id: 'tenant-fintech-uk',
    name: 'FinTech Global Ltd (SaaS Client)',
    slug: 'fintech-uk',
    code: 'FTG-UK',
    countryId: 'UK',
    currency: 'GBP',
    currencySymbol: '£',
    timezone: 'Europe/London',
    status: 'ACTIVE',
    employeeCount: 42,
    employeeLimit: 100,
    planName: 'Enterprise Plan',
    createdAt: '2026-06-10'
  },
  {
    id: 'tenant-apex-sg',
    name: 'Apex Innovations Pte (SaaS Client)',
    slug: 'apex-sg',
    code: 'APX-SG',
    countryId: 'SG',
    currency: 'SGD',
    currencySymbol: 'S$',
    timezone: 'Asia/Singapore',
    status: 'TRIAL',
    employeeCount: 16,
    employeeLimit: 25,
    planName: 'Starter Plan',
    createdAt: '2026-10-01'
  }
];

