import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { UserRole } from '../../types';
import {
  Globe2,
  ShieldCheck,
  LogOut,
  RotateCcw,
  Sun,
  Moon,
  Crown,
  Building2,
  Users,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { NotificationPopover } from '../common/NotificationPopover';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const {
    currentUser,
    currentRole,
    baseRole,
    allowedRoles,
    isPreviewingRole,
    isDemoMode,
    switchRole,
    exitRolePreview,
    logout
  } = useAuth();
  const { currentTenant, allTenants, switchTenant, countryConfig } = useTenant();
  const { isDark, toggleColorMode } = useTheme();
  const { recordAuditEvent, hasPermission } = useHrmsData();

  // Role-specific navigation menus strictly matching Section 3.1 of requirements
  const getNavItemsByRole = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { id: 'dashboard', label: 'Platform Overview' },
          { id: 'tenants', label: 'Tenants' },
          { id: 'masters', label: 'Platform Masters' },
          { id: 'employees', label: 'Workforce' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'leave', label: 'Leaves' },
          { id: 'payroll', label: 'Payroll' },
          { id: 'reports', label: 'Reports' },
          { id: 'billing', label: 'Subscriptions' },
          { id: 'audit', label: 'Audit Trail' }
        ];

      case 'COMPANY_ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          ...(hasPermission('masters:view', 'COMPANY_ADMIN') ? [{ id: 'masters', label: 'Company Masters' }] : []),
          { id: 'employees', label: 'Company Team' },
          { id: 'payroll', label: 'Payroll & Spend' },
          { id: 'reports', label: 'Reports' },
          { id: 'billing', label: 'Subscription Plan' },
          { id: 'audit', label: 'Security & Audit' }
        ];

      case 'HR_ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          ...(hasPermission('masters:view', 'HR_ADMIN') ? [{ id: 'masters', label: 'HR Masters' }] : []),
          { id: 'employees', label: 'Team Directory' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'leave', label: 'Leaves' },
          { id: 'payroll', label: 'Payroll Engine' },
          { id: 'reports', label: 'Reports' },
          { id: 'audit', label: 'HR Logs' }
        ];

      case 'MANAGER':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          ...(hasPermission('masters:view', 'MANAGER') ? [{ id: 'masters', label: 'Masters' }] : []),
          { id: 'employees', label: 'My Team' },
          { id: 'attendance', label: 'Team Attendance' },
          { id: 'leave', label: 'Leave Approvals' },
          { id: 'payroll', label: 'My Payslips' },
          { id: 'profile', label: 'My Profile' }
        ];

      case 'EMPLOYEE':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          ...(hasPermission('masters:view', 'EMPLOYEE') ? [{ id: 'masters', label: 'Masters' }] : []),
          { id: 'attendance', label: 'Punch & Attendance' },
          { id: 'leave', label: 'My Leaves' },
          { id: 'payroll', label: 'My Payslips' },
          { id: 'profile', label: 'My Profile' }
        ];

      default:
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'employees', label: 'Team' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'leave', label: 'Leaves' },
          { id: 'payroll', label: 'Payroll' }
        ];
    }
  };

  const navItems = getNavItemsByRole(currentRole);

  const ROLE_LABELS: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    COMPANY_ADMIN: 'Company Admin',
    HR_ADMIN: 'HR Admin',
    MANAGER: 'Manager',
    EMPLOYEE: 'Employee'
  };

  const PORTAL_CONFIG: Record<UserRole, { name: string; icon: React.ReactNode }> = {
    SUPER_ADMIN: {
      name: 'Super Admin Console',
      icon: <Crown className="w-3.5 h-3.5 text-amber-500" />
    },
    COMPANY_ADMIN: {
      name: 'Executive Company Portal',
      icon: <Building2 className="w-3.5 h-3.5 text-[#ff7a1a]" />
    },
    HR_ADMIN: {
      name: 'HR Operations Portal',
      icon: <Users className="w-3.5 h-3.5 text-[#ea580c]" />
    },
    MANAGER: {
      name: 'Team Lead Portal',
      icon: <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
    },
    EMPLOYEE: {
      name: 'Employee ESS Portal',
      icon: <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
    }
  };

  const activeRoleLabel = ROLE_LABELS[currentRole] || currentRole;
  const baseRoleLabel = ROLE_LABELS[baseRole] || baseRole;

  const handleRoleChange = (newRole: UserRole) => {
    if (!allowedRoles.includes(newRole)) return;
    switchRole(newRole);
    if (newRole !== baseRole) {
      recordAuditEvent('ROLE_PREVIEW_SWITCHED', 'Security', `${baseRole} previewed ${newRole} portal`);
    }
    onSelectTab('dashboard');
    window.location.hash = 'dashboard';
  };

  const handleExitPreview = () => {
    exitRolePreview();
    onSelectTab('dashboard');
    window.location.hash = 'dashboard';
  };

  const normalizedTab = currentTab.toLowerCase();

  return (
    <header className="w-full px-6 pt-5 pb-3 bg-[#f4f6f8]">
      <div className="max-w-[1520px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Clover Brand Logo & Horizontal Nav Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Clover / 4-petal Logo from screenshot */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className="w-11 h-11 rounded-full bg-[#ff7a1a] hover:bg-[#e8670a] flex items-center justify-center text-[#111318] shadow-sm hover:scale-105 transition-all cursor-pointer shrink-0"
            title="Go to Dashboard"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="8" cy="8" r="3.5" />
              <circle cx="16" cy="8" r="3.5" />
              <circle cx="8" cy="16" r="3.5" />
              <circle cx="16" cy="16" r="3.5" />
            </svg>
          </button>

          {/* Role-Specific Nav Pills */}
          <nav className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 shadow-2xs">
            {navItems.map((item) => {
              const isActive =
                normalizedTab === item.id ||
                (item.id === 'employees' && normalizedTab === 'team') ||
                (item.id === 'attendance' && normalizedTab === 'calendar') ||
                (item.id === 'leave' && (normalizedTab === 'leaves' || normalizedTab === 'projects')) ||
                (item.id === 'payroll' && (normalizedTab === 'documents' || normalizedTab === 'my-payslips'));

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-5 py-2 rounded-full text-xs transition-all ${
                    isActive
                      ? 'bg-[#ff7a1a] text-[#111318] font-bold shadow-sm scale-102'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Role-Based Portal Badge / Super Admin Role Preview / Tenant Info / Notifications / Logout */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {baseRole === 'SUPER_ADMIN' ? (
            <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-full border border-slate-200/90 shadow-2xs text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-extrabold text-amber-950">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Super Admin Console</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase px-1 flex items-center gap-1">
                Inspect:
              </span>
              {allowedRoles.map((r) => {
                const isSelected = currentRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#181a20] text-white shadow-xs font-bold ring-2 ring-[#ff7a1a]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                );
              })}
              {isPreviewingRole && (
                <button
                  type="button"
                  onClick={handleExitPreview}
                  title="Return to Super Admin Console"
                  className="ml-1 px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Exit
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white/90 px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-2xs text-[11px] font-bold text-[#181a20]">
              {PORTAL_CONFIG[currentRole]?.icon || <ShieldCheck className="w-3.5 h-3.5 text-[#ea580c]" />}
              <span>{PORTAL_CONFIG[currentRole]?.name || activeRoleLabel}</span>
              {isDemoMode && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase font-semibold">
                  Demo
                </span>
              )}
            </div>
          )}

          {/* Tenant Controls: Super Admin can switch across any company at any time */}
          {baseRole === 'SUPER_ADMIN' ? (
            <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/90 rounded-full px-3 py-1 shadow-2xs">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Select tenant organization"
                value={currentTenant.id}
                onChange={(e) => switchTenant(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent border-0 focus:ring-0 cursor-pointer outline-none"
              >
                {allTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.countryId})
                  </option>
                ))}
              </select>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c] font-bold">
                {countryConfig.flag} {countryConfig.currency}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/90 rounded-full px-3 py-1 shadow-2xs text-xs font-semibold text-slate-700">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTenant.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c] font-bold">
                {countryConfig.flag} {countryConfig.currency}
              </span>
            </div>
          )}

          {/* Light / Dark Mode Switch */}
          <button
            type="button"
            onClick={toggleColorMode}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Popover */}
          <NotificationPopover />

          {/* User Profile Badge & Logout Button */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="flex items-center gap-2 bg-white/90 px-2 py-1 rounded-full border border-slate-200 shadow-2xs">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span className="text-[11px] font-bold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                {currentUser.name.split(' ')[0]}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label="Sign out"
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 shadow-2xs flex items-center justify-center transition-all"
              title="Sign Out / Logout to Login Page"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
