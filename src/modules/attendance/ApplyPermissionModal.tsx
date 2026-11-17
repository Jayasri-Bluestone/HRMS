import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { getTodayDateISO } from '../../utils/dateUtils';
import { Clock, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ApplyPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const ApplyPermissionModal: React.FC<ApplyPermissionModalProps> = ({
  isOpen,
  onClose,
  initialDate
}) => {
  const { applyPermission } = useHrmsData();

  const [date, setDate] = useState(initialDate || getTodayDateISO());
  const [startTime, setStartTime] = useState('03:30 PM');
  const [endTime, setEndTime] = useState('05:30 PM');
  const [durationHours, setDurationHours] = useState(2.0);
  const [reasonCategory, setReasonCategory] = useState<'PERSONAL' | 'MEDICAL' | 'OFFICIAL' | 'EMERGENCY'>('PERSONAL');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await applyPermission({
        date,
        startTime,
        endTime,
        durationHours: Number(durationHours),
        reasonCategory,
        reason: reason.trim()
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
      title="Apply Permission Pass (Short Leave)"
      subtitle="Request 1–2 hours official time-off window during standard work shift"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-sky-50 border border-sky-200/90 rounded-2xl p-3.5 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-sky-800 font-medium">
            Permission passes allow up to 2 hours of approved personal or official absence without deducting from your full-day or half-day leave quotas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Permission Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Duration Window *</label>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(parseFloat(e.target.value))}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-semibold"
            >
              <option value={1.0}>1.0 Hour Pass</option>
              <option value={1.5}>1.5 Hours Pass</option>
              <option value={2.0}>2.0 Hours Pass (Standard)</option>
              <option value={2.5}>2.5 Hours Pass (Extended)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">From Time *</label>
            <input
              type="text"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="e.g. 03:00 PM"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">To Time *</label>
            <input
              type="text"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="e.g. 05:00 PM"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Reason Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'PERSONAL', label: 'Personal Work', emoji: '🏠' },
              { id: 'MEDICAL', label: 'Doctor / Clinic', emoji: '🩺' },
              { id: 'OFFICIAL', label: 'Client / Bank', emoji: '🏦' },
              { id: 'EMERGENCY', label: 'Family Urgent', emoji: '🚨' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setReasonCategory(cat.id as any)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                  reasonCategory === cat.id
                    ? 'border-[#ff7a1a] bg-[#fff8f3] text-[#c2410c] shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Reason / Details *</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Need to visit bank branch for mortgage paperwork submission, will be reachable on phone..."
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
            className="px-5 py-2.5 bg-[#181a20] hover:bg-[#282b35] text-white text-xs font-extrabold rounded-full shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#ff7a1a]" />
            {isSubmitting ? 'Submitting...' : 'Apply Permission Pass'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
