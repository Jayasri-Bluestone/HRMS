import React, { useState } from 'react';
import { PayrollRun, Payslip } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { PayrollRunWizard } from './PayrollRunWizard';
import { PayslipModal } from './PayslipModal';
import {
  PlayCircle,
  FileText,
  Lock
} from 'lucide-react';

export const PayrollOverview: React.FC = () => {
  const { currentTenant, countryConfig, formatCurrency } = useTenant();
  const { payrollRuns, employees, completePayrollRun, getPayslipForEmployee } = useHrmsData();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  // Strict tenant isolation
  const tenantRuns = payrollRuns.filter((r) => r.tenantId === currentTenant.id);
  const tenantEmployee = employees.find((e) => e.tenantId === currentTenant.id) || employees[0];

  const handleCompleteRun = async (newRun: PayrollRun) => {
    await completePayrollRun(newRun);
  };

  const handleOpenPayslip = (slip: Payslip) => {
    setSelectedPayslip(slip);
    setIsPayslipOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-7 rounded-[32px] border border-slate-100 shadow-soft">
        <div>
          <p className="text-xs text-slate-400 font-medium">Portal &gt; Payroll</p>
          <div className="flex items-center gap-2 my-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c] border border-[#ffd4b0]">
              {countryConfig.flag} {countryConfig.name} Payroll Adapter
            </span>
            <span className="text-xs text-slate-400 font-mono">Currency: {countryConfig.currency} ({countryConfig.currencySymbol})</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">International Payroll Engine</h1>
          <p className="text-xs text-slate-500">
            Localized tax calculations, statutory deduction compliance, approval gates, and payslip distribution.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenPayslip(getPayslipForEmployee(tenantEmployee?.id || 'emp-005'))}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Sample Payslip
          </button>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold rounded-full shadow-xs transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" /> Run Payroll Cycle
          </button>
        </div>
      </div>

      {/* Country Compliance Rules Card */}
      <div className="p-5 rounded-[28px] bg-[#181a20] text-white text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
            Active Country Rules Engine
          </span>
          <h4 className="font-bold text-sm text-white mt-0.5">
            Jurisdiction: {countryConfig.name} ({currentTenant.currency})
          </h4>
          <p className="text-slate-400 mt-1">
            Applied rules: {countryConfig.statutoryDeductions.join(' • ')}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-1 bg-indigo-500/20 text-indigo-300 font-mono rounded text-[11px] border border-indigo-500/30">
            Rules Version: 2026.11
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Immutable execution snapshot enabled</p>
        </div>
      </div>

      {/* Payroll Cycles Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Historical & Scheduled Payroll Runs</h3>
          <span className="text-xs text-slate-400">{tenantRuns.length} Cycles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Cycle Period</th>
                <th className="py-3.5 px-4">Headcount</th>
                <th className="py-3.5 px-4">Gross Compensation</th>
                <th className="py-3.5 px-4">Statutory Deductions</th>
                <th className="py-3.5 px-4">Net Payout</th>
                <th className="py-3.5 px-4">Status & Lock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenantRuns.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-slate-900 text-sm">{run.period}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Run: {run.runDate}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{run.totalEmployees} Employees</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {formatCurrency(run.totalGross)}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 font-semibold">
                    -{formatCurrency(run.totalDeductions)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                    {formatCurrency(run.totalNet)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={run.status} />
                      {run.status === 'LOCKED' && (
                        <span title="Locked by Approver">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPayslip(getPayslipForEmployee(tenantEmployee?.id || 'emp-005'))}
                        className="px-2.5 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md font-semibold text-[11px] transition-colors"
                      >
                        View Payslips
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PayrollRunWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCompleteRun={handleCompleteRun}
      />
      <PayslipModal
        payslip={selectedPayslip}
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
      />
    </div>
  );
};
