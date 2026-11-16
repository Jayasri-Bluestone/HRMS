import { CountryConfig } from '../types';

export const COUNTRIES: Record<string, CountryConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
    taxYearStart: '01-04',
    statutoryDeductions: ['EPF (12%)', 'ESI (0.75%)', 'Professional Tax (PT)', 'TDS / Income Tax']
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates (UAE)',
    currency: 'AED',
    currencySymbol: 'د.إ',
    flag: '🇦🇪',
    taxYearStart: '01-01',
    statutoryDeductions: ['WPS Surcharge', 'End-of-Service Gratuity Fund']
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
    taxYearStart: '06-04',
    statutoryDeductions: ['PAYE Income Tax', 'National Insurance (Class 1)', 'Workplace Pension (5%)']
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    flag: '🇸🇬',
    taxYearStart: '01-01',
    statutoryDeductions: ['CPF Employee (20%)', 'CDAC/SINDA Fund', 'Skills Development Levy (SDL)']
  }
};

