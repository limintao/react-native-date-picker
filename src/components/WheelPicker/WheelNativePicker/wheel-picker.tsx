import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import {
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  View,
  ViewProps,
  FlatList,
  Platform,
  StyleSheet,
} from 'react-native';
import WheelPickerItem from './wheel-picker-item';
import { PickerOption } from '../../../types';
import { useCalendarContext } from '../../../CalendarContext';

interface Props {
  value: number | string;
  options: PickerOption[];
  onChange: (index: number | string) => void;
  itemHeight?: number;
  containerProps?: Omit<ViewProps, 'style'>;
  scaleFunction?: (x: number) => number;
  rotationFunction?: (x: number) => number;
  opacityFunction?: (x: number) => number;
  visibleRest?: number;
  decelerationRate?: 'normal' | 'fast' | number;
}

const WheelPicker: React.FC<Props> = ({
  value,
  options,
  onChange,
  itemHeight = 40,
  scaleFunction = (x: number) => 1.0 ** x,
  rotationFunction = (x: number) => 1 - Math.pow(1 / 2, x),
  opacityFunction = (x: number) => Math.pow(1 / 3, x),
  visibleRest = 2,
  decelerationRate = 'normal',
  containerProps = {},
}) => {
  const { theme } = useCalendarContext();
  const selectedIndex = options.findIndex((item) => item.value === value);
  const timerRef = useRef<NodeJS.Timeout>();

  const flatListRef = useRef<FlatList>(null);
  const [scrollY] = useState(new Animated.Value(selectedIndex * itemHeight));

  const containerHeight = (1 + visibleRest * 2) * itemHeight;
  const paddedOptions = useMemo(() => {
    const array: (PickerOption | null)[] = [...options];
    for (let i = 0; i < visibleRest; i++) {
      array.unshift(null);
      array.push(null);
    }
    return array;
  }, [options, visibleRest]);

  const offsets = useMemo(
    () => [...Array(paddedOptions.length)].map((_, i) => i * itemHeight),
    [paddedOptions, itemHeight]
  );

  const currentScrollIndex = useMemo(
    () => Animated.add(Animated.divide(scrollY, itemHeight), visibleRest),
    [visibleRest, scrollY, itemHeight]
  );

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const offsetY = Math.min(
      itemHeight * (options.length - 1),
      Math.max(event.nativeEvent.contentOffset.y, 0)
    );
    let index = Math.floor(offsetY / itemHeight);
    const remainder = offsetY % itemHeight;
    if (remainder > itemHeight / 2) {
      index++;
    }
    const value = options[index]?.value || 0;
    if (index !== selectedIndex) {
      timerRef.current = setTimeout(() => {
        onChange(value);
        clearTimeout(timerRef.current!);
        timerRef.current = undefined;
      }, 100);
    }
  };

  const scrollEvent = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: handleScrollEnd,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (selectedIndex < 0 || selectedIndex >= options.length) {
      throw new Error(
        `Selected index ${selectedIndex} is out of bounds [0, ${
          options.length - 1
        }]`
      );
    }
  }, [selectedIndex, options]);

  /**
   * If selectedIndex is changed from outside (not via onChange) we need to scroll to the specified index.
   * This ensures that what the user sees as selected in the picker always corresponds to the value state.
   */
  useEffect(() => {
    flatListRef.current?.scrollToIndex({
      index: selectedIndex,
      animated: Platform.OS === 'ios',
    });
  }, [selectedIndex, itemHeight]);

  return (
    <View
      style={[
        styles.container,
        { height: containerHeight },
        theme.wheelPickerContainerStyle,
      ]}
      {...containerProps}
    >
      <View
        style={[
          styles.selectedIndicator,
          {
            transform: [{ translateY: -itemHeight / 2 }],
            height: itemHeight,
          },
          theme.wheelPickerSelectedIndicatorStyle,
        ]}
      />
      <Animated.FlatList
        ref={flatListRef}
        nestedScrollEnabled
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollEvent}
        snapToOffsets={offsets}
        decelerationRate={decelerationRate}
        initialScrollIndex={selectedIndex}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        data={paddedOptions}
        keyExtractor={(item, index) =>
          item ? `${item.value}-${item.text}-${index}` : `-${index}`
        }
        renderItem={({ item: option, index }) => (
          <WheelPickerItem
            key={`option-${index}`}
            index={index}
            option={option}
            height={itemHeight}
            currentScrollIndex={currentScrollIndex}
            scaleFunction={scaleFunction}
            rotationFunction={rotationFunction}
            opacityFunction={opacityFunction}
            visibleRest={visibleRest}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    position: 'relative',
  },
  selectedIndicator: {
    position: 'absolute',
    width: '100%',
    top: '50%',
  },
  scrollView: {
    overflow: 'hidden',
    flex: 1,
  },
});

export default memo(WheelPicker);
