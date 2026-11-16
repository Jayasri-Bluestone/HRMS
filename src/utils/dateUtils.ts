/**
 * Parses a YYYY-MM-DD date string as a local calendar date (preventing UTC off-by-one shifts).
 */
export const parseLocalDate = (dateStr: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((dateStr || '').trim());
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return new Date(dateStr);
};

export const formatLocalDateISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayDateISO = (): string => {
  return formatLocalDateISO(new Date());
};

export const formatDisplayDate = (
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string => {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', options);
};

export const getTimeBasedGreeting = (now: Date = new Date()): string => {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Parses a 12-hour time string like "09:15 AM" into a Date on the given base day.
 */
export const parseTimeOnDate = (timeStr: string, baseDate: Date = new Date()): Date | null => {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec((timeStr || '').trim());
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const result = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes, 0, 0);
  return isNaN(result.getTime()) ? null : result;
};

export const calculateElapsedHours = (
  checkInStr: string | null | undefined,
  endTime: Date | string = new Date()
): number => {
  if (!checkInStr) return 0;
  const referenceDate = typeof endTime === 'string' ? new Date() : endTime;
  const start = parseTimeOnDate(checkInStr, referenceDate);
  const end = typeof endTime === 'string' ? parseTimeOnDate(endTime, referenceDate) : endTime;
  if (!start || !end) return 0;
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
};

