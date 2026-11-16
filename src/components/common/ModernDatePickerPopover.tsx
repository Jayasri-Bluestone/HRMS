import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { ModernCalendar } from './ModernCalendar';
import { formatDisplayDate, getTodayDateISO } from '../../utils/dateUtils';

export interface ModernDatePickerPopoverProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange?: (dateStr: string) => void;
  // Range selection mode
  isRangeMode?: boolean;
  rangeEnd?: string;
  onRangeChange?: (start: string, end: string) => void;
  placeholder?: string;
  variant?: 'purple' | 'orange' | 'mint' | 'teal';
  className?: string;
}

export const ModernDatePickerPopover: React.FC<ModernDatePickerPopoverProps> = ({
  label,
  value,
  onChange,
  isRangeMode = false,
  rangeEnd,
  onRangeChange,
  placeholder = 'Select date...',
  variant = 'purple',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplay = (dStr: string) => {
    return formatDisplayDate(dStr);
  };

  const displayText = isRangeMode
    ? value && rangeEnd
      ? `${formatDisplay(value)} – ${formatDisplay(rangeEnd)}`
      : value
      ? `${formatDisplay(value)} (Select End)`
      : placeholder
    : value
    ? formatDisplay(value)
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-white text-xs font-medium transition-all ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarIcon className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className={!value ? 'text-slate-400' : 'text-slate-900 font-semibold'}>
            {displayText}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Popover Dropdown matching uploaded image */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 w-[320px] sm:w-[350px] shadow-2xl rounded-[28px] overflow-hidden border border-slate-200/90 bg-white animate-fadeIn">
          <ModernCalendar
            title={isRangeMode ? 'Select Date Range' : 'Select Date'}
            initialDate={value || getTodayDateISO()}
            selectedDate={value}
            onSelectDate={(newDate) => {
              if (onChange) onChange(newDate);
              if (!isRangeMode) {
                setIsOpen(false);
              }
            }}
            isRangeMode={isRangeMode}
            rangeStart={value}
            rangeEnd={rangeEnd}
            onSelectRange={(start, end) => {
              if (onChange) onChange(start);
              if (onRangeChange) {
                onRangeChange(start, end);
              }
              if (start && end && start !== end) {
                // Auto close once range selected
                setTimeout(() => setIsOpen(false), 250);
              }
            }}
            showEventsList={false}
            variant={variant}
          />

          <div className="bg-slate-50 p-2.5 px-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-medium truncate">
              {isRangeMode ? 'Click start date, then end date' : 'Click any date to pick'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
