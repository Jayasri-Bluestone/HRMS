import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { StatusBadge } from '../../components/common/Badge';
import {
  Clock,
  CalendarCheck,
  CalendarOff,
  History,
  AlertCircle,
  FileText,
  ShieldCheck,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface EmployeeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'attendance' | 'leaves' | 'missed_punch' | 'permissions';
}

export const EmployeeHistoryModal: React.FC<EmployeeHistoryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'attendance'
}) => {
  const { currentUser } = useAuth();
  const {
    personalAttendanceRecords,
    leaveRequests,
    missedPunchRequests,
    permissionRequests
  } = useHrmsData();

  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'missed_punch' | 'permissions'>(initialTab);

  const empId = currentUser.employeeId || 'emp-005';

  const myLeaves = leaveRequests.filter(
    (l) => l.employeeId === empId || l.employeeName === currentUser.name
  );
  const myMissedPunches = missedPunchRequests.filter(
    (m) => m.employeeId === empId || m.employeeName === currentUser.name
  );
  const myPermissions = permissionRequests.filter(
    (p) => p.employeeId === empId || p.employeeName === currentUser.name
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="My Attendance & Request History Hub"
      subtitle={`Verified activity, punch logs, leave records, and permissions for ${currentUser.name} (${empId})`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-full border border-slate-200/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#181a20] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            Punch Logs ({personalAttendanceRecords.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'leaves'
                ? 'bg-[#181a20] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CalendarOff className="w-3.5 h-3.5 text-purple-400" />
            Leaves ({myLeaves.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('missed_punch')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'missed_punch'
                ? 'bg-[#181a20] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Missed Punches ({myMissedPunches.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-[#181a20] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            Permissions ({myPermissions.length})
          </button>
        </div>

        {/* Tab 1: Attendance Punch Logs */}
        {activeTab === 'attendance' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="max-h-[380px] overflow-y-auto">
              {personalAttendanceRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No attendance punches recorded yet. Punch in from your dashboard to begin logging.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase sticky top-0 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Punch In</th>
                      <th className="px-4 py-3">Punch Out</th>
                      <th className="px-4 py-3">Total Work</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Location Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personalAttendanceRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.date}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{r.checkIn || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{r.checkOut || '—'}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{r.workHours ? `${r.workHours}h` : '0h'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-400 truncate max-w-xs">
                          {r.locationEvidence || 'Corporate Geofence'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Leaves History */}
        {activeTab === 'leaves' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="max-h-[380px] overflow-y-auto">
              {myLeaves.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No leave applications submitted yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myLeaves.map((l) => (
                    <div key={l.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{l.leaveType} Leave</span>
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {l.startDate} → {l.endDate} ({l.days} days)
                          </span>
                        </div>
                        <StatusBadge status={l.status} />
                      </div>
                      <p className="text-xs text-slate-600 mb-1">
                        <strong className="text-slate-700">Reason:</strong> {l.reason}
                      </p>
                      {l.managerComments && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                          Manager remark: "{l.managerComments}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Missed Punch History */}
        {activeTab === 'missed_punch' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="max-h-[380px] overflow-y-auto">
              {myMissedPunches.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No missed punch regularizations applied.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myMissedPunches.map((m) => (
                    <div key={m.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">{m.date}</span>
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {m.type === 'BOTH' ? 'Full Day Regularization' : `Missed ${m.type}`}
                          </span>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                      <div className="text-xs text-slate-600 space-y-0.5 mb-1.5">
                        {m.requestedCheckIn && <span>Requested In: <strong>{m.requestedCheckIn}</strong> </span>}
                        {m.requestedCheckOut && <span>• Requested Out: <strong>{m.requestedCheckOut}</strong></span>}
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong>Reason:</strong> {m.reason}
                      </p>
                      {m.managerComments && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1.5">
                          Manager: "{m.managerComments}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Permissions Passes */}
        {activeTab === 'permissions' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="max-h-[380px] overflow-y-auto">
              {myPermissions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No permission passes requested.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myPermissions.map((p) => (
                    <div key={p.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">{p.date}</span>
                          <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                            {p.durationHours} Hours ({p.startTime} - {p.endTime})
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            [{p.reasonCategory}]
                          </span>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong>Reason:</strong> {p.reason}
                      </p>
                      {p.managerComments && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1.5">
                          Manager: "{p.managerComments}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold bg-[#181a20] hover:bg-[#282b35] text-white transition-all cursor-pointer"
          >
            Close History
          </button>
        </div>
      </div>
    </Modal>
  );
};
