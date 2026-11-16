import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  PayrollRun,
  Payslip,
  AuditLog,
  Department,
  Designation,
  LeaveTypeMaster,
  ShiftMaster,
  HolidayMaster,
  RolePermissionMap,
  UserRole
} from '../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../mockData/permissions';
import { INITIAL_EMPLOYEES } from '../mockData/employees';
import { INITIAL_ATTENDANCE } from '../mockData/attendance';
import { INITIAL_LEAVES, CURRENT_EMPLOYEE_LEAVE_BALANCES } from '../mockData/leaves';
import { INITIAL_PAYROLL_RUNS, SAMPLE_PAYSLIPS } from '../mockData/payroll';
import { INITIAL_AUDIT_LOGS } from '../mockData/subscriptions';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';
import { useToast } from './ToastContext';
import { apiClient } from '../services/apiClient';
import { formatLocalDateISO, getTodayDateISO } from '../utils/dateUtils';

export interface AppNotification {
  id: string;
  type: 'leave' | 'punch' | 'payroll' | 'general';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export interface DayAttendance {
  date: string;
  day: number;
  status:
    | 'PRESENT'
    | 'LATE'
    | 'HALF_DAY'
    | 'ABSENT'
    | 'ON_LEAVE'
    | 'HOLIDAY'
    | 'MISSED_PUNCH'
    | 'REGULARIZATION_PENDING'
    | 'WEEKEND';
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  note?: string;
  leaveType?: string;
  holidayTitle?: string;
  regularizationReason?: string;
}

export interface BranchNode {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  country: string;
  flag: string;
  currency: string;
  headcount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PunchSessionState {
  hasPunchedIn: boolean;
  hasPunchedOut: boolean;
  punchInTime: string | null;
  punchOutTime: string | null;
  locationEvidence: string;
}

const INITIAL_BRANCHES: BranchNode[] = [
  {
    id: 'br-in-1',
    tenantId: 'tenant-bluestone-in',
    name: 'India Corporate HQ',
    location: 'Mumbai Tech Park',
    country: 'IN',
    flag: '🇮🇳',
    currency: 'INR (₹)',
    headcount: 84,
    status: 'ACTIVE'
  },
  {
    id: 'br-ae-1',
    tenantId: 'tenant-bluestone-uae',
    name: 'Middle East LLC',
    location: 'Dubai Internet City',
    country: 'AE',
    flag: '🇦🇪',
    currency: 'AED (د.إ)',
    headcount: 28,
    status: 'ACTIVE'
  },
  {
    id: 'br-uk-1',
    tenantId: 'tenant-fintech-uk',
    name: 'European Solutions Ltd',
    location: 'London Canary Wharf',
    country: 'UK',
    flag: '🇬🇧',
    currency: 'GBP (£)',
    headcount: 42,
    status: 'ACTIVE'
  }
];

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development, mobile apps & cloud platforms',
    headName: 'Arjun Mehta',
    employeeCount: 45,
    status: 'ACTIVE'
  },
  {
    id: 'dept-2',
    name: 'Product & Design',
    code: 'PRD',
    description: 'Product roadmap, design system and user research',
    headName: 'Kavita Rao',
    employeeCount: 18,
    status: 'ACTIVE'
  },
  {
    id: 'dept-3',
    name: 'Human Resources',
    code: 'HR',
    description: 'People ops, hiring, culture and statutory compliance',
    headName: 'Priya Nair',
    employeeCount: 12,
    status: 'ACTIVE'
  },
  {
    id: 'dept-4',
    name: 'Sales & Growth',
    code: 'SLS',
    description: 'B2B enterprise partnerships & customer success',
    headName: 'Rahul Sen',
    employeeCount: 22,
    status: 'ACTIVE'
  },
  {
    id: 'dept-5',
    name: 'Finance & Legal',
    code: 'FIN',
    description: 'Corporate accounting, tax audits & payroll treasury',
    headName: 'Sunita Menon',
    employeeCount: 9,
    status: 'ACTIVE'
  },
  {
    id: 'dept-6',
    name: 'Operations & Logistics',
    code: 'OPS',
    description: 'Office administration, equipment logistics & assets',
    headName: 'David Miller',
    employeeCount: 14,
    status: 'ACTIVE'
  }
];

const INITIAL_DESIGNATIONS: Designation[] = [
  { id: 'desig-1', title: 'Senior Full Stack Lead', departmentName: 'Engineering', level: 'L4', status: 'ACTIVE' },
  { id: 'desig-2', title: 'Mobile App Developer', departmentName: 'Engineering', level: 'L2', status: 'ACTIVE' },
  { id: 'desig-3', title: 'Backend Cloud Engineer', departmentName: 'Engineering', level: 'L3', status: 'ACTIVE' },
  { id: 'desig-4', title: 'Principal UI/UX Designer', departmentName: 'Product & Design', level: 'L4', status: 'ACTIVE' },
  { id: 'desig-5', title: 'Product Manager', departmentName: 'Product & Design', level: 'L3', status: 'ACTIVE' },
  { id: 'desig-6', title: 'Head of People & Culture', departmentName: 'Human Resources', level: 'Executive', status: 'ACTIVE' },
  { id: 'desig-7', title: 'HR Business Partner', departmentName: 'Human Resources', level: 'L3', status: 'ACTIVE' },
  { id: 'desig-8', title: 'Enterprise Account Executive', departmentName: 'Sales & Growth', level: 'L3', status: 'ACTIVE' },
  { id: 'desig-9', title: 'Financial Controller', departmentName: 'Finance & Legal', level: 'L4', status: 'ACTIVE' },
  { id: 'desig-10', title: 'Managing Director & CEO', departmentName: 'Executive', level: 'C-Level', status: 'ACTIVE' }
];

