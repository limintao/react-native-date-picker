import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localeData from 'dayjs/plugin/localeData';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/zh-cn';
import { getEndOfDay, getStartOfDay, areDatesOnSameDay } from './utils';
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
import DatePicker from './components/DatePicker';

dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export interface DatePickerSingleProps
  extends CalendarThemeProps,
    HeaderProps,
    DatePickerBaseProps {
  mode: 'single';
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
  mode: 'multiple';
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

const DateTimePicker: React.FC<
  | DatePickerSingleProps
  | DatePickerRangeProps
  | DatePickerMultipleProps
  | DatePickerWheelProps
> = (props) => {
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
    format = 'YYYY-MM-DD HH:mm:ss',
    onChange,
    initialView = 'day',
    height,
    containerStyle,
    columns = ['year', 'month', 'day'],
    ...rest
  } = props;
  dayjs.locale(locale);

  const initialCalendarView: CalendarViews = useMemo(
    () => (mode !== 'single' && initialView === 'time' ? 'day' : initialView),
    [mode, initialView]
  );

  const firstDay = useMemo(
    () =>
      firstDayOfWeek && firstDayOfWeek > 0 && firstDayOfWeek <= 6
        ? firstDayOfWeek
        : 0,
    [firstDayOfWeek]
  );

  const initialState: LocalState = useMemo(() => {
    let initialDate = dayjs();

    if (mode === 'single' && date) {
      initialDate = dayjs(date);
    }

    if (mode === 'range' && startDate) {
      initialDate = dayjs(startDate);
    }

    if (mode === 'multiple' && dates && dates.length > 0) {
      initialDate = dayjs(dates[0]);
    }

    if (minDate && initialDate.isBefore(minDate)) {
      initialDate = dayjs(minDate);
    }

    let _date = (date ? dayjs(date) : date) as DateType;

    if (_date && maxDate && dayjs(_date).isAfter(maxDate)) {
      _date = dayjs(maxDate);
    }

    if (_date && minDate && dayjs(_date).isBefore(minDate)) {
      _date = dayjs(minDate);
    }

    let start = (startDate ? dayjs(startDate) : startDate) as DateType;

    if (start && maxDate && dayjs(start).isAfter(maxDate)) {
      start = dayjs(maxDate);
    }

    if (start && minDate && dayjs(start).isBefore(minDate)) {
      start = dayjs(minDate);
    }

    let end = (endDate ? dayjs(endDate) : endDate) as DateType;

    if (end && maxDate && dayjs(end).isAfter(maxDate)) {
      end = dayjs(maxDate);
    }

    if (end && minDate && dayjs(end).isBefore(minDate)) {
      end = dayjs(minDate);
    }

    return {
      date: _date,
      startDate: start,
      endDate: end,
      dates,
      calendarView: initialCalendarView,
      currentDate: initialDate,
      currentYear: initialDate.year(),
    };
  }, [
    mode,
    date,
    startDate,
    endDate,
    dates,
    minDate,
    maxDate,
    initialCalendarView,
  ]);

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
          const { date: selectDate } = action.payload;
          return {
            ...prevState,
            date: selectDate,
            currentDate: selectDate,
          };
        case CalendarActionKind.CHANGE_SELECTED_RANGE:
          const { startDate: start, endDate: end } = action.payload;
          return {
            ...prevState,
            startDate: start,
            endDate: end,
          };
        case CalendarActionKind.CHANGE_SELECTED_MULTIPLE:
          const { dates: selectedDates } = action.payload;
          return {
            ...prevState,
            dates: selectedDates,
          };
        default:
          return prevState;
      }
    },
    initialState
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (mode === 'single') {
      let newDate = (date && (timePicker ? date : getStartOfDay(date))) ?? date;

      if (newDate && maxDate && dayjs(newDate).isAfter(maxDate)) {
        newDate = dayjs(maxDate);
      }
      if (newDate && minDate && dayjs(newDate).isBefore(minDate)) {
        newDate = dayjs(minDate);
      }

      dispatch({
        type: CalendarActionKind.CHANGE_SELECTED_DATE,
        payload: { date: newDate },
      });
    } else if (mode === 'range') {
      let start = startDate ? dayjs(startDate) : startDate;

      if (start && maxDate && dayjs(start).isAfter(maxDate)) {
        start = dayjs(maxDate);
      }
      if (start && minDate && dayjs(start).isBefore(minDate)) {
        start = dayjs(minDate);
      }

      let end = endDate ? dayjs(endDate) : endDate;

      if (end && maxDate && dayjs(end).isAfter(maxDate)) {
        end = dayjs(maxDate);
      }
      if (end && minDate && dayjs(end).isBefore(minDate)) {
        end = dayjs(minDate);
      }
      dispatch({
        type: CalendarActionKind.CHANGE_SELECTED_RANGE,
        payload: {
          startDate: start,
          endDate: end,
        },
      });
    } else if (mode === 'multiple')
      dispatch({
        type: CalendarActionKind.CHANGE_SELECTED_MULTIPLE,
        payload: { dates },
      });
    else if (mode === 'wheel')
      dispatch({
        type: CalendarActionKind.CHANGE_SELECTED_DATE,
        payload: { date },
      });
  }, [mode, date, startDate, endDate, dates, minDate, timePicker, maxDate]);

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
          date: dayjs(newDate).format(format),
        });
      } else if (mode === 'range') {
        const sd = stateRef.current.startDate;
        const ed = stateRef.current.endDate;
        const newDate = dayjs(datetime);

        let newDateRang: Parameters<RangeChange>[0] = {
          startDate: getStartOfDay(sd || newDate).format(format),
          endDate: ed ? getEndOfDay(ed).format(format) : undefined,
        };
        if (newDate.isSame(sd, 'date') || newDate.isSame(ed, 'date') || !sd) {
          newDateRang.endDate = undefined;
          newDateRang.startDate = getStartOfDay(newDate).format(format);
        } else if (newDate.isAfter(sd)) {
          if (ed && newDate.isBefore(ed))
            newDateRang.startDate = getStartOfDay(newDate).format(format);
          else newDateRang.endDate = getEndOfDay(newDate).format(format);
        } else {
          newDateRang.startDate = getStartOfDay(newDate).format(format);
          if (!ed) newDateRang.endDate = getEndOfDay(sd).format(format);
        }

        dispatch({
          type: CalendarActionKind.CHANGE_SELECTED_RANGE,
          payload: newDateRang,
        });

        (onChange as RangeChange)?.(newDateRang);
      } else if (mode === 'multiple') {
        const safeDates = (stateRef.current.dates as DateType[]) || [];
        const newDate = getStartOfDay(datetime);

        const exists = safeDates.some((ed) => areDatesOnSameDay(ed, newDate));

        const newDates = exists
          ? safeDates.filter((ed) => !areDatesOnSameDay(ed, newDate))
          : [...safeDates, newDate];

        newDates.sort((a, b) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1));

        const newDatesObj = {
          dates: newDates.map((d) => dayjs(d).format(format)),
          datePressed: newDate.format(format),
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
          date: dayjs(datetime).format(format),
        });
      }
    },
    [format, mode, timePicker, onChange]
  );

  const onSelectMonth = useCallback(
    (month: number) => {
      let newDate = dayjs(stateRef.current.currentDate).month(month);
      if (maxDate && newDate.isAfter(maxDate)) newDate = dayjs(maxDate);
      if (minDate && newDate.isBefore(minDate)) newDate = dayjs(minDate);
      dispatch({
        type: CalendarActionKind.CHANGE_CURRENT_DATE,
        payload: newDate,
      });
      if (mode !== 'wheel') setCalendarView('day');
      if (mode === 'single' || mode === 'wheel')
        (onChange as SingleChange)?.({ date: newDate.format(format) });
    },
    [format, maxDate, minDate, mode, onChange, setCalendarView]
  );

  const onSelectYear = useCallback(
    (year: number) => {
      let newDate = dayjs(stateRef.current.currentDate).year(year);
      if (maxDate && newDate.isAfter(maxDate)) newDate = dayjs(maxDate);
      if (minDate && newDate.isBefore(minDate)) newDate = dayjs(minDate);
      dispatch({
        type: CalendarActionKind.CHANGE_CURRENT_DATE,
        payload: newDate,
      });
      if (mode !== 'wheel') setCalendarView('day');
      if (mode === 'single' || mode === 'wheel')
        (onChange as SingleChange)?.({ date: newDate.format(format) });
    },
    [format, maxDate, minDate, mode, setCalendarView, onChange]
  );

  const onChangeMonth = useCallback((month: number) => {
    const newDate = dayjs(stateRef.current.currentDate).add(month, 'month');
    dispatch({
      type: CalendarActionKind.CHANGE_CURRENT_DATE,
      payload: dayjs(newDate),
    });
  }, []);

  const onChangeYear = useCallback((year: number) => {
    dispatch({
      type: CalendarActionKind.CHANGE_CURRENT_YEAR,
      payload: year,
    });
  }, []);

  const baseContextValue = useMemo(
    () => ({
      columns,
      mode,
      locale,
      timePicker,
      minDate,
      maxDate,
      startDate,
      endDate,
      dates,
      displayFullDays,
      firstDayOfWeek: firstDay,
      height,
      theme: { selectedItemColor: '#0047FF', ...rest },
    }),
    [
      columns,
      mode,
      locale,
      timePicker,
      minDate,
      maxDate,
      startDate,
      endDate,
      dates,
      displayFullDays,
      firstDay,
      height,
      rest,
    ]
  );

  const handlerContextValue = useMemo(
    () => ({
      setCalendarView,
      onSelectDate,
      onSelectMonth,
      onSelectYear,
      onChangeMonth,
      onChangeYear,
    }),
    [
      setCalendarView,
      onSelectDate,
      onSelectMonth,
      onSelectYear,
      onChangeMonth,
      onChangeYear,
    ]
  );

  const memoizedValue = useMemo(
    () => ({
      ...state,
      ...baseContextValue,
      ...handlerContextValue,
    }),
    [state, baseContextValue, handlerContextValue]
  );

  return (
    <CalendarContext.Provider value={memoizedValue}>
      {mode !== 'wheel' ? (
        <Calendar
          buttonPrevIcon={buttonPrevIcon}
          buttonNextIcon={buttonNextIcon}
          height={height}
          containerStyle={containerStyle}
        />
      ) : (
        <DatePicker height={height} containerStyle={containerStyle} />
      )}
    </CalendarContext.Provider>
  );
};

export default memo(DateTimePicker);
