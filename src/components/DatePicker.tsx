import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useCalendarContext } from '../CalendarContext';
import Wheel from './WheelPicker/Wheel';
import { CONTAINER_HEIGHT } from '../enums';
import {
  getFormatted,
  getParsedDate,
  getDaysNumInMonth,
  getTimeRange,
  getDate,
} from '../utils';

function createNumberList(start: number, end: number, first: number = 1) {
  return new Array(end - start).fill(0).map((_, index) => ({
    value: index + first + start,
    text: String(index + first + start).padStart(2, '0'),
  }));
}

const DatePicker: React.FC = () => {
  const {
    columns,
    currentDate,
    onSelectYear,
    onSelectMonth,
    onSelectDate,
    minDate = '1900-01-01',
    maxDate = '2099-12-31',
  } = useCalendarContext();
  const { year, month } = useMemo(
    () =>
      getParsedDate(
        getDate(currentDate).isAfter(getDate(maxDate))
          ? maxDate
          : getDate(currentDate).isBefore(getDate(minDate))
          ? minDate
          : currentDate
      ),
    [currentDate, maxDate, minDate]
  );

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
      const newDate = getDate(currentDate).set(type, value);
      onSelectDate(getFormatted(newDate));
    },
    [currentDate, onSelectDate]
  );

  const createIndicatorStyle = useCallback(
    (index: number) => {
      const len = columns?.length || 0;
      if (!index && len > 1)
        return { borderTopRightRadius: 0, borderBottomRightRadius: 0 };
      else if (index === len - 1 && len > 1)
        return { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 };
      else if (len > 2) return { borderRadius: 0 };
      else return undefined;
    },
    [columns]
  );

  return (
    <View style={styles.container}>
      <View style={styles.datePickerContainer}>
        {columns?.map((item, index) => (
          <View style={styles.wheelContainer} key={item}>
            {item === 'year' && (
              <Wheel
                value={year}
                items={years}
                setValue={(value) => onSelectYear(value)}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'month' && (
              <Wheel
                value={month + 1}
                items={months}
                setValue={(value) => onSelectMonth(value - 1)}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'day' && (
              <Wheel
                value={getDate(currentDate).date()}
                items={days}
                setValue={(value) => handleChangeDate(value, 'date')}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'hour' && (
              <Wheel
                value={hour}
                items={hours}
                setValue={(value) => handleChangeDate(value, 'hour')}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'minute' && (
              <Wheel
                value={minute}
                items={minutes}
                setValue={(value) => handleChangeDate(value, 'minute')}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'second' && (
              <Wheel
                value={second}
                items={seconds}
                setValue={(value) => handleChangeDate(value, 'second')}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  wheelContainer: {
    flex: 1,
  },
  datePickerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: CONTAINER_HEIGHT / 2,
  },
});

export default DatePicker;
