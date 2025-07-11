import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function compareDatesInHours(
  date1: string | Date,
  date2: string | Date,
  tz: string = "America/New_York"
): number {
  const d1 = dayjs.tz(date1, tz);
  const d2 = dayjs.tz(date2, tz);
  return Math.abs(d1.diff(d2, 'hours'));
}

