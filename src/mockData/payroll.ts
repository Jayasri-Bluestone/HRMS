import { PayrollRun, Payslip } from '../types';

export const INITIAL_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'pr-2026-10-blu',
    tenantId: 'tenant-bluestone-in',
    period: 'October 2026',
    year: 2026,
    month: 10,
    status: 'LOCKED',
    countryCode: 'IN',
    currency: 'INR',
    currencySymbol: '₹',
    totalEmployees: 84,
    totalGross: 8450000,
    totalDeductions: 1045000,
    totalNet: 7405000,
    runDate: '2026-10-31',
    approvedBy: 'Priya Nair (HR Head)'
  },
  {
    id: 'pr-2026-11-blu',
    tenantId: 'tenant-bluestone-in',
    period: 'November 2026 (Upcoming)',
    year: 2026,
    month: 11,
    status: 'DRAFT',
    countryCode: 'IN',
    currency: 'INR',
    currencySymbol: '₹',
    totalEmployees: 84,
    totalGross: 8520000,
    totalDeductions: 1054000,
    totalNet: 7466000,
    runDate: '2026-11-30'
  },
  {
    id: 'pr-2026-10-uae',
    tenantId: 'tenant-bluestone-uae',
    period: 'October 2026',
    year: 2026,
    month: 10,
    status: 'LOCKED',
    countryCode: 'AE',
    currency: 'AED',
    currencySymbol: 'د.إ',
    totalEmployees: 28,
    totalGross: 392000,
    totalDeductions: 7000,
    totalNet: 385000,
    runDate: '2026-10-31',
    approvedBy: 'Tariq Al-Mansoor'
  },
  {
    id: 'pr-2026-10-uk',
    tenantId: 'tenant-fintech-uk',
    period: 'October 2026',
    year: 2026,
    month: 10,
    status: 'LOCKED',
    countryCode: 'UK',
    currency: 'GBP',
    currencySymbol: '£',
    totalEmployees: 42,
    totalGross: 218400,
    totalDeductions: 56780,
    totalNet: 161620,
    runDate: '2026-10-31',
    approvedBy: 'Oliver Smith'
  }
];

export const SAMPLE_PAYSLIPS: Record<string, Payslip> = {
  'emp-005': {
    id: 'ps-oct-emp005',
    payrollRunId: 'pr-2026-10-blu',
    employeeId: 'emp-005',
    employeeCode: 'BLU-005',
    employeeName: 'Rohan Deshmukh',
    designation: 'Mobile App Developer (RN)',
    department: 'Engineering',
    period: 'October 2026',
    currency: 'INR',
    currencySymbol: '₹',
    countryCode: 'IN',
    basicSalary: 47500,
    housingAllowance: 23750,
    transportAllowance: 4750,
    otherAllowances: 19000,
    grossSalary: 95000,
    epfDeduction: 5700, // 12% of Basic
    esiDeduction: 0, // Exceeds statutory ESI limit
    taxDeduction: 3600, // TDS
    otherDeductions: 200, // Professional Tax
    totalDeductions: 9500,
    netPay: 85500,
    paymentStatus: 'PAID',
    payDate: '2026-10-31',
    bankName: 'Kotak Mahindra Bank',
    accountNumberMasked: '•••• •••• •••• 6789'
  },
  'emp-003': {
    id: 'ps-oct-emp003',
    payrollRunId: 'pr-2026-10-blu',
    employeeId: 'emp-003',
    employeeCode: 'BLU-003',
    employeeName: 'Arjun Mehta',
    designation: 'Senior Full Stack Lead',
    department: 'Engineering',
    period: 'October 2026',
    currency: 'INR',
    currencySymbol: '₹',
    countryCode: 'IN',
    basicSalary: 70000,
    housingAllowance: 35000,
    transportAllowance: 7000,
    otherAllowances: 28000,
    grossSalary: 140000,
    epfDeduction: 8400,
    esiDeduction: 0,
    taxDeduction: 5400,
    otherDeductions: 200,
    totalDeductions: 14000,
    netPay: 126000,
    paymentStatus: 'PAID',
    payDate: '2026-10-31',
    bankName: 'State Bank of India',
    accountNumberMasked: '•••• •••• •••• 9081'
  }
};

