import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CalendarThemeProps, IDayObject } from '../types';
import { CONTAINER_HEIGHT } from '../enums';
import { addColorAlpha, isEqual } from '../utils';

export const daySize = 46;

interface Props extends Omit<IDayObject, 'day'> {
  isToday: boolean;
  isSelected: boolean;
  onSelectDate: (date: string) => void;
  theme: CalendarThemeProps;
  height?: number;
}

function EmptyDayPure({ height }: { height?: number }) {
  const style = styles(height || CONTAINER_HEIGHT);
  return <View style={style.dayCell} />;
}

export const EmptyDay = memo(EmptyDayPure);

const Day: React.FC<Props> = ({
  date,
  text,
  disabled,
  isCurrentMonth,
  isToday,
  isSelected,
  inRange,
  leftCrop,
  rightCrop,
  onSelectDate,
  theme,
  height,
}) => {
  const onPress = useCallback(() => {
    onSelectDate(date);
  }, [onSelectDate, date]);

  const {
    calendarTextStyle,
    dayContainerStyle,
    selectedItemColor,
    selectedTextStyle,
    todayContainerStyle,
    todayTextStyle,
    selectedRangeBackgroundColor,
  } = theme;

  //const bothWays = inRange && leftCrop && rightCrop;
  const isCrop = inRange && (leftCrop || rightCrop) && !(leftCrop && rightCrop);

  const containerStyle = isCurrentMonth ? dayContainerStyle : { opacity: 0.3 };

  const todayItemStyle = isToday
    ? {
        borderWidth: 2,
        borderColor: selectedItemColor,
        ...todayContainerStyle,
      }
    : null;

  const activeItemStyle = isSelected
    ? {
        borderColor: selectedItemColor,
        backgroundColor: selectedItemColor,
      }
    : null;

  const textStyle = isSelected
    ? { color: '#fff', ...selectedTextStyle }
    : isToday
    ? {
        ...calendarTextStyle,
        color: selectedItemColor,
        ...todayTextStyle,
      }
    : calendarTextStyle;

  const rangeRootBackground =
    selectedRangeBackgroundColor ?? addColorAlpha(selectedItemColor!, 0.15);

  const style = styles(height || CONTAINER_HEIGHT);

  return (
    <View style={style.dayCell}>
      {inRange && !isCrop ? (
        <View
          style={[style.rangeRoot, { backgroundColor: rangeRootBackground }]}
        />
      ) : null}

      {isCrop && leftCrop ? (
        <View
          style={[
            style.rangeRoot,
            {
              left: '50%',
              backgroundColor: rangeRootBackground,
            },
          ]}
        />
      ) : null}

      {isCrop && rightCrop ? (
        <View
          style={[
            style.rangeRoot,
            {
              right: '50%',
              backgroundColor: rangeRootBackground,
            },
          ]}
        />
      ) : null}

      <Pressable
        disabled={disabled}
        onPress={disabled ? undefined : onPress}
        style={[
          style.dayContainer,
          containerStyle,
          todayItemStyle,
          activeItemStyle,
          disabled && style.disabledDay,
        ]}
        accessibilityRole="button"
        accessibilityLabel={text}
      >
        <View style={[style.dayTextContainer]}>
          <Text style={[textStyle]}>{text}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = (height: number) =>
  StyleSheet.create({
    dayCell: {
      position: 'relative',
      flexBasis: '14.285714%',
      flexGrow: 0,
      flexShrink: 0,
      height: height / 7,
    },
    dayContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 1.5,
      borderRadius: 100,
    },
    dayTextContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledDay: {
      opacity: 0.3,
    },
    rangeRoot: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 2,
      bottom: 2,
    },
  });

const customComparator = (
  prevProps: Readonly<Props>,
  nextProps: Readonly<Props>
) => {
  return (
    prevProps.date === nextProps.date &&
    prevProps.text === nextProps.text &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.isCurrentMonth === nextProps.isCurrentMonth &&
    prevProps.isToday === nextProps.isToday &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.inRange === nextProps.inRange &&
    prevProps.leftCrop === nextProps.leftCrop &&
    prevProps.rightCrop === nextProps.rightCrop &&
    prevProps.onSelectDate === nextProps.onSelectDate &&
    prevProps.height === nextProps.height &&
    isEqual(prevProps.theme, nextProps.theme)
  );
};

export default memo(Day, customComparator);
