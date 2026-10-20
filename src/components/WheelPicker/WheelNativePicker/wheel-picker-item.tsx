import { memo, useMemo } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { useCalendarContext } from '../../../CalendarContext';
import type { PickerOption } from '../../../types';

interface ItemProps {
  option: PickerOption | null;
  height: number;
  index: number;
  currentScrollIndex: Animated.AnimatedDivision<number>;
  visibleRest: number;
  rotationFunction: (distance: number) => number;
  opacityFunction: (distance: number) => number;
  scaleFunction: (distance: number) => number;
}
const finite = (n: number, fallback: number) =>
  Number.isFinite(n) ? n : fallback;
const WheelPickerItem: React.FC<ItemProps> = ({
  option,
  height,
  index,
  currentScrollIndex,
  visibleRest,
  rotationFunction,
  opacityFunction,
  scaleFunction,
}) => {
  const { theme } = useCalendarContext();
  const relative = useMemo(
    () => Animated.subtract(index, currentScrollIndex),
    [index, currentScrollIndex]
  );
  const animatedStyle = useMemo(() => {
    const limit = visibleRest + 1;
    const input = Array.from({ length: limit * 2 + 1 }, (_, i) => i - limit);
    const angles = Array.from({ length: limit + 1 }, (_, i) =>
      i === 0
        ? 0
        : Math.max(
            0,
            Math.min(Math.PI / 2 - 0.01, finite(rotationFunction(i), 0))
          )
    );
    const translations = angles.map((angle, i) => {
      let compression = (height / 2) * (1 - Math.cos(angle));
      for (let j = 1; j < i; j++)
        compression += height * (1 - Math.cos(angles[j]!));
      return compression;
    });
    const interpolate = (outputRange: number[]) =>
      relative.interpolate({
        inputRange: input,
        outputRange,
        extrapolate: 'clamp',
      });
    const translateY = interpolate(
      input.map((x) => -Math.sign(x) * translations[Math.abs(x)]!)
    );
    const opacity = interpolate(
      input.map((x) =>
        Math.abs(x) === limit
          ? 0
          : x === 0
            ? 1
            : Math.max(0, Math.min(1, finite(opacityFunction(Math.abs(x)), 0)))
      )
    );
    const scale = interpolate(
      input.map((x) =>
        x === 0 ? 1 : Math.max(0.01, finite(scaleFunction(Math.abs(x)), 1))
      )
    );
    const rotateX = relative.interpolate({
      inputRange: input,
      outputRange: input.map(
        (x) => `${(-Math.sign(x) * angles[Math.abs(x)]! * 180) / Math.PI}deg`
      ),
      extrapolate: 'clamp',
    });
    return {
      opacity,
      transform: [
        { perspective: 1000 },
        { translateY },
        { rotateX },
        { scale },
      ],
    };
  }, [
    height,
    visibleRest,
    relative,
    rotationFunction,
    opacityFunction,
    scaleFunction,
  ]);
  return (
    <View style={{ height, flexShrink: 0 }}>
      <Animated.View
        style={[
          styles.option,
          theme.wheelPickerItemStyle,
          {
            height,
            minHeight: height,
            maxHeight: height,
            marginVertical: 0,
            flexShrink: 0,
          },
          animatedStyle,
        ]}
      >
        <Text numberOfLines={1} style={theme.wheelPickerTextStyle}>
          {option?.text}
        </Text>
      </Animated.View>
    </View>
  );
};
const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
});
export default memo(WheelPickerItem);
