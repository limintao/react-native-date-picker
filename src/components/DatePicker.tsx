import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useCalendarContext } from '../CalendarContext';
import { CONTAINER_HEIGHT } from '../enums';
import WheelSelector from './WheelSelector';
import { CalendarThemeProps } from '../types';

interface DatePickerProps {
  height?: number;
  containerStyle?: CalendarThemeProps['containerStyle'];
}

const DatePicker: React.FC<DatePickerProps> = ({ height, containerStyle }) => {
  const { columns } = useCalendarContext();

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.datePickerContainer,
          { height: height || CONTAINER_HEIGHT },
        ]}
      >
        {columns?.map((item) => (
          <WheelSelector key={item} type={item} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  datePickerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: CONTAINER_HEIGHT,
  },
});

export default DatePicker;
