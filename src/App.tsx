import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { HrmsDataProvider, useHrmsData } from './contexts/HrmsDataContext';
import { Layout } from './components/layout/Layout';

// Module views
import { BentoDashboard } from './modules/dashboard/BentoDashboard';
import { CompanyAdminDashboard } from './modules/dashboard/CompanyAdminDashboard';
import { SuperAdminDashboard } from './modules/dashboard/SuperAdminDashboard';
import { ManagerDashboard } from './modules/dashboard/ManagerDashboard';
import { EmployeeDashboard } from './modules/dashboard/EmployeeDashboard';
import { EmployeeList } from './modules/employees/EmployeeList';
import { AttendanceView } from './modules/attendance/AttendanceView';
import { LeaveManagement } from './modules/leave/LeaveManagement';
import { PayrollOverview } from './modules/payroll/PayrollOverview';
import { EmployeePayslipsView } from './modules/payroll/EmployeePayslipsView';
import { EmployeeProfileView } from './modules/profile/EmployeeProfileView';
import { BillingView } from './modules/billing/BillingView';
import { AuditLogsView } from './modules/audit/AuditLogsView';
import { ReportsView } from './modules/reports/ReportsView';
import { PlatformMastersView } from './modules/masters/PlatformMastersView';

// Modals
import { ApplyLeaveModal } from './modules/leave/ApplyLeaveModal';
import { AddEmployeeModal } from './modules/employees/AddEmployeeModal';
import { PayslipModal } from './modules/payroll/PayslipModal';
import { LoginPage } from './modules/auth/LoginPage';
import { Payslip } from './types';

/**
 * Authenticated Application Component
 * Mounted ONLY when user is authenticated.
 */
