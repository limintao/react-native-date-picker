import React, { memo, useCallback, useEffect, useReducer } from 'react';
import {
  getFormatted,
  getDate,
  dateToUnix,
  getEndOfDay,
  getStartOfDay,
  areDatesOnSameDay,
} from './utils';
import CalendarContext from './CalendarContext';
import { CalendarViews, CalendarActionKind } from './enums';
import type {
  DateType,
  CalendarAction,
  LocalState,
  DatePickerBaseProps,
  CalendarThemeProps,
  HeaderProps,
  SingleChange,
  RangeChange,
  MultiChange,
} from './types';
import Calendar from './components/Calendar';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localeData from 'dayjs/plugin/localeData';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/zh-cn';

dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export interface DatePickerSingleProps
  extends CalendarThemeProps,
    HeaderProps,
    DatePickerBaseProps {
  mode?: 'single';
  columns?: never;
  date?: DateType;
  onChange?: SingleChange;
}

export interface DatePickerRangeProps
  extends CalendarThemeProps,
    HeaderProps,
    DatePickerBaseProps {
  mode: 'range';
  columns?: never;
  startDate?: DateType;
  endDate?: DateType;
  onChange?: RangeChange;
}

export interface DatePickerMultipleProps
  extends CalendarThemeProps,
    HeaderProps,
    DatePickerBaseProps {
  mode?: 'multiple';
  columns?: never;
  dates?: DateType[];
  onChange?: MultiChange;
}

export interface DatePickerWheelProps
  extends CalendarThemeProps,
    HeaderProps,
    DatePickerBaseProps {
  mode: 'wheel';
  date?: DateType;
  onChange?: SingleChange;
}

