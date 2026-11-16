import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Banknote,
  TrendingUp,
  CreditCard,
  Globe2,
  MapPin
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CompanyAdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

const DEPT_BUDGET_DATA = [
  { dept: 'Engineering', spend: 4500000, headcount: 45, color: '#181a20' },
  { dept: 'Product', spend: 1800000, headcount: 12, color: '#ff7a1a' },
  { dept: 'Sales', spend: 1200000, headcount: 14, color: '#38bdf8' },
  { dept: 'HR & Ops', spend: 650000, headcount: 8, color: '#f59e0b' },
  { dept: 'Finance & Legal', spend: 370000, headcount: 5, color: '#a855f7' }
];

export const CompanyAdminDashboard: React.FC<CompanyAdminDashboardProps> = ({
  onNavigateTab
}) => {
  const { currentUser } = useAuth();
  const { currentTenant, countryConfig, formatCurrency } = useTenant();
  const { branches, addBranch } = useHrmsData();

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [branchHeadcount, setBranchHeadcount] = useState('12');

  const usagePercent = Math.round((currentTenant.employeeCount / currentTenant.employeeLimit) * 100);

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchLocation.trim()) return;
    addBranch({
      tenantId: currentTenant.id,
      name: branchName.trim(),
      location: branchLocation.trim(),
      country: currentTenant.countryId,
      flag: countryConfig.flag,
      currency: `${countryConfig.currency} (${countryConfig.currencySymbol})`,
      headcount: Number(branchHeadcount) || 10,
      status: 'ACTIVE'
    });
    setBranchName('');
    setBranchLocation('');
    setBranchHeadcount('12');
    setIsBranchModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Top Executive Banner */}
      <div className="bg-[#181a20] rounded-[32px] p-7 md:p-8 text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#ff7a1a]/20 text-[#ff7a1a] border border-[#ff7a1a]/30 uppercase tracking-wider">
              Executive Company Portal
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Tenant ID: {currentTenant.code}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {currentTenant.name} Overview
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Executive leadership hub for {currentUser.name} • Registered in {countryConfig.name} ({countryConfig.currency})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('billing')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 transition-all shadow-xs"
          >
            <CreditCard className="w-4 h-4 text-[#ff7a1a]" />
            Manage Subscription
          </button>
          <button
            onClick={() => onNavigateTab('payroll')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] rounded-full text-xs font-bold transition-all shadow-md"
          >
            <Banknote className="w-4 h-4" />
            Executive Financials
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Headcount</span>
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{currentTenant.employeeCount}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c]">
              {usagePercent}% Cap
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Limit: {currentTenant.employeeLimit} seats ({currentTenant.planName})
          </p>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Payroll Burn</span>
            <div className="w-9 h-9 rounded-full bg-[#fff1e6] flex items-center justify-center text-[#c2410c]">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{formatCurrency(8520000)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Includes statutory tax & PF deductions
          </p>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Talent Retention</span>
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">96.4%</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c]">
              +2.1% YoY
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Annualized voluntary turnover: 3.6%
          </p>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Branches</span>
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{branches.length}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {branches.length} Locations
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            India HQ, UAE Branch, UK Node
          </p>
        </div>
      </div>

      {/* Charts & Department Spend Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Department Budget Breakdown */}
        <div className="lg:col-span-8 bg-white rounded-[32px] p-7 border border-slate-100 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 font-medium">Financial Analytics</p>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
                Department Spend & Headcount Allocation
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('employees')}
              className="text-xs font-bold text-[#c2410c] hover:underline"
            >
              View Full Team &gt;
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_BUDGET_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dept" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Monthly Spend']}
                  contentStyle={{ backgroundColor: '#181a20', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="spend" fill="#181a20" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100 text-xs">
            {DEPT_BUDGET_DATA.map((d) => (
              <div key={d.dept} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{d.dept}</p>
                <p className="font-bold text-slate-900 mt-0.5">{d.headcount} Staff</p>
              </div>
            ))}
          </div>
        </div>

        {/* Global Branches & Corporate Nodes */}
        <div className="lg:col-span-4 bg-white rounded-[32px] p-7 border border-slate-100 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Multi-Company Architecture</p>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
                  Corporate Branch Nodes
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3.5">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-base">{b.flag}</span>
                      {b.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c]">
                      {b.headcount} Members
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {b.location} • {b.currency}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBranchModalOpen(true)}
            className="w-full mt-4 py-2.5 rounded-full bg-[#181a20] hover:bg-[#242834] text-white text-xs font-bold transition-colors shadow-xs"
          >
            + Add Company Branch
          </button>
        </div>
      </div>

      {/* Add Branch Modal */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title="Add Company Branch Node"
        subtitle={`Register a new office entity under ${currentTenant.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleAddBranchSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name *</label>
            <input
              type="text"
              required
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="e.g. Bengaluru R&D Hub"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City / Address *</label>
            <input
              type="text"
              required
              value={branchLocation}
              onChange={(e) => setBranchLocation(e.target.value)}
              placeholder="e.g. Bellandur Outer Ring Road"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Headcount</label>
            <input
              type="number"
              min="1"
              value={branchHeadcount}
              onChange={(e) => setBranchHeadcount(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBranchModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold rounded-full"
            >
              Create Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

