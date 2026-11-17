import React, { useState } from 'react';
import { Employee } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { useToast } from '../../contexts/ToastContext';
import { downloadCSV } from '../../utils/exportUtils';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { AddEmployeeModal } from './AddEmployeeModal';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Eye
} from 'lucide-react';

export const EmployeeList: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const { currentTenant, allTenants, switchTenant, formatCurrency } = useTenant();
  const { employees, addEmployee } = useHrmsData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedTenantId, setSelectedTenantId] = useState<string>(currentTenant.id);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isManager = currentRole === 'MANAGER';
  const canManageRoster = currentRole === 'COMPANY_ADMIN' || currentRole === 'HR_ADMIN' || isSuperAdmin;

  // Strict multi-tenant isolation + Manager direct-reports scoping + Super Admin global oversight
  const tenantEmployees = employees.filter((e) => {
    if (!isSuperAdmin && e.tenantId !== currentTenant.id) return false;
    if (isSuperAdmin && selectedTenantId !== 'ALL' && e.tenantId !== selectedTenantId) return false;
    if (isManager) {
      return (
        e.managerId === currentUser.employeeId ||
        e.managerName === currentUser.name ||
        e.id === currentUser.employeeId
      );
    }
    return true;
  });

  const filteredEmployees = tenantEmployees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleAddEmployee = async (newEmp: Employee, credentials?: any) => {
    await addEmployee(newEmp, credentials);
  };

  const handleExportCsv = () => {
    downloadCSV(
      `employees-${currentTenant.slug}.csv`,
      ['Code', 'First Name', 'Last Name', 'Email', 'Department', 'Designation', 'Status', 'Monthly Gross', 'Currency'],
      filteredEmployees.map((e) => [
        e.employeeCode,
        e.firstName,
        e.lastName,
        e.email,
        e.department,
        e.designation,
        e.status,
        e.salary.monthlyGross,
        e.currency
      ])
    );
    showToast('Employee Directory Exported', 'success', `${filteredEmployees.length} records saved as CSV`);
  };

  const handleOpenDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">
            Portal &gt; {isSuperAdmin ? 'Global Workforce' : isManager ? 'My Team' : 'Team'}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {isSuperAdmin
              ? 'Global Workforce & Roster Management'
              : isManager
              ? 'My Direct Reports'
              : 'Team & Employee Directory'}
          </h1>
          <p className="text-xs text-slate-500">
            {isSuperAdmin
              ? `Super Admin Master View • ${filteredEmployees.length} employee(s) across ${selectedTenantId === 'ALL' ? 'all tenants' : currentTenant.name}`
              : `${currentTenant.name} • ${filteredEmployees.length} ${
                  isManager ? 'direct report(s) scoped to your squad' : 'employees listed'
                }`}
          </p>
        </div>

        {canManageRoster && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold rounded-full shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Employee
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-soft flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Company:</span>
              <select
                aria-label="Filter by tenant company"
                value={selectedTenantId}
                onChange={(e) => {
                  setSelectedTenantId(e.target.value);
                  if (e.target.value !== 'ALL') {
                    switchTenant(e.target.value);
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              >
                <option value="ALL">All Companies (Platform-Wide)</option>
                {allTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.countryId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Sales & Growth">Sales & Growth</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Employee / Code</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Reporting Manager</th>
                {!isManager && <th className="py-3.5 px-4">Gross Compensation</th>}
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                        alt={emp.firstName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {emp.employeeCode} • {emp.email}
                        </p>
                        {isSuperAdmin && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff1e6] text-[#c2410c]">
                            {allTenants.find((t) => t.id === emp.tenantId)?.name || emp.tenantId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{emp.designation}</p>
                    <p className="text-[11px] text-slate-500">{emp.department}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-700 font-medium">{emp.managerName || 'Direct to CEO'}</p>
                  </td>
                  {!isManager && (
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatCurrency(emp.salary.monthlyGross)}
                      <span className="text-[10px] text-slate-400 block font-normal">per month</span>
                    </td>
                  )}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(emp)}
                      className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors font-medium inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
      {canManageRoster && (
        <AddEmployeeModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAddEmployee={handleAddEmployee}
        />
      )}
    </div>
  );
};
