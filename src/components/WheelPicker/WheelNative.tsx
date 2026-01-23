import { memo } from 'react';
import WheelPicker from './WheelNativePicker';
import { PickerOption } from '../../types';

interface WheelProps {
  value: number | string;
  onChange?: (value: any) => void;
  items: PickerOption[];
}

const WheelNative: React.FC<WheelProps> = ({
  value,
  onChange = () => {},
  items,
}) => {
  return (
    <WheelPicker
      value={value}
      options={items}
      onChange={onChange}
      itemHeight={44}
      decelerationRate="fast"
    />
  );
};

export default memo(WheelNative);
