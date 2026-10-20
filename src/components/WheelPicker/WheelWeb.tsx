import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { ViewProps } from 'react-native';
import type { PickerOption } from '../../types';
import { useCalendarContext } from '../../CalendarContext';

interface WheelProps {
  value: number | string;
  onChange?: (value: number | string) => void;
  items: PickerOption[];
}
const ITEM_HEIGHT = 44;
const STEP = 36;
const REST = 2;
const RADIUS = 86;
const modulo = (n: number, length: number) => ((n % length) + length) % length;
const noop = () => {};
const browserStyle = {
  userSelect: 'none',
  touchAction: 'none',
  cursor: 'grab',
} as unknown as import('react-native').ViewStyle;
type WheelEventLike = { deltaY: number; preventDefault: () => void };

const WheelWeb: React.FC<WheelProps> = ({ value, onChange = noop, items }) => {
  const { theme } = useCalendarContext();
  const selected = Math.max(
    0,
    items.findIndex((item) => item.value === value)
  );
  const [position, setPosition] = useState(selected);
  const pos = useRef(selected);
  const base = useRef(selected);
  const active = useRef(false);
  const lastEmitted = useRef<number | string | undefined>(undefined);
  const circular = items.length >= 5;
  const key = JSON.stringify(
    items.map((item) => [typeof item.value, item.value])
  );
  const previousKey = useRef(key);
  const latest = useRef({ items, value, onChange, circular });
  latest.current = { items, value, onChange, circular };
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearWheelTimer = () => {
    if (wheelTimer.current !== null) clearTimeout(wheelTimer.current);
    wheelTimer.current = null;
  };
  const update = (next: number) => {
    const current = latest.current;
    pos.current = current.circular
      ? next
      : Math.max(0, Math.min(current.items.length - 1, next));
    setPosition(pos.current);
  };
  const finish = () => {
    const current = latest.current;
    if (!current.items.length) return;
    const rounded = Math.round(pos.current);
    const index = current.circular
      ? modulo(rounded, current.items.length)
      : Math.max(0, Math.min(current.items.length - 1, rounded));
    // Rebase numeric coordinates; displayed labels and transforms remain identical.
    update(index);
    const option = current.items[index];
    if (
      option &&
      option.value !== current.value &&
      option.value !== lastEmitted.current
    ) {
      lastEmitted.current = option.value;
      current.onChange(option.value);
    }
  };
  const handlers = useRef({ update, finish, clearWheelTimer });
  handlers.current = { update, finish, clearWheelTimer };

  useLayoutEffect(() => {
    const changed = previousKey.current !== key;
    previousKey.current = key;
    if (!changed && value === lastEmitted.current) {
      lastEmitted.current = undefined;
      return;
    }
    handlers.current.clearWheelTimer();
    active.current = false;
    lastEmitted.current = undefined;
    handlers.current.update(selected);
  }, [value, selected, key]);
  useLayoutEffect(() => () => handlers.current.clearWheelTimer(), []);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          latest.current.items.length > 1 &&
          Math.abs(gesture.dy) > 3 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          handlers.current.clearWheelTimer();
          base.current = pos.current;
          active.current = true;
          lastEmitted.current = undefined;
        },
        onPanResponderMove: (_, gesture) => {
          if (active.current)
            handlers.current.update(base.current - gesture.dy / STEP);
        },
        onPanResponderRelease: (_, gesture) => {
          if (!active.current) return;
          handlers.current.update(base.current - gesture.dy / STEP);
          active.current = false;
          handlers.current.finish();
        },
        onPanResponderTerminate: () => {
          if (!active.current) return;
          active.current = false;
          handlers.current.finish();
        },
      }),
    []
  );

  const wheelProps = {
    onWheel: (event: WheelEventLike) => {
      if (latest.current.items.length < 2 || active.current) return;
      event.preventDefault();
      handlers.current.clearWheelTimer();
      handlers.current.update(pos.current + event.deltaY / STEP);
      wheelTimer.current = setTimeout(() => {
        wheelTimer.current = null;
        handlers.current.finish();
      }, 120);
    },
  } as ViewProps & { onWheel: (event: WheelEventLike) => void };
  const center = Math.round(position);
  const slots = items.length
    ? Array.from(
        { length: (REST + 1) * 2 + 1 },
        (_, i) => center + i - REST - 1
      )
    : [];
  return (
    <View
      {...wheelProps}
      {...responder.panHandlers}
      style={[styles.container, browserStyle, theme.wheelPickerContainerStyle]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.indicator,
          theme.wheelPickerSelectedIndicatorStyle,
          {
            height: ITEM_HEIGHT,
            top: '50%',
            transform: [{ translateY: -ITEM_HEIGHT / 2 }],
          },
        ]}
      />
      {slots.map((virtualIndex) => {
        if (!circular && (virtualIndex < 0 || virtualIndex >= items.length))
          return null;
        const index = circular
          ? modulo(virtualIndex, items.length)
          : virtualIndex;
        const angle = Math.max(
          -Math.PI / 2,
          Math.min(
            Math.PI / 2,
            ((virtualIndex - position) * Math.PI) / (2 * (REST + 1))
          )
        );
        const opacity = Math.max(0, Math.cos(angle)) ** 2;
        return (
          <View
            pointerEvents="none"
            key={`slot:${virtualIndex}`}
            style={[
              styles.item,
              theme.wheelPickerItemStyle,
              {
                height: ITEM_HEIGHT,
                opacity,
                transform: [
                  { perspective: 1000 },
                  { translateY: RADIUS * Math.sin(angle) },
                  { rotateX: `${(-angle * 180) / Math.PI}deg` },
                ],
              },
            ]}
          >
            <Text numberOfLines={1} style={theme.wheelPickerTextStyle}>
              {items[index]?.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    minWidth: 30,
    height: 220,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: { position: 'absolute', width: '100%' },
  item: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});
export default memo(WheelWeb);
