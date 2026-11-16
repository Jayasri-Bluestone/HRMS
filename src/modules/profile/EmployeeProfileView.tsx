import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { useToast } from '../../contexts/ToastContext';
import { downloadHtmlDocument } from '../../utils/exportUtils';
import { Payslip } from '../../types';
import {
  Building,
  Briefcase,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Download
} from 'lucide-react';

interface EmployeeProfileViewProps {
  onOpenPayslip?: (slip: Payslip) => void;
}

export const EmployeeProfileView: React.FC<EmployeeProfileViewProps> = () => {
  const { currentUser } = useAuth();
  const { currentTenant, countryConfig } = useTenant();
  const { employees, getPayslipForEmployee } = useHrmsData();
  const { showToast } = useToast();

  const empId = currentUser.employeeId || 'emp-005';
  const empProfile = employees.find((e) => e.id === empId || e.email === currentUser.email);
  const myPayslip = getPayslipForEmployee(empId);

  const handleDownloadDoc = (docName: string) => {
    downloadHtmlDocument(
      `${docName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`,
      `<!doctype html><html><body style="font-family:sans-serif;padding:32px"><h2>${docName}</h2><p><strong>Employee:</strong> ${currentUser.name} (${empProfile?.employeeCode || empId})</p><p><strong>Organization:</strong> ${currentTenant.name}</p><p>Verified digital vault copy.</p></body></html>`
    );
    showToast('Document Downloaded', 'success', docName);
  };

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-[32px] p-7 md:p-8 border border-slate-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#ff7a1a]/30 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-[10px] text-white font-bold" title="Active">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c] uppercase tracking-wider">
                Full-Time Employee
              </span>
              <span className="text-xs font-mono text-slate-400">
                Code: {empProfile?.employeeCode || currentUser.employeeId || 'BLU-005'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentUser.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.designation || empProfile?.designation || 'Software Engineer'} •{' '}
              {currentUser.department || empProfile?.department || 'Engineering'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            {currentTenant.name}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#181a20] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff7a1a]" />
            KYC Verified
          </span>
        </div>
      </div>

      {/* Grid: Employment Details & Financial Bank Account */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Personal & Employment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-7 rounded-[32px] border border-slate-100 shadow-soft">
            <h3 className="text-base font-extrabold text-slate-900 mb-5 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Employment & Organizational Hierarchy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Reporting Manager</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {empProfile?.managerName || 'Executive Leadership'}
                </p>
                <p className="text-[11px] text-slate-500">{empProfile?.department || currentUser.department || 'Engineering'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Work Location / Branch</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {currentTenant.name} ({countryConfig.name})
                </p>
                <p className="text-[11px] text-slate-500">Timezone: {currentTenant.timezone}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Joining Date</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {empProfile?.joiningDate || '2024-02-10'}
                </p>
                <p className="text-[11px] text-slate-500">Status: {empProfile?.status || 'ACTIVE'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Shift Assignment</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">General Shift</p>
                <p className="text-[11px] text-slate-500">09:00 AM – 06:00 PM (1h Break)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Corporate Email</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{currentUser.email}</p>
                <p className="text-[11px] text-emerald-600 font-medium">SSO & MFA Enabled</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Primary Contact Phone</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {empProfile?.phone || '+91 98200 99999'}
                </p>
                <p className="text-[11px] text-slate-500">Emergency Contact verified</p>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white p-6 md:p-7 rounded-[32px] border border-slate-100 shadow-soft">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Verified Employee Documents
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Full-Time Employment Offer & Contract', type: 'PDF • Signed', size: '1.2 MB', date: 'Feb 2024' },
                { name: 'University Degree & Transcripts', type: 'PDF • Verified', size: '2.8 MB', date: 'Feb 2024' },
                { name: 'Government ID (Aadhaar & PAN / National ID)', type: 'Encrypted Vault', size: '850 KB', date: 'Feb 2024' },
                { name: '2026-27 Income Tax Declaration Form 12BB', type: 'PDF • Active', size: '320 KB', date: 'Apr 2026' }
              ].map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">{doc.type} • {doc.size} • {doc.date}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Download ${doc.name}`}
                    onClick={() => handleDownloadDoc(doc.name)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Bank & Statutory Tax Details */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-soft">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Direct Deposit Bank Account
            </h3>

            <div className="bg-[#181a20] text-white p-5 rounded-2xl mb-4 relative overflow-hidden shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] text-[#ff7a1a] font-bold uppercase tracking-wider">Salary Account</span>
                  <p className="text-base font-extrabold mt-0.5">{myPayslip.bankName}</p>
                </div>
                <Building className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-mono tracking-widest text-slate-300">
                {myPayslip.accountNumberMasked}
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-4 pt-3 border-t border-white/10">
                <span>IFSC: HDFC0001244</span>
                <span className="text-[#ff7a1a] font-bold">ACTIVE</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Account Holder:</span>
                <span className="font-bold text-slate-800">{currentUser.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Tax Jurisdiction:</span>
                <span className="font-bold text-slate-800">{countryConfig.name} ({countryConfig.currency})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Income Tax Regime:</span>
                <span className="font-bold text-indigo-600">New Tax Regime (Section 115BAC)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">EPF UAN Number:</span>
                <span className="font-mono font-bold text-slate-800">101298449102</span>
              </div>
            </div>
          </div>

          <div className="bg-[#fff1e6]/40 border border-[#ff7a1a]/40 p-5 rounded-[28px] text-xs">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#c2410c]" />
              <span className="font-bold text-[#181a20]">Need to update personal details?</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Bank account or PAN card changes require validation by the HR Admin ({countryConfig.name} compliance).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

