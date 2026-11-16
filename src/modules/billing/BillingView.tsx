import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '../../mockData/subscriptions';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { useToast } from '../../contexts/ToastContext';
import { downloadHtmlDocument } from '../../utils/exportUtils';
import {
  Check,
  Download,
  Building2
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const { currentRole } = useAuth();
  const { currentTenant, allTenants, switchTenant, updateTenantLimit } = useTenant();
  const { recordAuditEvent } = useHrmsData();
  const { showToast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const usagePercent =
    currentTenant.employeeLimit > 0
      ? Math.round((currentTenant.employeeCount / currentTenant.employeeLimit) * 100)
      : 0;

  const handleUpgradePlan = (planName: string, limit: number) => {
    updateTenantLimit(currentTenant.id, limit, planName);
    recordAuditEvent('PLAN_UPDATED', 'Billing', `Updated ${currentTenant.name} subscription to ${planName} (${limit} seats)`);
    showToast(`Subscription Updated to ${planName}`, 'success', `${currentTenant.name} • Seat limit: ${limit}`);
  };

  const handleDownloadInvoice = (invoiceNo: string, date: string, amount: string) => {
    const html = `<!doctype html><html><body style="font-family:sans-serif;padding:32px"><h2>Tax Invoice ${invoiceNo}</h2><p><strong>Tenant:</strong> ${currentTenant.name} (${currentTenant.code})</p><p><strong>Date:</strong> ${date}</p><p><strong>Plan:</strong> ${currentTenant.planName}</p><p><strong>Total Paid:</strong> ${amount}</p></body></html>`;
    downloadHtmlDocument(`${invoiceNo}.html`, html);
    showToast(`Downloaded ${invoiceNo}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-7 rounded-[32px] border border-slate-100 shadow-soft">
        <div>
          <p className="text-xs text-slate-400 font-medium">Portal &gt; Billing</p>
          <div className="flex items-center gap-2 my-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c] border border-[#ffd4b0]">
              SaaS Commercial Subscription
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Plan & Workspace Capacity</h1>
          <p className="text-xs text-slate-500">
            Manage your corporate subscription tier, user limits, and automated billing invoices.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#f4f6f8] p-1.5 rounded-full border border-slate-200">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
              billingCycle === 'YEARLY'
                ? 'bg-[#ff7a1a] text-[#111318] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Yearly <span className="text-[10px] text-[#7c2d12] font-bold ml-1">(2 Mos Free)</span>
          </button>
        </div>
      </div>

      {/* Super Admin Tenant Selector Banner */}
      {isSuperAdmin && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-8 h-8 rounded-xl bg-[#181a20] text-[#ff7a1a] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Super Admin Billing Scope</p>
              <p className="text-[11px] text-slate-500">
                Select any commercial tenant below to inspect or modify its subscription tier & seat quota.
              </p>
            </div>
          </div>
          <select
            aria-label="Select tenant to manage subscription"
            value={currentTenant.id}
            onChange={(e) => switchTenant(e.target.value)}
            className="text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
          >
            {allTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.countryId}) — {t.planName} [{t.status}]
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current Capacity Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs text-indigo-300 uppercase font-semibold tracking-wider">
            Current Active Subscription
          </span>
          <h3 className="text-2xl font-bold text-white mt-1">
            {currentTenant.planName}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Tenant: {currentTenant.name} ({currentTenant.code}) • Next renewal on 01 Dec 2026
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 w-full md:w-80">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-200">Workforce Quota:</span>
            <span className="font-bold text-white">
              {currentTenant.employeeCount} / {currentTenant.employeeLimit}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-1.5">
            <div
              className={`h-2 rounded-full ${usagePercent > 85 ? 'bg-amber-400' : 'bg-[#ff7a1a]'}`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-300">
            {currentTenant.employeeLimit - currentTenant.employeeCount} employee seats available
          </p>
        </div>
      </div>

      {/* Subscription Plans Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = currentTenant.planName.toLowerCase().includes(plan.name.split(' ')[0].toLowerCase());
          const price = billingCycle === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                plan.popular
                  ? 'border-indigo-500 bg-white shadow-md ring-1 ring-indigo-500/30'
                  : 'border-slate-200 bg-white shadow-2xs'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-900 text-base">{plan.name}</h4>
                  {plan.popular && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      MOST POPULAR
                    </span>
                  )}
                </div>

                <div className="my-4">
                  <span className="text-3xl font-extrabold text-slate-900">${price}</span>
                  <span className="text-xs text-slate-500 ml-1">
                    /{billingCycle === 'MONTHLY' ? 'month' : 'year'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-700 mb-3">
                  Allows up to <span className="text-indigo-600 font-bold">{plan.employeeLimit} employees</span>
                </p>

                <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleUpgradePlan(plan.name, plan.employeeLimit)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isCurrent ? 'Active Plan' : `Switch to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Billing History & Invoices</h3>
          <span className="text-xs text-slate-400">Automated Stripe / Razorpay Webhook</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Invoice #</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4">Plan & Seats</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-5 font-mono font-bold text-slate-900">INV-2026-0041</td>
                <td className="py-3 px-4 text-slate-600">01 Nov 2026</td>
                <td className="py-3 px-4 text-slate-800 font-medium">Growth Tier (150 Seats)</td>
                <td className="py-3 px-4 font-bold text-slate-900">$129.00 USD</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold border border-emerald-200">
                    PAID
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    aria-label="Download invoice INV-2026-0041"
                    onClick={() => handleDownloadInvoice('INV-2026-0041', '01 Nov 2026', '$129.00 USD')}
                    className="p-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-5 font-mono font-bold text-slate-900">INV-2026-0038</td>
                <td className="py-3 px-4 text-slate-600">01 Oct 2026</td>
                <td className="py-3 px-4 text-slate-800 font-medium">Growth Tier (150 Seats)</td>
                <td className="py-3 px-4 font-bold text-slate-900">$129.00 USD</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold border border-emerald-200">
                    PAID
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    aria-label="Download invoice INV-2026-0038"
                    onClick={() => handleDownloadInvoice('INV-2026-0038', '01 Oct 2026', '$129.00 USD')}
                    className="p-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

