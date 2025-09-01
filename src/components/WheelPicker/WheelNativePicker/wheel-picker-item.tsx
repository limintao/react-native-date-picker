import React, { memo, useMemo } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useCalendarContext } from '../../../CalendarContext';
import { PickerOption } from '../../../types';

interface ItemProps {
  option: PickerOption | null;
  height: number;
  index: number;
  currentScrollIndex: Animated.AnimatedAddition<number>;
  visibleRest: number;
  rotationFunction: (x: number) => number;
  opacityFunction: (x: number) => number;
  scaleFunction: (x: number) => number;
}

const WheelPickerItem: React.FC<ItemProps> = ({
  height,
  option,
  index,
  visibleRest,
  currentScrollIndex,
  opacityFunction,
  rotationFunction,
  scaleFunction,
}) => {
  const { theme } = useCalendarContext();
  const relativeScrollIndex = useMemo(
    () => Animated.subtract(index, currentScrollIndex),
    [index, currentScrollIndex]
  );

  const interpolInputRange = useMemo(() => {
    const range = [0];
    for (let i = 1; i <= visibleRest + 1; i++) {
      range.unshift(-i);
      range.push(i);
    }
    return range;
  }, [visibleRest]);

  const translateYOutputRange = useMemo(() => {
    const range = [0];
    for (let i = 1; i <= visibleRest + 1; i++) {
      let y = (height / 2) * (1 - Math.sin(Math.PI / 2 - rotationFunction(i)));
      for (let j = 1; j < i; j++) {
        y += height * (1 - Math.sin(Math.PI / 2 - rotationFunction(j)));
      }
      range.unshift(y);
      range.push(-y);
    }
    return range;
  }, [height, visibleRest, rotationFunction]);

  const opacityOutputRange = useMemo(() => {
    const range = [1];
    for (let x = 1; x <= visibleRest + 1; x++) {
      const val = opacityFunction(x);
      range.unshift(val);
      range.push(val);
    }
    return range;
  }, [visibleRest, opacityFunction]);

  const scaleOutputRange = useMemo(() => {
    const range = [1];
    for (let x = 1; x <= visibleRest + 1; x++) {
      const val = scaleFunction(x);
      range.unshift(val);
      range.push(val);
    }
    return range;
  }, [visibleRest, scaleFunction]);

  const rotateXOutputRange = useMemo(() => {
    const range = ['0deg'];
    for (let x = 1; x <= visibleRest + 1; x++) {
      const deg = `${rotationFunction(x)}deg`;
      range.unshift(deg);
      range.push(deg);
    }
    return range;
  }, [visibleRest, rotationFunction]);

  const translateY = relativeScrollIndex.interpolate({
    inputRange: interpolInputRange,
    outputRange: translateYOutputRange,
  });

  const opacity = relativeScrollIndex.interpolate({
    inputRange: interpolInputRange,
    outputRange: opacityOutputRange,
  });

  const scale = relativeScrollIndex.interpolate({
    inputRange: interpolInputRange,
    outputRange: scaleOutputRange,
  });

  const rotateX = relativeScrollIndex.interpolate({
    inputRange: interpolInputRange,
    outputRange: rotateXOutputRange,
  });

  return (
    <Animated.View
      style={[
        styles.option,
        {
          height,
          opacity,
          transform: [{ translateY }, { rotateX }, { scale }],
        },
        theme.wheelPickerItemStyle,
      ]}
    >
      <Text style={theme.wheelPickerTextStyle}>{option?.text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    zIndex: 100,
  },
});

export default memo(WheelPickerItem);
