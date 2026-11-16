import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar as CalendarIcon
} from 'lucide-react';
import { parseLocalDate, formatLocalDateISO, getTodayDateISO } from '../../utils/dateUtils';

export interface CalendarEventItem {
  id: string;
  time: string;
  category: string;
  title: string;
  type?: 'task' | 'punch' | 'leave' | 'holiday' | 'meeting';
  status?: string;
}

export interface ModernCalendarProps {
  title?: string;
  initialDate?: string; // YYYY-MM-DD
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
  // Range selection support
  isRangeMode?: boolean;
  rangeStart?: string;
  rangeEnd?: string;
  onSelectRange?: (start: string, end: string) => void;
  // Custom events / schedules mapping by date YYYY-MM-DD
  eventsMap?: Record<string, CalendarEventItem[]>;
  onApplyLeave?: (dateStr: string) => void;
  onMissedPunch?: (dateStr: string) => void;
  showEventsList?: boolean;
  variant?: 'purple' | 'orange' | 'mint' | 'teal';
  className?: string;
}

const DEFAULT_EVENTS: Record<string, CalendarEventItem[]> = {
  '2026-11-04': [
    {
      id: 'e-1',
      time: '09:12',
      category: 'Attendance Alert',
      title: 'Missed Punch-Out (No checkout logged)',
      type: 'punch',
      status: 'MISSED_PUNCH'
    }
  ],
  '2026-11-09': [
    {
      id: 'e-2',
      time: '09:30',
      category: 'UI/UX Designer',
      title: 'Practical Task Review & Sprint Planning',
      type: 'task'
    },
    {
      id: 'e-3',
      time: '14:00',
      category: 'Design Squad',
      title: 'Design System Figma Component Review',
      type: 'meeting'
    }
  ],
  '2026-11-11': [
    {
      id: 'e-4',
      time: '09:15',
      category: 'Shift Check-in',
      title: 'Pune Tech Center (GPS Verified)',
      type: 'punch'
    },
    {
      id: 'e-5',
      time: '11:00',
      category: 'Engineering Sync',
      title: 'Mobile App React Native Release QA',
      type: 'task'
    }
  ],
  '2026-11-12': [
    {
      id: 'e-6',
      time: 'All Day',
      category: 'Approved Leave',
      title: 'Sick Leave • Prescribed Medical Rest',
      type: 'leave'
    }
  ],
  '2026-11-24': [
    {
      id: 'e-7',
      time: 'Holiday',
      category: 'Gazetted Holiday',
      title: 'Guru Nanak Jayanti',
      type: 'holiday'
    }
  ]
};

