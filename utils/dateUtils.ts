import { endOfDay, format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * Simple date utilities for frontend timezone handling
 */

// Get user's timezone
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert UTC date from API to user's timezone for display
 */
export function formatDateForDisplay(utcDate: string | Date | null): string {
  if (!utcDate) return '';
  
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  const localDate = toZonedTime(date, getUserTimezone());
  
  return format(localDate, 'MMM d, yyyy h:mm a');
}

/**
 * Convert local date string (YYYY-MM-DD) to UTC for API calls
 * This is used for filtering where user selects dates in their timezone
 * @param localDateString - Date string in YYYY-MM-DD format
 * @param isEndDate - If true, sets time to end of day (23:59:59.999) before converting to UTC
 */
export function convertLocalDateToUTC(localDateString: string, isEndDate: boolean = false): string {
  if (!localDateString) return '';
  
  // Parse the date as if it's in user's timezone
  let localDate = parseISO(localDateString);
  
  // If it's an end date, set to end of day in user's timezone
  if (isEndDate) {
    localDate = endOfDay(localDate);
  }
  
  const zonedDate = toZonedTime(localDate, getUserTimezone());
  
  // Convert to UTC ISO string
  return zonedDate.toISOString();
}

/**
 * Format tournament date with smart display
 */
export function formatTournamentDate(utcDate: string | Date | null): string {
  if (!utcDate) return '';
  
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  const localDate = toZonedTime(date, getUserTimezone());
  const now = new Date();
  
  // Check if it's today or tomorrow
  const isToday = localDate.toDateString() === now.toDateString();
  const isTomorrow = localDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  
  if (isToday) {
    return `Today at ${format(localDate, 'h:mm a')}`;
  } else if (isTomorrow) {
    return `Tomorrow at ${format(localDate, 'h:mm a')}`;
  } else {
    return format(localDate, 'MMM d, yyyy h:mm a');
  }
}

/**
 * Get timezone abbreviation for display
 */
export function getTimezoneAbbreviation(): string {
  const date = new Date();
  return date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];
} 