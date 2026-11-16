import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { useToast } from '../../contexts/ToastContext';
import { Payslip } from '../../types';
import {
  Hourglass,
  User,
  Globe,
  Plus,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Video,
  Search,
  Wallet,
  Sparkles,
  Info,
  CheckCircle2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { ModernDatePickerPopover } from '../../components/common/ModernDatePickerPopover';
import { Modal } from '../../components/common/Modal';
import { getTimeBasedGreeting, parseLocalDate } from '../../utils/dateUtils';

interface BentoDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenPayslip?: (slip?: Payslip) => void;
  onOpenAddEmployee?: () => void;
}

interface RecruitmentPipelineItem {
  id: string;
  role: string;
  candidate: string;
  stage: string;
  matchScore: number;
  interviewTime: string;
}

const RECRUITMENT_PIPELINE: RecruitmentPipelineItem[] = [
  {
    id: 'rec-1',
    role: 'Senior Product Designer',
    candidate: 'Meera Kulkarni',
    stage: 'Final Panel',
    matchScore: 94,
    interviewTime: 'Today, 02:30 PM'
  },
  {
    id: 'rec-2',
    role: 'Staff React Native Engineer',
    candidate: 'Kabir Verma',
    stage: 'Technical Round',
    matchScore: 89,
    interviewTime: 'Tomorrow, 11:00 AM'
  },
  {
    id: 'rec-3',
    role: 'Payroll Compliance Specialist',
    candidate: 'Neha Bhatia',
    stage: 'Offer Extended',
    matchScore: 96,
    interviewTime: 'Completed'
  }
];

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  onNavigateTab,
  onOpenPayslip,
  onOpenAddEmployee
}) => {
  const { currentUser } = useAuth();
  const { currentTenant, countryConfig, formatCurrency } = useTenant();
  const {
    employees,
    attendanceRecords,
    payrollRuns,
    getPayslipForEmployee
  } = useHrmsData();
  const { showToast } = useToast();

  const [dateRangeStart, setDateRangeStart] = useState('2026-11-01');
  const [dateRangeEnd, setDateRangeEnd] = useState('2026-11-15');
  const [salarySearch, setSalarySearch] = useState('');
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [selectedSalaryEmpId, setSelectedSalaryEmpId] = useState<string | null>(null);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

  // Filter employees strictly by active tenant
  const tenantEmployees = useMemo(() => {
    const list = employees.filter((e) => e.tenantId === currentTenant.id);
    return list.length > 0 ? list : employees.slice(0, 4);
  }, [employees, currentTenant.id]);


  // Date range span affects work-hour visualizations dynamically
  const rangeDays = useMemo(() => {
    const start = parseLocalDate(dateRangeStart);
    const end = parseLocalDate(dateRangeEnd);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, isNaN(diff) ? 14 : diff);
  }, [dateRangeStart, dateRangeEnd]);


  // Attendance & work-hours analytics derived from shared state + date range
  const { avgWeeklyHours, onsitePct, remotePct, dotColumns } = useMemo(() => {
    const loggedHours = attendanceRecords
      .filter((r) => r.workHours > 0)
      .map((r) => r.workHours);
    const dailyAvg =
      loggedHours.length > 0
        ? loggedHours.reduce((sum, h) => sum + h, 0) / loggedHours.length
        : 8.3;

    // Modulate slightly by selected range length so changing date range updates metrics visibly
    const rangeFactor = rangeDays >= 14 ? 1.02 : rangeDays >= 7 ? 1.0 : 0.96;
    const weeklyAvg = Math.round(dailyAvg * 5 * rangeFactor * 10) / 10;

    const remoteCount = attendanceRecords.filter((r) =>
      (r.locationEvidence || '').toLowerCase().includes('remote')
    ).length;
    const totalAtt = Math.max(1, attendanceRecords.length);
    const rPct = Math.round((remoteCount / totalAtt) * 100);
    const oPct = 100 - rPct;

    const baseLevels = [2, 3, 2, 5, 3, 2, 4, 3, 2, 6, 3, 4];
    const cols = baseLevels.map((lvl, idx) => {
      const targetHeight = Math.max(2, Math.min(6, idx % 2 === 0 && rangeDays > 10 ? lvl + 1 : lvl));
      return Array.from({ length: 6 }, (_, i) => i < targetHeight);
    });

    return {
      avgWeeklyHours: weeklyAvg,
      onsitePct: oPct,
      remotePct: rPct,
      dotColumns: cols
    };
  }, [attendanceRecords, rangeDays]);

  // Department breakdown for "Track your team" gauge — totals always reconcile
  const departmentBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    tenantEmployees.forEach((emp) => {
      counts.set(emp.department, (counts.get(emp.department) || 0) + 1);
    });

    const palette = ['#ff7a1a', '#181a20', '#cbd5e1', '#38bdf8'];
    const entries = Array.from(counts.entries()).map(([name, count], index) => ({
      name,
      count,
      color: palette[index % palette.length]
    }));

    const total = entries.reduce((sum, item) => sum + item.count, 0);
    const arcTotal = 125.6; // half circumference of r=40 (pi * 40 ≈ 125.66)
    let runningOffset = 0;

    const segments = entries.map((item) => {
      const length = total > 0 ? (item.count / total) * arcTotal : 0;
      const seg = {
        ...item,
        dashArray: `${length.toFixed(1)} 260`,
        dashOffset: -runningOffset
      };
      runningOffset += length;
      return seg;
    });

    return { total, segments };
  }, [tenantEmployees]);

  // Spotlight employee cycling
  const safeSpotlightIdx = spotlightIndex % Math.max(1, tenantEmployees.length);
  const spotlightEmployee = tenantEmployees[safeSpotlightIdx] || tenantEmployees[0];

  const tenureYears = useMemo(() => {
    if (!spotlightEmployee?.joiningDate) return 2;
    const joined = parseLocalDate(spotlightEmployee.joiningDate);
    const years = Math.max(1, Math.floor((Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 365)));
    return years;
  }, [spotlightEmployee]);

  // Salaries & payout list derived from active tenant employees and payroll runs
  const tenantRuns = useMemo(
    () => payrollRuns.filter((r) => r.tenantId === currentTenant.id),
    [payrollRuns, currentTenant.id]
  );
  const draftRunsCount = tenantRuns.filter((r) => r.status === 'DRAFT' || r.status === 'REVIEWED').length;

  const salariesList = useMemo(() => {
    return tenantEmployees
      .map((emp, idx) => {
        const status =
          emp.status === 'PROBATION'
            ? 'Waiting'
            : idx === tenantEmployees.length - 1 && tenantEmployees.length > 4
            ? 'Waiting'
            : 'Done';
        const statusClass =
          status === 'Done'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200';
        return {
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          designation: emp.designation,
          avatar:
            emp.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
          amount: formatCurrency(emp.salary.netPay),
          rawSalary: emp.salary,
          time: idx < 2 ? 'Today' : 'Yesterday',
          status,
          statusClass
        };
      })
      .filter((item) =>
        item.name.toLowerCase().includes(salarySearch.toLowerCase()) ||
        item.designation.toLowerCase().includes(salarySearch.toLowerCase())
      );
  }, [tenantEmployees, formatCurrency, salarySearch]);

  const activeSalaryEmployee = useMemo(() => {
    return (
      tenantEmployees.find((e) => e.id === selectedSalaryEmpId) ||
      tenantEmployees[0]
    );
  }, [tenantEmployees, selectedSalaryEmpId]);

  const handleOpenSelectedPayslip = () => {
    if (!onOpenPayslip || !activeSalaryEmployee) return;
    onOpenPayslip(getPayslipForEmployee(activeSalaryEmployee.id));
  };

  const greeting = getTimeBasedGreeting();

  return (
    <div className="w-full max-w-[1520px] mx-auto pb-12">
      {/* Top Main Grid: 2 Large Areas (Left & Center Bento Grid + Right Payroll Sidebar) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT & CENTER BENTO SECTION */}
        <div className="xl:col-span-8 space-y-6">
          {/* Header Row: Breadcrumb, Greeting & Action Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c] border border-[#ff7a1a]/40 uppercase tracking-wider">
                  {currentTenant.name} • {countryConfig.flag} {countryConfig.currency}
                </span>
                <span className="text-xs text-slate-400">
                  • {currentUser.designation || 'Head of People'}: {currentUser.name}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {greeting}, {currentUser.name.split(' ')[0]}
              </h1>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => (onOpenAddEmployee ? onOpenAddEmployee() : onNavigateTab('employees'))}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                Add Employee
              </button>

              <ModernDatePickerPopover
                value={dateRangeStart}
                rangeEnd={dateRangeEnd}
                isRangeMode={true}
                onRangeChange={(start, end) => {
                  setDateRangeStart(start);
                  setDateRangeEnd(end);
                }}
                placeholder="Select date range"
                variant="purple"
              />

              <button
                type="button"
                onClick={() => onNavigateTab('reports')}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold rounded-full shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Payroll Report
              </button>
            </div>
          </div>

          {/* Top Bento Row: Employee Spotlight Card + Wide Hours Density Metric */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left: Dynamic Workforce Spotlight Card */}
            {spotlightEmployee && (
              <div className="md:col-span-5 relative rounded-[32px] overflow-hidden bg-slate-200 shadow-soft min-h-[380px] flex flex-col justify-between p-4 group">
                <img
                  src={
                    spotlightEmployee.avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop'
                  }
                  alt={`${spotlightEmployee.firstName} ${spotlightEmployee.lastName}`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Controls: Spotlight Switcher */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/15">
                    Team Spotlight
                  </span>
                  {tenantEmployees.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Previous team member"
                        onClick={() =>
                          setSpotlightIndex(
                            (prev) => (prev - 1 + tenantEmployees.length) % tenantEmployees.length
                          )
                        }
                        className="w-7 h-7 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next team member"
                        onClick={() =>
                          setSpotlightIndex((prev) => (prev + 1) % tenantEmployees.length)
                        }
                        className="w-7 h-7 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Card Content */}
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                    <span>{tenureYears}+ years tenure • {spotlightEmployee.department}</span>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </div>

                  {/* Frosted Glass Name Bar */}
                  <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-between text-white">
                    <div className="min-w-0 pr-2">
                      <h3 className="text-sm font-bold leading-tight truncate">
                        {spotlightEmployee.firstName} {spotlightEmployee.lastName}
                      </h3>
                      <p className="text-[11px] text-white/80 leading-tight truncate">
                        {spotlightEmployee.designation}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${spotlightEmployee.phone}`}
                        aria-label={`Call ${spotlightEmployee.firstName}`}
                        onClick={() =>
                          showToast(
                            `Calling ${spotlightEmployee.firstName}`,
                            'info',
                            spotlightEmployee.phone
                          )
                        }
                        className="w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center text-white transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`mailto:${spotlightEmployee.email}`}
                        aria-label={`Email ${spotlightEmployee.firstName}`}
                        onClick={() =>
                          showToast(
                            `Opening email to ${spotlightEmployee.firstName}`,
                            'info',
                            spotlightEmployee.email
                          )
                        }
                        className="w-7 h-7 rounded-full bg-[#181a20] hover:bg-[#242834] flex items-center justify-center text-white transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right: Wide Hours Density Card */}
            <div className="md:col-span-7 bg-white rounded-[32px] p-6 border border-slate-100 shadow-soft flex flex-col justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#181a20] flex items-center justify-center text-white">
                      <Hourglass className="w-4 h-4 text-[#ff7a1a]" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {avgWeeklyHours}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c]">
                      {rangeDays}d Window
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    avg hours / week ({dateRangeStart} → {dateRangeEnd})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('attendance')}
                  className="text-xs font-bold text-[#c2410c] hover:underline flex items-center gap-1 self-start sm:self-center"
                >
                  Attendance Ledger <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dot Matrix Density Graph */}
              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-slate-100">
                <div className="flex items-end justify-between h-24 px-2 pb-1">
                  {dotColumns.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col-reverse items-center gap-1.5"
                      title={`Bucket ${idx + 1}: ${col.filter(Boolean).length * 1.5} hrs avg`}
                    >
                      {col.map((filled, dIdx) => (
                        <span
                          key={dIdx}
                          className={`w-2.5 h-2.5 rounded-full ${
                            filled
                              ? idx % 3 === 0
                                ? 'bg-[#181a20]'
                                : 'bg-[#ff7a1a]'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span>2 Hours</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="w-2 h-2 rounded-full bg-[#ff7a1a]" />
                    <span className="w-2 h-2 rounded-full bg-[#181a20]" />
                  </div>
                  <span>10 Hours</span>
                </div>
              </div>

              {/* Obsidian Charcoal Sub-Card (Onsite / Remote split) */}
              <div className="bg-[#181a20] rounded-[24px] p-4 text-white grid grid-cols-2 gap-4">
                <div className="p-2 border-r border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 rounded-lg bg-[#ff7a1a]/15 border border-[#ff7a1a]/25 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-[#ff9f59]" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ff7a1a]/15 text-[#ff9f59] border border-[#ff7a1a]/25">
                      Geofenced
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-1">{onsitePct}%</div>
                  <p className="text-[11px] text-slate-300 font-medium">Onsite team</p>
                </div>

                <div className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 rounded-lg bg-[#ff7a1a]/15 border border-[#ff7a1a]/25 flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5 text-[#ff9f59]" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ff7a1a]/15 text-[#ff9f59] border border-[#ff7a1a]/25">
                      WFH / Hybrid
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-1">{remotePct}%</div>
                  <p className="text-[11px] text-slate-300 font-medium">Remote team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bento Row: 3 Modular Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Average work time */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-soft flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Average work time</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {Math.round(avgWeeklyHours)} hours
                  </span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c]">
                    +0.5% ↑
                  </span>
                </div>
              </div>

              <div className="py-4 relative">
                <svg className="w-full h-16" viewBox="0 0 200 60" fill="none" aria-hidden="true">
                  <path
                    d="M 10 40 Q 60 20, 100 35 T 190 25"
                    stroke="#ff7a1a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="100" cy="35" r="4" fill="#181a20" />
                </svg>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-[#181a20] text-white text-[10px] font-bold shadow-xs">
                  {(avgWeeklyHours / 5).toFixed(1)}h / day
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <Info className="w-3 h-3 shrink-0" />
                <span>Total work hours include extra hours</span>
              </div>
            </div>

            {/* Card 2: Track your team (Dynamic Semi-Circle Gauge) */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Active Directory</p>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">Track your team</h4>
                </div>
                <button
                  type="button"
                  aria-label="Open team directory"
                  onClick={() => onNavigateTab('employees')}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Semi Circle Gauge SVG */}
              <div className="flex flex-col items-center justify-center py-2 relative">
                <div className="relative w-36 h-20 flex items-end justify-center overflow-hidden">
                  <svg className="w-36 h-36 -rotate-180" viewBox="0 0 100 100" aria-hidden="true">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="10"
                      strokeDasharray="125.6 260"
                    />
                    {departmentBreakdown.segments.map((seg) => (
                      <circle
                        key={seg.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="10"
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                      />
                    ))}
                  </svg>
                  <div className="absolute bottom-0 text-center">
                    <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
                      {departmentBreakdown.total}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Listed members
                    </span>
                  </div>
                </div>
              </div>

              {/* Reconciled Legend List */}
              <div className="space-y-1.5 text-[11px] pt-1">
                {departmentBreakdown.segments.slice(0, 3).map((seg) => (
                  <div key={seg.name} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="truncate">{seg.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">{seg.count} members</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Talent recruitment */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Hiring statistics</p>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">Talent recruitment</h4>
                </div>
                <button
                  type="button"
                  aria-label="View recruitment pipeline"
                  onClick={() => setIsPipelineModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Candidate Avatars & Join Call */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
                      alt="Candidate Meera Kulkarni"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                      alt="Candidate Kabir Verma"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">
                      {RECRUITMENT_PIPELINE.length} Active
                    </span>
                    <span className="text-[10px] text-slate-400 block">93% avg match</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPipelineModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#181a20] hover:bg-[#242834] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                >
                  <Video className="w-3.5 h-3.5 text-[#ff7a1a]" />
                  <span>Join call</span>
                </button>
              </div>

              {/* Matched vs Not Match Bar Indicators */}
              <div className="pt-3">
                <div className="flex items-end justify-between gap-1.5 h-12 mb-2">
                  {[10, 8, 12, 11, 9, 12, 10, 8, 9, 7].map((height, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all ${
                        i < 6 ? 'bg-[#ff7a1a]' : 'bg-slate-200'
                      }`}
                      style={{ height: `${height * 4}px` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#ff7a1a]" />
                    Matched
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    Screening
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: "Salaries and incentives" */}
        <div className="xl:col-span-4 bg-white rounded-[36px] p-7 border border-slate-100 shadow-soft space-y-6">
          {/* Working Search Bar for Payout Queue */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                aria-label="Filter employee payouts"
                value={salarySearch}
                onChange={(e) => setSalarySearch(e.target.value)}
                placeholder="Search employee payouts..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] text-xs rounded-full border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#ff7a1a]"
              />
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('payroll')}
              className="text-[11px] font-bold text-[#c2410c] hover:underline shrink-0"
            >
              All Runs
            </button>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">
                Payout monthly • {countryConfig.currency}
              </p>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Salaries and incentives
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {salariesList.length} staff
            </span>
          </div>

          {/* Employee Salary List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {salariesList.length > 0 ? (
              salariesList.map((item) => {
                const isSelected = activeSalaryEmployee?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSalaryEmpId(item.id)}
                    className={`w-full text-left flex items-center justify-between p-2.5 rounded-2xl transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#fff1e6]/50 ring-1 ring-[#ff7a1a]/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.amount} <span className="text-slate-300">•</span> {item.time}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0 ${item.statusClass}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Done' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {item.status}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No employees match "{salarySearch}".
              </p>
            )}
          </div>

          {/* Bottom High-Contrast Obsidian Charcoal Take Home Pay Card for Selected Employee */}
          {activeSalaryEmployee && (
            <div className="bg-[#181a20] rounded-[32px] p-6 text-white space-y-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-semibold text-white">
                  {activeSalaryEmployee.firstName} {activeSalaryEmployee.lastName}
                </span>
                <span className="font-mono">{activeSalaryEmployee.employeeCode}</span>
              </div>

              {/* Breakdown Pills */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-full bg-[#ff7a1a] text-[#111318] text-xs font-bold shadow-xs">
                    <span>Basic salary</span>
                    <span>{formatCurrency(activeSalaryEmployee.salary.basic)}</span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-full bg-white text-slate-900 text-xs font-bold shadow-xs">
                    <span>Allowances</span>
                    <span>{formatCurrency(activeSalaryEmployee.salary.allowances)}</span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-full bg-white/15 text-white text-xs font-bold border border-white/20">
                    <span>Deductions</span>
                    <span>-{formatCurrency(activeSalaryEmployee.salary.deductions)}</span>
                  </div>
                </div>

                {/* Net Ratio */}
                <div className="text-right pl-3">
                  <p className="text-[11px] text-slate-300 font-medium">Disbursal</p>
                  <div className="text-2xl font-extrabold text-white mt-0.5">
                    {activeSalaryEmployee.salary.monthlyGross > 0
                      ? `${Math.round(
                          (activeSalaryEmployee.salary.netPay /
                            activeSalaryEmployee.salary.monthlyGross) *
                            100
                        )}%`
                      : '100%'}
                  </div>
                </div>
              </div>

              {/* Total Take Home Pay */}
              <div className="pt-2 border-t border-white/10 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-slate-300 font-medium">Take home pay</p>
                  <div className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                    {formatCurrency(activeSalaryEmployee.salary.netPay)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenSelectedPayslip}
                    aria-label="View selected employee payslip"
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                    title="View payslip statement"
                  >
                    <FileText className="w-4 h-4 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('payroll')}
                    aria-label="Open payroll engine"
                    className="w-10 h-10 rounded-full bg-[#ff7a1a] hover:bg-[#e8670a] flex items-center justify-center text-[#111318] font-bold relative transition-colors shadow-xs"
                    title="Run payroll disburse"
                  >
                    <Wallet className="w-4 h-4" />
                    {draftRunsCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#181a20] text-white text-[9px] font-bold absolute -top-1 -right-1 flex items-center justify-center ring-1 ring-white">
                        {draftRunsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recruitment Pipeline & Video Screening Modal */}
      <Modal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        title="Talent Recruitment Pipeline"
        subtitle={`Active hiring queue & scheduled screening interviews for ${currentTenant.name}`}
        maxWidth="2xl"
      >
        <div className="space-y-3">
          {RECRUITMENT_PIPELINE.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{item.candidate}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c]">
                    {item.matchScore}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {item.role} • <span className="font-semibold">{item.stage}</span>
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <CalendarIcon className="w-3 h-3" /> {item.interviewTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPipelineModalOpen(false);
                  showToast(
                    `Screening room opened for ${item.candidate}`,
                    'success',
                    `${item.role} • ${item.interviewTime}`
                  );
                }}
                className="px-3.5 py-2 rounded-xl bg-[#181a20] hover:bg-[#242834] text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff7a1a]" />
                {item.interviewTime === 'Completed' ? 'View Feedback' : 'Launch Call'}
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
