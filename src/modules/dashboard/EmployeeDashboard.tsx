import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { ModernCalendar, CalendarEventItem } from '../../components/common/ModernCalendar';
import { Modal } from '../../components/common/Modal';
import { ApplyMissedPunchModal } from '../attendance/ApplyMissedPunchModal';
import { ApplyPermissionModal } from '../attendance/ApplyPermissionModal';
import { EmployeeHistoryModal } from './EmployeeHistoryModal';
import { Payslip } from '../../types';
import { calculateElapsedHours, getTodayDateISO } from '../../utils/dateUtils';
import {
  Clock,
  MapPin,
  CalendarCheck,
  CalendarOff,
  Download,
  CheckCircle,
  FileText,
  Flame,
  Award,
  ChevronRight,
  BarChart3,
  Send,
  History,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface EmployeeDashboardProps {
  onOpenApplyLeave: (dateStr?: string) => void;
  onOpenPayslip: (slip: Payslip) => void;
  onNavigateTab?: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  onOpenApplyLeave,
  onOpenPayslip,
  onNavigateTab
}) => {
  const { currentUser } = useAuth();
  const { formatCurrency } = useTenant();
  const {
    employees,
    personalAttendanceRecords,
    calendarAttendance,
    leaveRequests,
    leaveBalances,
    punchSession,
    punchIn,
    punchOut,
    submitWfhNotice,
    getPayslipForEmployee
  } = useHrmsData();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayDateISO());
  const [isPunching, setIsPunching] = useState(false);

  // WFH notice modal state
  const [isWfhModalOpen, setIsWfhModalOpen] = useState(false);
  const [wfhDate, setWfhDate] = useState(getTodayDateISO());
  const [wfhReason, setWfhReason] = useState('');

  // Missed Punch & Permission & History modals
  const [isMissedPunchOpen, setIsMissedPunchOpen] = useState(false);
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyInitialTab, setHistoryInitialTab] = useState<'attendance' | 'leaves' | 'missed_punch' | 'permissions'>('attendance');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const empId = currentUser.employeeId || 'emp-005';
  const employeeProfile = useMemo(
    () => employees.find((e) => e.id === empId || e.email === currentUser.email),
    [employees, empId, currentUser.email]
  );

  const employeeCode = employeeProfile?.employeeCode || 'BLU-005';
  const myPayslip = getPayslipForEmployee(empId);

  // Live elapsed shift duration derived from punchInTime & current clock
  const elapsedHours = useMemo(() => {
    if (!punchSession.hasPunchedIn || !punchSession.punchInTime) return 0;
    return calculateElapsedHours(
      punchSession.punchInTime,
      punchSession.hasPunchedOut && punchSession.punchOutTime
        ? punchSession.punchOutTime
        : currentTime
    );
  }, [punchSession, currentTime]);

  const missedPunchRecords = useMemo(
    () => personalAttendanceRecords.filter((r) => r.status === 'MISSED_PUNCH'),
    [personalAttendanceRecords]
  );

  const punctualityStreak = useMemo(
    () => personalAttendanceRecords.filter((r) => r.status === 'PRESENT').length + 10,
    [personalAttendanceRecords]
  );

  const totalAvailablePaidLeaves = useMemo(
    () => leaveBalances.reduce((sum, b) => sum + b.available, 0),
    [leaveBalances]
  );

  // Dynamic calendar events generated from shared attendance, leave requests & holidays
  const calendarEventsMap = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};

    Object.entries(calendarAttendance).forEach(([dateStr, dayRec]) => {
      if (dayRec.status === 'MISSED_PUNCH') {
        map[dateStr] = [
          {
            id: `evt-att-${dateStr}`,
            time: dayRec.checkIn || '09:12',
            category: 'Attendance Alert',
            title: dayRec.note || 'Missed Punch-Out (No checkout logged)',
            type: 'punch',
            status: 'MISSED_PUNCH'
          }
        ];
      } else if (dayRec.status === 'HOLIDAY') {
        map[dateStr] = [
          {
            id: `evt-hol-${dateStr}`,
            time: 'Holiday',
            category: 'Gazetted Holiday',
            title: dayRec.holidayTitle || 'Public Holiday',
            type: 'holiday'
          }
        ];
      } else if (dayRec.status === 'REGULARIZATION_PENDING') {
        map[dateStr] = [
          {
            id: `evt-reg-${dateStr}`,
            time: dayRec.checkIn || '09:00',
            category: 'Regularization Pending',
            title: dayRec.note || 'Awaiting Manager Approval',
            type: 'punch'
          }
        ];
      } else if (dayRec.status === 'ON_LEAVE') {
        map[dateStr] = [
          {
            id: `evt-lv-${dateStr}`,
            time: 'All Day',
            category: `${dayRec.leaveType || 'Approved'} Leave`,
            title: dayRec.note || 'Scheduled Time Off',
            type: 'leave'
          }
        ];
      }
    });

    leaveRequests
      .filter((lr) => lr.employeeId === empId || lr.employeeName === currentUser.name)
      .forEach((lr) => {
        const existing = map[lr.startDate] || [];
        if (!existing.some((e) => e.type === 'leave')) {
          map[lr.startDate] = [
            ...existing,
            {
              id: `evt-lr-${lr.id}`,
              time: 'All Day',
              category: `${lr.leaveType} (${lr.status})`,
              title: lr.reason,
              type: 'leave'
            }
          ];
        }
      });

    const todayStr = getTodayDateISO();
    if (punchSession.hasPunchedIn) {
      map[todayStr] = [
        ...(map[todayStr] || []),
        {
          id: 'evt-today-punch',
          time: punchSession.punchInTime || '09:15 AM',
          category: 'Shift Check-in',
          title: punchSession.locationEvidence,
          type: 'punch'
        }
      ];
    }

    return map;
  }, [calendarAttendance, leaveRequests, empId, currentUser.name, punchSession]);

  const handlePunchToggle = async () => {
    if (isPunching) return;
    setIsPunching(true);
    try {
      if (!punchSession.hasPunchedIn) {
        await punchIn();
      } else if (!punchSession.hasPunchedOut) {
        await punchOut();
      }
    } finally {
      setIsPunching(false);
    }
  };

  const handleWfhSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfhReason.trim()) return;
    submitWfhNotice(wfhDate, wfhReason.trim());
    setWfhReason('');
    setIsWfhModalOpen(false);
  };

  // Weekly attendance bar chart data synced with today's live elapsed hours
  const WEEKLY_OVERVIEW = useMemo(() => {
    const todayHours = Math.max(0, Math.min(10, elapsedHours || 5.5));
    const todayPresentPct = Math.min(85, Math.round((todayHours / 8.5) * 80));
    const todayOvertimePct = todayHours > 8 ? Math.min(20, Math.round((todayHours - 8) * 10)) : 0;
    const todayDeficitPct = Math.max(0, 100 - todayPresentPct - todayOvertimePct);

    return [
      { day: 'Mon', present: 70, overtime: 20, deficit: 10, totalHrs: '8.5h' },
      { day: 'Tue', present: 80, overtime: 10, deficit: 10, totalHrs: '8.2h' },
      { day: 'Wed', present: 65, overtime: 25, deficit: 10, totalHrs: '8.8h' },
      { day: 'Thu', present: 75, overtime: 15, deficit: 10, totalHrs: '8.1h' },
      {
        day: 'Fri',
        present: todayPresentPct || 75,
        overtime: todayOvertimePct || 10,
        deficit: todayDeficitPct,
        totalHrs: `${(todayHours || 8.0).toFixed(1)}h`
      },
      { day: 'Sat', present: 0, overtime: 0, deficit: 0, totalHrs: 'Off' },
      { day: 'Sun', present: 0, overtime: 0, deficit: 0, totalHrs: 'Off' }
    ];
  }, [elapsedHours]);

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* 2-COLUMN LAYOUT: MAIN WORKSPACE (8 cols) + SCHEDULE RAIL (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* LEFT / MAIN WORKSPACE COLUMN */}
        <div className="xl:col-span-8 space-y-6">
          {/* Modern Hero Card */}
          <div className="bg-[#181a20] rounded-[32px] p-6 md:p-8 text-white shadow-soft relative overflow-hidden transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#ff7a1a]/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-18 h-18 rounded-2xl object-cover ring-3 ring-[#ff7a1a]/40 shadow-lg"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-[10px] text-white font-bold"
                    title="Active"
                  >
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white backdrop-blur-md border border-white/20 uppercase tracking-wider">
                      Employee Self-Service (ESS)
                    </span>
                    <span className="text-xs text-slate-300 font-mono">ID: {employeeCode}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                    {currentUser.name}
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">
                    {currentUser.designation || employeeProfile?.designation || 'Software Engineer'} •{' '}
                    {currentUser.department || employeeProfile?.department || 'Engineering'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenApplyLeave(selectedCalendarDate)}
                  className="px-3.5 py-2 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CalendarOff className="w-3.5 h-3.5" /> Apply Leave
                </button>
                <button
                  type="button"
                  onClick={() => setIsMissedPunchOpen(true)}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Miss Punch
                </button>
                <button
                  type="button"
                  onClick={() => setIsPermissionOpen(true)}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Permission
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHistoryInitialTab('attendance');
                    setIsHistoryOpen(true);
                  }}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-purple-400" /> My History
                </button>
                <button
                  type="button"
                  onClick={() => onOpenPayslip(myPayslip)}
                  className="px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#ea580c]" /> {myPayslip.period.split(' ')[0]} Payslip
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Missed Punch Alert Callout Banner */}
          {missedPunchRecords.length > 0 && (
            <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-900">
                    {missedPunchRecords.length} Missed Punch Detected on {missedPunchRecords[0].date}
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Check-in was logged at {missedPunchRecords[0].checkIn || '09:12 AM'}, but no checkout was recorded. Regularize before payroll cutoff.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMissedPunchOpen(true)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
              >
                Apply Regularization →
              </button>
            </div>
          )}

          {/* Mini Metric KPI Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Punctuality Streak
                </p>
                <p className="text-lg font-extrabold text-slate-900">{punctualityStreak} Workdays</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Consistent on-time check-ins</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Shift Duration
                </p>
                <p className="text-lg font-extrabold text-slate-900">
                  {punchSession.hasPunchedIn ? `${elapsedHours.toFixed(1)} hrs elapsed` : 'Not Punched In'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Standard 8.0 hr work target</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Leave Balance
                </p>
                <p className="text-lg font-extrabold text-slate-900">{totalAvailablePaidLeaves} Days Available</p>
                <p className="text-[10px] text-slate-500 font-medium">Across {leaveBalances.length} leave quotas</p>
              </div>
            </div>
          </div>

          {/* Row: Attendance Punch Card & Leave Allowances */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Interactive Attendance Card */}
            <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Geofenced Attendance
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    GPS Validated
                  </span>
                </div>

                {/* Circular Digital Clock Centerpiece */}
                <div className="py-5 px-4 rounded-2xl text-center mb-4 border border-[#fff1e6] bg-[#fff8f3]">
                  <div className="inline-flex p-2.5 rounded-2xl mb-1.5 bg-[#ff7a1a] text-[#111318] shadow-xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">
                    {currentTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {currentTime.toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Shift breakdown */}
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Shift Schedule:</span>
                    <span className="font-bold text-slate-800">General (09:00 - 18:00)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Check-In:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          punchSession.hasPunchedIn ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      {punchSession.punchInTime || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Check-Out:</span>
                    <span className="font-bold text-slate-800">
                      {punchSession.punchOutTime ? (
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          {punchSession.punchOutTime}
                        </span>
                      ) : punchSession.hasPunchedIn ? (
                        <span className="text-amber-600 font-semibold animate-pulse">In Progress...</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="truncate" title={punchSession.locationEvidence}>
                      {punchSession.locationEvidence}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePunchToggle}
                disabled={isPunching || punchSession.hasPunchedOut}
                className={`w-full py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 ${
                  !punchSession.hasPunchedIn
                    ? 'bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] cursor-pointer'
                    : !punchSession.hasPunchedOut
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                }`}
              >
                {isPunching
                  ? 'Validating Location...'
                  : !punchSession.hasPunchedIn
                  ? 'Punch In For Today'
                  : !punchSession.hasPunchedOut
                  ? 'Punch Out For Today'
                  : 'Shift Completed Today'}
              </button>
            </div>

            {/* Leave Allowances & Accruals */}
            <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Leave Quotas & Balances
                    </h3>
                    <p className="text-xs text-slate-500">2026 annualized entitlement records</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenApplyLeave(selectedCalendarDate)}
                    className="text-xs font-bold text-[#c2410c] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    + Apply Leave
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {leaveBalances.map((bal) => {
                    const percent = bal.total > 0 ? Math.min(100, Math.round((bal.used / bal.total) * 100)) : 0;
                    return (
                      <div
                        key={bal.type}
                        className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 text-center hover:bg-white hover:shadow-xs transition-all"
                      >
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                          {bal.type}
                        </p>
                        <div className="text-xl font-extrabold text-slate-900 my-1">{bal.available}</div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {bal.used} used of {bal.total} d
                        </p>
                        <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-[#ff7a1a]"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Payslip Highlight Box */}
              <div className="mt-5 p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#181a20] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <FileText className="w-5 h-5 text-[#ff7a1a]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">{myPayslip.period} Payslip</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {myPayslip.paymentStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Net:{' '}
                      <span className="font-extrabold text-slate-900">
                        {formatCurrency(myPayslip.netPay)}
                      </span>{' '}
                      credited to {myPayslip.bankName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenPayslip(myPayslip)}
                  className="px-3 py-1.5 bg-[#181a20] hover:bg-[#242834] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs self-start sm:self-auto cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#ff7a1a]" /> View
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Overview Stacked Vertical Bars */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Attendance Overview (Weekly Work Hours)
                </h3>
                <p className="text-xs text-slate-500">
                  Daily breakdown of on-time shift hours, overtime, and deviations
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span className="text-slate-600 font-medium">Standard Hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-slate-600 font-medium">Overtime / Flex</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="text-slate-600 font-medium">Deficit</span>
                </div>
              </div>
            </div>

            <div className="h-56 flex items-end justify-between gap-4 px-2 pt-4 pb-2 border-b border-slate-100">
              {WEEKLY_OVERVIEW.map((item) => {
                const isWeekend = item.day === 'Sat' || item.day === 'Sun';
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                      {item.totalHrs}
                    </div>

                    <div className="w-full max-w-[42px] h-[170px] bg-slate-50 rounded-2xl overflow-hidden flex flex-col-reverse relative p-1">
                      {isWeekend ? (
                        <div className="w-full h-full border border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                          <span className="text-[10px] text-slate-300 font-bold -rotate-90">OFF</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col-reverse rounded-xl overflow-hidden shadow-2xs">
                          <div
                            className="w-full bg-purple-600 transition-all duration-500 group-hover:bg-purple-700"
                            style={{ height: `${item.present}%` }}
                            title={`Standard: ${item.present}%`}
                          />
                          <div
                            className="w-full bg-amber-400 transition-all duration-500 group-hover:bg-amber-500"
                            style={{ height: `${item.overtime}%` }}
                            title={`Overtime: ${item.overtime}%`}
                          />
                          <div
                            className="w-full bg-rose-400 transition-all duration-500 group-hover:bg-rose-500"
                            style={{ height: `${item.deficit}%` }}
                            title={`Deficit: ${item.deficit}%`}
                          />
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-600">{item.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Weekly target: 40.0 hrs</span>
              <span className="text-purple-600 font-bold">
                Achieved: {(33.6 + (elapsedHours || 8.0)).toFixed(1)} hrs
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MY SCHEDULE CALENDAR */}
        <div className="xl:col-span-4 space-y-5">
          <ModernCalendar
            title="My Schedule"
            initialDate={selectedCalendarDate}
            selectedDate={selectedCalendarDate}
            onSelectDate={(d) => setSelectedCalendarDate(d)}
            eventsMap={calendarEventsMap}
            onApplyLeave={(d) => onOpenApplyLeave(d)}
            onMissedPunch={() => (onNavigateTab ? onNavigateTab('attendance') : null)}
            showEventsList={true}
            variant="purple"
            className="shadow-soft"
          />

          {/* Quick Shortcuts Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
              Employee Quick Actions
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onOpenApplyLeave(selectedCalendarDate)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/60 text-xs font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <CalendarOff className="w-4 h-4 text-purple-600" />
                  Apply Leave for {selectedCalendarDate}
                </span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsMissedPunchOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200/60 text-xs font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600" />
                  Regularize Missed Punch
                </span>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsPermissionOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/60 text-xs font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  Apply Permission Pass (1–2 Hrs)
                </span>
                <ChevronRight className="w-4 h-4 text-sky-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setHistoryInitialTab('attendance');
                  setIsHistoryOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-600" />
                  My Activity & History Hub
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setWfhDate(selectedCalendarDate);
                  setIsWfhModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#fff1e6] hover:bg-[#ffe3cc] text-[#181a20] border border-[#ff7a1a]/40 text-xs font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#ea580c]" />
                  Submit Remote / WFH Notice
                </span>
                <ChevronRight className="w-4 h-4 text-[#ea580c]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Missed Punch Regularization Modal */}
      <ApplyMissedPunchModal
        isOpen={isMissedPunchOpen}
        onClose={() => setIsMissedPunchOpen(false)}
        initialDate={selectedCalendarDate}
      />

      {/* Permission Request Modal */}
      <ApplyPermissionModal
        isOpen={isPermissionOpen}
        onClose={() => setIsPermissionOpen(false)}
        initialDate={selectedCalendarDate}
      />

      {/* Employee Activity & Requests History Modal */}
      <EmployeeHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        initialTab={historyInitialTab}
      />

      {/* Remote / WFH Request Modal */}
      <Modal
        isOpen={isWfhModalOpen}
        onClose={() => setIsWfhModalOpen(false)}
        title="Submit Remote / WFH Notice"
        subtitle="Notify your reporting manager of your remote work schedule"
        maxWidth="md"
      >
        <form onSubmit={handleWfhSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work From Home Date</label>
            <input
              type="date"
              required
              value={wfhDate}
              onChange={(e) => setWfhDate(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Deliverables *</label>
            <textarea
              required
              rows={3}
              value={wfhReason}
              onChange={(e) => setWfhReason(e.target.value)}
              placeholder="e.g., Focusing on release QA or home maintenance appointment..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsWfhModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold rounded-full flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
