import { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useCalendarContext } from '../CalendarContext';
import {
  getParsedDate,
  getDaysNumInMonth,
  getTimeRange,
  clampDate,
} from '../utils';
import Wheel from './WheelPicker/Wheel';
import { OrderedDateParts } from '../types';

function createNumberList(start: number, end: number, first: number = 1) {
  return new Array(Math.max(0, end - start)).fill(0).map((_, index) => ({
    value: index + first + start,
    text: String(index + first + start).padStart(2, '0'),
  }));
}

interface WheelSelectorProps {
  type: OrderedDateParts;
}

const WheelSelector: React.FC<WheelSelectorProps> = ({ type }) => {
  const {
    currentDate,
    onSelectYear,
    onSelectMonth,
    onSelectDatePart,
    minDate: minBoundary,
    maxDate: maxBoundary,
  } = useCalendarContext();
  const minDate = minBoundary ?? '1900-01-01 00:00:00';
  const maxDate = maxBoundary ?? '2099-12-31 23:59:59.999';
  const effectiveDate = useMemo(
    () => clampDate(currentDate, minDate, maxDate),
    [currentDate, minDate, maxDate]
  );
  const { year, month } = getParsedDate(effectiveDate);

  const { year: startYear, month: startMonth } = getParsedDate(minDate);
  const { year: endYear, month: endMonth } = getParsedDate(maxDate);
  const { hour, minute, second } = getParsedDate(effectiveDate);
  const years = useMemo(
    () => createNumberList(startYear - 1, endYear),
    [startYear, endYear]
  );
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
        ...getTimeRange(effectiveDate, minDate, maxDate, 'hour'),
        0
      ),
    [effectiveDate, maxDate, minDate]
  );
  const minutes = useMemo(
    () =>
      createNumberList(
        ...getTimeRange(effectiveDate, minDate, maxDate, 'minute'),
        0
      ),
    [effectiveDate, maxDate, minDate]
  );
  const seconds = useMemo(
    () =>
      createNumberList(
        ...getTimeRange(effectiveDate, minDate, maxDate, 'second'),
        0
      ),
    [effectiveDate, maxDate, minDate]
  );

  const handleChangeDate = useCallback(
    (value: number, type: 'date' | 'hour' | 'minute' | 'second') =>
      onSelectDatePart(type, value),
    [onSelectDatePart]
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
          value={effectiveDate.date()}
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
