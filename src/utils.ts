import dayjs from 'dayjs';
import type { DateType, IDayObject, PickerOption } from './types';

export const CALENDAR_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const YEAR_PAGE_SIZE = 12;

export const getMonths = () => dayjs.months();

export const getMonthName = (month: number) => dayjs.months()[month];

export const getWeekdays = () => dayjs.weekdays();

export const getWeekdaysShort = () => dayjs.weekdaysShort();

export const getWeekdaysMin = (firstDayOfWeek: number) => {
  let days = dayjs.weekdaysMin();
  if (firstDayOfWeek > 0)
    days = [
      ...days.slice(firstDayOfWeek, days.length),
      ...days.slice(0, firstDayOfWeek),
    ] as dayjs.WeekdayNames;
  return days;
};

export const getFormatted = (date: DateType) =>
  dayjs(date).format(CALENDAR_FORMAT);

export const getDateMonth = (date: DateType) => dayjs(date).month();

export const getDateYear = (date: DateType) => dayjs(date).year();

export const getToday = () => dayjs().format(DATE_FORMAT);

export function areDatesOnSameDay(a: DateType, b: DateType) {
  if (!a || !b) return false;

  const date_a = dayjs(a).format(DATE_FORMAT);
  const date_b = dayjs(b).format(DATE_FORMAT);

  return date_a === date_b;
}

export function isDateBetween(
  date: DateType,
  {
    startDate,
    endDate,
  }: {
    startDate?: DateType;
    endDate?: DateType;
  }
): boolean {
  if (!startDate || !endDate) return false;

  return dayjs(date) <= endDate && dayjs(date) >= startDate;
}

export const getFormattedDate = (date: DateType, format: string) =>
  dayjs(date).format(format);

export const getDate = (date: DateType) => dayjs(date, DATE_FORMAT);

export const getYearRange = (year: number) => {
  const endYear = YEAR_PAGE_SIZE * Math.ceil(year / YEAR_PAGE_SIZE);
  let startYear = endYear === year ? endYear : endYear - YEAR_PAGE_SIZE;

  if (startYear < 0) startYear = 0;

  return Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => startYear + i);
};

export function getDaysInMonth(
  date: DateType,
  displayFullDays: boolean | undefined,
  firstDayOfWeek: number
) {
  const daysInCurrentMonth = dayjs(date).daysInMonth();

  const prevMonthDays = dayjs(date).add(-1, 'month').daysInMonth();
  const firstDay = dayjs(date).date(1 - firstDayOfWeek);
  const prevMonthOffset = firstDay.day() % 7;
  const daysInPrevMonth = displayFullDays ? prevMonthOffset : 0;
  const monthDaysOffset = prevMonthOffset + daysInCurrentMonth;
  const daysInNextMonth = displayFullDays
    ? monthDaysOffset > 35
      ? 42 - monthDaysOffset
      : 35 - monthDaysOffset
    : 0;

  const fullDaysInMonth =
    daysInPrevMonth + daysInCurrentMonth + daysInNextMonth;

  return {
    prevMonthDays,
    prevMonthOffset,
    daysInCurrentMonth,
    daysInNextMonth,
    fullDaysInMonth,
  };
}

export function getDaysNumInMonth(
  year: number,
  month: number,
  minDate: DateType,
  maxDate: DateType
): Array<PickerOption> {
  const formattedMonth = String(month).padStart(2, '0');
  const date = dayjs(`${year}-${formattedMonth}-01`);
  const daysInMonth = date.daysInMonth();
  const minDay = dayjs(minDate);
  const maxDay = dayjs(maxDate);

  const daysArray = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = dayjs(
      `${year}-${formattedMonth}-${String(day).padStart(2, '0')}`
    );
    if (
      (currentDate.isAfter(minDay) || currentDate.isSame(minDay, 'day')) &&
      (currentDate.isBefore(maxDay) || currentDate.isSame(maxDay, 'day'))
    )
      daysArray.push({ value: day, text: String(day).padStart(2, '0') });
  }
  return daysArray;
}

export function getTimeRange(
  date: DateType,
  min: DateType,
  max: DateType,
  type: 'hour' | 'minute' | 'second'
) {
  const formatStr = `YYYY-MM-DD${
    type === 'minute' ? ' HH' : type === 'second' ? ' HH:mm' : ''
  }`;
  const current = getDate(date).format(formatStr);
  const minDate = getDate(min).format(formatStr);
  const maxDate = getDate(max).format(formatStr);

  const range: [number, number] = [0, type === 'hour' ? 24 : 60];
  if (current <= minDate) range[0] = getDate(min)[type]();
  if (current >= maxDate) range[1] = getDate(max)[type]() + 1;

  return range;
}

export function getFirstDayOfMonth(
  date: DateType,
  firstDayOfWeek: number
): number {
  const d = getDate(date);
  return d.date(1 - firstDayOfWeek).day();
}

export function getStartOfDay(date: DateType): DateType {
  return dayjs(date).startOf('day');
}

export function getEndOfDay(date: DateType): DateType {
  return dayjs(date).endOf('day');
}

export function dateToUnix(date: DateType): number {
  return dayjs(date).unix();
}

/**
 * Get detailed date object
 *
 * @param date Get detailed date object
 *
 * @returns parsed date object
 */
