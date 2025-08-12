import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import dayjs from 'dayjs';
import { useCalendarContext } from '../CalendarContext';
import type { HeaderProps } from '../types';
import { getDateYear, getYearRange, YEAR_PAGE_SIZE } from '../utils';

const Header: React.FC<HeaderProps> = ({ buttonPrevIcon, buttonNextIcon }) => {
  const {
    mode,
    date,
    currentDate,
    currentYear,
    onChangeMonth,
    onChangeYear,
    calendarView,
    setCalendarView,
    theme,
    locale,
    timePicker,
  } = useCalendarContext();

  const currentMonthText = dayjs(currentDate).locale(locale).format('MMMM');

  const renderPrevButton = (
    <Pressable
      disabled={calendarView === 'time'}
      onPress={() =>
        calendarView === 'day'
          ? onChangeMonth(-1)
          : calendarView === 'month'
          ? onChangeYear(currentYear - 1)
          : calendarView === 'year' &&
            onChangeYear(currentYear - YEAR_PAGE_SIZE)
      }
      accessibilityRole="button"
      accessibilityLabel="Prev"
    >
      <View
        style={[styles.iconContainer, styles.prev, theme?.headerButtonStyle]}
      >
        {buttonPrevIcon || (
          <Image
            source={{
              uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAiCAYAAABStIn6AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAD3SURBVHgBzdY7DoJAEAbgkUdJSSJ0lnZewc5byI08glra6Q08gregVBMS7NZZYwjKPmZmKfibWZovsGFmF2AqyfN8pesMAlKW5V4pVeHyEoEwPQSw3kVv1Ecwt7Zt12zIhDwwLMiG6Acy5ELIkA8hQRTEC1ERJ8RBrBAXMUISZABJkR8oBOmgUEQnKopiF4p8IESeMELipmmuWZYtcK0n3TxN002SJKcXhgN1m42feMCy/T7KNnsMbPBDSjFji0gwa9NyMecY4WDewUbFSKOWgpGHvw9jHUcujH1A2jDRkW3CYhAEG/381+hL8W2krusKy1Gv9W3kDcFNM0FmBbDoAAAAAElFTkSuQmCC',
            }}
            resizeMode="contain"
            style={{
              width: theme?.headerButtonSize || 18,
              height: theme?.headerButtonSize || 18,
              tintColor: theme?.headerButtonColor,
            }}
          />
        )}
      </View>
    </Pressable>
  );

  const renderNextButton = (
    <Pressable
      disabled={calendarView === 'time'}
      onPress={() =>
        calendarView === 'day'
          ? onChangeMonth(1)
          : calendarView === 'month'
          ? onChangeYear(currentYear + 1)
          : calendarView === 'year' &&
            onChangeYear(currentYear + YEAR_PAGE_SIZE)
      }
      accessibilityRole="button"
      accessibilityLabel="Next"
    >
      <View
        style={[styles.iconContainer, styles.next, theme?.headerButtonStyle]}
      >
        {buttonNextIcon || (
          <Image
            source={{
              uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAYCAYAAAAh8HdUAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACESURBVHgB7dQhDoUwDAbglT0xMfHklhmu8G7wOAlwMo7CUZicRCyZLH8FmuIQ/EnTin5iWVIbQvh7702tdTfKdES0SgH3asTMM3p/FxosTzFGRm0vfCQkLcTnLxhza+3XaZC1ls/ZOfe9BCml8da7XvAMgJAA9IxbMZRSsgZ9ZFmQFkgOQ1ZeTkHFbCQAAAAASUVORK5CYII=',
            }}
            resizeMode="contain"
            style={{
              width: theme?.headerButtonSize || 18,
              height: theme?.headerButtonSize || 18,
              tintColor: theme?.headerButtonColor,
            }}
          />
        )}
      </View>
    </Pressable>
  );

  const yearSelector = useCallback(() => {
    const years = getYearRange(currentYear);
    return (
      <Pressable
        onPress={() => {
          setCalendarView(calendarView === 'year' ? 'day' : 'year');
          onChangeYear(getDateYear(currentDate));
        }}
        accessibilityRole="button"
        accessibilityLabel={dayjs(currentDate).format('YYYY')}
      >
        <View style={[styles.textContainer, theme?.headerTextContainerStyle]}>
          <Text style={[styles.text, theme?.headerTextStyle]}>
            {calendarView === 'year'
              ? `${years[0]} - ${years[years.length - 1]}`
              : dayjs(currentDate).format('YYYY')}
          </Text>
        </View>
      </Pressable>
    );
  }, [
    calendarView,
    currentDate,
    currentYear,
    setCalendarView,
    onChangeYear,
    theme,
  ]);

  const monthSelector = (
    <Pressable
      onPress={() =>
        setCalendarView(calendarView === 'month' ? 'day' : 'month')
      }
      accessibilityRole="button"
      accessibilityLabel={currentMonthText}
    >
      <View style={[styles.textContainer, theme?.headerTextContainerStyle]}>
        <Text style={[styles.text, theme?.headerTextStyle]}>
          {currentMonthText}
        </Text>
      </View>
    </Pressable>
  );

  const renderSelectors = (
    <>
      <View style={styles.selectorContainer}>
        {calendarView !== 'year' ? monthSelector : null}
        {yearSelector()}
      </View>
      {timePicker && mode === 'single' && calendarView !== 'year' ? (
        <Pressable
          onPress={() =>
            setCalendarView(calendarView === 'time' ? 'day' : 'time')
          }
          accessibilityRole="button"
          accessibilityLabel={dayjs(date).format('HH:mm:ss')}
        >
          <View style={[styles.textContainer, theme?.headerTextContainerStyle]}>
            <Text style={[styles.text, theme?.headerTextStyle]}>
              {dayjs(date).format('HH:mm:ss')}
            </Text>
          </View>
        </Pressable>
      ) : null}
    </>
  );

  return (
    <View
      style={[styles.headerContainer, theme?.headerContainerStyle]}
      accessibilityRole="header"
    >
      {theme?.headerButtonsPosition === 'left' ? (
        <View style={styles.container}>
          <View style={styles.row}>
            {renderPrevButton}
            {renderNextButton}
          </View>
          {renderSelectors}
        </View>
      ) : theme?.headerButtonsPosition === 'right' ? (
        <View style={styles.container}>
          {renderSelectors}
          <View style={styles.row}>
            {renderPrevButton}
            {renderNextButton}
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          {renderPrevButton}
          {renderSelectors}
          {renderNextButton}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 5,
  },
  container: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginHorizontal: 1,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  iconContainer: {
    padding: 4,
  },
  prev: {
    marginRight: 3,
  },
  next: {
    marginLeft: 3,
  },
  row: {
    flexDirection: 'row',
  },
});

export default Header;
