import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { LeaveRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import { ModernCalendar } from '../../components/common/ModernCalendar';
import { parseLocalDate, getTodayDateISO } from '../../utils/dateUtils';
import { Send, AlertCircle } from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLeave?: (lr: LeaveRequest) => void;
  initialDate?: string;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmitLeave,
  initialDate
}) => {
  const { currentUser } = useAuth();
  const { leaveBalances, applyLeave, leaveTypes } = useHrmsData();

  const defaultDate = initialDate || getTodayDateISO();
  const [leaveType, setLeaveType] = useState<'ANNUAL' | 'SICK' | 'CASUAL' | 'UNPAID'>('ANNUAL');
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState(defaultDate);
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sync dates whenever modal opens with a new initialDate
  useEffect(() => {
    if (isOpen) {
      const target = initialDate || getTodayDateISO();
      setStartDate(target);
      setEndDate(target);
      setDays(1);
      setValidationError('');
    }
  }, [isOpen, initialDate]);

  // Automatically calculate days when dates change using local calendar dates
  useEffect(() => {
    if (startDate && endDate) {
      const s = parseLocalDate(startDate);
      const e = parseLocalDate(endDate);
      const diffTime = e.getTime() - s.getTime();
      if (diffTime >= 0) {
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDays(diffDays);
        setValidationError('');
      } else {
        setDays(1);
      }
    }
  }, [startDate, endDate]);

  const getAvailableDays = (type: string) => {
    if (type === 'UNPAID') return Infinity;
    const found = leaveBalances.find((b) => b.type.toLowerCase().includes(type.toLowerCase()));
    return found ? found.available : 0;
  };

  const handleRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setValidationError('Please enter a reason for your leave application.');
      return;
    }

    const available = getAvailableDays(leaveType);
    if (leaveType !== 'UNPAID' && days > available) {
      setValidationError(
        `Insufficient ${leaveType.toLowerCase()} leave balance. Requested ${days} day(s), available: ${available} day(s).`
      );
      return;
    }

    const newRequest: LeaveRequest = {
      id: `lr-${Date.now().toString().slice(-4)}`,
      employeeId: currentUser.employeeId || 'emp-005',
      employeeName: currentUser.name,
      department: currentUser.department || 'Engineering',
      leaveType,
      startDate,
      endDate,
      days: Number(days),
      reason: reason.trim(),
      status: 'PENDING',
      appliedOn: getTodayDateISO()
    };

    if (onSubmitLeave) {
      onSubmitLeave(newRequest);
    } else {
      await applyLeave(newRequest);
    }
    setReason('');
    setValidationError('');
    onClose();
  };

  const annualAvail = getAvailableDays('ANNUAL');
  const sickAvail = getAvailableDays('SICK');
  const casualAvail = getAvailableDays('CASUAL');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      subtitle="Select leave range on calendar and submit for manager review"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => {
                setLeaveType(e.target.value as any);
                setValidationError('');
              }}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-medium text-slate-800"
            >
              {leaveTypes.map((lt) => {
                const typeKey = lt.code === 'PL' ? 'ANNUAL' : lt.code;
                const avail = getAvailableDays(typeKey);
                return (
                  <option key={lt.id} value={typeKey}>
                    {lt.name} ({lt.isPaid ? `${avail} days balance` : 'Unpaid LOP'})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <span className="text-[11px] font-bold text-indigo-900 block mb-1">
              Selected Leave Period:
            </span>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-800">
              <span>{startDate}</span>
              <span className="text-slate-400">→</span>
              <span>{endDate}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-sans text-[11px]">
                {days} {days === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p className="text-[10px] text-indigo-600 mt-1 font-medium">
              Click start date & end date on the calendar to adjust.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Days</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={days}
              onChange={(e) => setDays(parseFloat(e.target.value) || 1)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Provide reason for your reporting manager..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Submit Application
            </button>
          </div>
        </form>

        {/* Right: Embedded Interactive ModernCalendar */}
        <div className="border-t md:border-t-0 md:border-l border-slate-200/80 md:pl-6">
          <ModernCalendar
            title="Pick Leave Range"
            initialDate={startDate}
            isRangeMode={true}
            rangeStart={startDate}
            rangeEnd={endDate}
            onSelectRange={handleRangeChange}
            showEventsList={false}
            variant="purple"
          />
        </div>
      </div>
    </Modal>
  );
};
