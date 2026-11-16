import { AttendanceRecord } from '../types';

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-001',
    employeeId: 'emp-001',
    employeeName: 'Vikram Sharma',
    department: 'Engineering',
    date: '2026-11-11',
    checkIn: '09:05 AM',
    checkOut: '06:15 PM',
    workHours: 8.5,
    status: 'PRESENT',
    locationEvidence: 'Mumbai HQ Office (19.0760° N, 72.8777° E)',
    ipAddress: '14.143.12.98'
  },
  {
    id: 'att-002',
    employeeId: 'emp-002',
    employeeName: 'Priya Nair',
    department: 'Human Resources',
    date: '2026-11-11',
    checkIn: '08:58 AM',
    checkOut: '05:45 PM',
    workHours: 8.2,
    status: 'PRESENT',
    locationEvidence: 'Mumbai HQ Office (19.0760° N, 72.8777° E)',
    ipAddress: '14.143.12.98'
  },
  {
    id: 'att-003',
    employeeId: 'emp-003',
    employeeName: 'Arjun Mehta',
    department: 'Engineering',
    date: '2026-11-11',
    checkIn: '09:42 AM',
    checkOut: '06:50 PM',
    workHours: 8.1,
    status: 'LATE',
    locationEvidence: 'Remote / Work From Home (Bangalore)',
    ipAddress: '49.207.199.14',
    isException: true
  },
  {
    id: 'att-004',
    employeeId: 'emp-004',
    employeeName: 'Ananya Iyer',
    department: 'Product',
    date: '2026-11-11',
    checkIn: '09:00 AM',
    checkOut: undefined,
    workHours: 5.0,
    status: 'PRESENT',
    locationEvidence: 'Mumbai HQ Office (19.0760° N, 72.8777° E)',
    ipAddress: '14.143.12.98'
  },
  {
    id: 'att-005',
    employeeId: 'emp-005',
    employeeName: 'Rohan Deshmukh',
    department: 'Engineering',
    date: '2026-11-11',
    checkIn: '09:15 AM',
    checkOut: undefined,
    workHours: 4.8,
    status: 'PRESENT',
    locationEvidence: 'Pune Tech Center (18.5204° N, 73.8567° E)',
    ipAddress: '115.112.44.22'
  },
  {
    id: 'att-006',
    employeeId: 'emp-006',
    employeeName: 'Sunita Rao',
    department: 'Sales & Growth',
    date: '2026-11-11',
    workHours: 0,
    status: 'ON_LEAVE',
    locationEvidence: 'Pre-approved Sick Leave'
  }
];

