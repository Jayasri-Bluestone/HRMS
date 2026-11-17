import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { getTodayDateISO } from '../../utils/dateUtils';
import { Clock, Send, AlertTriangle } from 'lucide-react';

interface ApplyMissedPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const ApplyMissedPunchModal: React.FC<ApplyMissedPunchModalProps> = ({
  isOpen,
  onClose,
  initialDate
}) => {
  const { applyMissedPunch } = useHrmsData();

  const [date, setDate] = useState(initialDate || getTodayDateISO());
  const [type, setType] = useState<'CHECK_IN' | 'CHECK_OUT' | 'BOTH'>('CHECK_OUT');
  const [requestedCheckIn, setRequestedCheckIn] = useState('09:00 AM');
  const [requestedCheckOut, setRequestedCheckOut] = useState('06:00 PM');
  const [reason, setReason] = useState('Biometric machine offline during shift punch');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await applyMissedPunch({
        date,
        type,
        requestedCheckIn: type === 'CHECK_OUT' ? undefined : requestedCheckIn,
        requestedCheckOut: type === 'CHECK_IN' ? undefined : requestedCheckOut,
        reason: reason.trim(),
        remarks: remarks.trim() || undefined
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply Missed Punch Regularization"
      subtitle="Submit attendance regularization for unrecorded punches to prevent loss of pay (LOP)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 font-medium">
            Regularizations are submitted directly to your squad manager for verification. Once approved, your daily attendance status will update to <strong>PRESENT</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Missed Punch Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Missed Punch Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white"
            >
              <option value="CHECK_OUT">Missed Check-Out Only</option>
              <option value="CHECK_IN">Missed Check-In Only</option>
              <option value="BOTH">Both Check-In & Check-Out (Full Day)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(type === 'CHECK_IN' || type === 'BOTH') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Check-In Time *</label>
              <input
                type="text"
                required
                value={requestedCheckIn}
                onChange={(e) => setRequestedCheckIn(e.target.value)}
                placeholder="e.g. 09:05 AM"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
          )}

          {(type === 'CHECK_OUT' || type === 'BOTH') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Check-Out Time *</label>
              <input
                type="text"
                required
                value={requestedCheckOut}
                onChange={(e) => setRequestedCheckOut(e.target.value)}
                placeholder="e.g. 06:15 PM"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Missed Punch *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white mb-2"
          >
            <option value="Biometric machine offline during shift punch">Biometric scanner error / offline</option>
            <option value="Onsite client meeting during entry/exit">Onsite client meeting / off-premises</option>
            <option value="Forgot to punch out due to extended sprint work">Forgot to punch out due to extended work</option>
            <option value="Network / GPS geofence connectivity glitch">GPS geofence / Network glitch</option>
            <option value="Other">Other Reason (Specify below)</option>
          </select>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add detailed explanation or reference ticket (optional)..."
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] text-xs font-extrabold rounded-full shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? 'Submitting...' : 'Submit Regularization'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
