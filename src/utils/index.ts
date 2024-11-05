import { DayOfWeek } from '@/app/member-schedule/entities/member-schedule.entity';
import { addDays, format } from 'date-fns';

export * from './base.entity';

export function generateOpt() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export enum ParamType {
  array = 'array',
  string = 'string',
  object = 'object',
  unknown = 'unknown',
}
export function checkType(param: any): ParamType {
  if (Array.isArray(param)) {
    return ParamType.array;
  } else if (typeof param === 'string') {
    return ParamType.string;
  } else if (
    typeof param === 'object' &&
    param !== null &&
    !Array.isArray(param)
  ) {
    return ParamType.object;
  } else {
    return ParamType.unknown;
  }
}

// eg: 2024-12-30
export function getCurrentDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are zero-indexed, so we add 1
  const day = date.getDate();

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

// eg: Monday ,Tuesday
export const getCurrentDayOfWeek = (date?: string) => {
  const currentDay = new Date(date).getDay();
  switch (currentDay) {
    case 0:
      return DayOfWeek.sunday;
    case 1:
      return DayOfWeek.monday;
    case 2:
      return DayOfWeek.tuesday;
    case 3:
      return DayOfWeek.wednesday;
    case 4:
      return DayOfWeek.thursday;
    case 5:
      return DayOfWeek.friday;
    case 6:
      return DayOfWeek.satuarday;
  }
};

export function getDatesBetweenDates(
  startDate: string,
  endDate: string,
): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];

  let currentDate = start;
  while (currentDate <= end) {
    dates.push(format(currentDate, 'yyyy-MM-d'));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

export function formatSecondsToTime(seconds: number): string {
  // Convert seconds to milliseconds and create a Date object (1970-01-01 is the epoch start)
  const date = new Date(seconds * 1000);
  // Format the Date object to "HH:mm:ss" format
  return format(date, 'HH:mm:ss');
}