export const ModernCalendar: React.FC<ModernCalendarProps> = ({
  title = 'My Schedule',
  initialDate = getTodayDateISO(),
  selectedDate: controlledSelectedDate,
  onSelectDate,
  isRangeMode = false,
  rangeStart: controlledRangeStart,
  rangeEnd: controlledRangeEnd,
  onSelectRange,
  eventsMap = DEFAULT_EVENTS,
  onApplyLeave,
  onMissedPunch,
  showEventsList = true,
  variant = 'purple',
  className = ''
}) => {
  // Parse initial year and month safely in local time
  const init = parseLocalDate(initialDate || getTodayDateISO());
  const [currentYear, setCurrentYear] = useState(init.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState(isNaN(init.getMonth()) ? 10 : init.getMonth());
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Internal selection state if not controlled
  const [internalDate, setInternalDate] = useState<string>(initialDate || getTodayDateISO());
  const [internalRangeStart, setInternalRangeStart] = useState<string | null>(controlledRangeStart || null);
  const [internalRangeEnd, setInternalRangeEnd] = useState<string | null>(controlledRangeEnd || null);

  useEffect(() => {
    if (initialDate) {
      const d = parseLocalDate(initialDate);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [initialDate]);

  const activeSelectedDate = controlledSelectedDate !== undefined ? controlledSelectedDate : internalDate;
  const activeRangeStart = controlledRangeStart !== undefined ? controlledRangeStart : internalRangeStart;
  const activeRangeEnd = controlledRangeEnd !== undefined ? controlledRangeEnd : internalRangeEnd;

  // Month navigation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  // Handle day click
  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;

    if (isRangeMode) {
      if (!activeRangeStart || (activeRangeStart && activeRangeEnd)) {
        // Start new range
        setInternalRangeStart(dateStr);
        setInternalRangeEnd(null);
        if (onSelectRange) onSelectRange(dateStr, dateStr);
      } else {
        // Complete range
        if (parseLocalDate(dateStr) < parseLocalDate(activeRangeStart)) {
          setInternalRangeStart(dateStr);
          setInternalRangeEnd(activeRangeStart);
          if (onSelectRange) onSelectRange(dateStr, activeRangeStart);
        } else {
          setInternalRangeEnd(dateStr);
          if (onSelectRange) onSelectRange(activeRangeStart, dateStr);
        }
      }
    } else {
      setInternalDate(dateStr);
      if (onSelectDate) onSelectDate(dateStr);
    }
  };

  // Helper to format date string into "Wednesday, 11 November 2026" using local calendar date
  const formatSelectedHeading = (dateStr: string) => {
    try {
      const d = parseLocalDate(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Check if a day is within selected range
  const isDayInRange = (dateStr: string) => {
    if (!activeRangeStart || !activeRangeEnd) return false;
    const current = parseLocalDate(dateStr).getTime();
    const start = parseLocalDate(activeRangeStart).getTime();
    const end = parseLocalDate(activeRangeEnd).getTime();
    return current >= start && current <= end;
  };

  const isRangeEndpoint = (dateStr: string) => {
    return dateStr === activeRangeStart || dateStr === activeRangeEnd;
  };

  // Styles based on variant
  const getThemeClasses = () => {
    switch (variant) {
      case 'orange':
      case 'mint':
        return {
          btnSquare: 'bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318]',
          pillSolid: 'bg-[#ff7a1a] text-[#111318] font-bold shadow-md shadow-[#ff7a1a]/30',
          rangeBar: 'bg-[#fff1e6] text-[#111318]',
          topIcon: 'bg-[#ff7a1a]/20 text-[#181a20]',
          timePill: 'bg-[#181a20] text-white',
          accentBorder: 'border-[#ff7a1a]'
        };
      case 'teal':
        return {
          btnSquare: 'bg-[#181a20] hover:bg-[#242834] text-white',
          pillSolid: 'bg-[#181a20] text-white font-bold shadow-md shadow-[#181a20]/30',
          rangeBar: 'bg-slate-200/80 text-[#181a20]',
          topIcon: 'bg-[#181a20]/10 text-[#181a20]',
          timePill: 'bg-[#181a20] text-white',
          accentBorder: 'border-[#181a20]'
        };
      case 'purple':
      default:
        // Exact purple from uploaded reference screenshot!
        return {
          btnSquare: 'bg-[#6366f1] hover:bg-[#5356e3] text-white',
          pillSolid: 'bg-[#6366f1] text-white font-bold shadow-md shadow-[#6366f1]/30',
          rangeBar: 'bg-[#ede9fe] text-[#4f46e5]',
          topIcon: 'bg-[#ede9fe] text-[#6366f1]',
          timePill: 'bg-[#6366f1] text-white',
          accentBorder: 'border-[#6366f1]'
        };
    }
  };

  const theme = getThemeClasses();
  const currentDayEvents = eventsMap[activeSelectedDate] || [];

  return (
    <div className={`bg-white rounded-[28px] border border-slate-200/80 p-5 md:p-6 shadow-sm select-none ${className}`}>
      {/* 1. Header: "My Schedule" with top-right calendar square button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const todayIso = formatLocalDateISO(now);
            setCurrentYear(now.getFullYear());
            setCurrentMonth(now.getMonth());
            setInternalDate(todayIso);
            if (onSelectDate) onSelectDate(todayIso);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme.topIcon}`}
          title="Jump to Current Date"
          aria-label="Jump to current date"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Month Navigation: [ < ]  Month, Year  [ > ] */}
      <div className="flex items-center justify-between mb-5 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform active:scale-95 shadow-xs ${theme.btnSquare}`}
          title="Previous Month"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        <span className="text-sm font-extrabold text-slate-800 tracking-tight">
          {monthNames[currentMonth]}, {currentYear}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform active:scale-95 shadow-xs ${theme.btnSquare}`}
          title="Next Month"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* 3. Days of the week row: Su Mo Tu We Th Fr Sa */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-[11px] font-bold text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* 4. Calendar Dates Grid with range connectors & solid round pills */}
      <div className="grid grid-cols-7 gap-y-1.5 text-center mb-6">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9 w-9 mx-auto" />
        ))}

        {/* Month days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNum = index + 1;
          const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum
            .toString()
            .padStart(2, '0')}`;

          const isSelected = activeSelectedDate === dateStr;
          const inRange = isDayInRange(dateStr);
          const isEndpoint = isRangeEndpoint(dateStr);
          const hasEvents = !!eventsMap[dateStr]?.length;
          const isMissedPunch = eventsMap[dateStr]?.some((e) => e.status === 'MISSED_PUNCH');

          return (
            <div key={dateStr} className="relative flex items-center justify-center py-0.5">
              {/* Range background bar between endpoints */}
              {isRangeMode && inRange && !isEndpoint && (
                <div className={`absolute inset-x-0 h-8 ${theme.rangeBar} z-0`} />
              )}
              {isRangeMode && inRange && dateStr === activeRangeStart && activeRangeEnd && (
                <div className={`absolute right-0 w-1/2 h-8 ${theme.rangeBar} z-0`} />
              )}
              {isRangeMode && inRange && dateStr === activeRangeEnd && activeRangeStart && (
                <div className={`absolute left-0 w-1/2 h-8 ${theme.rangeBar} z-0`} />
              )}

              {/* Day Button */}
              <button
                type="button"
                onClick={() => handleDayClick(dayNum)}
                className={`relative z-10 w-8 h-8 rounded-full flex flex-col items-center justify-center text-xs font-semibold transition-all ${
                  isSelected || (isRangeMode && isEndpoint)
                    ? `${theme.pillSolid} scale-105`
                    : inRange
                    ? 'text-indigo-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{dayNum}</span>

                {/* Event Dot Indicator */}
                {hasEvents && !isSelected && !isEndpoint && (
                  <span
                    className={`w-1 h-1 rounded-full -mt-0.5 ${
                      isMissedPunch ? 'bg-rose-500 ring-1 ring-rose-300' : 'bg-indigo-500'
                    }`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 5. Selected Date Banner with 3-dot options menu */}
      {showEventsList && (
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">
              {formatSelectedHeading(activeSelectedDate)}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onApplyLeave ? onApplyLeave(activeSelectedDate) : null}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline px-1.5 py-0.5"
                title="Apply Leave for this date"
              >
                + Leave
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOptionsMenu((v) => !v)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Options"
                  aria-label="Calendar day options"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {showOptionsMenu && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-30 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        if (onApplyLeave) onApplyLeave(activeSelectedDate);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-medium text-slate-700"
                    >
                      Apply Leave for Date
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        if (onMissedPunch) onMissedPunch(activeSelectedDate);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-medium text-slate-700"
                    >
                      Regularize Attendance
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. Event / Schedule / Punch items for selected date */}
          <div className="space-y-2.5">
            {currentDayEvents.length > 0 ? (
              currentDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    evt.status === 'MISSED_PUNCH'
                      ? 'bg-rose-50/80 border-rose-200'
                      : evt.type === 'leave'
                      ? 'bg-sky-50/70 border-sky-200'
                      : evt.type === 'holiday'
                      ? 'bg-purple-50/70 border-purple-200'
                      : 'bg-slate-50/70 border-slate-100 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        evt.status === 'MISSED_PUNCH' ? 'bg-rose-600 text-white' : theme.timePill
                      }`}>
                        {evt.time}
                      </span>
                      <span className="text-[11px] font-extrabold text-slate-900 truncate">
                        {evt.category}
                      </span>
                    </div>

                    {evt.status === 'MISSED_PUNCH' && (
                      <button
                        type="button"
                        onClick={() => onMissedPunch ? onMissedPunch(activeSelectedDate) : null}
                        className="text-[10px] px-2 py-0.5 bg-rose-600 text-white font-bold rounded-md hover:bg-rose-700 shadow-2xs"
                      >
                        Fix Punch
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium pl-1">
                    {evt.title}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  No appointments or leave requests for this date.
                </p>
                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onApplyLeave ? onApplyLeave(activeSelectedDate) : null}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-[11px] font-bold text-slate-700 shadow-2xs"
                  >
                    + Apply Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => onMissedPunch ? onMissedPunch(activeSelectedDate) : null}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-[11px] font-bold text-slate-700 shadow-2xs"
                  >
                    + Regularize Punch
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

