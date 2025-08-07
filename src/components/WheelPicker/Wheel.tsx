import React, { memo } from 'react';
import { Platform, type ViewStyle } from 'react-native';
import WheelNative from './WheelNative';
import WheelWeb from './WheelWeb';
import { PickerOption } from '../../types';

interface WheelProps {
  value: number;
  setValue?: (value: number) => void;
  items: Array<PickerOption>;
  indicatorStyle?: ViewStyle;
}

const Wheel: React.FC<WheelProps> = (props) => {
  const Component = Platform.OS === 'web' ? WheelWeb : WheelNative;
  return <Component {...props} />;
};

export default memo(Wheel);
