import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { useToast } from '../../contexts/ToastContext';
import { downloadCSV } from '../../utils/exportUtils';
import { StatusBadge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { AttendanceCalendar } from './AttendanceCalendar';
import { ApplyMissedPunchModal } from './ApplyMissedPunchModal';
import { ApplyPermissionModal } from './ApplyPermissionModal';
import {
  CalendarCheck,
  Clock,
  MapPin,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  ListFilter,
  Flame,
  User,
  Users
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { currentTenant, allTenants } = useTenant();
  const {
    employees,
    attendanceRecords,
    personalAttendanceRecords,
    resolveAttendanceException
  } = useHrmsData();
  const { showToast } = useToast();

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isManager = currentRole === 'MANAGER';
  const isEmployee = currentRole === 'EMPLOYEE';

  const [viewMode, setViewMode] = useState<'CALENDAR' | 'LEDGER'>('CALENDAR');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isMissedPunchOpen, setIsMissedPunchOpen] = useState(false);
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    return currentUser.employeeId || 'emp-005';
  });

  const availableEmployees = employees.filter((emp) => {
    if (isEmployee) return emp.id === (currentUser.employeeId || 'emp-005');
    if (isManager) {
      return (
        emp.managerId === currentUser.employeeId ||
        emp.managerName === currentUser.name ||
        emp.id === currentUser.employeeId
      );
    }
    if (isSuperAdmin) {
      return true;
    }
    return emp.tenantId === currentTenant.id;
  });

  const attendance = isEmployee ? personalAttendanceRecords : attendanceRecords;

  const filteredRecords = attendance.filter((rec) => {
    if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;
    if (!isEmployee && selectedEmployeeId !== 'ALL') {
      const matchedEmp = employees.find((e) => e.id === selectedEmployeeId);
      if (matchedEmp) {
        const isMatch =
          rec.employeeId === selectedEmployeeId ||
          rec.employeeName.toLowerCase() === `${matchedEmp.firstName} ${matchedEmp.lastName}`.toLowerCase();
        if (!isMatch) return false;
      }
    }
    return true;
  });

  const handleResolveException = async (id: string) => {
    await resolveAttendanceException(id);
  };

  const handleExportCsv = () => {
    downloadCSV(
      `attendance-${isEmployee ? 'personal' : 'company'}.csv`,
      ['Date', 'Employee', 'Department', 'Check-In', 'Check-Out', 'Work Hours', 'Status', 'Location'],
      filteredRecords.map((r) => [
        r.date,
        r.employeeName,
        r.department,
        r.checkIn || '',
        r.checkOut || '',
        r.workHours,
        r.status,
        r.locationEvidence || ''
      ])
    );
    showToast('Attendance CSV Exported', 'success', `${filteredRecords.length} records downloaded`);
  };

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Header with View Mode Switcher & Employee Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">
            Portal &gt; {isSuperAdmin ? 'Platform Attendance Master' : isEmployee ? 'My Attendance' : 'Company Attendance'}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {isSuperAdmin
              ? 'Multi-Tenant Attendance & Smart Calendar'
              : isEmployee
              ? 'My Attendance Ledger & Smart Calendar'
              : 'Attendance & Real-Time Punch Ledger'}
          </h1>
          <p className="text-xs text-slate-500">
            {isSuperAdmin
              ? 'Filter and inspect employee attendance calendars, evaluate punches, and audit regularizations.'
              : isEmployee
              ? `Personal punch logs, work hour tracking, and regularization for ${currentUser.name} (${currentUser.employeeId || 'EMP-005'})`
              : 'Company-wide geofenced check-ins, automated work hour aggregation, and exception audit ledger.'}
          </p>
        </div>

        {/* View Mode & Employee Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isEmployee && (
            <div className="flex items-center gap-2 bg-white/95 p-1.5 px-3 rounded-full border border-slate-200/90 shadow-2xs">
              <User className="w-3.5 h-3.5 text-[#ff7a1a]" />
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Employee:
              </span>
              <select
                aria-label="Filter attendance by employee"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer outline-none max-w-[210px] truncate"
              >
                {viewMode === 'LEDGER' && (
                  <option value="ALL">All Employees (Company Ledger)</option>
                )}
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

          {/* View Mode Pills */}
          <div className="flex items-center bg-white p-1 rounded-full border border-slate-200/90 shadow-2xs">
            <button
              onClick={() => {
                setViewMode('CALENDAR');
                if (selectedEmployeeId === 'ALL') {
                  setSelectedEmployeeId(availableEmployees[0]?.id || 'emp-005');
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'CALENDAR'
                  ? 'bg-[#ff7a1a] text-[#111318] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('LEDGER')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'LEDGER'
                  ? 'bg-[#181a20] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              {isEmployee ? 'My Punch Ledger' : 'Company Audit Ledger'}
            </button>
          </div>

          {isEmployee && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMissedPunchOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-full transition-all cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Regularize Miss Punch
              </button>
              <button
                type="button"
                onClick={() => setIsPermissionOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold rounded-full transition-all cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-sky-600" />
                Apply Permission
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Conditionally Render Interactive Calendar or Ledger Table */}
      {viewMode === 'CALENDAR' ? (
        <AttendanceCalendar
          selectedEmployeeId={selectedEmployeeId === 'ALL' ? availableEmployees[0]?.id || 'emp-005' : selectedEmployeeId}
          onSelectEmployee={setSelectedEmployeeId}
        />
      ) : (
        <div className="space-y-6">
          {/* KPI Cards: Dynamic by Role */}
          {isEmployee ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="My Working Days Present"
                value="21 / 22"
                change="95.5%"
                isPositive={true}
                subtitle="November 2026 cycle"
                icon={CalendarCheck}
                iconBgColor="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                title="Total Hours Logged"
                value="178.5 hrs"
                change="Avg 8.5h / day"
                isPositive={true}
                subtitle="Exceeds 8.0h shift quota"
                icon={Clock}
                iconBgColor="bg-sky-50"
                iconColor="text-sky-600"
              />
              <StatCard
                title="Punctuality Streak"
                value="14 Workdays"
                change="100% on-time"
                isPositive={true}
                subtitle="Punched before 09:30 AM"
                icon={Flame}
                iconBgColor="bg-amber-50"
                iconColor="text-amber-600"
              />
              <StatCard
                title="Missed Punch Action"
                value="1 Alert"
                change="Nov 04, 2026"
                isPositive={false}
                subtitle="Regularize to avoid LOP deduction"
                icon={AlertTriangle}
                iconBgColor="bg-rose-50"
                iconColor="text-rose-600"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Present Today"
                value="77 / 84"
                change="91.6%"
                isPositive={true}
                subtitle="Punched before 09:30 AM"
                icon={CalendarCheck}
                iconBgColor="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                title="Late Arrivals"
                value="5"
                change="Grace period: 15m"
                isPositive={false}
                subtitle="Punched after 09:30 AM"
                icon={Clock}
                iconBgColor="bg-amber-50"
                iconColor="text-amber-600"
              />
              <StatCard
                title="On Approved Leave"
                value="4"
                change="Synced to payroll"
                isPositive={true}
                subtitle="Annual & Sick leave"
                icon={CheckCircle2}
                iconBgColor="bg-sky-50"
                iconColor="text-sky-600"
              />
              <StatCard
                title="Exceptions Pending Review"
                value="1"
                change="WFH Punch"
                isPositive={false}
                subtitle="Arjun Mehta (Bangalore remote)"
                icon={AlertTriangle}
                iconBgColor="bg-rose-50"
                iconColor="text-rose-600"
              />
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">Filter By Status:</span>
              <div className="flex gap-1.5">
                {['ALL', 'PRESENT', 'LATE', 'MISSED_PUNCH'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#ff7a1a] text-[#111318] shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'MISSED_PUNCH' ? 'Missed Punch' : st}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Showing: <span className="text-slate-700 font-semibold">{filteredRecords.length} records</span>
              {!isEmployee && selectedEmployeeId !== 'ALL' && (
                <span className="ml-1 text-[#ea580c] font-bold">
                  ({employees.find((e) => e.id === selectedEmployeeId)?.firstName} {employees.find((e) => e.id === selectedEmployeeId)?.lastName})
                </span>
              )}
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Date / Log Time</th>
                    <th className="py-3.5 px-4">Punch In</th>
                    <th className="py-3.5 px-4">Punch Out</th>
                    <th className="py-3.5 px-4">Total Hours</th>
                    <th className="py-3.5 px-4">GPS Geofence / Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">
                      {isEmployee ? 'Regularization Status' : 'Exception Audit'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-slate-900 text-sm">{rec.date}</p>
                        <p className="text-[11px] text-slate-400">
                          {isEmployee ? 'Pune Shift Log' : rec.employeeName}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{rec.checkIn || '—'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">
                          {rec.checkOut || (rec.status === 'MISSED_PUNCH' ? '⚠️ Missing' : '— Active Shift —')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {rec.workHours > 0 ? `${rec.workHours} hrs` : '0 hrs'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 max-w-xs truncate">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate" title={rec.locationEvidence}>
                            {rec.locationEvidence || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {isEmployee ? (
                          rec.status === 'MISSED_PUNCH' ? (
                            <button
                              onClick={() => setViewMode('CALENDAR')}
                              className="px-3 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              Fix on Calendar →
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          )
                        ) : rec.isException ? (
                          <button
                            onClick={() => handleResolveException(rec.id)}
                            className="px-3 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            Resolve Exception
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Missed Punch Modal */}
      <ApplyMissedPunchModal
        isOpen={isMissedPunchOpen}
        onClose={() => setIsMissedPunchOpen(false)}
      />

      {/* Permission Modal */}
      <ApplyPermissionModal
        isOpen={isPermissionOpen}
        onClose={() => setIsPermissionOpen(false)}
      />
    </div>
  );
};
