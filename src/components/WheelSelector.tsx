import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useCalendarContext } from '../CalendarContext';
import {
  getFormatted,
  getParsedDate,
  getDaysNumInMonth,
  getTimeRange,
  getDate,
} from '../utils';
import Wheel from './WheelPicker/Wheel';
import { OrderedDateParts } from '../types';

function createNumberList(start: number, end: number, first: number = 1) {
  return new Array(end - start).fill(0).map((_, index) => ({
    value: index + first + start,
    text: String(index + first + start).padStart(2, '0'),
  }));
}

interface WheelSelectorProps {
  type: OrderedDateParts;
}

const WheelSelector: React.FC<WheelSelectorProps> = ({ type }) => {
  const {
    date,
    currentDate,
    onSelectYear,
    onSelectMonth,
    onSelectDate,
    minDate = '1900-01-01',
    maxDate = '2099-12-31',
  } = useCalendarContext();
  const latestValues = useRef({ date, currentDate });
  const { year, month } = useMemo(() => {
    const cd = getDate(currentDate);
    if (cd.isAfter(getDate(maxDate))) return getParsedDate(maxDate);
    if (cd.isBefore(getDate(minDate))) return getParsedDate(minDate);
    return getParsedDate(cd);
  }, [currentDate, maxDate, minDate]);

  const { year: startYear, month: startMonth } = getParsedDate(minDate);
  const { year: endYear, month: endMonth } = getParsedDate(maxDate);
  const { hour, minute, second } = getParsedDate(currentDate);
  const years = createNumberList(startYear - 1, endYear);
  const months = useMemo(
    () =>
      createNumberList(
        startYear === year ? startMonth : 0,
        endYear === year ? endMonth + 1 : 12
      ),
    [endMonth, endYear, startMonth, startYear, year]
  );

  const days = useMemo(
    () => getDaysNumInMonth(year, month + 1, minDate, maxDate),
    [year, month, minDate, maxDate]
  );
  const hours = useMemo(
    () =>
      createNumberList(
        ...getTimeRange(currentDate, minDate, maxDate, 'hour'),
        0
      ),
    [currentDate, maxDate, minDate]
  );
  const minutes = useMemo(
    () =>
      createNumberList(
        ...getTimeRange(currentDate, minDate, maxDate, 'minute'),
        0
      ),
    [currentDate, maxDate, minDate]
  );
  const seconds = useMemo(
    () =>
      createNumberList(
        ...getTimeRange(currentDate, minDate, maxDate, 'second'),
        0
      ),
    [currentDate, maxDate, minDate]
  );

  const handleChangeDate = useCallback(
    (value: number, type: 'date' | 'hour' | 'minute' | 'second') => {
      const { date: latestDate, currentDate: latestCurrentDate } =
        latestValues.current;
      const newDate = getDate(latestDate || latestCurrentDate)[type](value);
      onSelectDate(getFormatted(newDate));
    },
    [onSelectDate]
  );

  const renderItem = () => {
    if (type === 'year')
      return (
        <Wheel
          value={year}
          items={years}
          key="year"
          onChange={(value) => onSelectYear(value)}
        />
      );
    if (type === 'month')
      return (
        <Wheel
          key="month"
          value={month + 1}
          items={months}
          onChange={(value) => onSelectMonth(value - 1)}
        />
      );
    if (type === 'day')
      return (
        <Wheel
          key="day"
          value={getDate(currentDate).date()}
          items={days}
          onChange={(value) => handleChangeDate(value, 'date')}
        />
      );
    if (type === 'hour')
      return (
        <Wheel
          key="hour"
          value={hour}
          items={hours}
          onChange={(value) => handleChangeDate(value, 'hour')}
        />
      );
    if (type === 'minute')
      return (
        <Wheel
          key="minute"
          value={minute}
          items={minutes}
          onChange={(value) => handleChangeDate(value, 'minute')}
        />
      );
    if (type === 'second')
      return (
        <Wheel
          key="second"
          value={second}
          items={seconds}
          onChange={(value) => handleChangeDate(value, 'second')}
        />
      );
    return null;
  };

  useEffect(() => {
    latestValues.current = { date, currentDate };
  }, [date, currentDate]);

  return (
    <View style={styles.wheelContainer} key={'date-' + type}>
      {renderItem()}
    </View>
  );
};

const styles = StyleSheet.create({
  wheelContainer: {
    flex: 1,
  },
});

export default WheelSelector;