const AuthenticatedApp: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const { applyLeave, addEmployee, getPayslipForEmployee } = useHrmsData();

  const [currentTab, setCurrentTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash && hash !== 'login' ? hash : 'dashboard';
  });

  // Shared modals state
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [applyLeaveInitialDate, setApplyLeaveInitialDate] = useState<string | undefined>(undefined);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [activePayslip, setActivePayslip] = useState<Payslip | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  useEffect(() => {
    setCurrentTab('dashboard');
    window.location.hash = 'dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRole]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentTab && hash !== 'login') {
        setCurrentTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentTab]);

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenApplyLeave = (dateStr?: string) => {
    setApplyLeaveInitialDate(dateStr);
    setIsApplyLeaveOpen(true);
  };

  const handleOpenPayslip = (slip?: Payslip) => {
    setActivePayslip(slip || getPayslipForEmployee(currentUser.employeeId || 'emp-005'));
    setIsPayslipOpen(true);
  };

  // Strict per-role route whitelists so no role can access another role's screens via URL hash
  const renderContent = () => {
    const tab = currentTab.toLowerCase();

    // 1. SUPER_ADMIN: Global Platform Control, Management, Maintenance, and Creation across all modules
    if (currentRole === 'SUPER_ADMIN') {
      switch (tab) {
        case 'tenants':
          return <SuperAdminDashboard viewMode="tenants" onNavigateTab={handleSelectTab} />;
        case 'masters':
        case 'master':
          return <PlatformMastersView />;
        case 'employees':
        case 'team':
        case 'workforce':
          return <EmployeeList />;
        case 'attendance':
        case 'calendar':
          return <AttendanceView />;
        case 'leave':
        case 'leaves':
        case 'projects':
          return <LeaveManagement />;
        case 'payroll':
          return <PayrollOverview />;
        case 'reports':
          return <ReportsView />;
        case 'billing':
        case 'subscriptions':
          return <BillingView />;
        case 'audit':
        case 'security':
          return <AuditLogsView />;
        case 'profile':
        case 'ess':
          return <EmployeeProfileView onOpenPayslip={handleOpenPayslip} />;
        case 'dashboard':
        default:
          return <SuperAdminDashboard viewMode="overview" onNavigateTab={handleSelectTab} />;
      }
    }

    // 2. COMPANY_ADMIN: Executive Dashboard, Company Team, Payroll & Spend, Reports, Subscription Plan, Security & Audit
    if (currentRole === 'COMPANY_ADMIN') {
      switch (tab) {
        case 'masters':
        case 'master':
          return <PlatformMastersView />;
        case 'employees':
        case 'team':
          return <EmployeeList />;
        case 'payroll':
          return <PayrollOverview />;
        case 'reports':
          return <ReportsView />;
        case 'billing':
        case 'subscriptions':
          return <BillingView />;
        case 'audit':
        case 'security':
          return <AuditLogsView />;
        case 'dashboard':
        default:
          return <CompanyAdminDashboard onNavigateTab={handleSelectTab} />;
      }
    }

    // 3. HR_ADMIN: HR Hub, Team Directory, Attendance, Leaves, Payroll Engine, Reports, HR Logs
    if (currentRole === 'HR_ADMIN') {
      switch (tab) {
        case 'masters':
        case 'master':
          return <PlatformMastersView />;
        case 'employees':
        case 'team':
          return <EmployeeList />;
        case 'attendance':
        case 'calendar':
          return <AttendanceView />;
        case 'leave':
        case 'leaves':
        case 'projects':
          return <LeaveManagement />;
        case 'payroll':
          return <PayrollOverview />;
        case 'reports':
          return <ReportsView />;
        case 'audit':
        case 'security':
          return <AuditLogsView />;
        case 'profile':
        case 'ess':
          return <EmployeeProfileView onOpenPayslip={handleOpenPayslip} />;
        case 'dashboard':
        default:
          return (
            <BentoDashboard
              onNavigateTab={handleSelectTab}
              onOpenPayslip={handleOpenPayslip}
              onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
            />
          );
      }
    }

    // 4. MANAGER: Team Dashboard, Direct Reports, Team Attendance, Leave Approvals, My Payslips, My Profile
    if (currentRole === 'MANAGER') {
      switch (tab) {
        case 'masters':
        case 'master':
          return <PlatformMastersView />;
        case 'employees':
        case 'team':
          return <EmployeeList />;
        case 'attendance':
        case 'calendar':
          return <AttendanceView />;
        case 'leave':
        case 'leaves':
        case 'projects':
          return <LeaveManagement />;
        case 'payroll':
        case 'documents':
        case 'my-payslips':
        case 'payslips':
          return <EmployeePayslipsView onOpenPayslip={handleOpenPayslip} />;
        case 'profile':
        case 'ess':
          return <EmployeeProfileView onOpenPayslip={handleOpenPayslip} />;
        case 'dashboard':
        default:
          return <ManagerDashboard />;
      }
    }

    // 5. EMPLOYEE: Self-Service Dashboard, Punch & Attendance, My Leaves, My Payslips, My Profile
    switch (tab) {
      case 'masters':
      case 'master':
        return <PlatformMastersView />;
      case 'attendance':
      case 'calendar':
        return <AttendanceView />;
      case 'leave':
      case 'leaves':
      case 'projects':
        return <LeaveManagement />;
      case 'payroll':
      case 'documents':
      case 'my-payslips':
      case 'payslips':
        return <EmployeePayslipsView onOpenPayslip={handleOpenPayslip} />;
      case 'profile':
      case 'ess':
        return <EmployeeProfileView onOpenPayslip={handleOpenPayslip} />;
      case 'dashboard':
      default:
        return (
          <EmployeeDashboard
            onOpenApplyLeave={handleOpenApplyLeave}
            onOpenPayslip={handleOpenPayslip}
            onNavigateTab={handleSelectTab}
          />
        );
    }
  };

  return (
    <Layout currentTab={currentTab} onSelectTab={handleSelectTab}>
      {renderContent()}

      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        initialDate={applyLeaveInitialDate}
        onClose={() => setIsApplyLeaveOpen(false)}
        onSubmitLeave={async (lr) => {
          await applyLeave(lr);
          setIsApplyLeaveOpen(false);
        }}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onAddEmployee={addEmployee}
      />

      <PayslipModal
        payslip={activePayslip}
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
      />
    </Layout>
  );
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <TenantProvider>
            <HrmsDataProvider>
              <MainAppContent />
            </HrmsDataProvider>
          </TenantProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
