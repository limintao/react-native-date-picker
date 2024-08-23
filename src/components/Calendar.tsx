import React, { ReactNode, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useCalendarContext } from '../CalendarContext';
import type { CalendarViews } from '../enums';
import type { HeaderProps, CalendarThemeProps } from '../types';
import Header from './Header';
import YearSelector from './YearSelector';
import MonthSelector from './MonthSelector';
import DaySelector from './DaySelector';
import TimeSelector from './TimeSelector';
import DatePicker from './DatePicker';
import { CALENDAR_HEIGHT } from '../enums';

const CalendarView: Record<CalendarViews, ReactNode> = {
  year: <YearSelector />,
  month: <MonthSelector />,
  day: <DaySelector />,
  time: <TimeSelector />,
};

interface PropTypes extends HeaderProps {
  height?: number;
  containerStyle?: CalendarThemeProps['containerStyle'];
}

const Calendar = ({
  buttonPrevIcon,
  buttonNextIcon,
  height,
  containerStyle,
}: PropTypes) => {
  const { calendarView, mode } = useCalendarContext();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    calendarContainer: {
      height: height || CALENDAR_HEIGHT,
      alignItems: 'center',
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {mode !== 'wheel' && (
        <Header
          buttonPrevIcon={buttonPrevIcon}
          buttonNextIcon={buttonNextIcon}
        />
      )}
      <View style={styles.calendarContainer}>
        {mode === 'wheel' ? <DatePicker /> : CalendarView[calendarView]}
      </View>
    </View>
  );
};

export default memo(Calendar);