const DateTimePicker = (
  props:
    | DatePickerSingleProps
    | DatePickerRangeProps
    | DatePickerMultipleProps
    | DatePickerWheelProps
) => {
  const {
    mode = 'single',
    locale = 'zh-cn',
    displayFullDays = false,
    timePicker = false,
    firstDayOfWeek,
    buttonPrevIcon,
    buttonNextIcon,
    minDate,
    maxDate,
    date,
    startDate,
    endDate,
    dates,
    onChange,
    initialView = 'day',
    height,
    containerStyle,
    columns = ['year', 'month', 'day'],
    ...rest
  } = props;

  const initialCalendarView: CalendarViews =
    mode !== 'single' && initialView === 'time' ? 'day' : initialView;

  const firstDay =
    firstDayOfWeek && firstDayOfWeek > 0 && firstDayOfWeek <= 6
      ? firstDayOfWeek
      : 0;

  let currentDate = dayjs();

  if ((mode === 'single' || mode === 'wheel') && date)
    currentDate = dayjs(date);

  if (mode === 'range' && startDate) currentDate = dayjs(startDate);

  if (mode === 'multiple' && dates && dates.length > 0)
    currentDate = dayjs(dates[0]);

  if (minDate && currentDate.isBefore(minDate)) currentDate = dayjs(minDate);

  let currentYear = currentDate.year();

  dayjs.locale(locale);

  const [state, dispatch] = useReducer(
    (prevState: LocalState, action: CalendarAction) => {
      switch (action.type) {
        case CalendarActionKind.SET_CALENDAR_VIEW:
          return {
            ...prevState,
            calendarView: action.payload,
          };
        case CalendarActionKind.CHANGE_CURRENT_DATE:
          return {
            ...prevState,
            currentDate: action.payload,
          };
        case CalendarActionKind.CHANGE_CURRENT_YEAR:
          return {
            ...prevState,
            currentYear: action.payload,
          };
        case CalendarActionKind.CHANGE_SELECTED_DATE:
          const { date } = action.payload;
          return {
            ...prevState,
            date,
            currentDate: date,
          };
        case CalendarActionKind.CHANGE_SELECTED_RANGE:
          const { startDate, endDate } = action.payload;
          return {
            ...prevState,
            startDate,
            endDate,
          };
        case CalendarActionKind.CHANGE_SELECTED_MULTIPLE:
          const { dates } = action.payload;
          return {
            ...prevState,
            dates,
          };
      }
    },
    {
      date,
      startDate,
      endDate,
      dates,
      calendarView: initialCalendarView,
      currentDate,
      currentYear,
    }
  );

  useEffect(() => {
    if (mode === 'single') {
      const newDate =
        (date && (timePicker ? date : getStartOfDay(date))) ?? minDate;

      dispatch({
        type: CalendarActionKind.CHANGE_SELECTED_DATE,
        payload: { date: newDate },
      });
    } else if (mode === 'range')
      dispatch({
        type: CalendarActionKind.CHANGE_SELECTED_RANGE,
        payload: { startDate, endDate },
      });
    else if (mode === 'multiple')
      dispatch({
        type: CalendarActionKind.CHANGE_SELECTED_MULTIPLE,
        payload: { dates },
      });
    else if (mode === 'wheel')
      dispatch({
        type: CalendarActionKind.CHANGE_SELECTED_DATE,
        payload: { date },
      });
  }, [mode, date, startDate, endDate, dates, minDate, timePicker]);

  const setCalendarView = useCallback((view: CalendarViews) => {
    dispatch({ type: CalendarActionKind.SET_CALENDAR_VIEW, payload: view });
  }, []);

  const onSelectDate = useCallback(
    (datetime: DateType) => {
      if (mode === 'single') {
        const newDate = timePicker ? datetime : getStartOfDay(datetime);

        dispatch({
          type: CalendarActionKind.CHANGE_CURRENT_DATE,
          payload: newDate,
        });

        (onChange as SingleChange)?.({
          date: newDate,
        });
      } else if (mode === 'range') {
        const sd = state.startDate;
        const ed = state.endDate;
        let isStart: boolean = true;

        if (sd && !ed && dateToUnix(datetime) >= dateToUnix(sd!))
          isStart = false;

        const newDateRang = {
          startDate: isStart ? getStartOfDay(datetime) : sd,
          endDate: !isStart ? getEndOfDay(datetime) : undefined,
        };

        dispatch({
          type: CalendarActionKind.CHANGE_SELECTED_RANGE,
          payload: newDateRang,
        });

        (onChange as RangeChange)?.(newDateRang);
      } else if (mode === 'multiple') {
        const safeDates = (state.dates as DateType[]) || [];
        const newDate = getStartOfDay(datetime);

        const exists = safeDates.some((ed) => areDatesOnSameDay(ed, newDate));

        const newDates = exists
          ? safeDates.filter((ed) => !areDatesOnSameDay(ed, newDate))
          : [...safeDates, newDate];

        newDates.sort((a, b) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1));

        const newDatesObj = {
          dates: newDates,
          datePressed: newDate,
          change: (exists
            ? 'removed'
            : 'added') as Parameters<MultiChange>[0]['change'],
        };

        dispatch({
          type: CalendarActionKind.CHANGE_SELECTED_MULTIPLE,
          payload: newDatesObj,
        });

        (onChange as MultiChange)?.(newDatesObj);
      } else if (mode === 'wheel') {
        dispatch({
          type: CalendarActionKind.CHANGE_CURRENT_DATE,
          payload: datetime,
        });

        (onChange as SingleChange)?.({
          date: datetime,
        });
      }
    },
    [onChange, mode, timePicker, state.startDate, state.endDate, state.dates]
  );

  const onSelectMonth = useCallback(
    (month: number) => {
      let newDate = getDate(state.currentDate).month(month);
      if (maxDate && newDate.isAfter(maxDate)) newDate = getDate(maxDate);
      if (minDate && newDate.isBefore(minDate)) newDate = getDate(minDate);
      dispatch({
        type: CalendarActionKind.CHANGE_CURRENT_DATE,
        payload: getFormatted(newDate),
      });
      dispatch({
        type: CalendarActionKind.SET_CALENDAR_VIEW,
        payload: 'day',
      });
      if (mode === 'single' || mode === 'wheel')
        (onChange as SingleChange)?.({ date: getFormatted(newDate) });
    },
    [maxDate, minDate, mode, onChange, state.currentDate]
  );

  const onSelectYear = useCallback(
    (year: number) => {
      let newDate = getDate(state.currentDate).year(year);
      if (maxDate && newDate.isAfter(maxDate)) newDate = getDate(maxDate);
      if (minDate && newDate.isBefore(minDate)) newDate = getDate(minDate);
      dispatch({
        type: CalendarActionKind.CHANGE_CURRENT_DATE,
        payload: getFormatted(newDate),
      });
      dispatch({
        type: CalendarActionKind.SET_CALENDAR_VIEW,
        payload: initialView,
      });
      if (mode === 'single' || mode === 'wheel')
        (onChange as SingleChange)?.({ date: getFormatted(newDate) });
    },
    [state.currentDate, maxDate, minDate, initialView, mode, onChange]
  );

  const onChangeMonth = useCallback(
    (month: number) => {
      const newDate = getDate(state.currentDate).add(month, 'month');
      dispatch({
        type: CalendarActionKind.CHANGE_CURRENT_DATE,
        payload: getFormatted(newDate),
      });
    },
    [state.currentDate]
  );

  const onChangeYear = useCallback((year: number) => {
    dispatch({
      type: CalendarActionKind.CHANGE_CURRENT_YEAR,
      payload: year,
    });
  }, []);

  return (
    <CalendarContext.Provider
      value={{
        ...state,
        locale,
        mode,
        displayFullDays,
        timePicker,
        minDate,
        maxDate,
        firstDayOfWeek: firstDay,
        height,
        theme: rest,
        columns,
        setCalendarView,
        onSelectDate,
        onSelectMonth,
        onSelectYear,
        onChangeMonth,
        onChangeYear,
      }}
    >
      <Calendar
        buttonPrevIcon={buttonPrevIcon}
        buttonNextIcon={buttonNextIcon}
        height={height}
        containerStyle={containerStyle}
      />
    </CalendarContext.Provider>
  );
};

export default memo(DateTimePicker);
