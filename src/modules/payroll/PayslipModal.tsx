import React from 'react';
import { Payslip } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '../../contexts/ToastContext';
import { downloadHtmlDocument } from '../../utils/exportUtils';
import { Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';

interface PayslipModalProps {
  payslip: Payslip | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, isOpen, onClose }) => {
  const { currentTenant, countryConfig, formatCurrency } = useTenant();
  const { showToast } = useToast();

  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStatement = () => {
    const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Payslip - ${payslip.employeeCode} - ${payslip.period}</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;padding:32px;color:#0f172a;max-width:760px;margin:auto}h1,h2{margin:0}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:13px}.net{background:#181a20;color:#fff;padding:16px;border-radius:12px;display:flex;justify-content:space-between;align-items:center}</style>
</head>
<body>
  <h1>${currentTenant.name}</h1>
  <p>Official Salary Certificate — ${payslip.period} (${countryConfig.name})</p>
  <hr/>
  <p><strong>Employee:</strong> ${payslip.employeeName} (${payslip.employeeCode}) • ${payslip.designation}, ${payslip.department}</p>
  <p><strong>Bank Account:</strong> ${payslip.bankName} (${payslip.accountNumberMasked}) • <strong>Pay Date:</strong> ${payslip.payDate}</p>
  <table>
    <tr><th>Earnings</th><th>Amount</th><th>Deductions</th><th>Amount</th></tr>
    <tr><td>Basic Salary</td><td>${formatCurrency(payslip.basicSalary)}</td><td>Income Tax</td><td>${formatCurrency(payslip.taxDeduction)}</td></tr>
    <tr><td>Housing Allowance</td><td>${formatCurrency(payslip.housingAllowance)}</td><td>Statutory / EPF</td><td>${formatCurrency(payslip.epfDeduction || 0)}</td></tr>
    <tr><td>Transport Allowance</td><td>${formatCurrency(payslip.transportAllowance)}</td><td>Other Deductions</td><td>${formatCurrency(payslip.otherDeductions)}</td></tr>
    <tr><td>Other Allowances</td><td>${formatCurrency(payslip.otherAllowances)}</td><td><strong>Total Deductions</strong></td><td><strong>${formatCurrency(payslip.totalDeductions)}</strong></td></tr>
    <tr><td><strong>Gross Earnings</strong></td><td><strong>${formatCurrency(payslip.grossSalary)}</strong></td><td>Status</td><td>${payslip.paymentStatus}</td></tr>
  </table>
  <div class="net"><div><strong>Net Take-Home Pay</strong></div><div style="font-size:20px;font-weight:700">${formatCurrency(payslip.netPay)}</div></div>
</body></html>`;
    downloadHtmlDocument(`payslip-${payslip.employeeCode}-${payslip.period.replace(/\s+/g, '-')}.html`, html);
    showToast(`Downloaded Payslip Statement`, 'success', `${payslip.employeeName} • ${payslip.period}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payslip - ${payslip.period}`}
      subtitle={`Official salary certificate for ${payslip.employeeName} (${payslip.employeeCode})`}
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digitally signed & immutable payroll record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={handleDownloadStatement}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#181a20] hover:bg-[#111318] rounded-lg transition-colors shadow-xs"
              style={{ backgroundColor: 'var(--color-primary-600)' }}
            >
              <Download className="w-3.5 h-3.5" /> Download Statement
            </button>
          </div>
        </div>
      }
    >
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-800 space-y-6 print:border-none print:p-0">
        {/* Company Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{currentTenant.name}</h2>
            <p className="text-xs text-slate-500">
              Corporate Headquarters • Tax Jurisdiction: {countryConfig.name} ({countryConfig.currency})
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Registration No: {currentTenant.code}-2026-TAX
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-200">
              PAYMENT DISBURSED
            </span>
            <p className="text-xs text-slate-500 mt-1">Pay Date: {payslip.payDate}</p>
          </div>
        </div>

        {/* Employee & Bank Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 text-xs border border-slate-100">
          <div>
            <span className="text-slate-400 text-[11px]">Employee Name:</span>
            <p className="font-bold text-slate-900 mt-0.5">{payslip.employeeName}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Employee ID:</span>
            <p className="font-bold font-mono text-slate-900 mt-0.5">{payslip.employeeCode}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Department / Role:</span>
            <p className="font-bold text-slate-900 mt-0.5">{payslip.designation}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Bank Account:</span>
            <p className="font-mono text-slate-900 mt-0.5">{payslip.accountNumberMasked}</p>
          </div>
        </div>

        {/* Earnings & Deductions Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Earnings Column */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100/80 px-4 py-2 font-bold text-slate-900 border-b border-slate-200 flex justify-between">
              <span>Earnings</span>
              <span>Amount ({payslip.currencySymbol})</span>
            </div>
            <div className="divide-y divide-slate-100 p-2">
              <div className="flex justify-between py-1.5 px-2">
                <span>Basic Salary</span>
                <span className="font-semibold">{formatCurrency(payslip.basicSalary)}</span>
              </div>
              <div className="flex justify-between py-1.5 px-2">
                <span>House Rent Allowance (HRA)</span>
                <span className="font-semibold">{formatCurrency(payslip.housingAllowance)}</span>
              </div>
              <div className="flex justify-between py-1.5 px-2">
                <span>Transport & Conveyance</span>
                <span className="font-semibold">{formatCurrency(payslip.transportAllowance)}</span>
              </div>
              <div className="flex justify-between py-1.5 px-2">
                <span>Special & Other Allowances</span>
                <span className="font-semibold">{formatCurrency(payslip.otherAllowances)}</span>
              </div>
            </div>
            <div className="bg-emerald-50/60 px-4 py-2 font-bold text-slate-900 border-t border-slate-200 flex justify-between">
              <span>Gross Earnings:</span>
              <span className="text-emerald-700">{formatCurrency(payslip.grossSalary)}</span>
            </div>
          </div>

          {/* Deductions Column */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100/80 px-4 py-2 font-bold text-slate-900 border-b border-slate-200 flex justify-between">
              <span>Statutory & Tax Deductions</span>
              <span>Amount ({payslip.currencySymbol})</span>
            </div>
            <div className="divide-y divide-slate-100 p-2">
              {payslip.countryCode === 'IN' ? (
                <>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Provident Fund (EPF 12%)</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(payslip.epfDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Tax Deducted at Source (TDS)</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(payslip.taxDeduction)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Professional Tax (PT)</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(payslip.otherDeductions)}</span>
                  </div>
                </>
              ) : payslip.countryCode === 'UK' ? (
                <>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>PAYE Income Tax</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(payslip.taxDeduction)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>National Insurance (Class 1)</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(payslip.otherDeductions)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>WPS Compliance Surcharge</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(payslip.otherDeductions)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Income Tax (0% UAE Juris)</span>
                    <span className="font-semibold text-slate-400">0.00</span>
                  </div>
                </>
              )}
            </div>
            <div className="bg-rose-50/60 px-4 py-2 font-bold text-slate-900 border-t border-slate-200 flex justify-between">
              <span>Total Deductions:</span>
              <span className="text-rose-700">-{formatCurrency(payslip.totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Net Pay Highlight Bar */}
        <div
          className="p-5 rounded-2xl bg-[#181a20] text-white flex items-center justify-between shadow-lg"
          style={{
            background: 'linear-gradient(135deg, var(--sidebar-bg, #181a20), var(--accent-gradient-start, #ea580c))'
          }}
        >
          <div>
            <span className="text-xs uppercase font-semibold text-indigo-200 tracking-wider">
              Net Disbursed Take-Home Pay
            </span>
            <div className="text-2xl font-bold mt-0.5">{formatCurrency(payslip.netPay)}</div>
          </div>
          <div className="text-right text-xs text-indigo-200">
            <span className="inline-flex items-center gap-1 font-semibold text-white">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Transfer Successful
            </span>
            <p className="text-[11px] mt-0.5">Disbursed to {payslip.bankName}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

