import React, { memo } from 'react';
import WheelPicker from './WheelNativePicker';
import { PickerOption } from '../../types';

interface WheelProps {
  value: number | string;
  setValue?: (value: any) => void;
  items: PickerOption[];
}

const WheelNative: React.FC<WheelProps> = ({
  value,
  setValue = () => {},
  items,
}) => {
  return (
    <WheelPicker
      value={value}
      options={items}
      onChange={setValue}
      itemHeight={44}
      decelerationRate="fast"
    />
  );
};

export default memo(WheelNative);
