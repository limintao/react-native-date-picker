import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewProps,
} from 'react-native';
import WheelPickerItem from './wheel-picker-item';
import type { PickerOption } from '../../../types';
import { useCalendarContext } from '../../../CalendarContext';

interface Props {
  value: number | string;
  options: PickerOption[];
  onChange: (value: number | string) => void;
  itemHeight?: number;
  containerProps?: Omit<ViewProps, 'style'>;
  scaleFunction?: (distance: number) => number;
  /** Angle in radians. */
  rotationFunction?: (distance: number) => number;
  opacityFunction?: (distance: number) => number;
  visibleRest?: number;
  decelerationRate?: 'normal' | 'fast' | number;
}
const defaultScale = () => 1;
const defaultRotation = (x: number) => 1 - 2 ** -x;
const defaultOpacity = (x: number) => 3 ** -x;
type Phase = 'idle' | 'dragging' | 'released' | 'momentum';
type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;
const QUIET_MS = 160;

const WheelPicker: React.FC<Props> = ({
  value,
  options,
  onChange,
  itemHeight = 40,
  visibleRest = 2,
  scaleFunction = defaultScale,
  rotationFunction = defaultRotation,
  opacityFunction = defaultOpacity,
  decelerationRate = 'normal',
  containerProps = {},
}) => {
  if (
    !Number.isFinite(itemHeight) ||
    itemHeight <= 0 ||
    !Number.isInteger(visibleRest) ||
    visibleRest < 0
  ) {
    throw new Error(
      'WheelPicker requires itemHeight > 0 and an integer visibleRest >= 0'
    );
  }
  const { theme } = useCalendarContext();
  const selectedIndex = Math.max(
    0,
    options.findIndex((item) => item.value === value)
  );
  const list = useRef<ScrollView>(null);
  const initialOffset = useRef({ x: 0, y: selectedIndex * itemHeight }).current;
  const scrollY = useRef(new Animated.Value(initialOffset.y)).current;
  const offset = useRef(initialOffset.y);
  const phase = useRef<Phase>('idle');
  const epoch = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNotified = useRef<number | string | undefined>(undefined);
  const latest = useRef({ options, value, onChange, itemHeight });
  latest.current = { options, value, onChange, itemHeight };
  const valuesKey = JSON.stringify(
    options.map((item) => [typeof item.value, item.value])
  );
  const previous = useRef({ valuesKey, itemHeight, visibleRest, value });

  const clearTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const moveTo = useCallback(
    (y: number) => {
      offset.current = y;
      list.current?.scrollTo({ y, animated: false });
      scrollY.setValue(y);
    },
    [scrollY]
  );
  const settle = useCallback(() => {
    if (phase.current === 'idle' || phase.current === 'dragging') return;
    clearTimer();
    phase.current = 'idle';
    const current = latest.current;
    if (!current.options.length) return;
    const index = Math.max(
      0,
      Math.min(
        current.options.length - 1,
        Math.round(offset.current / current.itemHeight)
      )
    );
    const target = index * current.itemHeight;
    if (Math.abs(offset.current - target) > 0.1) moveTo(target);
    const next = current.options[index];
    if (
      next &&
      next.value !== current.value &&
      next.value !== lastNotified.current
    ) {
      lastNotified.current = next.value;
      current.onChange(next.value);
    }
  }, [clearTimer, moveTo]);
  const scheduleSettle = useCallback(() => {
    clearTimer();
    const token = epoch.current;
    timer.current = setTimeout(() => {
      timer.current = null;
      if (token === epoch.current) settle();
    }, QUIET_MS);
  }, [clearTimer, settle]);

  useLayoutEffect(() => {
    const old = previous.current;
    const geometryChanged =
      old.valuesKey !== valuesKey ||
      old.itemHeight !== itemHeight ||
      old.visibleRest !== visibleRest;
    previous.current = { valuesKey, itemHeight, visibleRest, value };
    // An acknowledgement of our own change must not interrupt the next gesture.
    if (!geometryChanged && value === lastNotified.current) {
      lastNotified.current = undefined;
      return;
    }
    clearTimer();
    epoch.current += 1;
    phase.current = 'idle';
    lastNotified.current = undefined;
    moveTo(selectedIndex * itemHeight);
  }, [
    value,
    selectedIndex,
    valuesKey,
    itemHeight,
    visibleRest,
    clearTimer,
    moveTo,
  ]);

  useEffect(
    () => () => {
      epoch.current += 1;
      clearTimer();
    },
    [clearTimer]
  );

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: Platform.OS !== 'web',
        listener: (event: ScrollEvent) => {
          offset.current = event.nativeEvent.contentOffset.y;
          if (phase.current === 'released' || phase.current === 'momentum')
            scheduleSettle();
        },
      }),
    [scrollY, scheduleSettle]
  );
  const currentScrollIndex = useMemo(
    () => Animated.divide(scrollY, itemHeight),
    [scrollY, itemHeight]
  );
  const containerHeight = (visibleRest * 2 + 1) * itemHeight;

  return (
    <View
      {...containerProps}
      style={[
        styles.container,
        theme.wheelPickerContainerStyle,
        { height: containerHeight },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.indicator,
          theme.wheelPickerSelectedIndicatorStyle,
          { height: itemHeight, top: visibleRest * itemHeight },
        ]}
      />
      <Animated.ScrollView
        ref={list}
        style={styles.scroll}
        contentContainerStyle={{ paddingVertical: visibleRest * itemHeight }}
        contentOffset={initialOffset}
        scrollEnabled={options.length > 1}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        removeClippedSubviews={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate={decelerationRate}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={() => {
          if (phase.current === 'idle') moveTo(offset.current);
        }}
        onContentSizeChange={() => {
          if (phase.current === 'idle') moveTo(offset.current);
        }}
        onScrollBeginDrag={() => {
          clearTimer();
          epoch.current += 1;
          phase.current = 'dragging';
          lastNotified.current = undefined;
        }}
        onScrollEndDrag={(event) => {
          if (phase.current !== 'dragging') return;
          offset.current = event.nativeEvent.contentOffset.y;
          phase.current = 'released';
          scheduleSettle();
        }}
        onMomentumScrollBegin={() => {
          if (phase.current !== 'released') return;
          clearTimer();
          phase.current = 'momentum';
          scheduleSettle();
        }}
        onMomentumScrollEnd={(event) => {
          if (phase.current !== 'released' && phase.current !== 'momentum')
            return;
          offset.current = event.nativeEvent.contentOffset.y;
          settle();
        }}
      >
        {options.map((option, index) => (
          <WheelPickerItem
            key={`${typeof option.value}:${String(option.value)}`}
            option={option}
            index={index}
            height={itemHeight}
            visibleRest={visibleRest}
            currentScrollIndex={currentScrollIndex}
            scaleFunction={scaleFunction}
            rotationFunction={rotationFunction}
            opacityFunction={opacityFunction}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden' },
  scroll: { flex: 1 },
  indicator: { position: 'absolute', width: '100%' },
});
export default memo(WheelPicker);
