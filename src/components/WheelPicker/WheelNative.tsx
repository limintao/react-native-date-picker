import { StyleSheet, Platform, type ViewStyle } from 'react-native';
import WheelPicker from 'react-native-wheely';
import { useCalendarContext } from '../../CalendarContext';

interface WheelProps {
  value: number;
  setValue?: (value: number) => void;
  items: string[];
  indicatorStyle?: ViewStyle;
}

export default function WheelNative({
  value,
  setValue = () => {},
  items,
  indicatorStyle,
}: WheelProps) {
  const { theme } = useCalendarContext();

  return (
    <WheelPicker
      selectedIndex={value < 0 ? 0 : value}
      options={items}
      onChange={setValue}
      containerStyle={{
        ...styles.container,
        ...theme?.wheelPickerContainerStyle,
      }}
      itemStyle={theme?.wheelPickerItemStyle}
      itemTextStyle={{
        ...styles.wheelPickerText,
        ...theme?.wheelPickerTextStyle,
      }}
      selectedIndicatorStyle={{
        ...styles.wheelSelectedIndicator,
        ...indicatorStyle,
        ...theme?.wheelPickerIndicatorStyle,
      }}
      itemHeight={45}
      decelerationRate={theme?.wheelPickerDecelerationRate}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    ...Platform.select({
      web: {
        userSelect: 'none',
      },
    }),
  },
  wheelSelectedIndicator: {
    borderRadius: 10,
  },
  wheelPickerText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
