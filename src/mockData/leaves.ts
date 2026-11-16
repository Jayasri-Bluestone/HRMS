import { LeaveRequest, LeaveBalance } from '../types';

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'lr-101',
    employeeId: 'emp-005',
    employeeName: 'Rohan Deshmukh',
    department: 'Engineering',
    leaveType: 'ANNUAL',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    days: 3,
    reason: 'Family wedding ceremony in hometown',
    status: 'PENDING',
    appliedOn: '2026-11-10'
  },
  {
    id: 'lr-102',
    employeeId: 'emp-006',
    employeeName: 'Sunita Rao',
    department: 'Sales & Growth',
    leaveType: 'SICK',
    startDate: '2026-11-11',
    endDate: '2026-11-12',
    days: 2,
    reason: 'Viral fever and prescribed medical rest',
    status: 'APPROVED',
    appliedOn: '2026-11-10',
    managerComments: 'Approved. Get well soon!'
  },
  {
    id: 'lr-103',
    employeeId: 'emp-004',
    employeeName: 'Ananya Iyer',
    department: 'Product',
    leaveType: 'CASUAL',
    startDate: '2026-11-18',
    endDate: '2026-11-18',
    days: 1,
    reason: 'Personal administration and passport renewal',
    status: 'APPROVED',
    appliedOn: '2026-11-08',
    managerComments: 'Approved.'
  },
  {
    id: 'lr-104',
    employeeId: 'emp-003',
    employeeName: 'Arjun Mehta',
    department: 'Engineering',
    leaveType: 'ANNUAL',
    startDate: '2026-12-24',
    endDate: '2026-12-31',
    days: 6,
    reason: 'Year-end family vacation',
    status: 'PENDING',
    appliedOn: '2026-11-09'
  }
];

export const CURRENT_EMPLOYEE_LEAVE_BALANCES: LeaveBalance[] = [
  { type: 'Annual Leave', total: 18, used: 6, available: 12 },
  { type: 'Sick Leave', total: 10, used: 2, available: 8 },
  { type: 'Casual Leave', total: 6, used: 2, available: 4 },
  { type: 'Optional Holiday', total: 2, used: 1, available: 1 }
];

