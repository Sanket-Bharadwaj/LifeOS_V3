
// Date utility functions

// Format date as YYYY-MM-DD
export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get today's date as YYYY-MM-DD
export const getTodayString = (): string => {
  return toISODateString(new Date());
};

// Get the day of the week (0-6, where 0 is Sunday)
export const getDayOfWeek = (date: Date): number => {
  return date.getDay();
};

// Get the first day of the month
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

// Get the last day of the month
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

// Get the number of days in a month
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Check if two dates are the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Format date as Month DD, YYYY
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { 
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format time as HH:MM AM/PM
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Get the start of the week (Sunday)
export const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
};

// Format date and time together
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(dateObj)} at ${formatTime(dateObj)}`;
};

// Get greeting based on time of day
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good Morning";
  } else if (hour < 18) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
};

// Get time of day (morning, afternoon, evening)
export const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "morning";
  } else if (hour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
};

// Get all dates in a month as Date objects
export const getDatesInMonth = (year: number, month: number): Date[] => {
  const firstDay = getFirstDayOfMonth(year, month);
  const lastDay = getLastDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  
  const dates: Date[] = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i));
  }
  
  return dates;
};

// Calendar view type definition
export type CalendarViewType = 'day' | 'week' | 'month';

// Get date range for calendar view
export const getDateRangeForView = (view: CalendarViewType, currentDate: Date): { start: Date; end: Date } => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date = currentDate.getDate();
  
  switch (view) {
    case 'day':
      return {
        start: new Date(year, month, date),
        end: new Date(year, month, date)
      };
    case 'week':
      const dayOfWeek = currentDate.getDay();
      const startDate = new Date(year, month, date - dayOfWeek);
      const endDate = new Date(year, month, date + (6 - dayOfWeek));
      return {
        start: startDate,
        end: endDate
      };
    case 'month':
      return {
        start: getFirstDayOfMonth(year, month),
        end: getLastDayOfMonth(year, month)
      };
    default:
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0)
      };
  }
};
