import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData, DayAttendance } from '../../contexts/HrmsDataContext';
import { useToast } from '../../contexts/ToastContext';
import { StatusBadge } from '../../components/common/Badge';
import { getTodayDateISO, formatLocalDateISO } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarOff,
  Home,
  Plus,
  Send,
  X,
  FileText,
  MapPin,
  Sparkles,
  User,
  Users
} from 'lucide-react';

interface AttendanceCalendarProps {
  selectedEmployeeId?: string;
  onSelectEmployee?: (empId: string) => void;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  selectedEmployeeId,
  onSelectEmployee
}) => {
  const { currentUser, currentRole } = useAuth();
  const { allTenants } = useTenant();
  const {
    employees,
    attendanceRecords,
    calendarAttendance,
    leaveRequests,
    leaveBalances,
    applyLeave,
    submitRegularization,
    submitWfhNotice
  } = useHrmsData();
  const { showToast } = useToast();

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isEmployee = currentRole === 'EMPLOYEE';

  const targetEmployee = useMemo(() => {
    if (selectedEmployeeId) {
      const found = employees.find((e) => e.id === selectedEmployeeId);
      if (found) return found;
    }
    return (
      employees.find((e) => e.id === currentUser.employeeId) ||
      employees.find((e) => e.id === 'emp-005') ||
      employees[0]
    );
  }, [selectedEmployeeId, employees, currentUser.employeeId]);

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  // Selected date modal / action drawer
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeActionTab, setActiveActionTab] = useState<'LEAVE' | 'MISSED_PUNCH' | 'WFH'>('LEAVE');

  // Form states for Apply Leave
  const [leaveType, setLeaveType] = useState<'ANNUAL' | 'SICK' | 'CASUAL' | 'UNPAID'>('ANNUAL');
  const [leaveDuration, setLeaveDuration] = useState<'FULL' | 'FIRST_HALF' | 'SECOND_HALF'>('FULL');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState('');

  // Form states for Miss Punch Regularization
  const [missedPunchType, setMissedPunchType] = useState<'CHECK_OUT' | 'CHECK_IN' | 'BOTH'>('CHECK_OUT');
  const [regCheckInTime, setRegCheckInTime] = useState('09:00 AM');
  const [regCheckOutTime, setRegCheckOutTime] = useState('06:00 PM');
  const [regReason, setRegReason] = useState('Forgot to Punch');
  const [regRemarks, setRegRemarks] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Form states for WFH
  const [wfhReason, setWfhReason] = useState('Scheduled Remote Friday');
  const [wfhSuccessMsg, setWfhSuccessMsg] = useState('');

  // Helper date calculations
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Dynamically compute calendar attendance records for targetEmployee
  const calendarData = useMemo(() => {
    const isEmp005 = targetEmployee?.id === 'emp-005';
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const todayStr = getTodayDateISO();
    const result: Record<string, DayAttendance> = {};

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dateStr = formatLocalDateISO(dateObj);
      const dayOfWeek = dateObj.getDay();

      // Weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        result[dateStr] = { date: dateStr, day: d, status: 'WEEKEND', note: 'Weekly Off' };
        continue;
      }

      // Holidays
      if (d === 8 && currentMonth === 10) {
        result[dateStr] = {
          date: dateStr,
          day: d,
          status: 'HOLIDAY',
          holidayTitle: 'Diwali Festive Holiday',
          note: 'Mandatory Company Holiday'
        };
        continue;
      }
      if (d === 24 && currentMonth === 10) {
        result[dateStr] = {
          date: dateStr,
          day: d,
          status: 'HOLIDAY',
          holidayTitle: 'Guru Nanak Jayanti',
          note: 'Public Holiday'
        };
        continue;
      }

      // Check if targetEmployee has an approved/pending leave for this date
      const activeLeave = leaveRequests.find(
        (lr) =>
          lr.employeeId === targetEmployee.id &&
          lr.startDate <= dateStr &&
          lr.endDate >= dateStr &&
          lr.status !== 'REJECTED'
      );
      if (activeLeave) {
        result[dateStr] = {
          date: dateStr,
          day: d,
          status: 'ON_LEAVE',
          leaveType: activeLeave.leaveType,
          note: `${activeLeave.status === 'APPROVED' ? 'Approved' : 'Requested'} Leave: ${activeLeave.reason}`
        };
        continue;
      }

      // Check if emp-005 has special entries in calendarAttendance
      if (isEmp005 && calendarAttendance[dateStr]) {
        result[dateStr] = calendarAttendance[dateStr];
        continue;
      }

      // Check if attendanceRecords has an explicit entry for this employee and date
      const matchingRecord = attendanceRecords.find(
        (rec) =>
          (rec.employeeId === targetEmployee.id ||
            rec.employeeName === `${targetEmployee.firstName} ${targetEmployee.lastName}`) &&
          rec.date === dateStr
      );

      if (matchingRecord) {
        result[dateStr] = {
          date: dateStr,
          day: d,
          status:
            matchingRecord.status === 'MISSED_PUNCH'
              ? 'MISSED_PUNCH'
              : matchingRecord.status === 'LATE'
              ? 'LATE'
              : 'PRESENT',
          checkIn: matchingRecord.checkIn,
          checkOut: matchingRecord.checkOut,
          workHours: matchingRecord.workHours,
          note: matchingRecord.isException
            ? `Exception: ${matchingRecord.locationEvidence || 'Audit Required'}`
            : `Verified: ${matchingRecord.locationEvidence || 'GPS Check-in'}`
        };
        continue;
      }

      // Past / Present / Future workday shifts
      if (dateStr === todayStr) {
        result[dateStr] = {
          date: dateStr,
          day: d,
          status: 'PRESENT',
          checkIn: '09:15 AM',
          workHours: 0,
          note: 'In-progress shift'
        };
      } else if (dateObj > now) {
        result[dateStr] = {
          date: dateStr,
          day: d,
          status: 'PRESENT',
          workHours: 0,
          note: 'Scheduled General Shift'
        };
      } else {
        // Past workday - deterministic attendance based on employee
        const charCode = (targetEmployee.firstName.charCodeAt(0) || 65) + d;
        const isLate = charCode % 11 === 0;
        const isMissed = charCode % 29 === 0 && d < 12;

        if (isMissed) {
          result[dateStr] = {
            date: dateStr,
            day: d,
            status: 'MISSED_PUNCH',
            checkIn: '09:12 AM',
            note: 'Missed Punch-Out'
          };
        } else if (isLate) {
          result[dateStr] = {
            date: dateStr,
            day: d,
            status: 'LATE',
            checkIn: '09:44 AM',
            checkOut: '06:30 PM',
            workHours: 7.8,
            note: 'Punched after 09:30 AM'
          };
        } else {
          result[dateStr] = {
            date: dateStr,
            day: d,
            status: 'PRESENT',
            checkIn: '09:05 AM',
            checkOut: '06:15 PM',
            workHours: 8.5,
            note: 'Verified GPS Check-in'
          };
        }
      }
    }
    return result;
  }, [targetEmployee, currentYear, currentMonth, calendarAttendance, attendanceRecords, leaveRequests, now]);

  // Summary counts
  const values = Object.values(calendarData);
  const totalPresent = values.filter((v) => v.status === 'PRESENT' || v.status === 'LATE').length;
  const totalMissedPunches = values.filter((v) => v.status === 'MISSED_PUNCH').length;
  const totalLeaves = values.filter((v) => v.status === 'ON_LEAVE').length;
  const totalHolidays = values.filter((v) => v.status === 'HOLIDAY').length;
  const totalPaidBalance = leaveBalances.reduce((sum, b) => sum + b.available, 0);
  const firstMissedPunchDate = values.find((v) => v.status === 'MISSED_PUNCH')?.date || '2026-11-04';

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const dayRecord = calendarData[dateStr];
    if (dayRecord?.status === 'MISSED_PUNCH') {
      setActiveActionTab('MISSED_PUNCH');
    } else {
      setActiveActionTab('LEAVE');
    }
    setLeaveSuccessMsg('');
    setRegSuccessMsg('');
    setWfhSuccessMsg('');
  };

  // Submit Leave from Calendar
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    if (!leaveReason.trim()) {
      showToast('Please enter a reason for the leave application.', 'warning');
      return;
    }

    await applyLeave({
      id: `lr-${Date.now().toString().slice(-4)}`,
      employeeId: targetEmployee.id,
      employeeName: `${targetEmployee.firstName} ${targetEmployee.lastName}`,
      department: targetEmployee.department,
      leaveType,
      startDate: selectedDate,
      endDate: selectedDate,
      days: leaveDuration === 'FULL' ? 1 : 0.5,
      reason: leaveReason.trim(),
      status: isSuperAdmin ? 'APPROVED' : 'PENDING',
      appliedOn: getTodayDateISO()
    });

    setLeaveSuccessMsg(
      `✓ Leave applied for ${targetEmployee.firstName} on ${selectedDate}! ${
        isSuperAdmin ? 'Super Admin approved.' : 'Syncing to manager queue.'
      }`
    );
    setLeaveReason('');
    setTimeout(() => {
      setLeaveSuccessMsg('');
      setSelectedDate(null);
    }, 1200);
  };

  // Submit Miss Punch Regularization
  const handleSubmitRegularization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    await submitRegularization({
      date: selectedDate,
      checkIn: regCheckInTime,
      checkOut: regCheckOutTime,
      reason: regReason,
      remarks: regRemarks
        ? `${regRemarks} (${isSuperAdmin ? 'Super Admin verified' : 'Employee submitted'})`
        : isSuperAdmin
        ? 'Regularized by Super Admin'
        : 'Regularization submitted'
    });

    setRegSuccessMsg(`✓ Regularization for ${targetEmployee.firstName} submitted & processed!`);
    setTimeout(() => {
      setRegSuccessMsg('');
      setSelectedDate(null);
    }, 1200);
  };

  // Submit WFH Request
  const handleSubmitWFH = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    submitWfhNotice(selectedDate, wfhReason.trim() || 'Remote work day');
    setWfhSuccessMsg(`✓ WFH scheduled for ${targetEmployee.firstName} on ${selectedDate}!`);
    setWfhReason('');
    setTimeout(() => {
      setWfhSuccessMsg('');
      setSelectedDate(null);
    }, 1200);
  };

  const selectedRecord = selectedDate ? calendarData[selectedDate] : null;

  return (
    <div className="space-y-6">
      {/* Employee Quick Selector Card for Super Admin & Admins */}
      {!isEmployee && (
        <div className="bg-[#181a20] text-white p-5 rounded-[28px] shadow-soft border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={targetEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
              alt={targetEmployee.firstName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#ff7a1a] shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#ff7a1a] text-[#111318]">
                  {isSuperAdmin ? 'Super Admin Inspection' : 'Employee Attendance View'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {targetEmployee.employeeCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {targetEmployee.country} ({targetEmployee.currency})
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                {targetEmployee.firstName} {targetEmployee.lastName}
              </h3>
              <p className="text-xs text-slate-300">
                {targetEmployee.designation} • {targetEmployee.department} • Reports to {targetEmployee.managerName || 'Direct to CEO'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-800/90 p-2 rounded-2xl border border-slate-700/80">
            <Users className="w-4 h-4 text-[#ff7a1a] shrink-0 ml-1" />
            <div className="flex flex-col">
              <label htmlFor="calendar-emp-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Employee Calendar
              </label>
              <select
                id="calendar-emp-select"
                aria-label="Select Employee to View Attendance Calendar"
                value={targetEmployee.id}
                onChange={(e) => onSelectEmployee?.(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-2"
              >
                {isSuperAdmin
                  ? allTenants.map((t) => {
                      const tenantEmps = employees.filter((e) => e.tenantId === t.id);
                      if (tenantEmps.length === 0) return null;
                      return (
                        <optgroup key={t.id} label={`${t.name} (${t.countryId})`} className="text-slate-900 bg-white">
                          {tenantEmps.map((emp) => (
                            <option key={emp.id} value={emp.id} className="text-slate-900 bg-white">
                              {emp.firstName} {emp.lastName} ({emp.employeeCode}) — {emp.department}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })
                  : employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="text-slate-900 bg-white">
                        {emp.firstName} {emp.lastName} ({emp.employeeCode}) — {emp.department}
                      </option>
                    ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Missed Punch Notification Alert */}
      {totalMissedPunches > 0 && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-[28px] p-4.5 px-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-900">
                Action Required: {totalMissedPunches} Missed Punch Recorded for {targetEmployee.firstName} {targetEmployee.lastName}
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Check-out missing on{' '}
                <span
                  className="font-bold underline cursor-pointer"
                  onClick={() => handleDateClick(firstMissedPunchDate)}
                >
                  {firstMissedPunchDate}
                </span>
                . Regularize to avoid Loss of Pay (LOP) deduction.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDateClick(firstMissedPunchDate)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            Fix Missed Punch Now →
          </button>
        </div>
      )}

      {/* Top Calendar Toolbar */}
      <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ff7a1a]/20 text-[#181a20] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5 text-[#c2410c]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {monthName} {currentYear}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                30 Days
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive Attendance Ledger for {targetEmployee.firstName} {targetEmployee.lastName} • Click any date to apply leave or regularize
            </p>
          </div>
        </div>

        {/* Quick Month Switchers & Legend */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-full text-slate-600 hover:text-slate-900 transition-all"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setCurrentYear(today.getFullYear());
                setCurrentMonth(today.getMonth());
              }}
              className="px-3 py-1 text-xs font-bold text-slate-700 hover:text-slate-900"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-full text-slate-600 hover:text-slate-900 transition-all"
              title="Next Month"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleDateClick(getTodayDateISO())}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold rounded-full shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Apply Leave
          </button>
          <button
            type="button"
            onClick={() => handleDateClick(firstMissedPunchDate)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#181a20] hover:bg-[#242834] text-white text-xs font-bold rounded-full shadow-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-[#ff7a1a]" /> Regularize Punch
          </button>
        </div>
      </div>

      {/* Month Summary KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Present</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalPresent} Days</p>
          <p className="text-[10px] text-emerald-600 font-medium">Verified check-ins</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leaves</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalLeaves} Days</p>
          <p className="text-[10px] text-sky-600 font-medium">Approved quota</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Missed Punches</span>
          <p className={`text-xl font-extrabold mt-0.5 ${totalMissedPunches > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {totalMissedPunches} Pending
          </p>
          <p className="text-[10px] text-rose-500 font-medium">Needs regularization</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Holidays</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalHolidays} Days</p>
          <p className="text-[10px] text-purple-600 font-medium">Company gazetted</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leave Balance</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalPaidBalance} Days</p>
          <p className="text-[10px] text-slate-500 font-medium">Available entitlement</p>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-soft">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div
              key={d}
              className={`py-2 text-xs font-bold uppercase tracking-wider ${
                i === 0 || i === 6 ? 'text-slate-400' : 'text-slate-700'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 7-column Calendar Cells */}
        <div className="grid grid-cols-7 gap-2 md:gap-2.5">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[105px] rounded-2xl bg-slate-50/40 border border-slate-100/60 opacity-40 p-2"
            />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum
              .toString()
              .padStart(2, '0')}`;
            const record = calendarData[dateStr];
            const isToday = dateStr === getTodayDateISO();
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => handleDateClick(dateStr)}
                className={`min-h-[108px] rounded-2xl p-2.5 flex flex-col justify-between border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'ring-2 ring-[#ff7a1a] shadow-md border-transparent bg-white'
                    : isToday
                    ? 'border-[#ff7a1a] bg-[#fff1e6]/30 shadow-2xs hover:shadow-md'
                    : record?.status === 'MISSED_PUNCH'
                    ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300 hover:shadow-md'
                    : record?.status === 'WEEKEND'
                    ? 'bg-slate-50/60 border-slate-100 text-slate-400'
                    : record?.status === 'HOLIDAY'
                    ? 'bg-purple-50/70 border-purple-200 hover:border-purple-300'
                    : record?.status === 'ON_LEAVE'
                    ? 'bg-sky-50/70 border-sky-200 hover:border-sky-300'
                    : 'bg-white border-slate-200/80 hover:border-[#ff7a1a] hover:shadow-md'
                }`}
              >
                {/* Cell Top Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday
                        ? 'bg-[#181a20] text-white shadow-xs'
                        : isSelected
                        ? 'bg-[#ff7a1a] text-[#111318]'
                        : record?.status === 'WEEKEND'
                        ? 'text-slate-400'
                        : 'text-slate-800'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {isToday && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-[#ff7a1a] text-[#111318]">
                      Today
                    </span>
                  )}
                  {record?.status === 'MISSED_PUNCH' && (
                    <span className="flex h-2 w-2 relative" title="Action Required">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                    </span>
                  )}
                </div>

                {/* Status Content */}
                <div className="mt-1 space-y-1">
                  {record?.status === 'PRESENT' && (
                    <div>
                      {record.checkIn ? (
                        <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60 truncate">
                          ✓ {record.checkIn} - {record.checkOut || 'Active'}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Scheduled</span>
                      )}
                      {record.workHours ? (
                        <span className="text-[9px] text-slate-500 font-mono pl-1">
                          {record.workHours} hrs
                        </span>
                      ) : null}
                    </div>
                  )}

                  {record?.status === 'LATE' && (
                    <div className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 truncate">
                      ⚠️ {record.checkIn} (Late)
                    </div>
                  )}

                  {record?.status === 'MISSED_PUNCH' && (
                    <div className="text-[10px] font-extrabold text-rose-800 bg-rose-100/80 px-1.5 py-0.5 rounded-md border border-rose-300 truncate flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                      Missed Out
                    </div>
                  )}

                  {record?.status === 'REGULARIZATION_PENDING' && (
                    <div className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-md border border-amber-300 truncate">
                      ⏳ Pending Approval
                    </div>
                  )}

                  {record?.status === 'ON_LEAVE' && (
                    <div className="text-[10px] font-bold text-sky-800 bg-sky-100/80 px-1.5 py-0.5 rounded-md border border-sky-300 truncate">
                      🌴 {record.leaveType || 'LEAVE'}
                    </div>
                  )}

                  {record?.status === 'HOLIDAY' && (
                    <div className="text-[10px] font-bold text-purple-800 bg-purple-100/80 px-1.5 py-0.5 rounded-md border border-purple-300 truncate">
                      🎉 {record.holidayTitle || 'Holiday'}
                    </div>
                  )}

                  {record?.status === 'WEEKEND' && (
                    <span className="text-[10px] text-slate-400 font-medium italic pl-0.5">
                      Weekly Off
                    </span>
                  )}
                </div>

                {/* Hover overlay hint */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-[#ea580c] font-bold pt-1 text-right">
                  + Click to Edit
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Action & Request Modal / Drawer */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 md:p-7 shadow-2xl border border-slate-100 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDate(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#ff7a1a]/20 text-[#181a20] flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5 text-[#c2410c]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Selected Date Action</p>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {new Date(selectedDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>
            </div>

            {/* Day Current Status Card */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-medium">Current Status:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedRecord?.status ? (
                    <span className="flex items-center gap-2">
                      <StatusBadge status={selectedRecord.status} />
                      <span className="text-slate-600 font-medium">{selectedRecord.note}</span>
                    </span>
                  ) : (
                    'Scheduled Working Day'
                  )}
                </p>
              </div>
              {selectedRecord?.checkIn && (
                <div className="text-right">
                  <span className="text-slate-400">Punch:</span>
                  <p className="font-mono font-bold text-slate-800">
                    {selectedRecord.checkIn} - {selectedRecord.checkOut || 'Active'}
                  </p>
                </div>
              )}
            </div>

            {/* Action Tabs Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full mb-5">
              <button
                type="button"
                onClick={() => setActiveActionTab('LEAVE')}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  activeActionTab === 'LEAVE'
                    ? 'bg-[#ff7a1a] text-[#111318] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarOff className="w-3.5 h-3.5" /> Apply Leave
              </button>
              <button
                type="button"
                onClick={() => setActiveActionTab('MISSED_PUNCH')}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  activeActionTab === 'MISSED_PUNCH'
                    ? 'bg-[#181a20] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Missed Punch
              </button>
              <button
                type="button"
                onClick={() => setActiveActionTab('WFH')}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  activeActionTab === 'WFH'
                    ? 'bg-[#181a20] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" /> Remote / WFH
              </button>
            </div>

            {/* Success message banners */}
            {leaveSuccessMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {leaveSuccessMsg}
              </div>
            )}
            {regSuccessMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {regSuccessMsg}
              </div>
            )}
            {wfhSuccessMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {wfhSuccessMsg}
              </div>
            )}

            {/* TAB 1: APPLY LEAVE */}
            {activeActionTab === 'LEAVE' && (
              <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  >
                    <option value="ANNUAL">Annual Leave (12 days available)</option>
                    <option value="SICK">Sick Leave (8 days available)</option>
                    <option value="CASUAL">Casual Leave (4 days available)</option>
                    <option value="UNPAID">Loss of Pay / Unpaid</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      disabled
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Day Fraction</label>
                    <select
                      value={leaveDuration}
                      onChange={(e) => setLeaveDuration(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                    >
                      <option value="FULL">Full Day (1.0 d)</option>
                      <option value="FIRST_HALF">First Half (0.5 d)</option>
                      <option value="SECOND_HALF">Second Half (0.5 d)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reason for Leave</label>
                  <textarea
                    rows={3}
                    placeholder="Provide context for manager approval..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="px-4 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Leave Request
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGULARIZE MISSED PUNCH */}
            {activeActionTab === 'MISSED_PUNCH' && (
              <form onSubmit={handleSubmitRegularization} className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                  💡 Miss punch regularization allows you to submit your actual in/out times for manager approval to remove late or absence penalties.
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Punch to Regularize</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'CHECK_OUT', label: 'Forgot Check-Out' },
                      { id: 'CHECK_IN', label: 'Forgot Check-In' },
                      { id: 'BOTH', label: 'Both Punches' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMissedPunchType(item.id as any)}
                        className={`p-2 rounded-xl text-center font-bold border transition-all ${
                          missedPunchType === item.id
                            ? 'bg-[#181a20] text-white border-[#181a20]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Correct Check-In</label>
                    <input
                      type="text"
                      value={regCheckInTime}
                      onChange={(e) => setRegCheckInTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Correct Check-Out</label>
                    <input
                      type="text"
                      value={regCheckOutTime}
                      onChange={(e) => setRegCheckOutTime(e.target.value)}
                      placeholder="06:00 PM"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reason for Regularization</label>
                  <select
                    value={regReason}
                    onChange={(e) => setRegReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  >
                    <option value="Forgot to Punch">Forgot to Punch (In or Out)</option>
                    <option value="Biometric Scanner Malfunction">Biometric Scanner Malfunction</option>
                    <option value="Client Site Visit / Outdoor Duty">Client Site Visit / Outdoor Duty</option>
                    <option value="GPS Geofence App Error">GPS Geofence App Error</option>
                    <option value="Power Failure at Office">Power Failure at Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Additional Remarks</label>
                  <input
                    type="text"
                    placeholder="Explain why punch was missed..."
                    value={regRemarks}
                    onChange={(e) => setRegRemarks(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="px-4 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-[#181a20] hover:bg-[#242834] text-white font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-[#ff7a1a]" /> Submit Regularization
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: WFH REQUEST */}
            {activeActionTab === 'WFH' && (
              <form onSubmit={handleSubmitWFH} className="space-y-4 text-xs">
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-[11px] leading-relaxed">
                  🏠 Work From Home (WFH) requests require approval from your reporting manager. GPS verification will record your home location.
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Remote Working Reason</label>
                  <select
                    value={wfhReason}
                    onChange={(e) => setWfhReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  >
                    <option value="Scheduled Remote Friday">Scheduled Remote Friday</option>
                    <option value="Home Maintenance / Delivery">Home Maintenance / Delivery</option>
                    <option value="Mild Indisposition (Can Work Remotely)">Mild Indisposition (Can Work Remotely)</option>
                    <option value="Inclement Weather / Transport Strike">Inclement Weather / Transport Strike</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="px-4 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-[#181a20] hover:bg-[#242834] text-white font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-[#ff7a1a]" /> Submit WFH Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