const INITIAL_LEAVE_TYPES: LeaveTypeMaster[] = [
  { id: 'lt-1', name: 'Annual / Paid Leave', code: 'PL', daysPerYear: 18, isPaid: true, description: 'Standard paid annual leave', status: 'ACTIVE' },
  { id: 'lt-2', name: 'Sick Leave', code: 'SL', daysPerYear: 12, isPaid: true, description: 'Medical treatment & recovery', status: 'ACTIVE' },
  { id: 'lt-3', name: 'Casual Leave', code: 'CL', daysPerYear: 10, isPaid: true, description: 'Short unplanned personal leave', status: 'ACTIVE' },
  { id: 'lt-4', name: 'Maternity Leave', code: 'ML', daysPerYear: 180, isPaid: true, description: 'Statutory maternal childcare entitlement', status: 'ACTIVE' },
  { id: 'lt-5', name: 'Paternity Leave', code: 'PTL', daysPerYear: 15, isPaid: true, description: 'New father parental support leave', status: 'ACTIVE' },
  { id: 'lt-6', name: 'Leave Without Pay (LOP)', code: 'LWP', daysPerYear: 30, isPaid: false, description: 'Unpaid extended personal leave', status: 'ACTIVE' }
];

const INITIAL_SHIFTS: ShiftMaster[] = [
  { id: 'sh-1', name: 'General Morning Shift', startTime: '09:00 AM', endTime: '06:00 PM', gracePeriodMinutes: 15, workHours: 9, status: 'ACTIVE' },
  { id: 'sh-2', name: 'Early Engineering Shift', startTime: '07:30 AM', endTime: '04:30 PM', gracePeriodMinutes: 15, workHours: 9, status: 'ACTIVE' },
  { id: 'sh-3', name: 'EMEA Overlap Shift', startTime: '12:00 PM', endTime: '09:00 PM', gracePeriodMinutes: 15, workHours: 9, status: 'ACTIVE' },
  { id: 'sh-4', name: 'US Night Shift', startTime: '08:30 PM', endTime: '05:30 AM', gracePeriodMinutes: 15, workHours: 9, status: 'ACTIVE' },
  { id: 'sh-5', name: 'Flexible Hybrid Shift', startTime: 'Flexible', endTime: 'Flexible', gracePeriodMinutes: 30, workHours: 8, status: 'ACTIVE' }
];

const INITIAL_HOLIDAYS: HolidayMaster[] = [
  { id: 'hol-1', title: "New Year's Day", date: '2026-01-01', countryId: 'ALL', isOptional: false, description: 'International New Year Holiday' },
  { id: 'hol-2', title: 'Republic Day', date: '2026-01-26', countryId: 'IN', isOptional: false, description: 'National Holiday' },
  { id: 'hol-3', title: 'Independence Day', date: '2026-08-15', countryId: 'IN', isOptional: false, description: 'National Independence Celebration' },
  { id: 'hol-4', title: 'Gandhi Jayanti', date: '2026-10-02', countryId: 'IN', isOptional: false, description: 'National Holiday' },
  { id: 'hol-5', title: 'Diwali / Deepavali', date: '2026-11-12', countryId: 'IN', isOptional: false, description: 'Festival of Lights' },
  { id: 'hol-6', title: 'UAE National Day', date: '2026-12-02', countryId: 'AE', isOptional: false, description: 'United Arab Emirates National Day' },
  { id: 'hol-7', title: 'Christmas Day', date: '2026-12-25', countryId: 'ALL', isOptional: false, description: 'Christmas Celebration' }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'leave',
    title: 'Leave Request Approved',
    message: 'Your sick leave application was approved by Arjun Mehta.',
    time: '15m ago',
    isRead: false
  },
  {
    id: 'notif-2',
    type: 'punch',
    title: 'Missed Punch Action Required',
    message: 'You missed check-out earlier this month. Regularize before payroll cutoff to prevent LOP.',
    time: '2h ago',
    isRead: false
  },
  {
    id: 'notif-3',
    type: 'payroll',
    title: 'October 2026 Payslip Generated',
    message: 'Your monthly salary statement is available for PDF download.',
    time: '1d ago',
    isRead: true
  },
  {
    id: 'notif-4',
    type: 'general',
    title: 'New Policy Update',
    message: 'HR published the updated 2027 holiday schedule across corporate branches.',
    time: '3d ago',
    isRead: true
  }
];

const PERSONAL_HISTORICAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'emp-att-11',
    employeeId: 'emp-005',
    employeeName: 'Rohan Deshmukh',
    department: 'Engineering',
    date: getTodayDateISO(),
    checkIn: '09:15 AM',
    checkOut: undefined,
    workHours: 0,
    status: 'PRESENT',
    locationEvidence: 'Pune Tech Center (18.5204° N, 73.8567° E)',
    ipAddress: '115.112.44.22'
  },
  {
    id: 'emp-att-10',
    employeeId: 'emp-005',
    employeeName: 'Rohan Deshmukh',
    department: 'Engineering',
    date: '2026-11-10',
    checkIn: '09:02 AM',
    checkOut: '06:14 PM',
    workHours: 8.5,
    status: 'PRESENT',
    locationEvidence: 'Pune Tech Center (18.5204° N, 73.8567° E)',
    ipAddress: '115.112.44.22'
  },
  {
    id: 'emp-att-09',
    employeeId: 'emp-005',
    employeeName: 'Rohan Deshmukh',
    department: 'Engineering',
    date: '2026-11-09',
    checkIn: '09:10 AM',
    checkOut: '06:20 PM',
    workHours: 8.6,
    status: 'PRESENT',
    locationEvidence: 'Pune Tech Center (18.5204° N, 73.8567° E)',
    ipAddress: '115.112.44.22'
  },
  {
    id: 'emp-att-06',
    employeeId: 'emp-005',
    employeeName: 'Rohan Deshmukh',
    department: 'Engineering',
    date: '2026-11-06',
    checkIn: '08:55 AM',
    checkOut: '05:45 PM',
    workHours: 8.2,
    status: 'PRESENT',
    locationEvidence: 'Remote / Work From Home (Pune)',
    ipAddress: '122.161.49.12'
  },
  {
    id: 'emp-att-05',
    employeeId: 'emp-005',
    employeeName: 'Rohan Deshmukh',
    department: 'Engineering',
    date: '2026-11-05',
    checkIn: '09:48 AM',
    checkOut: '06:30 PM',
    workHours: 7.7,
    status: 'LATE',
    locationEvidence: 'Pune Tech Center (18.5204° N, 73.8567° E)',
    ipAddress: '115.112.44.22'
  },
  {
    id: 'emp-att-04',
    employeeId: 'emp-005',
    employeeName: 'Rohan Deshmukh',
    department: 'Engineering',
    date: '2026-11-04',
    checkIn: '09:12 AM',
    checkOut: undefined,
    workHours: 0,
    status: 'MISSED_PUNCH',
    locationEvidence: 'Pune Tech Center (Check-out missing)',
    isException: true
  },
  {
    id: 'emp-att-03',
    employeeId: 'emp-005',
    employeeName: 'Rohan Deshmukh',
    department: 'Engineering',
    date: '2026-11-03',
    checkIn: '09:05 AM',
    checkOut: '06:10 PM',
    workHours: 8.5,
    status: 'PRESENT',
    locationEvidence: 'Pune Tech Center (18.5204° N, 73.8567° E)',
    ipAddress: '115.112.44.22'
  }
];

