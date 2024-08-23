import React, { useCallback } from 'react';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useCalendarContext } from '../CalendarContext';
import { getDateYear, getYearRange } from '../utils';

const YearSelector = () => {
  const { currentDate, currentYear, date, onSelectYear, theme } =
    useCalendarContext();
  const selectedYear = getDateYear(date);

  const generateCells = useCallback(() => {
    const years = getYearRange(currentYear);
    const activeYear = getDateYear(currentDate);
    const column = years.map((year) => {
      const activeItemStyle: ViewStyle =
        year === selectedYear
          ? {
              borderColor: theme?.selectedItemColor || '#0047FF',
              backgroundColor: theme?.selectedItemColor || '#0047FF',
            }
          : year === activeYear
          ? {
              borderColor: theme?.selectedItemColor || '#0047FF',
            }
          : {};

      const textStyle: TextStyle =
        year === selectedYear
          ? { color: '#fff', ...theme?.selectedTextStyle }
          : year === activeYear
          ? {
              color: theme?.selectedItemColor || '#0047FF',
              fontWeight: 'bold',
            }
          : { ...theme?.calendarTextStyle };

      return (
        <Pressable
          key={year}
          onPress={() => onSelectYear(year)}
          style={styles.yearCell}
          accessibilityRole="button"
          accessibilityLabel={year.toString()}
        >
          <View
            style={[styles.year, theme?.yearContainerStyle, activeItemStyle]}
          >
            <Text key={year} style={textStyle}>
              {year}
            </Text>
          </View>
        </Pressable>
      );
    });
    return column;
  }, [onSelectYear, selectedYear, currentYear, currentDate, theme]);

  return (
    <View style={styles.container}>
      <View style={styles.years}>{generateCells()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    width: '100%',
  },
  yearCell: {
    width: '33.3%',
  },
  years: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  year: {
    paddingVertical: 15,
    margin: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
});

export default YearSelector;
