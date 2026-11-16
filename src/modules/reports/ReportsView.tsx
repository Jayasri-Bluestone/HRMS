import React, { useState, useMemo } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { useToast } from '../../contexts/ToastContext';
import { downloadCSV, downloadHtmlDocument } from '../../utils/exportUtils';
import { ModernDatePickerPopover } from '../../components/common/ModernDatePickerPopover';
import {
  Download,
  FileSpreadsheet,
  Printer,
  ArrowUpRight
} from 'lucide-react';

interface ReportCategory {
  id: string;
  name: string;
  description: string;
  type: 'PAYROLL' | 'ATTENDANCE' | 'EMPLOYEE' | 'STATUTORY';
  frequency: string;
}

const REPORT_TEMPLATES: ReportCategory[] = [
  {
    id: 'rep-pay-01',
    name: 'Monthly Payroll Disbursement Register',
    description: 'Detailed employee-level gross earnings, statutory deductions, and net disbursements.',
    type: 'PAYROLL',
    frequency: 'Monthly'
  },
  {
    id: 'rep-att-01',
    name: 'Attendance Muster Roll & Hours Density',
    description: 'Daily check-in, check-out, working hours, geofence validations, and LOP deductions.',
    type: 'ATTENDANCE',
    frequency: 'Monthly / Custom Range'
  },
  {
    id: 'rep-stat-01',
    name: 'Statutory Tax Filing (EPF / ESI / WPS / PAYE / CPF)',
    description: 'Formatted file ready for direct submission to government tax and labor portals.',
    type: 'STATUTORY',
    frequency: 'Monthly / Quarterly'
  },
  {
    id: 'rep-emp-01',
    name: 'Headcount & Leave Liability Report',
    description: 'Active employee counts across departments, leave accrual balances, and financial liability.',
    type: 'EMPLOYEE',
    frequency: 'Quarterly / Annual'
  }
];

