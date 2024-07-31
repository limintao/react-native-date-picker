import { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useCalendarContext } from '../CalendarContext';
import Wheel from './WheelPicker/Wheel';
import { CALENDAR_HEIGHT } from '../enums';
import {
  getFormatted,
  getParsedDate,
  getDaysNumInMonth,
  getTimeRange,
  getDate,
} from '../utils';

function createNumberList(start: number, end: number) {
  return new Array(end - start)
    .fill(0)
    .map((_, index) => String(index + start).padStart(2, '0'));
}

const DatePicker = () => {
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
  const years = createNumberList(startYear, endYear + 1);
  const months = useMemo(
    () =>
      createNumberList(
        startYear === year ? startMonth + 1 : 1,
        endYear === year ? endMonth + 2 : 12
      ),
    [endMonth, endYear, startMonth, startYear, year]
  );
  const days = useMemo(
    () => getDaysNumInMonth(year, month + 1, minDate, maxDate),
    [year, month, minDate, maxDate]
  );
  const hours = useMemo(
    () =>
      createNumberList(...getTimeRange(currentDate, minDate, maxDate, 'hour')),
    [currentDate, maxDate, minDate]
  );
  const minutes = useMemo(
    () =>
      createNumberList(
        ...getTimeRange(currentDate, minDate, maxDate, 'minute')
      ),
    [currentDate, maxDate, minDate]
  );
  const seconds = useMemo(
    () =>
      createNumberList(
        ...getTimeRange(currentDate, minDate, maxDate, 'second')
      ),
    [currentDate, maxDate, minDate]
  );

  const handleChangeDate = useCallback(
    (
      value: number,
      data: Array<string>,
      type: 'date' | 'hour' | 'minute' | 'second'
    ) => {
      const newDate = getDate(currentDate)[type](Number(data[value]));
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
                value={years.indexOf(String(year))}
                items={years}
                key={years.length}
                setValue={(value) => onSelectYear(Number(years[value]))}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'month' && (
              <Wheel
                value={months.indexOf(String(month + 1).padStart(2, '0'))}
                items={months}
                key={months.length}
                setValue={(value) => onSelectMonth(Number(months[value]) - 1)}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'day' && (
              <Wheel
                value={days.indexOf(
                  String(getDate(currentDate).date()).padStart(2, '0')
                )}
                key={days.length}
                items={days}
                setValue={(value) => handleChangeDate(value, days, 'date')}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'hour' && (
              <Wheel
                value={hours.indexOf(
                  String(getDate(currentDate).hour()).padStart(2, '0')
                )}
                key={hours.length}
                items={hours}
                setValue={(value) => handleChangeDate(value, hours, 'hour')}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'minute' && (
              <Wheel
                value={minutes.indexOf(
                  String(getDate(currentDate).minute()).padStart(2, '0')
                )}
                key={minutes.length}
                items={minutes}
                setValue={(value) => handleChangeDate(value, minutes, 'minute')}
                indicatorStyle={createIndicatorStyle(index)}
              />
            )}
            {item === 'second' && (
              <Wheel
                value={seconds.indexOf(
                  String(getDate(currentDate).second()).padStart(2, '0')
                )}
                key={seconds.length}
                items={seconds}
                setValue={(value) => handleChangeDate(value, seconds, 'second')}
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
  },
  wheelContainer: {
    flex: 1,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: CALENDAR_HEIGHT / 2,
  },
});

export default DatePicker;
