import { useCallback } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useCalendarContext } from '../CalendarContext';
import Wheel from './WheelPicker/Wheel';
import { CALENDAR_HEIGHT } from '../enums';
import { getParsedDate, getDate, getFormatted } from '../utils';

function createNumberList(num: number) {
  return new Array(num)
    .fill(0)
    .map((_, index) =>
      index < 10 ? `0${index.toString()}` : index.toString()
    );
}

const hours = createNumberList(24);
const minutes = createNumberList(60);
const seconds = createNumberList(60);

const TimeSelector = () => {
  const { date, onSelectDate, theme } = useCalendarContext();
  const { hour, minute, second } = getParsedDate(date);

  const handleChange = useCallback(
    (value: number, type: 'hour' | 'minute' | 'second') => {
      const newDate = getDate(date)[type](value);
      onSelectDate(getFormatted(newDate));
    },
    [date, onSelectDate]
  );

  return (
    <View style={styles.container}>
      <View style={styles.timePickerContainer}>
        <View style={styles.wheelContainer}>
          <Wheel
            value={hour}
            items={hours}
            setValue={(value) => handleChange(value, 'hour')}
          />
        </View>
        <Text
          style={{
            ...styles.timePickerText,
            ...theme?.wheelPickerTextStyle,
          }}
        >
          :
        </Text>
        <View style={styles.wheelContainer}>
          <Wheel
            value={minute}
            items={minutes}
            setValue={(value) => handleChange(value, 'minute')}
          />
        </View>
        <Text
          style={{
            ...styles.timePickerText,
            ...theme?.wheelPickerTextStyle,
          }}
        >
          :
        </Text>
        <View style={styles.wheelContainer}>
          <Wheel
            value={second}
            items={seconds}
            setValue={(value) => handleChange(value, 'second')}
          />
        </View>
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
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: CALENDAR_HEIGHT / 2,
    height: CALENDAR_HEIGHT / 2,
  },
  timePickerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
});

export default TimeSelector;
