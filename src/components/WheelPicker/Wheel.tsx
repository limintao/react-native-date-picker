import { Platform, type ViewStyle } from 'react-native';
import WheelNative from './WheelNative';
import WheelWeb from './WheelWeb';

interface WheelProps {
  value: number;
  setValue?: (value: number) => void;
  items: string[];
  indicatorStyle?: ViewStyle;
}

export default function Wheel(props: WheelProps) {
  return Platform.OS === 'web' ? (
    <WheelWeb {...props} />
  ) : (
    <WheelNative {...props} />
  );
}
