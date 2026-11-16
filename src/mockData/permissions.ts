import { PermissionItem, RolePermissionMap, UserRole } from '../types';

export const SYSTEM_PERMISSIONS: PermissionItem[] = [
  // 1. Dynamic Masters
  {
    key: 'masters:view',
    category: 'Dynamic Masters',
    label: 'View Platform Masters Hub',
    description: 'Allows accessing the centralized master data management console.'
  },
  {
    key: 'masters:departments:edit',
    category: 'Dynamic Masters',
    label: 'Manage Departments Master',
    description: 'Create, update, and remove corporate departments and codes.'
  },
  {
    key: 'masters:designations:edit',
    category: 'Dynamic Masters',
    label: 'Manage Designations Master',
    description: 'Define and modify standardized job titles, grades, and roles.'
  },
  {
    key: 'masters:leaves:edit',
    category: 'Dynamic Masters',
    label: 'Manage Leave Categories Master',
    description: 'Configure annual leave quotas, paid leave policies, and LOP rules.'
  },
  {
    key: 'masters:shifts:edit',
    category: 'Dynamic Masters',
    label: 'Manage Shift Schedules Master',
    description: 'Set up work hours, grace periods, and shift rotation windows.'
  },
  {
    key: 'masters:holidays:edit',
    category: 'Dynamic Masters',
    label: 'Manage Holiday Calendar Master',
    description: 'Maintain national, regional, and company public holiday schedules.'
  },
  {
    key: 'masters:branches:edit',
    category: 'Dynamic Masters',
    label: 'Manage Office Branches Master',
    description: 'Provision new physical office nodes, currency anchors, and entities.'
  },
  {
    key: 'masters:roles:edit',
    category: 'Dynamic Masters',
    label: 'Configure Role Rights & RBAC Policy',
    description: 'Assign or revoke fine-grained permissions for non-Super Admin roles.'
  },

  // 2. Workforce & Employees
  {
    key: 'workforce:view',
    category: 'Workforce & Employees',
    label: 'View Workforce Directory',
    description: 'Inspect company employee profiles, contact information, and roles.'
  },
  {
    key: 'workforce:create',
    category: 'Workforce & Employees',
    label: 'Onboard New Employees',
    description: 'Provision new employee profiles, assign codes, and generate credentials.'
  },
  {
    key: 'workforce:edit',
    category: 'Workforce & Employees',
    label: 'Edit Employee Records',
    description: 'Modify department assignments, reporting hierarchy, and job details.'
  },
  {
    key: 'workforce:salary:edit',
    category: 'Workforce & Employees',
    label: 'Manage Compensation Structures',
    description: 'Adjust monthly gross, basic salary, allowances, and deductions.'
  },

  // 3. Attendance & Shifts
  {
    key: 'attendance:view_all',
    category: 'Attendance & Shifts',
    label: 'View Global Attendance Ledger',
    description: 'Inspect live daily punch feed, clock-in times, and work hours.'
  },
  {
    key: 'attendance:regularize',
    category: 'Attendance & Shifts',
    label: 'Submit Regularization Requests',
    description: 'File regularization for missed check-ins or biometric failures.'
  },
  {
    key: 'attendance:approve',
    category: 'Attendance & Shifts',
    label: 'Approve Attendance Exceptions',
    description: 'Review and approve/reject employee regularization requests.'
  },

  // 4. Leave Management
  {
    key: 'leaves:apply',
    category: 'Leave Management',
    label: 'Apply for Leaves',
    description: 'Submit leave applications across casual, sick, or paid categories.'
  },
  {
    key: 'leaves:approve',
    category: 'Leave Management',
    label: 'Approve / Reject Leave Requests',
    description: 'Authoritative sign-off on subordinate leave applications.'
  },
  {
    key: 'leaves:override',
    category: 'Leave Management',
    label: 'Administrative Leave Overrides',
    description: 'Override leave balance deductions and credit discretionary quotas.'
  },

  // 5. Payroll & Statutory
  {
    key: 'payroll:view',
    category: 'Payroll & Statutory',
    label: 'View Company Payroll Ledgers',
    description: 'Inspect payroll batches, company spend, and tax deductions.'
  },
  {
    key: 'payroll:run',
    category: 'Payroll & Statutory',
    label: 'Execute 1-Click Payroll Calculation',
    description: 'Trigger monthly statutory payroll engine across country tax adapters.'
  },
  {
    key: 'payroll:approve',
    category: 'Payroll & Statutory',
    label: 'Approve & Lock Payroll Runs',
    description: 'Finalize payslip generation and authorize disbursement ledgers.'
  },

  // 6. Security & Governance
  {
    key: 'audit:view',
    category: 'Security & Governance',
    label: 'Access Immutable Audit Trail',
    description: 'Review timestamped security logs, user actions, and login history.'
  },
  {
    key: 'tenants:switch',
    category: 'Security & Governance',
    label: 'Cross-Tenant Workspace Switching',
    description: 'Inspect different company organizations and international branches.'
  }
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMap = {
  SUPER_ADMIN: {
    'masters:view': true,
    'masters:departments:edit': true,
    'masters:designations:edit': true,
    'masters:leaves:edit': true,
    'masters:shifts:edit': true,
    'masters:holidays:edit': true,
    'masters:branches:edit': true,
    'masters:roles:edit': true,
    'workforce:view': true,
    'workforce:create': true,
    'workforce:edit': true,
    'workforce:salary:edit': true,
    'attendance:view_all': true,
    'attendance:regularize': true,
    'attendance:approve': true,
    'leaves:apply': true,
    'leaves:approve': true,
    'leaves:override': true,
    'payroll:view': true,
    'payroll:run': true,
    'payroll:approve': true,
    'audit:view': true,
    'tenants:switch': true
  },
  COMPANY_ADMIN: {
    'masters:view': true,
    'masters:departments:edit': true,
    'masters:designations:edit': false,
    'masters:leaves:edit': false,
    'masters:shifts:edit': true,
    'masters:holidays:edit': false,
    'masters:branches:edit': true,
    'masters:roles:edit': false,
    'workforce:view': true,
    'workforce:create': true,
    'workforce:edit': true,
    'workforce:salary:edit': true,
    'attendance:view_all': true,
    'attendance:regularize': true,
    'attendance:approve': true,
    'leaves:apply': true,
    'leaves:approve': true,
    'leaves:override': true,
    'payroll:view': true,
    'payroll:run': true,
    'payroll:approve': true,
    'audit:view': true,
    'tenants:switch': false
  },
  HR_ADMIN: {
    'masters:view': true,
    'masters:departments:edit': true,
    'masters:designations:edit': true,
    'masters:leaves:edit': true,
    'masters:shifts:edit': false,
    'masters:holidays:edit': true,
    'masters:branches:edit': false,
    'masters:roles:edit': false,
    'workforce:view': true,
    'workforce:create': true,
    'workforce:edit': true,
    'workforce:salary:edit': false,
    'attendance:view_all': true,
    'attendance:regularize': true,
    'attendance:approve': true,
    'leaves:apply': true,
    'leaves:approve': true,
    'leaves:override': false,
    'payroll:view': true,
    'payroll:run': true,
    'payroll:approve': false,
    'audit:view': true,
    'tenants:switch': false
  },
  MANAGER: {
    'masters:view': false,
    'masters:departments:edit': false,
    'masters:designations:edit': false,
    'masters:leaves:edit': false,
    'masters:shifts:edit': false,
    'masters:holidays:edit': false,
    'masters:branches:edit': false,
    'masters:roles:edit': false,
    'workforce:view': true,
    'workforce:create': false,
    'workforce:edit': false,
    'workforce:salary:edit': false,
    'attendance:view_all': true,
    'attendance:regularize': true,
    'attendance:approve': true,
    'leaves:apply': true,
    'leaves:approve': true,
    'leaves:override': false,
    'payroll:view': false,
    'payroll:run': false,
    'payroll:approve': false,
    'audit:view': false,
    'tenants:switch': false
  },
  EMPLOYEE: {
    'masters:view': false,
    'masters:departments:edit': false,
    'masters:designations:edit': false,
    'masters:leaves:edit': false,
    'masters:shifts:edit': false,
    'masters:holidays:edit': false,
    'masters:branches:edit': false,
    'masters:roles:edit': false,
    'workforce:view': false,
    'workforce:create': false,
    'workforce:edit': false,
    'workforce:salary:edit': false,
    'attendance:view_all': false,
    'attendance:regularize': true,
    'attendance:approve': false,
    'leaves:apply': true,
    'leaves:approve': false,
    'leaves:override': false,
    'payroll:view': false,
    'payroll:run': false,
    'payroll:approve': false,
    'audit:view': false,
    'tenants:switch': false
  }
};

