import React, { useState, useMemo } from 'react';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { Modal } from '../../components/common/Modal';
import {
  Department,
  Designation,
  LeaveTypeMaster,
  ShiftMaster,
  HolidayMaster,
  CountryCode,
  UserRole
} from '../../types';
import { SYSTEM_PERMISSIONS } from '../../mockData/permissions';
import {
  Building2,
  Briefcase,
  CalendarCheck,
  Clock,
  Calendar,
  Globe2,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  Shield,
  Key,
  Lock,
  Unlock,
  RotateCcw,
  Crown,
  UserCheck
} from 'lucide-react';

type MasterTab = 'departments' | 'designations' | 'leaves' | 'shifts' | 'holidays' | 'branches' | 'rbac';

export const PlatformMastersView: React.FC = () => {
  const {
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    designations,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    leaveTypes,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType,
    shifts,
    addShift,
    updateShift,
    deleteShift,
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    branches,
    addBranch,
    rolePermissions,
    updateRolePermission,
    resetRolePermissionsToDefault,
    hasPermission
  } = useHrmsData();

  const { baseRole, currentRole } = useAuth();
  const { currentTenant, countryConfig } = useTenant();

  const canEditDepts = hasPermission('masters:departments:edit', currentRole);
  const canEditDesigs = hasPermission('masters:designations:edit', currentRole);
  const canEditLeaves = hasPermission('masters:leaves:edit', currentRole);
  const canEditShifts = hasPermission('masters:shifts:edit', currentRole);
  const canEditHolidays = hasPermission('masters:holidays:edit', currentRole);
  const canEditBranches = hasPermission('masters:branches:edit', currentRole);
  const canManageRbac = baseRole === 'SUPER_ADMIN' && currentRole === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<MasterTab>('departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRbacRole, setSelectedRbacRole] = useState<UserRole>('HR_ADMIN');
  const [rbacCategoryFilter, setRbacCategoryFilter] = useState<string>('ALL');

  // -------------------------------------------------------------
  // Modals State
  // -------------------------------------------------------------
  // 1. Department Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    headName: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  // 2. Designation Modal
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [editingDesigId, setEditingDesigId] = useState<string | null>(null);
  const [desigForm, setDesigForm] = useState({
    title: '',
    departmentName: 'Engineering',
    level: 'L3',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  // 3. Leave Type Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);
  const [leaveForm, setLeaveForm] = useState({
    name: '',
    code: '',
    daysPerYear: '12',
    isPaid: true,
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  // 4. Shift Modal
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    gracePeriodMinutes: '15',
    workHours: '9',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  // 5. Holiday Modal
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [holidayForm, setHolidayForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    countryId: 'ALL' as CountryCode | 'ALL',
    isOptional: false,
    description: ''
  });

  // 6. Branch Modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: '',
    location: '',
    country: currentTenant.countryId,
    headcount: '15'
  });

  // -------------------------------------------------------------
  // Filtered Lists
  // -------------------------------------------------------------
  const filteredDepartments = useMemo(() => {
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.headName && d.headName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [departments, searchQuery]);

  const filteredDesignations = useMemo(() => {
    return designations.filter(
      (d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.departmentName && d.departmentName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [designations, searchQuery]);

  const filteredLeaveTypes = useMemo(() => {
    return leaveTypes.filter(
      (lt) =>
        lt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lt.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaveTypes, searchQuery]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [shifts, searchQuery]);

  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => h.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [holidays, searchQuery]);

  const filteredBranches = useMemo(() => {
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [branches, searchQuery]);

  const filteredPermissions = useMemo(() => {
    return SYSTEM_PERMISSIONS.filter((p) => {
      const matchesSearch =
        p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = rbacCategoryFilter === 'ALL' || p.category === rbacCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, rbacCategoryFilter]);

  // -------------------------------------------------------------
  // Modal Open Handlers
  // -------------------------------------------------------------
  const handleOpenAddDept = () => {
    setEditingDeptId(null);
    setDeptForm({ name: '', code: '', description: '', headName: '', status: 'ACTIVE' });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptForm({
      name: dept.name,
      code: dept.code || '',
      description: dept.description || '',
      headName: dept.headName || '',
      status: dept.status || 'ACTIVE'
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) return;

    if (editingDeptId) {
      updateDepartment(editingDeptId, {
        name: deptForm.name.trim(),
        code: deptForm.code.trim().toUpperCase() || deptForm.name.slice(0, 3).toUpperCase(),
        description: deptForm.description.trim(),
        headName: deptForm.headName.trim() || undefined,
        status: deptForm.status
      });
    } else {
      addDepartment({
        name: deptForm.name.trim(),
        code: deptForm.code.trim().toUpperCase() || deptForm.name.slice(0, 3).toUpperCase(),
        description: deptForm.description.trim(),
        headName: deptForm.headName.trim() || 'Pending Assignment',
        employeeCount: 0,
        status: deptForm.status
      });
    }
    setIsDeptModalOpen(false);
  };

  // Designation Handlers
  const handleOpenAddDesig = () => {
    setEditingDesigId(null);
    setDesigForm({
      title: '',
      departmentName: departments[0]?.name || 'Engineering',
      level: 'L3',
      status: 'ACTIVE'
    });
    setIsDesigModalOpen(true);
  };

  const handleOpenEditDesig = (desig: Designation) => {
    setEditingDesigId(desig.id);
    setDesigForm({
      title: desig.title,
      departmentName: desig.departmentName || 'Engineering',
      level: desig.level || 'L3',
      status: desig.status || 'ACTIVE'
    });
    setIsDesigModalOpen(true);
  };

  const handleSaveDesig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigForm.title.trim()) return;

    if (editingDesigId) {
      updateDesignation(editingDesigId, {
        title: desigForm.title.trim(),
        departmentName: desigForm.departmentName,
        level: desigForm.level,
        status: desigForm.status
      });
    } else {
      addDesignation({
        title: desigForm.title.trim(),
        departmentName: desigForm.departmentName,
        level: desigForm.level,
        status: desigForm.status
      });
    }
    setIsDesigModalOpen(false);
  };

  // Leave Type Handlers
  const handleOpenAddLeave = () => {
    setEditingLeaveId(null);
    setLeaveForm({ name: '', code: '', daysPerYear: '14', isPaid: true, description: '', status: 'ACTIVE' });
    setIsLeaveModalOpen(true);
  };

  const handleOpenEditLeave = (lt: LeaveTypeMaster) => {
    setEditingLeaveId(lt.id);
    setLeaveForm({
      name: lt.name,
      code: lt.code,
      daysPerYear: String(lt.daysPerYear),
      isPaid: lt.isPaid,
      description: lt.description || '',
      status: lt.status || 'ACTIVE'
    });
    setIsLeaveModalOpen(true);
  };

  const handleSaveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.name.trim()) return;

    const quota = Math.max(1, Number(leaveForm.daysPerYear) || 12);
    if (editingLeaveId) {
      updateLeaveType(editingLeaveId, {
        name: leaveForm.name.trim(),
        code: leaveForm.code.trim().toUpperCase() || leaveForm.name.slice(0, 2).toUpperCase(),
        daysPerYear: quota,
        isPaid: leaveForm.isPaid,
        description: leaveForm.description.trim(),
        status: leaveForm.status
      });
    } else {
      addLeaveType({
        name: leaveForm.name.trim(),
        code: leaveForm.code.trim().toUpperCase() || leaveForm.name.slice(0, 2).toUpperCase(),
        daysPerYear: quota,
        isPaid: leaveForm.isPaid,
        description: leaveForm.description.trim(),
        status: leaveForm.status
      });
    }
    setIsLeaveModalOpen(false);
  };

  // Shift Handlers
  const handleOpenAddShift = () => {
    setEditingShiftId(null);
    setShiftForm({
      name: '',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      gracePeriodMinutes: '15',
      workHours: '9',
      status: 'ACTIVE'
    });
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (s: ShiftMaster) => {
    setEditingShiftId(s.id);
    setShiftForm({
      name: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      gracePeriodMinutes: String(s.gracePeriodMinutes),
      workHours: String(s.workHours),
      status: s.status || 'ACTIVE'
    });
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.name.trim()) return;

    const grace = Number(shiftForm.gracePeriodMinutes) || 15;
    const hours = Number(shiftForm.workHours) || 9;

    if (editingShiftId) {
      updateShift(editingShiftId, {
        name: shiftForm.name.trim(),
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        gracePeriodMinutes: grace,
        workHours: hours,
        status: shiftForm.status
      });
    } else {
      addShift({
        name: shiftForm.name.trim(),
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        gracePeriodMinutes: grace,
        workHours: hours,
        status: shiftForm.status
      });
    }
    setIsShiftModalOpen(false);
  };

  // Holiday Handlers
  const handleOpenAddHoliday = () => {
    setEditingHolidayId(null);
    setHolidayForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      countryId: 'ALL',
      isOptional: false,
      description: ''
    });
    setIsHolidayModalOpen(true);
  };

  const handleOpenEditHoliday = (h: HolidayMaster) => {
    setEditingHolidayId(h.id);
    setHolidayForm({
      title: h.title,
      date: h.date,
      countryId: h.countryId,
      isOptional: h.isOptional,
      description: h.description || ''
    });
    setIsHolidayModalOpen(true);
  };

  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayForm.title.trim() || !holidayForm.date) return;

    if (editingHolidayId) {
      updateHoliday(editingHolidayId, {
        title: holidayForm.title.trim(),
        date: holidayForm.date,
        countryId: holidayForm.countryId,
        isOptional: holidayForm.isOptional,
        description: holidayForm.description.trim()
      });
    } else {
      addHoliday({
        title: holidayForm.title.trim(),
        date: holidayForm.date,
        countryId: holidayForm.countryId,
        isOptional: holidayForm.isOptional,
        description: holidayForm.description.trim()
      });
    }
    setIsHolidayModalOpen(false);
  };

  // Branch Handler
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim() || !branchForm.location.trim()) return;

    addBranch({
      tenantId: currentTenant.id,
      name: branchForm.name.trim(),
      location: branchForm.location.trim(),
      country: branchForm.country,
      flag: countryConfig.flag,
      currency: countryConfig.currency,
      headcount: Number(branchForm.headcount) || 10,
      status: 'ACTIVE'
    });
    setIsBranchModalOpen(false);
    setBranchForm({ name: '', location: '', country: currentTenant.countryId, headcount: '15' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#181a20] p-8 rounded-[32px] text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-300 font-medium">Platform Governance &gt; Master Data Control</p>
          <div className="flex items-center gap-2 my-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#ff7a1a]/20 text-[#ff7a1a] border border-[#ff7a1a]/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Super Admin Dynamic Masters
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Platform Master Data Engine</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Centralized dynamic configuration for departments, job titles, leave entitlements, work shifts,
            and country holidays. Any changes propagate instantly across all company tenants and workforce forms.
          </p>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
          <div className="p-2">
            <p className="text-xs text-slate-400">Depts</p>
            <p className="text-base font-extrabold text-[#ff7a1a]">{departments.length}</p>
          </div>
          <div className="p-2 border-l border-white/10">
            <p className="text-xs text-slate-400">Roles</p>
            <p className="text-base font-extrabold text-blue-400">{designations.length}</p>
          </div>
          <div className="p-2 border-l border-white/10">
            <p className="text-xs text-slate-400">Leaves</p>
            <p className="text-base font-extrabold text-emerald-400">{leaveTypes.length}</p>
          </div>
          <div className="p-2 border-l border-white/10">
            <p className="text-xs text-slate-400">Shifts</p>
            <p className="text-base font-extrabold text-amber-400">{shifts.length}</p>
          </div>
          <div className="p-2 border-l border-white/10">
            <p className="text-xs text-slate-400">Holidays</p>
            <p className="text-base font-extrabold text-purple-400">{holidays.length}</p>
          </div>
          <div className="p-2 border-l border-white/10">
            <p className="text-xs text-slate-400">Offices</p>
            <p className="text-base font-extrabold text-cyan-400">{branches.length}</p>
          </div>
          <div className="p-2 border-l border-white/10">
            <p className="text-xs text-slate-400">RBAC</p>
            <p className="text-base font-extrabold text-rose-400">{SYSTEM_PERMISSIONS.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-1.5 rounded-full border border-slate-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('departments');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'departments'
                ? 'bg-[#181a20] text-white shadow-xs scale-102 ring-2 ring-[#ff7a1a]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#ff7a1a]" />
            Departments ({departments.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('designations');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'designations'
                ? 'bg-[#181a20] text-white shadow-xs scale-102 ring-2 ring-[#ff7a1a]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            Designations ({designations.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('leaves');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'leaves'
                ? 'bg-[#181a20] text-white shadow-xs scale-102 ring-2 ring-[#ff7a1a]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            Leave Categories ({leaveTypes.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('shifts');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'shifts'
                ? 'bg-[#181a20] text-white shadow-xs scale-102 ring-2 ring-[#ff7a1a]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Shifts & Hours ({shifts.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('holidays');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'holidays'
                ? 'bg-[#181a20] text-white shadow-xs scale-102 ring-2 ring-[#ff7a1a]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            Holidays ({holidays.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('branches');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'branches'
                ? 'bg-[#181a20] text-white shadow-xs scale-102 ring-2 ring-[#ff7a1a]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            Branch Offices ({branches.length})
          </button>

          {canManageRbac && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('rbac');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rbac'
                  ? 'bg-[#181a20] text-white shadow-xs scale-102 ring-2 ring-[#ff7a1a]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-500" />
              Role Rights & RBAC
            </button>
          )}
        </div>

        {/* Search & Action Button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="pl-10 pr-4 py-2 text-xs rounded-full border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] shadow-2xs w-48 sm:w-64"
            />
          </div>

          {activeTab === 'departments' && canEditDepts && (
            <button
              type="button"
              onClick={handleOpenAddDept}
              className="flex items-center gap-1.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Add Department
            </button>
          )}

          {activeTab === 'designations' && canEditDesigs && (
            <button
              type="button"
              onClick={handleOpenAddDesig}
              className="flex items-center gap-1.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Add Designation
            </button>
          )}

          {activeTab === 'leaves' && canEditLeaves && (
            <button
              type="button"
              onClick={handleOpenAddLeave}
              className="flex items-center gap-1.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Add Leave Category
            </button>
          )}

          {activeTab === 'shifts' && canEditShifts && (
            <button
              type="button"
              onClick={handleOpenAddShift}
              className="flex items-center gap-1.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Add Shift Schedule
            </button>
          )}

          {activeTab === 'holidays' && canEditHolidays && (
            <button
              type="button"
              onClick={handleOpenAddHoliday}
              className="flex items-center gap-1.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Add Holiday
            </button>
          )}

          {activeTab === 'branches' && canEditBranches && (
            <button
              type="button"
              onClick={() => setIsBranchModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Add Office Branch
            </button>
          )}

          {activeTab === 'rbac' && canManageRbac && (
            <button
              type="button"
              onClick={resetRolePermissionsToDefault}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-full shadow-2xs hover:scale-102 transition-all cursor-pointer shrink-0"
              title="Reset all role permissions to security defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              Reset Defaults
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DEPARTMENTS TAB CONTENT */}
      {/* ========================================================= */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#181a20]">Corporate Departments</h3>
              <p className="text-xs text-slate-500">
                Organize company hierarchy, functional reporting, and departmental headcount quotas.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Total: {filteredDepartments.length} Departments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5">Department Name</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Department Head</th>
                  <th className="px-6 py-3.5">Active Workforce</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#fff1e6] text-[#c2410c] flex items-center justify-center font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{dept.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{dept.description || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-mono font-bold text-slate-800 text-[11px]">
                        {dept.code || dept.name.slice(0, 3).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{dept.headName || 'Not Assigned'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{dept.employeeCount}</span> employees
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          dept.status === 'ACTIVE' || !dept.status
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dept.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditDept(dept)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDepartment(dept.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. DESIGNATIONS TAB CONTENT */}
      {/* ========================================================= */}
      {activeTab === 'designations' && (
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#181a20]">Job Titles & Designations</h3>
              <p className="text-xs text-slate-500">
                Define standardized roles and job grades across engineering, management, and executive branches.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Total: {filteredDesignations.length} Designations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5">Designation Title</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Grade / Level</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDesignations.map((desig) => (
                  <tr key={desig.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-slate-900 text-xs">{desig.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{desig.departmentName || 'General'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-mono font-bold text-slate-700 text-[11px]">
                        {desig.level || 'L3'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          desig.status === 'ACTIVE' || !desig.status
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {desig.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditDesig(desig)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Designation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDesignation(desig.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Designation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. LEAVE TYPES TAB CONTENT */}
      {/* ========================================================= */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#181a20]">Statutory & Company Leave Entitlements</h3>
              <p className="text-xs text-slate-500">
                Govern annual paid quotas, medical leaves, maternity/paternity support, and Loss of Pay (LOP) policies.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Total: {filteredLeaveTypes.length} Leave Categories
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Annual Quota</th>
                  <th className="px-6 py-3.5">Remuneration Type</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaveTypes.map((lt) => (
                  <tr key={lt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <CalendarCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{lt.name}</p>
                          <p className="text-[11px] text-slate-400">{lt.description || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-mono font-bold text-slate-800 text-[11px]">
                        {lt.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      {lt.daysPerYear} <span className="text-slate-400 text-[11px] font-normal">days / year</span>
                    </td>
                    <td className="px-6 py-4">
                      {lt.isPaid ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          100% Paid Leave
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Loss of Pay (Unpaid)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          lt.status === 'ACTIVE' || !lt.status
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {lt.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLeave(lt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Leave Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLeaveType(lt.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Leave Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SHIFTS TAB CONTENT */}
      {/* ========================================================= */}
      {activeTab === 'shifts' && (
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#181a20]">Shift Schedules & Punch Windows</h3>
              <p className="text-xs text-slate-500">
                Configure standard operating hours, punch grace periods, and night shift cross-day exceptions.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Total: {filteredShifts.length} Shift Profiles
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5">Shift Name</th>
                  <th className="px-6 py-3.5">Operating Hours</th>
                  <th className="px-6 py-3.5">Daily Work Hours</th>
                  <th className="px-6 py-3.5">Grace Window</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-slate-900 text-xs">{shift.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {shift.startTime} – {shift.endTime}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{shift.workHours} Hours</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-mono text-[11px] text-slate-700 font-bold">
                        {shift.gracePeriodMinutes} mins
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          shift.status === 'ACTIVE' || !shift.status
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {shift.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditShift(shift)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Shift"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteShift(shift.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. HOLIDAYS TAB CONTENT */}
      {/* ========================================================= */}
      {activeTab === 'holidays' && (
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#181a20]">Public & Regional Holiday Calendar</h3>
              <p className="text-xs text-slate-500">
                Manage statutory national holidays and regional bank holidays across all supported jurisdictions.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Total: {filteredHolidays.length} Holidays
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5">Holiday Title</th>
                  <th className="px-6 py-3.5">Calendar Date</th>
                  <th className="px-6 py-3.5">Jurisdiction Scope</th>
                  <th className="px-6 py-3.5">Holiday Type</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHolidays.map((hol) => (
                  <tr key={hol.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{hol.title}</p>
                          <p className="text-[11px] text-slate-400">{hol.description || 'Public Holiday'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{hol.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        {hol.countryId === 'ALL' ? '🌍 All Countries' : `🏳️ ${hol.countryId}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hol.isOptional ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Optional / Restricted
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Mandatory Public
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditHoliday(hol)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Holiday"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHoliday(hol.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Holiday"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. BRANCHES TAB CONTENT */}
      {/* ========================================================= */}
      {activeTab === 'branches' && (
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#181a20]">Corporate Entities & Office Branches</h3>
              <p className="text-xs text-slate-500">
                Physical branches, legal entity locations, and local currency anchors.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Total: {filteredBranches.length} Branch Offices
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredBranches.map((br) => (
              <div key={br.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{br.flag}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {br.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{br.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{br.location}</p>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span>Currency: <strong className="text-slate-800">{br.currency}</strong></span>
                  <span>Headcount: <strong className="text-slate-800">{br.headcount}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. ROLE RIGHTS & RBAC POLICY MATRIX TAB CONTENT */}
      {/* ========================================================= */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-soft overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Role-Based Access Control (RBAC)
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[#181a20]">
                Super Admin Role Rights & Policy Manager
              </h3>
              <p className="text-xs text-slate-500">
                Grant or restrict authority for non-Super Admin roles to manage dynamic masters, payroll, attendance, and workforce records.
              </p>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedRbacRole === 'SUPER_ADMIN'}
                onClick={() => {
                  SYSTEM_PERMISSIONS.forEach((p) => {
                    updateRolePermission(selectedRbacRole, p.key, true);
                  });
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Grant All Rights
              </button>
              <button
                type="button"
                disabled={selectedRbacRole === 'SUPER_ADMIN'}
                onClick={() => {
                  SYSTEM_PERMISSIONS.forEach((p) => {
                    updateRolePermission(selectedRbacRole, p.key, false);
                  });
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Revoke All
              </button>
            </div>
          </div>

          {/* Role Selector Pills */}
          <div className="p-5 bg-slate-50/70 border-b border-slate-100">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2.5">
              Select Target Role to Configure Rights:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { role: 'SUPER_ADMIN' as UserRole, label: 'Super Admin', icon: Crown, desc: 'Root Platform Master', badge: 'Full Access' },
                { role: 'COMPANY_ADMIN' as UserRole, label: 'Company Admin', icon: Building2, desc: 'Executive Portal', badge: 'Company Wide' },
                { role: 'HR_ADMIN' as UserRole, label: 'HR Admin', icon: Briefcase, desc: 'People & Operations', badge: 'HR Operations' },
                { role: 'MANAGER' as UserRole, label: 'Manager', icon: Clock, desc: 'Team Lead & Squad', badge: 'Squad Only' },
                { role: 'EMPLOYEE' as UserRole, label: 'Employee', icon: UserCheck, desc: 'Self-Service (ESS)', badge: 'Self-Service' }
              ].map((item) => {
                const isSelected = selectedRbacRole === item.role;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRbacRole(item.role)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#181a20] text-white border-[#181a20] shadow-sm scale-102 ring-2 ring-[#ff7a1a]'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/10 text-[#ff7a1a]' : 'bg-slate-100 text-slate-700'}`}>
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-[#ff7a1a] text-[#111318]' : 'bg-slate-100 text-slate-600'}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold leading-tight">{item.label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Category:
            </span>
            {[
              'ALL',
              'Dynamic Masters',
              'Workforce & Employees',
              'Attendance & Shifts',
              'Leave Management',
              'Payroll & Statutory',
              'Security & Governance'
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setRbacCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                  rbacCategoryFilter === cat
                    ? 'bg-[#ff7a1a] text-[#111318]'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Permissions Toggle Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5">Permission / Right Key</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Operational Scope & Description</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Access Right Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPermissions.map((perm) => {
                  const isGranted =
                    selectedRbacRole === 'SUPER_ADMIN' ||
                    !!rolePermissions[selectedRbacRole]?.[perm.key];
                  const isSuperAdminRole = selectedRbacRole === 'SUPER_ADMIN';

                  return (
                    <tr
                      key={perm.key}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isGranted ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              isGranted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <Key className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs">{perm.label}</p>
                            <p className="font-mono text-[10px] text-slate-400">{perm.key}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {perm.category}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-slate-600 text-[11px] max-w-sm">
                        {perm.description}
                      </td>

                      <td className="px-6 py-3.5 text-center">
                        {isSuperAdminRole ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Immutable Root
                          </span>
                        ) : isGranted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Granted
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            Restricted
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {isSuperAdminRole ? (
                          <span className="text-slate-400 text-xs font-semibold select-none">
                            Always Allowed
                          </span>
                        ) : (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={(e) =>
                                updateRolePermission(selectedRbacRole, perm.key, e.target.checked)
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff7a1a]"></div>
                          </label>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT DEPARTMENT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDeptId ? 'Edit Department' : 'Create New Department'}
        subtitle="Dynamic Master: Immediately available across employee onboarding and filter selectors"
        maxWidth="md"
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              placeholder="e.g. Artificial Intelligence & Robotics"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Code (Optional)</label>
              <input
                type="text"
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                placeholder="e.g. AIR"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={deptForm.status}
                onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value as any })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Head of Department (Optional)</label>
            <input
              type="text"
              value={deptForm.headName}
              onChange={(e) => setDeptForm({ ...deptForm, headName: e.target.value })}
              placeholder="e.g. Dr. Rajesh Sharma"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              placeholder="Core mandate and responsibilities of this department..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] shadow-sm"
            >
              {editingDeptId ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: ADD / EDIT DESIGNATION */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDesigModalOpen}
        onClose={() => setIsDesigModalOpen(false)}
        title={editingDesigId ? 'Edit Designation' : 'Add New Designation'}
        subtitle="Dynamic Job Role: Immediately selectable in employee profile and salary structures"
        maxWidth="md"
      >
        <form onSubmit={handleSaveDesig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Designation Title *</label>
            <input
              type="text"
              required
              value={desigForm.title}
              onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
              placeholder="e.g. Principal AI Architect"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={desigForm.departmentName}
              onChange={(e) => setDesigForm({ ...desigForm, departmentName: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Level / Grade</label>
              <input
                type="text"
                value={desigForm.level}
                onChange={(e) => setDesigForm({ ...desigForm, level: e.target.value })}
                placeholder="e.g. L4 / Exec"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={desigForm.status}
                onChange={(e) => setDesigForm({ ...desigForm, status: e.target.value as any })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDesigModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] shadow-sm"
            >
              {editingDesigId ? 'Save Changes' : 'Create Designation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: ADD / EDIT LEAVE CATEGORY */}
      {/* ========================================================= */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title={editingLeaveId ? 'Edit Leave Category' : 'Create Leave Category'}
        subtitle="Dynamic Entitlement: Configures company leave balances and apply-leave options"
        maxWidth="md"
      >
        <form onSubmit={handleSaveLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={leaveForm.name}
              onChange={(e) => setLeaveForm({ ...leaveForm, name: e.target.value })}
              placeholder="e.g. Paternity Leave"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
              <input
                type="text"
                value={leaveForm.code}
                onChange={(e) => setLeaveForm({ ...leaveForm, code: e.target.value })}
                placeholder="e.g. PTL"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Quota (Days) *</label>
              <input
                type="number"
                min="1"
                required
                value={leaveForm.daysPerYear}
                onChange={(e) => setLeaveForm({ ...leaveForm, daysPerYear: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="isPaid"
              checked={leaveForm.isPaid}
              onChange={(e) => setLeaveForm({ ...leaveForm, isPaid: e.target.checked })}
              className="w-4 h-4 text-[#ea580c] rounded border-slate-300 focus:ring-[#ff7a1a]"
            />
            <label htmlFor="isPaid" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
              100% Paid Leave (Do not deduct salary / LOP)
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Description</label>
            <textarea
              rows={2}
              value={leaveForm.description}
              onChange={(e) => setLeaveForm({ ...leaveForm, description: e.target.value })}
              placeholder="Eligibility criteria and documentation required..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] shadow-sm"
            >
              {editingLeaveId ? 'Save Changes' : 'Create Leave Type'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: ADD / EDIT SHIFT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={editingShiftId ? 'Edit Shift Schedule' : 'Create Shift Schedule'}
        subtitle="Dynamic Shift: Controls attendance check-in windows and overtime calculations"
        maxWidth="md"
      >
        <form onSubmit={handleSaveShift} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Name *</label>
            <input
              type="text"
              required
              value={shiftForm.name}
              onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
              placeholder="e.g. US Evening Shift"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
              <input
                type="text"
                required
                value={shiftForm.startTime}
                onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                placeholder="e.g. 02:00 PM"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
              <input
                type="text"
                required
                value={shiftForm.endTime}
                onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                placeholder="e.g. 11:00 PM"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                min="0"
                value={shiftForm.gracePeriodMinutes}
                onChange={(e) => setShiftForm({ ...shiftForm, gracePeriodMinutes: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Hours per Day</label>
              <input
                type="number"
                min="1"
                value={shiftForm.workHours}
                onChange={(e) => setShiftForm({ ...shiftForm, workHours: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsShiftModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] shadow-sm"
            >
              {editingShiftId ? 'Save Changes' : 'Create Shift'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: ADD / EDIT HOLIDAY */}
      {/* ========================================================= */}
      <Modal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title={editingHolidayId ? 'Edit Holiday' : 'Add Calendar Holiday'}
        subtitle="Dynamic Calendar: Propagates to employee smart calendars and payroll work days"
        maxWidth="md"
      >
        <form onSubmit={handleSaveHoliday} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday Title *</label>
            <input
              type="text"
              required
              value={holidayForm.title}
              onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })}
              placeholder="e.g. Eid al-Fitr"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jurisdiction</label>
              <select
                value={holidayForm.countryId}
                onChange={(e) => setHolidayForm({ ...holidayForm, countryId: e.target.value as any })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="ALL">🌍 Global / All Countries</option>
                <option value="IN">🇮🇳 India</option>
                <option value="AE">🇦🇪 UAE</option>
                <option value="UK">🇬🇧 United Kingdom</option>
                <option value="SG">🇸🇬 Singapore</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="isOptional"
              checked={holidayForm.isOptional}
              onChange={(e) => setHolidayForm({ ...holidayForm, isOptional: e.target.checked })}
              className="w-4 h-4 text-[#ea580c] rounded border-slate-300 focus:ring-[#ff7a1a]"
            />
            <label htmlFor="isOptional" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
              Optional / Restricted Holiday (Employee may choose)
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={holidayForm.description}
              onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
              placeholder="e.g. Festival observation and bank holiday"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsHolidayModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] shadow-sm"
            >
              {editingHolidayId ? 'Save Changes' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 6: ADD OFFICE BRANCH */}
      {/* ========================================================= */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title="Provision Branch Office Node"
        subtitle="Register new geographical facility or legal operating entity"
        maxWidth="md"
      >
        <form onSubmit={handleSaveBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name *</label>
            <input
              type="text"
              required
              value={branchForm.name}
              onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
              placeholder="e.g. Bengaluru Innovation Lab"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Address *</label>
            <input
              type="text"
              required
              value={branchForm.location}
              onChange={(e) => setBranchForm({ ...branchForm, location: e.target.value })}
              placeholder="e.g. Whitefield Tech Zone, Bengaluru"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
              <select
                value={branchForm.country}
                onChange={(e) => setBranchForm({ ...branchForm, country: e.target.value as any })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="IN">🇮🇳 India (INR)</option>
                <option value="AE">🇦🇪 UAE (AED)</option>
                <option value="UK">🇬🇧 United Kingdom (GBP)</option>
                <option value="SG">🇸🇬 Singapore (SGD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Headcount</label>
              <input
                type="number"
                min="1"
                value={branchForm.headcount}
                onChange={(e) => setBranchForm({ ...branchForm, headcount: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBranchModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] shadow-sm"
            >
              Provision Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

