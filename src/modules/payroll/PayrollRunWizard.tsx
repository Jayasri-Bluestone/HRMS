import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useTenant } from '../../contexts/TenantContext';
import { PayrollRun } from '../../types';
import {
  Check,
  Play,
  Lock,
  AlertCircle,
  FileSpreadsheet,
  Building,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PayrollRunWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteRun: (run: PayrollRun) => void;
}

export const PayrollRunWizard: React.FC<PayrollRunWizardProps> = ({
  isOpen,
  onClose,
  onCompleteRun
}) => {
  const { currentTenant, countryConfig, formatCurrency } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Default calculation preview for active tenant
  const employeeCount = currentTenant.employeeCount;
  const avgGross = currentTenant.countryId === 'IN' ? 101428 : currentTenant.countryId === 'AE' ? 14000 : 5200;
  const totalGross = Math.round(employeeCount * avgGross);
  const totalDeductions = Math.round(totalGross * (currentTenant.countryId === 'IN' ? 0.125 : currentTenant.countryId === 'AE' ? 0.02 : 0.26));
  const totalNet = totalGross - totalDeductions;

  const handleCalculate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(3);
    }, 1200);
  };

  const handleFinalizeLock = () => {
    const newRun: PayrollRun = {
      id: `pr-${Date.now().toString().slice(-4)}`,
      tenantId: currentTenant.id,
      period: 'November 2026',
      year: 2026,
      month: 11,
      status: 'LOCKED',
      countryCode: currentTenant.countryId,
      currency: currentTenant.currency,
      currencySymbol: currentTenant.currencySymbol,
      totalEmployees: employeeCount,
      totalGross,
      totalDeductions,
      totalNet,
      runDate: new Date().toISOString().split('T')[0],
      approvedBy: 'Priya Nair (HR Head)'
    };

    onCompleteRun(newRun);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Monthly Payroll Execution Wizard"
      subtitle={`Processing cycle for ${currentTenant.name} (${countryConfig.name} Node)`}
      maxWidth="3xl"
    >
      {/* Wizard Step Tracker */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[
          { step: 1, title: 'Scope & Period' },
          { step: 2, title: 'Country Rules' },
          { step: 3, title: 'Exceptions Review' },
          { step: 4, title: 'Lock & Payout' }
        ].map((item, idx) => (
          <div key={item.step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep >= item.step
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > item.step ? <Check className="w-4 h-4" /> : item.step}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 mt-1">{item.title}</span>
            </div>
            {idx < 3 && (
              <div
                className={`w-14 sm:w-20 h-0.5 mx-2 ${
                  currentStep > item.step ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Period & Attendance Finalization */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Payroll Cycle Period:</span>
              <span className="font-bold text-slate-800 text-sm">November 2026</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Eligible Workforce:</span>
              <span className="font-bold text-slate-800">{employeeCount} Employees</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Attendance Records Status:</span>
              <span className="font-semibold text-emerald-600">Finalized & Locked</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Approved LOP Leaves:</span>
              <span className="font-semibold text-slate-800">2 Requests deducted automatically</span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Continue to Country Engine <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Country Payroll Rules Verification */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
            <h4 className="font-bold text-indigo-950 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Country Rules Engine Active: {countryConfig.name} ({countryConfig.currency})
            </h4>
            <p className="text-indigo-800 mb-3">
              The engine will apply statutory formulas verified for tax year starting {countryConfig.taxYearStart}:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-indigo-900 font-medium">
              {countryConfig.statutoryDeductions.map((ded, i) => (
                <li key={i}>{ded}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={handleCalculate}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>Calculating {employeeCount} records...</>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Calculate Payroll Engine
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Calculation Preview & Exception Audit */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Total Gross Earnings</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(totalGross)}</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <span className="text-[11px] text-rose-600 font-medium">Total Deductions</span>
              <p className="text-base font-bold text-rose-700 mt-0.5">-{formatCurrency(totalDeductions)}</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-[11px] text-emerald-600 font-medium">Net Payout Take-Home</span>
              <p className="text-base font-bold text-emerald-800 mt-0.5">{formatCurrency(totalNet)}</p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Exception Check Complete:</span> 0 unverified attendance anomalies found. All tax and PF calculations match rule version 2026.11.
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Proceed to Approval <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Finalize, Lock & Issue */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900 text-white rounded-xl text-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Lock className="w-4 h-4" />
              <span>Immutable Payroll Lock Confirmation</span>
            </div>
            <p className="text-slate-300">
              Upon locking this run for <span className="font-bold text-white">November 2026</span>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Individual PDF payslips will become instantly downloadable in the Employee Portal.</li>
              <li>Calculations will be permanently snapshot so future tax revisions never alter past records.</li>
              <li>Audit entry will record your authorization.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={handleFinalizeLock}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Lock className="w-4 h-4" /> Approve, Lock & Disburse
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

