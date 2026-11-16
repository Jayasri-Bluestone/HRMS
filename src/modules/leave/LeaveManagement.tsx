import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { LeaveRequest } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { ApplyLeaveModal } from './ApplyLeaveModal';
import {
  PlusCircle,
  Check,
  X,
  Filter,
  Search,
  User,
  Users,
  RotateCcw,
  CalendarCheck
} from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { currentTenant, allTenants } = useTenant();
  const { employees, leaveRequests, leaveBalances, applyLeave, reviewLeave, cancelLeave } = useHrmsData();

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isManager = currentRole === 'MANAGER';
  const isEmployee = currentRole === 'EMPLOYEE';

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const directReportIds = useMemo(
    () =>
      new Set(
        employees
          .filter(
            (e) =>
              e.managerId === currentUser.employeeId ||
              e.managerName === currentUser.name
          )
          .map((e) => e.id)
      ),
    [employees, currentUser.employeeId, currentUser.name]
  );

  const availableEmployees = useMemo(() => {
    if (isEmployee) return employees.filter((e) => e.id === (currentUser.employeeId || 'emp-005'));
    if (isManager) {
      return employees.filter(
        (e) =>
          e.managerId === currentUser.employeeId ||
          e.managerName === currentUser.name ||
          e.id === currentUser.employeeId
      );
    }
    if (isSuperAdmin) {
      return employees;
    }
    return employees.filter((e) => e.tenantId === currentTenant.id);
  }, [isEmployee, isManager, isSuperAdmin, employees, currentUser, currentTenant.id]);

  const inspectedEmployee = useMemo(() => {
    if (selectedEmployeeId === 'ALL') return null;
    return employees.find((e) => e.id === selectedEmployeeId) || null;
  }, [selectedEmployeeId, employees]);

  const roleFilteredLeaves = useMemo(() => {
    return leaveRequests.filter((lr) => {
      if (isEmployee) {
        return (
          lr.employeeId === (currentUser.employeeId || 'emp-005') ||
          lr.employeeName === currentUser.name
        );
      }
      if (isManager) {
        return (
          directReportIds.has(lr.employeeId) ||
          lr.employeeId === currentUser.employeeId ||
          lr.employeeName === currentUser.name
        );
      }
      return true;
    });
  }, [leaveRequests, isEmployee, isManager, currentUser, directReportIds]);

  const displayLeaves = useMemo(() => {
    return roleFilteredLeaves.filter((lr) => {
      // 1. Status Filter
      if (filterStatus !== 'ALL' && lr.status !== filterStatus) return false;

      // 2. Employee Selector Filter
      if (!isEmployee && selectedEmployeeId !== 'ALL') {
        const matchedEmp = employees.find((e) => e.id === selectedEmployeeId);
        if (matchedEmp) {
          const isMatch =
            lr.employeeId === selectedEmployeeId ||
            lr.employeeName.toLowerCase() === `${matchedEmp.firstName} ${matchedEmp.lastName}`.toLowerCase();
          if (!isMatch) return false;
        }
      }

      // 3. Search Query Filter (name, reason, department, leave type)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          lr.employeeName.toLowerCase().includes(q) ||
          lr.reason.toLowerCase().includes(q) ||
          lr.department.toLowerCase().includes(q) ||
          lr.leaveType.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [roleFilteredLeaves, filterStatus, selectedEmployeeId, searchQuery, isEmployee, employees]);

  // Compute active leave balances dynamically based on whether an employee is selected
  const activeBalances = useMemo(() => {
    if (!inspectedEmployee) return leaveBalances;
    return leaveBalances.map((item) => {
      const empApprovedDays = leaveRequests
        .filter(
          (lr) =>
            (lr.employeeId === inspectedEmployee.id ||
              lr.employeeName.toLowerCase() ===
                `${inspectedEmployee.firstName} ${inspectedEmployee.lastName}`.toLowerCase()) &&
            lr.status === 'APPROVED' &&
            lr.leaveType === item.type
        )
        .reduce((sum, lr) => sum + lr.days, 0);

      const available = Math.max(0, item.total - empApprovedDays);
      return {
        ...item,
        used: empApprovedDays,
        available
      };
    });
  }, [inspectedEmployee, leaveBalances, leaveRequests]);

  const handleApprove = (id: string) => {
    const approverTitle = currentRole === 'SUPER_ADMIN' ? 'Super Admin' : currentRole === 'HR_ADMIN' ? 'HR Management' : 'Reporting Manager';
    reviewLeave(id, 'APPROVED', `Approved by ${approverTitle}`);
  };

  const handleReject = (id: string) => {
    const reviewerTitle = currentRole === 'SUPER_ADMIN' ? 'Super Admin' : currentRole === 'HR_ADMIN' ? 'HR Management' : 'Reporting Manager';
    reviewLeave(id, 'REJECTED', `Declined by ${reviewerTitle}`);
  };

  const handleCancelRequest = (id: string) => {
    cancelLeave(id);
  };

  const handleApply = async (newRequest: LeaveRequest) => {
    await applyLeave(newRequest);
  };

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">
            Portal &gt; {isSuperAdmin ? 'Global Leave Administration' : isEmployee ? 'My Leaves' : 'Leave Administration'}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {isSuperAdmin
              ? 'Multi-Tenant Leave Master & Quota Approvals'
              : isEmployee
              ? 'My Leave Quotas & Applications'
              : 'Leave Policies & Approval Management'}
          </h1>
          <p className="text-xs text-slate-500">
            {isEmployee
              ? `Entitlements and approval tracker for ${currentUser.name} (${currentUser.employeeId || 'EMP-005'})`
              : 'Company-wide leave policies, quota accruals, multi-tier approval workflows, and payroll synchronization.'}
          </p>
        </div>
        <button
          onClick={() => setIsApplyOpen(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold rounded-full shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Apply For Leave
        </button>
      </div>

      {/* Active Inspected Employee Banner for Admins/Managers */}
      {inspectedEmployee && !isEmployee && (
        <div className="bg-[#181a20] text-white p-5 rounded-[28px] shadow-soft border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={inspectedEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
              alt={inspectedEmployee.firstName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#ff7a1a] shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#ff7a1a] text-[#111318]">
                  {isSuperAdmin ? 'Super Admin Inspection' : 'Employee Leave Profile'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {inspectedEmployee.employeeCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {inspectedEmployee.country} ({inspectedEmployee.currency})
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                {inspectedEmployee.firstName} {inspectedEmployee.lastName}
              </h3>
              <p className="text-xs text-slate-300">
                {inspectedEmployee.designation} • {inspectedEmployee.department} • Reports to {inspectedEmployee.managerName || 'Direct to CEO'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedEmployeeId('ALL')}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Filter (View All)
            </button>
          </div>
        </div>
      )}

      {/* Leave Policy & Accruals Summary */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {inspectedEmployee
              ? `Leave Quotas & Balances for ${inspectedEmployee.firstName} ${inspectedEmployee.lastName}`
              : 'Corporate Leave Policy & Annualized Accruals'}
          </span>
          <span className="text-xs text-slate-400">
            {inspectedEmployee ? 'Live Employee Balance' : 'Standard Baseline Entitlement'}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {activeBalances.map((item) => (
            <div key={item.type} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-soft">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.type}</span>
              <div className="text-2xl font-extrabold text-slate-900 my-1">{item.available} Days</div>
              <p className="text-[11px] text-slate-400 font-medium">
                {item.used} used • {item.total} annualized quota
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Search input & Employee dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search employee or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-slate-50/50 w-56"
              />
            </div>

            {/* Employee Selector for Admins & Managers */}
            {!isEmployee && (
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 px-3 rounded-full border border-slate-200">
                <User className="w-3.5 h-3.5 text-[#ff7a1a]" />
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Employee:
                </span>
                <select
                  aria-label="Filter leaves by employee"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer outline-none max-w-[210px] truncate"
                >
                  <option value="ALL">All Employees ({availableEmployees.length})</option>
                  {isSuperAdmin
                    ? allTenants.map((t) => {
                        const tenantEmps = availableEmployees.filter((e) => e.tenantId === t.id);
                        if (tenantEmps.length === 0) return null;
                        return (
                          <optgroup key={t.id} label={`${t.name} (${t.countryId})`}>
                            {tenantEmps.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} ({emp.employeeCode})
                              </option>
                            ))}
                          </optgroup>
                        );
                      })
                    : availableEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Status filter & Counts */}
          <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex gap-1.5">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-[#ff7a1a] text-[#111318] shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Showing: <span className="text-slate-800 font-bold">{displayLeaves.length}</span> requests
              {inspectedEmployee && (
                <span className="text-[#ea580c] font-semibold ml-1">
                  for {inspectedEmployee.firstName}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">
                  {isEmployee ? 'Application Record' : 'Employee / Department'}
                </th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Duration & Dates</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Applied On</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">
                  {isEmployee ? 'Manager Review & Actions' : 'Approval Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayLeaves.length > 0 ? (
                displayLeaves.map((lr) => (
                  <tr key={lr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900 text-sm">
                        {isEmployee ? `Request #${lr.id.slice(-4)}` : lr.employeeName}
                      </p>
                      <p className="text-[11px] text-slate-400">{lr.department}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {lr.leaveType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900">{lr.days} Day(s)</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {lr.startDate} → {lr.endDate}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 truncate" title={lr.reason}>
                        {lr.reason}
                      </p>
                      {lr.managerComments && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          "{lr.managerComments}"
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{lr.appliedOn}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lr.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {isEmployee || (isManager && (lr.employeeId === currentUser.employeeId || lr.employeeName === currentUser.name)) ? (
                        lr.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] text-amber-700 font-medium">
                              Pending Manager Review
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCancelRequest(lr.id)}
                              className="text-[11px] px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full border border-slate-200 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {lr.status === 'APPROVED' ? '✓ Approved' : 'Rejected'}
                          </span>
                        )
                      ) : (
                        lr.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(lr.id)}
                              className="py-1 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(lr.id)}
                              className="py-1 px-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 transition-colors border border-rose-200 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Finalized</span>
                        )
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No leave requests found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal with Visual Calendar */}
      <ApplyLeaveModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSubmitLeave={handleApply}
      />
    </div>
  );
};
