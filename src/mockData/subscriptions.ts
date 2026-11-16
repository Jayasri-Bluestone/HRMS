import { SubscriptionPlan, AuditLog } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter Tier',
    priceMonthly: 49,
    priceYearly: 490,
    employeeLimit: 25,
    features: [
      'Up to 25 Employees',
      'Attendance & GPS Check-in',
      'Leave Management & Approvals',
      'Single-Country Payroll',
      'Standard Payslips PDF',
      'Email Support'
    ]
  },
  {
    id: 'plan-growth',
    name: 'Growth Tier',
    priceMonthly: 129,
    priceYearly: 1290,
    employeeLimit: 150,
    popular: true,
    features: [
      'Up to 150 Employees',
      'Multi-Branch & Departments',
      'GPS & Shift Management',
      'Multi-Country Payroll Engine',
      'Automated Statutory Deductions',
      'Manager Hierarchy Approvals',
      'Employee Mobile Self-Service',
      'Audit Logs & Reports'
    ]
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Tier',
    priceMonthly: 299,
    priceYearly: 2990,
    employeeLimit: 1000,
    features: [
      'Unlimited Employees',
      'Custom Multi-Country Tax Rules',
      'API Access & Webhooks',
      'Custom Roles & Granular RBAC',
      'Priority 24/7 SLA Support',
      'Dedicated Account Manager',
      'SSO & SAML Integration'
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    tenantId: 'tenant-bluestone-in',
    userId: 'user-priya',
    userName: 'Priya Nair (HR Head)',
    action: 'PAYROLL_LOCKED',
    module: 'Payroll Engine',
    details: 'Locked and finalized October 2026 payroll run (pr-2026-10-blu) for 84 employees.',
    timestamp: '2026-10-31 18:30:15',
    ipAddress: '14.143.12.98'
  },
  {
    id: 'audit-002',
    tenantId: 'tenant-bluestone-in',
    userId: 'user-priya',
    userName: 'Priya Nair (HR Head)',
    action: 'SALARY_STRUCTURE_UPDATED',
    module: 'Compensation',
    details: 'Updated salary structure for BLU-005 (Rohan Deshmukh) - Effective from 2026-11-01',
    timestamp: '2026-10-28 14:12:00',
    ipAddress: '14.143.12.98'
  },
  {
    id: 'audit-003',
    tenantId: 'tenant-bluestone-in',
    userId: 'user-arjun',
    userName: 'Arjun Mehta (Lead)',
    action: 'LEAVE_APPROVED',
    module: 'Leave Workflow',
    details: 'Approved 2 days sick leave for BLU-006 (Sunita Rao)',
    timestamp: '2026-11-10 10:45:22',
    ipAddress: '49.207.199.14'
  },
  {
    id: 'audit-004',
    tenantId: 'system',
    userId: 'system-superadmin',
    userName: 'SaaS Platform Engine',
    action: 'TENANT_ONBOARDED',
    module: 'Multi-Tenant Core',
    details: 'Provisioned new tenant "Apex Innovations Pte" with Starter trial plan.',
    timestamp: '2026-10-01 09:00:00',
    ipAddress: '127.0.0.1'
  }
];