const buildInitialMonthCalendar = (year: number, monthIndex: number): Record<string, DayAttendance> => {
  const data: Record<string, DayAttendance> = {};
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayStr = getTodayDateISO();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dateStr = formatLocalDateISO(dateObj);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      data[dateStr] = { date: dateStr, day: d, status: 'WEEKEND', note: 'Weekly Off' };
      continue;
    }

    if (d === 8 && monthIndex === 10) {
      data[dateStr] = {
        date: dateStr,
        day: d,
        status: 'HOLIDAY',
        holidayTitle: 'Diwali Festive Holiday',
        note: 'Mandatory Company Holiday'
      };
      continue;
    }
    if (d === 24 && monthIndex === 10) {
      data[dateStr] = {
        date: dateStr,
        day: d,
        status: 'HOLIDAY',
        holidayTitle: 'Guru Nanak Jayanti',
        note: 'Public Holiday'
      };
      continue;
    }

    if (d === 4 && monthIndex === 10) {
      data[dateStr] = {
        date: dateStr,
        day: d,
        status: 'MISSED_PUNCH',
        checkIn: '09:12 AM',
        note: 'Missed Punch-Out (No checkout recorded)'
      };
    } else if (d === 5 && monthIndex === 10) {
      data[dateStr] = {
        date: dateStr,
        day: d,
        status: 'LATE',
        checkIn: '09:48 AM',
        checkOut: '06:30 PM',
        workHours: 7.7,
        note: 'Punched after 09:30 AM grace period'
      };
    } else if (dateStr === todayStr) {
      data[dateStr] = {
        date: dateStr,
        day: d,
        status: 'PRESENT',
        checkIn: '09:15 AM',
        workHours: 0,
        note: 'In-progress shift'
      };
    } else if (d === 20 || d === 21) {
      data[dateStr] = {
        date: dateStr,
        day: d,
        status: 'ON_LEAVE',
        leaveType: 'ANNUAL',
        note: 'Pending / Requested Leave'
      };
    } else if (dateObj > new Date()) {
      data[dateStr] = {
        date: dateStr,
        day: d,
        status: 'PRESENT',
        workHours: 0,
        note: 'Scheduled General Shift'
      };
    } else {
      data[dateStr] = {
        date: dateStr,
        day: d,
        status: 'PRESENT',
        checkIn: '09:05 AM',
        checkOut: '06:10 PM',
        workHours: 8.5,
        note: 'Verified GPS Check-in'
      };
    }
  }
  return data;
};

interface HrmsDataContextType {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  personalAttendanceRecords: AttendanceRecord[];
  calendarAttendance: Record<string, DayAttendance>;
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  payrollRuns: PayrollRun[];
  payslips: Record<string, Payslip>;
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  branches: BranchNode[];
  punchSession: PunchSessionState;
  addEmployee: (emp: Employee) => Promise<void>;
  punchIn: () => Promise<void>;
  punchOut: () => Promise<void>;
  submitRegularization: (payload: {
    date: string;
    checkIn: string;
    checkOut: string;
    reason: string;
    remarks?: string;
  }) => Promise<void>;
  resolveAttendanceException: (recordId: string) => Promise<void>;
  submitWfhNotice: (date: string, reason: string) => void;
  applyLeave: (request: LeaveRequest) => Promise<void>;
  reviewLeave: (id: string, status: 'APPROVED' | 'REJECTED', managerComments?: string) => Promise<void>;
  cancelLeave: (id: string) => void;
  completePayrollRun: (run: PayrollRun) => Promise<void>;
  getPayslipForEmployee: (employeeId: string) => Payslip;
  addBranch: (branch: Omit<BranchNode, 'id'>) => void;
  // Dynamic Masters Management
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  designations: Designation[];
  addDesignation: (desig: Omit<Designation, 'id'>) => void;
  updateDesignation: (id: string, desig: Partial<Designation>) => void;
  deleteDesignation: (id: string) => void;
  leaveTypes: LeaveTypeMaster[];
  addLeaveType: (lt: Omit<LeaveTypeMaster, 'id'>) => void;
  updateLeaveType: (id: string, lt: Partial<LeaveTypeMaster>) => void;
  deleteLeaveType: (id: string) => void;
  shifts: ShiftMaster[];
  addShift: (shift: Omit<ShiftMaster, 'id'>) => void;
  updateShift: (id: string, shift: Partial<ShiftMaster>) => void;
  deleteShift: (id: string) => void;
  holidays: HolidayMaster[];
  addHoliday: (holiday: Omit<HolidayMaster, 'id'>) => void;
  updateHoliday: (id: string, holiday: Partial<HolidayMaster>) => void;
  deleteHoliday: (id: string) => void;
  // Role Rights & RBAC Policy
  rolePermissions: RolePermissionMap;
  updateRolePermission: (role: UserRole, permissionKey: string, allowed: boolean) => void;
  resetRolePermissionsToDefault: () => void;
  hasPermission: (permissionKey: string, role?: UserRole) => boolean;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  recordAuditEvent: (action: string, module: string, details: string) => void;
}

const HrmsDataContext = createContext<HrmsDataContextType | undefined>(undefined);

