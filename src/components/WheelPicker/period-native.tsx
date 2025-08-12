import React, { memo } from 'react';
import WheelPicker from './WheelNativePicker';
import { PickerOption } from 'src/types';

interface PeriodProps {
  value: string;
  setValue?: (value: any) => void;
}

const options: PickerOption[] = [
  { value: 'AM', text: 'AM' },
  { value: 'PM', text: 'PM' },
];

const PeriodNative: React.FC<PeriodProps> = ({
  value,
  setValue = () => {},
}) => {
  return (
    <WheelPicker
      value={value}
      options={options}
      onChange={setValue}
      itemHeight={44}
      decelerationRate="fast"
    />
  );
};

const customComparator = (
  prev: Readonly<PeriodProps>,
  next: Readonly<PeriodProps>
) => {
  const areEqual = prev.value === next.value && prev.setValue === next.setValue;

  return areEqual;
};

export default memo(PeriodNative, customComparator);
