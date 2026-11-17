export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type CountryCode = 'IN' | 'AE' | 'UK' | 'SG';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  taxYearStart: string;
  statutoryDeductions: string[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  code: string;
  countryId: CountryCode;
  currency: string;
  currencySymbol: string;
  timezone: string;
  logoUrl?: string;
  primaryColor?: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  employeeCount: number;
  employeeLimit: number;
  planName: string;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
}

export interface Department {
  id: string;
  tenantId?: string;
  name: string;
  code?: string;
  description?: string;
  headName?: string;
  employeeCount: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Designation {
  id: string;
  tenantId?: string;
  title: string;
  departmentId?: string;
  departmentName?: string;
  level?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface LeaveTypeMaster {
  id: string;
  tenantId?: string;
  name: string;
  code: string;
  daysPerYear: number;
  isPaid: boolean;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ShiftMaster {
  id: string;
  tenantId?: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  workHours: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface HolidayMaster {
  id: string;
  tenantId?: string;
  title: string;
  date: string;
  countryId: CountryCode | 'ALL';
  isOptional: boolean;
  description?: string;
}

export type PermissionCategory =
  | 'Dynamic Masters'
  | 'Workforce & Employees'
  | 'Attendance & Shifts'
  | 'Leave Management'
  | 'Payroll & Statutory'
  | 'Security & Governance';

export interface PermissionItem {
  key: string;
  category: PermissionCategory;
  label: string;
  description: string;
}

export type RolePermissionMap = Record<UserRole, Record<string, boolean>>;

export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  managerId?: string;
  managerName?: string;
  joiningDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED';
  avatar?: string;
  country: CountryCode;
  currency: string;
  salary: {
    monthlyGross: number;
    basic: number;
    allowances: number;
    deductions: number;
    netPay: number;
  };
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscOrIban: string;
    accountHolderName?: string;
  };
  statutoryDetails?: {
    pfNumber?: string;
    hasExistingPf?: boolean;
    uanNumber?: string;
    esiNumber?: string;
    panNumber?: string;
    nationalId?: string;
  };
  personalDetails?: {
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth?: string;
    bloodGroup?: string;
    maritalStatus?: 'SINGLE' | 'MARRIED' | 'OTHER';
    workLocation?: string;
    employmentType?: 'FULL_TIME' | 'CONTRACT' | 'PROBATION' | 'INTERN';
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    currentAddress?: string;
  };
  documentsCount: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours: number;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE' | 'HOLIDAY' | 'MISSED_PUNCH' | 'REGULARIZATION_PENDING';
  locationEvidence?: string;
  ipAddress?: string;
  isException?: boolean;
}

export interface MissedPunchRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'BOTH';
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  remarks?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  managerComments?: string;
}

export interface PermissionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  startTime: string; // e.g. "03:00 PM"
  endTime: string;   // e.g. "05:00 PM"
  durationHours: number; // e.g. 2
  reasonCategory: 'PERSONAL' | 'MEDICAL' | 'OFFICIAL' | 'EMERGENCY';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  managerComments?: string;
}

export interface UserAccount {
  email: string;
  password?: string;
  role: UserRole;
  employeeId: string;
  name: string;
  tenantId: string;
  department?: string;
  designation?: string;
  shiftId?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'ANNUAL' | 'SICK' | 'CASUAL' | 'UNPAID' | 'MATERNITY';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  managerComments?: string;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  available: number;
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  period: string; // e.g. "October 2026"
  year: number;
  month: number;
  status: 'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'APPROVED' | 'LOCKED' | 'PAID';
  countryCode: CountryCode;
  currency: string;
  currencySymbol: string;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  runDate: string;
  approvedBy?: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  period: string;
  currency: string;
  currencySymbol: string;
  countryCode: CountryCode;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  epfDeduction?: number;
  esiDeduction?: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  paymentStatus: 'PAID' | 'PENDING';
  payDate: string;
  bankName: string;
  accountNumberMasked: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  employeeLimit: number;
  features: string[];
  popular?: boolean;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