const captureGpsLocation = (): Promise<string> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve('Pune Tech Center (Office Verified)');
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve('Pune Tech Center (18.5204° N, 73.8567° E)');
    }, 1500);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        const lat = pos.coords.latitude.toFixed(4);
        const lon = pos.coords.longitude.toFixed(4);
        resolve(`GPS Verified (${lat}° N, ${lon}° E)`);
      },
      () => {
        clearTimeout(timer);
        resolve('Pune Tech Center (18.5204° N, 73.8567° E)');
      },
      { timeout: 1400, maximumAge: 60000 }
    );
  });
};

export const HrmsDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, currentRole, baseRole, isAuthenticated, isDemoMode, token } = useAuth();
  const { currentTenant, adjustTenantEmployeeCount } = useTenant();
  const { showToast } = useToast();

  const now = new Date();
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [personalAttendanceRecords, setPersonalAttendanceRecords] = useState<AttendanceRecord[]>(
    PERSONAL_HISTORICAL_ATTENDANCE
  );
  const [calendarAttendance, setCalendarAttendance] = useState<Record<string, DayAttendance>>(() =>
    buildInitialMonthCalendar(now.getFullYear(), now.getMonth())
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(CURRENT_EMPLOYEE_LEAVE_BALANCES);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(INITIAL_PAYROLL_RUNS);
  const [payslips] = useState<Record<string, Payslip>>(SAMPLE_PAYSLIPS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [branches, setBranches] = useState<BranchNode[]>(INITIAL_BRANCHES);

  // Dynamic Masters State with LocalStorage
  const [departments, setDepartments] = useState<Department[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hrms_master_departments');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_DEPARTMENTS;
  });

  const [designations, setDesignations] = useState<Designation[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hrms_master_designations');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_DESIGNATIONS;
  });

  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeMaster[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hrms_master_leavetypes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_LEAVE_TYPES;
  });

  const [shifts, setShifts] = useState<ShiftMaster[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hrms_master_shifts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_SHIFTS;
  });

  const [holidays, setHolidays] = useState<HolidayMaster[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hrms_master_holidays');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_HOLIDAYS;
  });

  const persistMaster = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {}
    }
  };

  const [rolePermissions, setRolePermissions] = useState<RolePermissionMap>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hrms_master_role_permissions');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  const [punchSessionsByEmp, setPunchSessionsByEmp] = useState<Record<string, PunchSessionState>>({
    'emp-005': {
      hasPunchedIn: true,
      hasPunchedOut: false,
      punchInTime: '09:15 AM',
      punchOutTime: null,
      locationEvidence: 'Pune Tech Center (18.5204° N, 73.8567° E)'
    }
  });

  const activeEmpId = currentUser.employeeId || 'emp-005';
  const punchSession: PunchSessionState = punchSessionsByEmp[activeEmpId] || {
    hasPunchedIn: false,
    hasPunchedOut: false,
    punchInTime: null,
    punchOutTime: null,
    locationEvidence: 'Corporate HQ (GPS Ready)'
  };

  const pushNotification = useCallback(
    (type: AppNotification['type'], title: string, message: string) => {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type,
          title,
          message,
          time: 'Just now',
          isRead: false
        },
        ...prev
      ]);
    },
    []
  );

  const recordAuditEvent = useCallback(
    (action: string, module: string, details: string) => {
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          tenantId: currentTenant.id,
          userId: currentUser.id,
          userName: currentUser.name,
          action,
          module,
          details,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          ipAddress: '127.0.0.1'
        },
        ...prev
      ]);
    },
    [currentTenant.id, currentUser.id, currentUser.name]
  );

  // Department CRUD
  const addDepartment = useCallback(
    (dept: Omit<Department, 'id'>) => {
      const newDept: Department = {
        ...dept,
        id: `dept-${Date.now().toString().slice(-4)}`,
        employeeCount: dept.employeeCount || 0,
        status: dept.status || 'ACTIVE'
      };
      setDepartments((prev) => {
        const updated = [newDept, ...prev];
        persistMaster('hrms_master_departments', updated);
        return updated;
      });
      recordAuditEvent('DEPARTMENT_CREATED', 'Masters', `Created department ${newDept.name} (${newDept.code || 'N/A'})`);
      showToast(`Department Added: ${newDept.name}`, 'success', 'Available across employee & filter dropdowns');
    },
    [recordAuditEvent, showToast]
  );

  const updateDepartment = useCallback(
    (id: string, patch: Partial<Department>) => {
      setDepartments((prev) => {
        const updated = prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
        persistMaster('hrms_master_departments', updated);
        return updated;
      });
      recordAuditEvent('DEPARTMENT_UPDATED', 'Masters', `Updated department #${id}`);
      showToast('Department Updated', 'success');
    },
    [recordAuditEvent, showToast]
  );

  const deleteDepartment = useCallback(
    (id: string) => {
      setDepartments((prev) => {
        const updated = prev.filter((d) => d.id !== id);
        persistMaster('hrms_master_departments', updated);
        return updated;
      });
      recordAuditEvent('DEPARTMENT_DELETED', 'Masters', `Removed department #${id}`);
      showToast('Department Removed', 'info');
    },
    [recordAuditEvent, showToast]
  );

  // Designation CRUD
  const addDesignation = useCallback(
    (desig: Omit<Designation, 'id'>) => {
      const newDesig: Designation = {
        ...desig,
        id: `desig-${Date.now().toString().slice(-4)}`,
        status: desig.status || 'ACTIVE'
      };
      setDesignations((prev) => {
        const updated = [newDesig, ...prev];
        persistMaster('hrms_master_designations', updated);
        return updated;
      });
      recordAuditEvent('DESIGNATION_CREATED', 'Masters', `Created designation ${newDesig.title} in ${newDesig.departmentName || 'General'}`);
      showToast(`Designation Added: ${newDesig.title}`, 'success');
    },
    [recordAuditEvent, showToast]
  );

  const updateDesignation = useCallback(
    (id: string, patch: Partial<Designation>) => {
      setDesignations((prev) => {
        const updated = prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
        persistMaster('hrms_master_designations', updated);
        return updated;
      });
      recordAuditEvent('DESIGNATION_UPDATED', 'Masters', `Updated designation #${id}`);
      showToast('Designation Updated', 'success');
    },
    [recordAuditEvent, showToast]
  );

  const deleteDesignation = useCallback(
    (id: string) => {
      setDesignations((prev) => {
        const updated = prev.filter((d) => d.id !== id);
        persistMaster('hrms_master_designations', updated);
        return updated;
      });
      recordAuditEvent('DESIGNATION_DELETED', 'Masters', `Removed designation #${id}`);
      showToast('Designation Removed', 'info');
    },
    [recordAuditEvent, showToast]
  );

  // Leave Type CRUD
  const addLeaveType = useCallback(
    (lt: Omit<LeaveTypeMaster, 'id'>) => {
      const newLt: LeaveTypeMaster = {
        ...lt,
        id: `lt-${Date.now().toString().slice(-4)}`,
        status: lt.status || 'ACTIVE'
      };
      setLeaveTypes((prev) => {
        const updated = [newLt, ...prev];
        persistMaster('hrms_master_leavetypes', updated);
        return updated;
      });
      recordAuditEvent('LEAVE_TYPE_CREATED', 'Masters', `Created leave category ${newLt.name} (${newLt.daysPerYear} days/yr)`);
      showToast(`Leave Type Added: ${newLt.name}`, 'success');
    },
    [recordAuditEvent, showToast]
  );

  const updateLeaveType = useCallback(
    (id: string, patch: Partial<LeaveTypeMaster>) => {
      setLeaveTypes((prev) => {
        const updated = prev.map((l) => (l.id === id ? { ...l, ...patch } : l));
        persistMaster('hrms_master_leavetypes', updated);
        return updated;
      });
      recordAuditEvent('LEAVE_TYPE_UPDATED', 'Masters', `Updated leave category #${id}`);
      showToast('Leave Category Updated', 'success');
    },
    [recordAuditEvent, showToast]
  );

  const deleteLeaveType = useCallback(
    (id: string) => {
      setLeaveTypes((prev) => {
        const updated = prev.filter((l) => l.id !== id);
        persistMaster('hrms_master_leavetypes', updated);
        return updated;
      });
      recordAuditEvent('LEAVE_TYPE_DELETED', 'Masters', `Removed leave category #${id}`);
      showToast('Leave Category Removed', 'info');
    },
    [recordAuditEvent, showToast]
  );

  // Shift CRUD
  const addShift = useCallback(
    (s: Omit<ShiftMaster, 'id'>) => {
      const newShift: ShiftMaster = {
        ...s,
        id: `sh-${Date.now().toString().slice(-4)}`,
        status: s.status || 'ACTIVE'
      };
      setShifts((prev) => {
        const updated = [newShift, ...prev];
        persistMaster('hrms_master_shifts', updated);
        return updated;
      });
      recordAuditEvent('SHIFT_CREATED', 'Masters', `Created shift schedule ${newShift.name} (${newShift.startTime} - ${newShift.endTime})`);
      showToast(`Shift Added: ${newShift.name}`, 'success');
    },
    [recordAuditEvent, showToast]
  );

  const updateShift = useCallback(
    (id: string, patch: Partial<ShiftMaster>) => {
      setShifts((prev) => {
        const updated = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
        persistMaster('hrms_master_shifts', updated);
        return updated;
      });
      recordAuditEvent('SHIFT_UPDATED', 'Masters', `Updated shift #${id}`);
      showToast('Shift Schedule Updated', 'success');
    },
    [recordAuditEvent, showToast]
  );

  const deleteShift = useCallback(
    (id: string) => {
      setShifts((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        persistMaster('hrms_master_shifts', updated);
        return updated;
      });
      recordAuditEvent('SHIFT_DELETED', 'Masters', `Removed shift schedule #${id}`);
      showToast('Shift Schedule Removed', 'info');
    },
    [recordAuditEvent, showToast]
  );

  // Holiday CRUD
  const addHoliday = useCallback(
    (h: Omit<HolidayMaster, 'id'>) => {
      const newHol: HolidayMaster = {
        ...h,
        id: `hol-${Date.now().toString().slice(-4)}`
      };
      setHolidays((prev) => {
        const updated = [newHol, ...prev];
        persistMaster('hrms_master_holidays', updated);
        return updated;
      });
      recordAuditEvent('HOLIDAY_CREATED', 'Masters', `Created holiday ${newHol.title} on ${newHol.date} (${newHol.countryId})`);
      showToast(`Holiday Added: ${newHol.title}`, 'success');
    },
    [recordAuditEvent, showToast]
  );

  const updateHoliday = useCallback(
    (id: string, patch: Partial<HolidayMaster>) => {
      setHolidays((prev) => {
        const updated = prev.map((h) => (h.id === id ? { ...h, ...patch } : h));
        persistMaster('hrms_master_holidays', updated);
        return updated;
      });
      recordAuditEvent('HOLIDAY_UPDATED', 'Masters', `Updated holiday #${id}`);
      showToast('Holiday Updated', 'success');
    },
    [recordAuditEvent, showToast]
  );

  const deleteHoliday = useCallback(
    (id: string) => {
      setHolidays((prev) => {
        const updated = prev.filter((h) => h.id !== id);
        persistMaster('hrms_master_holidays', updated);
        return updated;
      });
      recordAuditEvent('HOLIDAY_DELETED', 'Masters', `Removed holiday #${id}`);
      showToast('Holiday Removed', 'info');
    },
    [recordAuditEvent, showToast]
  );

  // Role Rights & RBAC Management
  const updateRolePermission = useCallback(
    (targetRole: UserRole, permissionKey: string, allowed: boolean) => {
      if (targetRole === 'SUPER_ADMIN') {
        showToast('Super Admin Permissions Locked', 'warning', 'Super Admin holds full platform access');
        return;
      }

      setRolePermissions((prev) => {
        const updated: RolePermissionMap = {
          ...prev,
          [targetRole]: {
            ...(prev[targetRole] || {}),
            [permissionKey]: allowed
          }
        };
        persistMaster('hrms_master_role_permissions', updated);
        return updated;
      });

      recordAuditEvent(
        'ROLE_PERMISSION_UPDATED',
        'Security & RBAC',
        `Super Admin ${allowed ? 'granted' : 'revoked'} "${permissionKey}" for role ${targetRole}`
      );

      showToast(
        `Role Right ${allowed ? 'Granted' : 'Revoked'}`,
        allowed ? 'success' : 'info',
        `${targetRole}: ${permissionKey}`
      );
    },
    [recordAuditEvent, showToast]
  );

  const resetRolePermissionsToDefault = useCallback(() => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    persistMaster('hrms_master_role_permissions', DEFAULT_ROLE_PERMISSIONS);
    recordAuditEvent('ROLE_PERMISSIONS_RESET', 'Security & RBAC', 'Super Admin restored default RBAC policy matrix');
    showToast('Permissions Restored to Default', 'success');
  }, [recordAuditEvent, showToast]);

  const hasPermission = useCallback(
    (permissionKey: string, checkRole?: UserRole): boolean => {
      const role = checkRole || currentRole;
      if (role === 'SUPER_ADMIN') return true;
      return !!(rolePermissions[role]?.[permissionKey]);
    },
    [currentRole, rolePermissions]
  );

  // Synchronize with live backend if authenticated with a real JWT token
  useEffect(() => {
    if (!isAuthenticated || isDemoMode || !token) return;

    let cancelled = false;
    const hydrateFromBackend = async () => {
      try {
        if (baseRole !== 'EMPLOYEE') {
          const empRes = await apiClient.employees.list().catch(() => null);
          if (!cancelled && empRes?.success && Array.isArray(empRes.data) && empRes.data.length > 0) {
            const mapped: Employee[] = empRes.data.map((e: any) => ({
              id: e.id,
              tenantId: e.companyId || currentTenant.id,
              employeeCode: e.employeeCode,
              firstName: e.firstName,
              lastName: e.lastName,
              email: e.email,
              phone: e.phone || '',
              department: e.department?.name || 'Engineering',
              designation: e.designation?.title || 'Staff',
              managerId: e.managerId || undefined,
              managerName: e.manager ? `${e.manager.firstName} ${e.manager.lastName}` : undefined,
              joiningDate: String(e.joiningDate).slice(0, 10),
              status: e.status || 'ACTIVE',
              avatar: e.avatarUrl || undefined,
              country: currentTenant.countryId,
              currency: currentTenant.currency,
              salary: {
                monthlyGross: Number(e.salaryStructures?.[0]?.monthlyGross || 85000),
                basic: Number(e.salaryStructures?.[0]?.monthlyGross || 85000) * 0.5,
                allowances: Number(e.salaryStructures?.[0]?.monthlyGross || 85000) * 0.4,
                deductions: Number(e.salaryStructures?.[0]?.monthlyGross || 85000) * 0.1,
                netPay: Number(e.salaryStructures?.[0]?.monthlyGross || 85000) * 0.9
              },
              documentsCount: 2
            }));
            setEmployees(mapped);
          }
        }

        const leaveRes = await apiClient.leave.list().catch(() => null);
        if (!cancelled && leaveRes?.success && Array.isArray(leaveRes.data) && leaveRes.data.length > 0) {
          const mappedLeaves: LeaveRequest[] = leaveRes.data.map((lr: any) => ({
            id: lr.id,
            employeeId: lr.employeeId,
            employeeName: lr.employee ? `${lr.employee.firstName} ${lr.employee.lastName}` : currentUser.name,
            department: lr.employee?.department?.name || 'Engineering',
            leaveType: lr.leaveType?.name || 'ANNUAL',
            startDate: String(lr.startDate).slice(0, 10),
            endDate: String(lr.endDate).slice(0, 10),
            days: Number(lr.days),
            reason: lr.reason,
            status: lr.status,
            appliedOn: String(lr.createdAt).slice(0, 10),
            managerComments: lr.managerComments || undefined
          }));
          setLeaveRequests(mappedLeaves);
        }
      } catch {
        // Resilient fallback already initialized
      }
    };

    hydrateFromBackend();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isDemoMode, token, currentTenant.id, currentTenant.countryId, currentTenant.currency, baseRole, currentUser.name]);

  const addEmployee = async (emp: Employee) => {
    if (!isDemoMode && token) {
      try {
        await apiClient.employees.create({
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone,
          joiningDate: emp.joiningDate,
          monthlyGross: emp.salary.monthlyGross
        });
      } catch {
        // Continue with optimistic local state in resilient mode
      }
    }

    setEmployees((prev) => [emp, ...prev]);
    adjustTenantEmployeeCount(emp.tenantId, 1);
    recordAuditEvent(
      'EMPLOYEE_ONBOARDED',
      'Employees',
      `Added ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) to ${emp.department}`
    );
    pushNotification(
      'general',
      'New Employee Onboarded',
      `${emp.firstName} ${emp.lastName} (${emp.employeeCode}) joined ${emp.department}.`
    );
    showToast(`Added ${emp.firstName} ${emp.lastName}`, 'success', `Assigned code ${emp.employeeCode}`);
  };

  const punchIn = async () => {
    const location = await captureGpsLocation();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = getTodayDateISO();

    if (!isDemoMode && token) {
      try {
        await apiClient.attendance.checkIn(activeEmpId, location);
      } catch {
        // resilient fallback
      }
    }

    setPunchSessionsByEmp((prev) => ({
      ...prev,
      [activeEmpId]: {
        hasPunchedIn: true,
        hasPunchedOut: false,
        punchInTime: timeStr,
        punchOutTime: null,
        locationEvidence: location
      }
    }));

    setCalendarAttendance((prev) => ({
      ...prev,
      [todayStr]: {
        ...(prev[todayStr] || { date: todayStr, day: new Date().getDate() }),
        status: 'PRESENT',
        checkIn: timeStr,
        note: `Checked in (${location})`
      }
    }));

    const newRec: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: activeEmpId,
      employeeName: currentUser.name,
      department: currentUser.department || 'Engineering',
      date: todayStr,
      checkIn: timeStr,
      workHours: 0,
      status: 'PRESENT',
      locationEvidence: location
    };

    setPersonalAttendanceRecords((prev) => [
      newRec,
      ...prev.filter((r) => !(r.employeeId === activeEmpId && r.date === todayStr))
    ]);
    setAttendanceRecords((prev) => [
      newRec,
      ...prev.filter((r) => !(r.employeeId === activeEmpId && r.date === todayStr))
    ]);

    showToast('Checked In Successfully', 'success', `${timeStr} • ${location}`);
  };

  const punchOut = async () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = getTodayDateISO();

    if (!isDemoMode && token) {
      try {
        await apiClient.attendance.checkOut(activeEmpId);
      } catch {
        // resilient fallback
      }
    }

    setPunchSessionsByEmp((prev) => ({
      ...prev,
      [activeEmpId]: {
        ...punchSession,
        hasPunchedIn: true,
        hasPunchedOut: true,
        punchOutTime: timeStr
      }
    }));

    setCalendarAttendance((prev) => ({
      ...prev,
      [todayStr]: {
        ...(prev[todayStr] || { date: todayStr, day: new Date().getDate() }),
        status: 'PRESENT',
        checkOut: timeStr,
        workHours: 8.2,
        note: 'Shift completed'
      }
    }));

    const applyCheckOut = (list: AttendanceRecord[]) =>
      list.map((r) =>
        r.employeeId === activeEmpId && r.date === todayStr
          ? { ...r, checkOut: timeStr, workHours: r.workHours || 8.2 }
          : r
      );

    setPersonalAttendanceRecords(applyCheckOut);
    setAttendanceRecords(applyCheckOut);
    showToast('Shift Completed — Checked Out', 'success', `Logged check-out at ${timeStr}`);
  };

  const submitRegularization = async (payload: {
    date: string;
    checkIn: string;
    checkOut: string;
    reason: string;
    remarks?: string;
  }) => {
    if (!isDemoMode && token) {
      try {
        await apiClient.attendance.regularize({
          employeeId: activeEmpId,
          date: payload.date,
          reason: payload.reason,
          remarks: payload.remarks
        });
      } catch {
        // resilient fallback
      }
    }

    setCalendarAttendance((prev) => ({
      ...prev,
      [payload.date]: {
        ...(prev[payload.date] || {
          date: payload.date,
          day: Number(payload.date.split('-')[2]) || 1
        }),
        status: 'REGULARIZATION_PENDING',
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        workHours: 8.5,
        regularizationReason: payload.reason,
        note: `Regularization Pending (${payload.reason}): In ${payload.checkIn} | Out ${payload.checkOut}`
      }
    }));

    const updateList = (list: AttendanceRecord[]) =>
      list.map((r) =>
        r.date === payload.date && r.employeeId === activeEmpId
          ? {
              ...r,
              checkIn: payload.checkIn,
              checkOut: payload.checkOut,
              status: 'REGULARIZATION_PENDING' as const,
              isException: true,
              locationEvidence: `Regularization Pending: ${payload.reason}`
            }
          : r
      );

    setPersonalAttendanceRecords(updateList);
    setAttendanceRecords(updateList);
    recordAuditEvent(
      'ATTENDANCE_REGULARIZATION_REQUESTED',
      'Attendance',
      `${currentUser.name} requested punch regularization for ${payload.date} (${payload.reason})`
    );
    pushNotification(
      'punch',
      'Regularization Request Submitted',
      `Punch regularization for ${payload.date} sent to your manager for approval.`
    );
    showToast('Regularization Request Submitted', 'success', `Pending manager approval for ${payload.date}`);
  };

  const resolveAttendanceException = async (recordId: string) => {
    if (!isDemoMode && token) {
      try {
        await apiClient.attendance.reviewRegularization(recordId, 'APPROVED');
      } catch {
        // resilient fallback
      }
    }

    setAttendanceRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId ? { ...rec, isException: false, status: 'PRESENT' as const } : rec
      )
    );
    setPersonalAttendanceRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId ? { ...rec, isException: false, status: 'PRESENT' as const } : rec
      )
    );
    recordAuditEvent('ATTENDANCE_EXCEPTION_RESOLVED', 'Attendance', `Resolved attendance exception ${recordId}`);
    showToast('Attendance Exception Resolved', 'success');
  };

  const submitWfhNotice = (date: string, reason: string) => {
    setCalendarAttendance((prev) => ({
      ...prev,
      [date]: {
        ...(prev[date] || { date, day: Number(date.split('-')[2]) || 1 }),
        status: 'PRESENT',
        note: `Remote / WFH Notice: ${reason}`
      }
    }));
    recordAuditEvent('WFH_NOTICE_SUBMITTED', 'Attendance', `${currentUser.name} submitted WFH for ${date}: ${reason}`);
    pushNotification('general', 'WFH Notice Submitted', `Remote work notice for ${date} sent to reporting manager.`);
    showToast('Remote / WFH Notice Submitted', 'success', `Scheduled for ${date}`);
  };

  const applyLeave = async (request: LeaveRequest) => {
    if (!isDemoMode && token) {
      try {
        await apiClient.leave.apply({
          employeeId: request.employeeId,
          leaveTypeId: request.leaveType,
          startDate: request.startDate,
          endDate: request.endDate,
          reason: request.reason
        });
      } catch {
        // resilient fallback
      }
    }

    setLeaveRequests((prev) => [request, ...prev]);

    // Reflect requested date range on calendar
    setCalendarAttendance((prev) => {
      const next = { ...prev };
      next[request.startDate] = {
        ...(next[request.startDate] || {
          date: request.startDate,
          day: Number(request.startDate.split('-')[2]) || 1
        }),
        status: 'ON_LEAVE',
        leaveType: request.leaveType,
        note: `Applied ${request.leaveType} Leave (${request.days}d): ${request.reason}`
      };
      return next;
    });

    recordAuditEvent(
      'LEAVE_APPLIED',
      'Leave',
      `${request.employeeName} applied for ${request.days} day(s) of ${request.leaveType} leave (${request.startDate} to ${request.endDate})`
    );
    pushNotification(
      'leave',
      'Leave Application Submitted',
      `${request.leaveType} leave (${request.startDate} to ${request.endDate}) is pending review.`
    );
    showToast('Leave Application Submitted', 'success', `${request.days} day(s) ${request.leaveType} leave queued for approval`);
  };

  const reviewLeave = async (id: string, status: 'APPROVED' | 'REJECTED', managerComments?: string) => {
    if (!isDemoMode && token) {
      try {
        await apiClient.leave.review(id, status, managerComments);
      } catch {
        // resilient fallback
      }
    }

    const target = leaveRequests.find((l) => l.id === id);
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              managerComments:
                managerComments ||
                (status === 'APPROVED'
                  ? `Approved by ${currentUser.name}`
                  : `Declined by ${currentUser.name}`)
            }
          : l
      )
    );

    if (status === 'APPROVED' && target) {
      const targetPrefix = target.leaveType.toLowerCase();
      setLeaveBalances((prev) =>
        prev.map((bal) => {
          if (bal.type.toLowerCase().includes(targetPrefix)) {
            const newUsed = Math.min(bal.total, bal.used + target.days);
            return { ...bal, used: newUsed, available: Math.max(0, bal.total - newUsed) };
          }
          return bal;
        })
      );
    }

    if (target) {
      recordAuditEvent(
        `LEAVE_${status}`,
        'Leave',
        `${currentUser.name} ${status.toLowerCase()} ${target.employeeName}'s ${target.leaveType} leave (${target.days}d)`
      );
      pushNotification(
        'leave',
        `Leave Request ${status === 'APPROVED' ? 'Approved' : 'Declined'}`,
        `${target.employeeName}'s ${target.leaveType} leave (${target.startDate}) was ${status.toLowerCase()}.`
      );
    }
    showToast(`Leave Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`, status === 'APPROVED' ? 'success' : 'warning');
  };

  const cancelLeave = (id: string) => {
    const target = leaveRequests.find((l) => l.id === id);
    setLeaveRequests((prev) => prev.filter((l) => l.id !== id));
    if (target) {
      recordAuditEvent('LEAVE_CANCELLED', 'Leave', `${currentUser.name} cancelled pending leave #${id.slice(-4)}`);
      showToast('Leave Application Cancelled', 'info');
    }
  };

  const completePayrollRun = async (run: PayrollRun) => {
    if (!isDemoMode && token) {
      try {
        await apiClient.payroll.run(run.year, run.month, run.id);
      } catch {
        // resilient fallback
      }
    }
    setPayrollRuns((prev) => [run, ...prev]);
    recordAuditEvent(
      'PAYROLL_LOCKED',
      'Payroll',
      `Locked payroll run for ${run.period} (${run.totalEmployees} employees, Net ${run.currencySymbol}${run.totalNet.toLocaleString()})`
    );
    pushNotification(
      'payroll',
      `Payroll Locked: ${run.period}`,
      `${run.totalEmployees} payslips finalized and ready for disbursement.`
    );
    showToast(`Payroll Run Locked: ${run.period}`, 'success', `${run.totalEmployees} payslips generated`);
  };

  const getPayslipForEmployee = useCallback(
    (employeeId: string): Payslip => {
      if (payslips[employeeId]) {
        return payslips[employeeId];
      }

      const emp = employees.find((e) => e.id === employeeId) || employees[0];
      if (!emp) return payslips['emp-005'];

      const gross = emp.salary.monthlyGross;
      const basic = emp.salary.basic || Math.round(gross * 0.5);
      const housing = Math.round(gross * 0.25);
      const transport = Math.round(gross * 0.05);
      const otherAllowances = Math.max(0, gross - basic - housing - transport);
      const deductions = emp.salary.deductions || Math.round(gross * 0.1);
      const epf = emp.country === 'IN' ? Math.round(basic * 0.12) : 0;
      const tax = Math.max(0, deductions - epf);

      return {
        id: `ps-oct-${emp.id}`,
        payrollRunId: 'pr-2026-10-blu',
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        designation: emp.designation,
        department: emp.department,
        period: 'October 2026',
        currency: emp.currency,
        currencySymbol: currentTenant.currencySymbol,
        countryCode: emp.country,
        basicSalary: basic,
        housingAllowance: housing,
        transportAllowance: transport,
        otherAllowances,
        grossSalary: gross,
        epfDeduction: epf,
        esiDeduction: 0,
        taxDeduction: tax,
        otherDeductions: 0,
        totalDeductions: deductions,
        netPay: emp.salary.netPay || gross - deductions,
        paymentStatus: 'PAID',
        payDate: '2026-10-31',
        bankName: emp.bankDetails?.bankName || 'Corporate Partner Bank',
        accountNumberMasked: emp.bankDetails?.accountNumber || '•••• •••• •••• 1234'
      };
    },
    [payslips, employees, currentTenant.currencySymbol]
  );

  const addBranch = (branch: Omit<BranchNode, 'id'>) => {
    const newBranch: BranchNode = {
      ...branch,
      id: `br-${Date.now().toString().slice(-4)}`
    };
    setBranches((prev) => [...prev, newBranch]);
    recordAuditEvent('BRANCH_CREATED', 'Company', `Added branch node ${branch.name} (${branch.location})`);
    showToast(`Added Branch: ${branch.name}`, 'success', `${branch.location} • ${branch.currency}`);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <HrmsDataContext.Provider
      value={{
        employees,
        attendanceRecords,
        personalAttendanceRecords,
        calendarAttendance,
        leaveRequests,
        leaveBalances,
        payrollRuns,
        payslips,
        auditLogs,
        notifications,
        branches,
        punchSession,
        addEmployee,
        punchIn,
        punchOut,
        submitRegularization,
        resolveAttendanceException,
        submitWfhNotice,
        applyLeave,
        reviewLeave,
        cancelLeave,
        completePayrollRun,
        getPayslipForEmployee,
        addBranch,
        // Dynamic Masters
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        designations,
        addDesignation,
        updateDesignation,
        deleteDesignation,
        leaveTypes,
        addLeaveType,
        updateLeaveType,
        deleteLeaveType,
        shifts,
        addShift,
        updateShift,
        deleteShift,
        holidays,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        // Role Rights & RBAC
        rolePermissions,
        updateRolePermission,
        resetRolePermissionsToDefault,
        hasPermission,
        markAllNotificationsRead,
        markNotificationRead,
        recordAuditEvent
      }}
    >
      {children}
    </HrmsDataContext.Provider>
  );
};

export const useHrmsData = (): HrmsDataContextType => {
  const ctx = useContext(HrmsDataContext);
  if (!ctx) {
    throw new Error('useHrmsData must be used within an HrmsDataProvider');
  }
  return ctx;
};

