import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { useToast } from '../../contexts/ToastContext';
import { COUNTRIES } from '../../mockData/countries';
import { SUBSCRIPTION_PLANS } from '../../mockData/subscriptions';
import { CountryCode, Tenant } from '../../types';
import { apiClient } from '../../services/apiClient';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Building2,
  DollarSign,
  Users,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  Sliders,
  Search,
  Globe2,
  AlertCircle,
  Calendar,
  CalendarCheck,
  FileSpreadsheet,
  CreditCard,
  ArrowRight,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface SuperAdminDashboardProps {
  onNavigateTab?: (tab: string) => void;
  viewMode?: 'overview' | 'tenants';
}

const resolvePlanPriceMonthly = (planName: string): number => {
  const lower = planName.toLowerCase();
  const match = SUBSCRIPTION_PLANS.find((p) =>
    lower.includes(p.name.split(' ')[0].toLowerCase())
  );
  return match ? match.priceMonthly : 99;
};

const resolvePlanDefaultLimit = (planName: string): number => {
  const lower = planName.toLowerCase();
  const match = SUBSCRIPTION_PLANS.find((p) =>
    lower.includes(p.name.split(' ')[0].toLowerCase())
  );
  return match ? match.employeeLimit : 150;
};

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onNavigateTab,
  viewMode = 'overview'
}) => {
  const { isDemoMode, token } = useAuth();
  const { allTenants, provisionTenant, updateTenant, switchTenant } = useTenant();
  const { recordAuditEvent, departments, designations, leaveTypes, shifts, holidays } = useHrmsData();
  const { showToast } = useToast();

  // Table search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'TRIAL' | 'SUSPENDED'>('ALL');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');

  // Provision Tenant modal state
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [countryId, setCountryId] = useState<CountryCode>('IN');
  const [planName, setPlanName] = useState('Growth Plan');
  const [employeeLimit, setEmployeeLimit] = useState('150');
  const [initialStatus, setInitialStatus] = useState<'ACTIVE' | 'TRIAL'>('ACTIVE');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [provisionError, setProvisionError] = useState('');

  // Configure Tenant modal state
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'TRIAL' | 'SUSPENDED'>('ACTIVE');
  const [editPlanName, setEditPlanName] = useState('Growth Plan');
  const [editLimit, setEditLimit] = useState('150');
  const [editTimezone, setEditTimezone] = useState('Asia/Kolkata');

  // Inspect Tenant modal state
  const [inspectingTenant, setInspectingTenant] = useState<Tenant | null>(null);

  // Live metrics computed dynamically from allTenants
  const metrics = useMemo(() => {
    const activeCount = allTenants.filter((t) => t.status === 'ACTIVE').length;
    const trialCount = allTenants.filter((t) => t.status === 'TRIAL').length;
    const suspendedCount = allTenants.filter((t) => t.status === 'SUSPENDED').length;
    const totalEmployees = allTenants.reduce((acc, t) => acc + t.employeeCount, 0);
    const uniqueCountries = new Set(allTenants.map((t) => t.countryId)).size;

    const currentMrr = allTenants.reduce((sum, t) => {
      if (t.status !== 'ACTIVE') return sum;
      return sum + resolvePlanPriceMonthly(t.planName);
    }, 0);

    return {
      activeCount,
      trialCount,
      suspendedCount,
      totalEmployees,
      uniqueCountries,
      currentMrr,
      projectedArr: currentMrr * 12
    };
  }, [allTenants]);

  // Dynamic MRR trend anchored to current live MRR
  const revenueTrendData = useMemo(() => {
    const base = Math.max(400, metrics.currentMrr);
    return [
      { month: 'Jun 2026', mrr: Math.round(base * 0.45) },
      { month: 'Jul 2026', mrr: Math.round(base * 0.58) },
      { month: 'Aug 2026', mrr: Math.round(base * 0.7) },
      { month: 'Sep 2026', mrr: Math.round(base * 0.82) },
      { month: 'Oct 2026', mrr: Math.round(base * 0.92) },
      { month: 'Nov 2026', mrr: metrics.currentMrr }
    ];
  }, [metrics.currentMrr]);

  // Dynamic Employees by Tenant bar chart
  const tenantGeoData = useMemo(() => {
    return allTenants.map((t) => ({
      country: `${t.countryId} (${t.name.split(' ')[0]})`,
      employees: t.employeeCount
    }));
  }, [allTenants]);

  // Filtered tenants table
  const filteredTenants = useMemo(() => {
    return allTenants.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesCountry = countryFilter === 'ALL' || t.countryId === countryFilter;
      return matchesSearch && matchesStatus && matchesCountry;
    });
  }, [allTenants, searchQuery, statusFilter, countryFilter]);

  const handleOpenProvision = () => {
    setProvisionError('');
    setCompanyName('');
    setCompanyCode('');
    setAdminName('');
    setAdminEmail('');
    setCountryId('IN');
    setPlanName('Growth Plan');
    setEmployeeLimit('150');
    setInitialStatus('ACTIVE');
    setIsProvisionOpen(true);
  };

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = companyName.trim();
    if (!trimmedName) return;

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const generatedCode =
      companyCode.trim().toUpperCase() ||
      `${slug.replace(/-/g, '').slice(0, 4).toUpperCase()}-${countryId}`;

    const duplicate = allTenants.some(
      (t) => t.slug === slug || t.code.toUpperCase() === generatedCode
    );
    if (duplicate) {
      setProvisionError(`A tenant with slug "${slug}" or code "${generatedCode}" already exists.`);
      return;
    }

    const created = await provisionTenant({
      name: trimmedName,
      slug,
      code: generatedCode,
      countryId,
      planName,
      employeeLimit: Math.max(1, Number(employeeLimit) || 50),
      status: initialStatus,
      adminName: adminName.trim() || `${trimmedName} Admin`,
      adminEmail: adminEmail.trim() || `admin@${slug}.com`
    });

    recordAuditEvent(
      'TENANT_PROVISIONED',
      'Platform',
      `Provisioned SaaS tenant ${created.name} (${created.code}) on ${created.planName} [${created.status}]`
    );
    showToast(
      `Tenant Provisioned: ${created.name}`,
      'success',
      `${COUNTRIES[countryId].name} (${created.currency}) • Admin: ${adminEmail.trim() || `admin@${slug}.com`}`
    );
    setIsProvisionOpen(false);
  };

  const handleOpenConfigure = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setEditName(tenant.name);
    setEditStatus(tenant.status);
    setEditPlanName(tenant.planName);
    setEditLimit(String(tenant.employeeLimit));
    setEditTimezone(tenant.timezone);
  };

  const handleSaveConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    const nextLimit = Math.max(1, Number(editLimit) || editingTenant.employeeLimit);
    await updateTenant(editingTenant.id, {
      name: editName.trim() || editingTenant.name,
      status: editStatus,
      planName: editPlanName,
      employeeLimit: nextLimit,
      timezone: editTimezone.trim() || editingTenant.timezone
    });

    recordAuditEvent(
      'TENANT_UPDATED',
      'Platform',
      `Updated ${editingTenant.code}: status=${editStatus}, plan=${editPlanName}, limit=${nextLimit}`
    );
    showToast(
      `Updated ${editName.trim() || editingTenant.name}`,
      editStatus === 'SUSPENDED' ? 'warning' : 'success',
      `Status: ${editStatus} • ${editPlanName} (${nextLimit} seats)`
    );
    setEditingTenant(null);
  };

  const handleInspectTenant = async (tenant: Tenant) => {
    switchTenant(tenant.id);
    setInspectingTenant(tenant);
    if (!isDemoMode && token) {
      apiClient.companies.logContextSwitch(tenant.id).catch(() => {});
    }
    recordAuditEvent(
      'TENANT_CONTEXT_SWITCHED',
      'Platform',
      `Super Admin inspected workspace ${tenant.name} (${tenant.code})`
    );
  };

  const isOverview = viewMode === 'overview';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#181a20] p-8 rounded-[32px] text-white shadow-soft">
        <div>
          <p className="text-xs text-slate-300 font-medium">
            Portal &gt; {isOverview ? 'Platform Overview' : 'Tenant Directory'}
          </p>
          <div className="flex items-center gap-2 my-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#ff7a1a]/20 text-[#ff7a1a] border border-[#ff7a1a]/30 inline-block">
              Multi-Tenant SaaS Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {isOverview ? 'Platform Executive Overview' : 'Tenant Directory & Lifecycle'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {isOverview
              ? 'Global SaaS revenue, active commercial jurisdictions, and cross-country payroll rule adapters.'
              : 'Provision isolated commercial tenants, manage lifecycle status, and adjust seat quotas.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isOverview && onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('tenants')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-white/20 transition-colors"
            >
              Manage Tenants ({allTenants.length})
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenProvision}
            className="flex items-center gap-2 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold px-5 py-2.5 rounded-full shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Provision New Tenant
          </button>
        </div>
      </div>

      {isOverview && (
        <>
          {/* Master Control & Operations Deck: Unrestricted Multi-Tenant Navigation */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ea580c] bg-[#fff1e6] px-2.5 py-0.5 rounded-full">
                  Super Admin Master Control
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Global System Modules & Operational Oversight
                </h3>
                <p className="text-xs text-slate-500">
                  Direct management access across all tenant organizations, payroll cycles, attendance ledgers, and leaves.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
              {[
                { id: 'tenants', label: 'Tenants', icon: Building2, desc: 'Provision & Seats' },
                { id: 'masters', label: 'Platform Masters', icon: Layers, desc: 'Depts, Roles & Shifts' },
                { id: 'employees', label: 'Workforce', icon: Users, desc: 'Roster & Salaries' },
                { id: 'attendance', label: 'Attendance', icon: Calendar, desc: 'Punches & Exceptions' },
                { id: 'leave', label: 'Leaves', icon: CalendarCheck, desc: 'Review & Approvals' },
                { id: 'payroll', label: 'Payroll', icon: DollarSign, desc: 'Runs & Statutory' },
                { id: 'reports', label: 'Reports', icon: FileSpreadsheet, desc: 'BI & Tax Registers' },
                { id: 'billing', label: 'Subscriptions', icon: CreditCard, desc: 'SaaS MRR & Plans' },
                { id: 'audit', label: 'Audit Trail', icon: ShieldCheck, desc: 'Immutable Security' }
              ].map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => onNavigateTab?.(mod.id)}
                    className="flex flex-col items-center text-center p-3.5 rounded-2xl border border-slate-200/80 hover:border-[#ff7a1a] hover:bg-[#fff7ed] transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#ff7a1a] flex items-center justify-center text-slate-700 group-hover:text-[#111318] transition-colors mb-2">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#ea580c] line-clamp-1">
                      {mod.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {mod.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Master Control Strip */}
          <div className="bg-gradient-to-r from-[#181a20] to-[#252830] p-5 rounded-[24px] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-soft">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ff7a1a] flex items-center justify-center text-[#111318] shrink-0 font-bold shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white">Dynamic Master Data Engine</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active & Synchronized
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {departments.length} Departments • {designations.length} Job Roles • {leaveTypes.length} Leave Quotas • {shifts.length} Shift Profiles • {holidays.length} Holidays
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab?.('masters')}
              className="flex items-center gap-2 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-extrabold px-4 py-2 rounded-full shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
            >
              <span>Manage System Masters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live Computed KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Commercial Tenants"
          value={allTenants.length}
          change={`${metrics.activeCount} Active`}
          isPositive={true}
          subtitle={`${metrics.trialCount} Trial • ${metrics.suspendedCount} Suspended`}
          icon={Building2}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Active Monthly MRR"
          value={`$${metrics.currentMrr.toLocaleString()}`}
          change={`$${metrics.projectedArr.toLocaleString()} ARR`}
          isPositive={true}
          subtitle="Excludes trial & suspended accounts"
          icon={DollarSign}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Platform Total Users"
          value={metrics.totalEmployees}
          change={`${metrics.uniqueCountries} Jurisdictions`}
          isPositive={true}
          subtitle="Active seats across all tenants"
          icon={Users}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Tenant Isolation & SLA"
          value="99.98%"
          change="Zero breaches"
          isPositive={true}
          subtitle="Audit trail & RBAC enforced"
          icon={ShieldCheck}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">SaaS Revenue Growth (MRR)</h3>
              <p className="text-xs text-slate-500">
                Recurring subscription revenue across {metrics.activeCount} active paying tenants
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">
              Current: ${metrics.currentMrr.toLocaleString()} / mo
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'MRR']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="var(--color-primary-600)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mrrGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Employees by Tenant</h3>
          <p className="text-xs text-slate-500 mb-4">Live headcount volume per provisioned node</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenantGeoData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="country" type="category" stroke="#94a3b8" fontSize={10} width={96} />
                <Tooltip
                  formatter={(val: number) => [val, 'Headcount']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="employees" fill="var(--color-primary-600)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Global Country Statutory Payroll Rules Registry */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Country Payroll Rule Adapters</h3>
              <p className="text-xs text-slate-500">Active platform-wide tax & statutory engines (Rule Version 2026.11)</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            v2026.11 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.values(COUNTRIES).map((c) => {
            const tenantCount = allTenants.filter((t) => t.countryId === c.code).length;
            return (
              <div key={c.code} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">
                    {c.flag} {c.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {tenantCount} {tenantCount === 1 ? 'tenant' : 'tenants'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Currency: {c.currency} ({c.currencySymbol}) • Tax Year: {c.taxYearStart}
                </p>
                <p className="text-[10px] text-slate-600 font-medium line-clamp-2">
                  {c.statutoryDeductions.join(' • ')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}

      {!isOverview && (
      <>
      {/* Provisioned Tenants Table with Search & Status Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Provisioned SaaS Tenants</h3>
            <p className="text-xs text-slate-500">
              Manage lifecycle status, seat quotas, and country payroll bindings ({filteredTenants.length} shown)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                aria-label="Search tenants"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company or code..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>

            <select
              aria-label="Filter tenants by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <select
              aria-label="Filter tenants by country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="ALL">All Countries</option>
              {Object.values(COUNTRIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Company / Slug</th>
                <th className="py-3.5 px-4">Country & Currency</th>
                <th className="py-3.5 px-4">Subscription Plan</th>
                <th className="py-3.5 px-4">Usage / Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => {
                  const percent =
                    tenant.employeeLimit > 0
                      ? Math.round((tenant.employeeCount / tenant.employeeLimit) * 100)
                      : 0;
                  const barWidth = Math.min(100, Math.max(0, percent));

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900 text-sm">{tenant.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {tenant.code} • /{tenant.slug}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">
                          {COUNTRIES[tenant.countryId]?.flag} {tenant.countryId} ({tenant.currencySymbol}{' '}
                          {tenant.currency})
                        </span>
                        <div className="text-[11px] text-slate-400">{tenant.timezone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {tenant.planName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {tenant.employeeCount} / {tenant.employeeLimit}
                          </span>
                          <span className="text-[11px] text-slate-400">({percent}%)</span>
                        </div>
                        <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${percent > 85 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={tenant.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenConfigure(tenant)}
                            className="p-1.5 text-slate-500 hover:text-indigo-700 rounded-md hover:bg-indigo-50 transition-colors"
                            title="Configure Tenant Plan & Status"
                            aria-label={`Configure ${tenant.name}`}
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInspectTenant(tenant)}
                            className="p-1.5 text-slate-500 hover:text-[#c2410c] rounded-md hover:bg-[#fff1e6] transition-colors"
                            title="Inspect Tenant Workspace"
                            aria-label={`Inspect ${tenant.name}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No tenants match the current search/filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Provision Tenant Modal */}
      <Modal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        title="Provision New SaaS Tenant"
        subtitle="Create an isolated company workspace with initial Company Admin and country payroll rules"
        maxWidth="lg"
      >
        <form onSubmit={handleProvisionTenant} className="space-y-4">
          {provisionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{provisionError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setProvisionError('');
                }}
                placeholder="e.g. Horizon FinTech Ltd"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unique Code</label>
              <input
                type="text"
                value={companyCode}
                onChange={(e) => {
                  setCompanyCode(e.target.value.toUpperCase());
                  setProvisionError('');
                }}
                placeholder="AUTO"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country Jurisdiction</label>
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value as CountryCode)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="IN">India (INR)</option>
                <option value="AE">UAE (AED)</option>
                <option value="UK">United Kingdom (GBP)</option>
                <option value="SG">Singapore (SGD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Tier</label>
              <select
                value={planName}
                onChange={(e) => {
                  const nextPlan = e.target.value;
                  setPlanName(nextPlan);
                  setEmployeeLimit(String(resolvePlanDefaultLimit(nextPlan)));
                }}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Starter Plan">Starter Plan ($99/mo)</option>
                <option value="Growth Plan">Growth Plan ($249/mo)</option>
                <option value="Enterprise Plan">Enterprise Plan ($499/mo)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seat Cap</label>
              <input
                type="number"
                min="1"
                value={employeeLimit}
                onChange={(e) => setEmployeeLimit(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as 'ACTIVE' | 'TRIAL')}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="ACTIVE">ACTIVE (Paid)</option>
                <option value="TRIAL">TRIAL (14-Day Evaluation)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Admin Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsProvisionOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold rounded-full"
            >
              Provision Tenant
            </button>
          </div>
        </form>
      </Modal>

      {/* Configure Tenant Modal */}
      <Modal
        isOpen={!!editingTenant}
        onClose={() => setEditingTenant(null)}
        title={`Configure Tenant — ${editingTenant?.name || ''}`}
        subtitle={`Code: ${editingTenant?.code || ''} • Modify lifecycle status, plan tier, and seat capacity`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveConfigure} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lifecycle Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="TRIAL">TRIAL</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
              <input
                type="text"
                value={editTimezone}
                onChange={(e) => setEditTimezone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
              <select
                value={editPlanName}
                onChange={(e) => {
                  const nextPlan = e.target.value;
                  setEditPlanName(nextPlan);
                  setEditLimit(String(resolvePlanDefaultLimit(nextPlan)));
                }}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Starter Plan">Starter Plan</option>
                <option value="Growth Plan">Growth Plan</option>
                <option value="Enterprise Plan">Enterprise Plan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Seat Limit</label>
              <input
                type="number"
                min="1"
                value={editLimit}
                onChange={(e) => setEditLimit(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingTenant(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#181a20] hover:bg-[#242834] text-white text-xs font-bold rounded-full"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Tenant Inspector Modal */}
      <Modal
        isOpen={!!inspectingTenant}
        onClose={() => setInspectingTenant(null)}
        title={inspectingTenant ? `${inspectingTenant.name} (${inspectingTenant.code})` : 'Tenant Inspector'}
        subtitle="Cross-tenant diagnostic overview & quick workspace actions"
        maxWidth="lg"
      >
        {inspectingTenant && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-medium">Status</span>
                <div className="mt-1">
                  <StatusBadge status={inspectingTenant.status} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-medium">Jurisdiction</span>
                <p className="font-bold text-slate-900 mt-1">
                  {COUNTRIES[inspectingTenant.countryId]?.flag} {COUNTRIES[inspectingTenant.countryId]?.name}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-medium">Seat Utilization</span>
                <p className="font-bold text-slate-900 mt-1">
                  {inspectingTenant.employeeCount} / {inspectingTenant.employeeLimit} seats
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#181a20] text-white space-y-1.5">
              <p className="text-[11px] uppercase tracking-wider text-[#ff7a1a] font-bold">
                Active Statutory Payroll Rules ({inspectingTenant.currency})
              </p>
              <p className="text-xs text-slate-200">
                {COUNTRIES[inspectingTenant.countryId]?.statutoryDeductions.join(' • ')}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {onNavigateTab && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingTenant(null);
                      onNavigateTab('audit');
                    }}
                    className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700"
                  >
                    View Audit Trail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingTenant(null);
                      onNavigateTab('billing');
                    }}
                    className="px-4 py-2 rounded-full bg-[#ff7a1a] hover:bg-[#e8670a] font-bold text-[#111318]"
                  >
                    Manage Subscription
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