export const getParsedDate = (date: DateType) => ({
  year: dayjs(date).year(),
  month: dayjs(date).month(),
  hour: dayjs(date).hour(),
  minute: dayjs(date).minute(),
  second: dayjs(date).second(),
});

/**
 * Calculate month days array based on current date
 *
 * @param datetime - The current date that selected
 * @param displayFullDays
 * @param minDate - min selectable date
 * @param maxDate - max selectable date
 * @param firstDayOfWeek - first day of week, number 0-6, 0 – Sunday, 6 – Saturday
 *
 * @returns days array based on current date
 */
export const getMonthDays = (
  datetime: DateType = dayjs(),
  displayFullDays: boolean,
  minDate: DateType,
  maxDate: DateType,
  firstDayOfWeek: number
): IDayObject[] => {
  const date = getDate(datetime);
  const {
    prevMonthDays,
    prevMonthOffset,
    daysInCurrentMonth,
    daysInNextMonth,
  } = getDaysInMonth(datetime, displayFullDays, firstDayOfWeek);

  const prevDays = displayFullDays
    ? Array.from({ length: prevMonthOffset }, (_, index) => {
        const day = index + (prevMonthDays - prevMonthOffset + 1);
        const thisDay = date.add(-1, 'month').date(day);
        return generateDayObject(
          day,
          thisDay,
          minDate,
          maxDate,
          false,
          index + 1
        );
      })
    : Array(prevMonthOffset).fill(null);

  const currentDays = Array.from({ length: daysInCurrentMonth }, (_, index) => {
    const day = index + 1;
    const thisDay = date.date(day);
    return generateDayObject(
      day,
      thisDay,
      minDate,
      maxDate,
      true,
      prevMonthOffset + day
    );
  });

  const nextDays = Array.from({ length: daysInNextMonth }, (_, index) => {
    const day = index + 1;
    const thisDay = date.add(1, 'month').date(day);
    return generateDayObject(
      day,
      thisDay,
      minDate,
      maxDate,
      false,
      daysInCurrentMonth + prevMonthOffset + day
    );
  });

  return [...prevDays, ...currentDays, ...nextDays];
};

/**
 * Generate day object for displaying inside day cell
 *
 * @param day - number of day
 * @param date - calculated date based on day, month, and year
 * @param minDate - min selectable date
 * @param maxDate - max selectable date
 * @param isCurrentMonth - define the day is in the current month
 *
 * @returns days object based on current date
 */
const generateDayObject = (
  day: number,
  date: dayjs.Dayjs,
  minDate: DateType,
  maxDate: DateType,
  isCurrentMonth: boolean,
  dayOfMonth: number
) => {
  let disabled = false;
  if (minDate) disabled = date < getDate(minDate);

  if (maxDate && !disabled) disabled = date > getDate(maxDate);

  return {
    text: day.toString(),
    day: day,
    date: getFormattedDate(date, DATE_FORMAT),
    disabled,
    isCurrentMonth,
    dayOfMonth,
  };
};

export function addColorAlpha(color: string | undefined, opacity: number) {
  //if it has an alpha, remove it
  if (!color) color = '#000000';

  if (color.length > 7) color = color.substring(0, color.length - 2);

  // coerce values so ti is between 0 and 1.
  const _opacity = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
  let opacityHex = _opacity.toString(16).toUpperCase();

  // opacities near 0 need a trailing 0
  if (opacityHex.length === 1) opacityHex = '0' + opacityHex;

  return color + opacityHex;
}

/**

深度比较两个值是否相等
@param {any} value
@param {any} other
@returns {boolean}
*/
export const isEqual = (value: any, other: any) => {
  // 如果是同一个引用
  if (value === other) {
    // 排除 0 和 -0 的特殊情况
    return value !== 0 || 1 / value === 1 / other;
  }
  // 如果有一个是 null/undefined，或者类型不同
  if (value == null || other == null || typeof value !== typeof other) {
    // 同时要特殊处理 NaN
    return Number.isNaN(value) && Number.isNaN(other);
  }

  // 如果是对象或函数，则继续
  if (typeof value === 'object' || typeof value === 'function') {
    // Date
    if (value instanceof Date && other instanceof Date) {
      return value.getTime() === other.getTime();
    }
    // RegExp
    if (value instanceof RegExp && other instanceof RegExp) {
      return value.source === other.source && value.flags === other.flags;
    }
    // Array 或者普通对象
    if (
      (Array.isArray(value) && Array.isArray(other)) ||
      (Object.prototype.toString.call(value) === '[object Object]' &&
        Object.prototype.toString.call(other) === '[object Object]')
    ) {
      // 先比较键的数量是否一致
      const valueKeys = Object.keys(value);
      const otherKeys = Object.keys(other);
      if (valueKeys.length !== otherKeys.length) {
        return false;
      }
      // 递归比较每个键对应的值
      for (const key of valueKeys) {
        if (
          !Object.prototype.hasOwnProperty.call(other, key) ||
          !isEqual(value[key], other[key])
        ) {
          return false;
        }
      }
      return true;
    }
  }

  // 如果以上情况都不满足，则直接比较
  return false;
};

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 200
): T {
  let inThrottle = false;
  let lastResult: any;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  }) as T;
}
