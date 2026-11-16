import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { Search, Lock, Building2 } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { currentRole } = useAuth();
  const { currentTenant, allTenants } = useTenant();
  const { auditLogs: logs } = useHrmsData();
  const [query, setQuery] = useState('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('ALL');

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  const scopedLogs = isSuperAdmin
    ? selectedTenantFilter === 'ALL'
      ? logs
      : logs.filter((l) => l.tenantId === selectedTenantFilter)
    : logs.filter((l) => l.tenantId === currentTenant.id);

  const filteredLogs = scopedLogs.filter(
    (l) =>
      l.userName.toLowerCase().includes(query.toLowerCase()) ||
      l.details.toLowerCase().includes(query.toLowerCase()) ||
      l.action.toLowerCase().includes(query.toLowerCase()) ||
      l.module.toLowerCase().includes(query.toLowerCase())
  );

  const getTenantLabel = (tenantId: string) => {
    return allTenants.find((t) => t.id === tenantId)?.code || tenantId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">Portal &gt; Audit</p>
          <div className="flex items-center gap-2 my-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" /> Tamper-Evident Ledger
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Trail & Security Logs</h1>
          <p className="text-xs text-slate-500">
            {isSuperAdmin
              ? 'Platform-wide immutable tracking of tenant provisioning, plan changes, payroll locks, and access events.'
              : 'Immutable tracking of salary modifications, payroll locks, tenant alterations, and access events.'}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail by user, event, or IP..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-slate-50/50"
            />
          </div>

          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Filter audit logs by tenant"
                value={selectedTenantFilter}
                onChange={(e) => setSelectedTenantFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-full border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              >
                <option value="ALL">All Platform Tenants</option>
                {allTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredLogs.length} audit entries captured
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Timestamp (UTC)</th>
                {isSuperAdmin && <th className="py-3.5 px-4">Tenant</th>}
                <th className="py-3.5 px-4">Authorized User</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Audit Details & Snapshot</th>
                <th className="py-3.5 px-4 text-right">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  {isSuperAdmin && (
                    <td className="py-3.5 px-4 text-slate-600 font-semibold whitespace-nowrap">
                      {getTenantLabel(log.tenantId)}
                    </td>
                  )}
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-700 max-w-md">
                    {log.details}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
