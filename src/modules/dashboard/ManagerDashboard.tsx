import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { Users, CalendarCheck, CalendarOff, Check, X, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    leaveRequests: leaves,
    reviewLeave,
    attendanceRecords,
    missedPunchRequests,
    reviewMissedPunch,
    permissionRequests,
    reviewPermission
  } = useHrmsData();

  const handleApprove = (id: string) => {
    reviewLeave(id, 'APPROVED', 'Approved by Reporting Manager');
  };

  const handleReject = (id: string) => {
    reviewLeave(id, 'REJECTED', 'Declined due to sprint schedule');
  };

  const teamPending = leaves.filter((l) => l.status === 'PENDING');
  const pendingMissedPunches = missedPunchRequests.filter((m) => m.status === 'PENDING');
  const pendingPermissions = permissionRequests.filter((p) => p.status === 'PENDING');

  return (
    <div className="space-y-6">
      <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">Portal &gt; Team Dashboard</p>
          <div className="flex items-center gap-2 my-1">
            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-[#fff1e6] text-[#c2410c] border border-[#ffd4b0]">
              Manager Squad Workspace
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Hello, {currentUser.name}</h1>
          <p className="text-xs text-slate-500">
            Manage your engineering team members, shift exceptions, and pending leave applications.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full font-medium">
          Hierarchy Scope: <span className="font-bold text-slate-900">Direct Reports Only</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Direct Reports"
          value="4"
          change="Engineering Squad"
          isPositive={true}
          subtitle="Mobile & Web Engineers"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Team Present Today"
          value="3 / 4"
          change="75%"
          isPositive={true}
          subtitle="1 employee on approved sick leave"
          icon={CalendarCheck}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Team Leaves Awaiting Review"
          value={teamPending.length}
          change={teamPending.length > 0 ? 'Action needed' : 'All clear'}
          isPositive={teamPending.length === 0}
          subtitle="Pending requests from your squad"
          icon={CalendarOff}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Missed Punches & Permissions"
          value={pendingMissedPunches.length + pendingPermissions.length}
          change={pendingMissedPunches.length + pendingPermissions.length > 0 ? 'Review needed' : 'All clear'}
          isPositive={pendingMissedPunches.length + pendingPermissions.length === 0}
          subtitle="Pending squad regularizations"
          icon={ShieldCheck}
          iconBgColor="bg-sky-50"
          iconColor="text-sky-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Leave Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Direct Reports Leave Requests</h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
              {teamPending.length} Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {leaves.map((lr) => (
              <div key={lr.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{lr.employeeName}</span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">
                      {lr.startDate} - {lr.endDate} ({lr.days} d)
                    </span>
                  </div>
                  <StatusBadge status={lr.status} />
                </div>
                <p className="text-xs text-slate-600 italic">"{lr.reason}"</p>

                {lr.status === 'PENDING' && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(lr.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(lr.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Team Missed Punch Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Missed Punch Regularizations</h3>
              <p className="text-[11px] text-slate-400">Review check-in/out regularizations from squad</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
              {pendingMissedPunches.length} Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {missedPunchRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">No missed punch requests</div>
            ) : (
              missedPunchRequests.map((m) => (
                <div key={m.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{m.employeeName}</span>
                      <span className="text-xs text-slate-400 ml-2 font-mono">Date: {m.date} ({m.type})</span>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    {m.requestedCheckIn && <span>In: <strong>{m.requestedCheckIn}</strong> </span>}
                    {m.requestedCheckOut && <span>• Out: <strong>{m.requestedCheckOut}</strong></span>}
                  </div>
                  <p className="text-xs text-slate-600 italic">"{m.reason}"</p>

                  {m.status === 'PENDING' && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => reviewMissedPunch(m.id, 'APPROVED')}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Regularization
                      </button>
                      <button
                        onClick={() => reviewMissedPunch(m.id, 'REJECTED')}
                        className="flex items-center gap-1 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Permission Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Permission Passes (Short Leave)</h3>
              <p className="text-[11px] text-slate-400">1–2 hour personal / medical work approvals</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-sky-50 text-sky-700 rounded">
              {pendingPermissions.length} Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {permissionRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">No permission requests</div>
            ) : (
              permissionRequests.map((p) => (
                <div key={p.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{p.employeeName}</span>
                      <span className="text-xs text-slate-400 ml-2 font-mono">
                        {p.date} • {p.durationHours}h ({p.startTime} - {p.endTime})
                      </span>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-slate-600 italic">[{p.reasonCategory}] "{p.reason}"</p>

                  {p.status === 'PENDING' && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => reviewPermission(p.id, 'APPROVED')}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Pass
                      </button>
                      <button
                        onClick={() => reviewPermission(p.id, 'REJECTED')}
                        className="flex items-center gap-1 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Attendance Live Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Today's Team Punch In/Out</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Synchronized
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {attendanceRecords.slice(0, 4).map((att) => (
              <div key={att.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-900">{att.employeeName}</p>
                  <p className="text-[11px] text-slate-400">
                    In: {att.checkIn || 'None'} • Out: {att.checkOut || 'In progress'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{att.locationEvidence}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={att.status} />
                  {att.isException && (
                    <span className="block text-[10px] text-amber-600 font-semibold mt-1">
                      Exception
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