export const ReportsView: React.FC = () => {
  const { currentTenant, countryConfig, formatCurrency } = useTenant();
  const { employees, recordAuditEvent } = useHrmsData();
  const { showToast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('rep-pay-01');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [dateRangeStart, setDateRangeStart] = useState<string>('2026-11-01');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('2026-11-30');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportRows = useMemo(() => {
    const tenantEmps = employees.filter((e) => e.tenantId === currentTenant.id);
    const source = tenantEmps.length > 0 ? tenantEmps : employees.slice(0, 5);

    return source
      .map((emp) => ({
        code: emp.employeeCode,
        name: `${emp.firstName} ${emp.lastName}`,
        dept: emp.department,
        daysWorked: 22,
        gross: emp.salary.monthlyGross,
        deductions: emp.salary.deductions,
        net: emp.salary.netPay,
        statutory: `${countryConfig.statutoryDeductions[0]?.split(' ')[0] || 'Tax'}: ${formatCurrency(
          emp.salary.deductions
        )}`
      }))
      .filter((row) => selectedDept === 'ALL' || row.dept === selectedDept);
  }, [employees, currentTenant.id, selectedDept, countryConfig.statutoryDeductions, formatCurrency]);

  const totals = useMemo(() => {
    return reportRows.reduce(
      (acc, r) => ({
        days: acc.days + r.daysWorked,
        gross: acc.gross + r.gross,
        deductions: acc.deductions + r.deductions,
        net: acc.net + r.net
      }),
      { days: 0, gross: 0, deductions: 0, net: 0 }
    );
  }, [reportRows]);

  const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    setIsGenerating(true);
    const tplName = REPORT_TEMPLATES.find((t) => t.id === selectedTemplate)?.name || 'Report';
    const fileBase = `${currentTenant.slug}-${selectedTemplate}-${dateRangeStart}-to-${dateRangeEnd}`;

    if (format === 'CSV' || format === 'EXCEL') {
      downloadCSV(
        `${fileBase}.csv`,
        ['Employee Code', 'Name', 'Department', 'Payable Days', 'Gross', 'Deductions', 'Net', 'Statutory'],
        reportRows.map((r) => [
          r.code,
          r.name,
          r.dept,
          r.daysWorked,
          r.gross,
          r.deductions,
          r.net,
          r.statutory
        ])
      );
    } else {
      const htmlRows = reportRows
        .map(
          (r) =>
            `<tr><td>${r.code}</td><td>${r.name}</td><td>${r.dept}</td><td>${r.daysWorked}</td><td>${formatCurrency(
              r.gross
            )}</td><td>${formatCurrency(r.deductions)}</td><td>${formatCurrency(r.net)}</td></tr>`
        )
        .join('');
      downloadHtmlDocument(
        `${fileBase}.html`,
        `<!doctype html><html><body style="font-family:sans-serif;padding:24px"><h2>${currentTenant.name} — ${tplName}</h2><p>${dateRangeStart} to ${dateRangeEnd}</p><table border="1" cellspacing="0" cellpadding="8"><thead><tr><th>Code</th><th>Name</th><th>Dept</th><th>Days</th><th>Gross</th><th>Deductions</th><th>Net</th></tr></thead><tbody>${htmlRows}</tbody></table></body></html>`
      );
    }

    recordAuditEvent('REPORT_EXPORTED', 'Reports', `Exported ${format} ${tplName} (${dateRangeStart} to ${dateRangeEnd})`);
    setIsGenerating(false);
    showToast(`${format} Report Downloaded`, 'success', `${tplName} (${reportRows.length} rows)`);
  };

  const activeTemplate = REPORT_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">Portal &gt; Reports</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Reports & Statutory Compliance Center
          </h1>
          <p className="text-xs text-slate-500">
            Generate and export localized payroll, attendance muster, and tax audit files for {currentTenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExport('CSV')}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => handleExport('EXCEL')}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={() => handleExport('PDF')}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-bold rounded-full shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Generate PDF Report
          </button>
        </div>
      </div>

      {/* Template Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TEMPLATES.map((tpl) => {
          const isSelected = selectedTemplate === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id)}
              className={`p-5 rounded-[28px] border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#ff7a1a] ring-2 ring-[#ff7a1a] shadow-md'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-[#ff7a1a] text-[#111318]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tpl.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{tpl.frequency}</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 mt-1">{tpl.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-400">Jurisdiction: {countryConfig.name}</span>
                <ArrowUpRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ea580c]' : 'text-slate-300'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar with Modern Date Range Selector */}
      <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Modern Date Range Popover */}
          <div className="w-64">
            <ModernDatePickerPopover
              label="Reporting Cycle Period"
              value={dateRangeStart}
              rangeEnd={dateRangeEnd}
              isRangeMode={true}
              onRangeChange={(s, e) => {
                setDateRangeStart(s);
                setDateRangeEnd(e);
              }}
              placeholder="Select date range..."
              variant="purple"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Scope
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            >
              <option value="ALL">All Departments (Entire Company)</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Sales & Growth">Sales & Growth</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-end">
          <span className="text-xs text-slate-400 font-medium">Currency:</span>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
            {countryConfig.flag} {countryConfig.currency} ({countryConfig.currencySymbol})
          </span>
        </div>
      </div>

      {/* Live Table Preview */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {activeTemplate?.name} — Live Generated Preview
            </h3>
            <p className="text-xs text-slate-400">
              {currentTenant.name} • Period: {dateRangeStart} to {dateRangeEnd} • Statutory Schema: {countryConfig.name} 2026.11
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fff1e6] text-[#c2410c]">
            ✓ Compliant & Balanced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Employee ID & Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Payable Days</th>
                <th className="py-3.5 px-4">Gross Earnings</th>
                <th className="py-3.5 px-4">Statutory Deductions</th>
                <th className="py-3.5 px-4">Net Disbursement</th>
                <th className="py-3.5 px-5">Tax Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportRows.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-extrabold text-slate-900">{row.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">{row.code}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{row.dept}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{row.daysWorked} d</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(row.gross)}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">-{formatCurrency(row.deductions)}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                    {formatCurrency(row.net)}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">{row.statutory}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200">
              <tr>
                <td className="py-4 px-5 text-slate-900 uppercase tracking-wider">
                  Total Aggregated ({reportRows.length} Staff)
                </td>
                <td className="py-4 px-4 text-slate-500">—</td>
                <td className="py-4 px-4 text-slate-700">{totals.days} Days</td>
                <td className="py-4 px-4 text-slate-900">{formatCurrency(totals.gross)}</td>
                <td className="py-4 px-4 text-rose-600">-{formatCurrency(totals.deductions)}</td>
                <td className="py-4 px-4 text-slate-900 text-sm">{formatCurrency(totals.net)}</td>
                <td className="py-4 px-5 text-slate-400 text-[11px]">Direct Bank Batch Ready</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

